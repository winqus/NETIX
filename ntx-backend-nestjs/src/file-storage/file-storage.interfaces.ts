export interface FileStorageConfig {}

export interface FileStorageArgs {
  container: string;
  fileName: string;
}

type Options = string | any;

export interface FileStorageUploadSingleFileArgs extends FileStorageArgs {
  content: Buffer | Uint8Array;
  overwriteIfExists?: boolean;
}

export interface FileStorageUploadStreamArgs extends FileStorageArgs {
  options?: Options;
}

export interface FileStorageDeleteFileArgs extends FileStorageArgs {}

export interface FileStorageDownloadFileArgs extends FileStorageArgs {}

export interface FileStorageDownloadStreamArgs extends FileStorageArgs {
  options?: Options;
}

export interface FileStorageGetFileMetadataArgs extends FileStorageArgs {}

export interface FileStorageListFilesArgs {
  container: string;
}
