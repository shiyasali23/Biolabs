from log_handler import LogHandler
from aws_handler import AwsHandler
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os

log_handler = LogHandler()


class ModalHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_once()
        return cls._instance

    def _init_once(self):
        self.model = None
        self.tokenizer = None
        self.model_dir = os.getenv("MODEL_DIR", "model")
        self.tokenizer_dir = os.path.join(self.model_dir, "tokenizer")
        
        # Create directories if they don't exist
        os.makedirs(self.model_dir, exist_ok=True)
        os.makedirs(self.tokenizer_dir, exist_ok=True)
        
        self._init_models()

    def _init_models(self):
        """Initialize models from local or cloud storage"""
        # First try loading from local storage
        self.model, self.tokenizer = self._init_from_local()
        
        # If local loading failed, try loading from cloud
        if not self.model or not self.tokenizer:    
            self.model, self.tokenizer = self._init_from_cloud()
        
        # Log error if both methods failed
        if not self.model or not self.tokenizer:
            log_handler.log_error("Failed to initialize model or tokenizer")
        
    def _init_from_local(self):
        """Load model and tokenizer from local storage"""
        try:
            if not os.path.exists(self.model_dir):
                log_handler.log_info("Model directory not found")
                return None, None
                
            model = AutoModelForCausalLM.from_pretrained(self.model_dir, torch_dtype=torch.float16)
            tokenizer = AutoTokenizer.from_pretrained(self.tokenizer_dir)
            
            if model and tokenizer:
                log_handler.log_info("Successfully loaded model from local storage")
                return model, tokenizer
            return None, None
        except Exception as e:
            log_handler.log_info(f"Failed to load model from local storage: {e}")
            return None, None
            
    def _init_from_cloud(self):
        """Load model and tokenizer from cloud storage"""
        try:
            aws_handler = AwsHandler()

            # Fetch model files
            log_handler.log_info("Fetching model files from cloud storage")
            model_files, tokenizer_files = aws_handler.fetch_model_and_tokenizer()
            
            if not model_files or not tokenizer_files:
                log_handler.log_error("Failed to fetch model/tokenizer files from cloud")
                return None, None
                
            # Save files locally
            self._save_model_files(model_files, tokenizer_files)
            
            # Load the saved files
            return self._init_from_local()
        except AttributeError as e:
            log_handler.log_error(f"AWS handler error: {e}")
            return None, None
        except Exception as e:
            log_handler.log_error(f"Failed to initialize from cloud: {e}")
            return None, None
    
    def _save_model_files(self, model_files, tokenizer_files):
        """Save model and tokenizer files to local storage"""
        try:
            # Create directories if they don't exist
            os.makedirs(self.model_dir, exist_ok=True)
            os.makedirs(self.tokenizer_dir, exist_ok=True)
            
            # Save model files
            for filename, content in model_files.items():
                file_path = os.path.join(self.model_dir, filename)
                with open(file_path, 'wb') as f:
                    f.write(content)

            # Save tokenizer files
            for filename, content in tokenizer_files.items():
                file_path = os.path.join(self.tokenizer_dir, filename)
                with open(file_path, 'wb') as f:
                    f.write(content)

            log_handler.log_info("Successfully saved model and tokenizer files locally")
        except Exception as e:
            log_handler.log_error(f"Failed to save model/tokenizer files: {e}")
            
    def get_model_and_tokenizer(self):
        """Return the initialized model and tokenizer"""
        return self.model, self.tokenizer