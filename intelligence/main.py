from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from app_handler import AppHandler
from log_handler import LogHandler
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize logger first
log_handler = LogHandler()

# Initialize FastAPI app
app = FastAPI(
    title="Bio Intelligence API",
    description="API for bio intelligence text generation",
    version="1.0.0"
)

# Initialize application handler after logger
app_handler = AppHandler()

# Request models
class GenerateTextRequest(BaseModel):
    query: str
    max_tokens: Optional[int] = 100

# Auth dependency
async def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized: Missing token")
    
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
    is_valid = await app_handler.validate_token(token)
    
    if not is_valid:
        raise HTTPException(status_code=401, detail="Unauthorized: Invalid token")
    
    return token

# Routes
@app.get("/")
async def root():
    return {"message": "Bio Intelligence API is running"}

@app.post("/generate")
async def generate_text(request: GenerateTextRequest, token: str = Depends(verify_token)):
    """Generate text based on the provided query"""
    if not request.query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    return await app_handler.generate_text(request.query)

# Startup event
@app.on_event("startup")
async def startup_event():
    log_handler.log_info("Starting Bio Intelligence API")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    log_handler.log_info("Shutting down Bio Intelligence API")

# Run server
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)