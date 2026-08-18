import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGlobalShortcuts } from '../useGlobalShortcuts';

describe('useGlobalShortcuts', () => {
    it('intercepts Ctrl+S and prevents default browser behavior', () => {
        const saveSpy = vi.fn();

        renderHook(() =>
            useGlobalShortcuts([
                {
                    key: 's',
                    ctrlOrCmd: true,
                    handler: saveSpy,
                },
            ])
        );

        const event = new KeyboardEvent('keydown', {
            key: 's',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });

        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
        window.dispatchEvent(event);

        expect(saveSpy).toHaveBeenCalledTimes(1);
        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('intercepts Ctrl+Enter for compilation trigger', () => {
        const compileSpy = vi.fn();

        renderHook(() =>
            useGlobalShortcuts([
                {
                    key: 'Enter',
                    ctrlOrCmd: true,
                    handler: compileSpy,
                },
            ])
        );

        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            ctrlKey: true,
            bubbles: true,
            cancelable: true,
        });

        window.dispatchEvent(event);

        expect(compileSpy).toHaveBeenCalledTimes(1);
    });
});
