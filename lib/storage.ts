// ============================================
// FaOnSisT - Storage Adapter Interface & Factory
// Abstracts file storage behind a common interface
// ============================================

/**
 * Common interface for all storage backends (local disk, S3, etc.)
 */
export interface StorageAdapter {
  /**
   * Upload a file buffer to storage.
   * @param file     - The file contents as a Buffer
   * @param filename - The original filename (used for extension extraction)
   * @param folder   - The logical folder/category (e.g. 'projects', 'vehicles')
   * @returns The storage path or URL to reference the file
   */
  upload(file: Buffer, filename: string, folder: string): Promise<string>;

  /**
   * Delete a file from storage.
   * @param filePath - The storage path returned from upload()
   */
  delete(filePath: string): Promise<void>;

  /**
   * Get the public/accessible URL for a stored file.
   * @param filePath - The storage path returned from upload()
   */
  getUrl(filePath: string): string;
}

// ---- Singleton cache ----
let _storageInstance: StorageAdapter | null = null;

/**
 * Factory function: returns the appropriate storage adapter based on
 * environment configuration.
 *
 * - If AWS_S3_BUCKET is set -> S3Storage (once implemented)
 * - Otherwise -> LocalStorage (default, saves to disk)
 */
export function getStorage(): StorageAdapter {
  if (_storageInstance) {
    return _storageInstance;
  }

  if (process.env.AWS_S3_BUCKET) {
    // S3 is configured - use S3 adapter
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { S3Storage } = require('./storage/s3') as typeof import('./storage/s3');
    _storageInstance = new S3Storage();
  } else {
    // Default: local disk storage
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { LocalStorage } = require('./storage/local') as typeof import('./storage/local');
    _storageInstance = new LocalStorage();
  }

  return _storageInstance;
}
