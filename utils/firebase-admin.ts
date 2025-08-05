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
    // Read the service account credentials
    const serviceAccountPath = join(process.cwd(), 'firebase-adminsdk.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'g-decider-backend',
      databaseURL: `https://g-decider-backend-default-rtdb.firebaseio.com`,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw new Error('Firebase Admin SDK initialization failed');
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

/**
 * Verify Firebase ID token
 */
export async function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  const auth = getAuth();
  return auth.verifyIdToken(idToken);
}

/**
 * Create custom token for client-side authentication
 */
export async function createCustomToken(uid: string, additionalClaims?: object): Promise<string> {
  const auth = getAuth();
  return auth.createCustomToken(uid, additionalClaims);
}

/**
 * Get user by UID
 */
export async function getUser(uid: string): Promise<admin.auth.UserRecord> {
  const auth = getAuth();
  return auth.getUser(uid);
}

/**
 * Create user with email and password
 */
export async function createUser(userData: admin.auth.CreateRequest): Promise<admin.auth.UserRecord> {
  const auth = getAuth();
  return auth.createUser(userData);
}

/**
 * Update user
 */
export async function updateUser(uid: string, userData: admin.auth.UpdateRequest): Promise<admin.auth.UserRecord> {
  const auth = getAuth();
  return auth.updateUser(uid, userData);
}

/**
 * Delete user
 */
export async function deleteUser(uid: string): Promise<void> {
  const auth = getAuth();
  return auth.deleteUser(uid);
}

// Export Firebase Admin SDK types for convenience
export { admin }; 