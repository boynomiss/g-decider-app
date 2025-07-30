// Image Sourcing Utilities
// Fetches images from multiple sources to ensure high-quality, actual place images

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// Helper: Fetch images from Google Maps search
export const fetchGoogleMapsImages = async (searchQuery: string): Promise<string[]> => {
  try {
    console.log('🔍 Searching Google Maps for:', searchQuery);
    
    // Use Google Custom Search API to find images
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=YOUR_CUSTOM_SEARCH_ENGINE_ID&q=${encodeURIComponent(searchQuery)}&searchType=image&num=6`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items.map((item: any) => item.link).filter((url: string) => 
        url.match(/\.(jpg|jpeg|png|webp)$/i)
      );
    }
    
    return [];
  } catch (error) {
    console.log('⚠️ Error fetching Google Maps images:', error);
    return [];
  }
};

// Helper: Fetch images from establishment website
export const fetchWebsiteImages = async (websiteUrl: string): Promise<string[]> => {
  try {
    console.log('🌐 Fetching images from website:', websiteUrl);
    
    // This would require a server-side implementation for web scraping
    // For now, we'll return an empty array as this needs proper server setup
    // In a production environment, you'd need:
    // 1. A server endpoint that can scrape websites
    // 2. Image extraction logic
    // 3. CORS handling
    
    return [];
  } catch (error) {
    console.log('⚠️ Error fetching website images:', error);
    return [];
  }
};

// Helper: Fetch images from blog sites and reviews
export const fetchBlogImages = async (searchQuery: string): Promise<string[]> => {
  try {
    console.log('📝 Searching blog sites for:', searchQuery);
    
    // This would require integration with review sites or blog APIs
    // Potential sources:
    // - TripAdvisor API
    // - Yelp API
    // - Zomato API
    // - Local blog APIs
    
    return [];
  } catch (error) {
    console.log('⚠️ Error fetching blog images:', error);
    return [];
  }
};

// Helper: Get high-quality curated images based on place type
export const getCuratedImages = (category: string, placeName: string): string[] => {
  const curatedImageMap = {
    food: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1551218808-b94bcde164b4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&h=600&fit=crop&q=80'
    ],
    activity: [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80'
    ],
    'something-new': [
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=600&fit=crop&q=80',
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop&q=80'
    ]
  };
  
  return curatedImageMap[category as keyof typeof curatedImageMap] || curatedImageMap.food;
};

// Main function: Get comprehensive image set for a place
export const getComprehensiveImages = async (
  placeName: string, 
  placeLocation: string, 
  category: string,
  googlePhotos: string[] = []
): Promise<string[]> => {
  let photos: string[] = [...googlePhotos];
  
  console.log(`📸 Starting comprehensive image search for ${placeName}`);
  console.log(`📸 Initial Google Photos: ${googlePhotos.length}`);
  
  // Priority 1: Use Google Places photos (already provided)
  if (photos.length > 0) {
    console.log(`📸 Using ${photos.length} Google Places photos`);
  }
  
  // Priority 2: Try to get additional images from other sources
  if (photos.length < 3) {
    console.log(`🔍 Need more images, searching additional sources...`);
    
    // Try Google Maps search
    const mapsImages = await fetchGoogleMapsImages(`${placeName} ${placeLocation}`);
    photos.push(...mapsImages);
    console.log(`📸 Added ${mapsImages.length} Google Maps images`);
    
    // Try blog sites
    const blogImages = await fetchBlogImages(`${placeName} ${placeLocation}`);
    photos.push(...blogImages);
    console.log(`📸 Added ${blogImages.length} blog images`);
  }
  
  // Priority 3: Fill remaining slots with curated images
  const neededImages = Math.max(0, 3 - photos.length);
  if (neededImages > 0) {
    const curatedImages = getCuratedImages(category, placeName);
    const additionalCurated = curatedImages.slice(0, Math.min(neededImages, 5));
    photos.push(...additionalCurated);
    console.log(`📸 Added ${additionalCurated.length} curated images`);
  }
  
  // Cap at 8 images maximum
  photos = photos.slice(0, 8);
  console.log(`📸 Final image count for ${placeName}: ${photos.length} images`);
  
  return photos;
}; 