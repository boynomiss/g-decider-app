/**
 * Featured Places Service
 * 
 * Handles CRUD operations for featured places in Firestore
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  writeBatch,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase-config';
import type { 
  FeaturedPlace, 
  CreateFeaturedPlaceRequest, 
  UpdateFeaturedPlaceRequest, 
  FeaturedPlaceQuery 
} from '../../../features/discovery/types/featured-place-types';

export class FeaturedPlacesService {
  private readonly collectionName = 'featured_places';

  /**
   * Create a new featured place
   */
  async createPlace(placeData: CreateFeaturedPlaceRequest): Promise<string> {
    try {
      const now = new Date().toISOString();
      const place: Omit<FeaturedPlace, 'id'> = {
        ...placeData,
        analytics: {
          impressions: 0,
          swipe_right: 0,
          swipe_left: 0,
          profile_views: 0,
          last_shown: null
        },
        metadata: {
          created_at: now,
          updated_at: now,
          created_by: 'admin', // TODO: Get from auth context
          status: 'active',
          version: 1
        }
      };

      const docRef = await addDoc(collection(db, this.collectionName), place);
      return docRef.id;
    } catch (error) {
      console.error('Error creating featured place:', error);
      throw new Error('Failed to create featured place');
    }
  }

  /**
   * Get a featured place by ID
   */
  async getPlaceById(placeId: string): Promise<FeaturedPlace | null> {
    try {
      const docRef = doc(db, this.collectionName, placeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FeaturedPlace;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting featured place:', error);
      throw new Error('Failed to get featured place');
    }
  }

  /**
   * Get all featured places with optional filtering
   */
  async getPlaces(queryParams: FeaturedPlaceQuery = {}): Promise<FeaturedPlace[]> {
    try {
      const constraints: QueryConstraint[] = [];
      
      // Add status filter (default to active)
      if (queryParams.status) {
        constraints.push(where('metadata.status', '==', queryParams.status));
      } else {
        constraints.push(where('metadata.status', '==', 'active'));
      }
      
      // Add category filter
      if (queryParams.category) {
        constraints.push(where('category', '==', queryParams.category));
      }
      
      // Add partnership tier filter
      if (queryParams.partnership_tier) {
        constraints.push(where('partnership.tier', '==', queryParams.partnership_tier));
      }
      
      // Add city filter
      if (queryParams.city) {
        constraints.push(where('location.city', '==', queryParams.city));
      }
      
      // Add tags filter (array contains)
      if (queryParams.tags && queryParams.tags.length > 0) {
        constraints.push(where('discovery.tags', 'array-contains-any', queryParams.tags));
      }
      
      // Add sorting
      const sortBy = queryParams.sort_by || 'created_at';
      const sortOrder = queryParams.sort_order || 'desc';
      constraints.push(orderBy(`metadata.${sortBy}`, sortOrder));
      
      // Add pagination
      if (queryParams.limit) {
        constraints.push(limit(queryParams.limit));
      }
      
      const q = query(collection(db, this.collectionName), ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeaturedPlace[];
    } catch (error) {
      console.error('Error getting featured places:', error);
      throw new Error('Failed to get featured places');
    }
  }

  /**
   * Update a featured place
   */
  async updatePlace(placeId: string, updateData: UpdateFeaturedPlaceRequest): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, placeId);
      const updatePayload = {
        ...updateData,
        metadata: {
          updated_at: new Date().toISOString(),
          version: (updateData.metadata?.version || 0) + 1
        }
      };
      
      await updateDoc(docRef, updatePayload);
    } catch (error) {
      console.error('Error updating featured place:', error);
      throw new Error('Failed to update featured place');
    }
  }

  /**
   * Delete a featured place
   */
  async deletePlace(placeId: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, placeId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting featured place:', error);
      throw new Error('Failed to delete featured place');
    }
  }

  /**
   * Soft delete - archive a featured place
   */
  async archivePlace(placeId: string): Promise<void> {
    try {
      await this.updatePlace(placeId, {
        id: placeId,
        metadata: {
          status: 'archived',
          updated_at: new Date().toISOString()
        }
      } as UpdateFeaturedPlaceRequest);
    } catch (error) {
      console.error('Error archiving featured place:', error);
      throw new Error('Failed to archive featured place');
    }
  }

  /**
   * Update analytics for a place
   */
  async updateAnalytics(placeId: string, analyticsUpdate: Partial<FeaturedPlace['analytics']>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, placeId);
      await updateDoc(docRef, {
        analytics: analyticsUpdate,
        'metadata.updated_at': new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating analytics:', error);
      throw new Error('Failed to update analytics');
    }
  }

  /**
   * Get places by multiple IDs
   */
  async getPlacesByIds(placeIds: string[]): Promise<FeaturedPlace[]> {
    try {
      const places: FeaturedPlace[] = [];
      
      // Firestore doesn't support 'in' queries with more than 10 items
      // So we'll batch them in groups of 10
      const batchSize = 10;
      for (let i = 0; i < placeIds.length; i += batchSize) {
        const batch = placeIds.slice(i, i + batchSize);
        const q = query(
          collection(db, this.collectionName),
          where('__name__', 'in', batch),
          where('metadata.status', '==', 'active')
        );
        
        const querySnapshot = await getDocs(q);
        const batchPlaces = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FeaturedPlace[];
        
        places.push(...batchPlaces);
      }
      
      return places;
    } catch (error) {
      console.error('Error getting places by IDs:', error);
      throw new Error('Failed to get places by IDs');
    }
  }

  /**
   * Search places by text
   */
  async searchPlaces(searchTerm: string, limit: number = 20): Promise<FeaturedPlace[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia or similar for production
      const q = query(
        collection(db, this.collectionName),
        where('metadata.status', '==', 'active'),
        orderBy('metadata.created_at', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const allPlaces = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeaturedPlace[];
      
      // Client-side filtering (basic implementation)
      const searchLower = searchTerm.toLowerCase();
      return allPlaces.filter(place => 
        place.name.toLowerCase().includes(searchLower) ||
        place.description.toLowerCase().includes(searchLower) ||
        place.location.city.toLowerCase().includes(searchLower) ||
        place.discovery.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    } catch (error) {
      console.error('Error searching places:', error);
      throw new Error('Failed to search places');
    }
  }
}

export const featuredPlacesService = new FeaturedPlacesService();
