#!/usr/bin/env node

/**
 * File Organization Checker
 * Ensures proper file extensions and organization
 */

const fs = require('fs');
const path = require('path');

// Define file organization rules
const FILE_RULES = {
  // Files that should be .tsx (contain JSX)
  shouldBeTsx: [
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
    'components/LoadingScreens.tsx',
    'components/ErrorBoundary.tsx',
    'hooks/use-auth.tsx'
  ],
  
  // Files that should be .ts (pure TypeScript)
  shouldBeTs: [
    'hooks/use-app-store.ts',
    'hooks/use-place-discovery.ts',
    'hooks/use-place-mood.ts',
    'hooks/use-saved-places.ts',
    'hooks/use-ad-monetization.ts',
    'hooks/use-ai-description.ts',
    'hooks/use-ai-project-agent.ts',
    'hooks/use-booking-integration.ts',
    'hooks/use-contact.ts',
    'hooks/use-discounts.ts',
    'hooks/use-scraping-service.ts',
    'hooks/use-server-filtering.ts',
    'utils/place-mood-service.ts',
    'utils/place-discovery-logic.ts',
  
    'utils/enhanced-caching-service.ts',
    'utils/enhanced-filtering-with-cache.ts',
    'utils/firebase-cache.ts',
    'utils/location-service.ts',
    'utils/server-data-converter.ts',
    'utils/server-filtering-service.ts',
    'types/app.ts',
    'types/server-filtering.ts',
    'constants/colors.ts',
    'constants/suggestions.ts'
  ]
};

// JSX patterns to detect
const JSX_PATTERNS = [
  /<[A-Z][a-zA-Z]*/,
  /<\/[A-Z][a-zA-Z]*/,
  /React\.createElement/,
  /import.*React/,
  /from ['"]react['"]/
];

// TypeScript patterns to detect
const TS_PATTERNS = [
  /interface\s+\w+/,
  /type\s+\w+/,
  /enum\s+\w+/,
  /export\s+(?:default\s+)?(?:function|const|class)/,
  /import\s+.*from\s+['"]/
];

console.log('📁 Checking file organization...\n');

let totalFiles = 0;
let passedFiles = 0;
let failedFiles = 0;
const errors = [];

// Check if file contains JSX
function containsJSX(content) {
  return JSX_PATTERNS.some(pattern => pattern.test(content));
}

// Check if file contains TypeScript
function containsTypeScript(content) {
  return TS_PATTERNS.some(pattern => pattern.test(content));
}

// Check file extension vs content
function checkFileExtension(filePath) {
  totalFiles++;
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  ${filePath} does not exist`);
      passedFiles++;
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const hasJSX = containsJSX(content);
    const hasTS = containsTypeScript(content);
    const isTsx = filePath.endsWith('.tsx');
    const isTs = filePath.endsWith('.ts');
    
    let isValid = true;
    let message = '';
    
    if (hasJSX && !isTsx) {
      isValid = false;
      message = `contains JSX but has .ts extension`;
    } else if (!hasJSX && isTsx) {
      isValid = false;
      message = `has .tsx extension but no JSX content`;
    } else if (!hasTS && isTs) {
      isValid = false;
      message = `has .ts extension but no TypeScript content`;
    }
    
    if (isValid) {
      console.log(`  ✅ ${filePath} (${hasJSX ? 'JSX' : 'TS'})`);
      passedFiles++;
    } else {
      console.log(`  ❌ ${filePath}: ${message}`);
      failedFiles++;
      errors.push(`${filePath}: ${message}`);
    }
    
  } catch (error) {
    console.log(`  ❌ ${filePath} failed to read: ${error.message}`);
    failedFiles++;
    errors.push(`${filePath} failed to read: ${error.message}`);
  }
}

// Check all files
function checkAllFiles() {
  console.log('🔍 Checking file extensions vs content:');
  
  // Check files that should be .tsx
  FILE_RULES.shouldBeTsx.forEach(filePath => {
    checkFileExtension(filePath);
  });
  
  // Check files that should be .ts
  FILE_RULES.shouldBeTs.forEach(filePath => {
    checkFileExtension(filePath);
  });
}

// Check for common organization issues
function checkOrganizationIssues() {
  console.log('\n📋 Checking for organization issues:');
  
  const issues = [];
  
  // Check for .ts files that might need to be .tsx
  FILE_RULES.shouldBeTs.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (containsJSX(content)) {
          issues.push(`${filePath} contains JSX but has .ts extension`);
        }
      }
    } catch (error) {
      // Ignore read errors
    }
  });
  
  if (issues.length > 0) {
    console.log('  ⚠️  Potential organization issues:');
    issues.forEach(issue => {
      console.log(`    - ${issue}`);
    });
  } else {
    console.log('  ✅ No organization issues found');
  }
  
  return issues;
}

// Run checks
checkAllFiles();
const organizationIssues = checkOrganizationIssues();

// Summary
console.log('\n📊 File Organization Summary:');
console.log(`  Total Files Checked: ${totalFiles}`);
console.log(`  Passed: ${passedFiles}`);
console.log(`  Failed: ${failedFiles}`);
console.log(`  Success Rate: ${((passedFiles / totalFiles) * 100).toFixed(1)}%`);

if (errors.length > 0) {
  console.log('\n❌ Errors Found:');
  errors.forEach(error => console.log(`  - ${error}`));
  process.exit(1);
} else {
  console.log('\n🎉 All file organization checks passed!');
  process.exit(0);
} 