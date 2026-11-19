import { useState, useEffect, useRef, useCallback } from 'react';

const SILENCE_MS = 1800;

/**
 * Speech recognition hook.
 * The recognizer is created ONCE; callbacks are read through refs so that
 * re-renders never abort an active session.
 */
export function useSpeechRecognition({ onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const textRef = useRef('');
  const submittedRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const activeRef = useRef(false);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);

  useEffect(() => { onResultRef.current = onResult; }, [onResult]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const clearTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const submit = useCallback(() => {
    clearTimer();
    if (submittedRef.current) return;
    const text = textRef.current.trim();
    if (!text) return;
    submittedRef.current = true;
    activeRef.current = false;
    try { recognitionRef.current?.stop(); } catch (_) {}
    setIsListening(false);
    onResultRef.current?.(text);
  }, []);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setIsSupported(false);
      return;
    }
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => setIsListening(true);

    rec.onresult = (event) => {
      let text = '';
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + ' ';
      }
      text = text.trim();
      textRef.current = text;
      setTranscript(text);
      clearTimer();
      if (text.length > 1) {
        silenceTimerRef.current = setTimeout(submit, SILENCE_MS);
      }
    };

    rec.onerror = (event) => {
      const err = event.error;
      // 'aborted' (we stopped it) and 'no-speech' are benign
      if (err === 'aborted' || err === 'no-speech') return;
      if (err === 'not-allowed' || err === 'service-not-allowed') {
        setError('Microphone permission is blocked. Click the lock icon in the address bar, allow Microphone, then try again.');
      } else if (err === 'audio-capture') {
        setError('No microphone was found. Please connect a microphone and try again.');
      } else if (err === 'network') {
        setError('Speech recognition needs an internet connection (network error). Please try again or type your question.');
      } else {
        setError(`Speech recognition error: ${err}`);
      }
      activeRef.current = false;
      clearTimer();
      setIsListening(false);
      onErrorRef.current?.(err);
    };

    rec.onend = () => {
      clearTimer();
      if (!submittedRef.current && textRef.current.trim()) {
        // Recognizer ended on its own (e.g. browser timeout) with captured text
        submit();
        return;
      }
      if (activeRef.current && !submittedRef.current) {
        // Ended without any speech yet while user still wants to listen: restart
        try { rec.start(); return; } catch (_) {}
      }
      activeRef.current = false;
      setIsListening(false);
    };

    recognitionRef.current = rec;
    return () => {
      activeRef.current = false;
      clearTimer();
      try { rec.onend = null; rec.onerror = null; rec.abort(); } catch (_) {}
    };
  }, [submit]);

  const startListening = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec || activeRef.current) return;

    // Unlock speech synthesis within the user gesture (autoplay policy)
    try {
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        window.speechSynthesis.speak(u);
      }
    } catch (_) {}

    setError(null);
    setTranscript('');
    textRef.current = '';
    submittedRef.current = false;
    activeRef.current = true;
    try {
      rec.start();
    } catch (err) {
      // InvalidStateError: already started
      console.warn('Recognition start failed:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    clearTimer();
    if (textRef.current.trim() && !submittedRef.current) {
      submit();
    } else {
      activeRef.current = false;
      try { recognitionRef.current?.stop(); } catch (_) {}
      setIsListening(false);
    }
  }, [submit]);

  const cancelListening = useCallback(() => {
    clearTimer();
    activeRef.current = false;
    submittedRef.current = true;
    try { recognitionRef.current?.stop(); } catch (_) {}
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (activeRef.current) stopListening();
    else startListening();
  }, [startListening, stopListening]);

  return {
    isListening, transcript, error, isSupported,
    startListening, stopListening, cancelListening, toggleListening,
  };
}
