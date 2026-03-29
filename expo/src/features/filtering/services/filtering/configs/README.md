# Filter Configurations

This directory contains all filter-related configurations for the G-Decider app. The filters are organized in a centralized location for better maintainability and discoverability.

## Structure

```
utils/filtering/configs/
├── README.md                          # This documentation file
├── index.ts                           # Main exports for all filter configurations
├── filter-foundation.ts               # Shared types and utilities (NEW)
├── FILTER_FOUNDATION_GUIDE.md        # Guide for using the foundation (NEW)
├── mood-config.ts                     # Mood filter configuration
├── budget-config.ts                   # Budget filter configuration
├── category-config.ts                 # Category filter configuration
├── time-config.ts                     # Time of day filter configuration
├── distance-config.ts                 # Distance filter configuration
├── social-config.ts                   # Social context filter configuration
├── filter-logger.ts                   # Filter logging utilities (in parent directory)
├── filter-api-service.ts              # API integration for filters (in parent directory)
├── unified-filter-service.ts          # Unified filtering service (in parent directory)
├── unified-filtering-system.ts        # Unified filtering system (in parent directory)
└── filter-core-utils.ts               # Core filter utilities (in parent directory)
```

## Filter Foundation (NEW)

### Shared Types and Utilities (`filter-foundation.ts`)
- **Purpose**: Provides shared interfaces and utility classes to reduce code duplication
- **Key Features**: 
  - Base interfaces for different filter types
  - Utility classes with common functionality
  - Type-safe filter value definitions
  - Common filter operations and validation
- **Usage**: Extended by all filter configurations to inherit common functionality
- **Guide**: See `FILTER_FOUNDATION_GUIDE.md` for detailed usage instructions

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
- **Key Exports**: `FilterLogger`, `getFilterSummary`, `logFilterChange`
- **Usage**: Used throughout the app to track filter state changes

### 2. Filter API Service (`filter-api-service.ts`)
- **Purpose**: Handles API integration for filter operations
- **Key Exports**: `FilterAPIService`, `filterAPIService`
- **Usage**: Used to prepare filter data for API requests

### 3. Unified Filter Service (`unified-filter-service.ts`)
- **Purpose**: Provides unified filtering operations with caching
- **Key Exports**: `UnifiedFilterService`, `unifiedFilterService`
- **Usage**: Used for optimized filtering with caching and validation

### 4. Unified Filtering System (`unified-filtering-system.ts`)
- **Purpose**: Main entry point for the unified filtering system
- **Key Exports**: `unifiedFilterService`, `FilterUtilities`
- **Usage**: Used as the primary interface for all filtering operations

### 5. Filter Core Utils (`filter-core-utils.ts`)
- **Purpose**: Core utility functions for filter operations
- **Key Exports**: `FilterCoreUtils`, `filterCoreUtils`
- **Usage**: Used for common filter operations and utilities

## Import Patterns

### Direct Import (Recommended)
```typescript
import { MoodUtils, MOOD_CATEGORIES } from '@/utils/filtering/configs/mood-config';
import { BudgetUtils, BUDGET_CATEGORIES } from '@/utils/filtering/configs/budget-config';
```

### Centralized Import (Alternative)
```typescript
import { MoodUtils, BudgetUtils } from '@/utils/filtering/configs';
```

### Foundation Import (NEW)
```typescript
import { 
  BaseFilterUtils, 
  FilterWithDisplay, 
  MoodValue, 
  BudgetValue 
} from '@/utils/filtering/configs/filter-foundation';
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

### Example Structure (Traditional)
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

### Example Structure (With Foundation - NEW)
```typescript
// 1. Interface extending foundation
export interface FilterCategory extends FilterWithDisplay {
  id: FilterValue;
  // ... only unique properties
}

// 2. Configuration
export const FILTER_CATEGORIES: readonly FilterCategory[] = [
  // ... filter definitions with all foundation properties
];

// 3. Utility Class extending foundation
export class FilterUtils extends DisplayFilterUtils<FilterCategory> {
  protected categories = FILTER_CATEGORIES;
  
  // Only implement unique methods
  static uniqueMethod(): void { /* ... */ }
}

// 4. Singleton for backward compatibility
export const filterUtils = new FilterUtils();
export const getCategory = filterUtils.getCategory.bind(filterUtils);
export const validateValue = filterUtils.validateValue.bind(filterUtils);
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

### Traditional Approach
1. Create a new configuration file following the established pattern
2. Add exports to `utils/filtering/configs/index.ts`
3. Create a backward compatibility file in `utils/`
4. Update this README with documentation
5. Test the new filter thoroughly

### Foundation Approach (Recommended)
1. Choose the appropriate foundation interface (`BaseFilterCategory`, `FilterWithPlaceTypes`, etc.)
2. Create a new configuration file that extends the foundation
3. Extend the appropriate utility class (`BaseFilterUtils`, `DisplayFilterUtils`, etc.)
4. Add exports to `utils/filtering/configs/index.ts`
5. Create a singleton instance for backward compatibility
6. Update this README with documentation
7. Test the new filter thoroughly

See `FILTER_FOUNDATION_GUIDE.md` for detailed instructions.

## Related Files

- `utils/filtering/filter-logger.ts` - Logging utilities for filter changes
- `utils/filtering/filter-api-service.ts` - API integration for filters
- `utils/place-discovery-logic.ts` - Discovery logic using filters
- `components/` - UI components that use filter configurations
- `hooks/` - Custom hooks that integrate with filter configurations 