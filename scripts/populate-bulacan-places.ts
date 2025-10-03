/**
 * Bulacan Places Population Script
 * Adds Bulacan places near Philippine Arena to Firebase
 */

import { PlacesService } from '../src/services/mvp/firebase-service';
import { allBulacanPlaces, BULACAN_PLACE_COUNTS } from '../data/bulacan-places';

async function populateBulacanPlaces() {
  console.log('🚀 Starting Bulacan places population...\n');
  console.log('📍 Focus Area: Philippine Arena, Bocaue, Santa Maria, Malolos\n');
  
  try {
    console.log('📊 Bulacan places to add:');
    console.log(`  Food: ${BULACAN_PLACE_COUNTS.food} places`);
    console.log(`  Activity: ${BULACAN_PLACE_COUNTS.activity} places`);
    console.log(`  Something New: ${BULACAN_PLACE_COUNTS['something-new']} places`);
    console.log(`\n  Total: ${BULACAN_PLACE_COUNTS.total} places\n`);
    
    console.log('⏳ Adding Bulacan places to Firebase ...\n');
    
    let successCount = 0;
    let failCount = 0;
    const errors: { place: string; error: string }[] = [];
    
    for (let i = 0; i < allBulacanPlaces.length; i++) {
      const place = allBulacanPlaces[i];
      if (!place) {
        console.warn(`⚠️ Skipping undefined place at index ${i}`);
        continue;
      }
      
      try {
        const id = await PlacesService.addPlace(place);
        successCount++;
        console.log(`✅ [${i + 1}/${allBulacanPlaces.length}] Added: ${place.name} (ID: ${id})`);
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ place: place.name, error: errorMsg });
        console.error(`❌ [${i + 1}/${allBulacanPlaces.length}] Failed: ${place.name} - ${errorMsg}`);
      }
      
      // Add small delay to avoid rate limiting
      if (i % 10 === 0 && i > 0) {
        console.log(`   ... pausing briefly to avoid rate limits ...\n`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 BULACAN POPULATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully added: ${successCount} Bulacan places`);
    console.log(`❌ Failed: ${failCount} places`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ place, error }) => {
        console.log(`   - ${place}: ${error}`);
      });
    }
    
    console.log('\n✅ Bulacan places population complete!');
    console.log('📝 Run audit to see updated distribution:\n');
    console.log('   npm run audit-db\n');
    
  } catch (error) {
    console.error('❌ Fatal error during Bulacan population:', error);
    throw error;
  }
}

// Run population
populateBulacanPlaces()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

