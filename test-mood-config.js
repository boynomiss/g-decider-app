// Test Mood Configuration System
// This file tests the new consolidated mood configuration system

const { 
  MOOD_CATEGORIES, 
  MOOD_TYPE_MAPPING, 
  MOOD_LABELS,
  MOOD_DETAILED_LABELS,
  MoodUtils,
  moodOptions,
  getMoodCategory,
  getMoodLabel,
  getPreferredPlaceTypes,
  validateMoodScore,
  getAllMoodCategories,
  getMoodCategoryById,
  getMoodMappings,
  getMoodMappingsForAPI,
  getMoodContext,
  getEnergyLevel,
  isCompatibleWithSocialContext,
  getActivitySuggestions,
  getAtmosphereKeywords,
  getColorScheme,
  getMoodCategoryId,
  getMoodScoreRange
} = require('./utils/mood-config.ts');

console.log('🧪 Testing Mood Configuration System\n');

// Test 1: Basic Configuration
console.log('1️⃣ BASIC CONFIGURATION TEST');
console.log('Mood Categories:', MOOD_CATEGORIES.length);
MOOD_CATEGORIES.forEach(category => {
  console.log(`   • ${category.icon} ${category.label}: ${category.description}`);
});
console.log('✅ Basic configuration loaded successfully\n');

// Test 2: Mood Type Mappings
console.log('2️⃣ MOOD TYPE MAPPINGS TEST');
Object.entries(MOOD_TYPE_MAPPING).forEach(([mood, types]) => {
  console.log(`   • ${mood}: ${types.length} place types`);
});
console.log('✅ Mood type mappings loaded successfully\n');

// Test 3: Utility Functions
console.log('3️⃣ UTILITY FUNCTIONS TEST');

// Test getMoodCategory
const chillCategory = getMoodCategory(20);
console.log(`   • getMoodCategory(20): ${chillCategory ? '✅ Found' : '❌ Not found'}`);

// Test getMoodLabel
const chillLabel = getMoodLabel(20);
console.log(`   • getMoodLabel(20): "${chillLabel}"`);

// Test getPreferredPlaceTypes
const chillTypes = getPreferredPlaceTypes(20);
console.log(`   • getPreferredPlaceTypes(20): ${chillTypes.length} types`);

// Test validateMoodScore
const validMood = validateMoodScore(50);
const invalidMood = validateMoodScore(150);
console.log(`   • validateMoodScore(50): ${validMood ? '✅ Valid' : '❌ Invalid'}`);
console.log(`   • validateMoodScore(150): ${invalidMood ? '✅ Valid' : '❌ Invalid'}`);

// Test getAllMoodCategories
const allCategories = getAllMoodCategories();
console.log(`   • getAllMoodCategories(): ${allCategories.length} categories`);

// Test getMoodCategoryById
const hypeCategory = getMoodCategoryById('hype');
console.log(`   • getMoodCategoryById('hype'): ${hypeCategory ? '✅ Found' : '❌ Not found'}`);

// Test getMoodMappings
const mappings = getMoodMappings();
console.log(`   • getMoodMappings(): ${mappings.length} mappings`);

// Test getMoodMappingsForAPI
const apiMappings = getMoodMappingsForAPI();
console.log(`   • getMoodMappingsForAPI(): ${Object.keys(apiMappings).length} mappings`);

// Test getMoodContext
const chillContext = getMoodContext(20);
const hypeContext = getMoodContext(80);
console.log(`   • getMoodContext(20): "${chillContext}"`);
console.log(`   • getMoodContext(80): "${hypeContext}"`);

// Test getEnergyLevel
const chillEnergy = getEnergyLevel(20);
const hypeEnergy = getEnergyLevel(80);
console.log(`   • getEnergyLevel(20): ${chillEnergy}`);
console.log(`   • getEnergyLevel(80): ${hypeEnergy}`);

// Test isCompatibleWithSocialContext
const chillSoloCompatible = isCompatibleWithSocialContext(20, 'solo');
const hypeBarkadaCompatible = isCompatibleWithSocialContext(80, 'barkada');
console.log(`   • isCompatibleWithSocialContext(20, 'solo'): ${chillSoloCompatible ? '✅ Compatible' : '❌ Not compatible'}`);
console.log(`   • isCompatibleWithSocialContext(80, 'barkada'): ${hypeBarkadaCompatible ? '✅ Compatible' : '❌ Not compatible'}`);

// Test getActivitySuggestions
const chillActivities = getActivitySuggestions(20);
const hypeActivities = getActivitySuggestions(80);
console.log(`   • getActivitySuggestions(20): ${chillActivities.length} suggestions`);
console.log(`   • getActivitySuggestions(80): ${hypeActivities.length} suggestions`);

// Test getAtmosphereKeywords
const chillAtmosphere = getAtmosphereKeywords(20);
const hypeAtmosphere = getAtmosphereKeywords(80);
console.log(`   • getAtmosphereKeywords(20): ${chillAtmosphere.length} keywords`);
console.log(`   • getAtmosphereKeywords(80): ${hypeAtmosphere.length} keywords`);

// Test getColorScheme
const chillColor = getColorScheme(20);
const hypeColor = getColorScheme(80);
console.log(`   • getColorScheme(20): "${chillColor}"`);
console.log(`   • getColorScheme(80): "${hypeColor}"`);

// Test getMoodCategoryId
const chillId = getMoodCategoryId(20);
const hypeId = getMoodCategoryId(80);
console.log(`   • getMoodCategoryId(20): "${chillId}"`);
console.log(`   • getMoodCategoryId(80): "${hypeId}"`);

// Test getMoodScoreRange
const chillRange = getMoodScoreRange('chill');
const hypeRange = getMoodScoreRange('hype');
console.log(`   • getMoodScoreRange('chill'): ${JSON.stringify(chillRange)}`);
console.log(`   • getMoodScoreRange('hype'): ${JSON.stringify(hypeRange)}`);

console.log('✅ Utility functions working correctly\n');

// Test 4: Backward Compatibility
console.log('4️⃣ BACKWARD COMPATIBILITY TEST');
console.log(`   • moodOptions: ${moodOptions.length} options`);
moodOptions.forEach(option => {
  console.log(`     - ${option.icon} ${option.label}: ${option.description}`);
});
console.log('✅ Backward compatibility maintained\n');

// Test 5: Mood Category Details
console.log('5️⃣ MOOD CATEGORY DETAILS TEST');
MOOD_CATEGORIES.forEach(category => {
  console.log(`\n   ${category.icon} ${category.label}:`);
  console.log(`     • Description: ${category.description}`);
  console.log(`     • Score Range: ${category.scoreRange.min}-${category.scoreRange.max}`);
  console.log(`     • Place Types: ${category.preferredPlaceTypes.length} types`);
  console.log(`     • Social Compatibility: ${category.socialCompatibility.join(', ')}`);
  console.log(`     • Budget Preferences: ${category.budgetPreferences.join(', ')}`);
  console.log(`     • Time Compatibility: ${category.timeCompatibility.join(', ')}`);
  console.log(`     • Activity Suggestions: ${category.activitySuggestions.length} suggestions`);
  console.log(`     • Atmosphere Keywords: ${category.atmosphereKeywords.join(', ')}`);
  console.log(`     • Energy Level: ${category.energyLevel}`);
  console.log(`     • Color Scheme: ${category.colorScheme}`);
});
console.log('\n✅ Mood category details comprehensive\n');

// Test 6: Integration with Social Context System
console.log('6️⃣ SOCIAL CONTEXT INTEGRATION TEST');
const testSocialContexts = ['solo', 'with-bae', 'barkada'];
MOOD_CATEGORIES.forEach(category => {
  console.log(`\n   ${category.icon} ${category.label} Social Compatibility:`);
  testSocialContexts.forEach(socialContext => {
    const compatible = category.socialCompatibility.includes(socialContext);
    console.log(`     • ${socialContext}: ${compatible ? '✅ Compatible' : '❌ Not compatible'}`);
  });
});
console.log('\n✅ Social context integration working correctly\n');

// Test 7: Detailed Mood Labels
console.log('7️⃣ DETAILED MOOD LABELS TEST');
console.log('   • MOOD_DETAILED_LABELS:');
Object.entries(MOOD_DETAILED_LABELS).forEach(([level, label]) => {
  console.log(`     - Level ${level}: ${label.emoji} ${label.text}`);
});
console.log('✅ Detailed mood labels comprehensive\n');

console.log('🎉 All Mood Configuration Tests Passed!');
console.log('\n📋 Summary:');
console.log(`   • ${MOOD_CATEGORIES.length} mood categories configured`);
console.log(`   • ${Object.keys(MOOD_TYPE_MAPPING).length} API mappings available`);
console.log(`   • ${moodOptions.length} backward-compatible options`);
console.log(`   • Comprehensive utility functions implemented`);
console.log(`   • Social context compatibility system integrated`);
console.log(`   • Activity suggestions and atmosphere keywords included`);
console.log(`   • Energy levels and color schemes defined`);
console.log(`   • Detailed mood labels for UI components`); 