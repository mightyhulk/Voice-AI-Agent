---
title: Rahul Raj - AI Voice Avatar
emoji: 🎙️
colorFrom: indigo
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# 🎙️ Rahul Raj — AI Voice Avatar

An interactive, high-fidelity AI Voice Avatar that speaks, listens, and responds authentically as **Rahul Raj** (AI Engineer | Generative AI & Agentic Systems).

Live Deployed Web App: **[https://rahulraj56-rahul-voice-bot.hf.space](https://rahulraj56-rahul-voice-bot.hf.space)**  
Hugging Face Space: **[https://huggingface.co/spaces/rahulraj56/rahul-voice-bot](https://huggingface.co/spaces/rahulraj56/rahul-voice-bot)**

---

## 🌟 Key Features

1. **Natural Voice-to-Voice Interaction**:
   - **Speech-to-Text (Voice In)**: Real-time browser speech recognition via native Web Speech API with zero latency and high accuracy.
   - **Text-to-Speech (Voice Out)**: High-fidelity Microsoft Edge Neural Voice (`en-IN-PrabhatNeural` for Rahul's natural voice, plus US and UK accents) with animated audio waveform visualizers.
   - **Browser Voice Fallback**: Embedded Web Speech Synthesis fallback ensuring speech plays in any environment.

2. **Authentic Candidate Persona**:
   - Accurately captures Rahul's background as an **IIT Dharwad** Computer Science graduate and **Infosys** AI Engineer.
   - Pre-configured, verified answers for the 5 core interview questions plus dynamic generation for arbitrary technical, project, or general queries.
   - Resilient multi-turn conversation memory.

3. **1-Click Interview Question Chips**:
   - Immediate one-tap access to the 5 evaluation questions:
     1. *What should we know about your life story in a few sentences?*
     2. *What's your #1 superpower?*
     3. *What are the top 3 areas you'd like to grow in?*
     4. *What misconception do your coworkers have about you?*
     5. *How do you push your boundaries and limits?*

4. **Zero-Friction Access**:
   - **No login, no coding knowledge, and no API key required** from users.
   - Responsive UI that works across desktop and mobile browsers.
   - Fallback text chat input for quiet environments.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Lucide Icons | Responsive glassmorphism interface, Web Speech API hook, real-time waveform visualizer |
| **Backend** | Python 3.12, FastAPI, Uvicorn | Async REST endpoints, audio streaming, dialogue state management |
| **Intelligence / LLM** | Google Gemini 2.5 Flash / 2.0 Flash (Free API) | Concise, voice-ready first-person response generation |
| **Voice Synthesis (TTS)** | `edge-tts` (Neural Voices) | Generates crisp, realistic speech streaming with zero API key cost |
| **Deployment** | Hugging Face Spaces (Docker) | Free, 24/7 HTTPS cloud hosting |

---

## 💬 The 5 Core Interview Answers

### 1. Life Story
> "I'm an AI Engineer and Computer Science graduate from IIT Dharwad. Over the past couple of years at Infosys and startup environments, I've specialized in architecting and deploying production-grade generative AI and agentic systems for global giants like British Petroleum and Danske Bank. My journey is driven by a deep conviction to turn cutting-edge model research into dependable, real-world autonomous software."

### 2. #1 Superpower
> "My number one superpower is execution velocity in transforming novel AI paradigms into robust production systems. Whether it is orchestrating multi-agent workflows with LangGraph, wiring MCP tools, or fine-tuning 8B models on tight compute, I can rapidly build, test, and ship end-to-end architectures that perform reliably under strict enterprise constraints."

### 3. Top 3 Growth Areas
> "The top three areas I am focused on growing in are: first, scaling distributed multi-agent swarm architectures with asynchronous self-healing coordination; second, mastering frontier model post-training and alignment, especially Direct Preference Optimization and RLHF; and third, advancing strategic product leadership to bridge raw AI capabilities directly into high-leverage business value."

### 4. Coworker Misconception
> "Because I am often immersed in low-level microservices, fine-tuning scripts, and vector pipelines, coworkers sometimes assume I am purely a backend systems engineer. In reality, I care intensely about user experience, product ergonomics, and ensuring that complex AI feels intuitive, delightful, and human to interact with."

### 5. Pushing Boundaries and Limits
> "I push my boundaries by actively embracing uncharted territory where standard playbooks do not exist. That means building production agentic systems for enterprise clients before industry best practices were established, fine-tuning large language models under strict 4-bit memory constraints, and shipping working prototypes within hours of a new framework or model drop."

---

## 🚀 Local Development Setup

### 1. Clone & Environment
```bash
git clone <repo-url>
cd 10000xyz
```

### 2. Backend Setup
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 3. Frontend Build
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
Open [http://localhost:8000](http://localhost:8000) to use the voice bot.

---

## 🧪 Testing

Run the full end-to-end test suite:
```bash
pytest tests/test_e2e.py -v
```
All 14 tests cover health checks, profile information, all 5 core questions, dynamic query generation, prompt injection resistance, empty input handling, voice disable toggle, and static asset delivery.

