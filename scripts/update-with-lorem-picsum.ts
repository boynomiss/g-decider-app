/**
 * Update Places with Lorem Picsum Images
 * Reliable, fast-loading, real photos
 * NO API KEY NEEDED - Works immediately!
 */

import { PlacesService } from '../src/services/mvp/firebase-service';

/**
 * Get category-themed image from Lorem Picsum
 * Uses consistent seeds for same images per place
 */
function getLoremPicsumImage(seed: number, width: number = 800, height: number = 600): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

/**
 * Generate 6 images for a place based on category
 */
function generatePlaceImages(
  category: string,
  placeId: string
): {
  hero: string;
  gallery: string[];
} {
  // Generate unique seed from place ID
  const baseSeed = placeId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Category offsets for variety
  const categoryOffsets: Record<string, number> = {
    'food': 10000,
    'activity': 20000,
    'something-new': 30000
  };
  
  const offset = categoryOffsets[category] || 0;
  
  return {
    hero: getLoremPicsumImage(offset + baseSeed),
    gallery: [
      getLoremPicsumImage(offset + baseSeed + 1),
      getLoremPicsumImage(offset + baseSeed + 2),
      getLoremPicsumImage(offset + baseSeed + 3),
      getLoremPicsumImage(offset + baseSeed + 4),
      getLoremPicsumImage(offset + baseSeed + 5)
    ]
  };
}

/**
 * Update all places
 */
async function updateAllPlacesWithLorem() {
  console.log('🚀 Starting Lorem Picsum image update...\n');
  console.log('📸 Each place will get 6 high-quality real photos');
  console.log('✅ Fast loading - No API key needed');
  console.log('🎨 Category-specific image seeds for variety\n');
  
  try {
    console.log('📊 Fetching places...');
    const places = await PlacesService.getAllPlaces();
    console.log(`Found ${places.length} places\n`);
    
    let successCount = 0;
    
    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      if (!place) continue;
      
      try {
        const images = generatePlaceImages(place.category, place.id);
        
        await PlacesService.updatePlace(place.id, {
          images: {
            hero: images.hero,
            gallery: images.gallery
          }
        });
        
        successCount++;
        if ((i + 1) % 20 === 0) {
          console.log(`✅ Updated ${i + 1}/${places.length} places...`);
        }
        
      } catch (error) {
        console.error(`❌ Failed: ${place.name}`);
      }
      
      if (i % 50 === 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`\n✅ Complete! Updated ${successCount}/${places.length} places`);
    console.log(`📸 Total: ${successCount * 6} images`);
    console.log(`\n🎉 Images will now load FAST in your app!\n`);
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

updateAllPlacesWithLorem()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

