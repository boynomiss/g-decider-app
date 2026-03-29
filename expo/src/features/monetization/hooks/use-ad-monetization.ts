import { useState, useCallback } from 'react';
import { adMonetizationService } from '../../../services/external/monetization/ad-monetization-service';
import type {
  AdUnit,
  AdTargeting,
  AffiliatePartner,
  SponsoredContent,
  PremiumTier,
  TargetedAdContext,
  AffiliateLinkContext,
  SponsoredContentContext,
  MonetizationStats,
  RevenueProjections,
  UseAdMonetizationReturn
} from '../types/monetization-interfaces';

export const useAdMonetization = (): UseAdMonetizationReturn => {
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTargetedAd = useCallback((context: TargetedAdContext) => {
    try {
      return adMonetizationService.getTargetedAd(context);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get targeted ad';
      setError(errorMessage);
      console.error('❌ Ad targeting failed:', errorMessage);
      return null;
    }
  }, []);

  const getAffiliateLink = useCallback((partnerId: string, context?: AffiliateLinkContext) => {
    try {
      return adMonetizationService.getAffiliateLink(partnerId, context);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get affiliate link';
      setError(errorMessage);
      console.error('❌ Affiliate link failed:', errorMessage);
      return null;
    }
  }, []);

  const getSponsoredContent = useCallback((context?: SponsoredContentContext) => {
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
    ads: [], // Initialize with empty array
    loadAds: async () => {
      // Placeholder implementation
      console.log('Loading ads...');
    },
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