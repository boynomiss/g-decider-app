#!/usr/bin/env node

console.log('🧪 Testing AppProvider export...\n');

try {
  // Test the use-app-store module
  const appStoreModule = require('./hooks/use-app-store');
  
  console.log('✅ App store module keys:', Object.keys(appStoreModule));
  console.log('✅ useAppStore:', typeof appStoreModule.useAppStore);
  console.log('✅ AppProvider:', typeof appStoreModule.AppProvider);
  console.log('✅ useAppContext:', typeof appStoreModule.useAppContext);
  
  if (appStoreModule.AppProvider) {
    console.log('🎉 SUCCESS: AppProvider is properly exported!');
  } else {
    console.log('❌ FAILED: AppProvider is still undefined');
  }
  
} catch (error) {
  console.error('❌ Error testing AppProvider:', error.message);
  console.error('Stack:', error.stack);
}

console.log('\n🎯 AppProvider test complete!'); 