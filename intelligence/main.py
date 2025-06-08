# main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from database_handler import DatabaseHandler
from log_handler import LogHandler
from responses_handler import ResponseHandler

app = FastAPI(
    title="Bio Intelligence API",
    description="API for bio intelligence text generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

database_handler = DatabaseHandler()
log = LogHandler()
response_handler = ResponseHandler()

class GenerateTextRequest(BaseModel):
    text: str
    token: Optional[str] = None
    files: Optional[list[str]] = None
    biometrics: Optional[dict] = None

class InferenceRequest(BaseModel):
    data: GenerateTextRequest

@app.post("/intelligence/inference")
async def get_generate_text(request: InferenceRequest):
    """Async endpoint - properly handles async operations"""
    log.info(f"Received request for text generation: {request.data}")
    try:
        return await database_handler.generate_text(
            query=request.data.text,
            token=request.data.token,
            files=request.data.files,
            biometrics=request.data.biometrics
        )
    except Exception as e:
        return response_handler.handle_exception(
            exception=f"Error in get generating text: {str(e)}"
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Simple health check"""
    return {"status": "healthy", "message": "API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8003))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)