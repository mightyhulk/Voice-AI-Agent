/**
 * Rahul Raj - Client-Side Persona Engine & Fallback Responder
 * Ensures 100% uptime and instant voice responses in any hosted environment.
 */

export const RAHUL_PROFILE = {
  name: "Rahul Raj",
  title: "AI Engineer | Generative AI & Agentic Systems",
  education: "B.Tech in Computer Science and Engineering, IIT Dharwad (2020 - 2024)",
  email: "rahul@gainr.ai",
  location: "Bengaluru, India",
  certifications: [
    "Microsoft Certified: Azure AI Engineer Associate",
    "Microsoft Certified: Azure AI Fundamentals"
  ]
};

export const CORE_ANSWERS = {
  life_story: (
    "I'm an AI Engineer and Computer Science graduate from IIT Dharwad. " +
    "Over the past couple of years at Infosys and startup environments, I've specialized in " +
    "architecting and deploying production-grade generative AI and agentic systems for global giants like British Petroleum and Danske Bank. " +
    "My journey is driven by a deep conviction to turn cutting-edge model research into dependable, real-world autonomous software."
  ),
  superpower: (
    "My number one superpower is execution velocity in transforming novel AI paradigms into robust production systems. " +
    "Whether it is orchestrating multi-agent workflows with LangGraph, wiring MCP tools, or fine-tuning 8B models on tight compute, " +
    "I can rapidly build, test, and ship end-to-end architectures that perform reliably under strict enterprise constraints."
  ),
  growth_areas: (
    "The top three areas I am focused on growing in are: " +
    "first, scaling distributed multi-agent swarm architectures with asynchronous self-healing coordination; " +
    "second, mastering frontier model post-training and alignment, especially Direct Preference Optimization and RLHF; " +
    "and third, advancing strategic product leadership to bridge raw AI capabilities directly into high-leverage business value."
  ),
  misconception: (
    "Because I am often immersed in low-level microservices, fine-tuning scripts, and vector pipelines, " +
    "coworkers sometimes assume I am purely a backend systems engineer. " +
    "In reality, I care intensely about user experience, product ergonomics, and ensuring that complex AI feels intuitive, delightful, and human to interact with."
  ),
  push_boundaries: (
    "I push my boundaries by actively embracing uncharted territory where standard playbooks do not exist. " +
    "That means building production agentic systems for enterprise clients before industry best practices were established, " +
    "fine-tuning large language models under strict 4-bit memory constraints, and shipping working prototypes within hours of a new framework or model drop."
  ),
  bp_project: (
    "For British Petroleum, I architected a production agentic AI system for their global LNG platform. " +
    "It tracked 45 disparate microservices, automated complex vessel configurations, and used vector-based RAG " +
    "to resolve operational anomalies against historical incidents in real time."
  ),
  danske_bank: (
    "For Danske Bank, I built an enterprise semantic search engine that reduced manual query resolution by 45 percent, " +
    "alongside an AI automation pipeline that generates compliant, localized HTML forms from natural language specifications."
  ),
  tech_stack: (
    "My primary stack centers on Python, FastAPI, and React, coupled with LangChain, LangGraph, and Model Context Protocol. " +
    "On the model side, I work extensively with Gemini 2.5 Flash, Claude, Llama 3.1, and open-source models using QLoRA and Unsloth."
  )
};

export function getClientPersonaResponse(query) {
  const q = (query || "").toLowerCase().trim();

  // Core 5 Questions
  if (q.includes("life story") || q.includes("about your life") || q.includes("who are you") || q.includes("tell me about yourself") || q.includes("your background") || q.includes("introduce yourself")) {
    return CORE_ANSWERS.life_story;
  }
  if (q.includes("superpower") || q.includes("super power") || q.includes("#1 superpower") || q.includes("greatest strength") || q.includes("biggest strength")) {
    return CORE_ANSWERS.superpower;
  }
  if (q.includes("grow in") || q.includes("growth areas") || q.includes("areas you'd like to grow") || q.includes("areas to grow") || q.includes("weakness") || q.includes("areas of improvement")) {
    return CORE_ANSWERS.growth_areas;
  }
  if (q.includes("misconception") || q.includes("coworkers think") || q.includes("colleagues think") || q.includes("coworkers have") || q.includes("colleagues have")) {
    return CORE_ANSWERS.misconception;
  }
  if (q.includes("boundaries and limits") || q.includes("push your boundaries") || q.includes("push your limits") || q.includes("push boundaries") || q.includes("challenge yourself")) {
    return CORE_ANSWERS.push_boundaries;
  }

  // Projects & Tech
  if (q.includes("british petroleum") || q.includes("bp") || q.includes("lng") || q.includes("vessel")) {
    return CORE_ANSWERS.bp_project;
  }
  if (q.includes("danske") || q.includes("danske bank") || q.includes("form generator") || q.includes("search platform")) {
    return CORE_ANSWERS.danske_bank;
  }
  if (q.includes("tech stack") || q.includes("technologies") || q.includes("tools you use") || q.includes("framework")) {
    return CORE_ANSWERS.tech_stack;
  }
  if (q.includes("hire") || q.includes("why you") || q.includes("fit for")) {
    return (
      "I bring a proven track record of shipping production-grade agentic AI systems for global enterprises like BP, " +
      "combined with a startup founder mindset from my time as CTO. I bridge low-level model mechanics and high-velocity product execution."
    );
  }

  // Generic fallback (AI service temporarily unreachable)
  return "I'm having trouble reaching my knowledge service right now, so I can't answer that one properly. Please try again in a moment. In the meantime, I can answer questions about my life story, superpower, growth areas, or my work at BP and Danske Bank.";
}
