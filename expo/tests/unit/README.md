# Test Files Directory

This directory contains all the test files that were previously scattered throughout the root directory of the project.

## Test Files Overview

The following test files have been organized here:

### API Tests
- `api-test.js` - Google Places API testing
- `api-test-direct.js` - Direct API testing

### Core System Tests
- `test-ai-project-agent.js` - AI project management agent testing
- `test-app-provider.js` - App provider testing
- `test-migration.js` - Migration system testing
- `test-reorganized-structure.js` - Structure reorganization testing

### Filtering System Tests
- `test-bulk-filtering.js` - Bulk filtering functionality
- `test-category-config.js` - Category configuration
- `test-critical-fixes.js` - Critical fixes validation
- `test-discovery-logic.js` - Place discovery logic
- `test-enhanced-filters.js` - Enhanced filtering system
- `test-error-free-filters.js` - Error-free filtering
- `test-refactored-filtering.js` - Refactored filtering
- `test-unified-filtering-system.js` - Unified filtering system
- `test-server-filtering.js` - Server-side filtering
- `test-social-config.js` - Social context configuration

### Firebase & Backend Tests
- `test-firebase-admin.js` - Firebase admin functionality
- `test-firebase-admin-quick.js` - Quick Firebase admin tests
- `test-firebase-cache-system.js` - Firebase cache system
- `test-firebase-function.js` - Firebase functions
- `test-gemini-functions.js` - Gemini AI functions

### Frontend & UI Tests
- `test-frontend-enhancements.js` - Frontend improvements
- `test-loading-screens.js` - Loading screen functionality
- `test-error-boundaries.js` - Error boundary components
- `test-hook-order-fix.js` - Hook order fixes

### Mood & Context Tests
- `test-entity-enhanced-mood.js` - Enhanced mood system
- `test-mood-config.js` - Mood configuration
- `test-mood-system.js` - Mood system functionality

### NLP Service Tests
- `test-nlp-service.js` - Basic NLP service
- `test-nlp-service-debug.js` - NLP service debugging
- `test-nlp-service-detailed.js` - Detailed NLP testing
- `test-nlp-service-integration.js` - NLP service integration

### Integration & Feature Tests
- `test-google-api-clients.js` - Google API client integration
- `test-photo-contact-enhancement.js` - Photo and contact features
- `test-saved-places-integration.js` - Saved places functionality
- `test-scraping-system.js` - Web scraping system
- `test-monetization-system.js` - Monetization features

## Organization Benefits

Moving these test files to a dedicated `__tests__` directory provides:

1. **Cleaner root directory** - Easier to navigate the main project
2. **Better organization** - All tests are grouped together
3. **Easier maintenance** - Test files are easier to find and manage
4. **Standard practice** - Follows common testing directory conventions

## Running Tests

To run these tests, navigate to the root directory and execute the desired test file:

```bash
cd /path/to/g-decider-app
node __tests__/test-filename.js
```

## Notes

- These are primarily Node.js test files
- Some may require specific environment setup or dependencies
- Consider adding a proper testing framework (Jest, Mocha, etc.) for better test organization
