import { initializeApp, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

/**
 * Firebase Client Configuration
 * 
 * This module initializes Firebase for client-side use.
 * It provides access to Firebase services from React Native.
 */

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: 'g-decider-backend.firebaseapp.com',
  projectId: 'g-decider-backend',
  storageBucket: 'g-decider-backend.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
  databaseURL: 'https://g-decider-backend-default-rtdb.firebaseio.com',
};

let firebaseApp: any = null;

/**
 * Initialize Firebase Client SDK
 */
export function initializeFirebaseClient() {
  if (!firebaseApp) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('✅ Firebase Client SDK initialized successfully');
    } catch (error: any) {
      if (error.code !== 'app/duplicate-app') {
        console.error('❌ Failed to initialize Firebase Client SDK:', error);
        throw error;
      }
      // If app already exists, get the existing instance
      firebaseApp = getApp();
    }
  }
  return firebaseApp;
}

/**
 * Get Firebase Client SDK instance
 */
export function getFirebaseClient() {
  if (!firebaseApp) {
    return initializeFirebaseClient();
  }
  return firebaseApp;
}

/**
 * Get Firestore database instance
 */
export function getClientFirestore() {
  const app = getFirebaseClient();
  return getFirestore(app);
}

/**
 * Get Realtime Database instance
 */
export function getClientDatabase() {
  const app = getFirebaseClient();
  return getDatabase(app);
}

/**
 * Get Authentication instance
 */
export function getClientAuth() {
  const app = getFirebaseClient();
  return getAuth(app);
}

/**
 * Get Storage instance
 */
export function getClientStorage() {
  const app = getFirebaseClient();
  return getStorage(app);
}