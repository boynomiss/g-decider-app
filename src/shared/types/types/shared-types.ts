/**
 * Shared Types
 * 
 * Cross-cutting types used across multiple features
 * These types are not specific to any single feature
 */

// Import types from discovery to avoid duplication
import type { Suggestion } from '../../../features/discovery/types';
import type { UserFilters } from '../../../features/filtering/types';
import type { AuthState } from '../../../features/auth/types';

// =================
// APP STATE INTERFACES
// =================

export interface Review {
  author: string;
  rating: number;
  text: string;
  time: string;
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
  // Additional properties for the new filtering system
  loadingState: 'initial' | 'searching' | 'expanding-distance' | 'limit-reach' | 'complete' | 'error';
  userLocation: {
    lat: number;
    lng: number;
  } | null;
  apiReadyFilters: Map<string, UserFilters>;
  serverFilteringEnabled: boolean;
  serverFilteringError: string | null;
  lastServerResponse: any; // TODO: Replace with proper type
  isLegacyMode: boolean;
  discoveryInitialized: boolean;
  lastDiscoveryTimestamp: number;
  currentResults: any; // TODO: Replace with proper type
  isDiscovering: boolean;
  discoveryError: string | null;
}

// =================
// HOOK RETURN TYPES (Cross-cutting)
// =================

export interface UseAppStoreReturn {
  filters: UserFilters;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  apiReadyFilters: Map<string, UserFilters>;
  convertPlaceToSuggestion: (place: any) => void;
  openInMaps: (place: any) => void;
  consolidateFilters: () => UserFilters;
  discoveryState: {
    places: any[];
    loadingState: string;
    currentRadius: number;
  };
}

export interface UseAppStoreV2Return {
  filters: UserFilters;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  resetFilters: () => void;
  apiReadyFilters: Map<string, UserFilters>;
  convertPlaceToSuggestion: (place: any) => Suggestion;
  openInMaps: (place: any) => void;
  consolidateFilters: () => UserFilters;
  discoveryState: {
    places: any[];
    loadingState: string;
    currentRadius: number;
  };
}

export interface UseComponentValidationReturn<T extends React.ComponentType<any>> {
  isValid: boolean;
  errors: string[];
  ValidatedComponent: T;
  validateProps: (props: any) => boolean;
}

// =================
// LEGACY COMPATIBILITY TYPES
// =================

// These types are kept for backward compatibility during migration
// They will be removed once all code has been migrated to use feature-specific types

export interface UsePlaceDiscoveryReturn {
  places: Suggestion[];
  isLoading: boolean;
  error: string | null;
  discoverPlaces: () => Promise<void>;
  clearResults: () => void;
}

export interface UseServerFilteringReturn {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  results: any[];
  enableServerFiltering: () => void;
  disableServerFiltering: () => void;
  applyServerFilters: (filters: UserFilters) => Promise<void>;
}
