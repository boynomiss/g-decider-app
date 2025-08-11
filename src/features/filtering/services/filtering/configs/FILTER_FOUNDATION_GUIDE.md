# Filter Foundation Guide

This guide explains how to use the shared filter foundation to reduce code duplication and improve maintainability across all filter configurations.

## Overview

The filter foundation provides a set of shared interfaces and utility classes that eliminate repetitive code patterns across different filter configurations. Instead of duplicating common functionality, each filter can extend the appropriate base classes and focus on their unique features.

## Architecture

### Base Interfaces

The foundation provides a hierarchy of interfaces that build upon each other:

```typescript
BaseFilterCategory (id, label, description)
    ↓
FilterWithPlaceTypes (+ preferredPlaceTypes)
    ↓
FilterWithCompatibility (+ moodCompatibility, socialCompatibility, etc.)
    ↓
FilterWithActivities (+ activitySuggestions, atmosphereKeywords)
    ↓
FilterWithDisplay (+ icon, display)
```

### Base Utility Classes

Corresponding utility classes provide common functionality:

```typescript
BaseFilterUtils<T extends BaseFilterCategory>
    ↓
PlaceTypeFilterUtils<T extends FilterWithPlaceTypes>
    ↓
CompatibilityFilterUtils<T extends FilterWithCompatibility>
    ↓
ActivityFilterUtils<T extends FilterWithActivities>
    ↓
DisplayFilterUtils<T extends FilterWithDisplay>
```

## Migration Guide

### Step 1: Choose the Right Interface

Determine which interface your filter needs:

- **Basic filters** (distance, time): Use `BaseFilterCategory`
- **Filters with place types** (budget): Use `FilterWithPlaceTypes`
- **Filters with compatibility** (category, social): Use `FilterWithCompatibility`
- **Filters with activities** (mood, category): Use `FilterWithActivities`
- **Filters with display** (all): Use `FilterWithDisplay`

### Step 2: Update Your Interface

Replace your existing interface with one that extends the foundation:

```typescript
// Before
export interface BudgetCategory {
  id: 'P' | 'PP' | 'PPP';
  display: string;
  label: string;
  priceRange: { min: number; max: number };
  googlePriceLevel: number;
  description: string;
  preferredPlaceTypes: string[];
}

// After
export interface BudgetCategory extends FilterWithDisplay {
  id: BudgetValue; // Use the shared type
  display: string;
  priceRange: { min: number; max: number };
  googlePriceLevel: number;
}
```

### Step 3: Update Your Utility Class

Extend the appropriate base utility class:

```typescript
// Before
export class BudgetUtils {
  static getBudgetCategory(budgetId: string | null): BudgetCategory | undefined {
    if (!budgetId) return undefined;
    return BUDGET_CATEGORIES.find(category => category.id === budgetId);
  }
  
  static getBudgetLabel(budget: string | null): string {
    if (!budget) return 'not-set';
    const category = this.getBudgetCategory(budget);
    return category ? category.label : 'not-set';
  }
  
  // ... many more repetitive methods
}

// After
export class BudgetUtils extends DisplayFilterUtils<BudgetCategory> {
  protected categories = BUDGET_CATEGORIES;
  
  // Only implement unique methods
  static filterByBudget(places: any[], budget: string | null): any[] {
    // Budget-specific filtering logic
  }
  
  static getBudgetContext(budget: string | null): string {
    // Budget-specific context logic
  }
}
```

### Step 4: Create Singleton Instance

Create a singleton instance for backward compatibility:

```typescript
// Create singleton instance
export const budgetUtils = new BudgetUtils();

// Export utility functions for backward compatibility
export const getBudgetCategory = budgetUtils.getCategory.bind(budgetUtils);
export const getBudgetLabel = budgetUtils.getLabel.bind(budgetUtils);
export const getBudgetDisplayText = budgetUtils.getDisplayText.bind(budgetUtils);
// ... etc
```

## Benefits

### 1. Reduced Code Duplication

**Before**: Each filter had ~200 lines of repetitive utility methods
**After**: Each filter has ~50 lines of unique logic + inherited functionality

### 2. Consistent API

All filters now have the same base methods:
- `getCategory(id)`
- `validateValue(value)`
- `getDisplayText(value)`
- `getLabel(value)`
- `getAllCategories()`
- `getCategoryMappings()`

### 3. Type Safety

Shared type definitions ensure consistency:
```typescript
export type MoodValue = 'chill' | 'neutral' | 'hype';
export type BudgetValue = 'P' | 'PP' | 'PPP';
export type SocialValue = 'solo' | 'with-bae' | 'barkada';
```

### 4. Easy Testing

Common functionality is tested once in the foundation, reducing test duplication.

## Examples

### Basic Filter (Distance)

```typescript
import { BaseFilterCategory, BaseFilterUtils } from './filter-foundation';

export interface DistanceCategory extends BaseFilterCategory {
  emoji: string;
  range: [number, number];
  distanceMeters: { min: number; max: number };
}

export class DistanceUtils extends BaseFilterUtils<DistanceCategory> {
  protected categories = DISTANCE_CATEGORIES;
  
  // Only implement distance-specific methods
  static getDistanceRadius(distanceRange: number | null): number {
    // Distance-specific logic
  }
}
```

### Advanced Filter (Mood)

```typescript
import { FilterWithActivities, ActivityFilterUtils } from './filter-foundation';

export interface MoodCategory extends FilterWithActivities {
  id: MoodValue;
  icon: string;
  scoreRange: { min: number; max: number };
  energyLevel: 'low' | 'medium' | 'high';
  colorScheme: string;
}

export class MoodUtils extends ActivityFilterUtils<MoodCategory> {
  protected categories = MOOD_CATEGORIES;
  
  // Only implement mood-specific methods
  static getMoodCategory(moodScore: number): MoodCategory | undefined {
    // Mood-specific logic
  }
}
```

## Common Patterns

### 1. Compatibility Checking

All filters with compatibility can now use the same methods:

```typescript
// Works for any filter with compatibility
categoryUtils.isCompatibleWithMood(categoryId, moodScore);
categoryUtils.isCompatibleWithSocialContext(categoryId, socialContext);
categoryUtils.isCompatibleWithBudget(categoryId, budget);
categoryUtils.isCompatibleWithTime(categoryId, timeOfDay);
```

### 2. Activity Suggestions

All filters with activities can provide suggestions:

```typescript
// Works for any filter with activities
moodUtils.getActivitySuggestions(moodScore);
categoryUtils.getActivitySuggestions(categoryId);
socialUtils.getActivitySuggestions(socialContext);
```

### 3. Atmosphere Keywords

All filters with activities can provide atmosphere keywords:

```typescript
// Works for any filter with activities
moodUtils.getAtmosphereKeywords(moodScore);
categoryUtils.getAtmosphereKeywords(categoryId);
socialUtils.getAtmosphereKeywords(socialContext);
```

## Migration Checklist

- [ ] Choose appropriate interface from foundation
- [ ] Update filter interface to extend foundation interface
- [ ] Update utility class to extend foundation utility class
- [ ] Remove duplicate methods that are now inherited
- [ ] Create singleton instance for backward compatibility
- [ ] Export backward compatibility functions
- [ ] Update imports to use shared types
- [ ] Test that all existing functionality still works
- [ ] Update documentation

## Best Practices

### 1. Use the Most Specific Interface

Don't use `FilterWithDisplay` if you only need `FilterWithPlaceTypes`. Choose the most specific interface that meets your needs.

### 2. Keep Unique Logic in Static Methods

Static methods are for filter-specific logic that doesn't fit the common patterns.

### 3. Use Singleton Instances for Backward Compatibility

This ensures existing code continues to work while new code can use the more efficient class-based approach.

### 4. Leverage Type Safety

Use the shared type definitions (`MoodValue`, `BudgetValue`, etc.) instead of string literals.

### 5. Test Common Functionality Once

Since common functionality is inherited, test it once in the foundation rather than in each filter.

## Troubleshooting

### Common Issues

1. **Type Errors**: Make sure your interface extends the correct foundation interface
2. **Missing Methods**: Check that you're extending the right utility class
3. **Backward Compatibility**: Ensure all old function exports are properly bound to the singleton

### Debugging

Use the singleton instance for debugging:
```typescript
console.log(budgetUtils.getCategory('P')); // Direct access
console.log(budgetUtils.getAllCategories()); // All categories
```

## Future Enhancements

The foundation can be extended with:

1. **Filter Validation**: Common validation rules
2. **Filter Serialization**: Common serialization formats
3. **Filter Comparison**: Common comparison logic
4. **Filter Merging**: Common merging strategies
5. **Filter Analytics**: Common analytics tracking

This foundation provides a solid base for future filter enhancements while maintaining backward compatibility. 