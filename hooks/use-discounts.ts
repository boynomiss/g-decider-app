import { useState, useCallback } from 'react';
import { discountService, DiscountInfo } from '../utils/discount-service';
import { Suggestion } from '../types/app';

interface UseDiscountsReturn {
  discounts: DiscountInfo[];
  isLoading: boolean;
  error: string | null;
  searchDiscounts: (suggestion: Suggestion) => Promise<void>;
  openDiscount: (discount: DiscountInfo) => Promise<boolean>;
  clearDiscounts: () => void;
}

export const useDiscounts = (): UseDiscountsReturn => {
  const [discounts, setDiscounts] = useState<DiscountInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDiscounts = useCallback(async (suggestion: Suggestion) => {
    if (!suggestion) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchParams = {
        placeName: suggestion.name,
        location: suggestion.location,
        category: suggestion.category,
        tags: suggestion.tags
      };

      const foundDiscounts = await discountService.searchDiscounts(searchParams);
      setDiscounts(foundDiscounts);
      
      console.log('🎉 Discount search completed:', foundDiscounts.length, 'discounts found');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search discounts';
      setError(errorMessage);
      console.error('❌ Discount search failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openDiscount = useCallback(async (discount: DiscountInfo) => {
    try {
      const success = await discountService.openDiscount(discount);
      
      if (success) {
        console.log(`✅ Successfully opened ${discount.platform} discount`);
      } else {
        console.log(`❌ Failed to open ${discount.platform} discount`);
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open discount';
      console.error('❌ Discount opening failed:', errorMessage);
      return false;
    }
  }, []);

  const clearDiscounts = useCallback(() => {
    setDiscounts([]);
    setError(null);
  }, []);

  return {
    discounts,
    isLoading,
    error,
    searchDiscounts,
    openDiscount,
    clearDiscounts
  };
}; 