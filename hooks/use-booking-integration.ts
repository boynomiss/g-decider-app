import { useState, useCallback } from 'react';
import { bookingIntegrationService } from '../utils/booking-integration';
import { Suggestion } from '../types/app';

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
  getBookingOptions: (suggestion: Suggestion) => Promise<void>;
  openBooking: (platform: BookingPlatform, options?: any) => Promise<boolean>;
  clearBookingOptions: () => void;
}

export const useBookingIntegration = (): UseBookingIntegrationReturn => {
  const [bookingPlatforms, setBookingPlatforms] = useState<BookingPlatform[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getBookingOptions = useCallback(async (suggestion: Suggestion) => {
    if (!suggestion) return;

    setIsLoading(true);
    setError(null);

    try {
      // Convert suggestion to restaurant data format
      const restaurantData = {
        name: suggestion.name,
        location: suggestion.location,
        budget: suggestion.budget,
        tags: suggestion.tags,
        category: suggestion.category
      };

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