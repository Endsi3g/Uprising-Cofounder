import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
};

type ShortcutHandler = (e: KeyboardEvent) => void;

export const useKeyboardShortcuts = (
  shortcuts: { combo: KeyCombo; handler: ShortcutHandler }[]
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      shortcuts.forEach(({ combo, handler }) => {
        const keyMatch = e.key.toLowerCase() === combo.key.toLowerCase();
        const ctrlMatch = !!combo.ctrlKey === (e.ctrlKey || e.metaKey); // Treat meta as ctrl for Mac
        const altMatch = !!combo.altKey === e.altKey;
        const shiftMatch = !!combo.shiftKey === e.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          e.preventDefault();
          handler(e);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};
