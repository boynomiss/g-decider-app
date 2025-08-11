/**
 * Monetization Services Index
 * 
 * Revenue generation, ads, discounts, and business logic.
 */

// 💰 ADVERTISING
export * from './ad-monetization-service';

// 🎫 DISCOUNTS
export * from './discount-service';

/**
 * Quick Start:
 * 
 * // Ad monetization
 * import { adMonetizationService } from '@/utils/monetization';
 * 
 * // Discount services
 * import { DiscountService } from '@/utils/monetization';
 * 
 * // Get targeted ads
 * const ad = adMonetizationService.getTargetedAd({ mood: 'hype', budget: 'PP' });
 * 
 * // Search for discounts
 * const discounts = await discountService.searchDiscounts({
 *   placeName: 'Restaurant Name',
 *   location: 'Manila',
 *   category: 'food'
 * });
 */