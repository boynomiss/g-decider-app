/**
 * Simple test script to test Google Places API (New)
 * Run with: node test-google-api.js
 */

// Test Google Places API (New) directly
async function testGooglePlacesAPI() {
  console.log('🧪 Testing Google Places API (New)...\n');

  const apiKey = 'AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk';
  const location = '14.5995,120.9842'; // Manila coordinates
  const radius = 5000; // 5km
  const query = 'restaurant';

  // New Places API format
  const url = `https://places.googleapis.com/v1/places:searchText`;
  
  const requestBody = {
    textQuery: query,
    locationBias: {
      circle: {
        center: {
          latitude: 14.5995,
          longitude: 120.9842
        },
        radius: radius
      }
    },
    maxResultCount: 10
  };

  try {
    console.log('🔍 Making request to Google Places API (New)...');
    console.log('URL:', url);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.types,places.id,places.location'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error:', response.status, response.statusText);
      console.error('Error details:', errorText);
      throw new Error(`HTTP ${response.status} ${response.statusText}: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ API Response:');
    console.log('Places found:', data.places?.length || 0);
    
    if (data.places && data.places.length > 0) {
      console.log('\nFirst result:');
      const firstResult = data.places[0];
      console.log('Name:', firstResult.displayName?.text);
      console.log('Address:', firstResult.formattedAddress);
      console.log('Rating:', firstResult.rating);
      console.log('Types:', firstResult.types);
      console.log('ID:', firstResult.id);
      console.log('Location:', firstResult.location);
    }
    
  } catch (error) {
    console.error('❌ Error testing Google Places API (New):', error);
    
    // Try legacy API as fallback
    console.log('\n🔄 Trying legacy API as fallback...');
    await testLegacyAPI();
  }
}

// Test legacy API as fallback
async function testLegacyAPI() {
  console.log('🧪 Testing Google Places API (Legacy)...\n');

  const apiKey = 'AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk';
  const location = '14.5995,120.9842'; // Manila coordinates
  const radius = 5000; // 5km
  const query = 'restaurant';

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${location}&radius=${radius}&key=${apiKey}`;

  try {
    console.log('🔍 Making request to Google Places API (Legacy)...');
    console.log('URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('✅ Legacy API Response:');
    console.log('Status:', data.status);
    console.log('Results found:', data.results?.length || 0);
    
    if (data.results && data.results.length > 0) {
      console.log('\nFirst result:');
      const firstResult = data.results[0];
      console.log('Name:', firstResult.name);
      console.log('Address:', firstResult.formatted_address);
      console.log('Rating:', firstResult.rating);
      console.log('Types:', firstResult.types);
      console.log('Place ID:', firstResult.place_id);
    }
    
    if (data.error_message) {
      console.log('⚠️ Error message:', data.error_message);
    }
    
  } catch (error) {
    console.error('❌ Error testing Google Places API (Legacy):', error);
  }
}

// Run the test
testGooglePlacesAPI();
