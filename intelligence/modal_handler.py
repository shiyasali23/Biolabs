# from log_handler import LogHandler
# from bucket_handler import BucketHandler
# import torch
# from transformers import AutoModelForCausalLM, AutoTokenizer
# import os

# log = LogHandler()


# class ModalHandler:
#    _instance = None

#     def __new__(cls, *args, **kwargs):
#         if cls._instance is None:
#             cls._instance = super().__new__(cls)
#             cls._instance._init_once()
#         return cls._instance

#     def _init_once(self):
#         # Paths & config
#         self.model_dir = DIRECTORIES["MODEL_DIR"]
#         self.bucket_handler = BucketHandler()
        
        
        
        
#         # Create directories if they don't exist
#         for directory in [self.model_dir]:
#             os.makedirs(directory, exist_ok=True)
#         self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#         log.info(f"Using device: {self.device}")
        
        
#     def _validate_path(self, local_dir, local_prefix, bucket_prefix):
#         """Validate and retrieve file path, downloading from S3 if necessary"""
#         local_path = os.path.join(local_dir, local_prefix)
        
#         if not os.path.exists(local_path):
#             log.info(f"Not found locally: {local_path}")
#             stored_path = bucket_handler.get_object(
#                 prefix=bucket_prefix,
#                 local_dir=local_dir
#             )
            
#             if not stored_path:
#                 log.error(f"Failed to retrieve {bucket_prefix} from S3")
#                 return None
                
#             return stored_path
        
#         log.info(f"Using existing local file: {local_path}")
#         return local_path
    
        

#     def _init_model(self):
#         """Initialize  model from local or S3"""
#         log.info("Initializing  model")
#         model_path = self._validate_path(
#             local_dir=self.model_dir, 
#             local_prefix=FILE_PREFIXES["MODEL"]["LOCAL_PREFIX"],
#             bucket_prefix=FILE_PREFIXES["MODEL"]["BUCKET_PREFIX"]
#         )
        
#         if not model_path:
#             log.error("Failed to locate  model files")
#             return

#         try:
#             # For directory-based model loading, use the directory path
#             model_dir = os.path.dirname(model_path) if os.path.isfile(model_path) else model_path
            
#             self.model = AutoModelForQuestionAnswering.from_pretrained(model_dir)
#             self.tokenizer = AutoModelForQuestionAnswering.from_pretrained(model_dir)
            
#             # Move model to appropriate device
#             self.model = self.model.to(self.device)
            
#             log.info(f" model loaded: {type(self.model).__name__}")
#         except Exception as e:
#             log.error(f"Failed to load  model: {e}")
        
        
#     async def genarate(self, query):
#         try:
#             if not self.model or self.tokenizer:
#                 self._init_model()
            
#             # Prepare inputs and generate text
#             inputs = tokenizer(query, return_tensors="pt").to(model.device)
#             outputs = model.generate(**inputs, MODEL_CONFIG["MAX_NEW_TOKENS"])
#             result = tokenizer.decode(outputs[0], skip_special_tokens=True)
#             return responses_handler.handle_response(response=result)
#         except Exception as e:
#             return responses_handler.handle_exception(exception=f"Error in generate text: {str(e)}")