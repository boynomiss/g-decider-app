import { Linking } from 'react-native';

export interface DiscountInfo {
  platform: string;
  discount: string;
  originalPrice?: string;
  discountedPrice?: string;
  validUntil?: string;
  terms?: string;
  deepLink?: string;
  webUrl?: string;
}

interface DiscountSearchParams {
  placeName: string;
  location: string;
  category: 'food' | 'activity' | 'something-new';
  tags?: string[];
}

export class DiscountService {
  private static instance: DiscountService;
  
  // API endpoints for discount checking (these would be real endpoints)
  private readonly EATIGO_API_BASE = 'https://api.eatigo.com/v1';
  private readonly KLOOK_API_BASE = 'https://api.klook.com/v1';
  
  private constructor() {}
  
  static getInstance(): DiscountService {
    if (!DiscountService.instance) {
      DiscountService.instance = new DiscountService();
    }
    return DiscountService.instance;
  }

  /**
   * Search for active discounts on Eatigo and Klook
   */
  async searchDiscounts(params: DiscountSearchParams): Promise<DiscountInfo[]> {
    const discounts: DiscountInfo[] = [];
    
    try {
      // Search Eatigo for restaurant discounts
      if (params.category === 'food') {
        const eatigoDiscounts = await this.searchEatigoDiscounts(params);
        discounts.push(...eatigoDiscounts);
      }
      
      // Search Klook for activity discounts
      if (params.category === 'activity' || this.hasActivityTags(params.tags)) {
        const klookDiscounts = await this.searchKlookDiscounts(params);
        discounts.push(...klookDiscounts);
      }
      
      console.log(`🎉 Found ${discounts.length} active discounts`);
      return discounts;
    } catch (error) {
      console.error('❌ Error searching discounts:', error);
      return [];
    }
  }

  /**
   * Search Eatigo for restaurant discounts
   */
  private async searchEatigoDiscounts(params: DiscountSearchParams): Promise<DiscountInfo[]> {
    try {
      // This would be a real API call to Eatigo
      // For now, we'll simulate the response
      const response = await this.simulateEatigoAPI(params);
      
      if (response.success && response.discounts) {
        return response.discounts.map((discount: any) => ({
          platform: 'Eatigo',
          discount: discount.discountText,
          originalPrice: discount.originalPrice,
          discountedPrice: discount.discountedPrice,
          validUntil: discount.validUntil,
          terms: discount.terms,
          deepLink: discount.deepLink,
          webUrl: discount.webUrl
        }));
      }
      
      return [];
    } catch (error) {
      console.error('❌ Eatigo discount search failed:', error);
      return [];
    }
  }

  /**
   * Search Klook for activity discounts
   */
  private async searchKlookDiscounts(params: DiscountSearchParams): Promise<DiscountInfo[]> {
    try {
      // This would be a real API call to Klook
      // For now, we'll simulate the response
      const response = await this.simulateKlookAPI(params);
      
      if (response.success && response.discounts) {
        return response.discounts.map((discount: any) => ({
          platform: 'Klook',
          discount: discount.discountText,
          originalPrice: discount.originalPrice,
          discountedPrice: discount.discountedPrice,
          validUntil: discount.validUntil,
          terms: discount.terms,
          deepLink: discount.deepLink,
          webUrl: discount.webUrl
        }));
      }
      
      return [];
    } catch (error) {
      console.error('❌ Klook discount search failed:', error);
      return [];
    }
  }

  /**
   * Simulate Eatigo API call
   */
  private async simulateEatigoAPI(params: DiscountSearchParams): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate availability check
    const isAvailable = this.checkEatigoAvailability(params);
    
    if (!isAvailable) {
      return { success: false, message: 'Not available on Eatigo' };
    }
    
    // Simulate discount data
    const discountPercentage = Math.floor(Math.random() * 30) + 10; // 10-40% discount
    const originalPrice = Math.floor(Math.random() * 50) + 20; // $20-70
    const discountedPrice = Math.floor(originalPrice * (1 - discountPercentage / 100));
    
    return {
      success: true,
      discounts: [
        {
          discountText: `Up to ${discountPercentage}% off`,
          originalPrice: `$${originalPrice}`,
          discountedPrice: `$${discountedPrice}`,
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          terms: 'Valid for dine-in only. Subject to availability.',
          deepLink: `eatigo://restaurant/${encodeURIComponent(params.placeName)}`,
          webUrl: `https://eatigo.com/restaurant/${encodeURIComponent(params.placeName)}`
        }
      ]
    };
  }

  /**
   * Simulate Klook API call
   */
  private async simulateKlookAPI(params: DiscountSearchParams): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate availability check
    const isAvailable = this.checkKlookAvailability(params);
    
    if (!isAvailable) {
      return { success: false, message: 'Not available on Klook' };
    }
    
    // Simulate discount data
    const discountPercentage = Math.floor(Math.random() * 40) + 15; // 15-55% discount
    const originalPrice = Math.floor(Math.random() * 100) + 30; // $30-130
    const discountedPrice = Math.floor(originalPrice * (1 - discountPercentage / 100));
    
    return {
      success: true,
      discounts: [
        {
          discountText: `Save ${discountPercentage}%`,
          originalPrice: `$${originalPrice}`,
          discountedPrice: `$${discountedPrice}`,
          validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
          terms: 'Valid for online booking. Free cancellation up to 24h before.',
          deepLink: `klook://activity/${encodeURIComponent(params.placeName)}`,
          webUrl: `https://klook.com/activity/${encodeURIComponent(params.placeName)}`
        }
      ]
    };
  }

  /**
   * Check if place is available on Eatigo
   */
  private checkEatigoAvailability(params: DiscountSearchParams): boolean {
    const supportedLocations = [
      'manila', 'makati', 'quezon city', 'taguig', 'pasig', 'mandaluyong',
      'philippines', 'singapore', 'bangkok', 'jakarta', 'kuala lumpur'
    ];
    
    return params.category === 'food' && 
           supportedLocations.some(location => 
             params.location.toLowerCase().includes(location)
           );
  }

  /**
   * Check if place is available on Klook
   */
  private checkKlookAvailability(params: DiscountSearchParams): boolean {
    const touristLocations = [
      'manila', 'makati', 'quezon city', 'taguig', 'pasig', 'mandaluyong',
      'philippines', 'singapore', 'bangkok', 'jakarta', 'kuala lumpur',
      'tokyo', 'seoul', 'taipei', 'hong kong'
    ];
    
    return (params.category === 'activity' || this.hasActivityTags(params.tags)) &&
           touristLocations.some(location => 
             params.location.toLowerCase().includes(location)
           );
  }

  /**
   * Check if tags indicate activity-like place
   */
  private hasActivityTags(tags?: string[]): boolean {
    if (!tags) return false;
    
    const activityTags = [
      'tour', 'experience', 'workshop', 'class', 'lesson', 'adventure',
      'museum', 'theater', 'cinema', 'concert', 'show', 'exhibition',
      'gallery', 'spa', 'massage', 'wellness', 'outdoor', 'hiking'
    ];
    
    return tags.some(tag => 
      activityTags.some(activityTag => 
        tag.toLowerCase().includes(activityTag)
      )
    );
  }

  /**
   * Open discount link
   */
  async openDiscount(discount: DiscountInfo): Promise<boolean> {
    try {
      // Try deep link first
      if (discount.deepLink) {
        const canOpen = await Linking.canOpenURL(discount.deepLink);
        if (canOpen) {
          await Linking.openURL(discount.deepLink);
          console.log(`🔗 Opened ${discount.platform} discount via deep link`);
          return true;
        }
      }
      
      // Fallback to web URL
      if (discount.webUrl) {
        await Linking.openURL(discount.webUrl);
        console.log(`🌐 Opened ${discount.platform} discount via web URL`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Failed to open ${discount.platform} discount:`, error);
      return false;
    }
  }

  /**
   * Get discount display text
   */
  getDiscountDisplayText(discount: DiscountInfo): string {
    return `🎉 ${discount.discount} on ${discount.platform}`;
  }
}

export const discountService = DiscountService.getInstance(); 