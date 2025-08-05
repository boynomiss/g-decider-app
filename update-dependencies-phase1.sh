#!/bin/bash

# 🔄 Phase 1: Low-Risk Dependency Updates
# This script safely updates low-risk dependencies

echo "🔄 Starting Phase 1: Low-Risk Dependency Updates"
echo "=================================================="

# Create backup branch
echo "📦 Creating backup branch..."
git checkout -b dependency-update-phase1-$(date +%Y%m%d-%H%M%S)

# Run tests before updates
echo "🧪 Running tests before updates..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed before updates. Aborting."
    exit 1
fi

echo "✅ Pre-update tests passed"

# Frontend updates
echo "📱 Updating frontend dependencies..."
npm update @react-native-async-storage/async-storage
npm update @react-native-community/slider
npm update @react-navigation/native
npm update @tanstack/react-query
npm update lucide-react-native
npm update react-native-safe-area-context
npm update react-native-screens
npm update react-native-svg
npm update react-native-web
npm update zustand

# Backend updates
echo "🔧 Updating backend dependencies..."
cd functions
npm update @google/generative-ai
cd ..

# Run post-update checks
echo "🔍 Running post-update checks..."

echo "📝 Running TypeScript check..."
npm run type-check

echo "🔍 Running ESLint..."
npm run lint

echo "🏗️ Testing build..."
npm run build

echo "✅ Phase 1 updates completed successfully!"
echo "📋 Next steps:"
echo "   1. Test the app on both iOS and Android"
echo "   2. Verify all features work correctly"
echo "   3. If everything looks good, commit the changes"
echo "   4. Proceed to Phase 2 when ready" 