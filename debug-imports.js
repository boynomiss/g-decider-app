#!/usr/bin/env node

/**
 * Debug script to test imports and identify which component is undefined
 */

console.log('🔍 Testing imports from _layout.tsx...\n');

try {
  console.log('1. Testing @tanstack/react-query...');
  const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
  console.log('✅ QueryClient:', typeof QueryClient);
  console.log('✅ QueryClientProvider:', typeof QueryClientProvider);
} catch (error) {
  console.error('❌ @tanstack/react-query error:', error.message);
}

try {
  console.log('\n2. Testing expo-router...');
  const { Stack } = require("expo-router");
  console.log('✅ Stack:', typeof Stack);
} catch (error) {
  console.error('❌ expo-router error:', error.message);
}

try {
  console.log('\n3. Testing expo-splash-screen...');
  const SplashScreen = require("expo-splash-screen");
  console.log('✅ SplashScreen:', typeof SplashScreen);
} catch (error) {
  console.error('❌ expo-splash-screen error:', error.message);
}

try {
  console.log('\n4. Testing react...');
  const React = require("react");
  console.log('✅ React:', typeof React);
  console.log('✅ useEffect:', typeof React.useEffect);
  console.log('✅ createContext:', typeof React.createContext);
  console.log('✅ useContext:', typeof React.useContext);
} catch (error) {
  console.error('❌ react error:', error.message);
}

try {
  console.log('\n5. Testing react-native-gesture-handler...');
  const { GestureHandlerRootView } = require("react-native-gesture-handler");
  console.log('✅ GestureHandlerRootView:', typeof GestureHandlerRootView);
} catch (error) {
  console.error('❌ react-native-gesture-handler error:', error.message);
}

try {
  console.log('\n6. Testing react-native-safe-area-context...');
  const { SafeAreaProvider } = require("react-native-safe-area-context");
  console.log('✅ SafeAreaProvider:', typeof SafeAreaProvider);
} catch (error) {
  console.error('❌ react-native-safe-area-context error:', error.message);
}

try {
  console.log('\n7. Testing use-auth hook...');
  const authModule = require("./hooks/use-auth");
  console.log('✅ Auth module keys:', Object.keys(authModule));
  console.log('✅ AuthProvider:', typeof authModule.AuthProvider);
  console.log('✅ useAuth:', typeof authModule.useAuth);
} catch (error) {
  console.error('❌ use-auth error:', error.message);
}

try {
  console.log('\n8. Testing use-app-store hook...');
  const appStoreModule = require("./hooks/use-app-store");
  console.log('✅ App store module keys:', Object.keys(appStoreModule));
  console.log('✅ AppProvider:', typeof appStoreModule.AppProvider);
  console.log('✅ useAppStore:', typeof appStoreModule.useAppStore);
} catch (error) {
  console.error('❌ use-app-store error:', error.message);
}

try {
  console.log('\n9. Testing colors constant...');
  const colors = require("./constants/colors");
  console.log('✅ Colors:', typeof colors);
  console.log('✅ Colors keys:', Object.keys(colors.default || colors));
} catch (error) {
  console.error('❌ colors error:', error.message);
}

console.log('\n🎯 Import debugging complete!');