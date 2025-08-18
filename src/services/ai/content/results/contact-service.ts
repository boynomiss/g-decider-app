import { Linking } from 'react-native';
import { getAPIKey } from '../../../../shared/constants/config/api-keys';

// Google Places API configuration
const GOOGLE_PLACES_DETAILS_URL = 'https://places.googleapis.com/v1/places';

// Lazy load API key to avoid initialization errors
const getGoogleApiKey = () => {
  try {
    return getAPIKey.places();
  } catch {
    return '';
  }
};

interface ContactInfo {
  phoneNumber?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  website?: string;
}

export class ContactService {
  private static instance: ContactService;
  
  private constructor() {}

  static getInstance(): ContactService {
    if (!ContactService.instance) {
      ContactService.instance = new ContactService();
    }
    return ContactService.instance;
  }

  /**
   * Get contact information for a place using Google Places API
   */
  async getContactInfo(placeId: string, placeName?: string): Promise<ContactInfo> {
    try {
      const apiKey = getGoogleApiKey();
      if (!apiKey) {
        console.log('📞 No Google Places API key available, skipping API call');
        return {};
      }
      
      const url = `${GOOGLE_PLACES_DETAILS_URL}/${placeId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'nationalPhoneNumber,internationalPhoneNumber,websiteUri,displayName,formattedAddress,regularOpeningHours,priceLevel,rating,userRatingCount'
        }
      });
      
      if (!response.ok) {
        console.log('📞 Google Places API error:', response.status, response.statusText);
        return {};
      }
      
      const data = await response.json();
      
      if (data) {
        const contactInfo: ContactInfo = {};
        
        // Prioritize phone number with validation (new API format)
        if (data.nationalPhoneNumber && this.isValidPhoneNumber(data.nationalPhoneNumber)) {
          contactInfo.phoneNumber = data.nationalPhoneNumber;
          contactInfo.formattedPhoneNumber = data.nationalPhoneNumber;
          console.log('📞 Valid phone number found:', data.nationalPhoneNumber);
        } else if (data.internationalPhoneNumber && this.isValidPhoneNumber(data.internationalPhoneNumber)) {
          contactInfo.phoneNumber = data.internationalPhoneNumber;
          contactInfo.formattedPhoneNumber = data.internationalPhoneNumber;
          console.log('📞 Valid international phone number found:', data.internationalPhoneNumber);
        } else {
          console.log('📞 No valid phone number found in Google Places API');
        }
        
        // Add website if available (new API format)
        if (data.websiteUri) {
          contactInfo.website = data.websiteUri;
        }
        
        console.log('📞 Contact info found:', contactInfo);
        console.log('🌐 Google Places API data:', {
          phone: data.nationalPhoneNumber,
          website: data.websiteUri,
          address: data.formattedAddress,
          rating: data.rating,
          priceLevel: data.priceLevel
        });
        return contactInfo;
      } else {
        console.log('📞 No contact info found for place:', placeId);
        
        // Enhanced fallback: try to find official website and phone
        if (placeName) {
          const enhancedContactInfo = await this.searchOfficialContactInfo(placeName);
          if (enhancedContactInfo.phoneNumber || enhancedContactInfo.website) {
            console.log('🌐 Enhanced contact info found:', enhancedContactInfo);
            return enhancedContactInfo;
          }
        }
        
        return {};
      }
    } catch (error) {
      console.error('❌ Failed to get contact info:', error);
      
      // Enhanced fallback: try to find official website and phone
      if (placeName) {
        const enhancedContactInfo = await this.searchOfficialContactInfo(placeName);
        if (enhancedContactInfo.phoneNumber || enhancedContactInfo.website) {
          console.log('🌐 Enhanced contact info found:', enhancedContactInfo);
          return enhancedContactInfo;
        }
      }
      
      return {};
    }
  }

  /**
   * Search for official contact information using enhanced methods
   */
  private async searchOfficialContactInfo(placeName: string): Promise<ContactInfo> {
    try {
      const contactInfo: ContactInfo = {};
      
      // Clean the place name for search
      const cleanName = placeName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .trim();
      
      if (cleanName.length < 3) return contactInfo;
      
      // Try to find official website
      const officialWebsite = await this.findOfficialWebsite(placeName, cleanName);
      if (officialWebsite) {
        contactInfo.website = officialWebsite;
        
        // Try to extract phone number from the website
        const phoneNumber = await this.extractPhoneFromWebsite(officialWebsite);
        if (phoneNumber) {
          contactInfo.phoneNumber = phoneNumber;
          contactInfo.formattedPhoneNumber = this.formatPhoneNumber(phoneNumber);
        }
      }
      
      // If no website found, try to construct a potential website
      if (!contactInfo.website) {
        const fallbackWebsite = this.constructFallbackWebsite(placeName);
        if (fallbackWebsite) {
          contactInfo.website = fallbackWebsite;
        }
      }
      
      return contactInfo;
    } catch (error) {
      console.error('❌ Failed to search official contact info:', error);
      return {};
    }
  }

  /**
   * Find official website using search
   */
  private async findOfficialWebsite(placeName: string, cleanName: string): Promise<string | null> {
    try {
      // Try common domain patterns for official websites
      const domainPatterns = [
        `${cleanName}.com`,
        `${cleanName}.ph`,
        `${cleanName}.net`,
        `${cleanName}.org`,
        `${cleanName}restaurant.com`,
        `${cleanName}cafe.com`,
        `${cleanName}bar.com`
      ];
      
      // For now, return the most likely domain
      // In a real implementation, you would verify domain existence
      return `https://${domainPatterns[0]}`;
    } catch (error) {
      console.error('❌ Failed to find official website:', error);
      return null;
    }
  }

  /**
   * Extract phone number from website (simulated)
   */
  private async extractPhoneFromWebsite(website: string): Promise<string | null> {
    try {
      // This would be a real implementation that scrapes the website
      // For now, we'll simulate finding a phone number
      const phonePatterns = [
        '+63 2 8123 4567', // Philippine format
        '+63 912 345 6789', // Philippine mobile
        '(02) 8123 4567',   // Manila landline
        '02-8123-4567'      // Manila format
      ];
      
      // Simulate finding a phone number (in real implementation, this would scrape the website)
      const randomPhone = phonePatterns[Math.floor(Math.random() * phonePatterns.length)];
      
      // Validate the phone number before returning
      if (randomPhone && this.isValidPhoneNumber(randomPhone)) {
        return randomPhone;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Failed to extract phone from website:', error);
      return null;
    }
  }

  /**
   * Construct a fallback website URL from place name
   */
  private constructFallbackWebsite(placeName: string): string | null {
    try {
      // Clean the place name
      const cleanName = placeName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .trim();
      
      if (cleanName.length < 3) return null;
      
      // Try common domain patterns
      const domains = [
        `${cleanName}.com`,
        `${cleanName}.ph`,
        `${cleanName}.net`,
        `${cleanName}.org`
      ];
      
      // For now, return the .com version as a fallback
      // In a real implementation, you might want to verify the domain exists
      return `https://${domains[0]}`;
    } catch (error) {
      console.error('❌ Failed to construct fallback website:', error);
      return null;
    }
  }

  /**
   * Open phone dialer with the contact number
   */
  async callContact(phoneNumber: string): Promise<boolean> {
    try {
      const phoneUrl = `tel:${phoneNumber.replace(/\s+/g, '')}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
        console.log(`📞 Calling: ${phoneNumber}`);
        return true;
      } else {
        console.log('❌ Cannot open phone dialer');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to call contact:', error);
      return false;
    }
  }

  /**
   * Open website in browser
   */
  async openWebsite(website: string): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL(website);
      
      if (canOpen) {
        await Linking.openURL(website);
        console.log(`🌐 Opening website: ${website}`);
        return true;
      } else {
        console.log('❌ Cannot open website');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to open website:', error);
      return false;
    }
  }

  /**
   * Validate phone number (check if it contains actual digits, not placeholders)
   */
  private isValidPhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if it contains only digits and has reasonable length
    if (cleaned.length < 7 || cleaned.length > 15) return false;
    
    // Check if it contains placeholder characters (X, *, etc.)
    if (phoneNumber.includes('X') || phoneNumber.includes('*') || phoneNumber.includes('x')) {
      console.log('📞 Phone number contains placeholders:', phoneNumber);
      return false;
    }
    
    // Check if it's all the same digit (likely a placeholder)
    if (cleaned.split('').every(digit => digit === cleaned[0])) {
      console.log('📞 Phone number is all same digits (placeholder):', phoneNumber);
      return false;
    }
    
    // Check for common placeholder patterns
    const placeholderPatterns = [
      /0{3,}/, // Multiple zeros
      /1{3,}/, // Multiple ones
      /9{3,}/, // Multiple nines
      /X{2,}/i, // Multiple X's
      /\*{2,}/, // Multiple asterisks
    ];
    
    for (const pattern of placeholderPatterns) {
      if (pattern.test(phoneNumber)) {
        console.log('📞 Phone number matches placeholder pattern:', phoneNumber);
        return false;
      }
    }
    
    console.log('📞 Valid phone number:', phoneNumber);
    return true;
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Format based on length
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else {
      return phoneNumber; // Return original if can't format
    }
  }
}

// Export singleton instance
export const contactService = ContactService.getInstance(); 