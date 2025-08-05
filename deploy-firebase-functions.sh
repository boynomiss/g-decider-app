#!/bin/bash

# Firebase Function Deployment Script
# This script deploys the Firebase functions to production

echo "🚀 Starting Firebase Function Deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "   firebase login"
    exit 1
fi

# Build the functions
echo "📦 Building functions..."
cd functions
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi
cd ..

# Check if service account files exist
if [ ! -f "functions/nlp-service-account.json" ]; then
    echo "❌ nlp-service-account.json not found in functions directory"
    exit 1
fi

if [ ! -f "functions/gemini-api-client-key.json" ]; then
    echo "❌ gemini-api-client-key.json not found in functions directory"
    exit 1
fi

# Deploy functions
echo "🚀 Deploying functions to Firebase..."
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo "✅ Firebase functions deployed successfully!"
    echo ""
    echo "📋 Deployed Functions:"
    echo "   - filterPlaces"
    echo "   - validateFilter"
    echo "   - analyzeSentiment"
    echo "   - analyzeEntities"
    echo "   - analyzeText"
    echo "   - analyzeUserMood"
    echo "   - extractPlacePreferences"
    echo "   - testGeminiAccess"
    echo "   - generatePlaceDescription"
    echo "   - analyzeMoodAndSuggest"
    echo "   - getPersonalizedRecommendations"
    echo ""
    echo "🔗 Function URLs:"
    echo "   Base URL: https://asia-southeast1-g-decider-backend.cloudfunctions.net"
    echo ""
    echo "⚠️  Important: Set environment variables in Firebase Console:"
    echo "   - GOOGLE_PLACES_API_KEY"
    echo "   - GEMINI_API_KEY"
    echo "   - GOOGLE_NATURAL_LANGUAGE_API_KEY"
else
    echo "❌ Deployment failed"
    exit 1
fi 