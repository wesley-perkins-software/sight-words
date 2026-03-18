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
    <div className="flashcard-tool flex flex-col items-center min-h-[70vh] py-6 px-4">
      {/* Progress */}
      <p className="text-sm text-gray-500 mb-4 tracking-wide uppercase">
        {listName} &mdash; Word {index + 1} of {total}
      </p>

      {/* Word display */}
      <div className="flex-1 flex items-center justify-center w-full">
        <span className="text-7xl sm:text-8xl font-bold text-gray-900 text-center leading-tight break-words">
          {currentWord}
        </span>
      </div>

      {/* Speaker button */}
      <button
        onClick={handleSpeak}
        aria-label={`Speak the word ${currentWord}`}
        className="mt-6 flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
          <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
          <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-6 w-full max-w-sm">
        <button
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous word"
          className="flex-1 min-h-[48px] flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 font-semibold text-lg hover:bg-gray-200 active:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>

        <button
          onClick={shuffle}
          aria-label="Shuffle words"
          className="min-h-[48px] px-4 flex items-center justify-center rounded-xl bg-yellow-100 text-yellow-800 font-semibold hover:bg-yellow-200 active:bg-yellow-300 transition-colors"
        >
          Shuffle
        </button>

        <button
          onClick={goNext}
          disabled={index === total - 1}
          aria-label="Next word"
          className="flex-1 min-h-[48px] flex items-center justify-center rounded-xl bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 active:bg-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
