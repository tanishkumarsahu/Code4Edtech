/**
 * Cloudinary File Upload Service
 * File storage service for hackathon projects
 */

import { UploadProgress } from '@/types';

export interface CloudinaryUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (url: string) => void;
  onError?: (error: Error) => void;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  created_at: string;
}

/**
 * Cloudinary Upload Service
 */
export class CloudinaryService {
  private static instance: CloudinaryService;
  private cloudName: string;
  
  constructor() {
    this.cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    
    if (!this.cloudName) {
      console.warn('Cloudinary cloud name not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to your environment variables.');
    }
  }

  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  /**
   * Upload file to Cloudinary
   */
  public async uploadFile(
    file: File,
    folder: string = 'resumes',
    options: CloudinaryUploadOptions = {}
  ): Promise<string> {
    if (!this.cloudName) {
      throw new Error('Cloudinary not configured. Please add your cloud name to environment variables.');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // Default unsigned preset
      formData.append('folder', folder);
      
      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              progress: (event.loaded / event.total) * 100,
              bytesTransferred: event.loaded,
              totalBytes: event.total,
              state: 'running',
            };
            options.onProgress?.(progress);
          }
        });

        // Success handler
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const result: CloudinaryUploadResult = JSON.parse(xhr.responseText);
              options.onComplete?.(result.secure_url);
              resolve(result.secure_url);
            } catch (error) {
              const parseError = new Error('Failed to parse upload response');
              options.onError?.(parseError);
              reject(parseError);
            }
          } else {
            const uploadError = new Error(`Upload failed with status: ${xhr.status}`);
            options.onError?.(uploadError);
            reject(uploadError);
          }
        });

        // Error handler
        xhr.addEventListener('error', () => {
          const networkError = new Error('Network error during upload');
          options.onError?.(networkError);
          reject(networkError);
        });

        // Send request
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`);
        xhr.send(formData);
      });

    } catch (error) {
      const uploadError = error instanceof Error ? error : new Error('Upload failed');
      options.onError?.(uploadError);
      throw uploadError;
    }
  }

  /**
   * Delete file from Cloudinary (requires backend API)
   */
  public async deleteFile(publicId: string): Promise<void> {
    // Note: Deletion requires API secret, so this should be done on the backend
    console.warn('File deletion should be implemented on the backend for security');
    throw new Error('File deletion must be implemented on the backend');
  }

  /**
   * Get optimized URL for file
   */
  public getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'pdf' | 'jpg' | 'png';
    } = {}
  ): string {
    if (!this.cloudName) {
      return '';
    }

    const transformations = [];
    
    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    
    const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';
    
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/${transformString}${publicId}`;
  }
}

// Export singleton instance
export const cloudinaryService = CloudinaryService.getInstance();
