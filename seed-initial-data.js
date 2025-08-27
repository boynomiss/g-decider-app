/**
 * Database Seeding Script
 * 
 * Run this script to populate your database with initial data
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

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

async function seedCategories(db) {
  console.log('🌱 Seeding categories...');
  
  const defaultCategories = [
    {
      name: "Restaurants",
      subcategories: ["filipino", "japanese", "italian", "chinese", "korean", "american", "fusion", "cafe", "bakery", "street_food"],
      icon: "🍽️",
      active: true,
      description: "Places to eat and dine",
      sort_order: 1
    },
    {
      name: "Activities",
      subcategories: ["adventure", "cultural", "entertainment", "sports", "wellness", "shopping", "nightlife", "family"],
      icon: "🎯",
      active: true,
      description: "Things to do and experience",
      sort_order: 2
    },
    {
      name: "Something New",
      subcategories: ["recently_opened", "trending", "hidden_gem", "unique_experience"],
      icon: "✨",
      active: true,
      description: "Discover new and trending places",
      sort_order: 3
    }
  ];

  const categoriesRef = collection(db, 'categories');
  
  for (const category of defaultCategories) {
    try {
      await addDoc(categoriesRef, category);
      console.log(`✅ Added category: ${category.name}`);
    } catch (error) {
      console.error(`❌ Failed to add category ${category.name}:`, error.message);
    }
  }
  
  console.log('✅ Categories seeding completed');
}

async function seedAdminUser(db) {
  console.log('👤 Seeding admin user...');
  
  const defaultAdmin = {
    email: "admin@g--decider-app.com",
    role: "super_admin",
    permissions: ["create", "edit", "delete", "analytics", "manage_users"],
    created_at: new Date().toISOString(),
    last_login: null,
    active: true
  };

  try {
    // Use a fixed document ID for the admin user
    const adminRef = doc(db, 'admin_users', 'default-admin');
    await setDoc(adminRef, defaultAdmin);
    console.log('✅ Admin user seeded successfully');
    console.log('📧 Email: admin@g--decider-app.com');
    console.log('🔑 Role: super_admin');
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error.message);
  }
}

async function seedSamplePlace(db) {
  console.log('🏪 Seeding sample featured place...');
  
  const samplePlace = {
    name: "Lola's Kitchen",
    category: "restaurant",
    cuisine: "filipino",
    description: "Hidden gem serving authentic Filipino cuisine passed down through generations. Famous for their adobo and kare-kare.",
    location: {
      address: "123 Makati Ave, Makati City",
      barangay: "Poblacion",
      city: "Makati",
      region: "Metro Manila",
      lat: 14.5547,
      lng: 121.0244,
      formatted_address: "123 Makati Ave, Poblacion, Makati, Metro Manila",
      vicinity: "Poblacion"
    },
    contact: {
      phone: "+63 917 123 4567",
      website: "https://lolaskitchen.example.com",
      facebook: "@lolaskitchen",
      instagram: "@lolaskitchen_ph"
    },
    business_info: {
      hours: {
        monday: "9:00-21:00",
        tuesday: "9:00-21:00",
        wednesday: "9:00-21:00",
        thursday: "9:00-21:00",
        friday: "9:00-22:00",
        saturday: "10:00-22:00",
        sunday: "10:00-20:00"
      },
      price_range: "₱₱",
      payment_methods: ["cash", "gcash", "card"],
      features: ["wifi", "outdoor_seating", "parking", "family_friendly"]
    },
    images: {
      hero: "https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Lola%27s+Kitchen",
      gallery: [
        "https://via.placeholder.com/600x400/4ECDC4/FFFFFF?text=Interior",
        "https://via.placeholder.com/600x400/45B7D1/FFFFFF?text=Food+1",
        "https://via.placeholder.com/600x400/96CEB4/FFFFFF?text=Food+2"
      ]
    },
    discovery: {
      tags: ["hidden_gem", "local_favorite", "authentic", "family_owned"],
      perfect_for: ["date_night", "family_dinner", "casual_dining"],
      best_time: "dinner",
      unique_features: "Secret recipe passed down 3 generations",
      discovery_hook: "Local's secret spot for authentic Filipino flavors",
      mood_score: 85,
      mood_category: "cozy"
    },
    partnership: {
      tier: "premium",
      monthly_fee: 5000,
      start_date: "2024-01-01",
      end_date: "2024-12-31",
      active: true,
      contact_person: "Maria Santos"
    },
    analytics: {
      impressions: 0,
      swipe_right: 0,
      swipe_left: 0,
      profile_views: 0,
      last_shown: null
    },
    metadata: {
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: "admin@g--decider-app.com",
      status: "active",
      version: 1
    }
  };

  try {
    const placesRef = collection(db, 'featured_places');
    const docRef = await addDoc(placesRef, samplePlace);
    console.log('✅ Sample place seeded successfully');
    console.log(`🆔 Place ID: ${docRef.id}`);
    console.log(`🏪 Name: ${samplePlace.name}`);
  } catch (error) {
    console.error('❌ Failed to seed sample place:', error.message);
  }
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    console.log('✅ Firebase app initialized');
    
    // Initialize Firestore
    const db = getFirestore(app);
    console.log('✅ Firestore initialized');
    
    // Seed data
    await seedCategories(db);
    await seedAdminUser(db);
    await seedSamplePlace(db);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 What was created:');
    console.log('- 3 default categories (Restaurants, Activities, Something New)');
    console.log('- 1 admin user (admin@g--decider-app.com)');
    console.log('- 1 sample featured place (Lola\'s Kitchen)');
    console.log('\n🔗 Next steps:');
    console.log('1. Test the connection with: node test-firebase-connection.js');
    console.log('2. Build your admin panel to manage featured places');
    console.log('3. Integrate featured places into your main app');
    
  } catch (error) {
    console.error('\n❌ Database seeding failed:');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Ensure Firestore is enabled in Firebase Console');
    console.error('2. Check if security rules allow write access');
    console.error('3. Verify your Firebase configuration');
    
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
