# ✅ Google Places Photos Integration - Complete!

## 🎉 What's Been Set Up

Your app now **dynamically fetches real images from Google Places API** instead of using placeholder URLs!

---

## 📦 Files Created/Updated

### New Services:
- ✅ `src/services/google-places-photos.ts` - Complete Google Places Photos API service
- ✅ `src/hooks/usePlacePhotos.ts` - React hook for photo loading
- ✅ `GOOGLE_PLACES_PHOTOS_GUIDE.md` - Complete usage guide

### Updated Files:
- ✅ `src/types/mvp-types.ts` - Added `googlePlacesId` to Place type
- ✅ `src/components/features/places/PlaceImage.tsx` - Now supports Google photos

### Your API Key:
- ✅ Already configured in `src/shared/constants/config/api-keys.ts`
- ✅ Uses: `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`

---

## 🚀 How It Works Now

### Current Behavior (Placeholder URLs):
```typescript
{
  name: "Yardstick Coffee",
  images: {
    hero: "https://example.com/yardstick.jpg",
    gallery: []
  }
}
```
✅ Still works! Backward compatible.

### New Behavior (Google Photos):
```typescript
{
  name: "Yardstick Coffee",
  googlePlacesId: "ChIJ...", // Add this!
  images: {
    hero: "fallback-url.jpg", // Optional fallback
    gallery: []
  }
}
```
✅ Auto-fetches real photos from Google Places API!

---

## 📝 Next Steps

### Option A: Update Places Gradually

1. **Pick a few test places** (5-10 places)
2. **Find their Google Place IDs**:
   - Use: https://developers.google.com/maps/documentation/places/web-service/place-id
   - Or search Google Maps and extract from URL
3. **Add to your data**:
   ```typescript
   {
     name: "Yardstick Coffee",
     googlePlacesId: "ChIJYardstickID", // ← Add this
     images: {
       hero: "https://example.com/yardstick.jpg",
       gallery: []
     }
   }
   ```
4. **Populate database**: `npm run populate-db`
5. **Test in app** - Photos should load from Google!

### Option B: Bulk Update All Places

Create a script to automatically find Place IDs:

```bash
# Create the script
touch scripts/fetch-google-place-ids.ts
```

```typescript
// scripts/fetch-google-place-ids.ts
import { searchPlaceId } from '../src/services/google-places-photos';
import { allPlaces } from '../data/metro-manila-places';

async function fetchAllPlaceIds() {
  for (const place of allPlaces) {
    console.log(`Searching for: ${place.name}...`);
    
    const placeId = await searchPlaceId(
      `${place.name} ${place.location.city} Metro Manila`,
      { lat: place.location.lat, lng: place.location.lng }
    );
    
    if (placeId) {
      console.log(`✅ ${place.name}: ${placeId}`);
      // Copy this ID and add to your place data manually
    } else {
      console.log(`❌ ${place.name}: Not found`);
    }
    
    // Rate limit: wait 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

fetchAllPlaceIds();
```

Run: `npx ts-node scripts/fetch-google-place-ids.ts`

---

## 🎨 Using in Your App

### Automatic (Component Level):
```tsx
// In mvp-results.tsx or any component
<PlaceImage 
  imageUri={currentPlace.images.hero}
  googlePlacesId={currentPlace.googlePlacesId} // ← Automatically fetches from Google
/>
```

The component handles everything:
- ✅ Fetches from Google if `googlePlacesId` provided
- ✅ Falls back to `imageUri` if Google fails
- ✅ Shows loading state
- ✅ Works with existing URL-based images

### Manual (Hook):
```tsx
import usePlacePhotos from './src/hooks/usePlacePhotos';

function MyComponent({ place }) {
  const { photos, isLoading, heroPhoto } = usePlacePhotos(
    place.googlePlacesId,
    place.images.hero,
    place.images.gallery
  );
  
  return (
    <>
      {isLoading ? <Spinner /> : null}
      <Image source={{ uri: heroPhoto }} />
      {photos.map(photo => <Image source={{ uri: photo }} />)}
    </>
  );
}
```

---

## 🔍 Finding Google Place IDs

### Method 1: Place ID Finder Tool
1. Go to: https://developers.google.com/maps/documentation/places/web-service/place-id
2. Search for place
3. Copy Place ID (format: `ChIJ...`)

### Method 2: Google Maps
1. Search place on Google Maps
2. Right-click on place → "What's here?"
3. Or check URL after clicking place
4. Use our API to verify:
   ```typescript
   import { searchPlaceId } from './src/services/google-places-photos';
   
   const id = await searchPlaceId(
     "Yardstick Coffee Makati",
     { lat: 14.5588, lng: 121.0166 }
   );
   ```

### Method 3: Programmatically
```typescript
// Get Place ID for a single place
import { searchPlaceId } from './src/services/google-places-photos';

const placeId = await searchPlaceId(
  "Place Name",
  { lat: 14.xxxx, lng: 121.xxxx }
);

console.log(placeId); // "ChIJ..."
```

---

## ✨ Benefits

### Why Use Google Places Photos:
1. **Real Images** - Actual photos from Google Maps users
2. **Always Updated** - Photos update automatically
3. **Multiple Photos** - Get entire gallery (up to 10 images)
4. **High Quality** - User-submitted, verified photos
5. **No Storage** - No need to host images yourself
6. **Dynamic** - Photos update when business adds new ones

### Backward Compatible:
- ✅ Existing URL-based images still work
- ✅ Gradual migration - update places one at a time
- ✅ Fallback support - if Google fails, shows your URL
- ✅ No breaking changes

---

## 🧪 Testing

### Test the Service:
```typescript
// In a React Native component or script
import { fetchPlacePhotos, searchPlaceId } from './src/services/google-places-photos';

// Find a place
const placeId = await searchPlaceId(
  "Yardstick Coffee",
  { lat: 14.5588, lng: 121.0166 }
);

// Get photos
const photos = await fetchPlacePhotos(placeId);
console.log(photos); // Array of URLs
```

### Test in App:
1. Add a Google Place ID to one place
2. Run `npm run populate-db`
3. Open app and navigate to that place
4. Photos should load from Google!

---

## 📊 API Usage

### Google Places API Limits:
- **Free tier**: $200 credit/month
- **Photo requests**: Included in Places Details
- **Cost**: Very low for photo lookups

### Best Practices:
1. Cache photos when possible
2. Use fallback URLs for popular places
3. Implement local caching in production

---

## 🔧 How to Add Place ID to Existing Place

**Before:**
```typescript
{
  name: "Yardstick Coffee",
  category: "food",
  description: "Minimalist third-wave coffee shop ...",
  location: { 
    address: "Karrivin Plaza, 2316 Chino Roces Ave", 
    city: "Makati", 
    lat: 14.5588, 
    lng: 121.0166 
  },
  images: {
    hero: "https://example.com/yardstick.jpg",
    gallery: []
  }
}
```

**After (with Google Place ID):**
```typescript
{
  name: "Yardstick Coffee",
  category: "food",
  description: "Minimalist third-wave coffee shop ...",
  location: { 
    address: "Karrivin Plaza, 2316 Chino Roces Ave", 
    city: "Makati", 
    lat: 14.5588, 
    lng: 121.0166 
  },
  googlePlacesId: "ChIJYardstickCoffeeMakatiID", // ← ADD THIS!
  images: {
    hero: "https://example.com/yardstick.jpg", // Keep as fallback
    gallery: []
  }
}
```

That's it! The app will now fetch real photos from Google.

---

## 📚 Documentation

Full guide: `GOOGLE_PLACES_PHOTOS_GUIDE.md`

Includes:
- Complete API reference
- Code examples
- Troubleshooting
- Migration strategies
- Bulk update scripts

---

## ✅ Summary

**What You Have Now:**
- ✅ Google Places Photos service (`google-places-photos.ts`)
- ✅ React hook for easy photo loading (`usePlacePhotos.ts`)
- ✅ Updated PlaceImage component (supports Google photos)
- ✅ Updated Place type (includes `googlePlacesId`)
- ✅ Backward compatible (existing URLs still work)
- ✅ Complete documentation

**What You Can Do:**
1. **Option 1:** Keep using placeholder URLs (current method)
2. **Option 2:** Add Google Place IDs gradually (recommended)
3. **Option 3:** Bulk find all Place IDs with a script

**Next Step:**
Try adding a Google Place ID to 1-2 places and test! 🚀

---

## 🎉 You're All Set!

Your app can now display **real, dynamic photos from Google Places API**! 

Just add `googlePlacesId` to any place in your data and watch the magic happen! ✨

