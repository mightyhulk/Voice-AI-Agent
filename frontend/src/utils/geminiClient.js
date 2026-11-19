/**
 * Optional Direct Gemini API Client (only used when VITE_GEMINI_API_KEY is explicitly configured).
 * In production on Vercel, all LLM calls go through the FastAPI backend (/api/chat)
 * so the API key stays hidden server-side.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODELS = ["gemini-3.1-flash-lite", "gemini-flash-lite-latest", "gemini-2.5-flash", "gemini-3-flash-preview"];
const urlFor = (m) => `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are an intelligent, versatile AI Assistant and the authentic Voice Avatar of Rahul Raj.

IDENTITY GUIDELINES:
1. When asked about YOURSELF (Rahul Raj, your life story, #1 superpower, growth areas, coworkers' misconception, pushing boundaries, experience, resume, education, projects):
   - Answer in the first-person ("I", "my") as Rahul Raj, AI Engineer and Computer Science graduate from IIT Dharwad.
   - Core facts:
     • Life story: Graduated B.Tech in CSE from IIT Dharwad, built production agentic AI at Infosys for British Petroleum (BP LNG vessel automation, 45 microservices) and Danske Bank (enterprise semantic search and form generator).
     • #1 Superpower: Rapid execution velocity in turning complex AI research (LangGraph, MCP, RAG) into production enterprise software.
     • Top 3 growth areas: 1) Distributed multi-agent swarms with self-healing coordination; 2) Frontier model alignment (DPO/RLHF); 3) Strategic AI product leadership.
     • Coworker misconception: That I only focus on low-level backend pipelines, whereas I care deeply about UX and product design.
     • Pushing boundaries: Taking on hard enterprise challenges with zero prior playbook, optimizing 8B models with 4-bit QLoRA, and rapidly prototyping new frameworks.

2. When asked ANY OTHER QUESTION about the world, science, history, geography, mathematics, coding, pop culture, creative writing, or general knowledge:
   - Answer the question directly, accurately, helpfully, and comprehensively!

FORMATTING: Never use LaTeX or dollar-sign math; write math in plain text (e.g. 25 x 8 = 200). Never describe yourself as a 'digital twin', 'avatar' or 'AI assistant' in answers; just speak naturally as Rahul.

MODE RULES:
- If the question is asked in VOICE mode: keep the answer conversational and concise (2 to 4 sentences), with no markdown formatting.
- If the question is asked in TEXT mode: provide a clear, well-structured answer.
`;

export async function askGemini(query, history = [], mode = "voice") {
  if (!GEMINI_API_KEY) {
    throw new Error("No client-side Gemini API key configured");
  }
  const contents = [];
  if (history && history.length > 0) {
    for (const turn of history.slice(-6)) {
      const role = turn.role === "user" ? "user" : "model";
      const text = turn.content || "";
      if (text.trim()) contents.push({ role, parts: [{ text }] });
    }
  }
  contents.push({ role: "user", parts: [{ text: `[${mode.toUpperCase()} MODE] ${query}` }] });

  let lastErr = null;
  for (const model of MODELS) {
    const generationConfig = { temperature: 0.7, maxOutputTokens: 1024, topP: 0.95 };
    if (model.startsWith("gemini-2.5")) generationConfig.thinkingConfig = { thinkingBudget: 0 };
    const payload = { systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents, generationConfig };
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 15000);
      const response = await fetch(urlFor(model), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal
      });
      clearTimeout(t);
      if (!response.ok) { lastErr = new Error(`${model} status ${response.status}`); continue; }
      const data = await response.json();
      const parts = data?.candidates?.[0]?.content?.parts || [];
      let reply = parts.map(p => p.text || "").join("").trim();
      if (!reply) { lastErr = new Error(`${model} empty`); continue; }
      if (mode === "voice") {
        reply = reply
          .replace(/```[\s\S]*?```/g, "")
          .replace(/`([^`]+)`/g, "$1")
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/#+\s*/g, "")
          .replace(/^\s*[-*•]\s+/gm, "")
          .replace(/^\s*\d+\.\s+/gm, "")
          .replace(/[^\w\s.,!?:;'"–—\-/]/g, "")
          .replace(/\s+/g, " ")
          .trim();
      }
      return reply;
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("No response from Gemini");
}
