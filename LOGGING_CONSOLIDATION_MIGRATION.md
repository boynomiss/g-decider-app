# Logging System Consolidation Migration Guide

## Overview

All logging systems have been consolidated into a single `ConsolidatedFilterLogger` class in `utils/filtering/filter-logger.ts`. This replaces the previous separate implementations:

- ✅ **Dynamic logging** (from `filter-logger.ts`)
- ✅ **Static FilterLogger class** (from `filter-utils.ts`) 
- ✅ **Progress tracking** (from `filter-utilities.ts`)

## What Changed

### 1. New Consolidated Logger

The `ConsolidatedFilterLogger` class now provides all logging functionality:

```typescript
import { ConsolidatedFilterLogger } from '../utils/filtering/filter-logger';

const logger = ConsolidatedFilterLogger.getInstance();

// Dynamic logging
logger.logFilterChange(previousFilters, newFilters, changedField);
logger.generateDynamicSearchQuery(filters);

// Static logging
logger.info('category', 'message', data);
logger.warn('category', 'message', data);
logger.error('category', 'message', data);
logger.debug('category', 'message', data);

// Progress tracking
const trackerId = logger.startProgress('operation', 'message');
logger.updateProgress(trackerId, 50, 'Halfway done');
logger.completeProgress(trackerId, 'Completed');
```

### 2. Updated Hook

The `useDynamicFilterLogger` hook now includes progress tracking:

```typescript
import { useDynamicFilterLogger } from '../hooks/use-dynamic-filter-logger';

const {
  logFilterChange,
  getSearchPreview,
  generateSearchQuery,
  getChangeHistory,
  getQueryHistory,
  enableDebugLogging,
  startProgress,
  updateProgress,
  completeProgress,
  getActiveProgress
} = useDynamicFilterLogger();
```

### 3. Legacy Support

For backward compatibility, the old class names are still exported:

```typescript
// These still work but are deprecated
import { DynamicFilterLogger, FilterLogger } from '../utils/filtering/filter-logger';
```

## Migration Steps

### 1. Update Imports

Replace:
```typescript
import { DynamicFilterLogger } from '../utils/filtering/filter-logger';
```

With:
```typescript
import { ConsolidatedFilterLogger } from '../utils/filtering/filter-logger';
```

### 2. Update Logger Instantiation

Replace:
```typescript
const logger = DynamicFilterLogger.getInstance();
```

With:
```typescript
const logger = ConsolidatedFilterLogger.getInstance();
```

### 3. Add Progress Tracking (Optional)

If you need progress tracking, use the new methods:

```typescript
const trackerId = logger.startProgress('filter-update', 'Updating filters...');
// ... do work ...
logger.updateProgress(trackerId, 50, 'Processing...');
// ... do more work ...
logger.completeProgress(trackerId, 'Filters updated successfully');
```

### 4. Update Hook Usage

If using the hook, you now have access to progress tracking:

```typescript
const { startProgress, updateProgress, completeProgress } = useDynamicFilterLogger();

const trackerId = startProgress('search', 'Searching for places...');
// ... perform search ...
updateProgress(trackerId, 75, 'Found 15 places');
completeProgress(trackerId, 'Search completed');
```

## New Features

### 1. Enhanced Debug Mode

```typescript
logger.setDebugMode(true); // Enable debug logging
logger.debug('category', 'Debug message', data);
```

### 2. Progress Tracking

```typescript
// Start tracking
const trackerId = logger.startProgress('operation', 'Starting...');

// Update progress
logger.updateProgress(trackerId, 25, 'Quarter done');
logger.updateProgress(trackerId, 50, 'Halfway');
logger.updateProgress(trackerId, 75, 'Almost done');

// Complete or fail
logger.completeProgress(trackerId, 'Success!');
// or
logger.failProgress(trackerId, 'Something went wrong');
```

### 3. Log Management

```typescript
// Get all logs
const logs = logger.getLogs();

// Get logs by level
const errors = logger.getLogsByLevel('error');

// Get logs by category
const filterLogs = logger.getLogsByCategory('filter-change');

// Clear logs
logger.clearLogs();
```

## Benefits

1. **Single Source of Truth**: All logging goes through one system
2. **Consistent Interface**: Same methods for all logging needs
3. **Better Performance**: Reduced code duplication
4. **Enhanced Features**: Progress tracking, debug mode, log management
5. **Backward Compatibility**: Old code still works with deprecation warnings

## Deprecation Timeline

- **Phase 1** (Current): Legacy classes still work with warnings
- **Phase 2** (Next Release): Legacy classes will be removed
- **Phase 3** (Future): Only `ConsolidatedFilterLogger` will be available

## Examples

### Basic Filter Change Logging

```typescript
const logger = ConsolidatedFilterLogger.getInstance();

logger.logFilterChange(
  { category: 'food', mood: 50 },
  { category: 'food', mood: 80 },
  'mood'
);
```

### Progress Tracking for Search

```typescript
const logger = ConsolidatedFilterLogger.getInstance();

const trackerId = logger.startProgress('place-search', 'Searching for places...');

try {
  // Simulate search steps
  logger.updateProgress(trackerId, 25, 'Fetching nearby places...');
  await fetchNearbyPlaces();
  
  logger.updateProgress(trackerId, 50, 'Filtering by criteria...');
  await filterPlaces();
  
  logger.updateProgress(trackerId, 75, 'Ranking results...');
  await rankResults();
  
  logger.completeProgress(trackerId, 'Found 12 matching places');
} catch (error) {
  logger.failProgress(trackerId, `Search failed: ${error.message}`);
}
```

### Debug Logging

```typescript
const logger = ConsolidatedFilterLogger.getInstance();
logger.setDebugMode(true);

logger.debug('filter', 'Filter state updated', { filters, timestamp: Date.now() });
```

This consolidation provides a cleaner, more maintainable logging system while preserving all existing functionality and adding new capabilities. 