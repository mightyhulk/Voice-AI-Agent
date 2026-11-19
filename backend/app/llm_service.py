"""
LLM Service for Rahul Raj Voice & General World Knowledge Bot
Integrates Gemini 2.5 Flash / 2.0 Flash with multi-turn memory,
mode-aware output (Voice vs Text), and offline persona fallback.
"""

import os
import re
import json
import logging
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv

from app.persona import SYSTEM_PROMPT, get_deterministic_response, is_about_rahul

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
logger = logging.getLogger(__name__)

# List of candidate API keys to try in order
CANDIDATE_KEYS = []

def load_keys():
    global CANDIDATE_KEYS
    keys = []
    
    # 1. Environment variables
    for env_var in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "gemini_api_2", "gemini_api", "gemini_api_3"]:
        k = os.getenv(env_var)
        if k and k.strip() and k not in keys:
            keys.append(k.strip())
            
    # 2. Local config fallbacks from assignment paths if not set
    fallback_env_paths = [
        "/home/acer/Documents/assignement/clm/clm3/.env",
        "/home/acer/Documents/Projects/ai_studio/.env"
    ]
    for path in fallback_env_paths:
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if "=" in line and not line.startswith("#"):
                            k, v = line.split("=", 1)
                            k, v = k.strip(), v.strip("\"' ")
                            if k in ["GOOGLE_API_KEY", "gemini_api_2", "gemini_api", "gemini_api_3"] and v and v not in keys:
                                keys.append(v)
            except Exception as e:
                logger.warning(f"Error loading keys from {path}: {e}")
                
    CANDIDATE_KEYS = keys

load_keys()


def clean_for_speech(text: str) -> str:
    """Cleans text to sound natural when spoken aloud."""
    if not text:
        return ""
    text = re.sub(r'```[\s\S]*?```', '', text)
    text = re.sub(r'`([^`]+)`', r'\1', text)
    text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    text = re.sub(r'\*([^*]+)\*', r'\1', text)
    text = re.sub(r'#+\s*', '', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'^\s*[-*•]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'[^\w\s.,!?:;\'"–—\-/]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def generate_llm_response(
    message: str,
    history: Optional[List[Dict[str, str]]] = None,
    mode: str = "voice"
) -> Dict[str, Any]:
    """
    Generates a response as Rahul Raj's avatar and general AI assistant.
    Mode can be 'voice' (concise spoken format) or 'text' (detailed formatted response).
    """
    message_clean = message.strip()
    if not message_clean:
        return {
            "text": "Hello! I am ready to answer any questions, whether about my background in AI engineering or anything about the world.",
            "provider": "deterministic",
            "source": "greeting"
        }

    # 1. Exact candidate match for Rahul Raj's core interview questions
    direct_match = get_deterministic_response(message_clean)
    if direct_match:
        final_text = clean_for_speech(direct_match) if mode == "voice" else direct_match
        return {
            "text": final_text,
            "provider": "deterministic-core",
            "source": "verified_candidate_data"
        }

    # 2. Call Gemini API for dynamic generation (both for Rahul questions & general world questions!)
    if not CANDIDATE_KEYS:
        load_keys()

    contents = []
    if history:
        for turn in history[-6:]:
            role = "user" if turn.get("role") in ["user", "human"] else "model"
            content = turn.get("content", "").strip()
            if content:
                contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })
    
    # Prompt prefix informing the model of the interaction mode
    mode_instruction = f"[{mode.upper()} MODE] {message_clean}"
    contents.append({
        "role": "user",
        "parts": [{"text": mode_instruction}]
    })

    models_to_try = [
        "gemini-3.1-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-2.5-flash",
        "gemini-3-flash-preview"
    ]

    for api_key in CANDIDATE_KEYS:
        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            gen_config = {
                "temperature": 0.7,
                "maxOutputTokens": 1024,
                "topP": 0.95,
            }
            if model.startswith("gemini-2.5"):
                gen_config["thinkingConfig"] = {"thinkingBudget": 0}
            payload = {
                "systemInstruction": {
                    "parts": [{"text": SYSTEM_PROMPT}]
                },
                "contents": contents,
                "generationConfig": gen_config
            }
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=9) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            raw_text = parts[0]["text"]
                            # Clean up for voice if voice mode, else keep markdown
                            if mode == "voice":
                                clean_text = clean_for_speech(raw_text)
                            else:
                                clean_text = raw_text.strip()
                            return {
                                "text": clean_text,
                                "provider": f"gemini ({model})",
                                "source": "gemini_api"
                            }
            except urllib.error.HTTPError as e:
                logger.warning(f"Gemini {model} call failed with status {e.code}: {e.reason}")
                continue
            except Exception as e:
                logger.warning(f"Gemini call exception: {e}")
                continue

    # 3. Fallback response generator if API fails
    if is_about_rahul(message_clean):
        fallback_text = (
            "I'm an AI Engineer from IIT Dharwad specializing in Generative AI, LangGraph, and RAG architectures. "
            "At Infosys, I built production agentic platforms for British Petroleum and Danske Bank."
        )
    else:
        fallback_text = (
            f"I understand your question about '{message_clean}'. "
            f"As an AI assistant, I can help answer that or discuss any topics in science, technology, or engineering."
        )
        
    return {
        "text": clean_for_speech(fallback_text) if mode == "voice" else fallback_text,
        "provider": "smart-fallback",
        "source": "persona_knowledge_base"
    }
