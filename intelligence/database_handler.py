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
import asyncio

from log_handler import LogHandler
from responses_handler import ResponseHandler
from modal_handler import ModalHandler
from config import DIRECTORIES, FILE_PREFIXES, DB_CONFIG

# Run embedding generation in thread pool
loop = asyncio.get_event_loop()

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
        
        message = "DatabaseHandler on"
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
            log.info(f"{message} GPU: {torch.cuda.get_device_name(0)}")
        else:
            self.device = torch.device("cpu")
            log.info(f"{message} CPU")

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
        except Exception as e:
            log.error(f"{self.error} failed loading embedder: {e}")

    def _init_database(self):
        try:
            self.client = chromadb.PersistentClient(path=DIRECTORIES["DATABASE_DIR"])
            name = os.path.splitext(FILE_PREFIXES["EMBEDDINGS"]["LOCAL_PREFIX"])[0]
            self.collection = self.client.get_or_create_collection(name=name)

            if self.collection.count() == 0:
                emb_path = self.modal_handler.validate_path(
                    DIRECTORIES["VECTORS_DIR"],
                    FILE_PREFIXES["EMBEDDINGS"]["LOCAL_PREFIX"],
                    FILE_PREFIXES["EMBEDDINGS"]["BUCKET_PREFIX"]
                )
                array = np.load(emb_path)
                self.embeddings = array / np.linalg.norm(array, axis=1, keepdims=True)
                total_embeddings = len(self.embeddings)

                data_path = self.modal_handler.validate_path(
                    DIRECTORIES["DATASET_DIR"],
                    FILE_PREFIXES["DATASET"]["LOCAL_PREFIX"],
                    FILE_PREFIXES["DATASET"]["BUCKET_PREFIX"]
                )
                df = pd.read_csv(data_path)
                docs = df[self.target_column].tolist()
                ids = [f"doc_{i}" for i in range(total_embeddings)]
                metas = [{"id": i} for i in range(total_embeddings)]

                batch_size = 5000
                for i in tqdm(range(0, total_embeddings, batch_size), desc="Indexing embeddings"):
                    j = min(i + batch_size, total_embeddings)
                    self.collection.add(
                        embeddings=self.embeddings[i:j].tolist(),
                        documents=docs[i:j],
                        ids=ids[i:j],
                        metadatas=metas[i:j]
                    )
                    tqdm.write(f"Indexed {i}-{j} / {total_embeddings}")  # ← This won't break tqdm
            tqdm.write(f"Database Loaded with: {self.collection.count()} documents")
        except Exception as e:
            log.error(f"{self.error} database init failed: {e}")

    def _initialize_system(self):
        if not self.embedding_model:
            self._init_embedding_model()
        if not self.collection:
            self._init_database()
            
        return

    async def _get_embedding(self, text: str) -> Optional[np.ndarray]:
        try:
            tokens = self.embedding_tokenizer(text, **self.embedding_params)
            tokens = {k: v.to(self.device) for k, v in tokens.items()}
    
            def _generate_embedding():
                with torch.no_grad():
                    embedding = self.embedding_model(**tokens).last_hidden_state.mean(dim=1).cpu().numpy()
                    return embedding / np.linalg.norm(embedding)
            
            return await loop.run_in_executor(None, _generate_embedding)
        except Exception as e:
            log.error(f"{self.error} creating embedding: {e}")
            return None
        
    async def _query_database(self, text: str) -> tuple[Optional[str], Optional[List[str]]]:
        try:
            query_embedding = await self._get_embedding(text)
            if query_embedding is None:
                return None, None

            # Include embeddings in the query result
            query_result = self.collection.query(
                query_embeddings=[query_embedding.reshape(-1).tolist()],
                n_results=1,
                include=['embeddings', 'documents', 'metadatas', 'distances']
            )

            # Fix the boolean logic check
            if (not isinstance(query_result, dict) or 
                not query_result.get('ids') or 
                len(query_result['ids']) == 0 or 
                len(query_result['ids'][0]) == 0):
                return None, None

            db_embeddings = query_result.get('embeddings')
            if (not db_embeddings or 
                len(db_embeddings) == 0 or 
                len(db_embeddings[0]) == 0):
                log.error(f"{self.error} no embeddings returned from query")
                return None, None

            # Get the first embedding from the results
            db_embedding = np.array(db_embeddings[0][0])
            
            # Check if arrays are valid before passing to _is_relevant
            if query_embedding.size == 0 or db_embedding.size == 0:
                log.error(f"{self.error} empty embeddings detected")
                return None, None
                           
            if self._is_relevant(query_embedding, db_embedding, text):
                documents = query_result.get('documents', [])
                if documents and len(documents) > 0 and len(documents[0]) > 0:
                    return text, documents[0]
                else:
                    return None, None
            else:
                return None, None
        except Exception as e:
            log.error(f"{self.error} query database error: {e}")
            import traceback
            log.error(f"Full traceback: {traceback.format_exc()}")
            return None, None

    def _is_relevant(self, query_embedding: np.ndarray, db_embedding: np.ndarray, text: str) -> bool:
        try:
            query_emb = np.array(query_embedding).reshape(1, -1)
            db_emb = np.array(db_embedding).reshape(1, -1)
                       
            sim_score = float(cosine_similarity(db_emb, query_emb)[0][0])

            length = len(text.split())
            if length < 3:
                threshold = self.min_threshold
            elif length > 10:
                threshold = self.max_threshold
            else:
                threshold = self.base_threshold
            
            return sim_score >= threshold
        except Exception as e:
            log.error(f"{self.error} similarity check error: {e}")
            import traceback
            log.error(f"Full traceback: {traceback.format_exc()}")
            return False

    async def generate_text(self, query: str, token: str, files: list[str] = None, biometrics: list[dict] = None):
        try:
            self._initialize_system()
            
            prompt, db_documents = await self._query_database(query)
            if not db_documents:
                log.info(f"No relevant documents found for query: '{query}'")
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['NOT_RELEVANT'],
                    message=response_handler.MESSAGES['NOT_RELEVANT'],
                    status_code=204
                )
            
            relevant_files = None
            if files:
                relevant_files = []
                for file in files:
                    file_result, _ = await self._query_database(file)
                    if file_result:
                        relevant_files.append(file_result)
            
            return await self.modal_handler.generate(
                query=prompt,  
                document=db_documents,
                relevant_files=relevant_files,
                token=token,
                biometrics=biometrics
            )
        except Exception as e:
            log.error(f"{self.error} generate text error: {e}")
            import traceback
            log.error(f"Full traceback: {traceback.format_exc()}")
            return response_handler.handle_exception(
                exception=f"{self.error} generate text error: {e}"
            )