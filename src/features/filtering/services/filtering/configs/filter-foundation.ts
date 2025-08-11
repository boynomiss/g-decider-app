// Filter Foundation - Shared types and utilities across all filter configurations
// This file provides common interfaces and base classes to reduce code duplication

// Base filter category interface
export interface BaseFilterCategory {
  id: string;
  label: string;
  description: string;
}

// Enhanced base interface for filters with place types
export interface FilterWithPlaceTypes extends BaseFilterCategory {
  preferredPlaceTypes: string[];
}

// Enhanced interface for filters with compatibility options
export interface FilterWithCompatibility extends FilterWithPlaceTypes {
  moodCompatibility?: ('chill' | 'neutral' | 'hype')[];
  socialCompatibility?: ('solo' | 'with-bae' | 'barkada')[];
  budgetPreferences?: ('P' | 'PP' | 'PPP')[];
  timeCompatibility?: ('morning' | 'afternoon' | 'night')[];
}

// Enhanced interface for filters with activity suggestions
export interface FilterWithActivities extends FilterWithCompatibility {
  activitySuggestions: string[];
  atmosphereKeywords: string[];
}

// Enhanced interface for filters with display properties
export interface FilterWithDisplay extends FilterWithActivities {
  icon?: string;
  display?: string;
}

// Base utility class for common filter operations
export abstract class BaseFilterUtils<T extends BaseFilterCategory> {
  protected abstract categories: readonly T[];
  
  /**
   * Get category from ID
   */
  getCategory(id: string | null): T | undefined {
    if (!id) return undefined;
    return this.categories.find(category => category.id === id);
  }
  
  /**
   * Validate value is within acceptable values
   */
  validateValue(value: string | null): boolean {
    if (!value) return true; // null is valid (no filter)
    return this.categories.some(category => category.id === value);
  }
  
  /**
   * Get display text for UI
   */
  getDisplayText(value: string | null): string {
    if (!value) return 'Not Set';
    const category = this.getCategory(value);
    return category ? category.label : 'Not Set';
  }
  
  /**
   * Get label for logging
   */
  getLabel(value: string | null): string {
    if (!value) return 'not-set';
    const category = this.getCategory(value);
    return category ? category.label.toLowerCase().replace(/\s+/g, '-') : 'not-set';
  }
  
  /**
   * Get all categories for UI rendering
   */
  getAllCategories(): T[] {
    return [...this.categories];
  }
  
  /**
   * Get category mappings for discovery logic
   */
  getCategoryMappings() {
    return this.categories.map(category => ({
      id: category.id,
      label: category.label,
      description: category.description
    }));
  }
}

// Enhanced utility class for filters with place types
export abstract class PlaceTypeFilterUtils<T extends FilterWithPlaceTypes> extends BaseFilterUtils<T> {
  /**
   * Get preferred place types for category
   */
  getPreferredPlaceTypes(categoryId: string | null): string[] {
    if (!categoryId) return [];
    const category = this.getCategory(categoryId);
    return category ? category.preferredPlaceTypes : [];
  }
  
  /**
   * Check if place is compatible with category
   */
  isPlaceCompatibleWithCategory(place: any, categoryId: string | null): boolean {
    if (!categoryId || !place.types) return true;
    
    const category = this.getCategory(categoryId);
    if (!category) return true;
    
    return place.types.some((type: string) => 
      category.preferredPlaceTypes.includes(type)
    );
  }
  
  /**
   * Get category mappings for API calls
   */
  getCategoryMappingsForAPI() {
    return this.categories.reduce((acc, category) => {
      acc[category.id] = category.preferredPlaceTypes;
      return acc;
    }, {} as Record<string, string[]>);
  }
}

// Enhanced utility class for filters with compatibility
export abstract class CompatibilityFilterUtils<T extends FilterWithCompatibility> extends PlaceTypeFilterUtils<T> {
  /**
   * Check if category is compatible with mood
   */
  isCompatibleWithMood(categoryId: string | null, mood: number): boolean {
    if (!categoryId || !this.hasMoodCompatibility()) return true;
    
    const category = this.getCategory(categoryId);
    if (!category || !category.moodCompatibility) return true;
    
    // Convert mood to category
    let moodCategory: 'chill' | 'neutral' | 'hype';
    if (mood <= 33.33) moodCategory = 'chill';
    else if (mood <= 66.66) moodCategory = 'neutral';
    else moodCategory = 'hype';
    
    return category.moodCompatibility.includes(moodCategory);
  }
  
  /**
   * Check if category is compatible with social context
   */
  isCompatibleWithSocialContext(categoryId: string | null, socialContext: string | null): boolean {
    if (!categoryId || !socialContext || !this.hasSocialCompatibility()) return true;
    
    const category = this.getCategory(categoryId);
    if (!category || !category.socialCompatibility) return true;
    
    return category.socialCompatibility.includes(socialContext as any);
  }
  
  /**
   * Check if category is compatible with budget
   */
  isCompatibleWithBudget(categoryId: string | null, budget: string | null): boolean {
    if (!categoryId || !budget || !this.hasBudgetPreferences()) return true;
    
    const category = this.getCategory(categoryId);
    if (!category || !category.budgetPreferences) return true;
    
    return category.budgetPreferences.includes(budget as any);
  }
  
  /**
   * Check if category is compatible with time
   */
  isCompatibleWithTime(categoryId: string | null, timeOfDay: string | null): boolean {
    if (!categoryId || !timeOfDay || !this.hasTimeCompatibility()) return true;
    
    const category = this.getCategory(categoryId);
    if (!category || !category.timeCompatibility) return true;
    
    return category.timeCompatibility.includes(timeOfDay as any);
  }
  
  // Helper methods to check if compatibility properties exist
  private hasMoodCompatibility(): boolean {
    return this.categories.some(cat => 'moodCompatibility' in cat);
  }
  
  private hasSocialCompatibility(): boolean {
    return this.categories.some(cat => 'socialCompatibility' in cat);
  }
  
  private hasBudgetPreferences(): boolean {
    return this.categories.some(cat => 'budgetPreferences' in cat);
  }
  
  private hasTimeCompatibility(): boolean {
    return this.categories.some(cat => 'timeCompatibility' in cat);
  }
}

// Enhanced utility class for filters with activities
export abstract class ActivityFilterUtils<T extends FilterWithActivities> extends CompatibilityFilterUtils<T> {
  /**
   * Get activity suggestions for category
   */
  getActivitySuggestions(categoryId: string | null): string[] {
    if (!categoryId) return [];
    const category = this.getCategory(categoryId);
    return category ? category.activitySuggestions : [];
  }
  
  /**
   * Get atmosphere keywords for category
   */
  getAtmosphereKeywords(categoryId: string | null): string[] {
    if (!categoryId) return [];
    const category = this.getCategory(categoryId);
    return category ? category.atmosphereKeywords : [];
  }
}

// Enhanced utility class for filters with display properties
export abstract class DisplayFilterUtils<T extends FilterWithDisplay> extends ActivityFilterUtils<T> {
  /**
   * Get display text with icon/display symbol
   */
  getDisplayTextWithIcon(value: string | null): string {
    if (!value) return 'Not Set';
    const category = this.getCategory(value);
    if (!category) return 'Not Set';
    
    if (category.icon && category.display) {
      return `${category.icon} ${category.display} ${category.label}`;
    } else if (category.icon) {
      return `${category.icon} ${category.label}`;
    } else if (category.display) {
      return `${category.display} ${category.label}`;
    }
    
    return category.label;
  }
}

// Common type definitions for filter values
export type MoodValue = 'chill' | 'neutral' | 'hype';
export type BudgetValue = 'P' | 'PP' | 'PPP';
export type SocialValue = 'solo' | 'with-bae' | 'barkada';
export type TimeValue = 'morning' | 'afternoon' | 'night';
export type CategoryValue = 'food' | 'activity' | 'something-new';

// Common filter context types
export interface FilterContext {
  mood?: number;
  budget?: string;
  socialContext?: string;
  timeOfDay?: string;
  category?: string;
  distance?: number;
}

// Common filter result types
export interface FilterResult<T = any> {
  places: T[];
  appliedFilters: FilterContext;
  totalResults: number;
  filterSummary: string;
}

// Common filter validation types
export interface FilterValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Utility functions for common filter operations
export class CommonFilterUtils {
  /**
   * Create a filter summary string
   */
  static createFilterSummary(context: FilterContext): string {
    const parts: string[] = [];
    
    if (context.mood !== undefined) {
      parts.push(`Mood: ${context.mood}`);
    }
    if (context.budget) {
      parts.push(`Budget: ${context.budget}`);
    }
    if (context.socialContext) {
      parts.push(`Social: ${context.socialContext}`);
    }
    if (context.timeOfDay) {
      parts.push(`Time: ${context.timeOfDay}`);
    }
    if (context.category) {
      parts.push(`Category: ${context.category}`);
    }
    if (context.distance !== undefined) {
      parts.push(`Distance: ${context.distance}%`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No filters applied';
  }
  
  /**
   * Validate filter context
   */
  static validateFilterContext(context: FilterContext): FilterValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (context.mood !== undefined && (context.mood < 0 || context.mood > 100)) {
      errors.push('Mood must be between 0 and 100');
    }
    
    if (context.distance !== undefined && (context.distance < 0 || context.distance > 100)) {
      errors.push('Distance must be between 0 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Merge filter contexts
   */
  static mergeFilterContexts(...contexts: FilterContext[]): FilterContext {
    return contexts.reduce((merged, context) => ({
      ...merged,
      ...context
    }), {} as FilterContext);
  }
} 