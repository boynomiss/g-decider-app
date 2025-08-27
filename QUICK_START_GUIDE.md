# 🚀 Quick Start Guide - Featured Places System

## ⚡ Get Up and Running in 5 Minutes

### 1. Enable Firebase Services

Go to [Firebase Console](https://console.firebase.google.com/project/g--decider-app) and enable:

- ✅ **Firestore Database** → Create database → Test mode → asia-southeast1
- ✅ **Firebase Storage** → Get started → Test mode → asia-southeast1

### 2. Test Your Connection

```bash
# Install dependencies (if not already installed)
npm install firebase

# Test Firebase connection
node test-firebase-connection.js
```

Expected output:
```
🚀 Testing Firebase connection...
✅ Firebase app initialized
✅ Firestore initialized
✅ Firestore read successful: 0 categories found
✅ Firestore read successful: 0 places found
🎉 Firebase connection test completed successfully!
```

### 3. Deploy Security Rules

```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### 4. Seed Your Database

```bash
# Populate with initial data
node seed-initial-data.js
```

Expected output:
```
🚀 Starting database seeding...
✅ Firebase app initialized
✅ Firestore initialized
🌱 Seeding categories...
✅ Added category: Restaurants
✅ Added category: Activities
✅ Added category: Something New
👤 Seeding admin user...
✅ Admin user seeded successfully
🏪 Seeding sample featured place...
✅ Sample place seeded successfully
🎉 Database seeding completed successfully!
```

### 5. Verify in Firebase Console

1. Go to [Firestore Database](https://console.firebase.google.com/project/g--decider-app/firestore)
2. You should see:
   - `categories` collection with 3 documents
   - `featured_places` collection with 1 document
   - `admin_users` collection with 1 document

## 🎯 What You Can Do Now

### View Featured Places
```typescript
import { useFeaturedPlaces } from '../features/discovery/hooks/use-featured-places';

const { places, loading, loadPlaces } = useFeaturedPlaces();

useEffect(() => {
  loadPlaces(); // Loads all active featured places
}, []);
```

### Add a New Place
```typescript
const { createPlace } = useFeaturedPlaces();

const newPlace = {
  name: "My New Restaurant",
  category: "restaurant",
  description: "Amazing food here!",
  // ... other required fields
};

const placeId = await createPlace(newPlace);
```

### Upload Images
```typescript
const { uploadHeroImage } = useFeaturedPlaces();

const imageFile = // ... get file from input
const imageUrl = await uploadHeroImage(placeId, imageFile);
```

## 🔧 Troubleshooting

### Common Issues

**❌ Permission denied**
- Deploy security rules: `firebase deploy --only firestore:rules`

**❌ Service not enabled**
- Enable Firestore/Storage in Firebase Console

**❌ Connection failed**
- Check your internet connection
- Verify API key in firebase-config.ts

### Get Help

1. Check the [Firebase Console](https://console.firebase.google.com/project/g--decider-app)
2. Review [FIREBASE_SETUP_INSTRUCTIONS.md](FIREBASE_SETUP_INSTRUCTIONS.md)
3. Check [FEATURED_PLACES_IMPLEMENTATION.md](FEATURED_PLACES_IMPLEMENTATION.md)

## 🎉 You're Ready!

Your featured places system is now:
- ✅ **Connected** to Firebase
- ✅ **Secured** with proper rules
- ✅ **Populated** with sample data
- ✅ **Ready** for development

Start building your admin panel or integrate featured places into your app!

---

**Next Steps:**
1. Build admin interface for managing places
2. Integrate featured places into your main app
3. Add image upload functionality
4. Implement analytics dashboard

Need help? Check the documentation files or run the test scripts! 🚀
