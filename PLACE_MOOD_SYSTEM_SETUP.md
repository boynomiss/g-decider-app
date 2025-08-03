# Enhanced Place Mood System Setup Guide

## Overview

The Enhanced Place Mood System is a comprehensive solution for discovering and categorizing places based on their atmosphere and vibe. It uses advanced AI and real-time data to assign descriptive moods like "Vibrant," "Cozy," or "Balanced" to places, making recommendations more personalized and intuitive.

## Features

### 🎭 Enhanced Mood Categories
- **Chill**: Relaxed, Low-Key, Cozy, Mellow, Calm, Peaceful, Tranquil, Serene, Laid-back, Intimate
- **Neutral**: Balanced, Standard, Casual, Average, Steady, Moderate, Regular, Comfortable, Decent, Typical  
- **Hype**: Vibrant, Lively, Buzzing, Energetic, Electric, Dynamic, Exciting, Thrilling, Pumping, Wild

### 🔍 Multi-Source Data Collection
- **Google Places API**: Core place information, ratings, and reviews
- **Real-Time Data**: Popular times and current busyness levels
- **Google Natural Language API**: Advanced sentiment analysis of reviews
- **Smart Categorization**: 60+ place categories with baseline mood mappings

### 🧠 Intelligent Mood Assignment
- **Baseline Scoring**: Category-based initial mood scores
- **Sentiment Analysis**: Review text analysis with keyword detection
- **Real-Time Adjustment**: Busyness data influences final mood
- **Dynamic Scaling**: Scores adapt based on multiple data points

## Installation

### 1. Install Dependencies

```bash
npm install @google-cloud/language
```

### 2. Set Up Google APIs

#### Google Places API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**
4. Create credentials (API Key)
5. Restrict the API key to your app's bundle ID/package name

#### Google Natural Language API
1. In the same Google Cloud project
2. Enable the **Natural Language API**
3. Create a service account
4. Download the service account key (JSON file)
5. Set up authentication (see below)

### 3. Configure Environment Variables

Create a `.env` file in your project root:

```env
# Google Places API
GOOGLE_PLACES_API_KEY=your_places_api_key_here

# Google Cloud Natural Language API
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_KEY_FILE=path/to/your/service-account-key.json

# Optional: For testing
ENABLE_MOCK_DATA=false
```

### 4. Authentication Setup

#### Option A: Service Account Key File
```javascript
const credentials = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
};
```

#### Option B: Environment Variables
```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/your/service-account-key.json"
```

#### Option C: Inline Credentials (for testing)
```javascript
const credentials = {
  type: "service_account",
  project_id: "your-project-id",
  private_key_id: "key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
  client_email: "service-account-email@project.iam.gserviceaccount.com",
  client_id: "client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token"
};
```

## Usage

### Basic Implementation

```typescript
import { usePlaceMood } from '@/hooks/use-place-mood';

function MyComponent() {
  const {
    isLoading,
    error,
    places,
    moodStats,
    enhanceSinglePlace,
    enhanceMultiplePlaces,
    clearPlaces
  } = usePlaceMood({
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY!,
    googleCloudCredentials: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE
    }
  });

  const handleEnhancePlace = async () => {
    const result = await enhanceSinglePlace('ChIJN1t_tDeuEmsRUsoyG83frY4');
    if (result) {
      console.log(`Enhanced ${result.name} with mood: ${result.final_mood}`);
    }
  };

  return (
    <div>
      <button onClick={handleEnhancePlace} disabled={isLoading}>
        {isLoading ? 'Enhancing...' : 'Enhance Place'}
      </button>
      
      {places.map(place => (
        <div key={place.place_id}>
          <h3>{place.name}</h3>
          <p>Mood: {place.final_mood} (Score: {place.mood_score})</p>
        </div>
      ))}
    </div>
  );
}
```

### Advanced Usage with Filtering

```typescript
import { usePlaceMood, useMoodFiltering } from '@/hooks/use-place-mood';

function AdvancedPlaceManager() {
  const moodHook = usePlaceMood({ /* config */ });
  const {
    moodFilter,
    setMoodFilter,
    searchQuery,
    setSearchQuery,
    filteredPlaces
  } = useMoodFiltering(moodHook.places);

  return (
    <div>
      {/* Filter Controls */}
      <select 
        value={moodFilter} 
        onChange={(e) => setMoodFilter(e.target.value)}
      >
        <option value="all">All Moods</option>
        <option value="chill">Chill</option>
        <option value="neutral">Neutral</option>
        <option value="hype">Hype</option>
      </select>

      <input
        type="text"
        placeholder="Search places..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Results */}
      {filteredPlaces.map(place => (
        <PlaceCard key={place.place_id} place={place} />
      ))}
    </div>
  );
}
```

### Direct Service Usage

```typescript
import { PlaceMoodService } from '@/utils/place-mood-service';

const service = new PlaceMoodService(
  'your-api-key',
  { projectId: 'your-project' }
);

// Single place
const enhancedPlace = await service.enhancePlaceWithMood('place-id');
console.log(`${enhancedPlace.name}: ${enhancedPlace.final_mood}`);

// Multiple places
const placeIds = ['id1', 'id2', 'id3'];
const enhancedPlaces = await service.enhanceMultiplePlaces(placeIds);

// Statistics
const stats = service.getMoodStatistics(enhancedPlaces);
console.log(`Processed ${stats.total} places: ${stats.hype} hype, ${stats.chill} chill`);
```

## Testing

### Run the Test Suite

```bash
npm run test-mood-system
```

This will run a comprehensive test that demonstrates:
- Individual place enhancement
- Batch processing
- Mood configuration
- Error handling
- Performance metrics

### Manual Testing with Real Data

```javascript
// Test with real Google Place IDs
const testPlaces = [
  'ChIJN1t_tDeuEmsRUsoyG83frY4', // Sydney Opera House (should be Hype)
  'ChIJP3Sa8ziYEmsRUKgyFmh9AQM', // Royal Botanic Gardens (should be Chill)
  'ChIJrTLr-GyuEmsRBfy61i59si0'  // Sydney Harbour Bridge (should be Hype)
];

for (const placeId of testPlaces) {
  const result = await service.enhancePlaceWithMood(placeId);
  console.log(`${result.name}: ${result.final_mood} (${result.mood_score})`);
}
```

## Configuration

### Mood Score Ranges
- **Hype**: 70-100 (High energy, exciting places)
- **Neutral**: 31-69 (Balanced, moderate atmosphere)
- **Chill**: 0-30 (Relaxed, calm environments)

### Category Mappings
The system includes 60+ place categories with pre-configured mood scores:

```typescript
// Examples
'night_club': 92,     // High Hype
'library': 18,        // High Chill  
'restaurant': 60,     // Neutral
'spa': 40,           // Medium Chill
'amusement_park': 93  // High Hype
```

### Sentiment Analysis
- **Score Impact**: ±15 points based on review sentiment (-1 to +1)
- **Keyword Impact**: ±20 points based on mood-related keywords
- **Recency Weight**: Recent reviews have more influence

### Real-Time Adjustments
- **High Busyness + High Mood**: +15% boost (reinforcement)
- **High Busyness + Low Mood**: +5% boost (contradiction handling)
- **Dynamic Scaling**: Adjustments based on current activity levels

## Troubleshooting

### Common Issues

#### 1. "API Key Invalid" Error
```
❌ Google Places API error: REQUEST_DENIED
```
**Solution**: Check that your API key is valid and the Places API is enabled.

#### 2. "Natural Language API Authentication Failed"
```
❌ Error analyzing sentiment: Authentication failed
```
**Solution**: Verify your service account credentials and ensure the Natural Language API is enabled.

#### 3. "Rate Limit Exceeded"
```
❌ Error: RATE_LIMIT_EXCEEDED
```
**Solution**: The system includes automatic rate limiting. For high-volume usage, consider upgrading your API quota.

#### 4. "Place ID Not Found"
```
❌ Google Places API error: NOT_FOUND
```
**Solution**: Verify the Place ID is correct and the place exists in Google's database.

### Performance Optimization

#### 1. Batch Processing
```typescript
// Process multiple places efficiently
const placeIds = ['id1', 'id2', 'id3', 'id4', 'id5'];
const results = await service.enhanceMultiplePlaces(placeIds);
```

#### 2. Caching Results
```typescript
// Cache enhanced places to avoid re-processing
const cache = new Map();

const getEnhancedPlace = async (placeId) => {
  if (cache.has(placeId)) {
    return cache.get(placeId);
  }
  
  const result = await service.enhancePlaceWithMood(placeId);
  cache.set(placeId, result);
  return result;
};
```

#### 3. Error Recovery
```typescript
// Implement retry logic for failed requests
const enhanceWithRetry = async (placeId, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await service.enhancePlaceWithMood(placeId);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Integration with Existing App

### 1. Update Place Discovery
```typescript
// In your existing place search function
const searchPlaces = async (query, location) => {
  // Your existing Google Places search
  const places = await googlePlacesSearch(query, location);
  
  // Enhance with mood data
  const placeIds = places.map(p => p.place_id);
  const enhancedPlaces = await moodService.enhanceMultiplePlaces(placeIds);
  
  return enhancedPlaces;
};
```

### 2. Update Filtering Logic
```typescript
// Add mood-based filtering to your existing filters
const filterPlaces = (places, filters) => {
  return places.filter(place => {
    // Existing filters (category, price, etc.)
    if (!matchesExistingFilters(place, filters)) return false;
    
    // New mood filter
    if (filters.mood && filters.mood !== 'all') {
      const moodCategory = getMoodCategory(place.mood_score);
      if (moodCategory !== filters.mood) return false;
    }
    
    return true;
  });
};
```

### 3. Update UI Components
```typescript
// Add mood indicators to your place cards
const PlaceCard = ({ place }) => (
  <div className="place-card">
    <h3>{place.name}</h3>
    <div className="mood-indicator">
      <span className={`mood-badge mood-${getMoodCategory(place.mood_score)}`}>
        {place.final_mood}
      </span>
      <span className="mood-score">{place.mood_score}</span>
    </div>
    {/* Rest of your place card */}
  </div>
);
```

## API Costs

### Google Places API
- **Place Details**: $17 per 1,000 requests
- **Popular Times**: Additional $5 per 1,000 requests (if available)

### Google Natural Language API
- **Sentiment Analysis**: $1 per 1,000 requests
- **Entity Analysis**: $1 per 1,000 requests

### Cost Optimization Tips
1. **Cache Results**: Store enhanced places to avoid re-processing
2. **Batch Requests**: Process multiple places together
3. **Smart Filtering**: Only enhance places that pass initial filters
4. **Rate Limiting**: Respect API quotas to avoid overage charges

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the test output for debugging information
3. Check Google Cloud Console for API usage and errors
4. Ensure all dependencies are properly installed

## Changelog

### Version 1.0.0
- Initial release with core mood assignment functionality
- Google Places API integration
- Google Natural Language API integration
- React hooks for easy integration
- Comprehensive testing suite
- Full TypeScript support