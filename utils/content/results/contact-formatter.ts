/**
 * Contact Details Formatter Utility
 * 
 * This utility extracts and formats contact information from Google Places API responses
 * to provide clean, frontend-ready contact details.
 */

export interface ContactDetails {
  website?: string;
  phone?: string;
  formattedPhone?: string;
  internationalPhone?: string;
  email?: string;
  hasContact: boolean;
}

/**
 * Extracts and formats contact details from Google Places API response
 * Provides clean, frontend-ready contact information
 */
export function extractContactDetails(placeData: any): ContactDetails {
  const contact: ContactDetails = {
    hasContact: false
  };

  // Extract website URL
  if (placeData.websiteUri || placeData.website) {
    const websiteUrl = placeData.websiteUri || placeData.website;
    contact.website = formatWebsiteUrl(websiteUrl);
    contact.hasContact = true;
  }

  // Extract phone numbers
  if (placeData.nationalPhoneNumber) {
    contact.phone = placeData.nationalPhoneNumber;
    contact.formattedPhone = formatPhoneNumber(placeData.nationalPhoneNumber);
    contact.hasContact = true;
  }

  if (placeData.internationalPhoneNumber) {
    contact.internationalPhone = placeData.internationalPhoneNumber;
    if (!contact.phone) {
      contact.phone = placeData.internationalPhoneNumber;
      contact.formattedPhone = formatPhoneNumber(placeData.internationalPhoneNumber);
    }
    contact.hasContact = true;
  }

  // Legacy API support
  if (!contact.phone && placeData.formatted_phone_number) {
    contact.phone = placeData.formatted_phone_number;
    contact.formattedPhone = formatPhoneNumber(placeData.formatted_phone_number);
    contact.hasContact = true;
  }

  if (!contact.internationalPhone && placeData.international_phone_number) {
    contact.internationalPhone = placeData.international_phone_number;
    contact.hasContact = true;
  }

  return contact;
}

/**
 * Formats website URL to ensure it's a valid, clickable link
 */
function formatWebsiteUrl(url: string): string {
  if (!url) return '';
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  
  return url;
}

/**
 * Formats phone number for display (removes extra characters, formats consistently)
 */
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-numeric characters except + and spaces for international numbers
  const cleaned = phone.replace(/[^\d\+\s\-\(\)]/g, '');
  
  // If it's a Philippine number, format it nicely
  if (cleaned.startsWith('+63') || cleaned.startsWith('63')) {
    const digits = cleaned.replace(/[^\d]/g, '');
    if (digits.startsWith('63') && digits.length === 12) {
      const formatted = digits.substring(2); // Remove country code
      return `+63 ${formatted.substring(0, 3)} ${formatted.substring(3, 6)} ${formatted.substring(6)}`;
    }
  }
  
  // For other formats, return cleaned version
  return cleaned;
}

/**
 * Validates if a phone number appears to be valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all non-numeric characters
  const digits = phone.replace(/[^\d]/g, '');
  
  // Check if it has a reasonable number of digits (7-15 is typical range)
  return digits.length >= 7 && digits.length <= 15;
}

/**
 * Validates if a website URL appears to be valid
 */
export function isValidWebsite(url: string): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(formatWebsiteUrl(url));
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Creates a complete contact object with validation and formatting
 * Ready for frontend consumption
 */
export function createFrontendContactObject(placeData: any): {
  contact: ContactDetails;
  actions: {
    canCall: boolean;
    canVisitWebsite: boolean;
    callUrl?: string;
    websiteUrl?: string;
  };
} {
  const contact = extractContactDetails(placeData);
  
  const actions = {
    canCall: !!(contact.phone && isValidPhoneNumber(contact.phone)),
    canVisitWebsite: !!(contact.website && isValidWebsite(contact.website)),
    ...(contact.phone && { callUrl: `tel:${contact.phone.replace(/[^\d\+]/g, '')}` }),
    ...(contact.website && { websiteUrl: contact.website })
  };

  return {
    contact,
    actions
  };
}