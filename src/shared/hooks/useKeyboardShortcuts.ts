import { useEffect, useCallback } from 'react';

interface KeyboardShortcutHandlers {
  onTogglePlayPause: () => void;
  onClose: () => void;
  onWpmUp: () => void;
  onWpmDown: () => void;
  onMaxCharsUp: () => void;
  onMaxCharsDown: () => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
          event.preventDefault();
          handlers.onTogglePlayPause();
          break;
        case 'Escape':
          event.preventDefault();
          handlers.onClose();
          break;
        case 'ArrowUp':
          event.preventDefault();
          handlers.onWpmUp();
          break;
        case 'ArrowDown':
          event.preventDefault();
          handlers.onWpmDown();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handlers.onMaxCharsUp();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          handlers.onMaxCharsDown();
          break;
      }
    },
    [handlers]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
