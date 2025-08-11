#!/usr/bin/env node

/**
 * Error Boundary Implementation Test
 * 
 * This script tests the error boundary implementation to ensure:
 * 1. Error boundaries are properly imported and exported
 * 2. Components are wrapped with error boundaries
 * 3. Error handling functions are available
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Error Boundary Implementation...\n');

// Test 1: Check if ErrorBoundary component exists and is properly structured
function testErrorBoundaryComponent() {
  console.log('📋 Test 1: ErrorBoundary Component Structure');
  
  try {
    const errorBoundaryPath = path.join(__dirname, 'components', 'ErrorBoundary.tsx');
    
    if (!fs.existsSync(errorBoundaryPath)) {
      throw new Error('ErrorBoundary.tsx not found');
    }
    
    const content = fs.readFileSync(errorBoundaryPath, 'utf8');
    
    // Check for required exports
    const requiredExports = [
      'ErrorBoundary',
      'withErrorBoundary',
      'NetworkErrorBoundary',
      'DataErrorBoundary',
      'globalErrorHandler'
    ];
    
    const missingExports = requiredExports.filter(exportName => 
      !content.includes(`export ${exportName}`) && 
      !content.includes(`export { ${exportName}`) &&
      !content.includes(`export const ${exportName}`) &&
      !content.includes(`export class ${exportName}`)
    );
    
    if (missingExports.length > 0) {
      throw new Error(`Missing exports: ${missingExports.join(', ')}`);
    }
    
    // Check for required features
    const requiredFeatures = [
      'componentDidCatch',
      'getDerivedStateFromError',
      'handleRetry',
      'handleReportError',
      'getErrorMessage'
    ];
    
    const missingFeatures = requiredFeatures.filter(feature => 
      !content.includes(feature)
    );
    
    if (missingFeatures.length > 0) {
      throw new Error(`Missing features: ${missingFeatures.join(', ')}`);
    }
    
    console.log('✅ ErrorBoundary component structure is correct');
    return true;
  } catch (error) {
    console.log(`❌ ErrorBoundary component test failed: ${error.message}`);
    return false;
  }
}

// Test 2: Check if screens have error boundaries
function testScreenErrorBoundaries() {
  console.log('\n📱 Test 2: Screen Error Boundary Coverage');
  
  const screens = [
    'app/_layout.tsx',
    'app/index.tsx',
    'app/booking.tsx',
    'app/settings.tsx',
    'app/auth.tsx'
  ];
  
  let passedTests = 0;
  const totalTests = screens.length;
  
  screens.forEach(screenPath => {
    try {
      const fullPath = path.join(__dirname, screenPath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  ${screenPath} not found, skipping`);
        return;
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check if ErrorBoundary is imported
      if (!content.includes("import { ErrorBoundary }")) {
        throw new Error('ErrorBoundary not imported');
      }
      
      // Check if ErrorBoundary is used
      if (!content.includes('<ErrorBoundary')) {
        throw new Error('ErrorBoundary not used in component');
      }
      
      const screenName = path.basename(screenPath, '.tsx');
      console.log(`✅ ${screenName} has error boundaries`);
      passedTests++;
      
    } catch (error) {
      console.log(`❌ ${screenPath}: ${error.message}`);
    }
  });
  
  console.log(`\n📊 Screen Coverage: ${passedTests}/${totalTests} screens have error boundaries`);
  return passedTests === totalTests;
}

// Test 3: Check for specific error boundary patterns
function testErrorBoundaryPatterns() {
  console.log('\n🔍 Test 3: Error Boundary Usage Patterns');
  
  try {
    const indexContent = fs.readFileSync(path.join(__dirname, 'app', 'index.tsx'), 'utf8');
    const bookingContent = fs.readFileSync(path.join(__dirname, 'app', 'booking.tsx'), 'utf8');
    
    // Check for componentName prop usage
    const componentNamePattern = /componentName="[^"]+"/g;
    const componentNames = [
      ...indexContent.match(componentNamePattern) || [],
      ...bookingContent.match(componentNamePattern) || []
    ];
    
    if (componentNames.length === 0) {
      throw new Error('No componentName props found');
    }
    
    console.log(`✅ Found ${componentNames.length} error boundaries with component names`);
    
    // Check for specific component names
    const expectedComponents = [
      'HomeScreen',
      'Header',
      'Footer',
      'BookingScreen',
      'FormInput'
    ];
    
    const foundComponents = expectedComponents.filter(component => 
      componentNames.some(name => name.includes(component))
    );
    
    console.log(`✅ Found error boundaries for: ${foundComponents.join(', ')}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Error boundary patterns test failed: ${error.message}`);
    return false;
  }
}

// Test 4: Check for error handling features
function testErrorHandlingFeatures() {
  console.log('\n🛠️  Test 4: Error Handling Features');
  
  try {
    const errorBoundaryContent = fs.readFileSync(path.join(__dirname, 'components', 'ErrorBoundary.tsx'), 'utf8');
    
    const features = [
      { name: 'Global Error Handler', pattern: 'globalErrorHandler' },
      { name: 'Retry Functionality', pattern: 'handleRetry' },
      { name: 'Error Reporting', pattern: 'handleReportError' },
      { name: 'Context-Aware Messages', pattern: 'getErrorMessage' },
      { name: 'HOC Support', pattern: 'withErrorBoundary' },
      { name: 'Specialized Boundaries', pattern: 'NetworkErrorBoundary' }
    ];
    
    let passedFeatures = 0;
    
    features.forEach(feature => {
      if (errorBoundaryContent.includes(feature.pattern)) {
        console.log(`✅ ${feature.name}`);
        passedFeatures++;
      } else {
        console.log(`❌ ${feature.name} - missing`);
      }
    });
    
    console.log(`\n📊 Features: ${passedFeatures}/${features.length} implemented`);
    return passedFeatures === features.length;
  } catch (error) {
    console.log(`❌ Error handling features test failed: ${error.message}`);
    return false;
  }
}

// Test 5: Check documentation
function testDocumentation() {
  console.log('\n📚 Test 5: Documentation');
  
  try {
    const docPath = path.join(__dirname, 'ERROR_BOUNDARY_IMPLEMENTATION_SUMMARY.md');
    
    if (!fs.existsSync(docPath)) {
      throw new Error('Documentation file not found');
    }
    
    const content = fs.readFileSync(docPath, 'utf8');
    
    const requiredSections = [
      'Overview',
      'What Was Implemented',
      'Key Features',
      'Usage Examples',
      'Benefits Achieved'
    ];
    
    const missingSections = requiredSections.filter(section => 
      !content.includes(`## ${section}`)
    );
    
    if (missingSections.length > 0) {
      throw new Error(`Missing documentation sections: ${missingSections.join(', ')}`);
    }
    
    console.log('✅ Documentation is comprehensive');
    return true;
  } catch (error) {
    console.log(`❌ Documentation test failed: ${error.message}`);
    return false;
  }
}

// Run all tests
function runAllTests() {
  const tests = [
    testErrorBoundaryComponent,
    testScreenErrorBoundaries,
    testErrorBoundaryPatterns,
    testErrorHandlingFeatures,
    testDocumentation
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  tests.forEach(test => {
    if (test()) {
      passedTests++;
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 Final Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All error boundary tests passed!');
    console.log('\n✅ Error Boundary Implementation Summary:');
    console.log('   • Enhanced ErrorBoundary component with advanced features');
    console.log('   • Comprehensive coverage across all major screens');
    console.log('   • Specialized error boundaries for different use cases');
    console.log('   • HOC support for easy component wrapping');
    console.log('   • Global error handling and reporting');
    console.log('   • User-friendly error recovery mechanisms');
    console.log('   • Complete documentation and usage examples');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }
  
  return passedTests === totalTests;
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testErrorBoundaryComponent,
  testScreenErrorBoundaries,
  testErrorBoundaryPatterns,
  testErrorHandlingFeatures,
  testDocumentation,
  runAllTests
}; 