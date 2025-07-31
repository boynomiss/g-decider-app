import { useState, useCallback } from 'react';
import { contactService } from '../utils/contact-service';

interface UseContactReturn {
  contactInfo: {
    phoneNumber?: string;
    formattedPhoneNumber?: string;
    internationalPhoneNumber?: string;
  };
  isLoading: boolean;
  error: string | null;
  getContactInfo: (placeId: string) => Promise<void>;
  callContact: (phoneNumber: string) => Promise<boolean>;
  clearContactInfo: () => void;
}

export const useContact = (): UseContactReturn => {
  const [contactInfo, setContactInfo] = useState<{
    phoneNumber?: string;
    formattedPhoneNumber?: string;
    internationalPhoneNumber?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContactInfo = useCallback(async (placeId: string) => {
    if (!placeId) return;

    setIsLoading(true);
    setError(null);

    try {
      const info = await contactService.getContactInfo(placeId);
      setContactInfo(info);
      
      if (info.phoneNumber) {
        console.log('📞 Found contact info:', info.phoneNumber);
      } else {
        console.log('📞 No contact info available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get contact info';
      setError(errorMessage);
      console.error('❌ Contact info failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const callContact = useCallback(async (phoneNumber: string): Promise<boolean> => {
    try {
      const success = await contactService.callContact(phoneNumber);
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to call contact';
      console.error('❌ Call failed:', errorMessage);
      return false;
    }
  }, []);

  const clearContactInfo = useCallback(() => {
    setContactInfo({});
    setError(null);
  }, []);

  return {
    contactInfo,
    isLoading,
    error,
    getContactInfo,
    callContact,
    clearContactInfo
  };
}; 