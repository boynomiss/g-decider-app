import { useState, useCallback } from 'react';
import { adMonetizationService } from '../utils/ad-monetization-service';

interface AdUnit {
  id: string;
  name: string;
  type: 'banner' | 'interstitial' | 'rewarded' | 'native';
  size: string;
  placement: string;
  targeting: AdTargeting;
  enabled: boolean;
  priority: number;
}

interface AdTargeting {
  interests: string[];
  demographics: {
    ageRange?: string[];
    gender?: string[];
    location?: string[];
  };
  contextual: {
    cuisine?: string[];
    mood?: string[];
    budget?: string[];
    occasion?: string[];
  };
  frequency: {
    maxImpressionsPerHour: number;
    maxImpressionsPerDay: number;
  };
}

interface AffiliatePartner {
  id: string;
  name: string;
  category: 'food' | 'entertainment' | 'events' | 'travel';
  commissionRate: number;
  trackingUrl: string;
  enabled: boolean;
  performance: {
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

interface SponsoredContent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  partnerId: string;
  category: 'featured' | 'sponsored' | 'exclusive';
  startDate: Date;
  endDate: Date;
  budget: number;
  impressions: number;
  clicks: number;
}

interface PremiumTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  benefits: string[];
}

interface UseAdMonetizationReturn {
  // Ad Management
  getTargetedAd: (context: {
    userMood?: string;
    cuisine?: string;
    budget?: string;
    location?: string;
    occasion?: string;
  }) => {
    adUnit: AdUnit;
    network: any;
    targeting: AdTargeting;
    estimatedRevenue: number;
  } | null;
  
  // Affiliate Management
  getAffiliateLink: (partnerId: string, context?: {
    restaurantName?: string;
    cuisine?: string;
    location?: string;
  }) => {
    partner: AffiliatePartner;
    trackingUrl: string;
    estimatedCommission: number;
  } | null;
  
  // Sponsored Content
  getSponsoredContent: (context?: {
    cuisine?: string;
    location?: string;
    occasion?: string;
  }) => SponsoredContent[];
  
  // Premium Subscriptions
  getPremiumTiers: () => PremiumTier[];
  
  // Tracking
  trackAdImpression: (adUnitId: string, networkId: string, revenue: number) => void;
  trackAffiliateClick: (partnerId: string, estimatedCommission: number) => void;
  trackSponsoredClick: (contentId: string) => void;
  
  // Analytics
  getMonetizationStats: () => {
    totalRevenue: number;
    adRevenue: number;
    affiliateRevenue: number;
    sponsoredRevenue: number;
    premiumRevenue: number;
    topPerformingAdUnit: string;
    topPerformingAffiliate: string;
    conversionRate: number;
  };
  
  getRevenueProjections: (userBase: number) => {
    monthlyRevenue: number;
    yearlyRevenue: number;
    revenuePerUser: number;
    growthRate: number;
  };
  
  // State
  isLoading: boolean;
  error: string | null;
}

export const useAdMonetization = (): UseAdMonetizationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTargetedAd = useCallback((context: {
    userMood?: string;
    cuisine?: string;
    budget?: string;
    location?: string;
    occasion?: string;
  }) => {
    try {
      return adMonetizationService.getTargetedAd(context);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get targeted ad';
      setError(errorMessage);
      console.error('❌ Ad targeting failed:', errorMessage);
      return null;
    }
  }, []);

  const getAffiliateLink = useCallback((partnerId: string, context?: {
    restaurantName?: string;
    cuisine?: string;
    location?: string;
  }) => {
    try {
      return adMonetizationService.getAffiliateLink(partnerId, context);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get affiliate link';
      setError(errorMessage);
      console.error('❌ Affiliate link failed:', errorMessage);
      return null;
    }
  }, []);

  const getSponsoredContent = useCallback((context?: {
    cuisine?: string;
    location?: string;
    occasion?: string;
  }) => {
    try {
      return adMonetizationService.getSponsoredContent(context);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get sponsored content';
      setError(errorMessage);
      console.error('❌ Sponsored content failed:', errorMessage);
      return [];
    }
  }, []);

  const getPremiumTiers = useCallback(() => {
    try {
      return adMonetizationService.getPremiumTiers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get premium tiers';
      setError(errorMessage);
      console.error('❌ Premium tiers failed:', errorMessage);
      return [];
    }
  }, []);

  const trackAdImpression = useCallback((adUnitId: string, networkId: string, revenue: number) => {
    try {
      adMonetizationService.trackAdImpression(adUnitId, networkId, revenue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track ad impression';
      console.error('❌ Ad tracking failed:', errorMessage);
    }
  }, []);

  const trackAffiliateClick = useCallback((partnerId: string, estimatedCommission: number) => {
    try {
      adMonetizationService.trackAffiliateClick(partnerId, estimatedCommission);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track affiliate click';
      console.error('❌ Affiliate tracking failed:', errorMessage);
    }
  }, []);

  const trackSponsoredClick = useCallback((contentId: string) => {
    try {
      adMonetizationService.trackSponsoredClick(contentId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to track sponsored click';
      console.error('❌ Sponsored tracking failed:', errorMessage);
    }
  }, []);

  const getMonetizationStats = useCallback(() => {
    try {
      return adMonetizationService.getMonetizationStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get monetization stats';
      setError(errorMessage);
      console.error('❌ Stats failed:', errorMessage);
      return {
        totalRevenue: 0,
        adRevenue: 0,
        affiliateRevenue: 0,
        sponsoredRevenue: 0,
        premiumRevenue: 0,
        topPerformingAdUnit: '',
        topPerformingAffiliate: '',
        conversionRate: 0
      };
    }
  }, []);

  const getRevenueProjections = useCallback((userBase: number) => {
    try {
      return adMonetizationService.getRevenueProjections(userBase);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get revenue projections';
      setError(errorMessage);
      console.error('❌ Revenue projections failed:', errorMessage);
      return {
        monthlyRevenue: 0,
        yearlyRevenue: 0,
        revenuePerUser: 0,
        growthRate: 0
      };
    }
  }, []);

  return {
    getTargetedAd,
    getAffiliateLink,
    getSponsoredContent,
    getPremiumTiers,
    trackAdImpression,
    trackAffiliateClick,
    trackSponsoredClick,
    getMonetizationStats,
    getRevenueProjections,
    isLoading,
    error
  };
}; 