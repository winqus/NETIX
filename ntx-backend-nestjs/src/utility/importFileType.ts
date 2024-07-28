/**
 * Imports the `fileTypeFromFile` function from the 'file-type' module.
 * Because `file-type` only supports ESM projects, this function uses `eval` to import the module.
 * @returns A promise that resolves to the `fileTypeFromFile` function.
 */
export async function import_FileTypeFromFile(): Promise<typeof import('file-type').fileTypeFromFile> {
  const { fileTypeFromFile } = (await eval('import("file-type")')) as typeof import('file-type');

  return fileTypeFromFile;
}
