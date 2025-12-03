export interface SpritzState {
  isActive: boolean;
  isPaused: boolean;
  wpm: number;
  maxChars: number;
  currentWordIndex: number;
  words: string[];
}

export interface SpritzSettings {
  wpm: number;
  maxChars: number;
}

export const DEFAULT_WPM = 300;
export const MIN_WPM = 100;
export const MAX_WPM = 1000;
export const WPM_STEP = 50;

export const DEFAULT_MAX_CHARS = 12;
export const MIN_MAX_CHARS = 6;
export const MAX_MAX_CHARS = 20;

export type MessageAction = 'toggleReader' | 'getState';

export interface Message {
  action: MessageAction;
  payload?: unknown;
}
