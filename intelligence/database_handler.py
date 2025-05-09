from log_handler import LogHandler
from bucket_handler import BucketHandler
from responses_handler import ResponseHandler

import os
import numpy as np
import torch
import chromadb
import pandas as pd
from transformers import AutoModel, AutoTokenizer
from sklearn.metrics.pairwise import cosine_similarity

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
        self.database_dir = DIRECTORIES["DATABASE_DIR"]
        self.vectors_dir = DIRECTORIES["VECTORS_DIR"]
        self.embedding_model_dir = DIRECTORIES["EMBEDDING_MODEL_DIR"]
        self.dataset_dir = DIRECTORIES["DATASET_DIR"]

        self.target_column = DB_CONFIG["TARGET_COLUMN"]
        self.top_k = DB_CONFIG["TOP_K"]

        for directory in [self.database_dir, self.vectors_dir, self.embedding_model_dir, self.dataset_dir]:
            os.makedirs(directory, exist_ok=True)

        self.dataset = None
        self.embeddings = None
        self.embedding_model = None  
        self.embedding_tokenizer = None
        self.database_client = None
        self.database_collection = None

        if torch.cuda.is_available():
            self.device = torch.device("cuda")
            log.info(f"Using GPU acceleration: {torch.cuda.get_device_name(0)}")
        else:
            self.device = torch.device("cpu")
            import multiprocessing
            cpu_count = multiprocessing.cpu_count()
            log.info(f"Using CPU with {cpu_count} cores")

    def _validate_path(self, local_dir, local_prefix, bucket_prefix, is_directory=False):
        local_path = os.path.join(local_dir, local_prefix)

        if is_directory:
            if os.path.isdir(local_path) and os.listdir(local_path):
                log.info(f"Found locally: {local_path}")
                return local_path

            log.info(f"Directory missing or empty: {local_path}")
            os.makedirs(local_path, exist_ok=True)

            if not bucket_prefix.endswith('/'):
                bucket_prefix += '/'

            bucket_handler = BucketHandler()
            if not bucket_handler.get_object(prefix=bucket_prefix, local_dir=local_path):
                log.error(f"Failed to retrieve directory from S3: {bucket_prefix}")
                return None

            log.info(f"Directory downloaded to: {local_path}")
            return local_path
        else:
            if os.path.exists(local_path):
                log.info(f"Found locally: {local_path}")
                return local_path

            log.info(f"Not found locally: {local_path}, attempting S3 download")
            bucket_handler = BucketHandler()
            stored_path = bucket_handler.get_object(
                prefix=bucket_prefix,
                local_dir=local_dir
            )

            if not stored_path:
                log.error(f"Failed to retrieve {bucket_prefix} from S3")
                return None

            log.info(f"Downloaded from S3 to: {stored_path}")
            return stored_path

    def _init_embeddings_model(self):
        log.info("Initializing embedding model")

        model_folder = FILE_PREFIXES["EMBEDDING_MODEL"]["LOCAL_PREFIX"]
        model_bucket_prefix = FILE_PREFIXES["EMBEDDING_MODEL"]["BUCKET_PREFIX"]

        local_model_dir = self._validate_path(
            local_dir=self.embedding_model_dir,
            local_prefix=model_folder,
            bucket_prefix=model_bucket_prefix,
            is_directory=True
        )

        if not local_model_dir:
            log.error("Failed to initialize embedding model directory")
            return

        try:
            model = AutoModel.from_pretrained(local_model_dir)
            self.embedding_model = model.bert.to(self.device) if hasattr(model, "bert") else model.base_model.to(self.device)
            self.embedding_tokenizer = AutoTokenizer.from_pretrained(local_model_dir)
            log.info(f"Embedding model loaded from: {local_model_dir}")
        except Exception as e:
            log.error(f"Failed to load embedding model: {e}")

    def _init_database(self):
        try:
            self.database_client = chromadb.PersistentClient(path=self.database_dir)
            name = os.path.splitext(FILE_PREFIXES["EMBEDDINGS"]["LOCAL_PREFIX"])[0]
            self.database_collection = self.database_client.get_or_create_collection(name=name)
            log.info(f"ChromaDB collection '{name}' initialized at: {self.database_dir}")

            emb_path = self._validate_path(
                local_dir=self.vectors_dir,
                local_prefix=FILE_PREFIXES["EMBEDDINGS"]["LOCAL_PREFIX"],
                bucket_prefix=FILE_PREFIXES["EMBEDDINGS"]["BUCKET_PREFIX"],
                is_directory=False
            )
            if not emb_path:
                raise FileNotFoundError("Embeddings file not found")
            self.embeddings = np.load(emb_path)
            self.embeddings = self.embeddings / np.linalg.norm(self.embeddings, axis=1, keepdims=True)
            log.info(f"Loaded and normalized embeddings from: {emb_path} (shape: {self.embeddings.shape})")

            if self.database_collection.count() == 0:
                data_path = self._validate_path(
                    local_dir=self.dataset_dir,
                    local_prefix=FILE_PREFIXES["DATASET"]["LOCAL_PREFIX"],
                    bucket_prefix=FILE_PREFIXES["DATASET"]["BUCKET_PREFIX"],
                    is_directory=False
                )
                if not data_path:
                    raise FileNotFoundError("Dataset file not found")
                self.dataset = pd.read_csv(data_path)
                log.info(f"Loaded dataset from: {data_path} (rows: {len(self.dataset)})")

                if self.target_column not in self.dataset.columns:
                    raise ValueError(f"Missing target column '{self.target_column}' in dataset")
                log.info("Populating ChromaDB collection from local data")
                total = min(len(self.dataset), len(self.embeddings))
                ids = [f"doc_{i}" for i in range(total)]
                docs = self.dataset[self.target_column].tolist()[:total]
                metadatas = [{"id": i} for i in range(total)]

                # Batch processing: Log batch sizes and handle large batches
                batch_size = 5000  # example batch size
                for start_idx in range(0, total, batch_size):
                    end_idx = min(start_idx + batch_size, total)

                    try:
                        self.database_collection.add(
                            embeddings=self.embeddings[start_idx:end_idx].tolist(),
                            documents=docs[start_idx:end_idx],
                            ids=ids[start_idx:end_idx],
                            metadatas=metadatas[start_idx:end_idx]
                        )
                        log.info(f"Batch {start_idx // batch_size + 1} - {end_idx - start_idx} successfully.")
                    except ValueError as e:
                        log.error(f"Error adding batch {start_idx // batch_size + 1}: {e}")
                        break  

                log.info(f"Finished adding {total} documents to ChromaDB collection")
            else:
                log.info(f"ChromaDB collection already has {self.database_collection.count()} entries")
        except Exception as e:
            log.error(f"Error initializing database: {e}")
            raise

    async def is_relevant(self, query, base_threshold=0.75, max_threshold=0.9, min_threshold=0.6):
        if not self.embedding_model:
            self._init_embeddings_model()
        if not self.database_collection:
            self._init_database()

        if not all([self.embedding_model, self.embedding_tokenizer, self.database_collection]):
            log.error("Cannot perform relevance check: components not initialized")
            return False

        try:
            tokens = self.embedding_tokenizer(query, return_tensors="pt", truncation=True, padding=True)
            tokens = {k: v.to(self.device) for k, v in tokens.items()}

            with torch.no_grad():
                out = self.embedding_model(**tokens)
                query_emb = out.last_hidden_state.mean(dim=1).cpu().numpy()
                query_emb = query_emb / np.linalg.norm(query_emb, axis=1, keepdims=True)

            results = self.database_collection.query(
                query_embeddings=query_emb.tolist(),
                n_results=1
            )

            if not results['ids'] or not results['ids'][0]:
                log.warning("No match found in ChromaDB")
                return False

            top_idx = int(results['ids'][0][0].split("_")[-1])
            closest_embedding = self.embeddings[top_idx].reshape(1, -1)
            similarity = cosine_similarity(query_emb, closest_embedding)[0][0]

            query_length = len(query.split())
            if query_length > 10:
                threshold = max_threshold
            elif query_length < 3:
                threshold = min_threshold
            else:
                threshold = base_threshold

            log.info(f"Cosine similarity={similarity:.4f}, threshold={threshold:.4f}, relevant={similarity >= threshold}")
            if not similarity >= threshold:
                return response_handler.handle_response(
                   error=response_handler.MESSAGES["NOT_RELEVANT"],
                   message=response_handler.MESSAGES["NOT_RELEVANT"], 
                )

            return response_handler.handle_response(
                response=bool(similarity >= threshold)
            )

        except Exception as e:
            log.error(f"Relevance check error: {e}")
            return False
