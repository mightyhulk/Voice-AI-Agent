"""
TTS Service using Microsoft Edge Neural Voices via edge-tts.
Generates human-like speech streaming and base64 audio.
"""

import io
import base64
import logging
import asyncio
import edge_tts
from typing import Optional, Dict

logger = logging.getLogger(__name__)

# Available voice options
VOICE_OPTIONS = {
    "en-IN-PrabhatNeural": "Rahul Raj (Natural Indian English - Default)",
    "en-US-ChristopherNeural": "Christopher (US English - Crisp)",
    "en-US-GuyNeural": "Guy (US English - Expressive)",
    "en-GB-RyanNeural": "Ryan (British English - Formal)",
}

DEFAULT_VOICE = "en-IN-PrabhatNeural"

async def synthesize_speech_bytes(text: str, voice: Optional[str] = None, rate: str = "+0%") -> bytes:
    """
    Synthesizes speech using edge-tts and returns raw MP3 bytes.
    """
    selected_voice = voice if voice in VOICE_OPTIONS else DEFAULT_VOICE
    communicate = edge_tts.Communicate(text, selected_voice, rate=rate)
    
    mp3_buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            mp3_buffer.write(chunk["data"])
            
    mp3_bytes = mp3_buffer.getvalue()
    return mp3_bytes


async def synthesize_speech_base64(text: str, voice: Optional[str] = None, rate: str = "+0%") -> Dict[str, str]:
    """
    Synthesizes speech and returns base64 encoded audio with MIME type.
    """
    try:
        mp3_bytes = await synthesize_speech_bytes(text, voice, rate)
        b64_audio = base64.b64encode(mp3_bytes).decode("utf-8")
        return {
            "mime_type": "audio/mp3",
            "audio_base64": b64_audio,
            "voice": voice or DEFAULT_VOICE
        }
    except Exception as e:
        logger.error(f"TTS Synthesis error: {e}")
        return {
            "error": str(e),
            "audio_base64": None
        }

