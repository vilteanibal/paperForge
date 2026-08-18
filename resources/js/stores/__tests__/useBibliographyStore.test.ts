import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useBibliographyStore } from '../useBibliographyStore';

describe('useBibliographyStore', () => {
    beforeEach(() => {
        useBibliographyStore.getState().clear();
        vi.restoreAllMocks();
    });

    it('initializes with empty entries', () => {
        const state = useBibliographyStore.getState();
        expect(state.entries).toEqual([]);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('fetches and populates bibliography entries', async () => {
        const mockResponse = {
            data: [
                {
                    citationKey: 'hawking1974',
                    type: 'article',
                    title: 'Black hole explosions?',
                    author: 'S. W. Hawking',
                    year: '1974',
                    journal: 'Nature',
                },
            ],
            total: 1,
        };

        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        } as Response);

        await useBibliographyStore.getState().fetchEntries('test-project-id');

        expect(fetchSpy).toHaveBeenCalledWith(
            '/api/projects/test-project-id/bibliography',
            expect.any(Object)
        );

        const state = useBibliographyStore.getState();
        expect(state.isLoading).toBe(false);
        expect(state.entries).toHaveLength(1);
        expect(state.entries[0].citationKey).toBe('hawking1974');
        expect(state.entries[0].author).toBe('S. W. Hawking');
    });

    it('handles network failure gracefully', async () => {
        vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

        await useBibliographyStore.getState().fetchEntries('test-project-id');

        const state = useBibliographyStore.getState();
        expect(state.isLoading).toBe(false);
        expect(state.entries).toEqual([]);
        expect(state.error).toBe('Network error');
    });
});
