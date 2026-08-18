export interface FileMetadata {
    path: string;
    name: string;
    extension: string;
    sizeBytes: number;
    mimeType: string;
    lastModified: number;
    isDir: boolean;
}

export interface WorkspaceTree {
    projectId: string;
    rootPath: string;
    nodes: FileMetadata[];
}
