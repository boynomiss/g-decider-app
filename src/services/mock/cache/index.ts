// Mock Cache Services
// Replace real caching and server filtering with mock data for UI development

export const mockUnifiedCacheService = {
  getCachedPlaces: async (filters: any) => ({
    places: [
      {
        id: 'cached_1',
        name: 'Cached Restaurant',
        rating: 4.6,
        category: 'restaurant',
        distance: '0.3 miles',
        price: '$$$',
        cached: true
      },
      {
        id: 'cached_2',
        name: 'Cached Bar',
        rating: 4.1,
        category: 'bar',
        distance: '0.7 miles',
        price: '$$',
        cached: true
      }
    ],
    cacheHit: true,
    timestamp: new Date().toISOString()
  }),
  
  setCachedPlaces: async (filters: any, places: any[]) => ({
    success: true,
    cachedCount: places.length,
    timestamp: new Date().toISOString()
  }),
  
  invalidateCache: async (pattern: string) => ({
    success: true,
    invalidatedKeys: ['places_cache', 'filters_cache']
  })
};

export const mockServerFilteringService = {
  filterPlaces: async (filters: any, places: any[]) => ({
    filteredPlaces: places.filter(place => 
      place.rating >= (filters.minRating || 0) &&
      place.price.length <= (filters.maxPrice || 4)
    ),
    appliedFilters: filters,
    totalResults: places.length
  }),
  
  getFilteredResults: async (filterId: string) => ({
    results: [
      {
        id: 'filtered_result_1',
        name: 'Filtered Result 1',
        score: 0.85,
        matchReason: 'Matches all criteria'
      }
    ],
    filterId,
    timestamp: new Date().toISOString()
  })
};

export const mockEnhancedFilteringWithCache = {
  getFilteredPlaces: async (filters: any) => ({
    places: [
      {
        id: 'enhanced_1',
        name: 'Enhanced Place 1',
        rating: 4.8,
        category: 'restaurant',
        mood: 'romantic',
        enhanced: true
      }
    ],
    cacheStatus: 'hit',
    processingTime: 150
  }),
  
  updateFilters: async (filterId: string, newFilters: any) => ({
    success: true,
    filterId,
    updatedFilters: newFilters
  })
};

export const mockServerDataConverter = {
  convertToClientFormat: (serverData: any) => ({
    ...serverData,
    converted: true,
    clientReady: true
  }),
  
  convertToServerFormat: (clientData: any) => ({
    ...clientData,
    converted: true,
    serverReady: true
  })
};
