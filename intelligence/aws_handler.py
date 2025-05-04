import os
import boto3
from log_handler import LogHandler
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
log_handler = LogHandler()

class AwsHandler:
    def __init__(self):
        # Load credentials and configuration from environment variables
        self.AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
        self.AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
        self.BUCKET_NAME = os.environ.get('BUCKET_NAME')
        self.MODEL_PREFIX = os.environ.get('MODEL_PREFIX', 'bio_integence_llama_1B_01')
        self.TOKENIZER_PREFIX = os.environ.get('TOKENIZER_PREFIX', 'bio_integence_llama_1B_01_tokenizer')
        self.AWS_REGION = os.environ.get('AWS_REGION', 'eu-central-1')  # Default to eu-central-1

        # Log connection info
        log_handler.log_info(f"Connecting to bucket: {self.BUCKET_NAME} in region {self.AWS_REGION}")
        log_handler.log_info(f"Using model prefix: {self.MODEL_PREFIX}")
        log_handler.log_info(f"Using tokenizer prefix: {self.TOKENIZER_PREFIX}")

        # Validate that we have the required configuration
        if not all([self.AWS_ACCESS_KEY_ID, self.AWS_SECRET_ACCESS_KEY, self.BUCKET_NAME]):
            log_handler.log_error("Missing required AWS configuration. Check your .env file.")
            self.s3_client = None
            return

        # Initialize the S3 client with the correct region
        try:
            self.s3_client = boto3.client(
                's3',
                region_name=self.AWS_REGION,
                aws_access_key_id=self.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY
            )
        except Exception as e:
            log_handler.log_error(f"Failed to initialize S3 client: {e}")
            self.s3_client = None

    def fetch_model_and_tokenizer(self):
        """Fetch model and tokenizer files from S3"""
        if not self.s3_client:
            log_handler.log_error("S3 client not initialized")
            return None, None
            
        try:
            log_handler.log_info(f"Downloading model files from S3 bucket {self.BUCKET_NAME}")
            
            # Model files
            model_paths = [
                f"{self.MODEL_PREFIX}/model.safetensors",
                f"{self.MODEL_PREFIX}/config.json",
                f"{self.MODEL_PREFIX}/generation_config.json"
            ]
            model_files = {}
            for key in model_paths:
                log_handler.log_info(f"Downloading {key}")
                response = self.s3_client.get_object(Bucket=self.BUCKET_NAME, Key=key)
                model_files[os.path.basename(key)] = response['Body'].read()
                log_handler.log_info(f"Downloaded {key} successfully")

            # Tokenizer files
            tokenizer_paths = [
                f"{self.TOKENIZER_PREFIX}/tokenizer.json",
                f"{self.TOKENIZER_PREFIX}/tokenizer_config.json",
                f"{self.TOKENIZER_PREFIX}/special_tokens_map.json"
            ]
            tokenizer_files = {}
            for key in tokenizer_paths:
                log_handler.log_info(f"Downloading {key}")
                response = self.s3_client.get_object(Bucket=self.BUCKET_NAME, Key=key)
                tokenizer_files[os.path.basename(key)] = response['Body'].read()
                log_handler.log_info(f"Downloaded {key} successfully")

            log_handler.log_info("All files downloaded successfully")
            return model_files, tokenizer_files
        except Exception as e:
            log_handler.log_error(f"AWS fetch error: {e}")
            return None, None