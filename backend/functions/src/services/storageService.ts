import { storage } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Storage Service
 * Handles file uploads to Firebase Storage
 */
export class StorageService {
  private bucket = storage.bucket();

  /**
   * Upload file to Firebase Storage
   * @param file - File buffer
   * @param fileName - Original file name
   * @param folder - Storage folder path (e.g., 'designs', 'custom-uploads')
   * @returns Public URL of uploaded file
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    folder: string = 'custom-designs'
  ): Promise<{ fileUrl: string; filePath: string }> {
    try {
      // Generate unique file name to prevent conflicts
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `${folder}/${uniqueFileName}`;

      // Create file reference
      const fileRef = this.bucket.file(filePath);

      // Upload file
      await fileRef.save(file, {
        metadata: {
          contentType: this.getContentType(fileExtension || ''),
          metadata: {
            originalName: fileName,
          },
        },
      });

      // Make file publicly accessible
      await fileRef.makePublic();

      // Get public URL
      const fileUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;

      return { fileUrl, filePath };
    } catch (error) {
      console.error('[StorageService] Upload error:', error);
      throw new Error(`Failed to upload file: ${(error as Error).message}`);
    }
  }

  /**
   * Delete file from Firebase Storage
   * @param filePath - Path to file in storage
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fileRef = this.bucket.file(filePath);
      await fileRef.delete();
      console.log(`[StorageService] Deleted file: ${filePath}`);
    } catch (error) {
      console.error('[StorageService] Delete error:', error);
      throw new Error(`Failed to delete file: ${(error as Error).message}`);
    }
  }

  /**
   * Get content type based on file extension
   */
  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      svg: 'image/svg+xml',
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
    };

    return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}

export const storageService = new StorageService();
