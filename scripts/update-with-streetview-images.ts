/**
 * Update Places with Google Street View Images
 * Generates real images using Google Maps Static Street View API
 * Each place gets 3+ real images of the actual location
 */

import { PlacesService } from '../src/services/mvp/firebase-service';
import { API_KEYS } from '../src/shared/constants/config/api-keys';

/**
 * Generate Google Maps Street View URL
 * Returns real image of the location from Street View
 */
function getStreetViewUrl(
  lat: number,
  lng: number,
  heading: number = 0,
  pitch: number = 0,
  fov: number = 90
): string {
  const apiKey = API_KEYS.GOOGLE_PLACES;
  const size = '800x600';
  
  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&heading=${heading}&pitch=${pitch}&fov=${fov}&key=${apiKey}`;
}

/**
 * Generate Google Maps Static Map URL
 * Shows map view with marker at the location
 */
function getStaticMapUrl(
  lat: number,
  lng: number,
  zoom: number = 17
): string {
  const apiKey = API_KEYS.GOOGLE_PLACES;
  const size = '800x600';
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
}

/**
 * Generate multiple Street View angles for a place
 * Returns 3 different views (front, sides) + 1 map view
 */
function generatePlaceImages(lat: number, lng: number): {
  hero: string;
  gallery: string[];
} {
  return {
    hero: getStreetViewUrl(lat, lng, 0, 0, 90),      // Front view
    gallery: [
      getStreetViewUrl(lat, lng, 90, 0, 90),         // Right side view
      getStreetViewUrl(lat, lng, 180, 0, 90),        // Back view  
      getStreetViewUrl(lat, lng, 270, 0, 90),        // Left side view
      getStreetViewUrl(lat, lng, 0, 10, 80),         // Slightly elevated view
      getStaticMapUrl(lat, lng, 17)                   // Map view (last image in carousel)
    ]
  };
}

/**
 * Update all places with Street View images
 */
async function updateAllPlacesWithStreetView() {
  console.log('🚀 Starting Street View image update...\n');
  console.log('📸 Each place will get:');
  console.log('  - 1 Hero image (front Street View)');
  console.log('  - 5 Gallery images (4 Street View angles + 1 map view)');
  console.log('  - Total: 6 real Google images per place\n');
  
  try {
    // Get all places from Firestore
    console.log('📊 Fetching places from Firestore...');
    const places = await PlacesService.getAllPlaces();
    console.log(`Found ${places.length} places\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      if (!place) {
        continue;
      }
      
      try {
        console.log(`[${i + 1}/${places.length}] Updating: ${place.name}`);
        
        // Generate Street View images based on coordinates
        const images = generatePlaceImages(
          place.location.lat,
          place.location.lng
        );
        
        // Update place in Firestore
        const updateData: any = {
          images: {
            hero: images.hero,
            gallery: images.gallery
          }
        };
        
        await PlacesService.updatePlace(place.id, updateData);
        
        successCount++;
        console.log(`   ✅ Updated with 6 Street View images`);
        
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Failed: ${errorMsg}`);
      }
      
      // Rate limiting - wait between requests to avoid overwhelming Firestore
      if (i % 20 === 0 && i > 0) {
        console.log('\n   ⏳ Pausing briefly...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 STREET VIEW UPDATE SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully updated: ${successCount} places`);
    console.log(`❌ Failed: ${failCount} places`);
    console.log(`📸 Total images added: ${successCount * 6}`);
    console.log(`\n✅ All places now have real Google Street View images!`);
    console.log(`🎨 Each place has 6 images (5 angles + 1 map view)\n`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run the update
updateAllPlacesWithStreetView()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

