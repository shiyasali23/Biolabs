import os
import torch
import numpy as np
import pandas as pd
import chromadb
from tqdm import tqdm
from transformers import AutoModel, AutoTokenizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Optional

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
        for key in ["DATABASE_DIR", "VECTORS_DIR", "EMBEDDING_MODEL_DIR", "DATASET_DIR"]:
            os.makedirs(DIRECTORIES[key], exist_ok=True)

        self.top_k = int(DB_CONFIG.get("TOP_K", 5))
        self.embedding_params = DB_CONFIG.get("EMBEDDING_PARAMS", {})
        self.target_column = DB_CONFIG["TARGET_COLUMN"]
        
        self.relevancy_threshold = DB_CONFIG.get("THRESHOLD", 0.5)
        self.accuracy_threshold = DB_CONFIG.get("THRESHOLD", 0.7)
        
        message = "DatabaseHandler on"
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
            log.info(f"{message} GPU: {torch.cuda.get_device_name(0)}")
        else:
            self.device = torch.device("cpu")
            log.info(f"{message} CPU")

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
                total_answers_embeddings = len(self.embeddings)

                data_path = self.modal_handler.validate_path(
                    DIRECTORIES["DATASET_DIR"],
                    FILE_PREFIXES["DATASET"]["LOCAL_PREFIX"],
                    FILE_PREFIXES["DATASET"]["BUCKET_PREFIX"]
                )
                df = pd.read_csv(data_path)
                docs = df[self.target_column].tolist()
                ids = [f"doc_{i}" for i in range(total_answers_embeddings)]
                metas = [{"id": i} for i in range(total_answers_embeddings)]

                batch_size = 5000
                for i in tqdm(range(0, total_answers_embeddings, batch_size), desc="Indexing embeddings"):
                    j = min(i + batch_size, total_answers_embeddings)
                    self.collection.add(
                        embeddings=self.embeddings[i:j].tolist(),
                        documents=docs[i:j],
                        ids=ids[i:j],
                        metadatas=metas[i:j]
                    )
                    tqdm.write(f"Indexed {i}-{j} / {total_answers_embeddings}")  
            tqdm.write(f"Database Loaded with: {self.collection.count()} documents")
        except Exception as e:
            log.error(f"{self.error} database init failed: {e}")

    def _initialize_system(self):
        if not self.embedding_model:
            self._init_embedding_model()
        if not self.collection:
            self._init_database()
            
        return

    async def _create_embedding(self, text: str) -> Optional[np.ndarray]:
        try:
            tokens = self.embedding_tokenizer(text, **self.embedding_params)
            tokens = {k: v.to(self.device) for k, v in tokens.items()}
            embedding = self.embedding_model(**tokens).last_hidden_state.mean(dim=1).detach().cpu().numpy()
            return embedding / np.linalg.norm(embedding).reshape(1, -1)
        except Exception as e:
            log.error(f"{self.error} creating embedding: {e}")
            return None

    async def _is_relevant(self, query: str, files: list[str] = None) -> tuple:
        try:
            all_text_file = ''.join(files) if files else ''
            total_embedding = await self._create_embedding(query + all_text_file)
            if total_embedding is not None:
                query_result = self.collection.query(
                    query_embeddings=total_embedding.tolist(),
                    n_results=1,
                    include=['embeddings', 'documents', 'metadatas', 'distances']
                )

                
                if (query_result and query_result.get('embeddings') and 
                    len(query_result['embeddings'][0]) > 0):
                    total_db_embedding = np.array(query_result['embeddings'][0][0])
                    
                    total_sim_score = float(cosine_similarity(total_db_embedding.reshape(1, -1), total_embedding)[0][0])

                    if total_sim_score >= self.relevancy_threshold:
                        if total_sim_score >= self.accuracy_threshold:
                            return query, query_result.get('documents', [])[0]
                        else:
                            return query, None
                    else:
                        return None, None
                else:
                    return None, None
            else:
                return None, None
                  
        except Exception as e:
            log.error(f"{self.error} query relevance check error: {e}")
            return None, None

    async def generate_text(self, query: str, token: str, files: list[str] = None, biometrics: list[dict] = None):
        try:
            self._initialize_system()
            
            prompt, db_documents = await self._is_relevant(
                files=files,
                query=query
            )
            if not prompt:
                log.info(f"No documents found for query: '{query}'")
                return response_handler.handle_response(
                    error=response_handler.MESSAGES['NOT_RELEVANT'],
                    message=response_handler.MESSAGES['NOT_RELEVANT'],
                    status_code=202
                )
            
            return await self.modal_handler.generate(
                query=prompt,  
                document=db_documents,
                relevant_files=files,
                token=token,
                biometrics=biometrics
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"{self.error} generate text error: {e}"
            )