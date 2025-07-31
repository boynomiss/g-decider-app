import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Suggestion } from '../types/app';

interface UseSavedPlacesReturn {
  savedPlaces: Suggestion[];
  isLoading: boolean;
  isSaved: (suggestion: Suggestion) => boolean;
  savePlace: (suggestion: Suggestion) => Promise<void>;
  removePlace: (suggestion: Suggestion) => Promise<void>;
  loadSavedPlaces: () => Promise<void>;
  clearSavedPlaces: () => Promise<void>;
}

const SAVED_PLACES_KEY = '@saved_places';

export const useSavedPlaces = (): UseSavedPlacesReturn => {
  const [savedPlaces, setSavedPlaces] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load saved places on mount
  useEffect(() => {
    loadSavedPlaces();
  }, []);

  const loadSavedPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      const saved = await AsyncStorage.getItem(SAVED_PLACES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedPlaces(parsed);
        console.log('📚 Loaded saved places:', parsed.length);
      }
    } catch (error) {
      console.error('❌ Failed to load saved places:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePlace = useCallback(async (suggestion: Suggestion) => {
    try {
      const updated = [...savedPlaces, suggestion];
      await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(updated));
      setSavedPlaces(updated);
      console.log('💾 Saved place:', suggestion.name);
    } catch (error) {
      console.error('❌ Failed to save place:', error);
    }
  }, [savedPlaces]);

  const removePlace = useCallback(async (suggestion: Suggestion) => {
    try {
      const updated = savedPlaces.filter(place => place.id !== suggestion.id);
      await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(updated));
      setSavedPlaces(updated);
      console.log('🗑️ Removed place:', suggestion.name);
    } catch (error) {
      console.error('❌ Failed to remove place:', error);
    }
  }, [savedPlaces]);

  const isSaved = useCallback((suggestion: Suggestion): boolean => {
    return savedPlaces.some(place => place.id === suggestion.id);
  }, [savedPlaces]);

  const clearSavedPlaces = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(SAVED_PLACES_KEY);
      setSavedPlaces([]);
      console.log('🗑️ Cleared all saved places');
    } catch (error) {
      console.error('❌ Failed to clear saved places:', error);
    }
  }, []);

  return {
    savedPlaces,
    isLoading,
    isSaved,
    savePlace,
    removePlace,
    loadSavedPlaces,
    clearSavedPlaces
  };
}; 