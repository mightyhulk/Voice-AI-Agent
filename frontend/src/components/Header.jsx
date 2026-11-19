import React from 'react';
import { RotateCcw } from 'lucide-react';

export default function Header({ state, hasMessages, onReset }) {
  const label = state === 'listening' ? 'Listening' : state === 'speaking' ? 'Speaking' : state === 'thinking' ? 'Thinking' : 'Ready';
  const cls = state === 'listening' ? 'live' : state === 'speaking' ? 'speak' : '';
  return (
    <header className="header">
      <div className="brand">
        <img src="/avatar.jpg" alt="" />
        <div>
          <div className="brand-name">Rahul Raj</div>
          <div className="brand-sub">AI Engineer · Voice assistant</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {hasMessages && (
          <button className="icon-btn" onClick={onReset} title="Start a new conversation">
            <RotateCcw size={13} /> New chat
          </button>
        )}
        <div className="header-status" role="status" aria-live="polite">
          <span className={`dot ${cls}`} />
          {label}
        </div>
      </div>
    </header>
  );
}
