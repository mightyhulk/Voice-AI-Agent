import React from 'react';
import { Mic, ArrowUp, X, Square } from 'lucide-react';

export default function Composer({
  value, onChange, onSend, loading,
  listening, transcript, onMic, onCancelMic, onSendVoice,
  speaking, onStopSpeaking, micSupported, error,
}) {
  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  return (
    <div className="composer-wrap">
      <div className={`composer ${listening ? 'recording' : ''}`}>
        {listening ? (
          <>
            <div className="live">
              <span className="dot live" />
              <span className={`live-text ${transcript ? '' : 'hint'}`}>
                {transcript || 'Listening… speak your question'}
              </span>
            </div>
            <button className="round" onClick={onCancelMic} aria-label="Cancel"><X size={18} /></button>
            <button className="round primary" onClick={onSendVoice} disabled={!transcript} aria-label="Send voice question">
              <ArrowUp size={18} />
            </button>
          </>
        ) : (
          <>
            <input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask a question…"
              aria-label="Your question"
              disabled={loading}
            />
            {speaking && (
              <button className="round" onClick={onStopSpeaking} aria-label="Stop speaking"><Square size={14} /></button>
            )}
            <button
              className="round"
              onClick={onMic}
              disabled={loading || !micSupported}
              aria-label="Ask by voice"
              title={micSupported ? 'Ask by voice' : 'Voice input is not supported in this browser'}
            >
              <Mic size={18} />
            </button>
            <button className="round primary" onClick={onSend} disabled={loading || !value.trim()} aria-label="Send">
              <ArrowUp size={18} />
            </button>
          </>
        )}
      </div>
      {error && <div className="notice" role="alert">{error}</div>}
      {!micSupported && !error && (
        <div className="notice">Voice input needs Chrome, Edge or Safari. You can still type.</div>
      )}
      <div className="footnote">Voice questions get spoken answers. Typed questions get written answers.</div>
    </div>
  );
}
