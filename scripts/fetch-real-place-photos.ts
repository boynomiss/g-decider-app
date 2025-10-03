/**
 * Fetch Real Google Places Photos
 * Uses new Places API to get actual user-submitted photos
 * REAL food photos, interiors, exteriors from Google users!
 */

import { PlacesService } from '../src/services/mvp/firebase-service';
import { API_KEYS } from '../src/shared/constants/config/api-keys';

interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
}

interface PlaceResult {
  id: string;
  displayName: { text: string };
  photos?: PlacePhoto[];
}

/**
 * Search for a place using new Places API
 */
async function searchPlaceWithPhotos(placeName: string, address: string): Promise<{
  placeId: string | null;
  photoNames: string[];
}> {
  try {
    const apiKey = API_KEYS.GOOGLE_PLACES;
    const searchQuery = `${placeName} ${address}`;
    
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
      },
      body: JSON.stringify({
        textQuery: searchQuery
      })
    });
    
    const data = await response.json();
    
    if (!data.places || data.places.length === 0) {
      return { placeId: null, photoNames: [] };
    }
    
    const place: PlaceResult = data.places[0];
    const photoNames = place.photos?.slice(0, 8).map(p => p.name) || [];
    
    return {
      placeId: place.id,
      photoNames
    };
  } catch (error) {
    console.error(`Error searching:`, error);
    return { placeId: null, photoNames: [] };
  }
}

/**
 * Convert photo name to URL using Places Photo API
 */
function getPhotoUrl(photoName: string, maxWidth: number = 800): string {
  const apiKey = API_KEYS.GOOGLE_PLACES;
  // New API format: GET the photo resource with maxWidthPx or maxHeightPx
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${apiKey}`;
}

/**
 * Generate fallback Street View + Map images
 */
function getFallbackImages(lat: number, lng: number): string[] {
  const apiKey = API_KEYS.GOOGLE_PLACES;
  return [
    `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&heading=0&pitch=0&fov=90&key=${apiKey}`,
    `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&heading=90&pitch=0&fov=90&key=${apiKey}`,
    `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat},${lng}&heading=180&pitch=0&fov=90&key=${apiKey}`,
    `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=17&size=800x600&markers=color:red%7C${lat},${lng}&key=${apiKey}`
  ];
}

/**
 * Update all places with real Google Places photos
 */
async function updateAllPlacesWithRealPhotos() {
  console.log('🚀 Starting Google Places photo update...\n');
  console.log('📸 Will fetch REAL user-submitted photos:');
  console.log('  - Food photos, interior shots, dishes');
  console.log('  - Real customer photos from Google Maps');
  console.log('  - Up to 8 photos per place');
  console.log('  - Fallback to Street View if no photos\n');
  
  try {
    console.log('📊 Fetching places from Firestore...');
    const places = await PlacesService.getAllPlaces();
    console.log(`Found ${places.length} places\n`);
    
    let successCount = 0;
    let photosFoundCount = 0;
    let fallbackCount = 0;
    let totalPhotos = 0;
    
    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      if (!place) continue;
      
      try {
        console.log(`\n[${i + 1}/${places.length}] ${place.name}`);
        console.log(`   Searching Google Places...`);
        
        // Search for place and get photos
        const { placeId, photoNames } = await searchPlaceWithPhotos(
          place.name,
          place.location.address
        );
        
        let images: { hero: string; gallery: string[] };
        
        if (photoNames.length >= 3) {
          // Got real Google Places photos!
          const photoUrls = photoNames.map(name => getPhotoUrl(name));
          images = {
            hero: photoUrls[0] || '',
            gallery: photoUrls.slice(1, 8) // Up to 7 more photos
          };
          
          photosFoundCount++;
          totalPhotos += photoUrls.length;
          console.log(`   ✅ Found ${photoUrls.length} REAL photos from Google Places!`);
          
        } else {
          // Fallback to Street View + Maps
          const fallbackUrls = getFallbackImages(place.location.lat, place.location.lng);
          images = {
            hero: fallbackUrls[0] || '',
            gallery: fallbackUrls.slice(1)
          };
          
          fallbackCount++;
          console.log(`   ⚠️  No photos on Google - using Street View fallback`);
        }
        
        // Update in Firestore
        const updateData: any = { images };
        if (placeId) {
          updateData.googlePlacesId = placeId;
        }
        
        await PlacesService.updatePlace(place.id, updateData);
        successCount++;
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Error: ${errorMsg}`);
      }
      
      // Rate limiting - Places API has stricter limits
      if (i % 5 === 0 && i > 0) {
        console.log('\n   ⏳ Pausing to avoid rate limits...');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 GOOGLE PLACES PHOTOS UPDATE SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully updated: ${successCount} places`);
    console.log(`📸 Places with real Google photos: ${photosFoundCount}`);
    console.log(`🗺️  Places using Street View fallback: ${fallbackCount}`);
    console.log(`🎨 Total real place photos fetched: ${totalPhotos}`);
    console.log(`\n✅ Update complete!`);
    console.log(`🎉 Most places now have REAL user-submitted photos!\n`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

updateAllPlacesWithRealPhotos()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

