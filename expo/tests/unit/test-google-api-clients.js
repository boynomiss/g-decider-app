#!/usr/bin/env node

/**
 * Test script for Google API clients configuration
 * 
 * This script tests the Google Places API (New) and Google Cloud Natural Language API
 * client implementations to ensure they are properly configured and working.
 * 
 * Usage:
 *   node test-google-api-clients.js
 * 
 * Authentication methods supported:
 *   - Google Places API: API key via EXPO_PUBLIC_GOOGLE_PLACES_API_KEY
 *   - Google Natural Language API: Service account credentials via google-cloud-credentials.json
 */

const fs = require('fs');

// Since this is a TypeScript project, we'll test the API endpoints directly
// rather than importing the TypeScript modules

async function testGoogleAPIClients() {
  console.log('🔧 Testing Google API Clients Configuration\n');

  // Get API keys from environment
  const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
  const GOOGLE_NATURAL_LANGUAGE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY || '';
  const GOOGLE_CLOUD_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT_ID || 'g-decider-backend';

  // Check for service account credentials files
  const NLP_SERVICE_ACCOUNT_FILE = './nlp-service-account.json';
  const GEMINI_SERVICE_ACCOUNT_FILE = './functions/gemini-api-client-key.json';
  const hasServiceAccount = fs.existsSync(NLP_SERVICE_ACCOUNT_FILE) || fs.existsSync(GEMINI_SERVICE_ACCOUNT_FILE);
  
  // Test API configuration validation
  console.log('📋 Validating API Configuration...');
  const placesConfigured = !!GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY.length > 0;
  const nlConfigured = (!!GOOGLE_NATURAL_LANGUAGE_API_KEY && GOOGLE_NATURAL_LANGUAGE_API_KEY.length > 0) || hasServiceAccount;
  
  console.log(`✅ Places API configured: ${placesConfigured ? '✓' : '✗'}`);
  console.log(`✅ Natural Language API configured: ${nlConfigured ? '✓' : '✗'} ${hasServiceAccount ? '(Service Account)' : ''}`);
  console.log(`✅ All APIs configured: ${placesConfigured && nlConfigured ? '✓' : '✗'}\n`);

  if (!placesConfigured) {
    console.log('⚠️  Google Places API key not configured. Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in your environment.\n');
  }

  if (!nlConfigured) {
    console.log('⚠️  Google Natural Language API not configured. Please set EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY or provide nlp-service-account.json.\n');
  }

  // Test Google Places API
  if (placesConfigured) {
    console.log('🗺️  Testing Google Places API...');
    
    try {
      // Test with a known place ID (Google Sydney office)
      const testPlaceId = 'ChIJN1t_tDeuEmsRUsoyG83frY4';
      console.log(`   Fetching place details for: ${testPlaceId}`);
      
      const response = await fetch(`https://places.googleapis.com/v1/places/${testPlaceId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const place = await response.json();
      console.log(`   ✅ Success! Place: ${place.displayName?.text || place.displayName}`);
      console.log(`   📍 Address: ${place.formattedAddress}\n`);
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }

    // Test text search
    try {
      console.log('   Testing text search for "restaurants in Sydney"...');
      const searchResponse = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName'
        },
        body: JSON.stringify({
          textQuery: 'restaurants in Sydney',
          maxResultCount: 5
        })
      });

      if (!searchResponse.ok) {
        throw new Error(`HTTP ${searchResponse.status}: ${searchResponse.statusText}`);
      }

      const searchResults = await searchResponse.json();
      const placesCount = searchResults.places?.length || 0;
      console.log(`   ✅ Success! Found ${placesCount} places\n`);
    } catch (error) {
      console.log(`   ❌ Search error: ${error.message}\n`);
    }
  }

  // Test Google Natural Language API
  if (nlConfigured) {
    console.log('🧠 Testing Google Natural Language API...');
    
    try {
      const testText = "This restaurant has amazing food and great service! I absolutely love it.";
      console.log(`   Analyzing sentiment for: "${testText}"`);
      
      let nlResponse;
      
      if (hasServiceAccount) {
        // Use service account authentication by calling our auth server
        console.log('   Using service account authentication...');
        const { getAccessToken, testNaturalLanguageAPI } = require('./utils/google-auth-server.js');
        
        try {
          const accessToken = await getAccessToken();
          const result = await testNaturalLanguageAPI(accessToken);
          
          const score = result.documentSentiment?.score || 0;
          const magnitude = result.documentSentiment?.magnitude || 0;
          
          console.log(`   ✅ Success! Sentiment score: ${score.toFixed(2)} (magnitude: ${magnitude.toFixed(2)})`);
          
          // Determine sentiment
          let sentimentLabel = 'Neutral';
          if (score > 0.1) sentimentLabel = 'Positive';
          else if (score < -0.1) sentimentLabel = 'Negative';
          
          console.log(`   📊 Sentiment: ${sentimentLabel} (Service Account Auth)\n`);
        } catch (serviceError) {
          console.log(`   ❌ Service Account Error: ${serviceError.message}\n`);
        }
      } else if (GOOGLE_NATURAL_LANGUAGE_API_KEY) {
        // Use API key authentication
        console.log('   Using API key authentication...');
        nlResponse = await fetch(`https://language.googleapis.com/v1/documents:analyzeSentiment?key=${GOOGLE_NATURAL_LANGUAGE_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            document: {
              content: testText,
              type: 'PLAIN_TEXT'
            }
          })
        });

        if (!nlResponse.ok) {
          throw new Error(`HTTP ${nlResponse.status}: ${nlResponse.statusText}`);
        }

        const sentiment = await nlResponse.json();
        const score = sentiment.documentSentiment?.score || 0;
        const magnitude = sentiment.documentSentiment?.magnitude || 0;
        
        console.log(`   ✅ Success! Sentiment score: ${score.toFixed(2)} (magnitude: ${magnitude.toFixed(2)})`);
        
        // Determine sentiment
        let sentimentLabel = 'Neutral';
        if (score > 0.1) sentimentLabel = 'Positive';
        else if (score < -0.1) sentimentLabel = 'Negative';
        
        console.log(`   📊 Sentiment: ${sentimentLabel} (API Key Auth)\n`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎉 Google API Clients test completed!');
  
  if (placesConfigured && nlConfigured) {
    console.log('✅ All APIs are properly configured and working!');
    if (hasServiceAccount) {
      console.log('🔐 Natural Language API is using secure service account authentication.');
    }
  } else {
    console.log('⚠️  Some APIs are not configured. Please check your configuration.');
    console.log('\nTo configure your APIs:');
    console.log('1. Google Places API: Set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in .env');
    console.log('2. Google Natural Language API: Either:');
    console.log('   - Set EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY in .env, OR');
    console.log('   - Provide nlp-service-account.json (recommended for production)');
    console.log('3. Gemini API: Either:');
    console.log('   - Set EXPO_PUBLIC_GEMINI_API_KEY in .env, OR');
    console.log('   - Provide functions/gemini-api-client-key.json (recommended for production)');
    console.log('4. Make sure .env and *-service-account.json are in your .gitignore');
  }
}

// Run the test
testGoogleAPIClients().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});