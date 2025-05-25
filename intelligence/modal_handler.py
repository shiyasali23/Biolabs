import os
import torch
from typing import List, Optional, Dict
from transformers import AutoModelForCausalLM, AutoTokenizer
import asyncio

from log_handler import LogHandler
from bucket_handler import BucketHandler
from responses_handler import ResponseHandler
from config import DIRECTORIES, MODEL_CONFIG

loop = asyncio.get_event_loop()
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
        self.error = "Error in ModalHandler:"
        
        self.model_dir = DIRECTORIES["MODEL_DIR"]
        self.model_local_prefix = MODEL_CONFIG["MODEL"]["LOCAL_PREFIX"]
        self.model_bucket_prefix = MODEL_CONFIG["MODEL"]["BUCKET_PREFIX"]
        self.min_tokens = MODEL_CONFIG["MODEL"]["MIN_TOKENS"]
        self.max_tokens = MODEL_CONFIG["MODEL"]["MAX_TOKENS"]
        self.modal_temperature = MODEL_CONFIG["MODEL"].get("MODAL_TEMPERATURE", 0.7)
        self.modal_top_p = MODEL_CONFIG["MODEL"].get("TOP_P", 0.9)
        self.modal_top_k = MODEL_CONFIG["MODEL"].get("TOP_K", 50)
        self.modal_do_sample = MODEL_CONFIG["MODEL"].get("DO_SAMPLE", True)

        os.makedirs(self.model_dir, exist_ok=True)
        message = "ModalHandler on"
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        log.info(f"{message} {self.device.type.upper()}: {torch.cuda.get_device_name(0) if self.device.type == 'cuda' else ''}")

        self.model = None
        self.tokenizer = None
        self.bucket_handler = BucketHandler()

    def validate_path(self, local_dir: str, local_prefix: str, bucket_prefix: str) -> Optional[str]:
        try:
            if not local_prefix or not bucket_prefix:
                log.error("Missing prefixes for model path")
                return None
            
            local_path = os.path.join(local_dir, local_prefix)
            if os.path.exists(local_path):
                log.info(f"Found locally at {local_path}")
                return local_path

            os.makedirs(local_dir, exist_ok=True)
            if not self.bucket_handler.get_object(prefix=bucket_prefix, local_dir=local_dir):
                log.error(f"Failed to download {local_prefix} from bucket: {bucket_prefix}")
                return None

            return local_path if os.path.exists(local_path) else None
        except Exception as e:
            log.error(f"Error validating path from {local_prefix}: {e}")
            return None

    def _init_model(self):
        try:
            model_path = self.validate_path(self.model_dir, self.model_local_prefix, self.model_bucket_prefix)
            if not model_path:
                log.error("Model initialization failed: path invalid")
                return

            self.model = AutoModelForCausalLM.from_pretrained(model_path).to(self.device)
            self.tokenizer = AutoTokenizer.from_pretrained(model_path)
            self.model.eval()
            log.info(f"LLM loaded successfully at {model_path}")
        except Exception as e:
            log.error(f"{self.error} loading LLM: {e}")

    def _linear_interpolation(self, threshold: float) -> int:
        return int(self.min_tokens + (self.max_tokens - self.min_tokens) * threshold)

    async def generate(
        self,
        query: str,
        document: Optional[List[str]] = None,
        relevant_files: Optional[List[str]] = None,
        threshold: Optional[float] = None,
        token: Optional[str] = None,
        biometrics: Optional[List[Dict]] = None,
        mode: Optional[str] = "sample"
    ):
        try:
            if not self.model or not self.tokenizer:
                self._init_model()
            if not self.model or not self.tokenizer:
                return responses_handler.handle_exception("Failed to initialize model")
            
            prompt = query
            if document:
                context = " ".join(document)
                prompt = f"Context:\n{context}\n\nQuestion: {query}\nAnswer:"
            if biometrics:
                prompt += f"\n\nBiometrics: {biometrics}"
            if relevant_files:
                for file in relevant_files:
                    prompt += f"\n\nFile: {file}"

            inputs = self.tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True).to(self.device)
            max_tokens = self.max_tokens if threshold is None else self._linear_interpolation(threshold)

            def _generate():
                with torch.no_grad():
                    return self.model.generate(
                        inputs.input_ids,
                        max_new_tokens=max_tokens,
                        temperature=self.modal_temperature,
                        do_sample=(mode != "greedy") and self.modal_do_sample,
                        top_p=self.modal_top_p,
                        top_k=self.modal_top_k,
                        pad_token_id=self.tokenizer.eos_token_id
                    )

            outputs = await loop.run_in_executor(None, _generate)
            generated_text = self.tokenizer.decode(outputs[0][inputs.input_ids.shape[1]:], skip_special_tokens=True)

            return responses_handler.handle_response(response=generated_text)
        except Exception as e:
            return responses_handler.handle_exception(f"Error in generate: {e}")
