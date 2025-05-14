from log_handler import LogHandler
from responses_handler import ResponseHandler
from bucket_handler import BucketHandler

import os
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from config import DIRECTORIES, MODEL_CONFIG


log = LogHandler()
responses_handler = ResponseHandler()


class ModalHandler:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._init_once()
        return cls._instance

    def _init_once(self):
        # Paths & config
        self.model_dir = DIRECTORIES["MODEL_DIR"]

        # Create directories if they don't exist
        os.makedirs(self.model_dir, exist_ok=True)

        message = "in Modal handler"
        if torch.cuda.is_available():
            self.device = torch.device("cuda")
            log.info(f"Using GPU{message} : {torch.cuda.get_device_name(0)}")
        else:
            self.device = torch.device("cpu")
            import multiprocessing
            cpu_count = multiprocessing.cpu_count()
            log.info(f"Using CPU with {cpu_count} cores {message}")

        # Initialize model and tokenizer as None
        self.model = None
        self.tokenizer = None
        self.bucket_handler = BucketHandler()

    def validate_path(self, local_dir, local_prefix, bucket_prefix, is_directory=True):
        """
        Check if a file exists locally. If not, download it from S3.
        Returns the full path if successful, else None.
        """
        log.info(f"Validating {local_dir=} - {local_prefix=} - {bucket_prefix=}")

        if not local_prefix or not bucket_prefix:
            log.error(f"Missing local_prefix ({local_prefix}) or bucket_prefix ({bucket_prefix})")
            return None

        local_path = os.path.join(local_dir, local_prefix)

        if os.path.exists(local_path):
            log.info(f"Found local file at {local_path}")
            return local_path

        # Create directory if it doesn't exist
        os.makedirs(local_dir, exist_ok=True)

        bucket_handler = BucketHandler()
        success = bucket_handler.get_object(prefix=bucket_prefix, local_dir=local_dir)

        if not success:
            log.error(f"Failed to retrieve {bucket_prefix} from S3 into {local_dir}")
            return None

        if not os.path.exists(local_path):
            log.error(f"Download reported success, but file {local_path} not found")
            return None

        log.info(f"Successfully downloaded to {local_path}")
        return local_path

    def _init_model(self):
        """Initialize model from local or S3"""
        log.info("Initializing model")
        
        # Get model - use the main model directory since it contains all files
        model_path = os.path.join(self.model_dir, MODEL_CONFIG["MODEL"]["LOCAL_PREFIX"])
        
        if not os.path.exists(model_path):
            log.info(f"Model not found locally, attempting to download")
            model_path = self.validate_path(
                local_dir=self.model_dir,
                local_prefix=MODEL_CONFIG["MODEL"]["LOCAL_PREFIX"],
                bucket_prefix=MODEL_CONFIG["MODEL"]["BUCKET_PREFIX"],
            )
        
        if not model_path:
            log.error("Failed to locate model")
            return

        try:
            # Use AutoModelForCausalLM for LLaMA models instead of QuestionAnswering
            self.model = AutoModelForCausalLM.from_pretrained(model_path)
            self.tokenizer = AutoTokenizer.from_pretrained(model_path)

            # Move model to appropriate device
            self.model = self.model.to(self.device)
            self.model.eval()  # Set to evaluation mode

            log.info(f"Model loaded: {type(self.model).__name__}")
        except Exception as e:
            log.error(f"Failed to load model: {e}")

    async def generate(self, query, document=None):
        try:
            if not self.model or not self.tokenizer:
                self._init_model()
                
            if not self.model or not self.tokenizer:
                return responses_handler.handle_exception(
                    exception="Failed to initialize model"
                )

            # Prepare input with RAG context if available
            input_text = query
            if document and isinstance(document, list) and len(document) > 0:
                context = " ".join(document)
                # Format for context-based generation
                input_text = f"Context: {context}\n\nQuestion: {query}\n\nAnswer:"
            
            # Prepare inputs for generation
            inputs = self.tokenizer(
                input_text,
                return_tensors="pt", 
                max_length=512, 
                truncation=True
            ).to(self.device)
            
            
            with torch.no_grad():
                outputs = self.model.generate(
                    inputs.input_ids, 
                    max_new_tokens=int(MODEL_CONFIG.get("MAX_NEW_TOKENS", 256)),
                    temperature=0.7,
                    do_sample=True,
                    pad_token_id=self.tokenizer.eos_token_id
                )
                
                # Decode only the new tokens (skip the input prompt)
                input_length = inputs.input_ids.shape[1]
                result = self.tokenizer.decode(
                    outputs[0][input_length:], 
                    skip_special_tokens=True
                )
            
            return responses_handler.handle_response(response=result)
        except Exception as e:
            log.error(f"Error in generate: {str(e)}")
            return responses_handler.handle_exception(exception=f"Error in generate: {str(e)}")