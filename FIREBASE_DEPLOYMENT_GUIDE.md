# Firebase Function Deployment Guide

## Overview
This guide provides step-by-step instructions for deploying Firebase functions and configuring environment variables for the g-decider-app.

## Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase account with access to `g-decider-backend` project
- Google Cloud Platform access for API keys

## Step 1: Firebase Project Configuration

### 1.1 Login to Firebase
```bash
firebase login
```

### 1.2 Verify Project Configuration
The `.firebaserc` file is already configured with:
```json
{
  "projects": {
    "default": "g-decider-backend"
  }
}
```

## Step 2: Environment Variables Setup

### 2.1 Set Environment Variables in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: `g-decider-backend`
3. Navigate to Functions > Settings > Environment variables
4. Add the following variables:

#### Required Environment Variables:
```bash
GOOGLE_PLACES_API_KEY=your-google-places-api-key
GEMINI_API_KEY=your-gemini-api-key
GOOGLE_NATURAL_LANGUAGE_API_KEY=your-nlp-api-key
```

### 2.2 Set Environment Variables via CLI (Alternative)
```bash
firebase functions:config:set google.places_api_key="your-google-places-api-key"
firebase functions:config:set gemini.api_key="your-gemini-api-key"
firebase functions:config:set google.natural_language_api_key="your-nlp-api-key"
```

## Step 3: Service Account Files

### 3.1 Verify Service Account Files
Ensure these files are in the `functions/` directory:
- `functions/nlp-service-account.json`
- `functions/gemini-api-client-key.json`

### 3.2 File Permissions
Make sure service account files have proper permissions:
```bash
chmod 600 functions/*.json
```

## Step 4: Deploy Functions

### 4.1 Automatic Deployment
Use the provided deployment script:
```bash
./deploy-firebase-functions.sh
```

### 4.2 Manual Deployment
```bash
# Build functions
cd functions
npm run build

# Deploy to Firebase
firebase deploy --only functions
```

## Step 5: Verify Deployment

### 5.1 Check Deployed Functions
```bash
firebase functions:list
```

### 5.2 Test Function Endpoints
Base URL: `https://asia-southeast1-g-decider-backend.cloudfunctions.net`

#### Available Functions:
- `filterPlaces` - Server-side place filtering
- `analyzeSentiment` - Text sentiment analysis
- `analyzeEntities` - Entity extraction
- `analyzeText` - Comprehensive text analysis
- `analyzeUserMood` - User mood analysis
- `extractPlacePreferences` - Place preference extraction
- `testGeminiAccess` - Gemini AI access test
- `generatePlaceDescription` - AI place descriptions
- `analyzeMoodAndSuggest` - Mood-based suggestions
- `getPersonalizedRecommendations` - Personalized recommendations

## Step 6: Testing Functions

### 6.1 Test filterPlaces Function
```bash
curl -X POST https://asia-southeast1-g-decider-backend.cloudfunctions.net/filterPlaces \
  -H "Content-Type: application/json" \
  -d '{
    "filters": {
      "mood": 50,
      "category": "food",
      "budget": "PP",
      "timeOfDay": "afternoon",
      "socialContext": "solo",
      "distanceRange": 5
    },
    "minResults": 5,
    "useCache": true
  }'
```

### 6.2 Test Gemini Functions
```bash
curl -X POST https://asia-southeast1-g-decider-backend.cloudfunctions.net/testGeminiAccess \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello, this is a test"
  }'
```

## Troubleshooting

### Common Issues:

#### 1. Build Errors
```bash
cd functions
npm install
npm run build
```

#### 2. Environment Variable Issues
- Verify variables are set in Firebase Console
- Check function logs: `firebase functions:log`

#### 3. Service Account Issues
- Ensure service account files are in `functions/` directory
- Verify file permissions
- Check service account permissions in Google Cloud Console

#### 4. Deployment Failures
- Check Firebase CLI version: `firebase --version`
- Verify project access: `firebase projects:list`
- Check function logs for errors

### Debugging Commands:
```bash
# View function logs
firebase functions:log

# Check function status
firebase functions:list

# Test function locally
firebase emulators:start --only functions
```

## Security Considerations

### 1. Environment Variables
- Never commit API keys to version control
- Use Firebase environment variables for sensitive data
- Rotate API keys regularly

### 2. Service Account Files
- Keep service account files secure
- Use minimal required permissions
- Monitor usage and costs

### 3. CORS Configuration
Functions are configured with CORS headers for web access:
```javascript
res.set('Access-Control-Allow-Origin', '*');
res.set('Access-Control-Allow-Methods', 'GET, POST');
res.set('Access-Control-Allow-Headers', 'Content-Type');
```

## Monitoring and Maintenance

### 1. Function Monitoring
- Monitor function execution times
- Check error rates
- Monitor API usage and costs

### 2. Regular Updates
- Keep dependencies updated
- Monitor Firebase function runtime updates
- Update API keys as needed

### 3. Cost Optimization
- Monitor API call usage
- Implement caching where appropriate
- Use appropriate function timeouts

## Support

For issues with Firebase deployment:
1. Check Firebase Console logs
2. Verify environment variables
3. Test functions locally
4. Check Google Cloud Console for API quotas

## Next Steps

After successful deployment:
1. Update client-side code to use production function URLs
2. Test all function endpoints
3. Monitor function performance
4. Set up alerts for function errors 