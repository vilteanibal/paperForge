import { useEffect } from 'react';

export interface ShortcutHandler {
    key: string;
    ctrlOrCmd?: boolean;
    alt?: boolean;
    shift?: boolean;
    handler: (e: KeyboardEvent) => void;
    description?: string;
}

export function useGlobalShortcuts(shortcuts: ShortcutHandler[]): void {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = typeof navigator !== 'undefined' && navigator.platform?.toUpperCase().indexOf('MAC') >= 0;
            const isModifierActive = isMac ? e.metaKey : e.ctrlKey;

            for (const shortcut of shortcuts) {
                const matchesKey = e.key.toLowerCase() === shortcut.key.toLowerCase();
                const matchesCtrlOrCmd = shortcut.ctrlOrCmd ? isModifierActive : true;
                const matchesAlt = shortcut.alt !== undefined ? e.altKey === shortcut.alt : true;
                const matchesShift = shortcut.shift !== undefined ? e.shiftKey === shortcut.shift : true;

                if (matchesKey && matchesCtrlOrCmd && matchesAlt && matchesShift) {
                    e.preventDefault();
                    e.stopPropagation();
                    shortcut.handler(e);
                    break;
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown, true);

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [shortcuts]);
}
