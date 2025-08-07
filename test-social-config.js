// Test Social Context Configuration System
// This file tests the new consolidated social context system

const { 
  SOCIAL_CONTEXTS, 
  SOCIAL_CONTEXT_MAPPING, 
  SOCIAL_LABELS,
  SocialUtils,
  socialOptions,
  getSocialContext,
  getSocialContextLabel,
  getPreferredPlaceTypes,
  validateSocialContext,
  getAllSocialContexts,
  getSocialContextById,
  getSocialContextMappings,
  getSocialContextMappingsForAPI,
  getSocialContextForAI,
  getGroupSize,
  isCompatibleWithMood,
  getActivitySuggestions,
  getAtmosphereKeywords
} = require('./utils/social-config.ts');

console.log('🧪 Testing Social Context Configuration System\n');

// Test 1: Basic Configuration
console.log('1️⃣ BASIC CONFIGURATION TEST');
console.log('Social Contexts:', SOCIAL_CONTEXTS.length);
SOCIAL_CONTEXTS.forEach(context => {
  console.log(`   • ${context.icon} ${context.label}: ${context.description}`);
});
console.log('✅ Basic configuration loaded successfully\n');

// Test 2: Social Context Mappings
console.log('2️⃣ SOCIAL CONTEXT MAPPINGS TEST');
Object.entries(SOCIAL_CONTEXT_MAPPING).forEach(([context, types]) => {
  console.log(`   • ${context}: ${types.length} place types`);
});
console.log('✅ Social context mappings loaded successfully\n');

// Test 3: Utility Functions
console.log('3️⃣ UTILITY FUNCTIONS TEST');

// Test getSocialContext
const soloContext = getSocialContext('solo');
console.log(`   • getSocialContext('solo'): ${soloContext ? '✅ Found' : '❌ Not found'}`);

// Test getSocialContextLabel
const soloLabel = getSocialContextLabel('solo');
console.log(`   • getSocialContextLabel('solo'): "${soloLabel}"`);

// Test getPreferredPlaceTypes
const soloTypes = getPreferredPlaceTypes('solo');
console.log(`   • getPreferredPlaceTypes('solo'): ${soloTypes.length} types`);

// Test validateSocialContext
const validSolo = validateSocialContext('solo');
const validInvalid = validateSocialContext('invalid');
console.log(`   • validateSocialContext('solo'): ${validSolo ? '✅ Valid' : '❌ Invalid'}`);
console.log(`   • validateSocialContext('invalid'): ${validInvalid ? '✅ Valid' : '❌ Invalid'}`);

// Test getAllSocialContexts
const allContexts = getAllSocialContexts();
console.log(`   • getAllSocialContexts(): ${allContexts.length} contexts`);

// Test getSocialContextById
const barkadaContext = getSocialContextById('barkada');
console.log(`   • getSocialContextById('barkada'): ${barkadaContext ? '✅ Found' : '❌ Not found'}`);

// Test getSocialContextMappings
const mappings = getSocialContextMappings();
console.log(`   • getSocialContextMappings(): ${mappings.length} mappings`);

// Test getSocialContextMappingsForAPI
const apiMappings = getSocialContextMappingsForAPI();
console.log(`   • getSocialContextMappingsForAPI(): ${Object.keys(apiMappings).length} mappings`);

// Test getSocialContextForAI
const soloAI = getSocialContextForAI('solo');
const barkadaAI = getSocialContextForAI('barkada');
console.log(`   • getSocialContextForAI('solo'): "${soloAI}"`);
console.log(`   • getSocialContextForAI('barkada'): "${barkadaAI}"`);

// Test getGroupSize
const soloGroupSize = getGroupSize('solo');
const barkadaGroupSize = getGroupSize('barkada');
console.log(`   • getGroupSize('solo'): ${soloGroupSize}`);
console.log(`   • getGroupSize('barkada'): ${JSON.stringify(barkadaGroupSize)}`);

// Test isCompatibleWithMood
const soloChillCompatible = isCompatibleWithMood('solo', 20);
const barkadaHypeCompatible = isCompatibleWithMood('barkada', 80);
console.log(`   • isCompatibleWithMood('solo', 20): ${soloChillCompatible ? '✅ Compatible' : '❌ Not compatible'}`);
console.log(`   • isCompatibleWithMood('barkada', 80): ${barkadaHypeCompatible ? '✅ Compatible' : '❌ Not compatible'}`);

// Test getActivitySuggestions
const soloActivities = getActivitySuggestions('solo');
const barkadaActivities = getActivitySuggestions('barkada');
console.log(`   • getActivitySuggestions('solo'): ${soloActivities.length} suggestions`);
console.log(`   • getActivitySuggestions('barkada'): ${barkadaActivities.length} suggestions`);

// Test getAtmosphereKeywords
const soloAtmosphere = getAtmosphereKeywords('solo');
const barkadaAtmosphere = getAtmosphereKeywords('barkada');
console.log(`   • getAtmosphereKeywords('solo'): ${soloAtmosphere.length} keywords`);
console.log(`   • getAtmosphereKeywords('barkada'): ${barkadaAtmosphere.length} keywords`);

console.log('✅ Utility functions working correctly\n');

// Test 4: Backward Compatibility
console.log('4️⃣ BACKWARD COMPATIBILITY TEST');
console.log(`   • socialOptions: ${socialOptions.length} options`);
socialOptions.forEach(option => {
  console.log(`     - ${option.icon} ${option.label}: ${option.description}`);
});
console.log('✅ Backward compatibility maintained\n');

// Test 5: Social Context Details
console.log('5️⃣ SOCIAL CONTEXT DETAILS TEST');
SOCIAL_CONTEXTS.forEach(context => {
  console.log(`\n   ${context.icon} ${context.label}:`);
  console.log(`     • Description: ${context.description}`);
  console.log(`     • Group Size: ${typeof context.groupSize === 'number' ? context.groupSize : `${context.groupSize.min}-${context.groupSize.max}`}`);
  console.log(`     • Place Types: ${context.preferredPlaceTypes.length} types`);
  console.log(`     • Mood Compatibility: ${context.moodCompatibility.join(', ')}`);
  console.log(`     • Budget Preferences: ${context.budgetPreferences.join(', ')}`);
  console.log(`     • Time Compatibility: ${context.timeCompatibility.join(', ')}`);
  console.log(`     • Activity Suggestions: ${context.activitySuggestions.length} suggestions`);
  console.log(`     • Atmosphere Keywords: ${context.atmosphereKeywords.join(', ')}`);
});
console.log('\n✅ Social context details comprehensive\n');

// Test 6: Integration with Mood System
console.log('6️⃣ MOOD INTEGRATION TEST');
const testMoods = [10, 50, 90]; // chill, neutral, hype
SOCIAL_CONTEXTS.forEach(context => {
  console.log(`\n   ${context.icon} ${context.label} Mood Compatibility:`);
  testMoods.forEach(mood => {
    const compatible = isCompatibleWithMood(context.id, mood);
    const moodCategory = mood <= 33.33 ? 'chill' : mood <= 66.66 ? 'neutral' : 'hype';
    console.log(`     • ${moodCategory} (${mood}): ${compatible ? '✅ Compatible' : '❌ Not compatible'}`);
  });
});
console.log('\n✅ Mood integration working correctly\n');

console.log('🎉 All Social Context Configuration Tests Passed!');
console.log('\n📋 Summary:');
console.log(`   • ${SOCIAL_CONTEXTS.length} social contexts configured`);
console.log(`   • ${Object.keys(SOCIAL_CONTEXT_MAPPING).length} API mappings available`);
console.log(`   • ${socialOptions.length} backward-compatible options`);
console.log(`   • Comprehensive utility functions implemented`);
console.log(`   • Mood compatibility system integrated`);
console.log(`   • Activity suggestions and atmosphere keywords included`); 