'use client';

import { useEffect, useState, useRef } from 'react';

export default function TextToSpeechPlayer({ text }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(0.9);
  const [volume, setVolume] = useState(1);

  const utteranceRef = useRef(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Auto-select Nigerian or English voice
        const nigerianVoice = availableVoices.find(
          (voice) =>
            voice.lang === 'en-NG' ||
            voice.name.toLowerCase().includes('nigerian') ||
            voice.name.toLowerCase().includes('nigeria')
        );

        const fallbackVoice = availableVoices.find((voice) =>
          voice.lang.startsWith('en-')
        );

        setSelectedVoice(nigerianVoice || fallbackVoice || null);
      };

      loadVoices();

      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      console.error('Web Speech API not supported in this browser.');
    }
  }, []);

  const playAudio = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice?.lang || 'en-US';
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const pauseAudio = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const resumeAudio = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Text-to-Speech Player</h2>

      <p className="text-sm text-gray-700">Voice: {selectedVoice?.name || 'None selected'}</p>

      <select
        className="w-full p-2 border rounded"
        value={selectedVoice?.name || ''}
        onChange={(e) => {
          const voice = voices.find((v) => v.name === e.target.value);
          setSelectedVoice(voice);
        }}
      >
        {voices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          onClick={playAudio}
          disabled={isSpeaking && !isPaused}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Play
        </button>
        <button
          onClick={pauseAudio}
          disabled={!isSpeaking || isPaused}
          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Pause
        </button>
        <button
          onClick={resumeAudio}
          disabled={!isPaused}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
        >
          Resume
        </button>
        <button
          onClick={stopAudio}
          disabled={!isSpeaking}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
        >
          Stop
        </button>
      </div>

      <div className="space-y-2">
        <label className="block text-sm">
          Pitch: {pitch.toFixed(1)}
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="block text-sm">
          Rate: {rate.toFixed(1)}
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="block text-sm">
          Volume: {volume.toFixed(1)}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>
      </div>
    </div>
  );
}
