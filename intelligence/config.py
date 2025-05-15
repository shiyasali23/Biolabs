import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Model Configuration
MODEL_CONFIG = {
    "MAX_NEW_TOKENS": int(os.getenv("MAX_NEW_TOKENS", 100)),
    "MODEL_DIR": os.getenv("MODEL_DIR", "./model"),
    "MODEL": {
        "LOCAL_PREFIX": os.getenv("MODEL_PREFIX", "bio_integence_llama_1B_01"),
        "BUCKET_PREFIX": os.getenv("MODEL_BUCKET_PREFIX", "bio_integence_llama_1B_01")
    },
    "TOKENIZER": {
        "LOCAL_PREFIX": os.getenv("TOKENIZER_PREFIX", "bio_integence_llama_1B_01_tokenizer"),
        "BUCKET_PREFIX": os.getenv("TOKENIZER_BUCKET_PREFIX", "bio_integence_llama_1B_01_tokenizer")
    },
}

# Database Configuration
DB_CONFIG = {
    "TARGET_COLUMN": os.getenv("TARGET_COLUMN", "answer"),
    "TOP_K": int(os.getenv("TOP_K", 3))
}

# AWS Configuration (only non-sensitive settings)
AWS_CONFIG = {
    "AWS_ACCESS_KEY_ID": os.getenv("AWS_ACCESS_KEY_ID"),
    "AWS_SECRET_ACCESS_KEY": os.getenv("AWS_SECRET_ACCESS_KEY"),
    "AWS_REGION": os.getenv("AWS_REGION", "us-east-1"),
    "BUCKET_NAME": os.getenv("BUCKET_NAME", "biolabs-bio-intelligence")
}

# Directory Paths
DIRECTORIES = {
    "DATABASE_DIR": os.getenv("DATABASE_DIR", "./database"),
    "VECTORS_DIR": os.getenv("VECTORS_DIR", "./vectors"),
    "EMBEDDING_MODEL_DIR": os.getenv("EMBEDDING_MODEL_DIR", "./embedding_model"),
    "DATASET_DIR": os.getenv("DATASET_DIR", "./dataset"),
    "MODEL_DIR": os.getenv("MODEL_DIR", "./model"),
}

# Embedding Model Configuration
EMBEDDING_MODEL_CONFIG = {
    "MAX_NEW_TOKENS": int(os.getenv("MAX_NEW_TOKENS", 100)),
    "EMBEDDINGS": {
        "LOCAL_PREFIX": os.getenv("EMBEDDINGS_PREFIX", "bio_intelligence_qa_combined_embeddings_1.npy"),
        "BUCKET_PREFIX": os.getenv("EMBEDDINGS_BUCKET_PREFIX", "bio_intelligence_qa_combined_embeddings_1/bio_intelligence_qa_combined_embeddings_1.npy")
    },
    "EMBEDDING_MODEL": {
        "LOCAL_PREFIX": os.getenv("EMBEDDING_MODEL_PREFIX", "bio_intelligence_fine_tuned_bge-small-en-v1"),
        "BUCKET_PREFIX": os.getenv("EMBEDDING_MODEL_BUCKET_PREFIX", "bio_intelligence_fine_tuned_bge-small-en-v1")
    },
    "DATASET": {
        "LOCAL_PREFIX": os.getenv("DATASET_PREFIX", "bio_integence_qa_1.csv"),
        "BUCKET_PREFIX": os.getenv("DATASET_BUCKET_PREFIX", "bio_integence_qa_1.csv")
    },
}

# File Prefixes
FILE_PREFIXES = {
    "EMBEDDINGS": {
        "LOCAL_PREFIX": os.getenv("EMBEDDINGS_PREFIX", "bio_intelligence_qa_combined_embeddings_1.npy"),
        "BUCKET_PREFIX": os.getenv("EMBEDDINGS_BUCKET_PREFIX", "bio_intelligence_qa_combined_embeddings_1/bio_intelligence_qa_combined_embeddings_1.npy")
    },
    "EMBEDDING_MODEL": {
        "LOCAL_PREFIX": os.getenv("EMBEDDING_MODEL_PREFIX", "bio_intelligence_fine_tuned_bge-small-en-v1"),
        "BUCKET_PREFIX": os.getenv("EMBEDDING_MODEL_BUCKET_PREFIX", "bio_intelligence_fine_tuned_bge-small-en-v1")
    },
    "DATASET": {
        "LOCAL_PREFIX": os.getenv("DATASET_PREFIX", "bio_integence_qa_1.csv"),
        "BUCKET_PREFIX": os.getenv("DATASET_BUCKET_PREFIX", "bio_integence_qa_1.csv")
    },
    "MODEL": {
        "LOCAL_PREFIX": os.getenv("MODEL_PREFIX", "bio_integence_llama_1B_01"),
        "BUCKET_PREFIX": os.getenv("MODEL_BUCKET_PREFIX", "bio_integence_llama_1B_01")
    },
    "TOKENIZER": {
        "LOCAL_PREFIX": os.getenv("TOKENIZER_PREFIX", "bio_integence_llama_1B_01_tokenizer"),
        "BUCKET_PREFIX": os.getenv("TOKENIZER_BUCKET_PREFIX", "bio_integence_llama_1B_01_tokenizer")
    },
}

# Logging Configuration
LOG_CONFIG = {
    "LOG_LEVEL": os.getenv("LOG_LEVEL", "INFO"),
    "LOG_FILE": os.getenv("LOG_FILE", "app.log")
}
