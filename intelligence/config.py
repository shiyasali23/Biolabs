import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DB_CONFIG ={
    "TARGET_COLUMN": os.getenv("TARGET_COLUMN", "answer"),
    "TOP_K": os.getenv("TOP_K", 3)
}

# AWS Configuration
AWS_CONFIG = {
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "AWS_REGION": os.getenv("AWS_REGION", "us-east-1"),
    "BUCKET_NAME": os.getenv("BUCKET_NAME")
}

# Directory Paths
DIRECTORIES = {
    "DATABASE_DIR": os.getenv("DATABASE_DIR", "./database"),
    "VECTORS_DIR": os.getenv("VECTORS_DIR", "./vectors"),
    "EMBEDDING_MODEL_DIR": os.getenv("EMBEDDING_MODEL_DIR", "./embeding_model"),
    "DATASET_DIR": os.getenv("DATASET_DIR", "./dataset")
}

# File Prefixes
FILE_PREFIXES = {
    "FAISS_INDEX": {
        "LOCAL_PREFIX": os.getenv("FAISS_INDEX_PREFIX"),
        "BUCKET_PREFIX": os.getenv("FAISS_INDEX_BUCKET_PREFIX")
    },
    "EMBEDDINGS": {
        "LOCAL_PREFIX": os.getenv("EMBEDDINGS_PREFIX"),
        "BUCKET_PREFIX": os.getenv("EMBEDDINGS_BUCKET_PREFIX")
    },
    "EMBEDDING_MODEL": {
        "LOCAL_PREFIX": os.getenv("EMBEDDING_MODEL_PREFIX"),
        "BUCKET_PREFIX": os.getenv("EMBEDDING_MODEL_BUCKET_PREFIX")
    },
    "DATASET": {
        "LOCAL_PREFIX": os.getenv("DATASET_PREFIX"),
        "BUCKET_PREFIX": os.getenv("DATASET_BUCKET_PREFIX")
    }
}

# Logging Configuration
LOG_CONFIG = {
    "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
    "LOG_FILE": os.getenv("LOG_FILE", "app.log")
}



# Create necessary directories if they don't exist
for directory in DIRECTORIES.values():
    os.makedirs(directory, exist_ok=True)