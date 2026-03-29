/**
 * Saved Places Interface Types
 * 
 * Defines saved-places-related interfaces
 */

import type { Suggestion } from '../../discovery/types';
import type { PlaceData } from '../../discovery/types';

// =================
// SAVED PLACES TYPES
// =================

export type SaveablePlace = Suggestion | PlaceData;

export interface SavedPlace extends Suggestion {
  savedAt: string;
  notes?: string;
  rating?: number;
  favorite?: boolean;
  // tags is inherited from Suggestion and remains required
}

export interface UseSavedPlacesReturn {
  savedPlaces: Suggestion[];
  isSaved: (placeId: string) => boolean;
  savePlace: (place: SaveablePlace) => void;
  removePlace: (placeId: string) => void;
  clearAll: () => void;
  isLoading: boolean;
  error: string | null;
}
