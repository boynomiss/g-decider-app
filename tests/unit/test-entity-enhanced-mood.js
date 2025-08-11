const { EntityEnhancedMoodService } = require('./utils/entity-enhanced-mood-service');

async function testEntityEnhancedMood() {
  console.log('🧪 Testing Entity-Enhanced Mood Analysis...');
  
  const moodService = new EntityEnhancedMoodService();
  
  // Test reviews with different moods
  const testReviews = [
    {
      text: "This place is absolutely amazing! The atmosphere is so vibrant and energetic. The staff is incredibly friendly and the food is outstanding. I love how lively and buzzing this place is!",
      rating: 5,
      time: Date.now() - (2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      text: "Cozy and peaceful atmosphere. Perfect for a quiet dinner. The service is gentle and the ambiance is so relaxing. Very intimate and romantic setting.",
      rating: 5,
      time: Date.now() - (1 * 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      text: "Great food and decent service. The place is comfortable and the staff is friendly. Standard restaurant experience.",
      rating: 4,
      time: Date.now() - (3 * 24 * 60 * 60 * 1000) // 3 days ago
    }
  ];
  
  try {
    console.log('🔍 Analyzing mood from reviews...');
    const result = await moodService.analyzePlaceMoodFromReviews(testReviews, 'restaurant');
    
    console.log('✅ Entity-Enhanced Mood Analysis Results:');
    console.log('   Mood Score:', result.moodScore);
    console.log('   Mood Category:', result.moodCategory);
    console.log('   Extracted Descriptors:', result.extractedDescriptors);
    console.log('   Confidence:', result.confidence);
    console.log('   Entity Insights:', result.entityInsights);
    
    return result;
  } catch (error) {
    console.error('❌ Entity-Enhanced Mood Analysis failed:', error);
    return null;
  }
}

// Run the test
testEntityEnhancedMood().then(result => {
  if (result) {
    console.log('🎉 Entity-Enhanced Mood Analysis test completed successfully!');
  } else {
    console.log('❌ Entity-Enhanced Mood Analysis test failed!');
  }
}); 