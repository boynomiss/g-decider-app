/**
 * Booking Interface Types
 * 
 * Defines booking-related interfaces
 * 
 * CONSOLIDATED: This file now contains all booking interfaces
 * merged from multiple sources to eliminate duplication.
 */

import type { Suggestion } from '../../discovery/types';
import type { PlaceData } from '../../discovery/types';

// =================
// BOOKING TYPES
// =================

export type BookingInput = Suggestion | PlaceData;

export interface UseBookingIntegrationReturn {
  bookingPlatforms: BookingPlatform[];
  isLoading: boolean;
  error: string | null;
  getBookingOptions: (input: BookingInput) => Promise<void>;
  openBooking: (platform: BookingPlatform, options?: any) => Promise<boolean>;
  clearBookingOptions: () => void;
}

// =================
// BOOKING PLATFORM INTERFACE
// =================

export interface BookingPlatform {
  id: string;
  name: string;
  url: string;
  deepLinkBase?: string; // Service-specific deep link support
  webUrlBase?: string; // Service-specific web URL support
  icon: string;
  color: string;
  backgroundColor: string;
  supportedTypes: string[];
  availabilityCheck: boolean;
  directBooking: boolean;
  commission: number;
  rating: number;
  reviewCount: number;
  affiliateId?: string; // Service-specific affiliate tracking
  apiKey?: string; // Service-specific API key
}

// =================
// BOOKING OPTIONS INTERFACE
// =================

export interface BookingOptions {
  restaurantName: string;
  location: string;
  date?: string;
  time?: string;
  partySize?: number;
  cuisine?: string;
}

// =================
// BOOKING CONTEXT INTERFACE
// =================

export interface BookingContext {
  restaurantName?: string;
  cuisine?: string;
  location?: string;
  date?: string;
  time?: string;
  partySize?: number;
}
