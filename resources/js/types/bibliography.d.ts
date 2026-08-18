export interface BibEntry {
    citationKey: string;
    type: string;
    title: string | null;
    author: string | null;
    year: string | null;
    journal: string | null;
    fields?: Record<string, string>;
}

export interface BibliographyResponse {
    data: BibEntry[];
    total: number;
}
