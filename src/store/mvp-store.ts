/**
 * MVP Store - Simplified state management with Firebase integration
 */

import { create } from 'zustand';
import { UserPreferences, Place, FilterResult } from '../types/mvp-types';
import { DEFAULT_USER_PREFERENCES } from '../config/mvp-config';
import { PlacesService } from '../services/mvp/firebase-service';

interface MVPStore {
  // User preferences
  userPreferences: UserPreferences;
  
  // Places data
  allPlaces: Place[];
  filteredPlaces: Place[];
  totalResults: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  setFilteredPlaces: (places: Place[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Firebase actions
  fetchAllPlaces: () => Promise<void>;
  searchPlaces: (preferences: UserPreferences) => Promise<void>;
  addPlace: (place: Omit<Place, 'id' | 'metadata'>) => Promise<string>;
  updatePlace: (placeId: string, updates: Partial<Place>) => Promise<void>;
  deletePlace: (placeId: string) => Promise<void>;
}

export const useMVPStore = create<MVPStore>((set, get) => ({
  // Initial state
  userPreferences: DEFAULT_USER_PREFERENCES,
  allPlaces: [],
  filteredPlaces: [],
  totalResults: 0,
  isLoading: false,
  error: null,
  
  // Actions
  updatePreferences: (newPreferences) => {
    set((state) => ({
      userPreferences: { ...state.userPreferences, ...newPreferences }
    }));
  },
  
  resetPreferences: () => {
    set({ userPreferences: DEFAULT_USER_PREFERENCES });
  },
  
  setFilteredPlaces: (places) => {
    set({ 
      filteredPlaces: places,
      totalResults: places.length
    });
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  setError: (error) => {
    set({ error });
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  // Firebase actions
  fetchAllPlaces: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if database has places, add sample data if empty
      await PlacesService.addSamplePlaces();
      
      const places = await PlacesService.getAllPlaces();
      set({ allPlaces: places, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch places',
        isLoading: false 
      });
    }
  },
  
  searchPlaces: async (preferences: UserPreferences) => {
    try {
      set({ isLoading: true, error: null });
      
      // Ensure database has sample data
      await PlacesService.addSamplePlaces();
      
      const places = await PlacesService.searchPlaces(preferences);
      set({ 
        filteredPlaces: places,
        totalResults: places.length,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search places',
        isLoading: false 
      });
    }
  },
  
  addPlace: async (place: Omit<Place, 'id' | 'metadata'>) => {
    try {
      set({ isLoading: true, error: null });
      const placeId = await PlacesService.addPlace(place);
      
      // Refresh places list
      await get().fetchAllPlaces();
      
      set({ isLoading: false });
      return placeId;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add place',
        isLoading: false 
      });
      throw error;
    }
  },
  
  updatePlace: async (placeId: string, updates: Partial<Place>) => {
    try {
      set({ isLoading: true, error: null });
      await PlacesService.updatePlace(placeId, updates);
      
      // Refresh places list
      await get().fetchAllPlaces();
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update place',
        isLoading: false 
      });
      throw error;
    }
  },
  
  deletePlace: async (placeId: string) => {
    try {
      set({ isLoading: true, error: null });
      await PlacesService.deletePlace(placeId);
      
      // Refresh places list
      await get().fetchAllPlaces();
      
      set({ isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete place',
        isLoading: false 
      });
      throw error;
    }
  }
}));
