/**
 * Database Audit Script
 * Counts places per category-mood combination to verify balanced distribution
 */

import { PlacesService } from '../src/services/mvp/firebase-service';

interface CategoryMoodCount {
  category: string;
  moodRange: string;
  moodScoreRange: { min: number; max: number };
  count: number;
  places: string[];
}

const CATEGORIES = ['food', 'activity', 'something-new'];
const MOOD_RANGES = [
  { name: 'chill', min: 1, max: 40 },
  { name: 'neutral', min: 35, max: 65 },
  { name: 'hype', min: 60, max: 100 }
];

async function auditDatabase() {
  console.log('🔍 Starting database audit...\n');
  
  try {
    // Get all places from database
    const allPlaces = await PlacesService.getAllPlaces();
    const activePlaces = allPlaces.filter(p => p.metadata.status === 'active');
    
    console.log(`📊 Total places in database: ${allPlaces.length}`);
    console.log(`✅ Active places: ${activePlaces.length}`);
    console.log(`❌ Inactive/Pending places: ${allPlaces.length - activePlaces.length}\n`);
    
    // Count by category-mood combination
    const results: CategoryMoodCount[] = [];
    
    for (const category of CATEGORIES) {
      for (const moodRange of MOOD_RANGES) {
        const matchingPlaces = activePlaces.filter(place => {
          const matchesCategory = place.category === category;
          const moodScore = place.discovery?.moodScore || 50;
          const matchesMood = moodScore >= moodRange.min && moodScore <= moodRange.max;
          return matchesCategory && matchesMood;
        });
        
        results.push({
          category,
          moodRange: moodRange.name,
          moodScoreRange: { min: moodRange.min, max: moodRange.max },
          count: matchingPlaces.length,
          places: matchingPlaces.map(p => p.name)
        });
      }
    }
    
    // Display results in a table format
    console.log('📋 AUDIT RESULTS BY CATEGORY-MOOD COMBINATION');
    console.log('='.repeat(80));
    console.log('Category         | Mood Range      | Score Range | Count | Status');
    console.log('-'.repeat(80));
    
    let totalCount = 0;
    const TARGET_PER_COMBO = 100;
    
    for (const result of results) {
      const status = result.count >= TARGET_PER_COMBO ? '✅ Complete' : 
                     result.count > 0 ? `⚠️  Need ${TARGET_PER_COMBO - result.count} more` : 
                     '❌ Empty';
      
      console.log(
        `${result.category.padEnd(16)} | ` +
        `${result.moodRange.padEnd(15)} | ` +
        `${result.moodScoreRange.min}-${result.moodScoreRange.max}`.padEnd(11) + ' | ' +
        `${result.count.toString().padStart(5)} | ` +
        status
      );
      
      totalCount += result.count;
    }
    
    console.log('='.repeat(80));
    console.log(`\nTotal unique active places across all combinations: ${totalCount}`);
    console.log(`Target: ${9 * TARGET_PER_COMBO} places (100 per combination × 9 combinations)`);
    console.log(`Progress: ${((totalCount / (9 * TARGET_PER_COMBO)) * 100).toFixed(1)}%\n`);
    
    // Category breakdown
    console.log('📊 BREAKDOWN BY CATEGORY');
    console.log('-'.repeat(50));
    for (const category of CATEGORIES) {
      const categoryPlaces = activePlaces.filter(p => p.category === category);
      console.log(`${category.padEnd(20)}: ${categoryPlaces.length} places`);
    }
    
    // Mood distribution breakdown
    console.log('\n📊 BREAKDOWN BY MOOD RANGE');
    console.log('-'.repeat(50));
    for (const moodRange of MOOD_RANGES) {
      const moodPlaces = activePlaces.filter(p => {
        const score = p.discovery?.moodScore || 50;
        return score >= moodRange.min && score <= moodRange.max;
      });
      console.log(
        `${moodRange.name.padEnd(15)} (${moodRange.min}-${moodRange.max})`.padEnd(25) + 
        `: ${moodPlaces.length} places`
      );
    }
    
    // Detailed gaps
    console.log('\n🎯 PLACES NEEDED TO REACH TARGET');
    console.log('-'.repeat(50));
    for (const result of results) {
      if (result.count < TARGET_PER_COMBO) {
        const needed = TARGET_PER_COMBO - result.count;
        console.log(`${result.category} + ${result.moodRange}: Need ${needed} more places`);
      }
    }
    
    console.log('\n✅ Audit complete!\n');
    
  } catch (error) {
    console.error('❌ Error during audit:', error);
    throw error;
  }
}

// Run audit
auditDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });


