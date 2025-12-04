/**
 * useAIProcessingフック
 * AI処理（本文抽出、要約）の状態管理とAPI呼び出しを担当
 */
import { useState, useEffect } from 'react';
import { AIProcessingState, AISettings } from '../../shared/types';
import {
  extractMainContent as extractMainContentAPI,
  summarizeContent as summarizeContentAPI,
} from '../../shared/api/aiService';

interface UseAIProcessingResult {
  state: AIProcessingState;
  extractContent: () => Promise<string[]>;
  summarizeContent: () => Promise<string[]>;
  resetToOriginal: () => void;
  hasApiKey: boolean;
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
  const [settings, setSettings] = useState<AISettings | null>(null);

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
      }
    );
  }, []);

  // コンテンツが変更されたらキャッシュをクリア
  useEffect(() => {
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
   * キャッシュがある場合はそれを使用
   */
  const extractContent = async (): Promise<string[]> => {
    if (!settings) {
      throw new Error('AI設定が読み込まれていません');
    }

    // キャッシュがある場合はそれを使用
    if (state.extractedText) {
      setState((prev) => ({ ...prev, mode: 'extracted', error: null }));
      return state.extractedText.split(/\s+/);
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const extracted = await extractMainContentAPI(originalContent, settings);

      setState({
        isLoading: false,
        error: null,
        mode: 'extracted',
        extractedText: extracted,
        summaryText: state.summaryText, // 既存の要約は保持
      });

      return extracted.split(/\s+/);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  /**
   * コンテンツを要約する
   * キャッシュがある場合はそれを使用
   */
  const summarizeContent = async (): Promise<string[]> => {
    if (!settings) {
      throw new Error('AI設定が読み込まれていません');
    }

    // キャッシュがある場合はそれを使用
    if (state.summaryText) {
      setState((prev) => ({ ...prev, mode: 'summary', error: null }));
      return state.summaryText.split(/\s+/);
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const summary = await summarizeContentAPI(originalContent, settings);

      setState({
        isLoading: false,
        error: null,
        mode: 'summary',
        extractedText: state.extractedText, // 既存の抽出結果は保持
        summaryText: summary,
      });

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
  };

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
  };
};
