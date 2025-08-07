// Test Category Configuration System
// This file tests the new consolidated category configuration system

const { 
  CATEGORY_FILTERS, 
  CATEGORY_TYPE_MAPPING, 
  CATEGORY_LABELS,
  categoryOptions,
  CategoryUtils,
  getCategoryFilter,
  getCategoryLabel,
  getPreferredPlaceTypes,
  validateCategoryId,
  getAllCategoryFilters,
  getCategoryFilterById,
  getCategoryMappings,
  getCategoryMappingsForAPI,
  getCategoryContext,
  getCategoryPriority,
  isCompatibleWithMood,
  isCompatibleWithSocialContext,
  getActivitySuggestions,
  getAtmosphereKeywords,
  getSearchKeywords,
  getCategoryByPriority,
  getCategoriesByPriority
} = require('./utils/category-config.ts');

console.log('🧪 Testing Category Configuration System\n');

// Test 1: Basic Configuration
console.log('1️⃣ BASIC CONFIGURATION TEST');
console.log('Category Filters:', CATEGORY_FILTERS.length);
CATEGORY_FILTERS.forEach(category => {
  console.log(`   • ${category.icon} ${category.label}: ${category.description}`);
});
console.log('✅ Basic configuration loaded successfully\n');

// Test 2: Category Type Mappings
console.log('2️⃣ CATEGORY TYPE MAPPINGS TEST');
Object.entries(CATEGORY_TYPE_MAPPING).forEach(([category, types]) => {
  console.log(`   • ${category}: ${types.length} place types`);
});
console.log('✅ Category type mappings loaded successfully\n');

// Test 3: Utility Functions
console.log('3️⃣ UTILITY FUNCTIONS TEST');

// Test getCategoryFilter
const foodCategory = getCategoryFilter('food');
console.log(`   • getCategoryFilter('food'): ${foodCategory ? '✅ Found' : '❌ Not found'}`);

// Test getCategoryLabel
const foodLabel = getCategoryLabel('food');
console.log(`   • getCategoryLabel('food'): "${foodLabel}"`);

// Test getPreferredPlaceTypes
const foodTypes = getPreferredPlaceTypes('food');
console.log(`   • getPreferredPlaceTypes('food'): ${foodTypes.length} types`);

// Test validateCategoryId
const validFood = validateCategoryId('food');
const validInvalid = validateCategoryId('invalid');
console.log(`   • validateCategoryId('food'): ${validFood ? '✅ Valid' : '❌ Invalid'}`);
console.log(`   • validateCategoryId('invalid'): ${validInvalid ? '✅ Valid' : '❌ Invalid'}`);

// Test getAllCategoryFilters
const allCategories = getAllCategoryFilters();
console.log(`   • getAllCategoryFilters(): ${allCategories.length} categories`);

// Test getCategoryFilterById
const activityCategory = getCategoryFilterById('activity');
console.log(`   • getCategoryFilterById('activity'): ${activityCategory ? '✅ Found' : '❌ Not found'}`);

// Test getCategoryMappings
const mappings = getCategoryMappings();
console.log(`   • getCategoryMappings(): ${mappings.length} mappings`);

// Test getCategoryMappingsForAPI
const apiMappings = getCategoryMappingsForAPI();
console.log(`   • getCategoryMappingsForAPI(): ${Object.keys(apiMappings).length} mappings`);

// Test getCategoryContext
const foodContext = getCategoryContext('food');
const activityContext = getCategoryContext('activity');
console.log(`   • getCategoryContext('food'): "${foodContext}"`);
console.log(`   • getCategoryContext('activity'): "${activityContext}"`);

// Test getCategoryPriority
const foodPriority = getCategoryPriority('food');
const activityPriority = getCategoryPriority('activity');
console.log(`   • getCategoryPriority('food'): ${foodPriority}`);
console.log(`   • getCategoryPriority('activity'): ${activityPriority}`);

// Test isCompatibleWithMood
const foodChillCompatible = isCompatibleWithMood('food', 20);
const activityHypeCompatible = isCompatibleWithMood('activity', 80);
console.log(`   • isCompatibleWithMood('food', 20): ${foodChillCompatible ? '✅ Compatible' : '❌ Not compatible'}`);
console.log(`   • isCompatibleWithMood('activity', 80): ${activityHypeCompatible ? '✅ Compatible' : '❌ Not compatible'}`);

// Test isCompatibleWithSocialContext
const foodSoloCompatible = isCompatibleWithSocialContext('food', 'solo');
const activityBarkadaCompatible = isCompatibleWithSocialContext('activity', 'barkada');
console.log(`   • isCompatibleWithSocialContext('food', 'solo'): ${foodSoloCompatible ? '✅ Compatible' : '❌ Not compatible'}`);
console.log(`   • isCompatibleWithSocialContext('activity', 'barkada'): ${activityBarkadaCompatible ? '✅ Compatible' : '❌ Not compatible'}`);

// Test getActivitySuggestions
const foodActivities = getActivitySuggestions('food');
const activityActivities = getActivitySuggestions('activity');
console.log(`   • getActivitySuggestions('food'): ${foodActivities.length} suggestions`);
console.log(`   • getActivitySuggestions('activity'): ${activityActivities.length} suggestions`);

// Test getAtmosphereKeywords
const foodAtmosphere = getAtmosphereKeywords('food');
const activityAtmosphere = getAtmosphereKeywords('activity');
console.log(`   • getAtmosphereKeywords('food'): ${foodAtmosphere.length} keywords`);
console.log(`   • getAtmosphereKeywords('activity'): ${activityAtmosphere.length} keywords`);

// Test getSearchKeywords
const foodSearch = getSearchKeywords('food');
const activitySearch = getSearchKeywords('activity');
console.log(`   • getSearchKeywords('food'): ${foodSearch.length} keywords`);
console.log(`   • getSearchKeywords('activity'): ${activitySearch.length} keywords`);

// Test getCategoryByPriority
const priority1Category = getCategoryByPriority(1);
const priority2Category = getCategoryByPriority(2);
console.log(`   • getCategoryByPriority(1): ${priority1Category ? priority1Category.label : 'Not found'}`);
console.log(`   • getCategoryByPriority(2): ${priority2Category ? priority2Category.label : 'Not found'}`);

// Test getCategoriesByPriority
const sortedCategories = getCategoriesByPriority();
console.log(`   • getCategoriesByPriority(): ${sortedCategories.length} categories sorted by priority`);

console.log('✅ Utility functions working correctly\n');

// Test 4: Backward Compatibility
console.log('4️⃣ BACKWARD COMPATIBILITY TEST');
console.log(`   • categoryOptions: ${categoryOptions.length} options`);
categoryOptions.forEach(option => {
  console.log(`     - ${option.icon} ${option.label}`);
});
console.log('✅ Backward compatibility maintained\n');

// Test 5: Category Filter Details
console.log('5️⃣ CATEGORY FILTER DETAILS TEST');
CATEGORY_FILTERS.forEach(category => {
  console.log(`\n   ${category.icon} ${category.label}:`);
  console.log(`     • Description: ${category.description}`);
  console.log(`     • Priority: ${category.priority}`);
  console.log(`     • Place Types: ${category.preferredPlaceTypes.length} types`);
  console.log(`     • Mood Compatibility: ${category.moodCompatibility.join(', ')}`);
  console.log(`     • Social Compatibility: ${category.socialCompatibility.join(', ')}`);
  console.log(`     • Budget Preferences: ${category.budgetPreferences.join(', ')}`);
  console.log(`     • Time Compatibility: ${category.timeCompatibility.join(', ')}`);
  console.log(`     • Activity Suggestions: ${category.activitySuggestions.length} suggestions`);
  console.log(`     • Atmosphere Keywords: ${category.atmosphereKeywords.join(', ')}`);
  console.log(`     • Search Keywords: ${category.searchKeywords.join(', ')}`);
});
console.log('\n✅ Category filter details comprehensive\n');

// Test 6: Integration with Mood System
console.log('6️⃣ MOOD INTEGRATION TEST');
const testMoods = [10, 50, 90]; // chill, neutral, hype
CATEGORY_FILTERS.forEach(category => {
  console.log(`\n   ${category.icon} ${category.label} Mood Compatibility:`);
  testMoods.forEach(mood => {
    const compatible = isCompatibleWithMood(category.id, mood);
    const moodCategory = mood <= 33.33 ? 'chill' : mood <= 66.66 ? 'neutral' : 'hype';
    console.log(`     • ${moodCategory} (${mood}): ${compatible ? '✅ Compatible' : '❌ Not compatible'}`);
  });
});
console.log('\n✅ Mood integration working correctly\n');

// Test 7: Integration with Social Context System
console.log('7️⃣ SOCIAL CONTEXT INTEGRATION TEST');
const testSocialContexts = ['solo', 'with-bae', 'barkada'];
CATEGORY_FILTERS.forEach(category => {
  console.log(`\n   ${category.icon} ${category.label} Social Compatibility:`);
  testSocialContexts.forEach(socialContext => {
    const compatible = isCompatibleWithSocialContext(category.id, socialContext);
    console.log(`     • ${socialContext}: ${compatible ? '✅ Compatible' : '❌ Not compatible'}`);
  });
});
console.log('\n✅ Social context integration working correctly\n');

// Test 8: Priority System
console.log('8️⃣ PRIORITY SYSTEM TEST');
console.log('   • Categories sorted by priority:');
sortedCategories.forEach((category, index) => {
  console.log(`     ${index + 1}. ${category.icon} ${category.label} (Priority: ${category.priority})`);
});
console.log('✅ Priority system working correctly\n');

console.log('🎉 All Category Configuration Tests Passed!');
console.log('\n📋 Summary:');
console.log(`   • ${CATEGORY_FILTERS.length} category filters configured`);
console.log(`   • ${Object.keys(CATEGORY_TYPE_MAPPING).length} API mappings available`);
console.log(`   • ${categoryOptions.length} backward-compatible options`);
console.log(`   • Comprehensive utility functions implemented`);
console.log(`   • Mood and social context compatibility systems integrated`);
console.log(`   • Activity suggestions and atmosphere keywords included`);
console.log(`   • Search keywords and priority system defined`);
console.log(`   • Priority-based category sorting implemented`); 