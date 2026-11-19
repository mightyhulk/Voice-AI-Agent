import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Volume2, Square, Copy, Check, Mic, Keyboard } from 'lucide-react';

function BotMessage({ msg, speaking, onSpeak, onStop }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="msg">
      <div className="msg-meta">Rahul</div>
      <div className="bot-text"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
      <div className="msg-actions">
        {speaking ? (
          <button className="icon-btn" onClick={onStop}><Square size={13} /> Stop</button>
        ) : (
          <button className="icon-btn" onClick={onSpeak}><Volume2 size={13} /> Listen</button>
        )}
        <button className="icon-btn" onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function MessageList({ messages, loading, speakingIndex, onSpeak, onStop }) {
  return (
    <>
      {messages.map((m, i) =>
        m.role === 'user' ? (
          <div key={i} className="msg user">
            <div className="msg-meta">
              {m.mode === 'voice' ? <Mic size={12} /> : <Keyboard size={12} />}
              {m.mode === 'voice' ? 'Voice' : 'Text'}
            </div>
            <div className="user-text">{m.content}</div>
          </div>
        ) : (
          <BotMessage
            key={i}
            msg={m}
            speaking={speakingIndex === i}
            onSpeak={() => onSpeak(m, i)}
            onStop={onStop}
          />
        )
      )}
      {loading && (
        <div className="msg">
          <div className="msg-meta">Rahul</div>
          <div className="thinking" aria-label="Thinking"><span /><span /><span /></div>
        </div>
      )}
    </>
  );
}

