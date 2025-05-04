from log_handler import LogHandler
from modal_handler import ModalHandler
from responses_handler import ResponseHandler
import sys
import os

log_handler = LogHandler()
responses_handler = ResponseHandler()
modal_handler = ModalHandler()

class AppHandler:
    def __init__(self):
        """Initialize AppHandler with ModalHandler"""
        self.BACKEND_URL = os.getenv('BACKEND_API_URL', '/backend')
        
        log_handler.log_info("Initializing AppHandler")
        
        # Get model and tokenizer from ModalHandler
        self.model, self.tokenizer = modal_handler.get_model_and_tokenizer()
        
        # Check if model loading was successful
        if not self.model or not self.tokenizer:
            log_handler.log_error("Model initialization failed, will retry later")
            # Don't exit - allow the application to start and try loading later
        else:
            log_handler.log_info("Model initialized successfully")
            
    def raise_critical_error(self, message):
        """Handle critical errors by logging and exiting"""
        log_handler.handle_critical_error(message)
        sys.exit(1)
            
    async def validate_token(self, token):
        """Validate the authentication token"""
        # Placeholder implementation
        return True
    
    async def _get_model_tokenizer(self):
        """Get model and tokenizer, initializing if needed"""
        if not self.model or not self.tokenizer:
            self.model, self.tokenizer = modal_handler.get_model_and_tokenizer()       
        return self.model, self.tokenizer
    
    async def generate_text(self, query):
        """Generate text response for the given query"""
        try:
            # Get or initialize model and tokenizer
            model, tokenizer = await self._get_model_tokenizer()
            
            if not model or not tokenizer:
                log_handler.log_error("Model or tokenizer not available")
                return responses_handler.handle_exception(
                    message="Model not ready", 
                    error="Model initialization is still in progress", 
                    status_code=503
                )
            
            log_handler.log_info(f"Generating text for query: {query[:50]}...")
            
            # Prepare inputs and generate text
            inputs = tokenizer(query, return_tensors="pt").to(model.device)
            outputs = model.generate(**inputs, max_new_tokens=100)
            result = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            log_handler.log_info("Text generation successful")
            return responses_handler.handle_response(response=result)
        except Exception as e:
            log_handler.log_error(f"Error in generate_text: {str(e)}")
            return responses_handler.handle_exception(exception=f"Error in generate text: {str(e)}")