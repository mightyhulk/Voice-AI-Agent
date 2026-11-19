import React, { useState, useCallback, useRef, useEffect } from 'react';
import Header from './components/Header';
import EmptyState from './components/EmptyState';
import MessageList from './components/MessageList';
import Composer from './components/Composer';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { askGemini } from './utils/geminiClient';
import { getClientPersonaResponse } from './utils/personaEngine';

const IS_STATIC_HOST = typeof window !== 'undefined' && window.location.hostname.endsWith('.static.hf.space');
const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  const scrollRef = useRef(null);
  const sendRef = useRef(null);
  const backendAvailableRef = useRef(!IS_STATIC_HOST || Boolean(API_BASE));
  const messagesRef = useRef([]);
  messagesRef.current = messages;

  const { isPlaying, play, stop, playBrowserSpeech } = useAudioPlayer();

  const onSpeech = useCallback((text) => {
    if (text?.trim() && sendRef.current) sendRef.current(text.trim(), 'voice');
  }, []);

  const {
    isListening, transcript, error: micError, isSupported,
    toggleListening, stopListening, cancelListening,
  } = useSpeechRecognition({ onResult: onSpeech });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const resetChat = () => {
    stop();
    cancelListening();
    setMessages([]);
    setInput('');
    setPlayingIndex(null);
  };

  const send = async (text, mode = 'text') => {
    const query = (text ?? '').trim();
    if (!query || loading) return;

    stop();
    cancelListening();
    const priorHistory = messagesRef.current;
    const nextHistory = [...priorHistory, { role: 'user', content: query, mode }];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    let reply = '';
    let audio = null;
    try {
      // Try the FastAPI backend when available; otherwise call Gemini directly
      let usedBackend = false;
      if (backendAvailableRef.current) {
        try {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 2500);
          const res = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ctrl.signal,
            body: JSON.stringify({
              message: query,
              history: priorHistory.map(({ role, content }) => ({ role, content })),
              mode,
            }),
          });
          clearTimeout(t);
          if (!res.ok) {
            if (res.status === 404) backendAvailableRef.current = false;
            throw new Error('backend unavailable');
          }
          const data = await res.json();
          reply = data.reply;
          audio = data.audio_base64;
          usedBackend = true;
        } catch {
          usedBackend = false;
        }
      }

      if (!usedBackend) {
        try {
          reply = await askGemini(query, priorHistory, mode);
        } catch {
          reply = getClientPersonaResponse(query);
        }
      }

      const index = nextHistory.length;
      setMessages([...nextHistory, { role: 'assistant', content: reply, mode, audio }]);

      // Voice question -> spoken answer. Text question -> written answer only.
      if (mode === 'voice') {
        setPlayingIndex(index);
        audio ? play(audio, reply) : playBrowserSpeech(reply);
      }
    } finally {
      setLoading(false);
    }
  };
  sendRef.current = send;

  const speak = async (msg, index) => {
    setPlayingIndex(index);
    if (msg.audio) {
      play(msg.audio, msg.content);
      return;
    }
    if (backendAvailableRef.current) {
      try {
        const res = await fetch(`${API_BASE}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: msg.content }),
        });
        if (!res.ok) throw new Error('tts unavailable');
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const b64 = String(reader.result || '').split(',')[1];
          if (b64) {
            setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, audio: b64 } : m)));
            play(b64, msg.content);
          } else {
            playBrowserSpeech(msg.content);
          }
        };
        reader.readAsDataURL(blob);
        return;
      } catch {
        // fall through to browser speech
      }
    }
    playBrowserSpeech(msg.content);
  };

  const state = isListening ? 'listening' : isPlaying ? 'speaking' : loading ? 'thinking' : 'ready';
  const busy = loading;

  return (
    <div className="app">
      <Header state={state} hasMessages={messages.length > 0} onReset={resetChat} />
      <main className="scroll" ref={scrollRef}>
        {messages.length === 0 && !loading ? (
          <EmptyState onPick={(q) => send(q, 'text')} disabled={busy} />
        ) : (
          <MessageList
            messages={messages}
            loading={loading}
            speakingIndex={isPlaying ? playingIndex : null}
            onSpeak={speak}
            onStop={stop}
          />
        )}
      </main>
      <Composer
        value={input}
        onChange={setInput}
        onSend={() => send(input, 'text')}
        loading={busy}
        listening={isListening}
        transcript={transcript}
        onMic={toggleListening}
        onCancelMic={cancelListening}
        onSendVoice={stopListening}
        speaking={isPlaying}
        onStopSpeaking={stop}
        micSupported={isSupported}
        error={micError}
      />
    </div>
  );
}
