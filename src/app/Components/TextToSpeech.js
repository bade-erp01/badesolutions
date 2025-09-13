// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import {
//   SparklesIcon,
//   PlayIcon,
//   PauseIcon,
//   StopIcon,
//   PlayPauseIcon,
// } from '@heroicons/react/24/outline';

// export default function TextToSpeechPlayer({ text }) {
//   const [voices, setVoices] = useState([]);
//   const [selectedVoice, setSelectedVoice] = useState(null);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);

//   const [pitch, setPitch] = useState(1.0);
//   const [rate, setRate] = useState(0.9);
//   const [volume, setVolume] = useState(1.0);

//   const utteranceRef = useRef(null);

//   // Load settings from localStorage
//   useEffect(() => {
//     const savedSettings = JSON.parse(localStorage.getItem('ttsSettings'));
//     if (savedSettings) {
//       setPitch(savedSettings.pitch);
//       setRate(savedSettings.rate);
//       setVolume(savedSettings.volume);
//       setSelectedVoice(savedSettings.voice || null);
//     }
//   }, []);

//   // Load voices
//   useEffect(() => {
//     if ('speechSynthesis' in window) {
//       const loadVoices = () => {
//         const availableVoices = window.speechSynthesis.getVoices();
//         setVoices(availableVoices);

//         const preferredVoice =
//           availableVoices.find((v) =>
//             v.name.toLowerCase().includes('google uk english')
//           ) ||
//           availableVoices.find(
//             (v) =>
//               v.lang === 'en-NG' ||
//               v.name.toLowerCase().includes('nigerian') ||
//               v.name.toLowerCase().includes('nigeria')
//           ) ||
//           availableVoices.find((v) => v.lang.startsWith('en-'));

//         setSelectedVoice((prev) => prev || preferredVoice || null);
//       };

//       loadVoices();
//       if (voices.length === 0) {
//         window.speechSynthesis.onvoiceschanged = loadVoices;
//       }
//     } else {
//       console.error('Web Speech API not supported in this browser.');
//     }
//   }, []);

//   // Save settings to localStorage
//   useEffect(() => {
//     localStorage.setItem(
//       'ttsSettings',
//       JSON.stringify({
//         pitch,
//         rate,
//         volume,
//         voice: selectedVoice,
//       })
//     );
//   }, [pitch, rate, volume, selectedVoice]);

//   const playAudio = () => {
//     if (!('speechSynthesis' in window)) return;

//     window.speechSynthesis.cancel();

//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.voice = selectedVoice;
//     utterance.lang = selectedVoice?.lang || 'en-US';
//     utterance.pitch = pitch;
//     utterance.rate = rate;
//     utterance.volume = volume;

//     utterance.onstart = () => {
//       setIsSpeaking(true);
//       setIsPaused(false);
//     };
//     utterance.onend = () => {
//       setIsSpeaking(false);
//       setIsPaused(false);
//     };

//     utteranceRef.current = utterance;
//     window.speechSynthesis.speak(utterance);
//   };

//   const pauseAudio = () => {
//     if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
//       window.speechSynthesis.pause();
//       setIsPaused(true);
//     }
//   };

//   const resumeAudio = () => {
//     if (window.speechSynthesis.paused) {
//       window.speechSynthesis.resume();
//       setIsPaused(false);
//     }
//   };

//   const stopAudio = () => {
//     window.speechSynthesis.cancel();
//     setIsSpeaking(false);
//     setIsPaused(false);
//   };

//   return (
//     <div className="p-6 bg-gradient-to-br from-yellow-50 to-white rounded-sm shadow-lg max-w-md mx-auto space-y-6 border border-yellow-200">
//       <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//         Bade Assist <SparklesIcon className="h-5 w-5 text-yellow-500" />
//       </h2>

//       <div className="text-sm text-gray-700">
//         <strong>Current Voice:</strong>{' '}
//         {selectedVoice?.name || 'None selected'}
//       </div>

//       <select
//         className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm"
//         value={selectedVoice?.name || ''}
//         onChange={(e) => {
//           const voice = voices.find((v) => v.name === e.target.value);
//           setSelectedVoice(voice);
//         }}
//       >
//         {voices.map((voice) => (
//           <option key={voice.name} value={voice.name}>
//             {voice.name} ({voice.lang})
//           </option>
//         ))}
//       </select>

//       <div className="flex gap-3 justify-center">
//         <span
//           onClick={playAudio}
//           disabled={isSpeaking && !isPaused}
//           className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full disabled:opacity-50"
//         >
//           <PlayIcon className="h-6 w-6" />
//         </span>
//         <span
//           onClick={pauseAudio}
//           disabled={!isSpeaking || isPaused}
//           className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full disabled:opacity-50"
//         >
//           <PauseIcon className="h-6 w-6" />
//         </span>
//         <span
//           onClick={resumeAudio}
//           disabled={!isPaused}
//           className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full disabled:opacity-50"
//         >
//           <PlayPauseIcon className="h-6 w-6" />
//         </span>
//         <span
//           onClick={stopAudio}
//           disabled={!isSpeaking}
//           className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-full disabled:opacity-50"
//         >
//           <StopIcon className="h-6 w-6" />
//         </span>
//       </div>

//       <div className="space-y-4 text-sm">
//         <label>
//           <span className="block mb-1">Pitch: {pitch.toFixed(1)}</span>
//           <input
//             type="range"
//             min="0"
//             max="2"
//             step="0.1"
//             value={pitch}
//             onChange={(e) => setPitch(parseFloat(e.target.value))}
//             className="w-full"
//           />
//         </label>

//         <label>
//           <span className="block mb-1">Rate: {rate.toFixed(1)}</span>
//           <input
//             type="range"
//             min="0.5"
//             max="2"
//             step="0.1"
//             value={rate}
//             onChange={(e) => setRate(parseFloat(e.target.value))}
//             className="w-full"
//           />
//         </label>

//         <label>
//           <span className="block mb-1">Volume: {volume.toFixed(1)}</span>
//           <input
//             type="range"
//             min="0"
//             max="1"
//             step="0.1"
//             value={volume}
//             onChange={(e) => setVolume(parseFloat(e.target.value))}
//             className="w-full"
//           />
//         </label>
//       </div>
//     </div>
//   );
// }





'use client';

import { useEffect, useState } from 'react';
import { SparklesIcon,BugAntIcon } from '@heroicons/react/24/outline';

export default function TextToSpeechTrigger({ text }) {
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      const preferredVoice =
        voices.find((v) =>
          v.name.toLowerCase().includes('google uk english female')
        ) ||
        voices.find((v) =>
          v.name.toLowerCase().includes('google uk english')
        ) ||
        voices.find((v) =>
          v.lang === 'en-ZA' || v.name.toLowerCase().includes('south african')
        ) ||
        voices.find((v) =>
          v.lang === 'en-NG' || v.name.toLowerCase().includes('nigerian')
        ) ||
        voices.find((v) => v.lang.startsWith('en-'));

      setVoice(preferredVoice || null);
    };

      loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const speakText = () => {
    if (!('speechSynthesis' in window) || !voice) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.cancel(); // Stop any current speech
    window.speechSynthesis.speak(utterance);
  };

  return (
    <span
      onClick={speakText}
      className="inline-flex items-center gap-1 cursor-pointer  hover:text-yellow-200 transition"
      title="Bug Ant Assist"
    >
      <BugAntIcon className="h-5 w-5 text-black" />
    </span>
  );
}
