import { useState, useCallback } from 'react';
import { discountService, DiscountInfo } from '../utils/discount-service';
import { Suggestion } from '../types/app';
import { PlaceData } from '../utils/place-mood-service';

type DiscountInput = Suggestion | PlaceData;

interface UseDiscountsReturn {
  discounts: DiscountInfo[];
  isLoading: boolean;
  error: string | null;
  searchDiscounts: (input: DiscountInput) => Promise<void>;
  openDiscount: (discount: DiscountInfo) => Promise<boolean>;
  clearDiscounts: () => void;
}

export const useDiscounts = (): UseDiscountsReturn => {
  const [discounts, setDiscounts] = useState<DiscountInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDiscounts = useCallback(async (input: DiscountInput) => {
    if (!input) return;

    setIsLoading(true);
    setError(null);

    try {
      let searchParams;
      if ('id' in input) {
        searchParams = {
          placeName: input.name,
          location: input.location,
          category: input.category,
          tags: input.tags
        };
      } else {
        searchParams = {
          placeName: input.name,
          location: input.address || input.vicinity || input.formatted_address || 'Unknown location',
          category: input.category,
          tags: input.types || []
        };
      }

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