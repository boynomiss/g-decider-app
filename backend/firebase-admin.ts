import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Firebase Admin SDK Configuration
 * 
 * This module initializes Firebase Admin SDK using the service account credentials.
 * It provides secure access to Firebase services from server-side code.
 */

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK
 * Uses the service account credentials from firebase-adminsdk.json
 */
export function initializeFirebaseAdmin(): admin.app.App {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Try to read the service account credentials
    const serviceAccountPath = join(process.cwd(), 'firebase-adminsdk.json');
    let serviceAccount;
    
    try {
      serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    } catch (error) {
      // If firebase-adminsdk.json doesn't exist, try using the Google service account
      const googleServiceAccountPath = join(process.cwd(), 'google-service-account.json');
      try {
        serviceAccount = JSON.parse(readFileSync(googleServiceAccountPath, 'utf8'));
      } catch (googleError) {
        console.warn('⚠️ No Firebase service account found. Using default credentials.');
        // Use default credentials (for development)
        firebaseApp = admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'g--decider-app',
        });
        return firebaseApp;
      }
    }

    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID || 'g--decider-app',
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    
    // Fallback to default initialization
    try {
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'g--decider-app',
      });
      console.log('✅ Firebase Admin SDK initialized with default credentials');
      return firebaseApp;
    } catch (fallbackError) {
      console.error('❌ Failed to initialize Firebase Admin SDK with default credentials:', fallbackError);
      throw new Error('Firebase Admin SDK initialization failed');
    }
  }
}

/**
 * Get Firebase Admin SDK instance
 */
export function getFirebaseAdmin(): admin.app.App {
  if (!firebaseApp) {
    return initializeFirebaseAdmin();
  }
  return firebaseApp;
}

/**
 * Get Firestore database instance
 */
export function getFirestore(): admin.firestore.Firestore {
  const app = getFirebaseAdmin();
  return app.firestore();
}

/**
 * Get Realtime Database instance
 */
export function getDatabase(): admin.database.Database {
  const app = getFirebaseAdmin();
  return app.database();
}

/**
 * Get Authentication instance
 */
export function getAuth(): admin.auth.Auth {
  const app = getFirebaseAdmin();
  return app.auth();
}

/**
 * Get Storage instance
 */
export function getStorage(): admin.storage.Storage {
  const app = getFirebaseAdmin();
  return app.storage();
}
