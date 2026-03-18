import { useState, useCallback } from "react";

const speak = (word) => {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.8;
  window.speechSynthesis.speak(utterance);
};

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Flashcard({ words, listName }) {
  const [deck, setDeck] = useState(words);
  const [index, setIndex] = useState(0);

  const currentWord = deck[index];
  const total = deck.length;

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const shuffle = useCallback(() => {
    setDeck(shuffleArray(words));
    setIndex(0);
  }, [words]);

  const handleSpeak = useCallback(() => {
    speak(currentWord);
  }, [currentWord]);

  return (
    <div className="flashcard-tool flex flex-col items-center py-6 px-4" style={{ backgroundColor: '#f0f4f8' }}>
      {/* List name */}
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1 font-semibold">
        {listName}
      </p>

      {/* Progress */}
      <p className="text-sm text-gray-500 mb-4">
        Word {index + 1} of {total}
      </p>

      {/* Card */}
      <div
        className="relative w-full flex items-center justify-center"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          border: '1.5px solid #e5e7eb',
          minHeight: '240px',
        }}
      >
        <span
          className="text-7xl font-extrabold text-center leading-tight break-words px-6 py-8"
          style={{ color: '#1e293b' }}
        >
          {currentWord}
        </span>

        {/* Speaker button — inside card, bottom right */}
        <button
          onClick={handleSpeak}
          aria-label={`Speak the word ${currentWord}`}
          className="absolute bottom-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-400 hover:bg-blue-100 hover:text-blue-600 active:bg-blue-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
            <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-6 w-full max-w-sm">
        <button
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous word"
          className="flex-1 min-h-[48px] flex items-center justify-center rounded-xl bg-gray-100 text-gray-800 font-bold text-lg hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>

        <button
          onClick={shuffle}
          aria-label="Shuffle words"
          className="min-h-[48px] px-5 flex items-center justify-center rounded-xl text-white font-bold hover:opacity-90 active:opacity-80 transition-opacity"
          style={{ backgroundColor: '#F59E0B' }}
        >
          Shuffle
        </button>

        <button
          onClick={goNext}
          disabled={index === total - 1}
          aria-label="Next word"
          className="flex-1 min-h-[48px] flex items-center justify-center rounded-xl text-white font-bold text-lg hover:opacity-90 active:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          style={{ backgroundColor: '#2563EB' }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
