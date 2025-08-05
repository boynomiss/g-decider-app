# 🗺️ Location Customization Guide

## 📍 **How to Change Your Default Location**

The app currently uses **Manila, Philippines** (`14.5995, 120.9842`) as the default location. Here are several ways to customize this:

### **Option 1: Quick Change - Update Global Default**

**File to edit:** `utils/location-service.ts`

```typescript
// Change these coordinates to your preferred default location
const DEFAULT_LOCATION: LocationCoords = {
  lat: 14.5995,  // ← Change this to your preferred latitude
  lng: 120.9842  // ← Change this to your preferred longitude
};
```

**Example for New York:**
```typescript
const DEFAULT_LOCATION: LocationCoords = {
  lat: 40.7128,  // New York latitude
  lng: -74.0060  // New York longitude
};
```

### **Option 2: Add Your Location to Pre-defined List**

**File to edit:** `utils/location-service.ts`

```typescript
const SIMULATOR_LOCATIONS: Record<string, LocationCoords> = {
  'manila': { lat: 14.5995, lng: 120.9842 },
  'makati': { lat: 14.5547, lng: 121.0244 },
  // ... existing locations ...
  
  // Add your custom location here:
  'your_city': { lat: YOUR_LATITUDE, lng: YOUR_LONGITUDE },
  'new_york': { lat: 40.7128, lng: -74.0060 },
  'london': { lat: 51.5074, lng: -0.1278 },
  'tokyo': { lat: 35.6762, lng: 139.6503 }
};
```

### **Option 3: Update All Default References**

If you want to change the default location everywhere in the app, update these files:

1. **`utils/location-service.ts`** - Main location service
2. **`hooks/use-app-store.ts`** - App store default location
3. **`utils/filter-validation-service.ts`** - Validation service default
4. **`functions/src/filterPlaces.ts`** - Backend default location

## 🌍 **Popular Location Coordinates**

### **Philippines**
- **Manila**: `14.5995, 120.9842`
- **Makati**: `14.5547, 121.0244`
- **BGC**: `14.5176, 121.0509`
- **Ortigas**: `14.5866, 121.0630`
- **Quezon City**: `14.6760, 121.0437`
- **Alabang**: `14.4297, 121.0403`
- **Cebu**: `10.3157, 123.8854`
- **Davao**: `7.1907, 125.4553`

### **International Cities**
- **New York**: `40.7128, -74.0060`
- **London**: `51.5074, -0.1278`
- **Tokyo**: `35.6762, 139.6503`
- **Singapore**: `1.3521, 103.8198`
- **Sydney**: `-33.8688, 151.2093`
- **Los Angeles**: `34.0522, -118.2437`
- **Paris**: `48.8566, 2.3522`
- **Berlin**: `52.5200, 13.4050`

## 🔧 **How to Find Your Coordinates**

### **Method 1: Google Maps**
1. Go to [Google Maps](https://maps.google.com)
2. Search for your location
3. Right-click on the exact spot
4. Select the coordinates that appear at the top
5. Copy the latitude and longitude

### **Method 2: Online Coordinate Finder**
- [LatLong.net](https://www.latlong.net/)
- [GPS Coordinates](https://www.gps-coordinates.net/)

### **Method 3: Mobile App**
- Use any GPS/maps app on your phone
- Drop a pin at your location
- View the coordinates

## 🚀 **After Making Changes**

1. **Save the files** you edited
2. **Restart the development server**:
   ```bash
   npm start
   # or
   expo start
   ```
3. **Test the app** to ensure your new location is working

## 📱 **Testing Your New Location**

After changing the default location:

1. **Clear app cache** or restart the app
2. **Select a category** (Food, Activity, Something New)
3. **Check the console logs** to see if your new location is being used
4. **Try the "G!" button** to see if it finds places near your new location

## ⚠️ **Important Notes**

- **Google Places API**: Make sure your new location has good Google Places API coverage
- **Testing**: The validation system will now use your new default location
- **Fallback**: If GPS fails, the app will use your new default location
- **Development**: In simulator mode, you can still test with different locations

## 🎯 **Quick Example: Change to BGC**

To quickly change to BGC (Bonifacio Global City - a popular business and entertainment district):

```typescript
// In utils/location-service.ts
const DEFAULT_LOCATION: LocationCoords = {
  lat: 14.5176,  // BGC latitude
  lng: 121.0509  // BGC longitude
};
```

This will give you better results for finding restaurants, cafes, and activities in the BGC area!

## ✅ **Current Default: BGC**

The app is now configured to use **BGC (Bonifacio Global City)** as the default location:
- **Coordinates**: `14.5176, 121.0509`
- **Benefits**: Excellent Google Places API coverage with many restaurants, cafes, shopping malls, and entertainment venues
- **Search Areas**: BGC is now prioritized in the search areas list 