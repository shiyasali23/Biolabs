from fastapi.responses import JSONResponse
from log_handler import LogHandler

log = LogHandler()

class ResponseHandler:
    MESSAGES = {
        "INTERNAL_SERVER_ERROR": "An internal server error occurred.",
        "UNEXPECTED_ERROR": "An unexpected error occurred.",
        "REQUEST_FAILED": "Requested operation failed.",
        "GENERATION_SUCCESS": "Text generation successful.",
        "PREDICTION_SUCCESS": "Prediction successful.",
        "NO_DETECTION": "Nothing could be detected.",
        "NO_IMAGE": "No image provided.",
        "NO_QUERY": "No text query provided.",
        "INVALID_TOKEN": "Invalid or missing authentication token.",
        "TOKEN_EXPIRED": "Authentication token has expired.",
        "RATE_LIMIT_EXCEEDED": "Rate limit has been exceeded.",
        "CONTENT_POLICY_VIOLATION": "Content violates usage policies.",
        "CONTEXT_LENGTH_EXCEEDED": "Input context length exceeds model limits.",
        "NOT_RELEVANT": "Query is not relevant.",
                   
        
    }

    def handle_response(self, status_code=200, message=None, error=None, response=None) -> JSONResponse:
        """Handle successful API responses"""
        message = message or self.MESSAGES.get("GENERATION_SUCCESS")
        return JSONResponse(
            content={  
                "response": response,
                "message": message,
                "error": error,
                "status": status_code,
            },
            status_code=status_code  
        )

    def handle_exception(self, exception=None, status_code=500, error=None, message=None) -> JSONResponse:
        """Handle API exceptions"""
        message = message or self.MESSAGES.get("UNEXPECTED_ERROR")
        error = error or self.MESSAGES.get("INTERNAL_SERVER_ERROR")
        if exception:
            log.error(f"{exception}")
        return self.handle_response(status_code=status_code, error=error, message=message)
