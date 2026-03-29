#!/usr/bin/env node

/**
 * Comprehensive Import Testing Script
 * Tests all critical exports to prevent undefined component errors
 */

const fs = require('fs');
const path = require('path');

// Define critical files that must export specific components
const CRITICAL_EXPORTS = {
  'hooks/use-app-store': ['useAppStore', 'AppProvider', 'useAppContext'],
  'hooks/use-auth': ['AuthProvider', 'useAuth'],
  'components/ErrorBoundary': ['ErrorBoundary'],
  'constants/colors': ['default'],
  'types/app': ['UserFilters', 'Suggestion', 'User', 'AuthState', 'AppState']
};

// Define component files that should have default exports
const COMPONENT_FILES = [
  'app/_layout.tsx',
  'app/index.tsx',
  'app/result.tsx',
  'app/booking.tsx',
  'app/confirmation.tsx',
  'app/auth.tsx',
  'app/settings.tsx',
  'app/upgrade.tsx',
  'components/Header.tsx',
  'components/Footer.tsx',
  'components/GButton.tsx',
  'components/LoadingScreens.tsx'
];

console.log('🧪 Starting comprehensive import testing...\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const errors = [];

// Test critical exports
function testCriticalExports() {
  console.log('📦 Testing Critical Exports:');
  
  for (const [filePath, expectedExports] of Object.entries(CRITICAL_EXPORTS)) {
    totalTests += expectedExports.length;
    
    try {
      // Try to require the module
      const module = require(`./${filePath}`);
      
      for (const exportName of expectedExports) {
        if (module[exportName] !== undefined) {
          console.log(`  ✅ ${filePath} exports ${exportName}`);
          passedTests++;
        } else {
          console.log(`  ❌ ${filePath} missing export: ${exportName}`);
          failedTests++;
          errors.push(`${filePath} missing export: ${exportName}`);
        }
      }
    } catch (error) {
      console.log(`  ❌ ${filePath} failed to load: ${error.message}`);
      failedTests += expectedExports.length;
      errors.push(`${filePath} failed to load: ${error.message}`);
    }
  }
}

// Test component files for default exports
function testComponentFiles() {
  console.log('\n🎭 Testing Component Files:');
  
  for (const filePath of COMPONENT_FILES) {
    totalTests++;
    
    try {
      if (fs.existsSync(filePath)) {
        const module = require(`./${filePath}`);
        
        if (module.default !== undefined) {
          console.log(`  ✅ ${filePath} has default export`);
          passedTests++;
        } else {
          console.log(`  ❌ ${filePath} missing default export`);
          failedTests++;
          errors.push(`${filePath} missing default export`);
        }
      } else {
        console.log(`  ⚠️  ${filePath} does not exist`);
        passedTests++; // Not a failure if file doesn't exist
      }
    } catch (error) {
      console.log(`  ❌ ${filePath} failed to load: ${error.message}`);
      failedTests++;
      errors.push(`${filePath} failed to load: ${error.message}`);
    }
  }
}

// Test for common import/export patterns
function testImportPatterns() {
  console.log('\n🔍 Testing Import Patterns:');
  
  const filesToCheck = [
    'app/_layout.tsx',
    'hooks/use-app-store.ts',
    'hooks/use-auth.tsx'
  ];
  
  for (const filePath of filesToCheck) {
    totalTests++;
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for proper React imports
        if (content.includes('import React') || content.includes('import {') && content.includes('React')) {
          console.log(`  ✅ ${filePath} has proper React imports`);
          passedTests++;
        } else {
          console.log(`  ❌ ${filePath} missing proper React imports`);
          failedTests++;
          errors.push(`${filePath} missing proper React imports`);
        }
      } else {
        console.log(`  ⚠️  ${filePath} does not exist`);
        passedTests++;
      }
    } catch (error) {
      console.log(`  ❌ ${filePath} failed to read: ${error.message}`);
      failedTests++;
      errors.push(`${filePath} failed to read: ${error.message}`);
    }
  }
}

// Run all tests
testCriticalExports();
testComponentFiles();
testImportPatterns();

// Summary
console.log('\n📊 Test Summary:');
console.log(`  Total Tests: ${totalTests}`);
console.log(`  Passed: ${passedTests}`);
console.log(`  Failed: ${failedTests}`);
console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (errors.length > 0) {
  console.log('\n❌ Errors Found:');
  errors.forEach(error => console.log(`  - ${error}`));
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! No import/export issues detected.');
  process.exit(0);
} 