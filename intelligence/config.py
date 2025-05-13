import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MODEL_CONFIG = {
    "MAX_NEW_TOKENS": int(os.getenv("MAX_NEW_TOKENS", 100)),
    "MODEL_DIR": os.getenv("MODEL_DIR", "./model"),
    "MODEL": {
        "LOCAL_PREFIX": os.getenv("MODEL_PREFIX"),
        "BUCKET_PREFIX": os.getenv("MODEL_BUCKET_PREFIX")
    },
    "TOKENIZER": {
        "LOCAL_PREFIX": os.getenv("TOKENIZER_PREFIX"),
        "BUCKET_PREFIX": os.getenv("TOKENIZER_BUCKET_PREFIX")
    },
}

DB_CONFIG = {
    "TARGET_COLUMN": os.getenv("TARGET_COLUMN", "answer"),
    "TOP_K": int(os.getenv("TOP_K", 3))
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
    "EMBEDDING_MODEL_DIR": os.getenv("EMBEDDING_MODEL_DIR", "./embedding_model"),
    "DATASET_DIR": os.getenv("DATASET_DIR", "./dataset"),
    "MODEL_DIR": os.getenv("MODEL_DIR", "./model"),
}

EMBEDDING_MODEL_CONFIG = {
    "MAX_NEW_TOKENS": int(os.getenv("MAX_NEW_TOKENS", 100)),
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
    },
}

# File Prefixes
FILE_PREFIXES = {
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
    },
    "MODEL": {
        "LOCAL_PREFIX": os.getenv("MODEL_PREFIX"),
        "BUCKET_PREFIX": os.getenv("MODEL_BUCKET_PREFIX")
    },
    "TOKENIZER": {
        "LOCAL_PREFIX": os.getenv("TOKENIZER_PREFIX"),
        "BUCKET_PREFIX": os.getenv("TOKENIZER_BUCKET_PREFIX")
    },
}

# Logging Configuration
LOG_CONFIG = {
    "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
    "LOG_FILE": os.getenv("LOG_FILE", "app.log")
}

