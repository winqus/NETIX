export async function import_FileTypeFromFile(): Promise<typeof import('file-type').fileTypeFromFile> {
  const { fileTypeFromFile } = (await eval('import("file-type")')) as typeof import('file-type');

  return fileTypeFromFile;
}
