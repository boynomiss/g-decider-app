// Budget Configuration - Refactored with Filter Foundation
// This file demonstrates how to use the shared filter foundation

import { 
  FilterWithDisplay, 
  DisplayFilterUtils, 
  BudgetValue,
  CommonFilterUtils 
} from './filter-foundation';

export interface BudgetCategory extends FilterWithDisplay {
  id: BudgetValue;
  display: string;
  priceRange: { min: number; max: number };
  googlePriceLevel: number;
}

// Single consolidated budget configuration
export const BUDGET_CATEGORIES: readonly BudgetCategory[] = [
  { 
    id: 'P', 
    display: '₱',
    label: 'Budget-Friendly',
    icon: '💰',
    description: 'Affordable dining and activities',
    priceRange: { min: 0, max: 500 },
    googlePriceLevel: 1,
    preferredPlaceTypes: ['cafe', 'bakery', 'food', 'meal_takeaway', 'convenience_store', 'supermarket'],
    moodCompatibility: ['chill', 'neutral', 'hype'],
    socialCompatibility: ['solo', 'with-bae', 'barkada'],
    budgetPreferences: ['P'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Affordable cafe visit', 'Bakery exploration', 'Budget-friendly dining',
      'Convenience store shopping', 'Supermarket run'
    ],
    atmosphereKeywords: ['affordable', 'budget-friendly', 'economical', 'value', 'cost-effective']
  },
  { 
    id: 'PP', 
    display: '₱₱',
    label: 'Moderate',
    icon: '💳',
    description: 'Mid-range dining and experiences',
    priceRange: { min: 500, max: 1500 },
    googlePriceLevel: 2,
    preferredPlaceTypes: ['restaurant', 'cafe', 'bar', 'movie_theater', 'museum', 'art_gallery'],
    moodCompatibility: ['chill', 'neutral', 'hype'],
    socialCompatibility: ['solo', 'with-bae', 'barkada'],
    budgetPreferences: ['PP'],
    timeCompatibility: ['morning', 'afternoon', 'night'],
    activitySuggestions: [
      'Casual dining', 'Movie night', 'Museum visit', 'Art gallery exploration',
      'Cafe hangout', 'Bar visit'
    ],
    atmosphereKeywords: ['moderate', 'casual', 'comfortable', 'pleasant', 'nice']
  },
  { 
    id: 'PPP', 
    display: '₱₱₱',
    label: 'Premium',
    icon: '💎',
    description: 'High-end dining and luxury experiences',
    priceRange: { min: 1500, max: 5000 },
    googlePriceLevel: 3,
    preferredPlaceTypes: ['restaurant', 'bar', 'night_club', 'spa', 'casino', 'hotel'],
    moodCompatibility: ['neutral', 'hype'],
    socialCompatibility: ['with-bae', 'barkada'],
    budgetPreferences: ['PPP'],
    timeCompatibility: ['afternoon', 'night'],
    activitySuggestions: [
      'Fine dining experience', 'Luxury spa day', 'Casino night',
      'Premium bar experience', 'Hotel dining', 'Nightclub visit'
    ],
    atmosphereKeywords: ['premium', 'luxury', 'exclusive', 'high-end', 'sophisticated']
  }
] as const;

// Budget to Google Places price_level mapping for backend filtering
export const BUDGET_PRICE_MAPPING: Record<BudgetValue, number[]> = {
  'P': [0, 1, 2],    // Budget-Friendly: 0-2
  'PP': [3],         // Moderate: 3  
  'PPP': [4]         // Premium: 4
} as const;

// Refactored utility class using the filter foundation
export class BudgetUtils extends DisplayFilterUtils<BudgetCategory> {
  protected categories = BUDGET_CATEGORIES;

  /**
   * Filter places by budget (price level)
   */
  static filterByBudget(places: any[], budget: string | null): any[] {
    if (!budget || !BUDGET_PRICE_MAPPING[budget as BudgetValue]) {
      return places;
    }
    
    const allowedPriceLevels = BUDGET_PRICE_MAPPING[budget as BudgetValue];
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
  static priceLevelToBudget(priceLevel: number | null | undefined): BudgetValue {
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
    
    const category = BUDGET_CATEGORIES.find(cat => cat.id === budget);
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
    
    const allowedPriceLevels = BUDGET_PRICE_MAPPING[budget as BudgetValue];
    if (!allowedPriceLevels) {
      return false;
    }
    
    return allowedPriceLevels.includes(placePriceLevel as number);
  }

  /**
   * Get budget price mapping for API calls
   */
  static getBudgetPriceMapping() {
    return BUDGET_PRICE_MAPPING;
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
}

// Create singleton instance
export const budgetUtils = new BudgetUtils();

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

// Export utility functions for backward compatibility using the singleton
export const getBudgetCategory = budgetUtils.getCategory.bind(budgetUtils);
export const filterByBudget = BudgetUtils.filterByBudget;
export const getBudgetLabel = budgetUtils.getLabel.bind(budgetUtils);
export const getBudgetDisplayText = budgetUtils.getDisplayText.bind(budgetUtils);
export const getPreferredPlaceTypes = budgetUtils.getPreferredPlaceTypes.bind(budgetUtils);
export const validateBudget = budgetUtils.validateValue.bind(budgetUtils);
export const getAllBudgetCategories = budgetUtils.getAllCategories.bind(budgetUtils);
export const getBudgetMappings = BudgetUtils.getBudgetMappings;
export const getBudgetPriceMapping = BudgetUtils.getBudgetPriceMapping;
export const getBudgetContext = BudgetUtils.getBudgetContext;
export const priceLevelToBudget = BudgetUtils.priceLevelToBudget;
export const budgetToPriceLevel = BudgetUtils.budgetToPriceLevel;
export const isPlaceInBudget = BudgetUtils.isPlaceInBudget;
export const getActivitySuggestions = budgetUtils.getActivitySuggestions.bind(budgetUtils);
export const getAtmosphereKeywords = budgetUtils.getAtmosphereKeywords.bind(budgetUtils);
export const getDisplayTextWithIcon = budgetUtils.getDisplayTextWithIcon.bind(budgetUtils); 