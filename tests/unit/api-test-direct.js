// Test direct Google Places API (New)
import { getAPIKey, validateAPIKeys } from '../config/api-keys';

const PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchNearby';

async function testDirectGooglePlacesAPI() {
  console.log('🧪 Testing Direct Google Places API (New)...');
  
  const requestBody = {
    locationRestriction: {
      circle: {
        center: {
          latitude: 14.5995,
          longitude: 120.9842
        },
        radius: 5000.0
      }
    },
    rankPreference: "DISTANCE",
    maxResultCount: 10,
    includedTypes: ["restaurant"]
  };

  const url = `${PLACES_SEARCH_URL}?key=${getAPIKey.places()}`;
  console.log('📡 Requesting:', url);
  console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': getAPIKey.places(),
        'X-Goog-FieldMask': 'places.displayName,places.location,places.rating,places.userRatingCount,places.types,places.photos'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response Status:', response.status);
    console.log('📊 Results found:', data.places ? data.places.length : 0);
    
    if (data.places && data.places.length > 0) {
      console.log('🎉 SUCCESS: New Places API is working! Found places:');
      data.places.slice(0, 3).forEach((place, index) => {
        const name = place.displayName?.text || 'Unknown';
        const rating = place.rating || 'No rating';
        console.log(`  ${index + 1}. ${name} - Rating: ${rating}`);
      });
    } else {
      console.log('⚠️ No results found, but API is responding');
      console.log('📄 Full response:', JSON.stringify(data, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Direct API Test Failed:', error.message);
  }
}

// Run the test
testDirectGooglePlacesAPI();
