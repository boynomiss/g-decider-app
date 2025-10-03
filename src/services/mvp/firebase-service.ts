/**
 * MVP Firebase Service - Simplified database operations
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { firebaseConfig } from '../../config/firebase-config';
import { Place, UserPreferences } from '../../types/mvp-types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection names
const COLLECTIONS = {
  PLACES: 'places',
  CATEGORIES: 'categories',
  USERS: 'users',
} as const;

/**
 * Places Service
 */
export class PlacesService {
  /**
   * Add a new place
   */
  static async addPlace(place: Omit<Place, 'id' | 'metadata'>): Promise<string> {
    try {
      const placeWithMetadata = {
        ...place,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin', // TODO: Get from auth
          status: 'active' as const,
        },
      };

      const docRef = await addDoc(collection(db, COLLECTIONS.PLACES), placeWithMetadata);
      return docRef.id;
    } catch (error) {
      console.error('Error adding place:', error);
      throw new Error('Failed to add place');
    }
  }

  /**
   * Get all places
   */
  static async getAllPlaces(): Promise<Place[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.PLACES));
      const places: Place[] = [];
      
      querySnapshot.forEach((doc) => {
        places.push({
          id: doc.id,
          ...doc.data(),
        } as Place);
      });
      
      console.log(`📊 Found ${places.length} places in database`);
      return places;
    } catch (error) {
      console.error('Error getting places:', error);
      throw new Error('Failed to get places');
    }
  }

  /**
   * Check if database has any places
   */
  static async hasPlaces(): Promise<boolean> {
    try {
      const places = await this.getAllPlaces();
      return places.length > 0;
    } catch (error) {
      console.error('Error checking places:', error);
      return false;
    }
  }

  /**
   * Add sample places if database is empty
   */
  static async addSamplePlaces(): Promise<void> {
    try {
      const hasData = await this.hasPlaces();
      if (hasData) {
        console.log('📊 Database already has places, skipping sample data');
        return;
      }

      console.log('📊 Adding sample places to database...');
      
      const samplePlaces: Omit<Place, 'id' | 'metadata'>[] = [
        {
          name: "Café Luna",
          category: "food",
          description: "Cozy coffee shop with artisanal pastries and specialty drinks",
          location: {
            address: "123 Main Street",
            city: "Manila",
            lat: 14.5995,
            lng: 120.9842
          },
          contact: {
            phone: "+63 2 1234 5678",
            website: "https://cafeluna.com"
          },
          businessInfo: {
            hours: "7:00 AM - 10:00 PM",
            priceRange: "₱₱",
            features: ["WiFi", "Outdoor Seating", "Pet Friendly"]
          },
          images: {
            hero: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400",
            gallery: []
          },
          discovery: {
            tags: ["coffee", "pastries", "cozy", "work-friendly"],
            perfectFor: ["morning coffee", "work meetings", "casual dates"],
            moodScore: 75,
            uniqueFeatures: "Hand-painted murals and live acoustic music on weekends"
          }
        },
        {
          name: "Sunset Rooftop Bar",
          category: "nightlife",
          description: "Rooftop bar with stunning city views and craft cocktails",
          location: {
            address: "456 Sky Tower",
            city: "Makati",
            lat: 14.5547,
            lng: 121.0244
          },
          contact: {
            phone: "+63 2 8765 4321",
            website: "https://sunsetrooftop.com"
          },
          businessInfo: {
            hours: "5:00 PM - 2:00 AM",
            priceRange: "₱₱₱",
            features: ["Rooftop", "Live Music", "City Views"]
          },
          images: {
            hero: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400",
            gallery: []
          },
          discovery: {
            tags: ["rooftop", "cocktails", "sunset", "romantic"],
            perfectFor: ["date night", "celebrations", "sunset drinks"],
            moodScore: 85,
            uniqueFeatures: "360-degree city views and signature sunset cocktails"
          }
        },
        {
          name: "Green Park",
          category: "outdoor",
          description: "Large urban park perfect for jogging, picnics, and outdoor activities",
          location: {
            address: "789 Park Avenue",
            city: "Quezon City",
            lat: 14.6760,
            lng: 121.0437
          },
          contact: {
            phone: "+63 2 5555 1234"
          },
          businessInfo: {
            hours: "5:00 AM - 10:00 PM",
            priceRange: "₱",
            features: ["Free Entry", "Jogging Track", "Playground", "Picnic Areas"]
          },
          images: {
            hero: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
            gallery: []
          },
          discovery: {
            tags: ["park", "nature", "exercise", "family-friendly"],
            perfectFor: ["morning jog", "family time", "outdoor activities"],
            moodScore: 60,
            uniqueFeatures: "Largest urban park in the city with dedicated bike lanes"
          }
        }
      ];

      for (const place of samplePlaces) {
        await this.addPlace(place);
      }

      console.log(`✅ Added ${samplePlaces.length} sample places to database`);
    } catch (error) {
      console.error('Error adding sample places:', error);
      throw new Error('Failed to add sample places');
    }
  }

  /**
   * Get places by category
   */
  static async getPlacesByCategory(category: string): Promise<Place[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.PLACES),
        where('category', '==', category),
        where('metadata.status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      const places: Place[] = [];
      
      querySnapshot.forEach((doc) => {
        places.push({
          id: doc.id,
          ...doc.data(),
        } as Place);
      });
      
      return places;
    } catch (error) {
      console.error('Error getting places by category:', error);
      throw new Error('Failed to get places by category');
    }
  }

  /**
   * Get places by mood score range
   */
  static async getPlacesByMood(moodScore: number, tolerance: number = 30): Promise<Place[]> {
    try {
      const minMood = Math.max(1, moodScore - tolerance);
      const maxMood = Math.min(100, moodScore + tolerance);
      
      // First get all active places, then filter by mood in memory
      // This avoids the composite index requirement
      const q = query(
        collection(db, COLLECTIONS.PLACES),
        where('metadata.status', '==', 'active')
      );
      
      const querySnapshot = await getDocs(q);
      const places: Place[] = [];
      
      querySnapshot.forEach((doc) => {
        const placeData = doc.data();
        const placeMoodScore = placeData.discovery?.moodScore || 50;
        
        // Filter by mood score range in memory
        if (placeMoodScore >= minMood && placeMoodScore <= maxMood) {
          places.push({
            ...placeData,
            id: doc.id,
          } as Place);
        }
      });
      
      return places;
    } catch (error) {
      console.error('Error getting places by mood:', error);
      throw new Error('Failed to get places by mood');
    }
  }

  /**
   * Search places with filters
   */
  static async searchPlaces(preferences: UserPreferences): Promise<Place[]> {
    try {
      let places: Place[] = [];
      
      // Get places by selected categories
      if (preferences.lookingFor.length > 0) {
        for (const category of preferences.lookingFor) {
          const categoryPlaces = await this.getPlacesByCategory(category);
          places.push(...categoryPlaces);
        }
      } else {
        // If no categories selected, get all places
        places = await this.getAllPlaces();
      }
      
      // Filter by mood
      if (preferences.mood > 0) {
        const moodPlaces = await this.getPlacesByMood(preferences.mood);
        // Intersect with category results
        const moodPlaceIds = new Set(moodPlaces.map(p => p.id));
        places = places.filter(p => moodPlaceIds.has(p.id));
      }
      
      // Remove duplicates
      const uniquePlaces = places.filter((place, index, self) => 
        index === self.findIndex(p => p.id === place.id)
      );
      
      return uniquePlaces;
    } catch (error) {
      console.error('Error searching places:', error);
      throw new Error('Failed to search places');
    }
  }

  /**
   * Update a place
   */
  static async updatePlace(placeId: string, updates: Partial<Place>): Promise<void> {
    try {
      const placeRef = doc(db, COLLECTIONS.PLACES, placeId);
      await updateDoc(placeRef, {
        ...updates,
        'metadata.updatedAt': new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating place:', error);
      throw new Error('Failed to update place');
    }
  }

  /**
   * Delete a place (soft delete)
   */
  static async deletePlace(placeId: string): Promise<void> {
    try {
      const placeRef = doc(db, COLLECTIONS.PLACES, placeId);
      await updateDoc(placeRef, {
        'metadata.status': 'archived',
        'metadata.updatedAt': new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error deleting place:', error);
      throw new Error('Failed to delete place');
    }
  }
}

/**
 * Categories Service
 */
export class CategoriesService {
  /**
   * Get all categories
   */
  static async getAllCategories() {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
      const categories: any[] = [];
      
      querySnapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to get categories');
    }
  }
}

/**
 * Users Service
 */
export class UsersService {
  /**
   * Save user preferences
   */
  static async saveUserPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        preferences,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userDoc = await getDocs(query(collection(db, COLLECTIONS.USERS), where('id', '==', userId)));
      
      if (!userDoc.empty && userDoc.docs.length > 0) {
        const firstDoc = userDoc.docs[0];
        if (firstDoc) {
          const userData = firstDoc.data();
          return userData.preferences || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw new Error('Failed to get user preferences');
    }
  }
}
