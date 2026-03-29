// Test Gemini Firebase Functions
// This file tests the deployed Gemini AI functions using the new API key
// API Key: AIzaSyAcdwn6FkzWBh-orqK2hcFyEBmskeFaMOY (Gemini API Key)
// Project: g-decider-backend
// Region: asia-southeast1 (optimized for Asia-Pacific)

const fetch = require('node-fetch');

const FIREBASE_FUNCTIONS_BASE_URL = 'https://asia-southeast1-g-decider-backend.cloudfunctions.net';

async function testGeminiFunctions() {
  console.log('🧪 Testing Gemini Firebase Functions...\n');

  const testCases = [
    {
      name: 'Test Gemini Access',
      endpoint: '/testGeminiAccess',
      data: {
        data: {
          prompt: 'Tell me a short, inspiring fact about the universe.'
        }
      }
    },
    {
      name: 'Generate Place Description',
      endpoint: '/generatePlaceDescription',
      data: {
        data: {
          prompt: 'A cozy Italian restaurant in Manila with romantic atmosphere'
        }
      }
    },
    {
      name: 'Analyze Mood and Suggest',
      endpoint: '/analyzeMoodAndSuggest',
      data: {
        data: {
          prompt: 'I\'m feeling happy and want to celebrate with friends'
        }
      }
    },
    {
      name: 'Get Personalized Recommendations',
      endpoint: '/getPersonalizedRecommendations',
      data: {
        data: {
          prompt: 'I like Italian food, romantic atmosphere, and have a moderate budget'
        }
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`📤 Input: "${testCase.data.data.prompt}"`);
    
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}${testCase.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });

      const result = await response.json();
      
      if (result.result && result.result.success) {
        console.log('✅ Success!');
        console.log('📊 Response:', result.result.geminiResponse);
        console.log(`⏱️ Processing time: ${result.result.processingTime}ms`);
      } else if (result.error) {
        console.log('❌ Failed:', result.error);
      } else {
        console.log('❌ Unexpected response:', result);
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log('---\n');
  }
}

// Test local emulator (if running)
async function testLocalEmulator() {
  console.log('🧪 Testing Local Emulator...\n');
  
  const LOCAL_BASE_URL = 'http://localhost:5001/g-decider-backend/us-central1';
  
  try {
    const response = await fetch(`${LOCAL_BASE_URL}/testGeminiAccess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          prompt: 'Tell me a short, inspiring fact about the universe.'
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.result && result.result.success) {
        console.log('✅ Local emulator test successful!');
        console.log('📊 Response:', result.result.geminiResponse);
      } else {
        console.log('❌ Local emulator test failed:', result);
      }
    } else {
      console.log('❌ Local emulator test failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Local emulator not running or error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting Gemini Functions Tests\n');
  
  // Test deployed functions
  await testGeminiFunctions();
  
  // Test local emulator
  await testLocalEmulator();
  
  console.log('✅ Gemini Functions tests completed!');
}

runTests().catch(console.error); 