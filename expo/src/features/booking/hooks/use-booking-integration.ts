import { useState, useCallback } from 'react';
import { bookingIntegrationService } from '../../../services/api/api/booking-integration';
import type { BookingInput, BookingPlatform, UseBookingIntegrationReturn } from '../types/booking-interfaces';

export const useBookingIntegration = (): UseBookingIntegrationReturn => {
  const [bookingPlatforms, setBookingPlatforms] = useState<BookingPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBookingOptions = useCallback(async (input: BookingInput) => {
    if (!input) return;

    setIsLoading(true);
    setError(null);

    try {
      let restaurantData;
      if ('id' in input) {
        // This is a Suggestion type
        restaurantData = {
          name: input.name,
          location: input.location,
          budget: input.budget,
          tags: input.tags,
          category: input.category
        };
      } else {
        // This is a PlaceData type
        restaurantData = {
          name: input.name || 'Unknown Place',
          location: (input as any).address || (input as any).vicinity || (input as any).formatted_address || 'Unknown location',
          budget: (input as any).price_level === 1 ? 'P' : (input as any).price_level === 2 ? 'PP' : 'PPP',
          tags: (input as any).types || [],
          category: input.category || 'food'
        };
      }

      const options = await bookingIntegrationService.getBookingOptions(restaurantData);
      setBookingPlatforms(options);
      console.log('🔗 Found booking options:', options.map(opt => opt.name));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get booking options';
      setError(errorMessage);
      console.error('❌ Booking options failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openBooking = useCallback(async (platform: BookingPlatform, options?: any) => {
    try {
      const bookingOptions = {
        restaurantName: options?.restaurantName || '',
        location: options?.location || '',
        date: options?.date,
        time: options?.time,
        partySize: options?.partySize || 2,
        cuisine: options?.cuisine,
        budget: options?.budget
      };

      const success = await bookingIntegrationService.openBooking(platform, bookingOptions);
      if (success) {
        console.log(`✅ Successfully opened ${platform.name} booking`);
      } else {
        console.log(`❌ Failed to open ${platform.name} booking`);
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open booking';
      console.error('❌ Booking failed:', errorMessage);
      return false;
    }
  }, []);

  const clearBookingOptions = useCallback(() => {
    setBookingPlatforms([]);
    setError(null);
  }, []);

  return {
    bookingPlatforms,
    isLoading,
    error,
    getBookingOptions,
    openBooking,
    clearBookingOptions
  };
}; 