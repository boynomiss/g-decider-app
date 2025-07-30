// Simple API test to verify Google Places API is working
const GOOGLE_API_KEY = 'AIzaSyAdCy-m_2Rc_3trJm3vEbL-8HUqZw33SKg';
const PLACES_PROXY_URL = 'https://toolkit.rork.com/places/search';

async function testGooglePlacesAPI() {
  console.log('🧪 Testing Google Places API...');
  
  const testPayload = {
    location: '14.5995,120.9842', // Manila coordinates
    radius: 5000,
    type: 'restaurant',
    apiKey: GOOGLE_API_KEY,
    minprice: 0,
    maxprice: 2
  };

  try {
    console.log('📡 Sending request to proxy endpoint...');
    const response = await fetch(PLACES_PROXY_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response Status:', data.status);
    console.log('📊 Results found:', data.results ? data.results.length : 0);
    
    if (data.results && data.results.length > 0) {
      console.log('🎉 SUCCESS: API is working! Found places:');
      data.results.slice(0, 3).forEach((place, index) => {
        console.log(`  ${index + 1}. ${place.name} - ${place.vicinity}`);
      });
    } else {
      console.log('⚠️ No results found, but API is responding');
    }
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
  }
}

// Run the test
testGooglePlacesAPI();
