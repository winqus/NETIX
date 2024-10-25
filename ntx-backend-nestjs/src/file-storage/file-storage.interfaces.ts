export interface FileStorageConfig {}

export interface FileStorageArgs {
  container: string;
  fileName: string;
}

type Options = string | any;

export interface FileStorageUploadSingleFileArgs extends FileStorageArgs {
  content: Buffer | Uint8Array;
}

export interface FileStorageUploadStreamArgs extends FileStorageArgs {
  options?: Options;
}

export interface FileStorageDeleteFileArgs extends FileStorageArgs {}

export interface FileStorageDownloadFileArgs extends FileStorageArgs {}

export interface FileStorageDownloadStreamArgs extends FileStorageArgs {}

export interface FileStorageGetFileMetadataArgs extends FileStorageArgs {}
