/**
 * Firebase Configuration
 * 
 * Centralized configuration for Firebase services
 */

export const firebaseConfig = {
  apiKey: "AIzaSyDdvXxkBOGYvBTPQ_BIT6kHPcfI3-JADA0",
  authDomain: "g--decider-app.firebaseapp.com",
  projectId: "g--decider-app",
  storageBucket: "g--decider-app.firebasestorage.app",
  messagingSenderId: "927878465283",
  appId: "1:927878465283:web:482aa806bb5bfc3e6e4b36",
  measurementId: "G-502771803"
};

export const firebaseSettings = {
  // Firestore settings
  firestore: {
    region: 'asia-southeast1',
    cacheSizeBytes: 50 * 1024 * 1024, // 50MB
    experimentalForceLongPolling: false,
    useFetchStreams: false
  },
  
  // Storage settings
  storage: {
    region: 'asia-southeast1',
    maxUploadRetryTime: 60000, // 1 minute
    maxOperationRetryTime: 120000 // 2 minutes
  },
  
  // Auth settings
  auth: {
    persistence: 'local', // 'local', 'session', 'none'
    signInOptions: ['password', 'emailLink']
  }
};
