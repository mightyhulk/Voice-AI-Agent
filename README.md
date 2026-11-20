# Rahul Raj — AI Voice Assistant

An interactive voice and text AI assistant built with **Python (FastAPI)** and **React (Vite)** that answers interview and personal questions as **Rahul Raj** (AI Engineer · IIT Dharwad · Infosys) as well as open-domain questions across science, coding, math, and general knowledge.

- **Live Deployed Web App**: [https://voice-ai-agent-eta.vercel.app/](https://voice-ai-agent-eta.vercel.app/)
- **GitHub Repository**: [https://github.com/mightyhulk/Voice-AI-Agent](https://github.com/mightyhulk/Voice-AI-Agent)

---

## Key Features

1. **Mode Symmetry (Voice In → Voice Out, Text In → Text Out)**
   - **Voice Mode**: Tap the microphone and speak (Web Speech API with silence auto-submit and live transcript). The backend generates a concise conversational reply and speaks it aloud using Microsoft Edge neural TTS (`en-IN-PrabhatNeural` via `edge-tts`), with browser SpeechSynthesis fallback.
   - **Text Mode**: Type a question or click a suggested prompt to receive a formatted Markdown response (with code blocks, `Listen`, and `Copy` actions) without auto-playing audio.

2. **Authentic Persona + General Knowledge**
   - Answers personal and interview questions in first person as Rahul Raj (IIT Dharwad, Infosys — BP LNG & Danske Bank, projects, growth areas, and engineering philosophy).
   - Answers any general-knowledge, coding, math, or world question directly without forcing personal context, and stays in role against prompt-injection attempts.

3. **Zero-Friction Access for Non-Technical Users**
   - No login, no installation, and **no API key required** from the user.
   - The `GOOGLE_API_KEY` is stored server-side in Vercel Environment Variables and never exposed in the client JavaScript bundle.

---

## Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, `react-markdown`, Lucide Icons | Minimal single-column chat UI, Web Speech API hook, audio playback |
| **Backend** | Python 3.12, FastAPI, Uvicorn | Async REST API (`/api/chat`, `/api/tts`, `/api/health`, `/api/profile`) |
| **LLM** | Google Gemini API (`gemini-3.1-flash-lite` + fallback chain) | Server-side conversational & open-domain generation |
| **Voice Synthesis (TTS)** | `edge-tts` (`en-IN-PrabhatNeural`) | Neural MP3 speech synthesis streamed as base64 / audio |
| **Deployment** | Vercel (Static CDN + Python Serverless Functions) | Global CDN for React UI and serverless `/api/*` via `vercel.json` |

---

## Example Interview Questions Included on Home Screen

1. *What should we know about your life story in a few sentences?*
2. *What's your #1 superpower?*
3. *What are the top 3 areas you'd like to grow in?*
4. *What misconception do your coworkers have about you?*
5. *How do you push your boundaries and limits?*

*(Plus general-knowledge starter prompts and free-form voice or text questions.)*

---

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mightyhulk/Voice-AI-Agent.git
cd Voice-AI-Agent
```

### 2. Backend Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

Create `backend/.env` with your Gemini API key:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 3. Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

### 4. Run Server
```bash
export PYTHONPATH=backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## Testing

### Backend & Integration Suite (14 tests)
```bash
pytest tests/test_e2e.py -v
```
Covers `/api/health`, `/api/profile`, all 5 core interview questions, dynamic LLM responses, empty-input validation (`400`), prompt-injection handling, `voice_mode=False`, `/api/tts` MP3 streaming, and static asset serving.

### Live Deployment & Voice Flow Tests
```bash
node tests/test_vercel_live.js
node tests/test_mic_mock.js
```
Verifies live responses on `https://voice-ai-agent-eta.vercel.app/`, zero console errors, no exposed API key in client JS, `New chat` reset, and mocked SpeechRecognition voice-in/voice-out flow.
