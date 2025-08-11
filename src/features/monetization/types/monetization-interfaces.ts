/**
 * Monetization Interface Types
 * 
 * Defines monetization-related interfaces
 * 
 * CONSOLIDATED: This file now contains all monetization interfaces
 * merged from multiple sources to eliminate duplication.
 */

import type { Suggestion } from '../../discovery/types';
import type { PlaceData } from '../../discovery/types';

// =================
// MONETIZATION TYPES
// =================

export type DiscountInput = Suggestion | PlaceData;

export interface UseDiscountsReturn {
  discounts: any[];
  applyDiscount: (place: DiscountInput) => void;
  removeDiscount: (placeId: string) => void;
  isLoading: boolean;
  error: string | null;
  searchDiscounts: (input: DiscountInput) => Promise<void>;
  openDiscount: (discount: any) => Promise<boolean>;
  clearDiscounts: () => void;
}

export interface UseAdMonetizationReturn {
  ads: any[];
  loadAds: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  // Ad Management
  getTargetedAd: (context: TargetedAdContext) => {
    adUnit: AdUnit;
    network: any;
    targeting: AdTargeting;
    estimatedRevenue: number;
  } | null;
  
  // Affiliate Management
  getAffiliateLink: (partnerId: string, context?: AffiliateLinkContext) => {
    partner: AffiliatePartner;
    trackingUrl: string;
    estimatedCommission: number;
  } | null;
  
  // Sponsored Content
  getSponsoredContent: (context?: SponsoredContentContext) => SponsoredContent[];
  
  // Premium Subscriptions
  getPremiumTiers: () => PremiumTier[];
  
  // Tracking
  trackAdImpression: (adUnitId: string, networkId: string, revenue: number) => void;
  trackAffiliateClick: (partnerId: string, estimatedCommission: number) => void;
  trackSponsoredClick: (contentId: string) => void;
  
  // Analytics
  getMonetizationStats: () => MonetizationStats;
  getRevenueProjections: (userBase: number) => RevenueProjections;
}

// =================
// AD NETWORK INTERFACE
// =================

export interface AdNetwork {
  id: string;
  name: string;
  enabled: boolean;
  fillRate: number;
  targetingCapabilities: string[];
  revenueShare: number; // Percentage of revenue you keep
}

// =================
// AD UNIT INTERFACE
// =================

export interface AdUnit {
  id: string;
  name: string;
  type: 'banner' | 'interstitial' | 'rewarded' | 'native';
  size: { width: number; height: number } | string; // Support both object and string formats
  position?: 'top' | 'bottom' | 'sidebar' | 'inline' | string; // Make position optional
  placement?: string; // Alternative to position for service compatibility
  enabled: boolean;
  priority: number;
  targeting: AdTargeting;
  revenue?: {
    cpm: number;
    cpc: number;
    cpa: number;
  };
}

// =================
// AD TARGETING INTERFACE
// =================

export interface AdTargeting {
  interests: string[];
  demographics: {
    ageRange?: string[];
    gender?: string[];
    location: string[];
  };
  contextual?: {
    cuisine?: string[];
    mood?: string[];
    budget?: string[];
    occasion?: string[];
  };
  frequency: {
    maxImpressionsPerHour: number;
    maxImpressionsPerDay: number;
  } | number; // Support both object and legacy number format
}

// =================
// AFFILIATE PARTNER INTERFACE
// =================

export interface AffiliatePartner {
  id: string;
  name: string;
  platform?: string; // Legacy support
  category: 'food' | 'entertainment' | 'events' | 'travel' | string[]; // Support both enum and array
  categories?: string[]; // Alternative to category for array format
  commission?: number; // Make commission optional since some use commissionRate
  commissionRate?: number; // Alternative to commission
  minPayout?: number; // Legacy support
  trackingUrl?: string; // Service-specific
  enabled: boolean;
  performance: {
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

// =================
// SPONSORED CONTENT INTERFACE
// =================

export interface SponsoredContent {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'image' | 'review' | 'featured' | 'sponsored' | 'exclusive';
  sponsor?: string; // Legacy support
  partnerId?: string; // Alternative to sponsor
  imageUrl?: string; // Service-specific
  category?: 'featured' | 'sponsored' | 'exclusive'; // Alternative to type
  startDate?: Date; // Service-specific
  endDate?: Date; // Service-specific
  budget?: number; // Service-specific
  enabled: boolean;
  targeting?: {
    interests: string[];
    demographics: string[];
    location: string[];
  };
  performance: {
    impressions?: number; // Make optional for backward compatibility
    clicks: number;
    engagement?: number; // Legacy support
  };
}

// =================
// PREMIUM TIER INTERFACE
// =================

export interface PremiumTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  benefits: string[];
}

// =================
// MONETIZATION STATS INTERFACE
// =================

export interface MonetizationStats {
  totalRevenue: number;
  adRevenue: number;
  affiliateRevenue: number;
  sponsoredRevenue: number;
  premiumRevenue: number;
  topPerformingAdUnit: string;
  topPerformingAffiliate: string;
  conversionRate: number;
}

// =================
// REVENUE PROJECTIONS INTERFACE
// =================

export interface RevenueProjections {
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenuePerUser: number;
  growthRate: number;
}

// =================
// TARGETED AD CONTEXT INTERFACE
// =================

export interface TargetedAdContext {
  userMood?: string;
  cuisine?: string;
  budget?: string;
  location?: string;
  occasion?: string;
}

// =================
// AFFILIATE LINK CONTEXT INTERFACE
// =================

export interface AffiliateLinkContext {
  restaurantName?: string;
  cuisine?: string;
  location?: string;
}

// =================
// SPONSORED CONTENT CONTEXT INTERFACE
// =================

export interface SponsoredContentContext {
  cuisine?: string;
  location?: string;
  occasion?: string;
}
