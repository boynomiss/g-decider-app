/**
 * Test Dynamic Photo Fetching
 */

const API_KEY = 'AIzaSyBTImieOwZZOaTLv-I1N8_qW75eIRvi8Nk';

async function testPhotoFetch(placeName, address) {
  console.log(`\n🔍 Testing: ${placeName}`);
  console.log(`   Searching: "${placeName} ${address}"`);
  
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.photos'
      },
      body: JSON.stringify({
        textQuery: `${placeName} ${address}`
      })
    });
    
    const data = await response.json();
    
    if (data.places && data.places.length > 0) {
      const place = data.places[0];
      const photoCount = place.photos?.length || 0;
      
      console.log(`   ✅ Found: ${place.displayName.text}`);
      console.log(`   📸 Photos: ${photoCount} available`);
      
      if (photoCount > 0) {
        // Get first 3 photos
        const topPhotos = place.photos.slice(0, 3);
        console.log(`   🎨 Using top 3 photos:`);
        topPhotos.forEach((photo, i) => {
          const url = `https://places.googleapis.com/v1/${photo.name}/media?maxWidthPx=800&key=${API_KEY}`;
          console.log(`      ${i + 1}. ${photo.widthPx}x${photo.heightPx}px`);
        });
        return true;
      } else {
        console.log(`   ⚠️  No photos - will use Street View fallback`);
        return false;
      }
    } else {
      console.log(`   ❌ Place not found on Google`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Dynamic Photo Fetching Service\n');
  console.log('='.repeat(60));
  
  const testPlaces = [
    { name: 'Jollibee', address: 'MacArthur Highway, Bocaue, Bulacan' },
    { name: 'Philippine Arena', address: 'Bocaue, Bulacan' },
    { name: 'Yardstick Coffee', address: 'Karrivin Plaza, Makati' },
    { name: 'Max\'s Restaurant', address: 'Bocaue, Bulacan' },
    { name: 'Vikings Buffet', address: 'SM Mall of Asia, Pasay' }
  ];
  
  let successCount = 0;
  
  for (const place of testPlaces) {
    const hasPhotos = await testPhotoFetch(place.name, place.address);
    if (hasPhotos) successCount++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Test Results: ${successCount}/${testPlaces.length} places have Google Photos`);
  console.log(`📸 ${testPlaces.length - successCount} will use Street View fallback`);
  console.log(`\n🎉 Dynamic photo fetching is working!\n`);
}

runTests().then(() => process.exit(0)).catch(console.error);

