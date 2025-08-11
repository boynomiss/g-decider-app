/**
 * Test script for the reorganized utils structure
 * Run with: node test-reorganized-structure.js
 */

console.log('🧪 Testing Reorganized Utils Structure...\n');

// Test individual category imports
const testImports = [
  {
    category: '🔍 Filtering',
    path: './utils/filtering',
    expectedExports: ['unifiedFilterService', 'FilterUtilities', 'MoodUtils']
  },
  {
    category: '💾 Data', 
    path: './utils/data',
    expectedExports: ['unifiedCacheService', 'convertServerPlaceToPlaceData']
  },
  {
    category: '🌐 API',
    path: './utils/api',
    expectedExports: ['GooglePlacesClient', 'bookingIntegrationService']
  },
  {
    category: '🎨 Content',
    path: './utils/content', 
    expectedExports: ['generateComprehensiveDescription', 'aiProjectAgent']
  },
  {
    category: '💰 Monetization',
    path: './utils/monetization',
    expectedExports: ['adMonetizationService', 'DiscountService']
  },
  {
    category: '📱 Mobile',
    path: './utils/mobile',
    expectedExports: ['LocationService', 'locationService']
  },
  {
    category: '🛠️ Core',
    path: './utils/core',
    expectedExports: ['buttonStyles', 'getBudgetDisplay']
  }
];

async function testReorganizedStructure() {
  let passedTests = 0;
  let totalTests = testImports.length;

  for (const test of testImports) {
    try {
      console.log(`Testing ${test.category}...`);
      
      // Try to import the module
      const moduleExports = require(test.path);
      
      console.log(`  ✅ Module loads successfully`);
      console.log(`  📦 Available exports: ${Object.keys(moduleExports).slice(0, 5).join(', ')}${Object.keys(moduleExports).length > 5 ? '...' : ''}`);
      
      // Check for expected exports
      const missingExports = test.expectedExports.filter(exp => !(exp in moduleExports));
      if (missingExports.length === 0) {
        console.log(`  ✅ All expected exports found`);
        passedTests++;
      } else {
        console.log(`  ⚠️  Missing exports: ${missingExports.join(', ')}`);
        passedTests += 0.5; // Partial credit
      }
      
    } catch (error) {
      console.log(`  ❌ Failed to load: ${error.message}`);
    }
    
    console.log('');
  }

  // Test main index
  console.log('Testing 🎯 Main Index...');
  try {
    const mainIndex = require('./utils');
    console.log(`  ✅ Main index loads successfully`);
    console.log(`  📦 Total exports: ${Object.keys(mainIndex).length}`);
    totalTests++;
    passedTests++;
  } catch (error) {
    console.log(`  ❌ Main index failed: ${error.message}`);
    totalTests++;
  }

  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`📈 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Reorganized structure is working perfectly.');
  } else if (passedTests / totalTests > 0.8) {
    console.log('\n✨ Most tests passed! Minor issues that can be resolved.');
  } else {
    console.log('\n⚠️  Some issues detected. Structure may need adjustment.');
  }

  // Demonstrate usage examples
  console.log('\n💡 Usage Examples:');
  console.log(`
// Category-specific imports (recommended)
import { unifiedFilterService } from '@/utils/filtering';
import { locationService } from '@/utils/mobile';
import { adMonetizationService } from '@/utils/monetization';

// Main index import (convenience)
import { 
  unifiedFilterService,
  locationService, 
  adMonetizationService 
} from '@/utils';
  `);
}

// Run the test
if (require.main === module) {
  testReorganizedStructure()
    .then(() => {
      console.log('\n✅ Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testReorganizedStructure };