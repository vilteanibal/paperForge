import { create } from 'zustand';
import type { BibEntry, BibliographyResponse } from '@/types/bibliography';

export interface BibliographyState {
    entries: BibEntry[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchEntries: (projectId: string) => Promise<void>;
    setEntries: (entries: BibEntry[]) => void;
    clear: () => void;
}

export const useBibliographyStore = create<BibliographyState>((set) => ({
    entries: [],
    isLoading: false,
    error: null,

    fetchEntries: async (projectId: string) => {
        if (!projectId) return;

        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`/api/projects/${projectId}/bibliography`, {
                headers: {
                    Accept: 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch bibliography: ${response.statusText}`);
            }

            const data: BibliographyResponse = await response.json();
            set({
                entries: data.data || [],
                isLoading: false,
                error: null,
            });
        } catch (err: any) {
            set({
                entries: [],
                isLoading: false,
                error: err?.message || 'Error fetching bibliography entries.',
            });
        }
    },

    setEntries: (entries: BibEntry[]) => {
        set({ entries, error: null });
    },

    clear: () => {
        set({
            entries: [],
            isLoading: false,
            error: null,
        });
    },
}));
