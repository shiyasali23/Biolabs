# database_handler.py
import os
import torch
import numpy as np
import pandas as pd
import chromadb
from tqdm import tqdm
from transformers import AutoModel, AutoTokenizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Callable, Optional, List


from log_handler import LogHandler
from responses_handler import ResponseHandler
from modal_handler import ModalHandler
from config import DIRECTORIES, FILE_PREFIXES, DB_CONFIG

log = LogHandler()
response_handler = ResponseHandler()

class DatabaseHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_once()
        return cls._instance

    def _init_once(self):
        self.error = "Error in DatabaseHandler:"
        # Prepare directories
        for key in ["DATABASE_DIR", "VECTORS_DIR", "EMBEDDING_MODEL_DIR", "DATASET_DIR"]:
            os.makedirs(DIRECTORIES[key], exist_ok=True)

        # Configs
        self.top_k = int(DB_CONFIG.get("TOP_K", 5))
        self.embedding_params = DB_CONFIG.get("EMBEDDING_PARAMS", {})
        self.min_threshold = DB_CONFIG.get("MIN_THRESHOLD", 0.6)
        self.base_threshold = DB_CONFIG.get("BASE_THRESHOLD", 0.75)
        self.max_threshold = DB_CONFIG.get("MAX_THRESHOLD", 0.9)
        self.target_column = DB_CONFIG["TARGET_COLUMN"]
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        log.info(f"DatabaseHandler: embeddings on {self.device}")

        # Lazy init slots
        self.embedding_model = None
        self.embedding_tokenizer = None
        self.client = None
        self.collection = None
        self.embeddings = None
        self.modal_handler = ModalHandler()

    def _init_embedding_model(self):
        prefix = FILE_PREFIXES.get("EMBEDDING_MODEL", {})
        path = self.modal_handler.validate_path(
            DIRECTORIES["EMBEDDING_MODEL_DIR"],
            prefix.get("LOCAL_PREFIX"),
            prefix.get("BUCKET_PREFIX")
        )
        if not path:
            log.error(f"{self.error} embedding model not found")
            return
        try:
            self.embedding_model = AutoModel.from_pretrained(path).to(self.device).eval()
            self.embedding_tokenizer = AutoTokenizer.from_pretrained(path)
            log.info("Embedding model ready")
        except Exception as e:
            log.error(f"{self.error} failed loading embedder: {e}")

    def _init_database(self):
        # Initialize ChromaDB and load embeddings
        try:
            self.client = chromadb.PersistentClient(path=DIRECTORIES["DATABASE_DIR"])
            name = os.path.splitext(FILE_PREFIXES["EMBEDDINGS"]["LOCAL_PREFIX"])[0]
            self.collection = self.client.get_or_create_collection(name=name)

            emb_path = self.modal_handler.validate_path(
                DIRECTORIES["VECTORS_DIR"],
                FILE_PREFIXES["EMBEDDINGS"]["LOCAL_PREFIX"],
                FILE_PREFIXES["EMBEDDINGS"]["BUCKET_PREFIX"]
            )
            array = np.load(emb_path)
            self.embeddings = array / np.linalg.norm(array, axis=1, keepdims=True)

            if self.collection.count() == 0:
                data_path = self.modal_handler.validate_path(
                    DIRECTORIES["DATASET_DIR"],
                    FILE_PREFIXES["DATASET"]["LOCAL_PREFIX"],
                    FILE_PREFIXES["DATASET"]["BUCKET_PREFIX"]
                )
                df = pd.read_csv(data_path)
                docs = df[self.target_column].tolist()
                ids = [f"doc_{i}" for i in range(len(self.embeddings))]
                metas = [{"id": i} for i in range(len(self.embeddings))]
                for i in tqdm(range(0, len(self.embeddings), 5000), desc="Indexing embeddings"):
                    j = min(i + 5000, len(self.embeddings))
                    self.collection.add(
                        embeddings=self.embeddings[i:j].tolist(),
                        documents=docs[i:j],
                        ids=ids[i:j],
                        metadatas=metas[i:j]
                    )
                    log.info(f"Indexed {i}-{j}")
        except Exception as e:
            log.error(f"{self.error} database init failed: {e}")

    def _initialize_system(self):
        if not self.embedding_model:
            self._init_embedding_model()
        if not self.collection:
            self._init_database()

    def _get_documents(self, text: str) -> Optional[List[str]]:
        try:
            tokens = self.embedding_tokenizer(text, **self.embedding_params)
            tokens = {k: v.to(self.device) for k, v in tokens.items()}
            
            with torch.no_grad():
                embedding = self.embedding_model(**tokens).last_hidden_state.mean(dim=1).cpu().numpy()
                normalized_embedding = embedding / np.linalg.norm(embedding).reshape(-1)
            
            query_result = self.collection.query(query_embeddings=[normalized_embedding.tolist()], n_results=1)
            if not isinstance(query_result, dict) or not query_result.get('ids') or not query_result['ids'][0]:
                return None
            
            db_embedding = np.array(query_result['embeddings'][0]).reshape(-1)
            similarity_score = float(cosine_similarity(db_embedding.reshape(1, -1), normalized_embedding.reshape(1, -1))[0][0])
            
            length = len(text.split())
            if length < 3:
                threshold = self.min_threshold
            elif length > 10:
                threshold = self.max_threshold
            else:
                threshold = self.base_threshold

            if similarity_score >= threshold:
                documents = query_result['documents'][0] if isinstance(query_result, dict) and query_result.get('documents') else []
                return documents
            else:
                return None
        
        except Exception as e:
            log.error(f"{self.error} create embedding error: {e}")
            return None

    def _get_documents_from_db(self, text: str) -> Optional[np.ndarray]:
        try:
            tokens = self.embedding_tokenizer(text, **self.embedding_params)
            tokens = {k: v.to(self.device) for k, v in tokens.items()}
            
            with torch.no_grad():
                embedding = self.embedding_model(**tokens).last_hidden_state.mean(dim=1).cpu().numpy()
                normalized_embedding = embedding / np.linalg.norm(embedding)
            
            return normalized_embedding
        except Exception as e:
            log.error(f"{self.error} create embedding error: {e}")
            return None

    async def is_relevant(self, query: str, **kwargs) -> dict:
        self._initialize_system()
        try:
            query_embedding = self._get_documents_from_db(query)
            if query_embedding is None:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['NOT_RELEVANT'],
                    message=response_handler.MESSAGES['NOT_RELEVANT'],
                    status_code=400
                )
            
            query_result = self.collection.query(query_embeddings=[query_embedding.tolist()], n_results=1)
            
            if not isinstance(query_result, dict) or not query_result.get('ids') or not query_result['ids'][0]:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['NOT_RELEVANT'],
                    message=response_handler.MESSAGES['NOT_RELEVANT'],
                    status_code=400
                )
            
            db_embedding = np.array(query_result['embeddings'][0]).reshape(-1)
            sim = float(cosine_similarity(db_embedding.reshape(1, -1), query_embedding.reshape(1, -1))[0][0])

            length = len(query.split())
            if length < 3:
                threshold = self.min_threshold
            elif length > 10:
                threshold = self.max_threshold
            else:
                threshold = self.base_threshold

            if sim >= threshold:
                return self.retrieve(
                    query=query,
                    kwargs=kwargs,
                    threshold=threshold,
                    query_result=query_result
                )
            else:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['NOT_RELEVANT'],
                    message=response_handler.MESSAGES['NOT_RELEVANT'],
                    status_code=400
                )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"{self.error} is_relevant error: {e}",
            )

    async def genarate_text(
        self,
        query: str,
        token: str,
        files: list[str] = None,
        biometrics: list[dict] = None,
    ):
        """Retrieve documents and generate a response."""
        try:
            self._initialize_system()
            db_documents = self._get_documents(query)
            if not db_documents:
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['NOT_RELEVANT'],
                    message=response_handler.MESSAGES['NOT_RELEVANT'],
                    status_code=400
                )
            is_files_relevant = []
            if files:
                is_files_relevant = [bool(self._get_documents(file)) for file in files]
            
            return await self.modal_handler.generate(
                query=query,
                document=db_documents,
                files=files,
                is_files_relevant=is_files_relevant,
                token=token,
                biometrics=biometrics
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"{self.error} retrieve error: {e}"
            )