export interface UserFilters {
  mood: number; // 0-100, 0 = chill, 100 = hype
  category: 'food' | 'activity' | 'something-new' | null;
  budget: 'P' | 'PP' | 'PPP' | null;
  timeOfDay: 'morning' | 'afternoon' | 'night' | null;
  socialContext: 'solo' | 'with-bae' | 'barkada' | null;
  distanceRange: number | null; // in km, null means not explicitly set
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