import os
from dotenv import load_dotenv

load_dotenv()

AWS_CONFIG = {
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "MODEL_BUCKET_NAME": os.getenv("MODEL_BUCKET_NAME"),
    "QUERIES_BUCKET_NAME": os.getenv("QUERIES_BUCKET_NAME"),
    "AWS_REGION": os.getenv("AWS_REGION"),
}

DIRECTORIES = {
    "DATABASE_DIR": os.getenv("DATABASE_DIR", "./database"),
    "VECTORS_DIR": os.getenv("VECTORS_DIR", "./vectors"),
    "EMBEDDING_MODEL_DIR": os.getenv("EMBEDDING_MODEL_DIR", "./embedding_model"),
    "DATASET_DIR": os.getenv("DATASET_DIR", "./dataset"),
    "MODEL_DIR": os.getenv("MODEL_DIR", "./model"),
}

FILE_PREFIXES = {
    "DATASET": {
        "LOCAL_PREFIX": os.getenv("DATASET_PREFIX"),
        "BUCKET_PREFIX": os.getenv("DATASET_BUCKET_PREFIX"),
    },
    "EMBEDDINGS": {
        "LOCAL_PREFIX": os.getenv("EMBEDDINGS_PREFIX"),
        "BUCKET_PREFIX": os.getenv("EMBEDDINGS_BUCKET_PREFIX"),
    },
    "EMBEDDING_MODEL": {
        "LOCAL_PREFIX": os.getenv("EMBEDDING_MODEL_PREFIX"),
        "BUCKET_PREFIX": os.getenv("EMBEDDING_MODEL_BUCKET_PREFIX"),
    },
}

MODEL_CONFIG = {
    "MODEL": {
        "LOCAL_PREFIX": os.getenv("MODEL_PREFIX"),
        "BUCKET_PREFIX": os.getenv("MODEL_BUCKET_PREFIX"),
        "MIN_TOKENS": int(os.getenv("MIN_TOKENS", 50)),
        "MAX_TOKENS": int(os.getenv("MAX_NEW_TOKENS", 100)),
        "MODAL_TEMPERATURE": float(os.getenv("TEMPERATURE", 0.7)),
        "TOP_P": float(os.getenv("TOP_P", 0.9)),
        "TOP_K": int(os.getenv("TOP_K", 50)),
        "DO_SAMPLE": os.getenv("DO_SAMPLE", "true").lower() == "true"
    },
    "TOKENIZER": {
        "LOCAL_PREFIX": os.getenv("TOKENIZER_PREFIX"),
        "BUCKET_PREFIX": os.getenv("TOKENIZER_BUCKET_PREFIX"),
    },
}

DB_CONFIG = {
    "TARGET_COLUMN": os.getenv("TARGET_COLUMN", "answer"),
    "TOP_K": os.getenv("TOP_K", 3),
    "EMBEDDING_PARAMS": {
        "padding": True,
        "truncation": True,
        "return_tensors": "pt"
    }
}

LOG_CONFIG = {
    "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
    "LOG_TO_FILE": os.getenv("LOG_TO_FILE", "false").lower() == "true",
    "LOG_FILE": os.getenv("LOG_FILE", "app.log"),
}
