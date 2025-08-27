/**
 * Featured Places Hook
 * 
 * React hook for managing featured places data and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { featuredPlacesService } from '../../../services/firebase/firestore/featured-places-service';
import { imageUploadService } from '../../../services/firebase/storage/image-upload-service';
import { analyticsService } from '../../../services/firebase/firestore/analytics-service';
import type { 
  FeaturedPlace, 
  CreateFeaturedPlaceRequest, 
  UpdateFeaturedPlaceRequest, 
  FeaturedPlaceQuery 
} from '../types/featured-place-types';

export const useFeaturedPlaces = () => {
  const [places, setPlaces] = useState<FeaturedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load featured places
   */
  const loadPlaces = useCallback(async (query?: FeaturedPlaceQuery) => {
    try {
      setLoading(true);
      setError(null);
      
      const loadedPlaces = await featuredPlacesService.getPlaces(query);
      setPlaces(loadedPlaces);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load places';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new featured place
   */
  const createPlace = useCallback(async (placeData: CreateFeaturedPlaceRequest): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const placeId = await featuredPlacesService.createPlace(placeData);
      
      // Reload places to include the new one
      await loadPlaces();
      
      return placeId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create place';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [loadPlaces]);

  /**
   * Update a featured place
   */
  const updatePlace = useCallback(async (placeId: string, updateData: UpdateFeaturedPlaceRequest): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await featuredPlacesService.updatePlace(placeId, updateData);
      
      // Update local state
      setPlaces(prevPlaces => 
        prevPlaces.map(place => 
          place.id === placeId 
            ? { ...place, ...updateData }
            : place
        )
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update place';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a featured place
   */
  const deletePlace = useCallback(async (placeId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await featuredPlacesService.deletePlace(placeId);
      
      // Remove from local state
      setPlaces(prevPlaces => prevPlaces.filter(place => place.id !== placeId));
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete place';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Archive a featured place
   */
  const archivePlace = useCallback(async (placeId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await featuredPlacesService.archivePlace(placeId);
      
      // Update local state
      setPlaces(prevPlaces => 
        prevPlaces.map(place => 
          place.id === placeId 
            ? { ...place, metadata: { ...place.metadata, status: 'archived' } }
            : place
        )
      );
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive place';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Upload hero image
   */
  const uploadHeroImage = useCallback(async (placeId: string, imageFile: File): Promise<string | null> => {
    try {
      const result = await imageUploadService.uploadHeroImage(placeId, imageFile);
      
      if (result.success) {
        // Update local state with new image URL
        setPlaces(prevPlaces => 
          prevPlaces.map(place => 
            place.id === placeId 
              ? { ...place, images: { ...place.images, hero: result.url } }
              : place
          )
        );
        
        return result.url;
      } else {
        setError(result.error || 'Failed to upload image');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
      setError(errorMessage);
      return null;
    }
  }, []);

  /**
   * Upload gallery images
   */
  const uploadGalleryImages = useCallback(async (placeId: string, imageFiles: File[]): Promise<string[]> => {
    try {
      const results = await imageUploadService.uploadGalleryImages(placeId, imageFiles);
      
      const successfulUploads = results.filter(result => result.success);
      const imageUrls = successfulUploads.map(result => result.url);
      
      if (successfulUploads.length > 0) {
        // Update local state with new gallery images
        setPlaces(prevPlaces => 
          prevPlaces.map(place => 
            place.id === placeId 
              ? { 
                  ...place, 
                  images: { 
                    ...place.images, 
                    gallery: [...place.images.gallery, ...imageUrls] 
                  } 
                }
              : place
          )
        );
      }
      
      // Show errors for failed uploads
      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length > 0) {
        const errorMessages = failedUploads.map(result => result.error).filter(Boolean);
        if (errorMessages.length > 0) {
          setError(`Some images failed to upload: ${errorMessages.join(', ')}`);
        }
      }
      
      return imageUrls;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload images';
      setError(errorMessage);
      return [];
    }
  }, []);

  /**
   * Record analytics events
   */
  const recordImpression = useCallback(async (placeId: string) => {
    try {
      await analyticsService.recordImpression(placeId);
    } catch (err) {
      console.warn('Failed to record impression:', err);
    }
  }, []);

  const recordSwipe = useCallback(async (placeId: string, direction: 'right' | 'left') => {
    try {
      await analyticsService.recordSwipe(placeId, direction);
    } catch (err) {
      console.warn('Failed to record swipe:', err);
    }
  }, []);

  const recordProfileView = useCallback(async (placeId: string) => {
    try {
      await analyticsService.recordProfileView(placeId);
    } catch (err) {
      console.warn('Failed to record profile view:', err);
    }
  }, []);

  /**
   * Search places
   */
  const searchPlaces = useCallback(async (searchTerm: string, limit: number = 20): Promise<FeaturedPlace[]> => {
    try {
      return await featuredPlacesService.searchPlaces(searchTerm, limit);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search places';
      setError(errorMessage);
      return [];
    }
  }, []);

  /**
   * Get place by ID
   */
  const getPlaceById = useCallback(async (placeId: string): Promise<FeaturedPlace | null> => {
    try {
      return await featuredPlacesService.getPlaceById(placeId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get place';
      setError(errorMessage);
      return null;
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    places,
    loading,
    error,
    
    // Actions
    loadPlaces,
    createPlace,
    updatePlace,
    deletePlace,
    archivePlace,
    uploadHeroImage,
    uploadGalleryImages,
    recordImpression,
    recordSwipe,
    recordProfileView,
    searchPlaces,
    getPlaceById,
    clearError
  };
};
