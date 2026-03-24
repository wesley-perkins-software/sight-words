import { useState, useCallback, useRef, useEffect } from "react";

const PREFERRED_VOICES = [
  'Google US English',
  'Google UK English Female',
  'Samantha',
  'Karen',
  'Daniel',
];

const getPreferredVoice = () => {
  const voices = window.speechSynthesis.getVoices();
  for (const name of PREFERRED_VOICES) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }
  return voices.find((v) => v.lang.startsWith('en')) ?? null;
};

const speak = (word) => {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.rate = 0.8;
  const voice = getPreferredVoice();
  if (voice) utterance.voice = voice;
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

export default function Flashcard({ lists }) {
  const [activeKey, setActiveKey] = useState(lists[0].key);
  const activeList = lists.find(l => l.key === activeKey);
  const [deck, setDeck] = useState(lists[0].words);
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFakeFullscreen, setIsFakeFullscreen] = useState(false);
  const flashcardRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const touchDeltaRef = useRef({ x: 0, y: 0 });

  const currentWord = deck[index];
  const total = deck.length;

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const shuffle = useCallback(() => {
    setDeck(shuffleArray(activeList.words));
    setIndex(0);
  }, [activeList]);

  const handleListChange = useCallback((key) => {
    window.speechSynthesis.cancel();
    const next = lists.find(l => l.key === key);
    setActiveKey(key);
    setDeck(next.words);
    setIndex(0);
  }, [lists]);

  const handleSpeak = useCallback(() => {
    speak(currentWord);
  }, [currentWord]);

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    if (!touch) return;

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchDeltaRef.current = { x: 0, y: 0 };
  }, []);

  const handleTouchMove = useCallback((event) => {
    const touch = event.touches[0];
    if (!touch) return;

    touchDeltaRef.current = {
      x: touch.clientX - touchStartRef.current.x,
      y: touch.clientY - touchStartRef.current.y,
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    const horizontalDistance = touchDeltaRef.current.x;
    const verticalDistance = touchDeltaRef.current.y;
    const swipeThreshold = 56;

    const isHorizontalSwipe =
      Math.abs(horizontalDistance) >= swipeThreshold
      && Math.abs(horizontalDistance) > Math.abs(verticalDistance);

    if (!isHorizontalSwipe) return;

    if (horizontalDistance < 0) {
      goNext();
      return;
    }

    goPrev();
  }, [goNext, goPrev]);

  const enterFullscreen = useCallback(() => {
    const el = flashcardRef.current;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else {
      // iOS Safari fallback — simulate fullscreen with fixed positioning
      setIsFakeFullscreen(true);
      setIsFullscreen(true);
    }
  }, []);

  const exitFullscreen = useCallback(() => {
    if (isFakeFullscreen) {
      setIsFakeFullscreen(false);
      setIsFullscreen(false);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
  }, [isFakeFullscreen]);

  useEffect(() => {
    const handler = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  const fakeFullscreenStyle = isFakeFullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        background: 'white',
      }
    : {};

  return (
    <div
      ref={flashcardRef}
      className={
        isFullscreen
          ? 'flashcard-tool flex flex-col items-center justify-center px-6 py-8'
          : 'flashcard-tool flex flex-col items-center py-6 px-4'
      }
      style={
        isFullscreen
          ? { backgroundColor: '#ffffff', minHeight: '100%', ...fakeFullscreenStyle }
          : { backgroundColor: '#f0f4f8' }
      }
    >
      {/* List selector — hidden in fullscreen */}
      {!isFullscreen && (
        <div className="w-full max-w-xl mb-3">
          {['Dolch', 'Fry', 'By Grade'].map(group => (
            <div key={group} className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest w-16 shrink-0">
                {group}
              </span>
              {lists.filter(l => l.group === group).map(l => (
                <button
                  key={l.key}
                  onClick={() => handleListChange(l.key)}
                  aria-pressed={activeKey === l.key}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors min-h-[36px] ${
                    activeKey === l.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* List name — hidden in fullscreen */}
      {!isFullscreen && (
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-semibold">
          {activeList.name}
        </p>
      )}

      {/* Progress */}
      <p className={`text-sm text-gray-600 ${isFullscreen ? 'mb-1' : 'mb-4'}`}>
        Word {index + 1} of {total}
      </p>

      {/* Card */}
      <div
        className={`relative w-full flex items-center justify-center ${
          isFullscreen ? '' : 'lg:max-w-3xl min-h-[240px] lg:min-h-[320px]'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={
          isFullscreen
            ? {
                backgroundColor: '#ffffff',
                flex: 1,
                minHeight: '50vh',
                touchAction: 'pan-y',
              }
            : {
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
                border: '1.5px solid #d1d5db',
              }
        }
      >
        <span
          className={`font-extrabold text-center leading-tight break-words px-6 ${isFullscreen ? 'text-9xl' : 'text-7xl'}`}
          style={{ paddingTop: '40px', paddingBottom: '40px', color: '#1e293b' }}
        >
          {currentWord}
        </span>

        {/* Fullscreen toggle button — top right of card */}
        <button
          onClick={isFullscreen ? exitFullscreen : enterFullscreen}
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
          className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 active:bg-gray-300 transition-colors"
        >
          {isFullscreen ? (
            // Compress / exit fullscreen icon
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path fillRule="evenodd" d="M3.22 3.22a.75.75 0 0 1 1.06 0l3.97 3.97V4.5a.75.75 0 0 1 1.5 0V9a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1 0-1.5h2.69L3.22 4.28a.75.75 0 0 1 0-1.06Zm17.56 0a.75.75 0 0 1 0 1.06l-3.97 3.97h2.69a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75V4.5a.75.75 0 0 1 1.5 0v2.69l3.97-3.97a.75.75 0 0 1 1.06 0ZM3.75 15a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-2.69l-3.97 3.97a.75.75 0 0 1-1.06-1.06l3.97-3.97H4.5a.75.75 0 0 1-.75-.75Zm10.5 0a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-2.69l3.97 3.97a.75.75 0 1 1-1.06 1.06l-3.97-3.97v2.69a.75.75 0 0 1-1.5 0V15Z" clipRule="evenodd" />
            </svg>
          ) : (
            // Expand / enter fullscreen icon
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path fillRule="evenodd" d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-3.97 3.97a.75.75 0 1 1-1.06-1.06l3.97-3.97h-2.69a.75.75 0 0 1-.75-.75Zm-12 0A.75.75 0 0 1 3.75 3h4.5a.75.75 0 0 1 0 1.5H5.56l3.97 3.97a.75.75 0 0 1-1.06 1.06L4.5 5.56v2.69a.75.75 0 0 1-1.5 0v-4.5Zm11.47 11.78a.75.75 0 1 1 1.06-1.06l3.97 3.97v-2.69a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1 0-1.5h2.69l-3.97-3.97Zm-4.94-1.06a.75.75 0 0 1 0 1.06L5.56 19.5h2.69a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v2.69l3.97-3.97a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Speaker button — inside card, bottom right */}
        <div className="absolute bottom-3 right-3 flex flex-col items-center gap-1">
          <button
            onClick={handleSpeak}
            aria-label={`Speak the word ${currentWord}`}
            className="flex items-center justify-center rounded-full hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ backgroundColor: '#2563EB', color: 'white', minWidth: '48px', minHeight: '48px' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
          {!isFullscreen && (
            <span className="text-xs text-gray-500 leading-none">Tap to hear</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div
        className={`w-full grid grid-cols-3 gap-2 ${
          isFullscreen ? 'max-w-2xl mt-4' : 'max-w-xl mt-3'
        }`}
      >
          <button
            onClick={goPrev}
            disabled={index === 0}
            aria-label="Previous word"
            className={`flex items-center justify-center rounded-xl font-bold px-3 sm:px-4 text-base sm:text-[1.05rem] min-h-[50px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-300 ${
              isFullscreen ? 'sm:min-h-[56px]' : ''
            } ${
              index === 0
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : 'bg-slate-100 text-slate-900 border border-slate-400 hover:bg-slate-200 active:bg-slate-300'
            }`}
          >
            ← Prev
          </button>

          <button
            onClick={shuffle}
            aria-label="Shuffle words"
            className={`flex items-center justify-center rounded-xl text-white font-bold px-3 sm:px-4 text-base sm:text-[1.05rem] min-h-[50px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-300 hover:brightness-95 active:brightness-90 ${
              isFullscreen ? 'sm:min-h-[56px]' : ''
            }`}
            style={{ backgroundColor: '#F59E0B' }}
          >
            Shuffle
          </button>

          <button
            onClick={goNext}
            disabled={index === total - 1}
            aria-label="Next word"
            className={`flex items-center justify-center rounded-xl text-white font-bold px-3 sm:px-4 text-base sm:text-[1.05rem] min-h-[50px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-300 ${
              isFullscreen ? 'sm:min-h-[56px]' : ''
            } ${
              index === total - 1
                ? 'bg-blue-300/80 cursor-not-allowed'
                : 'hover:brightness-95 active:brightness-90'
            }`}
            style={{ backgroundColor: index === total - 1 ? '#93C5FD' : '#2563EB' }}
          >
            Next →
          </button>
      </div>
    </div>
  );
}
