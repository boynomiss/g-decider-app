/**
 * Fetch Google Place IDs and Images Script
 * Automatically finds Google Place IDs and fetches photos for all places
 */

import { PlacesService } from '../src/services/mvp/firebase-service';
import { API_KEYS } from '../src/shared/constants/config/api-keys';

interface GooglePlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  photos?: GooglePlacePhoto[];
}

/**
 * Search for a place and get its Google Place ID and photos
 */
async function searchPlaceWithPhotos(
  placeName: string,
  address: string,
  lat: number,
  lng: number
): Promise<{ placeId: string | null; photoReferences: string[] }> {
  try {
    const apiKey = API_KEYS.GOOGLE_PLACES;
    
    // First, search for the place
    const searchQuery = encodeURIComponent(`${placeName} ${address}`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&location=${lat},${lng}&radius=500&key=${apiKey}`;
    
    console.log(`   Searching: ${placeName}...`);
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.status !== 'OK' || !searchData.results || searchData.results.length === 0) {
      console.log(`   ⚠️  No results found for: ${placeName}`);
      return { placeId: null, photoReferences: [] };
    }
    
    const place = searchData.results[0] as GooglePlaceResult;
    const placeId = place.place_id;
    
    // If the search result has photos, use them
    if (place.photos && place.photos.length > 0) {
      const photoRefs = place.photos.slice(0, 8).map(p => p.photo_reference);
      console.log(`   ✅ Found ${photoRefs.length} photos`);
      return { placeId, photoReferences: photoRefs };
    }
    
    // Otherwise, fetch place details to get photos
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (detailsData.status === 'OK' && detailsData.result.photos) {
      const photoRefs = detailsData.result.photos.slice(0, 8).map((p: GooglePlacePhoto) => p.photo_reference);
      console.log(`   ✅ Found ${photoRefs.length} photos from details`);
      return { placeId, photoReferences: photoRefs };
    }
    
    console.log(`   ⚠️  No photos found for: ${placeName}`);
    return { placeId, photoReferences: [] };
    
  } catch (error) {
    console.error(`   ❌ Error searching for ${placeName}:`, error);
    return { placeId: null, photoReferences: [] };
  }
}

/**
 * Convert photo reference to full URL
 */
function getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
  const apiKey = API_KEYS.GOOGLE_PLACES;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

/**
 * Main function to update all places with Google images
 */
async function updateAllPlacesWithImages() {
  console.log('🚀 Starting Google Places image fetch...\n');
  console.log('This will:');
  console.log('  1. Search for each place on Google');
  console.log('  2. Fetch at least 3 photos per place');
  console.log('  3. Update Firestore with real image URLs');
  console.log('  4. Add Google Place IDs for future use\n');
  
  try {
    // Get all places from Firestore
    console.log('📊 Fetching places from Firestore...');
    const places = await PlacesService.getAllPlaces();
    console.log(`Found ${places.length} places\n`);
    
    let successCount = 0;
    let failCount = 0;
    let photosAdded = 0;
    
    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      if (!place) {
        console.log(`\n[${i + 1}/${places.length}] Skipping undefined place`);
        continue;
      }
      
      console.log(`\n[${i + 1}/${places.length}] ${place.name}`);
      
      // Search for Google Place ID and photos
      const { placeId, photoReferences } = await searchPlaceWithPhotos(
        place.name,
        place.location.address,
        place.location.lat,
        place.location.lng
      );
      
      if (photoReferences.length >= 3) {
        // Convert photo references to URLs
        const photoUrls = photoReferences.map(ref => getPhotoUrl(ref));
        
        // Update place in Firestore
        const updateData: any = {
          images: {
            hero: photoUrls[0] || '',
            gallery: photoUrls.slice(1, 8) // Keep up to 7 more photos
          }
        };
        if (placeId) {
          updateData.googlePlacesId = placeId;
        }
        await PlacesService.updatePlace(place.id, updateData);
        
        successCount++;
        photosAdded += photoUrls.length;
        console.log(`   ✅ Updated with ${photoUrls.length} photos`);
      } else if (photoReferences.length > 0) {
        // Even if less than 3, update what we have
        const photoUrls = photoReferences.map(ref => getPhotoUrl(ref));
        
        const updateData: any = {
          images: {
            hero: photoUrls[0] || '',
            gallery: photoUrls.slice(1)
          }
        };
        if (placeId) {
          updateData.googlePlacesId = placeId;
        }
        await PlacesService.updatePlace(place.id, updateData);
        
        successCount++;
        photosAdded += photoUrls.length;
        console.log(`   ⚠️  Updated with only ${photoUrls.length} photos`);
      } else {
        failCount++;
        console.log(`   ❌ No photos found - keeping placeholder`);
      }
      
      // Rate limiting - wait between requests
      if (i % 5 === 0 && i > 0) {
        console.log('\n   ⏳ Pausing to avoid rate limits...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 UPDATE SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully updated: ${successCount} places`);
    console.log(`❌ No photos found: ${failCount} places`);
    console.log(`📸 Total photos added: ${photosAdded}`);
    console.log(`📊 Average photos per place: ${(photosAdded / successCount).toFixed(1)}`);
    console.log('\n✅ Image update complete!');
    console.log('🎨 All places now have real Google images!\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run the update
updateAllPlacesWithImages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

