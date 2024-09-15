export interface FileStorageConfig {}

export interface FileStorageArgs {
  container: string;
  fileName: string;
}

export interface FileStorageUploadSingleFileArgs extends FileStorageArgs {
  content: Buffer | Uint8Array;
}

export interface FileStorageUploadStreamArgs extends FileStorageArgs {}

export interface FileStorageDeleteFileArgs extends FileStorageArgs {}
