import { Linking, Platform } from 'react-native';

// Booking platform configurations
interface BookingPlatform {
  name: string;
  deepLinkBase: string;
  webUrlBase: string;
  affiliateId?: string;
  apiKey?: string;
}

interface BookingOptions {
  restaurantName: string;
  location: string;
  date?: string;
  time?: string;
  partySize?: number;
  cuisine?: string;
  budget?: string;
}

export class BookingIntegrationService {
  private static instance: BookingIntegrationService;
  
  // Configure booking platforms
  private platforms: BookingPlatform[] = [
    {
      name: 'Eatigo',
      deepLinkBase: 'eatigo://restaurant/',
      webUrlBase: 'https://eatigo.com/restaurant/',
      affiliateId: 'your-eatigo-affiliate-id' // Replace with actual affiliate ID
    },
    {
      name: 'Klook',
      deepLinkBase: 'klook://activity/',
      webUrlBase: 'https://klook.com/activity/',
      affiliateId: 'your-klook-affiliate-id' // Replace with actual affiliate ID
    }
  ];

  private constructor() {}

  static getInstance(): BookingIntegrationService {
    if (!BookingIntegrationService.instance) {
      BookingIntegrationService.instance = new BookingIntegrationService();
    }
    return BookingIntegrationService.instance;
  }

  /**
   * Get available booking options for a restaurant
   */
  async getBookingOptions(restaurantData: any): Promise<BookingPlatform[]> {
    const options: BookingPlatform[] = [];
    
    // Check if restaurant is available on each platform
    for (const platform of this.platforms) {
      const isAvailable = await this.checkAvailability(restaurantData, platform);
      if (isAvailable) {
        options.push(platform);
      }
    }
    
    return options;
  }

  /**
   * Check if restaurant is available on a specific platform
   */
  private async checkAvailability(restaurantData: any, platform: BookingPlatform): Promise<boolean> {
    // This would typically make an API call to check availability
    // For now, we'll simulate availability based on restaurant data
    
    const { name, location, budget } = restaurantData;
    
    // Simulate availability logic
    if (platform.name === 'Eatigo') {
      // Eatigo typically has restaurants in Asia
      return location.toLowerCase().includes('manila') || 
             location.toLowerCase().includes('makati') ||
             location.toLowerCase().includes('philippines');
    }
    
    if (platform.name === 'Klook') {
      // Klook has activities and some restaurants
      return true; // Klook has broader availability
    }
    
    return false;
  }

  /**
   * Open booking platform with deep link or web URL
   */
  async openBooking(platform: BookingPlatform, options: BookingOptions): Promise<boolean> {
    try {
      const url = this.buildBookingUrl(platform, options);
      
      // Try deep link first
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
        console.log(`🔗 Opened ${platform.name} booking via deep link`);
        return true;
      } else {
        // Fallback to web URL
        const webUrl = this.buildWebUrl(platform, options);
        await Linking.openURL(webUrl);
        console.log(`🌐 Opened ${platform.name} booking via web URL`);
        return true;
      }
    } catch (error) {
      console.error(`❌ Failed to open ${platform.name} booking:`, error);
      return false;
    }
  }

  /**
   * Build deep link URL for booking platform
   */
  private buildBookingUrl(platform: BookingPlatform, options: BookingOptions): string {
    const { restaurantName, location, date, time, partySize } = options;
    
    // Encode parameters for URL
    const encodedName = encodeURIComponent(restaurantName);
    const encodedLocation = encodeURIComponent(location);
    
    let url = platform.deepLinkBase;
    
    // Add affiliate ID if available
    if (platform.affiliateId) {
      url += `?affiliate=${platform.affiliateId}`;
    }
    
    // Add booking parameters
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (time) params.append('time', time);
    if (partySize) params.append('party', partySize.toString());
    
    if (params.toString()) {
      url += (platform.affiliateId ? '&' : '?') + params.toString();
    }
    
    return url;
  }

  /**
   * Build web URL for booking platform
   */
  private buildWebUrl(platform: BookingPlatform, options: BookingOptions): string {
    const { restaurantName, location, date, time, partySize } = options;
    
    // Encode parameters for URL
    const encodedName = encodeURIComponent(restaurantName);
    const encodedLocation = encodeURIComponent(location);
    
    let url = platform.webUrlBase;
    
    // Add affiliate ID if available
    if (platform.affiliateId) {
      url += `?affiliate=${platform.affiliateId}`;
    }
    
    // Add booking parameters
    const params = new URLSearchParams();
    params.append('restaurant', encodedName);
    params.append('location', encodedLocation);
    if (date) params.append('date', date);
    if (time) params.append('time', time);
    if (partySize) params.append('party', partySize.toString());
    
    url += (platform.affiliateId ? '&' : '?') + params.toString();
    
    return url;
  }

  /**
   * Get booking button text based on platform
   */
  getBookingButtonText(platform: BookingPlatform): string {
    switch (platform.name) {
      case 'Eatigo':
        return 'Book on Eatigo';
      case 'Klook':
        return 'Book on Klook';
      default:
        return `Book on ${platform.name}`;
    }
  }

  /**
   * Get platform icon or color
   */
  getPlatformStyle(platform: BookingPlatform): { color: string; backgroundColor: string } {
    switch (platform.name) {
      case 'Eatigo':
        return { color: '#FF6B35', backgroundColor: '#FFF5F2' };
      case 'Klook':
        return { color: '#00B4D8', backgroundColor: '#F0F9FF' };
      default:
        return { color: '#8B5FBF', backgroundColor: '#F8F5FF' };
    }
  }
}

// Export singleton instance
export const bookingIntegrationService = BookingIntegrationService.getInstance(); 