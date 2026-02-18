// ============================================
// FaOnSisT - Local Disk Storage Adapter
// Saves uploaded files to the local filesystem
// ============================================

import { writeFile, mkdir, unlink, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { StorageAdapter } from '../storage';

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

/**
 * Generate a unique stored filename preserving the original extension.
 * Format: {timestamp}-{random8hex}{ext}
 */
function generateStoredName(originalName: string): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  return `${timestamp}-${random}${ext}`;
}

export class LocalStorage implements StorageAdapter {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || UPLOAD_DIR;
  }

  /**
   * Write a file buffer to disk under {baseDir}/{folder}/{storedName}.
   * Creates subdirectories as needed.
   * Returns the relative URL path: /uploads/{folder}/{storedName}
   */
  async upload(file: Buffer, filename: string, folder: string): Promise<string> {
    const storedName = generateStoredName(filename);
    const folderPath = path.join(this.baseDir, folder);

    // Ensure the target directory exists
    if (!existsSync(folderPath)) {
      await mkdir(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, storedName);
    await writeFile(filePath, file);

    // Return the URL-style path (relative to app root)
    return `/uploads/${folder}/${storedName}`;
  }

  /**
   * Delete a file from disk given its storage path (e.g. /uploads/general/abc.pdf).
   */
  async delete(storagePath: string): Promise<void> {
    // storagePath looks like "/uploads/folder/file.ext"
    // Strip the leading "/uploads/" to get the relative fs path
    const relative = storagePath.replace(/^\/uploads\//, '');
    const fullPath = path.join(this.baseDir, relative);

    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  }

  /**
   * Return the public URL for a stored file path.
   */
  getUrl(storagePath: string): string {
    // Already in URL format
    return storagePath;
  }

  /**
   * Read a file from disk and return the buffer.
   * Useful for the GET streaming endpoint.
   */
  async read(storagePath: string): Promise<Buffer> {
    const relative = storagePath.replace(/^\/uploads\//, '');
    const fullPath = path.join(this.baseDir, relative);
    return readFile(fullPath);
  }

  /**
   * Resolve a storage path to an absolute filesystem path.
   */
  resolveFullPath(storagePath: string): string {
    const relative = storagePath.replace(/^\/uploads\//, '');
    return path.join(this.baseDir, relative);
  }
}
