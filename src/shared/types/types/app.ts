/**
 * App Types
 * 
 * Core application state and user interface types
 */

import type { UserFilters } from '../../../features/filtering/types';
import type { Suggestion } from '../../../features/discovery/types';

// =================
// APP STATE INTERFACE
// =================

export interface AppState {
  filters: UserFilters;
  retriesLeft: number;
  currentSuggestion: any | null;
  isLoading: boolean;
  showMoreFilters: boolean;
  effectiveFilters: any | null;
  auth: any;
}

// =================
// USER INTERFACE
// =================

export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  defaultLocation?: {
    lat: number;
    lng: number;
  };
  favoriteCategories?: string[];
  budgetPreference?: string;
  moodPreference?: string;
}

// =================
// AUTH STATE
// =================

// AuthState is now defined in src/features/auth/types/auth-interfaces.ts
// This interface has been removed to avoid duplication
// export interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
// }
