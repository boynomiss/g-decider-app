import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Firebase Caching System for Places Data
 * 
 * This module provides intelligent caching for places data using Firestore.
 * It enables faster responses and reduced API costs by storing processed
 * place data and querying it before making expensive external API calls.
 */

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Read the service account credentials
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 
                              join(process.cwd(), 'firebase-adminsdk.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'g-decider-backend',
      databaseURL: `https://g-decider-backend-default-rtdb.firebaseio.com`,
    });

    console.log('✅ Firebase Admin SDK initialized for caching');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK for caching:', error);
    throw new Error('Firebase Admin SDK initialization failed');
  }
}

/**
 * Get Firestore instance
 */
function getFirestore(): admin.firestore.Firestore {
  const app = initializeFirebaseAdmin();
  return app.firestore();
}

/**
 * Interface for cached place data
 */
export interface CachedPlace {
  id: string;
  name: string;
  location: string;
  images: string[];
  budget: 'P' | 'PP' | 'PPP';
  tags: string[];
  description: string;
  category: 'food' | 'activity' | 'something-new';
  mood: 'chill' | 'hype' | 'both';
  socialContext: ('solo' | 'with-bae' | 'barkada')[];
  timeOfDay: ('morning' | 'afternoon' | 'night')[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  reviewCount?: number;
  website?: string;
  phone?: string;
  cachedAt: Date;
  queryHash: string; // Hash of the query parameters for efficient lookup
  lastAccessed: Date;
  accessCount: number;
}

/**
 * Interface for query parameters
 */
export interface QueryParams {
  mood?: number;
  category?: 'food' | 'activity' | 'something-new';
  budget?: 'P' | 'PP' | 'PPP';
  timeOfDay?: 'morning' | 'afternoon' | 'night';
  socialContext?: 'solo' | 'with-bae' | 'barkada';
  distanceRange?: number;
  location?: string;
  tags?: string[];
}

/**
 * Generate a hash for query parameters to enable efficient caching
 */
function generateQueryHash(params: QueryParams): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      if (params[key as keyof QueryParams] !== undefined) {
        result[key] = params[key as keyof QueryParams];
      }
      return result;
    }, {} as any);
  
  return Buffer.from(JSON.stringify(sortedParams)).toString('base64');
}

/**
 * Cache places data in Firestore
 * @param placesData Array of place objects to cache
 * @param queryParams Original query parameters used to fetch the data
 */
export async function cachePlaces(
  placesData: any[], 
  queryParams: QueryParams
): Promise<void> {
  try {
    const firestore = getFirestore();
    const queryHash = generateQueryHash(queryParams);
    const batch = firestore.batch();
    const collection = firestore.collection('placesCache');

    console.log(`📦 Caching ${placesData.length} places with query hash: ${queryHash}`);

    for (const place of placesData) {
      const cachedPlace: CachedPlace = {
        id: place.id || `place_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: place.name,
        location: place.location,
        images: place.images || [],
        budget: place.budget,
        tags: place.tags || [],
        description: place.description,
        category: place.category,
        mood: place.mood,
        socialContext: place.socialContext || [],
        timeOfDay: place.timeOfDay || [],
        coordinates: place.coordinates,
        rating: place.rating,
        reviewCount: place.reviewCount,
        website: place.website,
        phone: place.phone,
        cachedAt: new Date(),
        queryHash,
        lastAccessed: new Date(),
        accessCount: 0
      };

      const docRef = collection.doc(cachedPlace.id);
      batch.set(docRef, cachedPlace, { merge: true });
    }

    await batch.commit();
    console.log(`✅ Successfully cached ${placesData.length} places`);

  } catch (error) {
    console.error('❌ Error caching places:', error);
    throw new Error(`Failed to cache places: ${error.message}`);
  }
}

/**
 * Get cached places from Firestore based on query parameters
 * @param queryParams Query parameters to match against cached data
 * @param minResults Minimum number of results required (default: 5)
 * @returns Array of cached places or null if insufficient results
 */
export async function getCachedPlaces(
  queryParams: QueryParams,
  minResults: number = 5
): Promise<CachedPlace[] | null> {
  try {
    const firestore = getFirestore();
    const queryHash = generateQueryHash(queryParams);
    const collection = firestore.collection('placesCache');

    console.log(`🔍 Searching cache for query hash: ${queryHash}`);

    // Query by query hash for exact matches
    const snapshot = await collection
      .where('queryHash', '==', queryHash)
      .orderBy('lastAccessed', 'desc')
      .limit(20)
      .get();

    if (snapshot.empty) {
      console.log('📭 No exact cache match found');
      return null;
    }

    const cachedPlaces = snapshot.docs.map(doc => {
      const data = doc.data() as CachedPlace;
      return {
        ...data,
        cachedAt: data.cachedAt.toDate(),
        lastAccessed: data.lastAccessed.toDate()
      };
    });

    console.log(`📋 Found ${cachedPlaces.length} cached places`);

    // Update access statistics
    await updateAccessStats(cachedPlaces);

    // Return results if we have enough
    if (cachedPlaces.length >= minResults) {
      console.log(`✅ Returning ${cachedPlaces.length} cached places (min: ${minResults})`);
      return cachedPlaces;
    }

    console.log(`⚠️  Insufficient cached results (${cachedPlaces.length}/${minResults})`);
    return null;

  } catch (error) {
    console.error('❌ Error retrieving cached places:', error);
    return null;
  }
}

/**
 * Update access statistics for cached places
 */
async function updateAccessStats(cachedPlaces: CachedPlace[]): Promise<void> {
  try {
    const firestore = getFirestore();
    const batch = firestore.batch();
    const collection = firestore.collection('placesCache');

    for (const place of cachedPlaces) {
      const docRef = collection.doc(place.id);
      batch.update(docRef, {
        lastAccessed: new Date(),
        accessCount: admin.firestore.FieldValue.increment(1)
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('❌ Error updating access stats:', error);
  }
}

/**
 * Search cached places with fuzzy matching
 * @param queryParams Query parameters
 * @param minResults Minimum number of results required
 * @returns Array of cached places or null if insufficient results
 */
export async function searchCachedPlaces(
  queryParams: QueryParams,
  minResults: number = 5
): Promise<CachedPlace[] | null> {
  try {
    const firestore = getFirestore();
    const collection = firestore.collection('placesCache');

    console.log(`🔍 Fuzzy searching cache for query parameters`);

    // Build query based on available parameters
    let query = collection;

    if (queryParams.category) {
      query = query.where('category', '==', queryParams.category);
    }

    if (queryParams.budget) {
      query = query.where('budget', '==', queryParams.budget);
    }

    if (queryParams.mood !== undefined) {
      const moodCategory = queryParams.mood < 33 ? 'chill' : 
                          queryParams.mood > 66 ? 'hype' : 'both';
      query = query.where('mood', '==', moodCategory);
    }

    const snapshot = await query
      .orderBy('lastAccessed', 'desc')
      .limit(50)
      .get();

    if (snapshot.empty) {
      console.log('📭 No fuzzy cache matches found');
      return null;
    }

    const cachedPlaces = snapshot.docs.map(doc => {
      const data = doc.data() as CachedPlace;
      return {
        ...data,
        cachedAt: data.cachedAt.toDate(),
        lastAccessed: data.lastAccessed.toDate()
      };
    });

    console.log(`📋 Found ${cachedPlaces.length} fuzzy cached places`);

    // Update access statistics
    await updateAccessStats(cachedPlaces);

    // Return results if we have enough
    if (cachedPlaces.length >= minResults) {
      console.log(`✅ Returning ${cachedPlaces.length} fuzzy cached places (min: ${minResults})`);
      return cachedPlaces;
    }

    console.log(`⚠️  Insufficient fuzzy cached results (${cachedPlaces.length}/${minResults})`);
    return null;

  } catch (error) {
    console.error('❌ Error fuzzy searching cached places:', error);
    return null;
  }
}

/**
 * Clear old cached data (cleanup function)
 * @param daysOld Number of days old to consider for deletion
 */
export async function clearOldCache(daysOld: number = 30): Promise<void> {
  try {
    const firestore = getFirestore();
    const collection = firestore.collection('placesCache');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    console.log(`🧹 Clearing cache older than ${daysOld} days`);

    const snapshot = await collection
      .where('cachedAt', '<', cutoffDate)
      .get();

    if (snapshot.empty) {
      console.log('✅ No old cache entries to clear');
      return;
    }

    const batch = firestore.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`✅ Cleared ${snapshot.docs.length} old cache entries`);

  } catch (error) {
    console.error('❌ Error clearing old cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalPlaces: number;
  totalQueries: number;
  averageAccessCount: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  try {
    const firestore = getFirestore();
    const collection = firestore.collection('placesCache');

    const snapshot = await collection.get();
    
    if (snapshot.empty) {
      return {
        totalPlaces: 0,
        totalQueries: 0,
        averageAccessCount: 0,
        oldestEntry: null,
        newestEntry: null
      };
    }

    const places = snapshot.docs.map(doc => doc.data() as CachedPlace);
    const totalAccessCount = places.reduce((sum, place) => sum + (place.accessCount || 0), 0);

    return {
      totalPlaces: places.length,
      totalQueries: new Set(places.map(p => p.queryHash)).size,
      averageAccessCount: totalAccessCount / places.length,
      oldestEntry: new Date(Math.min(...places.map(p => p.cachedAt.getTime()))),
      newestEntry: new Date(Math.max(...places.map(p => p.cachedAt.getTime())))
    };

  } catch (error) {
    console.error('❌ Error getting cache stats:', error);
    throw error;
  }
}

/**
 * Test the caching system
 */
export async function testCacheSystem(): Promise<void> {
  console.log('🧪 Testing Firebase Cache System\n');

  try {
    // Test 1: Initialize Firebase
    console.log('1️⃣ Testing Firebase initialization...');
    const firestore = getFirestore();
    console.log('✅ Firebase initialized successfully\n');

    // Test 2: Test cache write
    console.log('2️⃣ Testing cache write...');
    const testPlaces = [
      {
        id: 'test_place_1',
        name: 'Test Restaurant',
        location: 'Test Location',
        images: ['test_image_1.jpg'],
        budget: 'PP' as const,
        tags: ['test', 'restaurant'],
        description: 'A test restaurant',
        category: 'food' as const,
        mood: 'chill' as const,
        socialContext: ['solo'] as const,
        timeOfDay: ['afternoon'] as const
      }
    ];

    const testQuery = {
      category: 'food' as const,
      budget: 'PP' as const,
      mood: 25
    };

    await cachePlaces(testPlaces, testQuery);
    console.log('✅ Cache write test successful\n');

    // Test 3: Test cache read
    console.log('3️⃣ Testing cache read...');
    const cachedResults = await getCachedPlaces(testQuery, 1);
    
    if (cachedResults && cachedResults.length > 0) {
      console.log('✅ Cache read test successful');
      console.log(`   Found ${cachedResults.length} cached places\n`);
    } else {
      console.log('⚠️  Cache read test failed - no results found\n');
    }

    // Test 4: Test cache stats
    console.log('4️⃣ Testing cache statistics...');
    const stats = await getCacheStats();
    console.log('✅ Cache stats test successful');
    console.log(`   Total places: ${stats.totalPlaces}`);
    console.log(`   Total queries: ${stats.totalQueries}`);
    console.log(`   Average access count: ${stats.averageAccessCount.toFixed(2)}\n`);

    console.log('🎉 Firebase Cache System test completed successfully!');

  } catch (error) {
    console.error('❌ Firebase Cache System test failed:', error);
    throw error;
  }
}

// Export for testing
if (require.main === module) {
  testCacheSystem();
} 