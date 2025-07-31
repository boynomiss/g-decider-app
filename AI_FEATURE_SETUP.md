# AI Restaurant Description Feature Setup

This feature uses Google's Gemini API to generate natural, engaging restaurant descriptions based on the restaurant's data and user preferences.

## Setup Instructions

### 1. Get Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an account or sign in with your Google account
3. Navigate to "Get API key" in the left sidebar
4. Create a new API key
5. Copy the API key

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```bash
# Google Gemini API Configuration
EXPO_PUBLIC_GEMINI_API_KEY=your-actual-gemini-api-key-here

# Google Places API Configuration (already configured)
GOOGLE_PLACES_API_KEY=AIzaSyAdCy-m_2Rc_3trJm3vEbL-8HUqZw33SKg
```

### 3. Install Dependencies
The feature uses the existing `fetch` API, so no additional dependencies are needed.

## How It Works

### Data Collection
The AI service collects data from:
- Restaurant name and location (from Google Places API)
- Price range and cuisine tags
- Customer reviews (from Google Places API)
- Mood and social context from user filters
- Time of day preferences

### AI Processing with Gemini
1. **Data Compilation**: All restaurant data is compiled into a structured format
2. **Prompt Engineering**: A carefully crafted prompt instructs Gemini to generate engaging descriptions
3. **API Call**: The data is sent to Google's Gemini-1.5-flash model
4. **Response Processing**: The AI-generated description is cached and displayed

### Caching
- Descriptions are cached for 24 hours to reduce API calls
- Cache keys are based on restaurant name, location, budget, mood, and tags
- Cache can be cleared programmatically

## Features

### Smart Context Integration
- **Mood Awareness**: Descriptions adapt to user's mood preference (exciting, relaxed, etc.)
- **Social Context**: Considers dining context (solo, couple, family, group)
- **Time of Day**: Adapts descriptions for morning, afternoon, or evening
- **Google Places Integration**: Uses the same Google ecosystem for seamless data flow

### Error Handling
- **Fallback Descriptions**: If AI fails, generates a basic description
- **Retry Mechanism**: Users can retry failed generations
- **Graceful Degradation**: App continues working even if AI is unavailable

### User Experience
- **Loading States**: Shows spinner while generating
- **Error States**: Clear error messages with retry options
- **Regenerate Option**: Users can request new descriptions
- **Auto-Generation**: Descriptions generate automatically when suggestions load

## API Usage

### Cost Management
- Uses Gemini-1.5-flash (cost-effective and fast)
- Limited to 150 tokens per response
- Cached for 24 hours to reduce API calls
- Fallback descriptions when API fails

### Rate Limiting
- Respects Google's rate limits
- Implements exponential backoff for retries
- Graceful handling of API errors

## Integration with Google Places API

### Seamless Data Flow
Since you're already using Google Places API, the integration is seamless:

1. **Places API** → Provides restaurant data, reviews, ratings
2. **Gemini API** → Generates descriptions based on that data
3. **Unified Experience** → Both APIs work together in the Google ecosystem

### Enhanced Data Sources
- **Reviews**: Uses actual customer reviews from Google Places
- **Ratings**: Incorporates Google ratings for context
- **Photos**: Can reference visual elements from Places API
- **Features**: Extracts features like "outdoor seating", "live music", etc.

## Customization

### Prompt Engineering
The AI prompt can be customized in `utils/ai-description-service.ts`:

```typescript
private buildGeminiPrompt(restaurantData: RestaurantData): string {
  // Customize the prompt here
}
```

### Model Selection
Change the model in the API call:

```typescript
// Current: gemini-1.5-flash (fast, cost-effective)
// Alternative: gemini-1.5-pro (higher quality, more expensive)
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';
```

### Cache Duration
Modify cache duration in the service:

```typescript
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
```

## Testing

### Without API Key
The feature will work with fallback descriptions if no API key is provided.

### With API Key
1. Set up your Google Gemini API key
2. Generate a restaurant suggestion
3. The AI description should appear automatically
4. Test retry and regenerate functionality

## Troubleshooting

### Common Issues
1. **API Key Not Set**: Check your `.env` file
2. **Rate Limiting**: Wait and retry
3. **Network Issues**: Check internet connection
4. **Invalid Response**: Check API key validity

### Debug Logs
Enable debug logging by checking the console for:
- `🤖 Generated new AI description with Gemini`
- `🎯 Using cached AI description`
- `❌ AI description generation failed`

## Advantages of Gemini over OpenAI

### 1. **Google Ecosystem Integration**
- Same authentication system as Google Places API
- Unified billing and quota management
- Better integration with Google services

### 2. **Cost Efficiency**
- Gemini-1.5-flash is more cost-effective than GPT-3.5-turbo
- Better token efficiency
- Free tier available for testing

### 3. **Performance**
- Faster response times
- Better handling of structured data
- More consistent with Google's data formats

### 4. **Data Privacy**
- Google's privacy policies align with your existing Google services
- Better data handling compliance

## Future Enhancements

### Potential Improvements
1. **Multi-language Support**: Generate descriptions in different languages
2. **Personalization**: Adapt descriptions based on user preferences
3. **Image Analysis**: Use restaurant images to enhance descriptions
4. **Sentiment Analysis**: Analyze reviews for better context
5. **A/B Testing**: Test different prompt variations

### Integration Opportunities
1. **Review Aggregation**: Combine multiple review sources
2. **Menu Analysis**: Include popular dishes in descriptions
3. **Seasonal Context**: Adapt descriptions based on season/time
4. **Local Insights**: Include local recommendations and tips
5. **Google Maps Integration**: Enhanced location-based descriptions 