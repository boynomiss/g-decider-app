// Test if Street View URL actually works
const url = "https://maps.googleapis.com/maps/api/streetview?size=800x600&location=14.5556,121.0517&heading=0&pitch=0&fov=90&key=AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk";

console.log('Testing Street View URL:');
console.log(url);
console.log('\nTry opening this URL in your browser to see if it loads an image.');
console.log('If it shows an error, the API key might not have Street View enabled.\n');

fetch(url)
  .then(response => {
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    if (response.status === 200) {
      console.log('✅ URL works! Images should load in the app.');
    } else {
      console.log('❌ URL failed. Check API key configuration.');
    }
  })
  .catch(error => {
    console.log('❌ Error:', error.message);
  })
  .finally(() => process.exit(0));
