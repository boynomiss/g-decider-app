/**
 * NLP Service Debug Test
 * 
 * This test investigates specific issues found in the integration test:
 * - Mood analysis accuracy
 * - Place preferences extraction
 * - Sentiment analysis edge cases
 */

const fetch = require('node-fetch');

const FIREBASE_FUNCTIONS_BASE_URL = 'https://asia-southeast1-g-decider-backend.cloudfunctions.net';

async function debugMoodAnalysis() {
  console.log('\n🔍 Debugging Mood Analysis Issues...\n');
  
  const moodTestCases = [
    {
      name: 'Very Happy Text',
      text: 'I am absolutely thrilled and overjoyed! This is the best day ever!',
      expectedMood: 'high'
    },
    {
      name: 'Happy with Exclamation',
      text: 'I am feeling really excited and happy today! Want to celebrate with friends!',
      expectedMood: 'high'
    },
    {
      name: 'Positive but Calm',
      text: 'I am feeling good today. Looking forward to a nice dinner.',
      expectedMood: 'neutral'
    },
    {
      name: 'Neutral Statement',
      text: 'Just looking for a place to eat. Nothing special.',
      expectedMood: 'neutral'
    },
    {
      name: 'Slightly Negative',
      text: 'I am feeling a bit down today. Need some comfort food.',
      expectedMood: 'low'
    },
    {
      name: 'Very Negative',
      text: 'I am feeling terrible and miserable. Everything is awful.',
      expectedMood: 'low'
    }
  ];

  for (const testCase of moodTestCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`📤 Input: "${testCase.text}"`);
    
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/analyzeUserMood`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testCase.text })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data !== undefined) {
          const moodScore = data.data;
          let actualMood = 'neutral';
          if (moodScore > 70) actualMood = 'high';
          else if (moodScore < 30) actualMood = 'low';
          
          console.log(`📊 Mood Score: ${moodScore}`);
          console.log(`🎯 Mood Category: ${actualMood}`);
          console.log(`✅ Expected: ${testCase.expectedMood}, Got: ${actualMood}`);
          
          if (actualMood === testCase.expectedMood) {
            console.log('✅ PASSED');
          } else {
            console.log('❌ FAILED');
          }
        } else {
          console.log(`❌ API Error: ${data.error}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ HTTP Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

async function debugPlacePreferences() {
  console.log('\n🔍 Debugging Place Preferences Extraction...\n');
  
  const preferenceTestCases = [
    {
      name: 'Simple Korean Restaurant',
      text: 'I want Korean restaurant',
      expected: {
        categories: ['Korean', 'restaurant'],
        budget: null,
        socialContext: null
      }
    },
    {
      name: 'Budget Korean Restaurant',
      text: 'I want cheap Korean restaurant',
      expected: {
        categories: ['Korean', 'restaurant'],
        budget: 'P',
        socialContext: null
      }
    },
    {
      name: 'Luxury Japanese Restaurant',
      text: 'I want expensive Japanese restaurant',
      expected: {
        categories: ['Japanese', 'restaurant'],
        budget: 'PPP',
        socialContext: null
      }
    },
    {
      name: 'Cafe for Solo',
      text: 'I want cafe for working alone',
      expected: {
        categories: ['cafe'],
        budget: null,
        socialContext: 'solo'
      }
    },
    {
      name: 'Restaurant with Barkada',
      text: 'I want restaurant with barkada',
      expected: {
        categories: ['restaurant'],
        budget: null,
        socialContext: 'barkada'
      }
    }
  ];

  for (const testCase of preferenceTestCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`📤 Input: "${testCase.text}"`);
    
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/extractPlacePreferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testCase.text })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const preferences = data.data;
          
          console.log(`📊 Extracted Preferences:`);
          console.log(`   Categories: ${preferences.categories?.join(', ') || 'None'}`);
          console.log(`   Budget: ${preferences.budget || 'None'}`);
          console.log(`   Social Context: ${preferences.socialContext || 'None'}`);
          console.log(`   Mood: ${preferences.mood || 'None'}`);
          
          // Check each expected field
          let allPassed = true;
          
          if (testCase.expected.categories.length > 0) {
            const foundCategories = testCase.expected.categories.filter(expected =>
              preferences.categories?.some(cat => cat.toLowerCase().includes(expected.toLowerCase()))
            );
            if (foundCategories.length > 0) {
              console.log(`✅ Categories: Found ${foundCategories.join(', ')}`);
            } else {
              console.log(`❌ Categories: Expected ${testCase.expected.categories.join(', ')}, found none`);
              allPassed = false;
            }
          }
          
          if (testCase.expected.budget) {
            if (preferences.budget === testCase.expected.budget) {
              console.log(`✅ Budget: ${preferences.budget}`);
            } else {
              console.log(`❌ Budget: Expected ${testCase.expected.budget}, got ${preferences.budget}`);
              allPassed = false;
            }
          }
          
          if (testCase.expected.socialContext) {
            if (preferences.socialContext === testCase.expected.socialContext) {
              console.log(`✅ Social Context: ${preferences.socialContext}`);
            } else {
              console.log(`❌ Social Context: Expected ${testCase.expected.socialContext}, got ${preferences.socialContext}`);
              allPassed = false;
            }
          }
          
          if (allPassed) {
            console.log('✅ ALL TESTS PASSED');
          } else {
            console.log('❌ SOME TESTS FAILED');
          }
        } else {
          console.log(`❌ API Error: ${data.error}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ HTTP Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

async function debugSentimentAnalysis() {
  console.log('\n🔍 Debugging Sentiment Analysis Edge Cases...\n');
  
  const sentimentTestCases = [
    {
      name: 'Mixed Positive and Negative',
      text: 'Great food but terrible service. The atmosphere is nice but too noisy.',
      expectedSentiment: 'mixed'
    },
    {
      name: 'Positive with Negative Words',
      text: 'I love this place despite the bad parking. The food is amazing!',
      expectedSentiment: 'positive'
    },
    {
      name: 'Negative with Positive Words',
      text: 'This place is terrible but the location is good. I hate it.',
      expectedSentiment: 'negative'
    },
    {
      name: 'Neutral with Mixed Words',
      text: 'The food is okay. Service is decent. Nothing special.',
      expectedSentiment: 'neutral'
    }
  ];

  for (const testCase of sentimentTestCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`📤 Input: "${testCase.text}"`);
    
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}/analyzeSentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testCase.text })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const sentiment = data.data;
          const score = sentiment.score;
          
          let actualSentiment = 'neutral';
          if (score > 0.3) actualSentiment = 'positive';
          else if (score < -0.3) actualSentiment = 'negative';
          
          console.log(`📊 Sentiment Score: ${score.toFixed(3)}`);
          console.log(`🎯 Sentiment Category: ${actualSentiment}`);
          console.log(`📈 Magnitude: ${sentiment.magnitude.toFixed(3)}`);
          console.log(`🌐 Language: ${sentiment.language}`);
          console.log(`✅ Expected: ${testCase.expectedSentiment}, Got: ${actualSentiment}`);
          
          if (actualSentiment === testCase.expectedSentiment || 
              (testCase.expectedSentiment === 'mixed' && Math.abs(score) < 0.3)) {
            console.log('✅ PASSED');
          } else {
            console.log('❌ FAILED');
          }
        } else {
          console.log(`❌ API Error: ${data.error}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ HTTP Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

async function testRawNLPFunctions() {
  console.log('\n🔍 Testing Raw NLP Functions...\n');
  
  const functions = [
    { name: 'analyzeSentiment', endpoint: '/analyzeSentiment' },
    { name: 'analyzeEntities', endpoint: '/analyzeEntities' },
    { name: 'analyzeText', endpoint: '/analyzeText' },
    { name: 'analyzeUserMood', endpoint: '/analyzeUserMood' },
    { name: 'extractPlacePreferences', endpoint: '/extractPlacePreferences' }
  ];

  const testText = 'I want a good Italian restaurant in Manila for dinner with friends.';

  for (const func of functions) {
    console.log(`📝 Testing: ${func.name}`);
    console.log(`📤 Input: "${testText}"`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}${func.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText })
      });

      const processingTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          console.log(`✅ Success in ${processingTime}ms`);
          console.log(`📊 Response Type: ${data.analysisType}`);
          console.log(`📈 Processing Time: ${data.processingTime}ms`);
          
          // Show a sample of the data
          if (data.data) {
            if (typeof data.data === 'number') {
              console.log(`📊 Result: ${data.data}`);
            } else if (Array.isArray(data.data)) {
              console.log(`📊 Results: ${data.data.length} items`);
              if (data.data.length > 0) {
                console.log(`   Sample: ${JSON.stringify(data.data[0], null, 2)}`);
              }
            } else {
              console.log(`📊 Result: ${JSON.stringify(data.data, null, 2)}`);
            }
          }
        } else {
          console.log(`❌ API Error: ${data.error}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ HTTP Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

async function runDebugTests() {
  console.log('🚀 Starting NLP Service Debug Tests\n');
  
  await testRawNLPFunctions();
  await debugSentimentAnalysis();
  await debugMoodAnalysis();
  await debugPlacePreferences();
  
  console.log('🎉 NLP Service Debug Tests Complete!');
}

// Export for use in other tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    runDebugTests, 
    debugMoodAnalysis, 
    debugPlacePreferences, 
    debugSentimentAnalysis,
    testRawNLPFunctions
  };
}

// Run test if called directly
if (typeof window === 'undefined') {
  runDebugTests().catch(console.error);
} 