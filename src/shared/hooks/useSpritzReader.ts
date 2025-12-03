import { useState, useCallback, useRef, useEffect } from 'react';
import {
  SpritzState,
  DEFAULT_WPM,
  MIN_WPM,
  MAX_WPM,
  WPM_STEP,
  DEFAULT_MAX_CHARS,
  MIN_MAX_CHARS,
  MAX_MAX_CHARS,
} from '@shared/types';
import { extractWords, extractSelectedWords } from '@shared/utils/textExtractor';
import { preprocessWords } from '@shared/utils/wordSplitter';
import { loadSettings, saveSettings } from './useSettings';

interface UseSpritzReaderReturn {
  state: SpritzState;
  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setWpm: (wpm: number) => void;
  adjustWpm: (delta: number) => void;
  setMaxChars: (maxChars: number) => void;
  adjustMaxChars: (delta: number) => void;
  reset: () => void;
  currentWord: string;
  progress: number;
}

export function useSpritzReader(): UseSpritzReaderReturn {
  const [state, setState] = useState<SpritzState>({
    isActive: true,
    isPaused: true,
    wpm: DEFAULT_WPM,
    maxChars: DEFAULT_MAX_CHARS,
    currentWordIndex: 0,
    words: [],
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const rawWordsRef = useRef<string[]>([]);

  const clearPlayInterval = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const displayNextWord = useCallback(() => {
    setState((prev) => {
      if (prev.currentWordIndex >= prev.words.length - 1) {
        return { ...prev, isPaused: true, currentWordIndex: 0 };
      }
      return { ...prev, currentWordIndex: prev.currentWordIndex + 1 };
    });
  }, []);

  // Initialize settings and words on mount
  useEffect(() => {
    async function initialize() {
      const settings = await loadSettings();
      const selectedWords = extractSelectedWords();
      const rawWords = selectedWords || extractWords();
      rawWordsRef.current = rawWords;

      const processedWords = preprocessWords(rawWords, settings.maxChars);

      setState({
        isActive: true,
        isPaused: false,
        wpm: settings.wpm,
        maxChars: settings.maxChars,
        currentWordIndex: 0,
        words: processedWords,
      });
      setIsInitialized(true);
    }
    initialize();
  }, []);

  const play = useCallback(() => {
    clearPlayInterval();
    setState((prev) => ({ ...prev, isPaused: false }));

    const interval = 60000 / state.wpm;
    intervalRef.current = window.setInterval(displayNextWord, interval);
  }, [state.wpm, clearPlayInterval, displayNextWord]);

  const pause = useCallback(() => {
    clearPlayInterval();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [clearPlayInterval]);

  const togglePlayPause = useCallback(() => {
    if (state.isPaused) {
      play();
    } else {
      pause();
    }
  }, [state.isPaused, play, pause]);

  const setWpm = useCallback(
    (wpm: number) => {
      const clampedWpm = Math.max(MIN_WPM, Math.min(MAX_WPM, wpm));
      setState((prev) => {
        saveSettings({ wpm: clampedWpm, maxChars: prev.maxChars });
        return { ...prev, wpm: clampedWpm };
      });

      if (!state.isPaused) {
        clearPlayInterval();
        const interval = 60000 / clampedWpm;
        intervalRef.current = window.setInterval(displayNextWord, interval);
      }
    },
    [state.isPaused, clearPlayInterval, displayNextWord]
  );

  const adjustWpm = useCallback(
    (delta: number) => {
      setWpm(state.wpm + delta * WPM_STEP);
    },
    [state.wpm, setWpm]
  );

  const setMaxChars = useCallback(
    (maxChars: number) => {
      const clampedMaxChars = Math.max(MIN_MAX_CHARS, Math.min(MAX_MAX_CHARS, maxChars));

      setState((prev) => {
        saveSettings({ wpm: prev.wpm, maxChars: clampedMaxChars });
        const processedWords = preprocessWords(rawWordsRef.current, clampedMaxChars);
        return {
          ...prev,
          maxChars: clampedMaxChars,
          words: processedWords,
          currentWordIndex: 0,
        };
      });

      if (!state.isPaused) {
        clearPlayInterval();
        const interval = 60000 / state.wpm;
        intervalRef.current = window.setInterval(displayNextWord, interval);
      }
    },
    [state.isPaused, state.wpm, clearPlayInterval, displayNextWord]
  );

  const adjustMaxChars = useCallback(
    (delta: number) => {
      setMaxChars(state.maxChars + delta);
    },
    [state.maxChars, setMaxChars]
  );

  const reset = useCallback(() => {
    clearPlayInterval();
    const selectedWords = extractSelectedWords();
    const rawWords = selectedWords || extractWords();
    rawWordsRef.current = rawWords;
    const processedWords = preprocessWords(rawWords, state.maxChars);

    setState((prev) => ({
      isActive: true,
      isPaused: true,
      wpm: prev.wpm,
      maxChars: prev.maxChars,
      currentWordIndex: 0,
      words: processedWords,
    }));
  }, [clearPlayInterval, state.maxChars]);

  // Auto-start on initialization
  useEffect(() => {
    if (isInitialized && state.words.length > 0 && !state.isPaused && !intervalRef.current) {
      play();
    }

    return () => {
      clearPlayInterval();
    };
  }, [isInitialized, state.words.length]);

  const currentWord = state.words[state.currentWordIndex] || '';
  const progress =
    state.words.length > 0 ? (state.currentWordIndex / state.words.length) * 100 : 0;

  return {
    state,
    play,
    pause,
    togglePlayPause,
    setWpm,
    adjustWpm,
    setMaxChars,
    adjustMaxChars,
    reset,
    currentWord,
    progress,
  };
}
