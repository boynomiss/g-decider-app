// Mock Google Places Hook
// Replace real API calls with mock data for UI development

import { useState, useCallback } from 'react';
import { mockGooglePlacesClient } from '../../../services/mock/api';
import { PlaceMoodData } from '../types';

export const useGooglePlacesMock = () => {
  const [places, setPlaces] = useState<PlaceMoodData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async (query: string, location?: { lat: number; lng: number }, distanceRange?: number, options?: { force?: boolean; randomize?: boolean }) => {
    console.log('🎯 Mock fetchPlaces called with:', { query, location, distanceRange, options });
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock places based on the query
      const mockPlaces: PlaceMoodData[] = [
        {
          id: 'mock_place_1',
          name: 'Mock Restaurant',
          location: '123 Mock Street, Mock City',
          images: ['https://via.placeholder.com/300x200/8B5FBF/FFFFFF?text=Mock+Restaurant'],
          budget: 'P',
          tags: ['restaurant', 'food'],
          description: 'This is a mock restaurant for testing purposes.',
          openHours: 'Open 9 AM - 10 PM',
          category: 'food',
          mood: 'neutral',
          socialContext: ['solo', 'with-bae', 'barkada'],
          timeOfDay: ['morning', 'afternoon', 'night'],
          coordinates: { lat: 37.7749, lng: -122.4194 },
          rating: 4.5,
          reviews: [
            {
              rating: 5,
              text: 'Great food and atmosphere!',
              time: new Date('2024-01-15').getTime()
            },
            {
              rating: 4,
              text: 'Nice place, good service.',
              time: new Date('2024-01-10').getTime()
            },
            {
              rating: 5,
              text: 'Highly recommended!',
              time: new Date('2024-01-05').getTime()
            }
          ],
          website: 'https://mockplace.com',
          phone: '+1 (555) 123-4567',
          price_level: 1,
          types: ['restaurant', 'food'],
          business_status: 'OPERATIONAL',
          open_now: true,
          vicinity: '123 Mock Street',
          formatted_address: '123 Mock Street, Mock City',
          mood_analysis: {
            score: 50,
            category: 'neutral',
            confidence: 0.8,
            descriptors: ['casual', 'friendly'],
            source: 'category-mapping'
          },
          photos: {
            thumbnail: ['https://via.placeholder.com/150x100/8B5FBF/FFFFFF?text=Thumb'],
            medium: ['https://via.placeholder.com/300x200/8B5FBF/FFFFFF?text=Medium'],
            large: ['https://via.placeholder.com/600x400/8B5FBF/FFFFFF?text=Large'],
            count: 3
          }
        },
        {
          id: 'mock_place_2',
          name: 'Mock Cafe',
          location: '456 Mock Avenue, Mock City',
          images: ['https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Mock+Cafe'],
          budget: 'PP',
          tags: ['cafe', 'food'],
          description: 'This is a mock cafe for testing purposes.',
          openHours: 'Open 7 AM - 8 PM',
          category: 'food',
          mood: 'chill',
          socialContext: ['solo', 'with-bae'],
          timeOfDay: ['morning', 'afternoon'],
          coordinates: { lat: 37.7849, lng: -122.4094 },
          rating: 4.2,
          reviews: [
            {
              rating: 4,
              text: 'Cozy cafe with good coffee.',
              time: new Date('2024-01-12').getTime()
            },
            {
              rating: 5,
              text: 'Perfect for morning meetings.',
              time: new Date('2024-01-08').getTime()
            },
            {
              rating: 4,
              text: 'Nice ambiance and friendly staff.',
              time: new Date('2024-01-03').getTime()
            }
          ],
          website: 'https://mockcafe.com',
          phone: '+1 (555) 987-6543',
          price_level: 2,
          types: ['cafe', 'food'],
          business_status: 'OPERATIONAL',
          open_now: true,
          vicinity: '456 Mock Avenue',
          formatted_address: '456 Mock Avenue, Mock City',
          mood_analysis: {
            score: 30,
            category: 'chill',
            confidence: 0.7,
            descriptors: ['relaxed', 'cozy'],
            source: 'category-mapping'
          },
          photos: {
            thumbnail: ['https://via.placeholder.com/150x100/45B7D1/FFFFFF?text=Thumb'],
            medium: ['https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Medium'],
            large: ['https://via.placeholder.com/600x400/45B7D1/FFFFFF?text=Large'],
            count: 2
          }
        }
      ];
      
      setPlaces(mockPlaces);
      setIsLoading(false);
      console.log('🎯 Mock places set:', mockPlaces.length);
    } catch (err) {
      setError('Mock fetchPlaces failed');
      setIsLoading(false);
      console.error('Mock fetchPlaces error:', err);
    }
  }, []);

  const clearPlaces = useCallback(() => {
    setPlaces([]);
    setError(null);
  }, []);

  const searchNearby = useCallback(async (params: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const results = await mockGooglePlacesClient.searchNearby(params);
      setIsLoading(false);
      return results;
    } catch (err) {
      setError('Mock search failed');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const getPlaceDetails = useCallback(async (placeId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const details = await mockGooglePlacesClient.getPlaceDetails(placeId);
      setIsLoading(false);
      return details;
    } catch (err) {
      setError('Mock place details failed');
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    places,
    isLoading,
    error,
    fetchPlaces,
    clearPlaces,
    searchNearby,
    getPlaceDetails
  };
};
