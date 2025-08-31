/**
 * Image Upload Service
 * 
 * Handles image uploads for featured places
 */

import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageReference
} from 'firebase/storage';
import { getStorage } from '../lazy-firebase';
import type { ImageUploadRequest, ImageUploadResponse } from '../../../features/discovery/types/featured-place-types';

export class ImageUploadService {
  private readonly basePath = 'places';

  /**
   * Upload an image for a featured place
   */
  async uploadImage(request: ImageUploadRequest): Promise<ImageUploadResponse> {
    try {
      const { placeId, imageType, imageFile, imageName } = request;
      
      // Generate unique filename if not provided
      const fileName = imageName || `${Date.now()}_${imageFile.name}`;
      
      // Create storage reference
      const imagePath = `${this.basePath}/${placeId}/${imageType}/${fileName}`;
      const storageRef = ref(storage, imagePath);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, imageFile);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        path: imagePath
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        url: '',
        path: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Upload hero image for a place
   */
  async uploadHeroImage(placeId: string, imageFile: File): Promise<ImageUploadResponse> {
    return this.uploadImage({
      placeId,
      imageType: 'hero',
      imageFile,
      imageName: 'hero.jpg'
    });
  }

  /**
   * Upload gallery image for a place
   */
  async uploadGalleryImage(placeId: string, imageFile: File, imageName?: string): Promise<ImageUploadResponse> {
    return this.uploadImage({
      placeId,
      imageType: 'gallery',
      imageFile,
      imageName
    });
  }

  /**
   * Upload multiple gallery images
   */
  async uploadGalleryImages(placeId: string, imageFiles: File[]): Promise<ImageUploadResponse[]> {
    const uploadPromises = imageFiles.map((file, index) => 
      this.uploadGalleryImage(placeId, file, `gallery_${index + 1}.jpg`)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image
   */
  async deleteImage(imagePath: string): Promise<boolean> {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  /**
   * Delete all images for a place
   */
  async deletePlaceImages(placeId: string): Promise<boolean> {
    try {
      const placeRef = ref(storage, `${this.basePath}/${placeId}`);
      const result = await listAll(placeRef);
      
      // Delete all files recursively
      const deletePromises = result.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);
      
      return true;
    } catch (error) {
      console.error('Error deleting place images:', error);
      return false;
    }
  }

  /**
   * Get download URL for an image
   */
  async getImageURL(imagePath: string): Promise<string> {
    try {
      const imageRef = ref(storage, imagePath);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error getting image URL:', error);
      throw new Error('Failed to get image URL');
    }
  }

  /**
   * List all images for a place
   */
  async listPlaceImages(placeId: string): Promise<string[]> {
    try {
      const placeRef = ref(storage, `${this.basePath}/${placeId}`);
      const result = await listAll(placeRef);
      
      const imageUrls: string[] = [];
      
      // Get URLs for all images
      for (const item of result.items) {
        try {
          const url = await getDownloadURL(item);
          imageUrls.push(url);
        } catch (error) {
          console.warn(`Failed to get URL for ${item.fullPath}:`, error);
        }
      }
      
      return imageUrls;
    } catch (error) {
      console.error('Error listing place images:', error);
      return [];
    }
  }

  /**
   * Generate thumbnail URLs (placeholder - implement actual thumbnail generation)
   */
  async generateThumbnails(placeId: string): Promise<{ hero: string; gallery: string[] }> {
    try {
      // For now, return the same URLs as full images
      // In production, you'd want to implement actual thumbnail generation
      const heroUrl = await this.getImageURL(`${this.basePath}/${placeId}/hero/hero.jpg`);
      const galleryUrls = await this.listPlaceImages(placeId);
      
      return {
        hero: heroUrl,
        gallery: galleryUrls
      };
    } catch (error) {
      console.error('Error generating thumbnails:', error);
      return {
        hero: '',
        gallery: []
      };
    }
  }

  /**
   * Validate image file
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return { valid: false, error: 'File must be an image' };
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }
    
    // Check dimensions (optional - could be implemented with canvas)
    return { valid: true };
  }

  /**
   * Compress image before upload (placeholder)
   */
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    // This is a placeholder - implement actual image compression
    // You could use canvas API or a library like browser-image-compression
    return file;
  }
}

export const imageUploadService = new ImageUploadService();
