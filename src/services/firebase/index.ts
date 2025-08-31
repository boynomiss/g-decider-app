/**
 * Centralized Firebase Service
 * 
 * This module provides a single point of Firebase initialization
 * and prevents duplicate app creation errors.
 */

// Re-export from lazy service to avoid immediate initialization
export * from './lazy-firebase';

// For backward compatibility, provide synchronous accessors
// These will throw if Firebase hasn't been initialized yet
export const db = () => {
  throw new Error('Firebase not initialized. Use getDb() from lazy-firebase instead.');
};

export const storage = () => {
  throw new Error('Firebase not initialized. Use getStorage() from lazy-firebase instead.');
};

export const auth = () => {
  throw new Error('Firebase not initialized. Use getAuth() from lazy-firebase instead.');
};

// Export configuration
export { firebaseConfig, firebaseSettings } from '../../config/firebase-config';
