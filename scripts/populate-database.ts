/**
 * Database Population Script
 * Adds places from metro-manila-places.ts to Firebase
 */

import { PlacesService } from '../src/services/mvp/firebase-service';
import { allPlaces, PLACE_COUNTS } from '../data/metro-manila-places';

async function populateDatabase() {
  console.log('🚀 Starting database population...\n');
  
  try {
    console.log('📊 Places to add:');
    console.log('  Food + Chill:', PLACE_COUNTS['food-chill']);
    console.log('  Food + Neutral:', PLACE_COUNTS['food-neutral']);
    console.log('  Food + Hype:', PLACE_COUNTS['food-hype']);
    console.log('  Activity + Chill:', PLACE_COUNTS['activity-chill']);
    console.log('  Activity + Neutral:', PLACE_COUNTS['activity-neutral']);
    console.log('  Activity + Hype:', PLACE_COUNTS['activity-hype']);
    console.log('  Something New + Chill:', PLACE_COUNTS['something-new-chill']);
    console.log('  Something New + Neutral:', PLACE_COUNTS['something-new-neutral']);
    console.log('  Something New + Hype:', PLACE_COUNTS['something-new-hype']);
    console.log(`\n  Total: ${PLACE_COUNTS.total} places\n`);
    
    console.log('⏳ Adding places to Firebase ...\n');
    
    let successCount = 0;
    let failCount = 0;
    const errors: { place: string; error: string }[] = [];
    
    for (let i = 0; i < allPlaces.length; i++) {
      const place = allPlaces[i];
      if (!place) {
        console.warn(`⚠️ Skipping undefined place at index ${i}`);
        continue;
      }
      
      try {
        const id = await PlacesService.addPlace(place);
        successCount++;
        console.log(`✅ [${i + 1}/${allPlaces.length}] Added: ${place.name} (ID: ${id})`);
      } catch (error) {
        failCount++;
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        errors.push({ place: place.name, error: errorMsg });
        console.error(`❌ [${i + 1}/${allPlaces.length}] Failed: ${place.name} - ${errorMsg}`);
      }
      
      // Add small delay to avoid rate limiting
      if (i % 10 === 0 && i > 0) {
        console.log(`   ... pausing briefly to avoid rate limits ...\n`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 POPULATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Successfully added: ${successCount} places`);
    console.log(`❌ Failed: ${failCount} places`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ place, error }) => {
        console.log(`   - ${place}: ${error}`);
      });
    }
    
    console.log('\n✅ Database population complete!');
    console.log('📝 Run the audit script to verify distribution:\n');
    console.log('   npm run audit-database\n');
    
  } catch (error) {
    console.error('❌ Fatal error during population:', error);
    throw error;
  }
}

// Run population
populateDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


