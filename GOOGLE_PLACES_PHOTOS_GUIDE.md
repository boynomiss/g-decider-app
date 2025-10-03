# Google Places Photos Integration Guide

## 🎯 Overview

The app now supports **dynamic image fetching from Google Places API**! Instead of storing static image URLs, you can use Google Place IDs to fetch real, up-to-date photos automatically.

---

## 🔧 How It Works

### Option 1: Use Google Place ID (Recommended)
```typescript
{
  name: "Yardstick Coffee",
  category: "food",
  googlePlacesId: "ChIJ...", // ← Add this!
  images: {
    hero: "photo_reference_here", // Optional fallback
    gallery: []
  },
  // ... rest of place data
}
```

### Option 2: Use Direct URLs (Current Method)
```typescript
{
  name: "Yardstick Coffee",
  category: "food",
  images: {
    hero: "https://example.com/image.jpg",
    gallery: ["https://example.com/1.jpg"]
  },
  // ... rest of place data
}
```

### Option 3: Hybrid Approach
```typescript
{
  name: "Yardstick Coffee",
  category: "food",
  googlePlacesId: "ChIJ...", // Google will fetch these
  images: {
    hero: "https://fallback.com/image.jpg", // Fallback if Google fails
    gallery: []
  }
}
```

---

## 📝 How to Get Google Place IDs

### Method 1: Google Place ID Finder
1. Go to: https://developers.google.com/maps/documentation/places/web-service/place-id
2. Search for your place
3. Copy the Place ID (starts with "ChIJ...")

### Method 2: Using Our API
```typescript
import { searchPlaceId } from './src/services/google-places-photos';

const placeId = await searchPlaceId(
  "Yardstick Coffee Makati",
  { lat: 14.5588, lng: 121.0166 }
);
// Returns: "ChIJ..."
```

### Method 3: Google Maps URL
1. Find place on Google Maps
2. Look at URL: `https://www.google.com/maps/place/.../@.../?q=&t=&z=17&ie=UTF8&cid=123456789`
3. Use the `cid` parameter or click "Share" → "Embed" to find Place ID

---

## 🚀 Using the Services

### Fetch Photos by Place ID
```typescript
import { fetchPlacePhotos } from './src/services/google-places-photos';

const photos = await fetchPlacePhotos("ChIJ...");
// Returns: ["https://maps.googleapis.com/...", ...]
```

### Search and Get Photos
```typescript
import { getPhotosByPlaceName } from './src/services/google-places-photos';

const photos = await getPhotosByPlaceName(
  "Yardstick Coffee",
  { lat: 14.5588, lng: 121.0166 }
);
```

### Convert Photo Reference to URL
```typescript
import { getPlacePhotoUrl } from './src/services/google-places-photos';

const url = getPlacePhotoUrl("photo_reference", 800);
// Returns: "https://maps.googleapis.com/maps/api/place/photo?..."
```

---

## 🎨 Using in Components

### PlaceImage Component (Updated)
```tsx
<PlaceImage 
  imageUri={place.images.hero}
  googlePlacesId={place.googlePlacesId} // Optional
/>
```

The component automatically:
- ✅ Handles Google photo references
- ✅ Handles direct URLs
- ✅ Shows loading state
- ✅ Falls back to provided URL if Google fails

### Custom Hook
```tsx
import usePlacePhotos from './src/hooks/usePlacePhotos';

function MyComponent({ place }) {
  const { photos, isLoading, heroPhoto } = usePlacePhotos(
    place.googlePlacesId,
    place.images.hero,
    place.images.gallery
  );
  
  return (
    <Image source={{ uri: heroPhoto }} />
  );
}
```

---

## 📊 Updated Place Type

```typescript
interface Place {
  // ... existing fields
  
  images: {
    hero: string; // Can be photo reference or URL
    gallery: string[]; // Array of references or URLs
  };
  
  googlePlacesId?: string; // NEW! Optional Google Place ID
}
```

---

## 🔄 Migration Strategy

### For Existing Places:
1. **Keep current URLs** - They'll continue working
2. **Gradually add Google Place IDs** - Better images over time
3. **Test with a few places first**

### For New Places:
1. **Find Google Place ID** using methods above
2. **Add to place data**:
   ```typescript
   googlePlacesId: "ChIJ...",
   ```
3. **Images will auto-fetch** from Google

---

## 🛠️ Bulk Adding Google Place IDs

Create a script to find and add Place IDs:

```typescript
// scripts/add-google-place-ids.ts
import { searchPlaceId } from '../src/services/google-places-photos';
import { allPlaces } from '../data/metro-manila-places';

async function addPlaceIds() {
  for (const place of allPlaces) {
    if (!place.googlePlacesId) {
      const placeId = await searchPlaceId(
        `${place.name} ${place.location.city}`,
        { 
          lat: place.location.lat, 
          lng: place.location.lng 
        }
      );
      
      if (placeId) {
        console.log(`${place.name}: ${placeId}`);
        // Update your data file with this ID
      }
    }
  }
}
```

---

## ⚡ Benefits

### Dynamic Images:
- ✅ **Always up-to-date** - Photos update automatically
- ✅ **Multiple photos** - Get entire gallery from Google
- ✅ **High quality** - Google's photos are user-submitted and verified
- ✅ **No storage needed** - No need to host images

### Flexibility:
- ✅ **Fallback support** - Use URLs if Google fails
- ✅ **Hybrid approach** - Mix Google and custom images
- ✅ **Easy migration** - Works with existing URL-based places

---

## 🔑 API Key

Your Google Places API key is already configured:
- Location: `src/shared/constants/config/api-keys.ts`
- Environment: `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY`
- Fallback key is set for development

---

## 📝 Example: Update a Place

**Before:**
```typescript
{
  name: "Yardstick Coffee",
  images: {
    hero: "https://example.com/yardstick.jpg",
    gallery: []
  }
}
```

**After:**
```typescript
{
  name: "Yardstick Coffee",
  googlePlacesId: "ChIJYardstickCoffeeID", // Add this!
  images: {
    hero: "https://example.com/yardstick.jpg", // Keep as fallback
    gallery: []
  }
}
```

Now Google will automatically fetch and display real photos!

---

## 🎯 Next Steps

1. **Test with 1-2 places** - Add Google Place IDs to a few places
2. **Run populate script** - Upload to Firebase
3. **Check in app** - Verify photos load from Google
4. **Gradually expand** - Add Place IDs to more locations
5. **Optional: Bulk script** - Create script to find all Place IDs at once

---

## 🆘 Troubleshooting

**Photos not loading?**
- Check Google Place ID is correct
- Verify API key has Places API enabled
- Check console for errors
- Ensure fallback URLs are valid

**Wrong photos?**
- Place ID might be for wrong location
- Use more specific search terms
- Include city/area in search

**Rate limits?**
- Google Places API has usage limits
- Photos are cached by the Image component
- Consider implementing local caching

---

## ✨ Summary

- ✅ **Service created**: `src/services/google-places-photos.ts`
- ✅ **Hook created**: `src/hooks/usePlacePhotos.ts`
- ✅ **Component updated**: `PlaceImage.tsx` supports Google photos
- ✅ **Type updated**: `Place` interface includes `googlePlacesId`
- ✅ **Backward compatible**: Existing URL-based images still work
- ✅ **Ready to use**: Add Place IDs to get automatic photo fetching!

🎉 **Your app now supports dynamic Google Places photos!**

