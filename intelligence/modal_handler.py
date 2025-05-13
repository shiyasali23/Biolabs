from log_handler import LogHandler
from responses_handler import ResponseHandler
from bucket_handler import BucketHandler

import os
import torch
from transformers import AutoModelForQuestionAnswering, AutoTokenizer
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
        for directory in [self.model_dir]:
            os.makedirs(directory, exist_ok=True)

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
        
        # Get model 
        model_path = self.validate_path(
            local_dir=self.model_dir,
            local_prefix=MODEL_CONFIG["MODEL"]["LOCAL_PREFIX"],
            bucket_prefix=MODEL_CONFIG["MODEL"]["BUCKET_PREFIX"],
        )
        
        # Get tokenizer 
        tokenizer_path = self.validate_path(
            local_dir=self.model_dir,
            local_prefix=MODEL_CONFIG["TOKENIZER"]["LOCAL_PREFIX"],
            bucket_prefix=MODEL_CONFIG["TOKENIZER"]["BUCKET_PREFIX"],
        )

        if not model_path or not tokenizer_path:
            log.error("Failed to locate model or tokenizer s")
            return

        try:
            self.model = AutoModelForQuestionAnswering.from_pretrained(model_path)
            self.tokenizer = AutoTokenizer.from_pretrained(tokenizer_path)

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

            # If document is provided, use it as context
            context = ""
            if document and isinstance(document, list) and len(document) > 0:
                context = " ".join(document)
            
            # Prepare inputs for question answering
            inputs = self.tokenizer(
                query, 
                context if context else query,  # Use context if available, otherwise just the query
                return_tensors="pt", 
                max_length=512, 
                truncation=True
            ).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(**inputs)
                
                # Process outputs based on whether we're using context
                if context:
                    # For QA models with context, get start and end positions
                    start_scores = outputs.start_logits
                    end_scores = outputs.end_logits
                    
                    # Get the most likely answer span
                    answer_start = torch.argmax(start_scores)
                    answer_end = torch.argmax(end_scores) + 1
                    
                    # Convert token indices to text
                    tokens = self.tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
                    answer = self.tokenizer.convert_tokens_to_string(tokens[answer_start:answer_end])
                    
                    # Clean up answer
                    answer = answer.replace("[CLS]", "").replace("[SEP]", "").strip()
                    result = answer if answer else "No answer found in the context."
                else:
                    # For generative models without context
                    outputs = self.model.generate(
                        inputs.input_ids, 
                        max_new_tokens=int(MODEL_CONFIG["MAX_NEW_TOKENS"]),
                        temperature=0.7,
                        do_sample=True
                    )
                    result = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            return responses_handler.handle_response(response=result)
        except Exception as e:
            return responses_handler.handle_exception(exception=f"Error in generate: {str(e)}")