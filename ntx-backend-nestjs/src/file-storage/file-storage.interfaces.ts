export interface FileStorageConfig {}

export interface FileStorageArgs {
  container: string;
  fileName: string;
}

export interface FileStorageUploadSingleFileArgs extends FileStorageArgs {
  content: Buffer | Uint8Array;
}
