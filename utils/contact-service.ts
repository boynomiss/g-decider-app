import { Linking, Platform } from 'react-native';

// Google Places API configuration
const GOOGLE_API_KEY = 'AIzaSyAdCy-m_2Rc_3trJm3vEbL-8HUqZw33SKg';
const GOOGLE_PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

interface ContactInfo {
  phoneNumber?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
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
  async getContactInfo(placeId: string): Promise<ContactInfo> {
    try {
      const url = `${GOOGLE_PLACES_DETAILS_URL}?place_id=${placeId}&fields=formatted_phone_number,international_phone_number&key=${GOOGLE_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        return {
          phoneNumber: data.result.formatted_phone_number,
          formattedPhoneNumber: data.result.formatted_phone_number,
          internationalPhoneNumber: data.result.international_phone_number
        };
      } else {
        console.log('📞 No contact info found for place:', placeId);
        return {};
      }
    } catch (error) {
      console.error('❌ Failed to get contact info:', error);
      return {};
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