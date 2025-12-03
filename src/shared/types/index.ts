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

// =====================
// AI関連の型定義
// =====================

/**
 * 読み取りモード
 * - original: オリジナルのページテキスト
 * - extracted: AIで本文抽出したテキスト
 * - summary: AIで要約したテキスト
 */
export type ReadingMode = 'original' | 'extracted' | 'summary';

/**
 * AI設定
 */
export interface AISettings {
  openrouterApiKey: string;
  openRouterModel: string;
  openRouterProvider?: string;
}

/**
 * AI処理状態
 */
export interface AIProcessingState {
  isLoading: boolean;
  error: string | null;
  mode: ReadingMode;
  extractedText: string | null;
  summaryText: string | null;
}

/**
 * HTTPステータスコード
 */
export enum HttpStatus {
  OK = 200,
  UNAUTHORIZED = 401,
  PAYMENT_REQUIRED = 402,
  TOO_MANY_REQUESTS = 429,
  SERVER_ERROR = 500,
}

/**
 * HTTP基底エラークラス
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * 認証エラー (401)
 */
export class UnauthorizedError extends HttpError {
  constructor(message: string) {
    super(HttpStatus.UNAUTHORIZED, message);
    this.name = 'UnauthorizedError';
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * クォータ超過エラー (402)
 */
export class ApiQuotaError extends HttpError {
  constructor(message: string) {
    super(HttpStatus.PAYMENT_REQUIRED, message);
    this.name = 'ApiQuotaError';
    Object.setPrototypeOf(this, ApiQuotaError.prototype);
  }
}

/**
 * レート制限エラー (429)
 */
export class RateLimitError extends HttpError {
  constructor(message: string) {
    super(HttpStatus.TOO_MANY_REQUESTS, message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * サーバーエラー (500)
 */
export class ServerError extends HttpError {
  constructor(message: string) {
    super(HttpStatus.SERVER_ERROR, message);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * API補完パラメータ
 */
export interface CompletionParams {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  topK?: number;
  maxTokens?: number;
  provider?: string;
}
