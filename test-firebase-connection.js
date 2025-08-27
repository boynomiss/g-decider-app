/**
 * Firebase Connection Test Script
 * 
 * Run this script to verify your Firebase setup is working correctly
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdvXxkBOGYvBTPQ_BIT6kHPcfI3-JADA0",
  authDomain: "g--decider-app.firebaseapp.com",
  projectId: "g--decider-app",
  storageBucket: "g--decider-app.firebasestorage.app",
  messagingSenderId: "927878465283",
  appId: "1:927878465283:web:482aa806bb5bfc3e6e4b36",
  measurementId: "G-502771803"
};

async function testFirebaseConnection() {
  try {
    console.log('🚀 Testing Firebase connection...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
    
    // Initialize Firestore
    const db = getFirestore(app);
    console.log('✅ Firestore initialized');
    
    // Test basic connection by trying to read from a collection
    console.log('🔍 Testing Firestore read access...');
    
    try {
      // Try to read from categories collection (will be empty initially)
      const categoriesRef = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesRef);
      console.log(`✅ Firestore read successful: ${categoriesSnapshot.size} categories found`);
      
      // Try to read from featured_places collection (will be empty initially)
      const placesRef = collection(db, 'featured_places');
      const placesSnapshot = await getDocs(placesRef);
      console.log(`✅ Firestore read successful: ${placesSnapshot.size} places found`);
      
    } catch (readError) {
      if (readError.code === 'permission-denied') {
        console.log('⚠️  Permission denied - this is expected if security rules are not deployed yet');
        console.log('   Deploy security rules with: firebase deploy --only firestore:rules');
      } else {
        console.error('❌ Firestore read failed:', readError.message);
        throw readError;
      }
    }
    
    console.log('\n🎉 Firebase connection test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Enable Firestore Database in Firebase Console');
    console.log('2. Enable Firebase Storage in Firebase Console');
    console.log('3. Deploy security rules: firebase deploy --only firestore:rules');
    console.log('4. Deploy storage rules: firebase deploy --only storage');
    
  } catch (error) {
    console.error('\n❌ Firebase connection test failed:');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check if Firebase services are enabled in console');
    console.error('2. Verify your project ID and API key');
    console.error('3. Check network connectivity');
    console.error('4. Ensure Firestore and Storage are created');
    
    process.exit(1);
  }
}

// Run the test
testFirebaseConnection();
