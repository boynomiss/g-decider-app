// Test direct Google Places API
const GOOGLE_API_KEY = 'AIzaSyAdCy-m_2Rc_3trJm3vEbL-8HUqZw33SKg';
const PLACES_SEARCH_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

async function testDirectGooglePlacesAPI() {
  console.log('🧪 Testing Direct Google Places API...');
  
  const params = new URLSearchParams({
    location: '14.5995,120.9842', // Manila coordinates
    radius: '5000',
    type: 'restaurant',
    key: GOOGLE_API_KEY
  });

  const url = `${PLACES_SEARCH_URL}?${params.toString()}`;
  console.log('📡 Requesting:', url);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response Status:', data.status);
    console.log('📊 Results found:', data.results ? data.results.length : 0);
    
    if (data.results && data.results.length > 0) {
      console.log('🎉 SUCCESS: Direct API is working! Found places:');
      data.results.slice(0, 3).forEach((place, index) => {
        console.log(`  ${index + 1}. ${place.name} - ${place.vicinity}`);
      });
    } else {
      console.log('⚠️ No results found, but API is responding');
    }
    
  } catch (error) {
    console.error('❌ Direct API Test Failed:', error.message);
  }
}

// Run the test
testDirectGooglePlacesAPI();
