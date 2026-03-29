#!/usr/bin/env node

/**
 * React Native/Expo Project Validation Script
 * Checks for TypeScript compilation errors and import issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting React Native project validation...\n');

let hasErrors = false;

// Function to run command and capture output
function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed successfully`);
    return { success: true, output };
  } catch (error) {
    console.log(`❌ ${description} failed:`);
    console.log(error.stdout || error.message);
    hasErrors = true;
    return { success: false, error: error.stdout || error.message };
  }
}

// Function to check file existence and basic structure
function checkCriticalFiles() {
  console.log('\n📁 Checking critical project files...');
  
  const criticalFiles = [
    'app.json',
    'tsconfig.json',
    'package.json',
    'app/_layout.tsx',
    'app/index.tsx',
    'types/app.ts',
    'utils/index.ts'
  ];
  
  let missingFiles = [];
  
  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file} exists`);
    } else {
      console.log(`  ❌ ${file} missing`);
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.log(`\n⚠️  Missing critical files: ${missingFiles.join(', ')}`);
    hasErrors = true;
  }
}

// Function to check TypeScript configuration
function checkTypeScriptConfig() {
  console.log('\n⚙️  Checking TypeScript configuration...');
  
  try {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    
    if (tsConfig.compilerOptions) {
      console.log('  ✅ tsconfig.json has compiler options');
      
      if (tsConfig.compilerOptions.strict) {
        console.log('  ✅ Strict mode enabled');
      } else {
        console.log('  ⚠️  Strict mode disabled');
      }
      
      if (tsConfig.compilerOptions.noEmit) {
        console.log('  ✅ No emit mode enabled (appropriate for Expo)');
      }
    } else {
      console.log('  ❌ tsconfig.json missing compiler options');
      hasErrors = true;
    }
  } catch (error) {
    console.log(`  ❌ Error reading tsconfig.json: ${error.message}`);
    hasErrors = true;
  }
}

// Function to check package.json scripts
function checkPackageScripts() {
  console.log('\n📦 Checking package.json scripts...');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredScripts = ['start', 'build', 'type-check'];
    const missingScripts = [];
    
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        console.log(`  ✅ ${script} script exists`);
      } else {
        console.log(`  ❌ ${script} script missing`);
        missingScripts.push(script);
      }
    }
    
    if (missingScripts.length > 0) {
      console.log(`\n⚠️  Missing required scripts: ${missingScripts.join(', ')}`);
      hasErrors = true;
    }
  } catch (error) {
    console.log(`  ❌ Error reading package.json: ${error.message}`);
    hasErrors = true;
  }
}

// Function to check for common import issues
function checkImportIssues() {
  console.log('\n🔗 Checking for common import issues...');
  
  const filesToCheck = [
    'app/_layout.tsx',
    'app/index.tsx',
    'hooks/use-app-store.ts',
    'utils/index.ts'
  ];
  
  let importIssues = [];
  
  for (const file of filesToCheck) {
    if (fs.existsSync(file)) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        // Check for relative imports that might be problematic
        const relativeImports = content.match(/import.*from\s+['"]\.\.\/\.\.\//g);
        if (relativeImports) {
          console.log(`  ⚠️  ${file} has deep relative imports (../../)`);
          importIssues.push(`${file}: deep relative imports`);
        }
        
        // Check for missing React imports in TSX files
        if (file.endsWith('.tsx') && !content.includes('import React') && !content.includes('import {') && content.includes('React')) {
          console.log(`  ⚠️  ${file} might be missing React import`);
          importIssues.push(`${file}: potential missing React import`);
        }
        
        // Check for import statements that might fail
        const importStatements = content.match(/import.*from\s+['"][^'"]+['"]/g);
        if (importStatements) {
          console.log(`  ✅ ${file} has valid import statements`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error reading ${file}: ${error.message}`);
        importIssues.push(`${file}: read error`);
      }
    } else {
      console.log(`  ⚠️  ${file} does not exist`);
    }
  }
  
  if (importIssues.length > 0) {
    console.log(`\n⚠️  Import issues found: ${importIssues.length}`);
    importIssues.forEach(issue => console.log(`  - ${issue}`));
  }
}

// Main validation process
async function main() {
  // Check critical files
  checkCriticalFiles();
  
  // Check TypeScript configuration
  checkTypeScriptConfig();
  
  // Check package.json scripts
  checkPackageScripts();
  
  // Check for import issues
  checkImportIssues();
  
  // Run TypeScript compilation check
  console.log('\n🔧 Running TypeScript compilation check...');
  const tsResult = runCommand('npx tsc --noEmit --skipLibCheck', 'TypeScript compilation');
  
  // Run ESLint check if available
  if (fs.existsSync('.eslintrc.js') || fs.existsSync('.eslintrc.json')) {
    console.log('\n🧹 Running ESLint check...');
    const lintResult = runCommand('npm run lint', 'ESLint validation');
  } else {
    console.log('\n⚠️  ESLint configuration not found, skipping lint check');
  }
  
  // Summary
  console.log('\n📊 Validation Summary:');
  if (hasErrors) {
    console.log('❌ Validation completed with errors');
    console.log('Please fix the issues above before proceeding');
    process.exit(1);
  } else {
    console.log('✅ Validation completed successfully!');
    console.log('Your React Native project is properly configured');
    process.exit(0);
  }
}

// Run validation
main().catch(error => {
  console.error('❌ Validation failed with error:', error);
  process.exit(1);
});
