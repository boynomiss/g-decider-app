import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Suggestion } from '../types/app';
import { PlaceData } from '../utils/place-mood-service';

type SaveablePlace = Suggestion | PlaceData;

interface UseSavedPlacesReturn {
  savedPlaces: Suggestion[];
  isLoading: boolean;
  isSaved: (place: SaveablePlace) => boolean;
  savePlace: (place: SaveablePlace) => Promise<void>;
  removePlace: (place: SaveablePlace) => Promise<void>;
  loadSavedPlaces: () => Promise<void>;
  clearSavedPlaces: () => Promise<void>;
}

const SAVED_PLACES_KEY = '@saved_places';

function toSuggestion(place: SaveablePlace): Suggestion {
  if ('id' in place) return place;
  // Convert PlaceData to Suggestion
  return {
    id: place.place_id,
    name: place.name,
    location: place.address || place.vicinity || place.formatted_address || 'Unknown location',
    images: place.photos?.medium || place.images?.urls || [],
    budget: place.price_level === 1 ? 'P' : place.price_level === 2 ? 'PP' : 'PPP',
    tags: place.types || [],
    description: place.description || `${place.name} is a great place to visit.`,
    openHours: place.opening_hours ? 'Open' : undefined,
    discount: undefined,
    category: place.category as any || 'food',
    mood: (place.final_mood as any) || 'both',
    socialContext: ['solo', 'with-bae', 'barkada'],
    timeOfDay: ['morning', 'afternoon', 'night'],
    coordinates: place.location,
    rating: place.rating,
    reviewCount: place.user_ratings_total,
    reviews: place.reviews || [],
    website: place.website
  };
}

export const useSavedPlaces = (): UseSavedPlacesReturn => {
  const [savedPlaces, setSavedPlaces] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const savePlace = useCallback(async (place: SaveablePlace) => {
    try {
      const suggestion = toSuggestion(place);
      const updated = [...savedPlaces, suggestion];
      await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(updated));
      setSavedPlaces(updated);
      console.log('💾 Saved place:', suggestion.name);
    } catch (error) {
      console.error('❌ Failed to save place:', error);
    }
  }, [savedPlaces]);

  const removePlace = useCallback(async (place: SaveablePlace) => {
    try {
      const suggestion = toSuggestion(place);
      const updated = savedPlaces.filter(p => p.id !== suggestion.id);
      await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(updated));
      setSavedPlaces(updated);
      console.log('🗑️ Removed place:', suggestion.name);
    } catch (error) {
      console.error('❌ Failed to remove place:', error);
    }
  }, [savedPlaces]);

  const isSaved = useCallback((place: SaveablePlace): boolean => {
    const suggestion = toSuggestion(place);
    return savedPlaces.some(p => p.id === suggestion.id);
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