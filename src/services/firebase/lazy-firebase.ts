/**
 * Lazy Firebase Service
 * 
 * This module provides Firebase services that are only initialized when explicitly requested,
 * preventing initialization errors during app startup.
 */

import { firebaseConfig } from '../../config/firebase-config';

let _app: any = null;
let _db: any = null;
let _storage: any = null;
let _auth: any = null;

/**
 * Initialize Firebase app lazily
 */
const initializeApp = async () => {
  if (_app) return _app;
  
  try {
    const { initializeApp: firebaseInit, getApp, getApps } = await import('firebase/app');
    
    // Check if any Firebase apps exist
    const apps = getApps();
    if (apps.length > 0) {
      _app = apps[0];
      console.log('🔥 Using existing Firebase app');
    } else {
      _app = firebaseInit(firebaseConfig);
      console.log('🔥 Created new Firebase app');
    }
  } catch (error) {
    console.error('🔥 Error initializing Firebase app:', error);
    throw error;
  }
  
  return _app;
};

/**
 * Get Firestore database instance
 */
export const getDb = async () => {
  if (_db) return _db;
  
  const app = await initializeApp();
  const { getFirestore } = await import('firebase/firestore');
  _db = getFirestore(app);
  return _db;
};

/**
 * Get Storage instance
 */
export const getStorage = async () => {
  if (_storage) return _storage;
  
  const app = await initializeApp();
  const { getStorage: getFirebaseStorage } = await import('firebase/storage');
  _storage = getFirebaseStorage(app);
  return _storage;
};

/**
 * Get Auth instance
 */
export const getAuth = async () => {
  if (_auth) return _auth;
  
  const app = await initializeApp();
  const { getAuth: getFirebaseAuth } = await import('firebase/auth');
  _auth = getFirebaseAuth(app);
  return _auth;
};

/**
 * Get the Firebase app instance
 */
export const getApp = async () => {
  return await initializeApp();
};

// Export configuration
export { firebaseConfig } from '../../config/firebase-config';

