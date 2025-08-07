# Filter Configurations

This directory contains all filter-related configurations for the G-Decider app. The filters are organized in a centralized location for better maintainability and discoverability.

## Structure

```
utils/filters/
├── README.md                          # This documentation file
├── index.ts                           # Main exports for all filter configurations
├── mood-config.ts                     # Mood filter configuration
├── budget-config.ts                   # Budget filter configuration
├── time-config.ts                     # Time of day filter configuration
├── distance-config.ts                 # Distance filter configuration
├── social-config.ts                   # Social context filter configuration
├── category-config.ts                 # Category filter configuration
├── filter-logger.ts                   # Filter logging utilities
├── filter-api-bridge.ts               # API integration for filters
├── filter-validation-service.ts       # Filter validation services
├── filtering-progress.ts              # Filtering progress tracking
├── enhanced-filtering-with-cache.ts   # Enhanced filtering with caching
└── server-filtering-service.ts        # Server-side filtering service
```

## Filter Types

### 1. Mood Filter (`mood-config.ts`)
- **Purpose**: Manages user mood preferences (chill, neutral, hype)
- **Key Exports**: `MOOD_CATEGORIES`, `MoodUtils`
- **Usage**: Used in mood slider, place filtering, and AI descriptions

### 2. Budget Filter (`budget-config.ts`)
- **Purpose**: Manages budget preferences (P, PP, PPP)
- **Key Exports**: `BUDGET_CATEGORIES`, `BudgetUtils`, `BUDGET_PRICE_MAPPING`
- **Usage**: Used in budget selection, price filtering, and place recommendations

### 3. Time Filter (`time-config.ts`)
- **Purpose**: Manages time of day preferences (morning, afternoon, night)
- **Key Exports**: `TIME_CATEGORIES`, `TimeUtils`
- **Usage**: Used in time selection, opening hours filtering, and activity suggestions

### 4. Distance Filter (`distance-config.ts`)
- **Purpose**: Manages distance preferences (very close to far)
- **Key Exports**: `DISTANCE_CATEGORIES`, `DistanceUtils`
- **Usage**: Used in radius calculations, location-based filtering, and discovery logic

### 5. Social Context Filter (`social-config.ts`)
- **Purpose**: Manages social context preferences (solo, with-bae, barkada)
- **Key Exports**: `SOCIAL_CONTEXTS`, `SocialUtils`
- **Usage**: Used in group size filtering, place compatibility, and activity suggestions

### 6. Category Filter (`category-config.ts`)
- **Purpose**: Manages category preferences (food, activity, something-new)
- **Key Exports**: `CATEGORY_FILTERS`, `CategoryUtils`
- **Usage**: Used in category selection, place type filtering, and discovery logic

## Filter Utilities & Services

### 1. Filter Logger (`filter-logger.ts`)
- **Purpose**: Provides logging utilities for filter changes and debugging
- **Key Exports**: `getFilterSummary`, `logFilterChange`
- **Usage**: Used throughout the app to track filter state changes

### 2. Filter API Bridge (`filter-api-bridge.ts`)
- **Purpose**: Bridges filter configurations with API calls
- **Key Exports**: `FilterApiBridge`
- **Usage**: Used to prepare filter data for API requests

### 3. Filter Validation Service (`filter-validation-service.ts`)
- **Purpose**: Validates filter configurations and combinations
- **Key Exports**: `FilterValidationService`, `filterValidationService`
- **Usage**: Used to ensure filter data integrity

### 4. Filtering Progress (`filtering-progress.ts`)
- **Purpose**: Tracks progress during filtering operations
- **Key Exports**: `FILTERING_STEPS`, `updateFilteringProgress`
- **Usage**: Used to show progress indicators during filtering

### 5. Enhanced Filtering with Cache (`enhanced-filtering-with-cache.ts`)
- **Purpose**: Provides caching layer for filtering operations
- **Key Exports**: `enhancedFilterWithCache`
- **Usage**: Used to optimize filtering performance with caching

### 6. Server Filtering Service (`server-filtering-service.ts`)
- **Purpose**: Handles server-side filtering operations
- **Key Exports**: `ServerFilteringService`, `serverFilteringService`
- **Usage**: Used for server-side place filtering and data processing

## Import Patterns

### Direct Import (Recommended)
```typescript
import { MoodUtils, MOOD_CATEGORIES } from '@/utils/filters/mood-config';
import { BudgetUtils, BUDGET_CATEGORIES } from '@/utils/filters/budget-config';
```

### Centralized Import (Alternative)
```typescript
import { MoodUtils, BudgetUtils } from '@/utils/filters';
```

### Backward Compatibility
```typescript
// These still work for existing code
import { MoodUtils } from '@/utils/mood-config';
import { BudgetUtils } from '@/utils/budget-config';
```

## Common Patterns

Each filter configuration follows a consistent pattern:

1. **Interface Definition**: TypeScript interfaces for filter data structures
2. **Configuration Constants**: Arrays and objects defining filter options
3. **Utility Class**: Static methods for filter operations
4. **Backward Compatibility**: Individual function exports for legacy code

### Example Structure
```typescript
// 1. Interface
export interface FilterCategory {
  id: string;
  label: string;
  // ... other properties
}

// 2. Configuration
export const FILTER_CATEGORIES: FilterCategory[] = [
  // ... filter definitions
];

// 3. Utility Class
export class FilterUtils {
  static getCategory(id: string): FilterCategory | undefined { /* ... */ }
  static validateValue(value: any): boolean { /* ... */ }
  // ... other utility methods
}

// 4. Backward Compatibility
export const getCategory = FilterUtils.getCategory;
export const validateValue = FilterUtils.validateValue;
```

## Migration Notes

- All filter configurations have been moved from `utils/` to `utils/filters/`
- Backward compatibility files exist in the original `utils/` location
- Import statements have been updated throughout the codebase
- The `index.ts` file provides centralized exports for convenience

## Best Practices

1. **Use Direct Imports**: Import specific configurations directly for better tree-shaking
2. **Follow Naming Conventions**: Use consistent naming patterns across all filters
3. **Maintain Backward Compatibility**: Keep backward compatibility exports for existing code
4. **Document Changes**: Update this README when adding new filters or changing existing ones
5. **Test Thoroughly**: Ensure all filter configurations work correctly after changes

## Adding New Filters

To add a new filter:

1. Create a new configuration file following the established pattern
2. Add exports to `utils/filters/index.ts`
3. Create a backward compatibility file in `utils/`
4. Update this README with documentation
5. Test the new filter thoroughly

## Related Files

- `utils/filter-logger.ts` - Logging utilities for filter changes
- `utils/filter-api-bridge.ts` - API integration for filters
- `utils/place-discovery-logic.ts` - Discovery logic using filters
- `components/` - UI components that use filter configurations
- `hooks/` - Custom hooks that integrate with filter configurations 