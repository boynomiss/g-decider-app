/**
 * Unified Filter Interface
 * 
 * Consolidates all filter interfaces from:
 * - UserFilters (types/app.ts)
 * - DiscoveryFilters (utils/place-discovery-logic.ts)
 * - QueryParams (utils/firebase-cache.ts)
 * - ServerFilteringRequest (types/server-filtering.ts)
 */
export interface UnifiedFilters {
  // Core filter types
  category: 'food' | 'activity' | 'something-new' | null;
  mood: number | null; // 0-100, 0 = chill, 100 = hype
  budget: 'P' | 'PP' | 'PPP' | null;
  timeOfDay: 'morning' | 'afternoon' | 'night' | null;
  socialContext: 'solo' | 'with-bae' | 'barkada' | null;
  distanceRange: number | null; // 0-100 percentage mapped to actual distances
  
  // Optional context
  location?: string;
  userLocation?: {
    lat: number;
    lng: number;
  };
  
  // Query options
  minResults?: number;
  tags?: string[];
}

/**
 * @deprecated Use UnifiedFilters instead
 * Kept for backward compatibility
 */
export interface UserFilters {
  mood: number; // 0-100, 0 = chill, 100 = hype
  category: 'food' | 'activity' | 'something-new' | null;
  budget: 'P' | 'PP' | 'PPP' | null;
  timeOfDay: 'morning' | 'afternoon' | 'night' | null;
  socialContext: 'solo' | 'with-bae' | 'barkada' | null;
  distanceRange: number | null; // in km, null means not explicitly set
}

export interface Review {
  author: string;
  rating: number;
  text: string;
  time: string;
}

export interface Suggestion {
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
  reviews?: Review[];
  website?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  isPremium: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  filters: UserFilters;
  retriesLeft: number;
  currentSuggestion: Suggestion | null;
  isLoading: boolean;
  showMoreFilters: boolean;
  effectiveFilters: {
    budget: 'P' | 'PP' | 'PPP';
    timeOfDay: 'morning' | 'afternoon' | 'night';
    socialContext: 'solo' | 'with-bae' | 'barkada';
    distanceRange: number;
  } | null;
  auth: AuthState;
}