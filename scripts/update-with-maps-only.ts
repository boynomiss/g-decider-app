/**
 * Update Places with Google Static Maps Only
 * Works immediately without Street View API
 * Uses different map zoom levels and styles for variety
 */

import { PlacesService } from '../src/services/mvp/firebase-service';
import { API_KEYS } from '../src/shared/constants/config/api-keys';

/**
 * Generate Google Maps Static Map URL
 */
function getStaticMapUrl(
  lat: number,
  lng: number,
  zoom: number = 17,
  maptype: string = 'roadmap',
  size: string = '800x600'
): string {
  const apiKey = API_KEYS.GOOGLE_PLACES;
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=${maptype}&markers=color:red%7Clabel:📍%7C${lat},${lng}&key=${apiKey}`;
}

/**
 * Generate multiple map views for variety
 */
function generatePlaceImages(lat: number, lng: number): {
  hero: string;
  gallery: string[];
} {
  return {
    // Hero: Close-up map with marker
    hero: getStaticMapUrl(lat, lng, 18, 'roadmap'),
    gallery: [
      // Different zoom levels and map types for variety
      getStaticMapUrl(lat, lng, 17, 'roadmap'),      // Normal zoom
      getStaticMapUrl(lat, lng, 16, 'roadmap'),      // Zoomed out
      getStaticMapUrl(lat, lng, 18, 'hybrid'),       // Satellite + roads
      getStaticMapUrl(lat, lng, 17, 'satellite'),    // Pure satellite
      getStaticMapUrl(lat, lng, 15, 'roadmap')       // Area context
    ]
  };
}

/**
 * Update all places with static map images
 */
async function updateAllPlacesWithMaps() {
  console.log('🚀 Starting Static Maps image update...\n');
  console.log('📸 Each place will get:');
  console.log('  - 1 Hero image (close-up map)');
  console.log('  - 5 Gallery images (different zoom levels + satellite views)');
  console.log('  - Total: 6 Google Maps images per place');
  console.log('  - ✅ Works immediately (no Street View API needed)\n');
  
  try {
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
        
        // Generate map images
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
        console.log(`   ✅ Updated with 6 map images`);
        
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`   ❌ Failed: ${errorMsg}`);
      }
      
      // Rate limiting
      if (i % 20 === 0 && i > 0) {
        console.log('\n   ⏳ Pausing briefly...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 MAPS UPDATE SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully updated: ${successCount} places`);
    console.log(`❌ Failed: ${failCount} places`);
    console.log(`📸 Total images added: ${successCount * 6}`);
    console.log(`\n✅ All places now have Google Maps images!`);
    console.log(`🗺️ Multiple zoom levels + satellite views for variety\n`);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

updateAllPlacesWithMaps()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

