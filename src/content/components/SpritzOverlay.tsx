import { useSpritzReader } from '@shared/hooks/useSpritzReader';
import { useKeyboardShortcuts } from '@shared/hooks/useKeyboardShortcuts';
import { Redicle } from './Redicle';
import { Controls } from './Controls';
import { ProgressBar } from './ProgressBar';

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
    currentWord,
    progress,
  } = useSpritzReader();

  useKeyboardShortcuts({
    onTogglePlayPause: togglePlayPause,
    onClose,
    onWpmUp: () => adjustWpm(1),
    onWpmDown: () => adjustWpm(-1),
    onMaxCharsUp: () => adjustMaxChars(1),
    onMaxCharsDown: () => adjustMaxChars(-1),
  });

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
    </div>
  );
}
