// Test NLP Service functionality
// Updated to use asia-southeast1 region for better optimization
const fetch = require('node-fetch');

const FIREBASE_FUNCTIONS_BASE_URL = 'https://asia-southeast1-g-decider-backend.cloudfunctions.net';

async function testNLPService() {
  console.log('🧪 Testing NLP Service...\n');

  const testCases = [
    {
      name: 'Sentiment Analysis',
      endpoint: '/analyzeSentiment',
      text: 'I love this restaurant! The food is amazing and the service is excellent.'
    },
    {
      name: 'Entity Analysis',
      endpoint: '/analyzeEntities',
      text: 'I want to find a good Italian restaurant in Manila for a romantic date.'
    },
    {
      name: 'User Mood Analysis',
      endpoint: '/analyzeUserMood',
      text: 'I\'m feeling really happy today and want to celebrate with friends!'
    },
    {
      name: 'Place Preferences Extraction',
      endpoint: '/extractPlacePreferences',
      text: 'I\'m looking for a cheap Korean restaurant for lunch with my barkada.'
    }
  ];

  for (const testCase of testCases) {
    console.log(`📝 Testing: ${testCase.name}`);
    console.log(`📤 Input: "${testCase.text}"`);
    
    try {
      const response = await fetch(`${FIREBASE_FUNCTIONS_BASE_URL}${testCase.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testCase.text
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Success!');
        console.log('📊 Response:', JSON.stringify(result.data, null, 2));
        console.log(`⏱️ Processing time: ${result.processingTime}ms`);
      } else {
        console.log('❌ Failed:', result.error);
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log('---\n');
  }
}

// Test local NLP service (if running locally)
async function testLocalNLPService() {
  console.log('🧪 Testing Local NLP Service...\n');
  
  // This would test the service directly if running locally
  console.log('📝 Note: Local testing requires the service to be running');
  console.log('🚀 To test locally, deploy the functions first');
}

// Run tests
async function runTests() {
  console.log('🚀 Starting NLP Service Tests\n');
  
  // Test deployed functions
  await testNLPService();
  
  // Test local service
  await testLocalNLPService();
  
  console.log('✅ NLP Service tests completed!');
}

runTests().catch(console.error); 