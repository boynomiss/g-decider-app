/**
 * Mobile Utilities Index
 * 
 * Mobile-specific services and utilities.
 */

// 📍 LOCATION SERVICES
export * from './location-service';

/**
 * Quick Start:
 * 
 * // Location services
 * import { LocationService, locationService } from '@/utils/mobile';
 * 
 * // Get current location
 * const location = await locationService.getCurrentLocation({
 *   timeout: 10000,
 *   accuracy: Location.Accuracy.Balanced
 * });
 */