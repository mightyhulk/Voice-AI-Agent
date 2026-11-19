import React from 'react';

const ABOUT = [
  "What should we know about your life story in a few sentences?",
  "What's your #1 superpower?",
  "What are the top 3 areas you'd like to grow in?",
  "What misconception do your coworkers have about you?",
  "How do you push your boundaries and limits?",
];
const GENERAL = [
  "Explain how a transformer model works",
  "Why is the sky blue?",
  "Write a Python function for binary search",
];

function Group({ label, items, onPick, disabled }) {
  return (
    <div className="suggest-group">
      <div className="suggest-label">{label}</div>
      <div className="suggest-list">
        {items.map((q) => (
          <button key={q} className="suggest" disabled={disabled} onClick={() => onPick(q)}>{q}</button>
        ))}
      </div>
    </div>
  );
}

export default function EmptyState({ onPick, disabled }) {
  return (
    <div className="empty">
      <h1>Ask me anything.</h1>
      <p>
        Speak with the microphone and I'll answer out loud, or type and I'll reply in writing.
        Ask about my background, or about any other topic.
      </p>
      <Group label="About me" items={ABOUT} onPick={onPick} disabled={disabled} />
      <Group label="General knowledge" items={GENERAL} onPick={onPick} disabled={disabled} />
    </div>
  );
}

