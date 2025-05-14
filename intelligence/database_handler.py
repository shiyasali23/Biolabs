from log_handler import LogHandler
from responses_handler import ResponseHandler
from bucket_handler import BucketHandler
from modal_handler import ModalHandler

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
        self.top_k = int(DB_CONFIG["TOP_K"])

        for directory in [self.database_dir, self.vectors_dir, self.embedding_model_dir, self.dataset_dir]:
            os.makedirs(directory, exist_ok=True)

        self.dataset = None
        self.embeddings = None
        self.embedding_model = None  
        self.embedding_tokenizer = None
        self.database_client = None
        self.database_collection = None
        
        message = "in Database handler"
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
            log.info(f"Using GPU{message} : {torch.cuda.get_device_name(0)}")
        else:
            self.device = torch.device("cpu")
            log.info(f"Using CPU with  cores {message}")
            
        self.modal_handler = ModalHandler()
        

    def _init_embeddings_model(self):
        log.info("Initializing embedding model")

        model_folder = FILE_PREFIXES["EMBEDDING_MODEL"]["LOCAL_PREFIX"]
        model_bucket_prefix = FILE_PREFIXES["EMBEDDING_MODEL"]["BUCKET_PREFIX"]

        # Check if model folder and bucket prefix are valid
        if not model_folder or not model_bucket_prefix:
            log.error("Missing embedding model configuration")
            return

        local_model_dir = self.modal_handler.validate_path(
            local_dir=self.embedding_model_dir,
            local_prefix=model_folder,
            bucket_prefix=model_bucket_prefix,
        )

        if not local_model_dir:
            log.error("Failed to initialize embedding model directory")
            return

        try:
            model = AutoModel.from_pretrained(local_model_dir)                
            self.embedding_tokenizer = AutoTokenizer.from_pretrained(local_model_dir)
            
            self.embedding_model = model.to(self.device)
            self.embedding_model.eval()  # Set to evaluation mode for inference
            log.info(f"Embedding model loaded from: {local_model_dir}")
        except Exception as e:
            log.error(f"Failed to load embedding model: {e}")

    def _init_database(self):
        try:
            self.database_client = chromadb.PersistentClient(path=self.database_dir)
            
            # Ensure embeddings file prefix exists
            if not FILE_PREFIXES["EMBEDDINGS"]["LOCAL_PREFIX"]:
                raise ValueError("Missing embeddings configuration in FILE_PREFIXES")
                
            name = os.path.splitext(FILE_PREFIXES["EMBEDDINGS"]["LOCAL_PREFIX"])[0]
            self.database_collection = self.database_client.get_or_create_collection(name=name)
            log.info(f"ChromaDB collection '{name}' initialized at: {self.database_dir}")

            # Get embeddings file
            emb_path = self.modal_handler.validate_path(
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

            # If database is empty, populate it
            if self.database_collection.count() == 0:
                data_path = self.modal_handler.validate_path(
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
                        log.info(f"Batch {start_idx // batch_size + 1} - {end_idx - start_idx} documents added successfully.")
                    except ValueError as e:
                        log.error(f"Error adding batch {start_idx // batch_size + 1}: {e}")
                        break  

                log.info(f"Finished adding {total} documents to ChromaDB collection")
            else:
                log.info(f"ChromaDB collection already has {self.database_collection.count()} entries")
        except Exception as e:
            log.error(f"Error initializing database: {e}")
            raise
        
    
        
    def _validate_system(self):
        if not self.embedding_model:
            self._init_embeddings_model()
        if not self.database_collection:
            self._init_database()

    async def is_relevant(self, query, base_threshold=0.75, max_threshold=0.9, min_threshold=0.6):
        self._validate_system()

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
                return response_handler.handle_response(
                   error=response_handler.MESSAGES["NOT_RELEVANT"],
                   message=response_handler.MESSAGES["NOT_RELEVANT"]
                )

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
                   message=response_handler.MESSAGES["NOT_RELEVANT"]
                )

            return await self.retrieve(
                query=query,
                batch_size=None,
                use_gpu=None,  # Use default GPU setting
                top_k=None,    # Use default top_k 
                normalize_embeddings=True,
                filter_results=None
            )

        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error checking relevance: {e}"
            )
        
    async def retrieve(self, query, batch_size=None, use_gpu=None, top_k=None, normalize_embeddings=True, filter_results=None):
        """
        Retrieve relevant documents based on query.
        
        Args:
            query (str): The search query text
            batch_size (int, optional): Batch size for tokenization and inference
            use_gpu (bool, optional): Override GPU usage for this specific query
            top_k (int, optional): Number of results to return, overrides self.top_k
            normalize_embeddings (bool, optional): Whether to normalize embeddings
            filter_results (dict, optional): Filter criteria for ChromaDB query
            
        Returns:
            Response from response_handler containing matching documents
        """
        self._validate_system()

        if not all([self.embedding_model, self.embedding_tokenizer, self.database_collection]):
            return response_handler.handle_exception(
                exception="Retrieval components not properly initialized"
            )

        # Use provided parameters or fall back to defaults
        results_count = top_k if top_k is not None else self.top_k
        device = torch.device("cuda") if (use_gpu or (use_gpu is None and self.device == torch.device("cuda"))) else torch.device("cpu")
        
        try:
            # Tokenize with efficient settings
            tokens = self.embedding_tokenizer(
                query, 
                return_tensors="pt", 
                truncation=True, 
                padding=True,
                max_length=512  # Limit token length for efficiency
            )
            tokens = {k: v.to(device) for k, v in tokens.items()}

            # Configure inference optimizations
            with torch.no_grad():
                # Get embeddings
                out = self.embedding_model(**tokens)
                query_emb = out.last_hidden_state.mean(dim=1).cpu().numpy()
                
                # Normalize if specified
                if normalize_embeddings:
                    query_emb = query_emb / np.linalg.norm(query_emb, axis=1, keepdims=True)

            # Configure ChromaDB query
            query_params = {
                "query_embeddings": query_emb.tolist(),
                "n_results": results_count
            }
            
            # Add filters if provided
            if filter_results:
                query_params["where"] = filter_results
                
            results = self.database_collection.query(**query_params)

            # Return formatted results
            return await self.modal_handler.generate(
                query=query,
                document=results['documents'][0]
            )
        except Exception as e:
            return response_handler.handle_exception(
                exception=f"Error during retrieval: {e}"
            )