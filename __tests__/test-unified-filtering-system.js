/**
 * Test script for the new Unified Filtering System
 * Run with: node test-unified-filtering-system.js
 */

const { unifiedFilterService } = require('./utils/unified-filtering-system');

async function testUnifiedFilteringSystem() {
  console.log('🧪 Testing Unified Filtering System...\n');

  try {
    // Test 1: Basic filtering
    console.log('Test 1: Basic Filtering');
    console.log('========================');
    
    const basicFilters = {
      category: 'food',
      mood: 75,
      budget: 'PP',
      socialContext: 'with-bae',
      timeOfDay: 'night',
      distanceRange: 60,
      userLocation: { lat: 14.5995, lng: 120.9842 }, // Manila coordinates
      minResults: 5
    };

    console.log('Filters:', JSON.stringify(basicFilters, null, 2));
    
    const startTime = Date.now();
    const result = await unifiedFilterService.filterPlaces(basicFilters);
    const duration = Date.now() - startTime;

    console.log('✅ Result:');
    console.log(`  - Places found: ${result.places.length}`);
    console.log(`  - Source: ${result.metadata.source}`);
    console.log(`  - Cache hit: ${result.metadata.cacheHit}`);
    console.log(`  - Response time: ${duration}ms`);
    console.log(`  - Loading state: ${result.loadingState}`);
    console.log(`  - Filters applied: ${result.metadata.filtersApplied.join(', ')}`);
    
    if (result.metadata.expansionInfo) {
      console.log(`  - Expansions: ${result.metadata.expansionInfo.expansionCount}`);
      console.log(`  - Final radius: ${result.metadata.expansionInfo.finalRadius}m`);
    }

    // Test 2: Cache performance
    console.log('\nTest 2: Cache Performance');
    console.log('==========================');
    
    const cacheStartTime = Date.now();
    const cachedResult = await unifiedFilterService.filterPlaces(basicFilters);
    const cacheDuration = Date.now() - cacheStartTime;

    console.log('✅ Cached Result:');
    console.log(`  - Places found: ${cachedResult.places.length}`);
    console.log(`  - Cache hit: ${cachedResult.metadata.cacheHit}`);
    console.log(`  - Response time: ${cacheDuration}ms`);
    console.log(`  - Speed improvement: ${Math.round(((duration - cacheDuration) / duration) * 100)}%`);

    // Test 3: Different filter combinations
    console.log('\nTest 3: Different Filter Combinations');
    console.log('======================================');
    
    const filterVariations = [
      { category: 'activity', mood: 30, budget: 'P', socialContext: 'solo' },
      { category: 'something-new', mood: 90, budget: 'PPP', socialContext: 'barkada' },
      { category: null, mood: 50, budget: null, socialContext: null }
    ];

    for (let i = 0; i < filterVariations.length; i++) {
      const variation = { ...filterVariations[i], userLocation: basicFilters.userLocation };
      console.log(`\n  Variation ${i + 1}:`, JSON.stringify(variation, null, 4));
      
      const varResult = await unifiedFilterService.filterPlaces(variation);
      console.log(`    ✅ Found ${varResult.places.length} places (${varResult.metadata.source})`);
    }

    // Test 4: Service statistics
    console.log('\nTest 4: Service Statistics');
    console.log('===========================');
    
    const stats = unifiedFilterService.getStatistics();
    console.log('✅ Statistics:');
    console.log(`  Cache:`);
    console.log(`    - Memory entries: ${stats.cache.memory.entries}`);
    console.log(`    - Storage entries: ${stats.cache.storage.entries}`);
    console.log(`    - Overall hit rate: ${(stats.cache.overall.hitRate * 100).toFixed(1)}%`);
    console.log(`  API:`);
    console.log(`    - Total requests: ${stats.api.totalRequests}`);
    console.log(`    - Successful: ${stats.api.successfulRequests}`);
    console.log(`    - Failed: ${stats.api.failedRequests}`);
    console.log(`    - Average response time: ${Math.round(stats.api.averageResponseTime)}ms`);
    console.log(`  Pool:`);
    console.log(`    - Total places: ${stats.pool.totalPlaces}`);
    console.log(`    - Used places: ${stats.pool.usedPlaces}`);
    console.log(`    - Remaining: ${stats.pool.remainingPlaces}`);

    // Test 5: Next batch functionality
    console.log('\nTest 5: Next Batch Functionality');
    console.log('==================================');
    
    const nextBatch = await unifiedFilterService.getNextBatch(basicFilters);
    console.log('✅ Next Batch:');
    console.log(`  - Places found: ${nextBatch.places.length}`);
    console.log(`  - Source: ${nextBatch.metadata.source}`);
    console.log(`  - Cache hit: ${nextBatch.metadata.cacheHit}`);

    // Test 6: Configuration update
    console.log('\nTest 6: Configuration Update');
    console.log('=============================');
    
    unifiedFilterService.updateConfig({
      useCache: true,
      cacheStrategy: 'cache-first',
      minResults: 8,
      maxResults: 15,
      timeout: 15000
    });
    
    console.log('✅ Configuration updated successfully');

    // Test 7: Cache invalidation
    console.log('\nTest 7: Cache Invalidation');
    console.log('===========================');
    
    await unifiedFilterService.invalidateCache('category', 'food');
    console.log('✅ Cache invalidated for category: food');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Final Statistics:');
    
    const finalStats = unifiedFilterService.getStatistics();
    console.log(`Total API requests made: ${finalStats.api.totalRequests}`);
    console.log(`Cache hit rate: ${(finalStats.cache.overall.hitRate * 100).toFixed(1)}%`);
    console.log(`Average response time: ${Math.round(finalStats.cache.overall.averageResponseTime)}ms`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testUnifiedFilteringSystem()
    .then(() => {
      console.log('\n✅ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testUnifiedFilteringSystem };