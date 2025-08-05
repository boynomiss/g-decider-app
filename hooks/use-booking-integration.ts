import { useState, useCallback } from 'react';
import { bookingIntegrationService } from '../utils/booking-integration';
import { Suggestion } from '../types/app';
import { PlaceData } from '../utils/place-mood-service';

type BookingInput = Suggestion | PlaceData;

interface BookingPlatform {
  name: string;
  deepLinkBase: string;
  webUrlBase: string;
  affiliateId?: string;
  apiKey?: string;
}

interface UseBookingIntegrationReturn {
  bookingPlatforms: BookingPlatform[];
  isLoading: boolean;
  error: string | null;
  getBookingOptions: (input: BookingInput) => Promise<void>;
  openBooking: (platform: BookingPlatform, options?: any) => Promise<boolean>;
  clearBookingOptions: () => void;
}

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
        restaurantData = {
          name: input.name,
          location: input.location,
          budget: input.budget,
          tags: input.tags,
          category: input.category
        };
      } else {
        restaurantData = {
          name: input.name,
          location: input.address || input.vicinity || input.formatted_address || 'Unknown location',
          budget: input.price_level === 1 ? 'P' : input.price_level === 2 ? 'PP' : 'PPP',
          tags: input.types || [],
          category: input.category
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