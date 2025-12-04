/**
 * useAIProcessingフック
 * AI処理（本文抽出、要約）の状態管理とAPI呼び出しを担当
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { AIProcessingState, AISettings } from '../../shared/types';
import { summarizeContent as summarizeContentAPI } from '../../shared/api/aiService';
import { extractCleanText } from '../../shared/utils/htmlCleaner';

interface UseAIProcessingResult {
  state: AIProcessingState;
  extractContent: () => string[];
  summarizeContent: () => Promise<string[]>;
  resetToOriginal: () => void;
  hasApiKey: boolean;
  isSettingsLoaded: boolean;
}

/**
 * AI処理フック
 * @param originalContent - オリジナルのコンテンツテキスト
 * @returns AI処理の状態と操作関数
 */
export const useAIProcessing = (originalContent: string): UseAIProcessingResult => {
  const [state, setState] = useState<AIProcessingState>({
    isLoading: false,
    error: null,
    mode: 'original',
    extractedText: null,
    summaryText: null,
  });

  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState<boolean>(false);
  const [settings, setSettings] = useState<AISettings | null>(null);

  // キャッシュをuseRefで管理（クロージャ問題を回避）
  const extractedTextRef = useRef<string | null>(null);
  const summaryTextRef = useRef<string | null>(null);

  // APIキーの存在確認
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chromeAPI = (globalThis as any).chrome;
    if (!chromeAPI?.storage?.local) return;

    chromeAPI.storage.local.get(
      ['openrouterApiKey', 'openRouterModel', 'openRouterProvider'],
      (items: Record<string, string>) => {
        const apiKey = items.openrouterApiKey || '';
        const model = items.openRouterModel || 'anthropic/claude-3-haiku';
        const provider = items.openRouterProvider;

        setHasApiKey(!!apiKey);
        setSettings({
          openrouterApiKey: apiKey,
          openRouterModel: model,
          openRouterProvider: provider,
        });
        setIsSettingsLoaded(true);
      }
    );
  }, []);

  // コンテンツが変更されたらキャッシュをクリア
  useEffect(() => {
    extractedTextRef.current = null;
    summaryTextRef.current = null;
    setState({
      isLoading: false,
      error: null,
      mode: 'original',
      extractedText: null,
      summaryText: null,
    });
  }, [originalContent]);

  /**
   * 本文を抽出する
   * DOMベースの抽出（API呼び出しなし、同期処理）
   * キャッシュがある場合はそれを使用
   */
  const extractContent = useCallback((): string[] => {
    // キャッシュチェックはrefを使用（クロージャ問題を回避）
    if (extractedTextRef.current) {
      setState((prev) => ({ ...prev, mode: 'extracted', error: null }));
      return extractedTextRef.current.split(/\s+/).filter((word) => word.length > 0);
    }

    // DOMベースの本文抽出（同期処理）
    const extracted = extractCleanText();

    // キャッシュを更新
    extractedTextRef.current = extracted;

    // 関数形式で更新（既存の要約は保持）
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: null,
      mode: 'extracted',
      extractedText: extracted,
    }));

    return extracted.split(/\s+/).filter((word) => word.length > 0);
  }, []);

  /**
   * コンテンツを要約する
   * キャッシュがある場合はそれを使用
   */
  const summarizeContent = useCallback(async (): Promise<string[]> => {
    if (!settings) {
      throw new Error('AI設定が読み込まれていません');
    }

    // キャッシュチェックはrefを使用（クロージャ問題を回避）
    if (summaryTextRef.current) {
      setState((prev) => ({ ...prev, mode: 'summary', error: null }));
      return summaryTextRef.current.split(/\s+/);
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const summary = await summarizeContentAPI(originalContent, settings);

      // キャッシュを更新
      summaryTextRef.current = summary;

      // 関数形式で更新（既存の抽出結果は保持）
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: null,
        mode: 'summary',
        summaryText: summary,
      }));

      return summary.split(/\s+/);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [originalContent, settings]);

  /**
   * オリジナルモードに戻す
   * キャッシュは保持される
   */
  const resetToOriginal = (): void => {
    setState((prev) => ({
      ...prev,
      mode: 'original',
      error: null,
    }));
  };

  return {
    state,
    extractContent,
    summarizeContent,
    resetToOriginal,
    hasApiKey,
    isSettingsLoaded,
  };
};
