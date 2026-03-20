import { useEffect } from 'react';

export interface UseKeyboardOptions {
  onSpace: () => void;   // space key callback
  enabled: boolean;       // whether to listen
}

export function useKeyboard(options: UseKeyboardOptions): void {
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
}
