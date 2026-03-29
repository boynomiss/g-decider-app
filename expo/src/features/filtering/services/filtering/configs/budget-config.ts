// Enhanced price range mapping based on Google Maps style
export const GOOGLE_MAPS_PRICE_RANGES = {
  '₱1-200': { min: 0, max: 200, level: 'P', label: 'Very Budget-Friendly', display: '₱' },
  '₱200-400': { min: 200, max: 400, level: 'P', label: 'Budget-Friendly', display: '₱' },
  '₱400-600': { min: 400, max: 600, level: 'PP', label: 'Moderate', display: '₱₱' },
  '₱600-800': { min: 600, max: 800, level: 'PP', label: 'Moderate-Plus', display: '₱₱' },
  '₱800+': { min: 800, max: Infinity, level: 'PPP', label: 'Premium', display: '₱₱₱' }
} as const;

export type GoogleMapsPriceRange = keyof typeof GOOGLE_MAPS_PRICE_RANGES;

export interface BudgetCategory {
  id: 'P' | 'PP' | 'PPP';
  display: string;
  label: string;
  priceRange: { min: number; max: number };
  priceRanges: readonly string[];
  googlePriceLevel: number;
  description: string;
  preferredPlaceTypes: readonly string[];
  atmosphereKeywords: readonly string[];
}

// Budget to Google Places price_level mapping for backend filtering
// Updated to be consistent with Google Places API price levels
export const BUDGET_PRICE_MAPPING: Record<string, number[]> = {
  'P': [0, 1],        // Budget-Friendly: 0-1
  'PP': [2],          // Moderate: 2  
  'PPP': [3, 4]       // Premium: 3-4
} as const;

// Enhanced budget categories with price ranges
export const BUDGET_CATEGORIES = [
  {
    id: 'P',
    display: '₱',
    label: 'Budget-Friendly',
    priceRange: { min: 0, max: 400 },
    priceRanges: ['₱1-200', '₱200-400'],
    googlePriceLevel: 1,
    description: 'Affordable dining and activities under ₱400',
    preferredPlaceTypes: ['cafe', 'bakery', 'food', 'meal_takeaway', 'convenience_store', 'supermarket'],
    atmosphereKeywords: ['casual', 'simple', 'basic', 'affordable', 'no-frills']
  },
  {
    id: 'PP',
    display: '₱₱',
    label: 'Moderate',
    priceRange: { min: 400, max: 800 },
    priceRanges: ['₱400-600', '₱600-800'],
    googlePriceLevel: 2,
    description: 'Mid-range dining and experiences ₱400-800',
    preferredPlaceTypes: ['restaurant', 'cafe', 'bar', 'movie_theater', 'museum', 'art_gallery'],
    atmosphereKeywords: ['comfortable', 'pleasant', 'decent', 'moderate', 'balanced']
  },
  {
    id: 'PPP',
    display: '₱₱₱',
    label: 'Premium',
    priceRange: { min: 800, max: 5000 },
    priceRanges: ['₱800+'],
    googlePriceLevel: 3,
    description: 'High-end dining and luxury experiences ₱800+',
    preferredPlaceTypes: ['restaurant', 'bar', 'night_club', 'spa', 'casino', 'hotel'],
    atmosphereKeywords: ['luxurious', 'elegant', 'sophisticated', 'premium', 'exclusive']
  }
] as const;

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
  static getPreferredPlaceTypes(budget: string | null): readonly string[] {
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
  static priceLevelToBudget(priceLevel: number | null | undefined): string | null {
    if (priceLevel === null || priceLevel === undefined) return null; // No default - return null for unknown
    
    if (priceLevel <= 2) return 'P';      // Google price_level 0-2 → Budget-Friendly (₱)
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

  /**
   * Get price range from Google Maps style price string
   */
  static getPriceRangeFromString(priceString: string): { min: number; max: number } | null {
    // Parse strings like "₱200-400", "200-400 pesos", "₱800+"
    const patterns = [
      /₱?(\d+)-(\d+)/,           // ₱200-400 or 200-400
      /₱?(\d+)\+/,               // ₱800+ or 800+
      /(\d+)-(\d+)\s*pesos?/i,   // 200-400 pesos
      /(\d+)\+\s*pesos?/i        // 800+ pesos
    ];

    for (const pattern of patterns) {
      const match = priceString.match(pattern);
      if (match && match[1]) {
        if (match[2]) {
          // Range format (e.g., 200-400)
          return { min: parseInt(match[1]), max: parseInt(match[2]) };
        } else {
          // Plus format (e.g., 800+)
          return { min: parseInt(match[1]), max: Infinity };
        }
      }
    }

    return null;
  }

  /**
   * Get budget category from price range
   */
  static getBudgetFromPriceRange(minPrice: number, maxPrice: number): 'P' | 'PP' | 'PPP' {
    if (maxPrice <= 400) return 'P';
    if (maxPrice <= 800) return 'PP';
    return 'PPP';
  }

  /**
   * Get Google Maps style price range from budget category
   */
  static getPriceRangesForBudget(budget: 'P' | 'PP' | 'PPP'): readonly string[] {
    const category = this.getBudgetCategory(budget);
    return category ? category.priceRanges : [];
  }

  /**
   * Get enhanced price display for a place
   */
  static getEnhancedPriceDisplay(place: any): string {
    // First try to get from place.priceRange if available
    if (place.priceRange && typeof place.priceRange === 'string') {
      return place.priceRange;
    }

    // Try to infer from place types and other data
    const inferredRange = this.inferPriceRangeFromPlaceData(place);
    if (inferredRange) {
      return inferredRange;
    }

    // Fallback to traditional budget display
    const budget = place.budget;
    if (budget === 'P') return '₱ (Under ₱400)';
    if (budget === 'PP') return '₱₱ (₱400-800)';
    if (budget === 'PPP') return '₱₱₱ (₱800+)';
    
    return 'Price N/A';
  }

  /**
   * Infer price range from place data
   */
  private static inferPriceRangeFromPlaceData(place: any): string | null {
    // Use place types to infer typical pricing
    const typePriceMap: Record<string, string> = {
      'convenience_store': '₱1-200',
      'cafe': '₱200-400',
      'restaurant': '₱400-800',
      'fine_dining': '₱800+',
      'park': '₱1-200',
      'museum': '₱200-400',
      'spa': '₱800+',
      'bar': '₱400-600',
      'night_club': '₱600-800',
      'hotel': '₱800+',
      'casino': '₱800+'
    };

    if (place.types && Array.isArray(place.types)) {
      for (const type of place.types) {
        if (typePriceMap[type]) {
          return typePriceMap[type];
        }
      }
    }

    // Use rating as a rough indicator (higher ratings often correlate with higher prices)
    if (place.rating) {
      if (place.rating >= 4.5) return '₱600-800';
      if (place.rating >= 4.0) return '₱400-600';
      if (place.rating >= 3.5) return '₱200-400';
      return '₱1-200';
    }

    return null;
  }

  /**
   * Extract price range from Google Places API data
   * Centralized method used across the application
   */
  static extractPriceRangeFromGooglePlaces(place: any): string | null {
    // Check editorial summary for price hints
    if (place.editorialSummary?.text) {
      const text = place.editorialSummary.text.toLowerCase();
      if (text.includes('₱') || text.includes('peso') || text.includes('price')) {
        // Look for price patterns in the text
        const pricePatterns = [
          /₱?(\d+)-(\d+)/,           // ₱200-400 or 200-400
          /₱?(\d+)\+/,               // ₱800+ or 800+
          /(\d+)-(\d+)\s*pesos?/i,   // 200-400 pesos
          /(\d+)\+\s*pesos?/i        // 800+ pesos
        ];
        
        for (const pattern of pricePatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            if (match[2]) {
              return `₱${match[1]}-${match[2]}`;
            } else {
              return `₱${match[1]}+`;
            }
          }
        }
      }
    }
    
    // Check place types to infer pricing
    const typePriceMap: Record<string, string> = {
      'convenience_store': '₱1-200',
      'cafe': '₱200-400',
      'restaurant': '₱400-800',
      'fine_dining': '₱800+',
      'park': '₱1-200',
      'museum': '₱200-400',
      'spa': '₱800+',
      'bar': '₱400-600',
      'night_club': '₱600-800',
      'hotel': '₱800+',
      'casino': '₱800+'
    };
    
    if (place.types && Array.isArray(place.types)) {
      for (const type of place.types) {
        if (typePriceMap[type]) {
          return typePriceMap[type];
        }
      }
    }
    
    return null;
  }

  /**
   * Get all available price ranges for UI display
   */
  static getAllPriceRanges(): readonly string[] {
    return Object.keys(GOOGLE_MAPS_PRICE_RANGES);
  }

  /**
   * Get price range details by key
   */
  static getPriceRangeDetails(priceRange: string): { min: number; max: number; level: 'P' | 'PP' | 'PPP'; label: string; display: string } | null {
    return GOOGLE_MAPS_PRICE_RANGES[priceRange as GoogleMapsPriceRange] || null;
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