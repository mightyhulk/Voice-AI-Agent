import { useState, useRef, useEffect, useCallback } from 'react';

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const synthUtteranceRef = useRef(null);
  const voicesRef = useRef([]);

  useEffect(() => {
    const audio = new Audio();
    audio.onplay = () => setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onpause = () => setIsPlaying(false);
    audio.onerror = (e) => {
      console.warn('Audio playback error:', e);
      setIsPlaying(false);
    };
    audioRef.current = audio;

    // Load browser speech synthesis voices
    const updateVoices = () => {
      if (window.speechSynthesis) {
        voicesRef.current = window.speechSynthesis.getVoices();
      }
    };
    updateVoices();
    if (window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const playBrowserSpeech = useCallback((text, voiceName = '') => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#`_]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
    
    // Pick the most natural sounding English voice available
    const preferredVoice = voices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Guy') || v.name.includes('David') || v.name.includes('Prabhat')) && 
      v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (err) => {
      console.warn('SpeechSynthesis error:', err);
      setIsPlaying(false);
    };

    synthUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const play = useCallback((audioBase64, fallbackText = '') => {
    stop();

    if (audioBase64) {
      try {
        const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
        if (audioRef.current) {
          audioRef.current.src = audioSrc;
          audioRef.current.play().catch((err) => {
            console.warn('Audio tag play failed, falling back to Web Speech Synthesis:', err);
            if (fallbackText) {
              playBrowserSpeech(fallbackText);
            }
          });
          return;
        }
      } catch (err) {
        console.warn('Base64 audio setup failed:', err);
      }
    }

    // Direct browser speech fallback
    if (fallbackText) {
      playBrowserSpeech(fallbackText);
    }
  }, [stop, playBrowserSpeech]);

  return {
    isPlaying,
    play,
    stop,
    playBrowserSpeech
  };
}
