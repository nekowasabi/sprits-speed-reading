import { useCallback } from 'react';
import { useSpritzReader } from '@shared/hooks/useSpritzReader';
import { useKeyboardShortcuts } from '@shared/hooks/useKeyboardShortcuts';
import { useAIProcessing } from '../hooks/useAIProcessing';
import { extractWords } from '@shared/utils/textExtractor';
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
    togglePlayPause,
    setWpm,
    adjustWpm,
    setMaxChars,
    adjustMaxChars,
    setWords,
    currentWord,
    progress,
  } = useSpritzReader();

  // ページのテキストを取得
  const pageText = extractWords().join(' ');

  // AI処理フック
  const {
    state: aiState,
    extractContent,
    summarizeContent,
    resetToOriginal,
    hasApiKey,
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
        if (mode === 'original') {
          resetToOriginal();
          // オリジナルのテキストに戻す
          const originalWords = extractWords();
          setWords(originalWords);
        } else if (mode === 'extracted') {
          const words = await extractContent();
          setWords(words);
        } else if (mode === 'summary') {
          const words = await summarizeContent();
          setWords(words);
        }
      } catch (error) {
        console.error('Mode change error:', error);
        // エラーが発生した場合はオリジナルに戻す
        resetToOriginal();
        const originalWords = extractWords();
        setWords(originalWords);
      }
    },
    [extractContent, summarizeContent, resetToOriginal, setWords]
  );

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
