import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app_handler import AppHandler
from log_handler import LogHandler  # Fixed import statement


# Initialize logger first
log = LogHandler()

# Initialize FastAPI app
app = FastAPI(
    title="Bio Intelligence API",
    description="API for bio intelligence text generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize application handler after logger
app_handler = AppHandler()

# Request models
class GenerateTextRequest(BaseModel):
    query: str
    token: Optional[str]

# Wrapper model for the "data" field
class InferenceRequest(BaseModel):
    data: GenerateTextRequest


@app.post("/intelligence/inference")
async def generate_text(request: InferenceRequest):
    """Generate text based on the provided query"""
    if not request.data.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    return await app_handler.generate_text(request.data.query)


# Run server
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8003))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
