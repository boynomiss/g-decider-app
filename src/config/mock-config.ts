// Mock Configuration
// Control which services use mock implementations vs real implementations

export const MOCK_CONFIG = {
  // Enable/disable mock services
  ENABLE_MOCK_SERVICES: true,
  
  // Individual service toggles
  API: {
    GOOGLE_PLACES: true,
    SCRAPING: true,
    BOOKING: true,
    FIREBASE_CLIENT: true
  },
  
  FIREBASE: {
    FUNCTIONS: true,
    ADMIN: true
  },
  
  AI: {
    PROJECT_AGENT: true,
    DESCRIPTION_GENERATOR: true,
    IMAGE_SOURCING: true,
    PHOTO_URL_GENERATOR: true,
    RESULTS_SERVICES: true
  },
  
  CACHE: {
    UNIFIED_CACHE: true,
    SERVER_FILTERING: true,
    ENHANCED_FILTERING: true,
    DATA_CONVERTER: true
  },
  
  EXTERNAL: {
    AD_MONETIZATION: true,
    DISCOUNT: true,
    AFFILIATE_MARKETING: true
  },
  
  MOBILE: {
    LOCATION: true,
    DEVICE: true,
    PUSH_NOTIFICATIONS: true
  },
  
  HOOKS: {
    GOOGLE_PLACES: true,
    AI_DESCRIPTION: true,
    SERVER_FILTERING: true,
    AUTH: true
  },
  
  STORE: true,
  
  // Mock data configuration
  MOCK_DATA: {
    // Simulate network delays (in milliseconds)
    DELAYS: {
      FAST: 300,
      NORMAL: 1000,
      SLOW: 2000,
      AI_PROCESSING: 2500
    },
    
    // Mock user credentials for testing
    TEST_USER: {
      email: 'test@example.com',
      password: 'password123'
    },
    
    // Default location for mock services
    DEFAULT_LOCATION: {
      latitude: 37.7749,
      longitude: -122.4194,
      city: 'San Francisco',
      state: 'CA'
    }
  },
  
  // Feature flags for UI development
  FEATURES: {
    SHOW_MOCK_INDICATORS: true, // Show "MOCK" badges in UI
    ENABLE_MOCK_ERRORS: false,  // Simulate errors for testing
    RANDOMIZE_MOCK_DATA: true,  // Add variety to mock responses
    MOCK_ANIMATIONS: true       // Simulate loading states
  }
};

// Helper function to check if a service should use mock implementation
export const shouldUseMock = (servicePath: string): boolean => {
  if (!MOCK_CONFIG.ENABLE_MOCK_SERVICES) return false;
  
  const pathParts = servicePath.split('.');
  let current = MOCK_CONFIG as any;
  
  for (const part of pathParts) {
    if (current[part] === undefined) return false;
    current = current[part];
  }
  
  return current === true;
};

// Helper function to get mock delay
export const getMockDelay = (type: keyof typeof MOCK_CONFIG.MOCK_DATA.DELAYS): number => {
  return MOCK_CONFIG.MOCK_DATA.DELAYS[type];
};

// Helper function to check if mock indicators should be shown
export const shouldShowMockIndicators = (): boolean => {
  return MOCK_CONFIG.FEATURES.SHOW_MOCK_INDICATORS;
};
