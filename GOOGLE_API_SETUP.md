# Google APIs Configuration Guide

This guide explains how to set up and configure the Google APIs used in this project, specifically the **Google Places API (New)** and **Google Cloud Natural Language API**.

## Overview

The project uses the following Google APIs:

1. **Google Places API (New)** - For place discovery, details, and search functionality
2. **Google Cloud Natural Language API** - For sentiment analysis of reviews (optional but recommended)
3. **Google Gemini API** - For AI-powered descriptions and features

## Prerequisites

- A Google Cloud Platform account
- A Google Maps Platform account (can be the same as GCP)
- Basic understanding of API keys and environment variables

## Step 1: Enable APIs in Google Cloud Console

### 1.1 Google Places API (New)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Places API (New)" and enable it
5. Go to **APIs & Services** > **Credentials**
6. Click **Create Credentials** > **API Key**
7. Copy the API key for later use

### 1.2 Google Cloud Natural Language API (Optional)

1. In the same Google Cloud project
2. Navigate to **APIs & Services** > **Library**
3. Search for "Cloud Natural Language API" and enable it
4. The same API key from step 1.1 can be used, or create a separate one

### 1.3 Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an account or sign in
3. Navigate to "Get API key"
4. Create a new API key
5. Copy the API key for later use

## Step 2: Secure API Key Configuration

### 2.1 Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your actual API keys:
   ```env
   # Google Maps Platform API Keys
   EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your-actual-places-api-key-here
   EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY=your-actual-natural-language-api-key-here
   
   # Google Gemini API Key
   EXPO_PUBLIC_GEMINI_API_KEY=your-actual-gemini-api-key-here
   
   # Optional: Google Cloud Project ID
   GOOGLE_CLOUD_PROJECT_ID=your-project-id-here
   ```

### 2.2 Security Best Practices

- ✅ The `.env` file is already added to `.gitignore`
- ✅ Never commit API keys to version control
- ✅ Use the `EXPO_PUBLIC_` prefix for React Native compatibility
- ✅ Restrict API keys to specific domains/apps in production

## Step 3: API Client Implementation

The project uses a centralized API client approach located in `utils/google-api-clients.ts`:

### 3.1 Google Places API Client

```typescript
import { googlePlacesClient } from './utils/google-api-clients';

// Get place details
const place = await googlePlacesClient.getPlace('place_id_here');

// Search for places
const results = await googlePlacesClient.searchText('restaurants near me');

// Search nearby
const nearby = await googlePlacesClient.searchNearby(
  { lat: -33.8688, lng: 151.2093 }, // Sydney coordinates
  5000 // 5km radius
);
```

### 3.2 Google Natural Language Client

```typescript
import { googleNaturalLanguageClient } from './utils/google-api-clients';

// Analyze sentiment
const sentiment = await googleNaturalLanguageClient.analyzeSentiment(
  'This restaurant has amazing food!'
);

// Analyze entities
const entities = await googleNaturalLanguageClient.analyzeEntities(
  'I visited the Sydney Opera House yesterday.'
);
```

## Step 4: Testing Your Configuration

### 4.1 Run the Test Script

```bash
npm run test-google-api-clients
```

This will:
- ✅ Validate your API configuration
- ✅ Test Google Places API connectivity
- ✅ Test Google Natural Language API (if configured)
- ✅ Provide detailed feedback on any issues

### 4.2 Expected Output

```
🔧 Testing Google API Clients Configuration

📋 Validating API Configuration...
✅ Places API configured: ✓
✅ Natural Language API configured: ✓
✅ All APIs configured: ✓

🗺️  Testing Google Places API...
   ✅ Success! Place: Google Sydney
   📍 Address: 48 Pirrama Rd, Pyrmont NSW 2009, Australia

🧠 Testing Google Natural Language API...
   ✅ Success! Sentiment score: 0.85 (magnitude: 0.85)
   📊 Sentiment: Positive

🎉 Google API Clients test completed!
✅ All APIs are properly configured and working!
```

## Step 5: Integration with Existing Services

The project automatically uses the new API clients in:

- **Place Mood Service** (`utils/place-mood-service.ts`) - Enhanced with centralized API clients
- **Photo URL Generator** (`utils/photo-url-generator.ts`) - Uses Places API for images
- **AI Description Service** (`utils/ai-description-service.ts`) - Uses Gemini API

## Troubleshooting

### Common Issues

#### 1. "API key not configured" Error
- **Solution**: Check your `.env` file and ensure API keys are set correctly
- **Verify**: Run `npm run test-google-api-clients` to validate configuration

#### 2. "403 Forbidden" Error
- **Solution**: Enable the required APIs in Google Cloud Console
- **Check**: API quotas and billing configuration

#### 3. "400 Bad Request" Error
- **Solution**: Verify API key restrictions and allowed domains/apps
- **Check**: Request format and required parameters

#### 4. React Native Compatibility Issues
- **Solution**: The project uses REST API calls instead of Node.js SDKs
- **Benefit**: No additional native dependencies required

### API Quotas and Limits

#### Google Places API (New)
- **Free tier**: $200 credit per month
- **Place Details**: $17 per 1,000 requests
- **Text Search**: $32 per 1,000 requests
- **Nearby Search**: $32 per 1,000 requests

#### Google Natural Language API
- **Free tier**: 5,000 units per month
- **Sentiment Analysis**: $1 per 1,000 units
- **Entity Analysis**: $1 per 1,000 units

### Performance Optimization

1. **Caching**: Results are cached to reduce API calls
2. **Batch Requests**: Multiple operations combined when possible
3. **Fallback Logic**: Graceful degradation when APIs are unavailable
4. **Error Handling**: Comprehensive error recovery

## Next Steps

1. **Production Setup**: Configure API key restrictions for your production domains
2. **Monitoring**: Set up API usage monitoring and alerts
3. **Optimization**: Implement request caching and rate limiting as needed
4. **Testing**: Add integration tests for your specific use cases

## Support

- **Google Places API Documentation**: https://developers.google.com/maps/documentation/places/web-service/overview
- **Google Natural Language API Documentation**: https://cloud.google.com/natural-language/docs
- **Google Gemini API Documentation**: https://ai.google.dev/docs

For project-specific issues, check the existing implementation in:
- `utils/google-api-clients.ts` - API client implementations
- `utils/place-mood-service.ts` - Integration example
- `test-google-api-clients.js` - Testing and validation