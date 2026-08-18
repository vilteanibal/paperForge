export interface SyncTeXForwardResponse {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SyncTeXReverseResponse {
    file: string;
    line: number;
    column: number;
}

export interface HighlightRect {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
}
