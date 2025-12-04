import { useCallback, useEffect, useRef } from 'react';
import { useSpritzReader } from '@shared/hooks/useSpritzReader';
import { useKeyboardShortcuts } from '@shared/hooks/useKeyboardShortcuts';
import { useAIProcessing } from '../hooks/useAIProcessing';
import { extractWords, getCleanPageText } from '@shared/utils/textExtractor';
import { ReadingMode } from '@shared/types';
import { Redicle } from './Redicle';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';
import { ModeSelector } from './ModeSelector';
import { LoadingOverlay } from './LoadingOverlay';

interface SpritzOverlayProps {
  onClose: () => void;
}

export function SpritzOverlay({ onClose }: SpritzOverlayProps): JSX.Element {
  const {
    state,
    play,
    pause,
    togglePlayPause,
    setWpm,
    adjustWpm,
    setMaxChars,
    adjustMaxChars,
    setWords,
    currentWord,
    progress,
  } = useSpritzReader();

  // ページのテキストを取得（AI処理用にクリーンなテキストを使用）
  // 不要な要素（nav, header, footer, ads等）を除去して送信テキスト量を削減
  const pageText = getCleanPageText();

  // AI処理フック
  const {
    state: aiState,
    extractContent,
    summarizeContent,
    resetToOriginal,
    hasApiKey,
    isSettingsLoaded,
  } = useAIProcessing(pageText);

  useKeyboardShortcuts({
    onTogglePlayPause: togglePlayPause,
    onClose,
    onWpmUp: () => adjustWpm(1),
    onWpmDown: () => adjustWpm(-1),
    onMaxCharsUp: () => adjustMaxChars(1),
    onMaxCharsDown: () => adjustMaxChars(-1),
  });

  // モード変更ハンドラ
  const handleModeChange = useCallback(
    async (mode: ReadingMode) => {
      try {
        // モードをストレージに保存
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const chromeAPI = (globalThis as any).chrome;
        if (chromeAPI?.storage?.local) {
          await chromeAPI.storage.local.set({ readingMode: mode });
        }

        if (mode === 'original') {
          resetToOriginal();
          // オリジナルのテキストに戻す
          const originalWords = extractWords();
          setWords(originalWords);
          // 停止中の場合のみ自動再生を開始
          if (state.isPaused) {
            togglePlayPause();
          }
        } else if (mode === 'extracted') {
          // DOMベースの本文抽出（同期処理、ローディング不要）
          const words = extractContent();
          setWords(words);
          // 停止中の場合のみ自動再生を開始
          if (state.isPaused) {
            togglePlayPause();
          }
        } else if (mode === 'summary') {
          // AI処理中は再生を停止
          pause();
          const words = await summarizeContent();
          setWords(words);
          // setWordsは内部でisPaused:trueに設定するため、play()を直接呼んで再生開始
          play();
        }
      } catch (error) {
        console.error('Mode change error:', error);
        // エラー時は現在のモードを維持し、エラー状態はuseAIProcessingで管理
        // NetworkError等の場合、ユーザーにエラーメッセージを表示してリトライを促す
      }
    },
    [extractContent, summarizeContent, resetToOriginal, setWords, play, pause, togglePlayPause, state.isPaused]
  );

  // 初期化フラグ（一度だけ実行するため）
  const isInitializedRef = useRef(false);

  // 初期化時にストレージからモードを読み込み、必要に応じてAI処理を実行
  useEffect(() => {
    // 設定の読み込みが完了するまで待機
    if (!isSettingsLoaded) return;
    if (isInitializedRef.current) return;

    const initializeMode = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const chromeAPI = (globalThis as any).chrome;
      if (!chromeAPI?.storage?.local) return;

      try {
        const result = await chromeAPI.storage.local.get(['readingMode']);
        const savedMode = result.readingMode as ReadingMode | undefined;

        // 保存されたモードがない、またはoriginalの場合は何もしない
        if (!savedMode || savedMode === 'original') {
          isInitializedRef.current = true;
          return;
        }

        // AI機能を使用するモードの場合
        if (savedMode === 'extracted' || savedMode === 'summary') {
          // APIキーがない場合はoriginalモードにフォールバック
          if (!hasApiKey) {
            console.warn('APIキーが設定されていないため、originalモードで開始します');
            await chromeAPI.storage.local.set({ readingMode: 'original' });
            isInitializedRef.current = true;
            return;
          }

          // APIキーがある場合は自動的にAI処理を実行
          await handleModeChange(savedMode);
        }

        isInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to load saved reading mode:', error);
        isInitializedRef.current = true;
      }
    };

    initializeMode();
  }, [isSettingsLoaded, hasApiKey, handleModeChange]);

  // ローディングメッセージの決定
  const getLoadingMessage = (): string => {
    if (aiState.mode === 'extracted') {
      return '本文を抽出中...';
    } else if (aiState.mode === 'summary') {
      return '要約中...';
    }
    return '処理中...';
  };

  return (
    <div
      data-testid="spritz-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ModeSelector
        currentMode={aiState.mode}
        onModeChange={handleModeChange}
        isProcessing={aiState.isLoading}
        hasApiKey={hasApiKey}
      />

      <div
        style={{
          backgroundColor: '#fff',
          padding: '40px 60px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          marginBottom: '30px',
        }}
      >
        <Redicle word={currentWord} />
      </div>

      <Controls
        wpm={state.wpm}
        maxChars={state.maxChars}
        isPaused={state.isPaused}
        onTogglePlayPause={togglePlayPause}
        onWpmChange={setWpm}
        onMaxCharsChange={setMaxChars}
        onClose={onClose}
      />

      <ProgressBar progress={progress} />

      <LoadingOverlay isVisible={aiState.isLoading} message={getLoadingMessage()} />

      {aiState.error && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#dc3545',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '5px',
            maxWidth: '80%',
            textAlign: 'center',
          }}
        >
          エラー: {aiState.error}
        </div>
      )}
    </div>
  );
}
