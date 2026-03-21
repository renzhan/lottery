import { useEffect } from 'react';

export interface UseKeyboardOptions {
  onSpace: () => void;   // space key callback
  onEscape?: () => void; // escape key callback
  enabled: boolean;       // whether to listen
}

export function useKeyboard(options: UseKeyboardOptions): void {
  // Space key: controlled by enabled flag
  useEffect(() => {
    if (!options.enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        options.onSpace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options.enabled, options.onSpace]);

  // ESC key: always active regardless of enabled flag
  useEffect(() => {
    if (!options.onEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        options.onEscape?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options.onEscape]);
}
