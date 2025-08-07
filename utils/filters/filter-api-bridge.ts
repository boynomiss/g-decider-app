// Import consolidated distance configuration
import { DISTANCE_CATEGORIES, DistanceUtils } from './distance-config';

const BUDGET_OPTIONS = [
  { 
    display: '₱', 
    value: 'P' as const,
    label: 'Budget-Friendly',
    priceRange: { min: 0, max: 500 },
    googlePriceLevel: 1
  },
  { 
    display: '₱₱', 
    value: 'PP' as const,
    label: 'Moderate',
    priceRange: { min: 500, max: 1500 },
    googlePriceLevel: 2
  },
  { 
    display: '₱₱₱', 
    value: 'PPP' as const,
    label: 'Premium',
    priceRange: { min: 1500, max: 5000 },
    googlePriceLevel: 3
  }
];

const SOCIAL_OPTIONS = [
  { 
    id: 'solo', 
    label: 'Solo', 
    icon: '🧍',
    groupSize: 1,
    placeTypes: ['library', 'cafe', 'park', 'museum', 'gym'],
    description: 'Individual activities and quiet spaces'
  },
  { 
    id: 'with-bae', 
    label: 'With Bae', 
    icon: '❤️',
    groupSize: 2,
    placeTypes: ['restaurant', 'cafe', 'movie_theater', 'park', 'spa'],
    description: 'Romantic activities for couples'
  },
  { 
    id: 'barkada', 
    label: 'Barkada', 
    icon: '🎉',
    groupSize: { min: 3, max: 8 },
    placeTypes: ['restaurant', 'bar', 'bowling_alley', 'karaoke', 'amusement_park'],
    description: 'Group activities and social gatherings'
  }
];

// Import consolidated time configuration
import { TIME_CATEGORIES } from './time-config';

const TIME_OPTIONS = TIME_CATEGORIES.map(category => ({
  id: category.id,
  label: category.label,
  timeRange: category.timeRange,
  description: category.description
}));

// Unified filter data structure for seamless API integration
export interface ApiReadyFilterData {
  // Core identification
  filterId: string;
  filterType: 'category' | 'mood' | 'distance' | 'budget' | 'social' | 'time';
  timestamp: number;
  
  // User-friendly display
  displayName: string;
  displayValue: string;
  emoji?: string;
  
  // Google Places API ready data
  googlePlacesQuery: {
    types?: string[];
    radius?: number;
    minPrice?: number;
    maxPrice?: number;
    openNow?: boolean;
    location?: { lat: number; lng: number };
  };
  
  // Additional API parameters
  searchModifiers: {
    priority: 'strict' | 'flexible' | 'contextual';
    weight: number; // 0-1 for ranking influence
    fallbackOptions?: string[];
  };
  
  // Analytics and optimization data
  metadata: {
    userPreference: any;
    rawValue: any;
    category: string;
    confidence: number; // 0-1 how confident we are in this filter
    searchKeywords?: string[];
    avoidTypes?: string[];
    meters?: { min: number; max: number };
    kilometers?: { min: number; max: number };
    priceRange?: { min: number; max: number };
    googlePriceLevel?: number;
    groupSize?: number;
    placeTypes?: string[];
    description?: string;
    timeRange?: { start: string; end: string };
    googleOpeningHours?: any;
  };
}

export class FilterApiBridge {
  
  /**
   * Enhanced Category Logging - NULL SAFE
   */
  static logCategorySelection(categoryId: string | null): ApiReadyFilterData | null {
    if (!categoryId) {
      console.warn('⚠️ Category selection called with null value');
      return null;
    }
    const categoryMapping: Record<string, any> = {
      'food': {
        displayName: 'Food & Dining',
        types: ['restaurant', 'cafe', 'bar', 'bakery', 'food', 'meal_delivery', 'meal_takeaway', 'liquor_store', 'convenience_store', 'supermarket'],
        emoji: '🍔',
        rationale: 'These types are primarily focused on dining, drinking, and food-related purchases. Includes restaurants, cafes, bars, bakeries, meal services, and food retail establishments.'
      },
      'activity': {
        displayName: 'Activities & Entertainment', 
        types: ['park', 'museum', 'art_gallery', 'movie_theater', 'night_club', 'stadium', 'casino', 'gym', 'spa', 'bowling_alley', 'amusement_park', 'zoo', 'aquarium', 'golf_course', 'skate_park', 'swimming_pool', 'playground', 'tourist_attraction'],
        emoji: '🧩',
        rationale: 'These types are focused on leisure, recreation, entertainment, and cultural experiences. Includes outdoor spaces, cultural venues, entertainment spots, sports facilities, and places for personal well-being.'
      },
      'something-new': {
        displayName: 'Something New',
        types: ['shopping_mall', 'library', 'book_store', 'clothing_store', 'shoe_store', 'department_store', 'electronics_store', 'home_goods_store', 'hardware_store', 'florist', 'jewelry_store', 'sporting_goods_store', 'pet_store', 'bicycle_store', 'hair_care', 'beauty_salon', 'university', 'hindu_temple', 'church', 'mosque', 'synagogue', 'rv_park', 'campground'],
        emoji: '✨',
        rationale: 'This category focuses on places that offer unique experiences, less common activities, or places for discovery. Prioritizes exploration, cultural sites, unique shopping experiences, and novel destinations.'
      }
    };
    
    const category = categoryMapping[categoryId];
    
    if (!category) {
      console.error(`❌ Invalid category ID: ${categoryId}`);
      return null;
    }
    
    const filterData: ApiReadyFilterData = {
      filterId: `category_${categoryId}_${Date.now()}`,
      filterType: 'category',
      timestamp: Date.now(),
      displayName: category.displayName,
      displayValue: categoryId,
      emoji: category.emoji,
      googlePlacesQuery: {
        types: category.types
      },
      searchModifiers: {
        priority: 'strict',
        weight: 1.0, // Highest priority
        fallbackOptions: category.types.slice(0, 3) // Top 3 as fallback
      },
      metadata: {
        userPreference: categoryId,
        rawValue: categoryId,
        category: 'primary_filter',
        confidence: 1.0
      }
    };
    
    console.log('🎯 Category Filter (API Ready):', {
      selected: category.displayName,
      googleTypes: category.types,
      rationale: category.rationale,
      priority: 'STRICT',
      apiQuery: filterData.googlePlacesQuery
    });
    
    return filterData;
  }

  /**
   * Enhanced Mood Logging - NULL SAFE
   */
  static logMoodSelection(moodValue: number | null): ApiReadyFilterData | null {
    if (moodValue === null || moodValue === undefined) {
      console.warn('⚠️ Mood selection called with null value');
      return null;
    }

    // Clamp mood value to valid range
    const clampedMood = Math.max(0, Math.min(100, moodValue));
    const getMoodCategory = (value: number): 'chill' | 'neutral' | 'hype' => {
      if (value <= 33.33) return 'chill';
      if (value <= 66.66) return 'neutral';
      return 'hype';
    };
    
    const category = getMoodCategory(clampedMood);
    const moodMapping = {
      'chill': {
        displayName: 'Chill Vibes',
        preferredTypes: ['library', 'cafe', 'park', 'spa', 'museum'],
        avoidTypes: ['night_club', 'bar', 'stadium'],
        emoji: '😌',
        searchKeywords: ['quiet', 'peaceful', 'relaxed', 'cozy', 'calm']
      },
      'neutral': {
        displayName: 'Balanced Experience',
        preferredTypes: ['restaurant', 'shopping_mall', 'movie_theater', 'tourist_attraction'],
        avoidTypes: [],
        emoji: '⚖️',
        searchKeywords: ['casual', 'standard', 'comfortable', 'moderate']
      },
      'hype': {
        displayName: 'High Energy',
        preferredTypes: ['night_club', 'bar', 'amusement_park', 'stadium', 'bowling_alley'],
        avoidTypes: ['library', 'museum', 'spa'],
        emoji: '🔥',
        searchKeywords: ['lively', 'energetic', 'vibrant', 'exciting', 'buzzing']
      }
    };
    
    const mood = moodMapping[category];
    
    const filterData: ApiReadyFilterData = {
      filterId: `mood_${category}_${Date.now()}`,
      filterType: 'mood',
      timestamp: Date.now(),
      displayName: mood.displayName,
      displayValue: category,
      emoji: mood.emoji,
      googlePlacesQuery: {
        types: mood.preferredTypes
      },
      searchModifiers: {
        priority: 'contextual',
        weight: 0.8,
        fallbackOptions: mood.preferredTypes
      },
      metadata: {
        userPreference: category,
        rawValue: clampedMood,
        category: 'mood_filter',
        confidence: 0.85,
        searchKeywords: mood.searchKeywords,
        avoidTypes: mood.avoidTypes
      }
    };
    
    console.log('🎭 Mood Filter (API Ready):', {
      selected: mood.displayName,
      moodScore: clampedMood,
      category: category.toUpperCase(),
      preferredTypes: mood.preferredTypes,
      searchKeywords: mood.searchKeywords,
      priority: 'CONTEXTUAL',
      apiQuery: filterData.googlePlacesQuery
    });
    
    return filterData;
  }

  /**
   * Enhanced Distance Logging - NULL SAFE
   */
  static logDistanceSelection(distanceValue: number | null): ApiReadyFilterData | null {
    if (distanceValue === null || distanceValue === undefined) {
      console.warn('⚠️ Distance selection called with null value');
      return null;
    }

    const getDistanceCategory = (value: number) => {
      return DistanceUtils.getDistanceCategory(value);
    };
    
    const category = getDistanceCategory(distanceValue);
    
    const filterData: ApiReadyFilterData = {
      filterId: `distance_${category.text.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
      filterType: 'distance',
      timestamp: Date.now(),
      displayName: 'Distance Range',
      displayValue: category.text,
      emoji: category.emoji,
      googlePlacesQuery: {
        radius: category.distanceMeters.max
      },
      searchModifiers: {
        priority: 'flexible',
        weight: 0.6,
        fallbackOptions: [
          (category.distanceMeters.max * 1.5).toString(), // 50% expansion
          (category.distanceMeters.max * 2).toString()    // 100% expansion
        ]
      },
      metadata: {
        userPreference: category.text,
        rawValue: distanceValue,
        category: 'distance_filter',
        confidence: 0.9,
        meters: category.distanceMeters,
        kilometers: category.distanceKm
      }
    };
    
    console.log('📍 Distance Filter (API Ready):', {
      selected: category.text,
      radius: `${category.distanceMeters.max}m`,
      kilometers: `${category.distanceKm.max}km`,
      priority: 'FLEXIBLE',
      expansionOptions: filterData.searchModifiers.fallbackOptions,
      apiQuery: filterData.googlePlacesQuery
    });
    
    return filterData;
  }

  /**
   * Enhanced Budget Logging - NULL SAFE
   */
  static logBudgetSelection(budgetValue: 'P' | 'PP' | 'PPP' | null): ApiReadyFilterData | null {
    if (!budgetValue) {
      console.warn('⚠️ Budget selection called with null value');
      return null;
    }

    const selectedBudget = BUDGET_OPTIONS.find(option => option.value === budgetValue);
    
    if (!selectedBudget) {
      console.error(`❌ Invalid budget value: ${budgetValue}`);
      return null;
    }
    
    const filterData: ApiReadyFilterData = {
      filterId: `budget_${budgetValue}_${Date.now()}`,
      filterType: 'budget',
      timestamp: Date.now(),
      displayName: 'Budget Range',
      displayValue: selectedBudget.label,
      emoji: '💰',
      googlePlacesQuery: {
        minPrice: selectedBudget.googlePriceLevel,
        maxPrice: selectedBudget.googlePriceLevel
      },
      searchModifiers: {
        priority: 'strict',
        weight: 0.9,
        fallbackOptions: [] // No fallback for budget - strict requirement
      },
      metadata: {
        userPreference: selectedBudget.label,
        rawValue: budgetValue,
        category: 'budget_filter',
        confidence: 1.0,
        priceRange: selectedBudget.priceRange,
        googlePriceLevel: selectedBudget.googlePriceLevel
      }
    };
    
    console.log('💰 Budget Filter (API Ready):', {
      selected: selectedBudget.label,
      priceRange: `₱${selectedBudget.priceRange.min}-₱${selectedBudget.priceRange.max}`,
      googlePriceLevel: selectedBudget.googlePriceLevel,
      priority: 'STRICT',
      apiQuery: filterData.googlePlacesQuery
    });
    
    return filterData;
  }

  /**
   * Enhanced Social Context Logging - NULL SAFE
   */
  static logSocialContextSelection(socialId: 'solo' | 'with-bae' | 'barkada' | null): ApiReadyFilterData | null {
    if (!socialId) {
      console.warn('⚠️ Social context selection called with null value');
      return null;
    }

    const selectedSocial = SOCIAL_OPTIONS.find(option => option.id === socialId);
    
    if (!selectedSocial) {
      console.error(`❌ Invalid social context: ${socialId}`);
      return null;
    }
    
    const filterData: ApiReadyFilterData = {
      filterId: `social_${socialId}_${Date.now()}`,
      filterType: 'social',
      timestamp: Date.now(),
      displayName: 'Social Context',
      displayValue: selectedSocial.label,
      emoji: selectedSocial.icon,
      googlePlacesQuery: {
        types: selectedSocial.placeTypes
      },
      searchModifiers: {
        priority: 'flexible',
        weight: 0.7,
        fallbackOptions: selectedSocial.placeTypes.slice(0, 2)
      },
      metadata: {
        userPreference: selectedSocial.label,
        rawValue: socialId,
        category: 'social_filter',
        confidence: 0.8,
        groupSize: typeof selectedSocial.groupSize === 'number' 
          ? selectedSocial.groupSize 
          : selectedSocial.groupSize.max,
        placeTypes: selectedSocial.placeTypes,
        description: selectedSocial.description
      }
    };
    
    console.log('👥 Social Context Filter (API Ready):', {
      selected: selectedSocial.label,
      groupSize: selectedSocial.groupSize,
      preferredTypes: selectedSocial.placeTypes,
      description: selectedSocial.description,
      priority: 'FLEXIBLE',
      apiQuery: filterData.googlePlacesQuery
    });
    
    return filterData;
  }

  /**
   * Enhanced Time of Day Logging - NULL SAFE
   */
  static logTimeOfDaySelection(timeId: 'morning' | 'afternoon' | 'night' | null): ApiReadyFilterData | null {
    if (!timeId) {
      console.warn('⚠️ Time of day selection called with null value');
      return null;
    }

    const selectedTime = TIME_OPTIONS.find(option => option.id === timeId);
    
    if (!selectedTime) {
      console.error(`❌ Invalid time of day: ${timeId}`);
      return null;
    }
    
    const filterData: ApiReadyFilterData = {
      filterId: `time_${timeId}_${Date.now()}`,
      filterType: 'time',
      timestamp: Date.now(),
      displayName: 'Time of Day',
      displayValue: selectedTime.label,
      emoji: '🕐',
      googlePlacesQuery: {
        openNow: true
      },
      searchModifiers: {
        priority: 'flexible',
        weight: 0.5,
        fallbackOptions: ['any_time'] // Fallback to any time if no open places
      },
      metadata: {
        userPreference: selectedTime.label,
        rawValue: timeId,
        category: 'time_filter',
        confidence: 0.7,
        timeRange: selectedTime.timeRange,
        description: selectedTime.description
      }
    };
    
    console.log('⏰ Time Filter (API Ready):', {
      selected: selectedTime.label,
      timeRange: `${selectedTime.timeRange.start}-${selectedTime.timeRange.end}`,
      openNow: true,
      description: selectedTime.description,
      priority: 'FLEXIBLE',
      apiQuery: filterData.googlePlacesQuery
    });
    
    return filterData;
  }

  /**
   * Safe consolidation with error handling
   */
  static consolidateFiltersForApi(filters: (ApiReadyFilterData | null)[]): {
    googlePlacesQuery: any;
    searchStrategy: any;
    filterSummary: any;
  } {
    // Filter out null values
    const validFilters = filters.filter((f): f is ApiReadyFilterData => f !== null);
    
    if (validFilters.length === 0) {
      console.warn('⚠️ No valid filters to consolidate');
      return {
        googlePlacesQuery: {},
        searchStrategy: {
          strictFilters: [],
          flexibleFilters: [],
          contextualFilters: [],
          fallbackOptions: {}
        },
        filterSummary: {
          totalFilters: 0,
          strictCount: 0,
          flexibleCount: 0,
          contextualCount: 0,
          averageConfidence: 0,
          timestamp: Date.now()
        }
      };
    }

    const consolidatedQuery: any = {};
    const searchStrategy: any = {
      strictFilters: [],
      flexibleFilters: [],
      contextualFilters: [],
      fallbackOptions: {}
    };
    
    try {
      validFilters.forEach(filter => {
        // Safely merge Google Places query parameters
        if (filter.googlePlacesQuery) {
          Object.assign(consolidatedQuery, filter.googlePlacesQuery);
        }
        
        // Categorize by priority
        if (filter.searchModifiers.priority === 'strict') {
          searchStrategy.strictFilters.push(filter);
        } else if (filter.searchModifiers.priority === 'flexible') {
          searchStrategy.flexibleFilters.push(filter);
        } else {
          searchStrategy.contextualFilters.push(filter);
        }
        
        // Add fallback options
        if (filter.searchModifiers.fallbackOptions?.length) {
          searchStrategy.fallbackOptions[filter.filterType] = filter.searchModifiers.fallbackOptions;
        }
      });
    } catch (error) {
      console.error('❌ Error consolidating filters:', error);
    }
    
    const filterSummary = {
      totalFilters: validFilters.length,
      strictCount: searchStrategy.strictFilters.length,
      flexibleCount: searchStrategy.flexibleFilters.length,
      contextualCount: searchStrategy.contextualFilters.length,
      averageConfidence: validFilters.reduce((sum, f) => sum + f.metadata.confidence, 0) / validFilters.length,
      timestamp: Date.now()
    };
    
    console.log('🔗 Consolidated API Query (Error-Free):', {
      googleQuery: consolidatedQuery,
      strategy: {
        strict: searchStrategy.strictFilters.map((f: ApiReadyFilterData) => f.displayValue),
        flexible: searchStrategy.flexibleFilters.map((f: ApiReadyFilterData) => f.displayValue),
        contextual: searchStrategy.contextualFilters.map((f: ApiReadyFilterData) => f.displayValue)
      },
      summary: filterSummary
    });
    
    return {
      googlePlacesQuery: consolidatedQuery,
      searchStrategy,
      filterSummary
    };
  }

  /**
   * Generate a comprehensive filter report for debugging and analytics
   */
  static generateFilterReport(filters: ApiReadyFilterData[]): string {
    const report = [
      '📊 FILTER REPORT',
      '================',
      '',
      `Total Filters: ${filters.length}`,
      `Timestamp: ${new Date().toISOString()}`,
      '',
      'FILTER BREAKDOWN:',
      '-----------------'
    ];

    filters.forEach(filter => {
      report.push(
        `${filter.emoji || '•'} ${filter.displayName}: ${filter.displayValue}`,
        `  Priority: ${filter.searchModifiers.priority.toUpperCase()}`,
        `  Confidence: ${(filter.metadata.confidence * 100).toFixed(0)}%`,
        `  Weight: ${filter.searchModifiers.weight}`,
        ''
      );
    });

    const consolidated = this.consolidateFiltersForApi(filters);
    report.push(
      'API QUERY:',
      '----------',
      JSON.stringify(consolidated.googlePlacesQuery, null, 2),
      '',
      'SEARCH STRATEGY:',
      '----------------',
      `Strict Filters: ${consolidated.searchStrategy.strictFilters.length}`,
      `Flexible Filters: ${consolidated.searchStrategy.flexibleFilters.length}`,
      `Contextual Filters: ${consolidated.searchStrategy.contextualFilters.length}`,
      '',
      '================',
    );

    const reportString = report.join('\n');
    console.log(reportString);
    return reportString;
  }
}

// Test runner for error detection
export class FilterTestRunner {
  static runAllTests(): boolean {
    console.log('🧪 Running Filter API Bridge Tests...');
    
    let allPassed = true;
    
    // Test 1: Null safety
    try {
      const nullTests = [
        FilterApiBridge.logCategorySelection(null),
        FilterApiBridge.logMoodSelection(null),
        FilterApiBridge.logDistanceSelection(null),
        FilterApiBridge.logBudgetSelection(null),
        FilterApiBridge.logSocialContextSelection(null),
        FilterApiBridge.logTimeOfDaySelection(null)
      ];
      
      const nullCount = nullTests.filter(result => result === null).length;
      console.log(`✅ Null safety test: ${nullCount}/6 correctly returned null`);
      
    } catch (error) {
      console.error('❌ Null safety test failed:', error);
      allPassed = false;
    }
    
    // Test 2: Valid inputs
    try {
      const validTests = [
        FilterApiBridge.logCategorySelection('food'),
        FilterApiBridge.logMoodSelection(75),
        FilterApiBridge.logDistanceSelection(50),
        FilterApiBridge.logBudgetSelection('PP'),
        FilterApiBridge.logSocialContextSelection('barkada'),
        FilterApiBridge.logTimeOfDaySelection('night')
      ];
      
      const validCount = validTests.filter(result => result !== null).length;
      console.log(`✅ Valid input test: ${validCount}/6 returned valid data`);
      
    } catch (error) {
      console.error('❌ Valid input test failed:', error);
      allPassed = false;
    }
    
    // Test 3: Edge cases
    try {
      const edgeTests = [
        FilterApiBridge.logMoodSelection(-10), // Should clamp to 0
        FilterApiBridge.logMoodSelection(150), // Should clamp to 100
        FilterApiBridge.logDistanceSelection(-5), // Should clamp to 0
        FilterApiBridge.logDistanceSelection(105), // Should clamp to 100
      ];
      
      const edgeCount = edgeTests.filter(result => result !== null).length;
      console.log(`✅ Edge case test: ${edgeCount}/4 handled correctly`);
      
    } catch (error) {
      console.error('❌ Edge case test failed:', error);
      allPassed = false;
    }
    
    // Test 4: Consolidation
    try {
      const testFilters = [
        FilterApiBridge.logCategorySelection('food'),
        FilterApiBridge.logMoodSelection(80),
        null, // Should be filtered out
        FilterApiBridge.logBudgetSelection('P')
      ];
      
      const consolidated = FilterApiBridge.consolidateFiltersForApi(testFilters);
      const hasValidStructure = consolidated.googlePlacesQuery && 
                               consolidated.searchStrategy && 
                               consolidated.filterSummary;
      
      console.log(`✅ Consolidation test: ${hasValidStructure ? 'Passed' : 'Failed'}`);
      
    } catch (error) {
      console.error('❌ Consolidation test failed:', error);
      allPassed = false;
    }
    
    console.log(`🎯 All tests ${allPassed ? 'PASSED' : 'FAILED'}`);
    return allPassed;
  }
}