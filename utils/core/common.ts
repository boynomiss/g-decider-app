import { StyleSheet } from 'react-native';

// Common gradient colors used throughout the app
export const GRADIENT_COLORS = ['#C8A8E9', '#B19CD9'] as const;

// Common button styles
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: '#7DD3C0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5FBF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFF',
  },
  secondaryText: {
    color: '#8B5FBF',
  },
});

// Common text styles
export const textStyles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
  },
});

// Common card styles
export const cardStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
  },
  content: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
});

// Budget mapping utility
export const getBudgetDisplay = (budget: 'P' | 'PP' | 'PPP' | null): string => {
  const budgetMap = {
    'P': '₱',
    'PP': '₱₱', 
    'PPP': '₱₱₱'
  };
  return budgetMap[budget || 'PP'];
};

// Social context mapping utility
export const getPartySizeFromSocialContext = (socialContext: string): string => {
  switch (socialContext) {
    case 'solo': return 'Solo';
    case 'with-bae': return 'For two';
    case 'barkada': return 'For groups';
    default: return 'For two';
  }
};

// Import consolidated distance configuration
import { DistanceUtils } from '../filtering/configs/distance-config';

// Note: getDistanceRadius is now available directly from DistanceUtils in filtering/configs/distance-config
// Use: import { DistanceUtils } from '@/utils/filtering/configs/distance-config'
// Or: import { getDistanceRadius } from '@/utils/filtering/configs/distance-config'

// Budget price level mapping for Google Places API
export const getBudgetPriceLevel = (budget: 'P' | 'PP' | 'PPP', category: string): { minprice?: number, maxprice?: number } => {
  if (category !== 'food') return {};
  
  switch (budget) {
    case 'P': return { minprice: 0, maxprice: 1 };
    case 'PP': return { minprice: 1, maxprice: 2 };
    case 'PPP': return { minprice: 2, maxprice: 4 };
    default: return {};
  }
};

// Category to Google Places type mapping
export const getCategoryType = (category: 'food' | 'activity' | 'something-new'): string => {
  switch (category) {
    case 'food': return 'restaurant';
    case 'activity': return 'tourist_attraction';
    case 'something-new': return 'point_of_interest';
    default: return 'establishment';
  }
};

// Safe area container style helper
export const getSafeAreaContainerStyle = (insets: { top: number }, additionalStyles = {}) => ({
  flex: 1,
  paddingTop: insets.top + 8,
  ...additionalStyles,
});

// Error handling utility
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  errorMessage = 'An error occurred'
): Promise<T | null> => {
  try {
    return await asyncFn();
  } catch (error) {
    console.error(errorMessage, error);
    return null;
  }
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}; 