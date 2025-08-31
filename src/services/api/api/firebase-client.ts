import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import app from '../../firebase/index';

/**
 * Firebase Client Configuration
 * 
 * This module provides access to Firebase services from React Native.
 * It uses the centralized Firebase app instance to prevent conflicts.
 */

/**
 * Get Firestore database instance
 */
export function getClientFirestore() {
  return getFirestore(app);
}

/**
 * Get Realtime Database instance
 */
export function getClientDatabase() {
  return getDatabase(app);
}

/**
 * Get Authentication instance
 */
export function getClientAuth() {
  return getAuth(app);
}

/**
 * Get Storage instance
 */
export function getClientStorage() {
  return getStorage(app);
}

// For backward compatibility
export const initializeFirebaseClient = () => app;
export const getFirebaseClient = () => app;