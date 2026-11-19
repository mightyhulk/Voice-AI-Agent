"""
FastAPI Backend Application for Rahul Raj Voice Bot
"""

import os
import io
import logging
from typing import List, Dict, Optional, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from pydantic import BaseModel

from app.persona import RAHUL_PROFILE, CORE_ANSWERS
from app.llm_service import generate_llm_response, clean_for_speech
from app.tts_service import synthesize_speech_bytes, synthesize_speech_base64, VOICE_OPTIONS, DEFAULT_VOICE

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Rahul Raj Voice Bot API",
    description="Interactive voice avatar answering interview and technical questions as Rahul Raj",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class MessageTurn(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[MessageTurn]] = None
    mode: Optional[str] = None  # 'voice' or 'text'
    voice_mode: Optional[bool] = None
    voice: Optional[str] = DEFAULT_VOICE
    rate: Optional[str] = "+0%"

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = DEFAULT_VOICE
    rate: Optional[str] = "+0%"

# API Routes
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "app": "Rahul Raj Voice Bot",
        "version": "1.0.0",
        "voices_count": len(VOICE_OPTIONS)
    }

@app.get("/api/profile")
async def get_profile():
    return {
        "profile": RAHUL_PROFILE,
        "voices": VOICE_OPTIONS,
        "default_voice": DEFAULT_VOICE
    }

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    history_dicts = [{"role": m.role, "content": m.content} for m in req.history] if req.history else []
    
    # Determine mode: voice vs text
    if req.voice_mode is not None:
        is_voice = req.voice_mode
    elif req.mode is not None:
        is_voice = (req.mode == "voice")
    else:
        is_voice = True
    interaction_mode = "voice" if is_voice else "text"

    # Generate LLM response as Rahul Raj & general assistant
    llm_result = generate_llm_response(req.message, history_dicts, mode=interaction_mode)
    reply_text = llm_result["text"]
    
    response_payload = {
        "reply": reply_text,
        "mode": interaction_mode,
        "provider": llm_result["provider"],
        "source": llm_result["source"],
        "audio_base64": None,
        "voice": req.voice or DEFAULT_VOICE
    }
    
    # Generate audio ONLY if voice mode was requested
    if is_voice:
        clean_text = clean_for_speech(reply_text)
        tts_res = await synthesize_speech_base64(clean_text, req.voice, req.rate or "+0%")
        if tts_res.get("audio_base64"):
            response_payload["audio_base64"] = tts_res["audio_base64"]
            
    return response_payload

@app.post("/api/tts")
async def tts_endpoint(req: TTSRequest):
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    clean_text = clean_for_speech(req.text)
    mp3_bytes = await synthesize_speech_bytes(clean_text, req.voice, req.rate or "+0%")
    
    return Response(
        content=mp3_bytes,
        media_type="audio/mp3",
        headers={"Content-Disposition": "inline; filename=speech.mp3"}
    )

# Static files and Single Page App (React) routing
STATIC_DIR = Path(__file__).parent / "static"

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Check if the requested file exists in static folder
    file_path = STATIC_DIR / full_path
    if full_path and file_path.is_file():
        return FileResponse(file_path)
    
    # Fallback to index.html for SPA routes
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
        
    return JSONResponse(
        {"message": "Rahul Raj Voice Bot API is running. Build frontend into app/static to view web UI."},
        status_code=200
    )

