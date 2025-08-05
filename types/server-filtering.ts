import { UserFilters } from './app';

// Server-side place data structure (what the server returns)
export interface ServerPlaceData {
  id: string;
  name: string;
  location: string;
  images: string[];
  budget: 'P' | 'PP' | 'PPP';
  tags: string[];
  description: string;
  openHours?: string;
  discount?: string;
  category: 'food' | 'activity' | 'something-new';
  mood: 'chill' | 'hype' | 'both';
  socialContext: ('solo' | 'with-bae' | 'barkada')[];
  timeOfDay: ('morning' | 'afternoon' | 'night')[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  rating?: number;
  reviewCount?: number;
  reviews?: Array<{
    author: string;
    rating: number;
    text: string;
    time: string;
  }>;
  website?: string;
}

// Server filtering response structure
export interface ServerFilteringResponse {
  success: boolean;
  results: ServerPlaceData[];
  source: 'cache' | 'api' | 'mixed';
  cacheHit: boolean;
  totalResults: number;
  performance: {
    responseTime: number;
    cacheHitRate: number;
    apiCallsMade: number;
  };
  metadata: {
    filtersApplied: string[];
    queryOptimization: string;
  };
}

// Server filtering error structure
export interface ServerFilteringError {
  error: string;
  code?: string;
  details?: any;
}

// Request structure for server filtering
export interface ServerFilteringRequest {
  filters: UserFilters;
  minResults?: number;
  useCache?: boolean;
}

// Validation functions
export function isValidServerPlaceData(data: any): data is ServerPlaceData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.location === 'string' &&
    Array.isArray(data.images) &&
    typeof data.budget === 'string' &&
    Array.isArray(data.tags) &&
    typeof data.description === 'string' &&
    typeof data.category === 'string'
  );
}

export function isValidServerFilteringResponse(data: any): data is ServerFilteringResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.success === 'boolean' &&
    Array.isArray(data.results) &&
    typeof data.source === 'string' &&
    typeof data.cacheHit === 'boolean' &&
    typeof data.totalResults === 'number' &&
    typeof data.performance === 'object' &&
    typeof data.metadata === 'object'
  );
} 