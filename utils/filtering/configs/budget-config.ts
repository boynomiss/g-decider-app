// Budget Configuration - Consolidated Settings
// This file contains all budget-related configurations used across the application

export interface BudgetCategory {
  id: 'P' | 'PP' | 'PPP';
  display: string;
  label: string;
  priceRange: { min: number; max: number };
  googlePriceLevel: number;
  description: string;
  preferredPlaceTypes: string[];
}

// Single consolidated budget configuration
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  { 
    id: 'P', 
    display: '₱',
    label: 'Budget-Friendly',
    priceRange: { min: 0, max: 500 },
    googlePriceLevel: 1,
    description: 'Affordable dining and activities',
    preferredPlaceTypes: ['cafe', 'bakery', 'food', 'meal_takeaway', 'convenience_store', 'supermarket']
  },
  { 
    id: 'PP', 
    display: '₱₱',
    label: 'Moderate',
    priceRange: { min: 500, max: 1500 },
    googlePriceLevel: 2,
    description: 'Mid-range dining and experiences',
    preferredPlaceTypes: ['restaurant', 'cafe', 'bar', 'movie_theater', 'museum', 'art_gallery']
  },
  { 
    id: 'PPP', 
    display: '₱₱₱',
    label: 'Premium',
    priceRange: { min: 1500, max: 5000 },
    googlePriceLevel: 3,
    description: 'High-end dining and luxury experiences',
    preferredPlaceTypes: ['restaurant', 'bar', 'night_club', 'spa', 'casino', 'hotel']
  }
] as const;

// Budget to Google Places price_level mapping for backend filtering
export const BUDGET_PRICE_MAPPING: Record<string, number[]> = {
  'P': [0, 1, 2],    // Budget-Friendly: 0-2
  'PP': [3],         // Moderate: 3  
  'PPP': [4]         // Premium: 4
} as const;

// Utility functions for budget calculations
export class BudgetUtils {
  /**
   * Get budget category from budget ID
   */
  static getBudgetCategory(budgetId: string | null): BudgetCategory | undefined {
    if (!budgetId) return undefined;
    return BUDGET_CATEGORIES.find(category => category.id === budgetId);
  }

  /**
   * Filter places by budget (price level)
   */
  static filterByBudget(places: any[], budget: string | null): any[] {
    if (!budget || !BUDGET_PRICE_MAPPING[budget as keyof typeof BUDGET_PRICE_MAPPING]) {
      return places;
    }
    
    const allowedPriceLevels = BUDGET_PRICE_MAPPING[budget as keyof typeof BUDGET_PRICE_MAPPING];
    if (!allowedPriceLevels) {
      return places;
    }
    
    return places.filter((place: any) => {
      // If no price level data, include in budget-friendly results
      if (place.price_level === undefined || place.price_level === null) {
        return budget === 'P'; // Only include in budget-friendly
      }
      
      return allowedPriceLevels.includes(place.price_level as number);
    });
  }

  /**
   * Get budget label for logging
   */
  static getBudgetLabel(budget: string | null): string {
    if (!budget) return 'not-set';
    const category = this.getBudgetCategory(budget);
    return category ? category.label : 'not-set';
  }

  /**
   * Get budget display text with icon
   */
  static getBudgetDisplayText(budget: string | null): string {
    if (!budget) return 'Not Set';
    const category = this.getBudgetCategory(budget);
    return category ? `${category.display} ${category.label}` : 'Not Set';
  }

  /**
   * Get preferred place types for budget level
   */
  static getPreferredPlaceTypes(budget: string | null): string[] {
    if (!budget) return [];
    const category = this.getBudgetCategory(budget);
    return category ? category.preferredPlaceTypes : [];
  }

  /**
   * Validate budget is within acceptable values
   */
  static validateBudget(budget: string | null): boolean {
    if (!budget) return true; // null is valid (no filter)
    return BUDGET_CATEGORIES.some(category => category.id === budget);
  }

  /**
   * Get all budget categories for UI rendering
   */
  static getAllBudgetCategories(): BudgetCategory[] {
    return [...BUDGET_CATEGORIES];
  }

  /**
   * Get budget mappings for discovery logic
   */
  static getBudgetMappings() {
    return BUDGET_CATEGORIES.map(category => ({
      id: category.id,
      label: category.label,
      description: category.description,
      preferredTypes: category.preferredPlaceTypes,
      priceRange: category.priceRange,
      googlePriceLevel: category.googlePriceLevel
    }));
  }

  /**
   * Get budget price mapping for API calls
   */
  static getBudgetPriceMapping() {
    return BUDGET_PRICE_MAPPING;
  }

  /**
   * Get budget context for AI descriptions
   */
  static getBudgetContext(budget: string | null): string {
    if (!budget) return 'any budget range';
    
    const budgetMap = {
      'P': 'budget-friendly',
      'PP': 'moderate-priced',
      'PPP': 'premium'
    };
    return budgetMap[budget as keyof typeof budgetMap] || 'any budget range';
  }

  /**
   * Convert Google Places price level to budget category
   */
  static priceLevelToBudget(priceLevel: number | null | undefined): string {
    if (priceLevel === null || priceLevel === undefined) return 'PP'; // Default to moderate
    
    if (priceLevel <= 2) return 'P';      // Budget-friendly
    if (priceLevel === 3) return 'PP';    // Moderate
    return 'PPP';                          // Premium
  }

  /**
   * Convert budget to Google Places price level
   */
  static budgetToPriceLevel(budget: string | null): number | null {
    if (!budget) return null;
    
    const category = this.getBudgetCategory(budget);
    return category ? category.googlePriceLevel : null;
  }

  /**
   * Check if place fits within budget
   */
  static isPlaceInBudget(place: any, budget: string | null): boolean {
    if (!budget) return true; // No budget filter
    
    const placePriceLevel = place.price_level;
    if (placePriceLevel === null || placePriceLevel === undefined) {
      return budget === 'P'; // Only include in budget-friendly if no price data
    }
    
    const allowedPriceLevels = BUDGET_PRICE_MAPPING[budget as keyof typeof BUDGET_PRICE_MAPPING];
    if (!allowedPriceLevels) {
      return false;
    }
    
    return allowedPriceLevels.includes(placePriceLevel as number);
  }
}

// Export for backward compatibility
export const budgetCategories = BUDGET_CATEGORIES;

// Derived exports for backward compatibility
export const budgetOptions = BUDGET_CATEGORIES.map(category => ({
  display: category.display,
  value: category.id,
  label: category.label,
  priceRange: category.priceRange,
  googlePriceLevel: category.googlePriceLevel
}));

// Export utility functions for backward compatibility
export const getBudgetCategory = BudgetUtils.getBudgetCategory;
export const filterByBudget = BudgetUtils.filterByBudget;
export const getBudgetLabel = BudgetUtils.getBudgetLabel;
export const getBudgetDisplayText = BudgetUtils.getBudgetDisplayText;
export const getPreferredPlaceTypes = BudgetUtils.getPreferredPlaceTypes;
export const validateBudget = BudgetUtils.validateBudget;
export const getAllBudgetCategories = BudgetUtils.getAllBudgetCategories;
export const getBudgetMappings = BudgetUtils.getBudgetMappings;
export const getBudgetPriceMapping = BudgetUtils.getBudgetPriceMapping;
export const getBudgetContext = BudgetUtils.getBudgetContext;
export const priceLevelToBudget = BudgetUtils.priceLevelToBudget;
export const budgetToPriceLevel = BudgetUtils.budgetToPriceLevel;
export const isPlaceInBudget = BudgetUtils.isPlaceInBudget; 