// Default location (Manila, Philippines)
const DEFAULT_LOCATION = { lat: 14.5176, lng: 121.0509 };

// Category to Google Places API type mapping for validation
const VALIDATION_TYPE_MAPPING = {
  'food': ['restaurant', 'cafe', 'bar', 'bakery'],
  'activity': ['park', 'museum', 'art_gallery', 'movie_theater', 'tourist_attraction'],
  'something-new': ['shopping_mall', 'library', 'book_store', 'tourist_attraction']
} as const;

export interface ValidationResult {
  success: boolean;
  category: string;
  placeCount: number;
  types: string[];
  radius: number;
  location: { lat: number; lng: number };
  responseTime: number;
  error?: string;
}

export class FilterValidationService {
  private static instance: FilterValidationService;

  private constructor() {}

  static getInstance(): FilterValidationService {
    if (!FilterValidationService.instance) {
      FilterValidationService.instance = new FilterValidationService();
    }
    return FilterValidationService.instance;
  }

  /**
   * Validates "Looking For" filter connectivity and data mapping
   * Performs lightweight API call to count relevant places
   */
  async validateLookingForFilter(
    category: 'food' | 'activity' | 'something-new',
    location?: { lat: number; lng: number }
  ): Promise<ValidationResult> {
    const startTime = Date.now();
    const searchLocation = location || DEFAULT_LOCATION;

    console.log(`🔍 Validating ${category} filter connectivity...`);
    console.log(`📍 Location: ${searchLocation.lat}, ${searchLocation.lng}`);

    try {
      // Call backend validation endpoint
      const response = await fetch('https://asia-southeast1-g-decider-backend.cloudfunctions.net/validateFilter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category,
          location: searchLocation
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      const result: ValidationResult = {
        success: data.success,
        category: data.category,
        placeCount: data.placeCount,
        types: data.types,
        radius: data.radius,
        location: data.location,
        responseTime
      };

      if (data.success) {
        console.log(`✅ Validation successful: Detected ${data.placeCount} places for ${category} within 1km`);
        console.log(`⏱️ Response time: ${responseTime}ms`);
      } else {
        console.error(`❌ Validation failed for ${category}: ${data.error}`);
      }

      return result;

    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`❌ Validation failed for ${category}:`, errorMessage);

      return {
        success: false,
        category,
        placeCount: 0,
        types: VALIDATION_TYPE_MAPPING[category],
        radius: 1000,
        location: searchLocation,
        responseTime,
        error: errorMessage
      };
    }
  }



  /**
   * Validates all categories at once for comprehensive testing
   */
  async validateAllCategories(
    location?: { lat: number; lng: number }
  ): Promise<ValidationResult[]> {
    const categories: Array<'food' | 'activity' | 'something-new'> = ['food', 'activity', 'something-new'];
    const results: ValidationResult[] = [];

    console.log('🧪 Starting comprehensive filter validation...');

    for (const category of categories) {
      try {
        const result = await this.validateLookingForFilter(category, location);
        results.push(result);
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to validate ${category}:`, error);
        results.push({
          success: false,
          category,
          placeCount: 0,
          types: VALIDATION_TYPE_MAPPING[category],
          radius: 1000,
          location: location || DEFAULT_LOCATION,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log('📊 Validation Summary:');
    results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.category}: ${result.placeCount} places (${result.responseTime}ms)`);
    });

    return results;
  }

  /**
   * Gets validation statistics for monitoring
   */
  getValidationStats(): {
    totalValidations: number;
    successRate: number;
    averageResponseTime: number;
    averagePlaceCount: number;
  } {
    // This would typically track validation metrics over time
    // For now, return placeholder stats
    return {
      totalValidations: 0,
      successRate: 0,
      averageResponseTime: 0,
      averagePlaceCount: 0
    };
  }
}

// Export singleton instance
export const filterValidationService = FilterValidationService.getInstance(); 