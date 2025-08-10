import { Suggestion } from '../../types/app';

// Ad network configurations
interface AdNetwork {
  id: string;
  name: string;
  enabled: boolean;
  fillRate: number;
  targetingCapabilities: string[];
  revenueShare: number; // Percentage of revenue you keep
}

// Ad unit configurations
interface AdUnit {
  id: string;
  name: string;
  type: 'banner' | 'interstitial' | 'rewarded' | 'native';
  size: string;
  placement: string;
  targeting: AdTargeting;
  enabled: boolean;
  priority: number; // Higher number = higher priority
}

// Ad targeting configuration
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

// Affiliate partner configuration
interface AffiliatePartner {
  id: string;
  name: string;
  category: 'food' | 'entertainment' | 'events' | 'travel';
  commissionRate: number; // Percentage commission
  trackingUrl: string;
  enabled: boolean;
  performance: {
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

// Sponsored content configuration
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

// Premium subscription tiers
interface PremiumTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  features: string[];
  benefits: string[];
}

export class AdMonetizationService {
  private static instance: AdMonetizationService;
  private adNetworks: AdNetwork[];
  private adUnits: AdUnit[];
  private affiliatePartners: AffiliatePartner[];
  private sponsoredContent: SponsoredContent[];
  private premiumTiers: PremiumTier[];

  private constructor() {
    this.adNetworks = this.initializeAdNetworks();
    this.adUnits = this.initializeAdUnits();
    this.affiliatePartners = this.initializeAffiliatePartners();
    this.sponsoredContent = this.initializeSponsoredContent();
    this.premiumTiers = this.initializePremiumTiers();
  }

  static getInstance(): AdMonetizationService {
    if (!AdMonetizationService.instance) {
      AdMonetizationService.instance = new AdMonetizationService();
    }
    return AdMonetizationService.instance;
  }

  /**
   * Initialize ad networks
   */
  private initializeAdNetworks(): AdNetwork[] {
    return [
      {
        id: 'admob',
        name: 'Google AdMob',
        enabled: true,
        fillRate: 0.95,
        targetingCapabilities: ['interests', 'demographics', 'location', 'contextual'],
        revenueShare: 0.70 // 70% revenue share
      },
      {
        id: 'fan',
        name: 'Facebook Audience Network',
        enabled: true,
        fillRate: 0.92,
        targetingCapabilities: ['interests', 'demographics', 'behavioral', 'lookalike'],
        revenueShare: 0.75 // 75% revenue share
      },
      {
        id: 'unity',
        name: 'Unity Ads',
        enabled: false,
        fillRate: 0.88,
        targetingCapabilities: ['interests', 'demographics'],
        revenueShare: 0.65 // 65% revenue share
      }
    ];
  }

  /**
   * Initialize ad units
   */
  private initializeAdUnits(): AdUnit[] {
    return [
      {
        id: 'main_banner',
        name: 'Main Page Banner',
        type: 'banner',
        size: '320x50',
        placement: 'main_page_top',
        targeting: {
          interests: ['food', 'dining', 'restaurants', 'entertainment', 'events', 'travel'],
          demographics: {
            ageRange: ['18-34', '35-50'],
            location: ['Philippines', 'Manila', 'Makati', 'BGC']
          },
          contextual: {
            cuisine: ['Filipino', 'Korean', 'Japanese', 'Italian', 'American'],
            mood: ['chill', 'hype', 'romantic', 'casual'],
            budget: ['budget', 'mid-range', 'premium']
          },
          frequency: {
            maxImpressionsPerHour: 2,
            maxImpressionsPerDay: 10
          }
        },
        enabled: true,
        priority: 1
      },
      {
        id: 'result_banner',
        name: 'Result Page Banner',
        type: 'banner',
        size: '300x250',
        placement: 'result_page_bottom',
        targeting: {
          interests: ['food', 'dining', 'restaurants', 'entertainment', 'events'],
          demographics: {
            ageRange: ['18-34', '35-50'],
            location: ['Philippines']
          },
          contextual: {
            cuisine: ['Filipino', 'Korean', 'Japanese', 'Italian', 'American'],
            mood: ['chill', 'hype', 'romantic', 'casual'],
            budget: ['budget', 'mid-range', 'premium']
          },
          frequency: {
            maxImpressionsPerHour: 1,
            maxImpressionsPerDay: 5
          }
        },
        enabled: true,
        priority: 2
      },
      {
        id: 'interstitial_main',
        name: 'Main Page Interstitial',
        type: 'interstitial',
        size: 'fullscreen',
        placement: 'main_page_exit',
        targeting: {
          interests: ['food', 'dining', 'restaurants', 'entertainment', 'events'],
          demographics: {
            ageRange: ['18-34', '35-50'],
            location: ['Philippines']
          },
          contextual: {
            cuisine: ['Filipino', 'Korean', 'Japanese', 'Italian', 'American'],
            mood: ['chill', 'hype', 'romantic', 'casual'],
            budget: ['budget', 'mid-range', 'premium']
          },
          frequency: {
            maxImpressionsPerHour: 1,
            maxImpressionsPerDay: 3
          }
        },
        enabled: false, // Disabled by default to avoid intrusive experience
        priority: 3
      }
    ];
  }

  /**
   * Initialize affiliate partners
   */
  private initializeAffiliatePartners(): AffiliatePartner[] {
    return [
      {
        id: 'eatigo',
        name: 'Eatigo',
        category: 'food',
        commissionRate: 0.15, // 15% commission
        trackingUrl: 'https://eatigo.com/ph/en/?affiliate=your-affiliate-id',
        enabled: true,
        performance: {
          clicks: 0,
          conversions: 0,
          revenue: 0
        }
      },
      {
        id: 'klook',
        name: 'Klook',
        category: 'entertainment',
        commissionRate: 0.12, // 12% commission
        trackingUrl: 'https://klook.com/activity/?affiliate=your-affiliate-id',
        enabled: true,
        performance: {
          clicks: 0,
          conversions: 0,
          revenue: 0
        }
      },
      {
        id: 'foodpanda',
        name: 'Foodpanda',
        category: 'food',
        commissionRate: 0.10, // 10% commission
        trackingUrl: 'https://foodpanda.ph/?affiliate=your-affiliate-id',
        enabled: true,
        performance: {
          clicks: 0,
          conversions: 0,
          revenue: 0
        }
      },
      {
        id: 'grab_food',
        name: 'GrabFood',
        category: 'food',
        commissionRate: 0.08, // 8% commission
        trackingUrl: 'https://food.grab.com/ph/?affiliate=your-affiliate-id',
        enabled: true,
        performance: {
          clicks: 0,
          conversions: 0,
          revenue: 0
        }
      }
    ];
  }

  /**
   * Initialize sponsored content
   */
  private initializeSponsoredContent(): SponsoredContent[] {
    return [
      {
        id: 'sponsored_1',
        title: 'Featured: New Korean BBQ in BGC',
        description: 'Experience authentic Korean barbecue with premium meats and unlimited side dishes.',
        imageUrl: 'https://example.com/korean-bbq.jpg',
        partnerId: 'restaurant_partner_1',
        category: 'featured',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        budget: 5000,
        impressions: 0,
        clicks: 0
      },
      {
        id: 'sponsored_2',
        title: 'Exclusive: Ramen Festival Tickets',
        description: 'Get early access to the biggest ramen festival in Manila this month.',
        imageUrl: 'https://example.com/ramen-festival.jpg',
        partnerId: 'event_partner_1',
        category: 'exclusive',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        budget: 3000,
        impressions: 0,
        clicks: 0
      }
    ];
  }

  /**
   * Initialize premium subscription tiers
   */
  private initializePremiumTiers(): PremiumTier[] {
    return [
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        price: 99,
        currency: 'PHP',
        features: [
          'Ad-free experience',
          'Exclusive deals and early access',
          'Advanced filtering options',
          'Personalized recommendations',
          'Priority customer support'
        ],
        benefits: [
          'Save ₱200+ monthly on ads',
          'Access to premium restaurant reviews',
          'Exclusive booking perks',
          'Hidden gem recommendations'
        ]
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        price: 999,
        currency: 'PHP',
        features: [
          'All monthly features',
          '2 months free',
          'Exclusive events access',
          'VIP restaurant partnerships',
          'Custom meal planning'
        ],
        benefits: [
          'Save ₱189 vs monthly',
          'Exclusive member-only events',
          'Direct restaurant partnerships',
          'Personalized dining concierge'
        ]
      }
    ];
  }

  /**
   * Get targeted ad for a specific context
   */
  getTargetedAd(context: {
    userMood?: string;
    cuisine?: string;
    budget?: string;
    location?: string;
    occasion?: string;
  }): {
    adUnit: AdUnit;
    network: AdNetwork;
    targeting: AdTargeting;
    estimatedRevenue: number;
  } | null {
    // Find the best ad unit for the context
    const availableAdUnits = this.adUnits.filter(unit => unit.enabled);
    
    if (availableAdUnits.length === 0) {
      return null;
    }

    // Sort by priority and find the best match
    const bestAdUnit = availableAdUnits.sort((a, b) => b.priority - a.priority)[0];
    
    if (!bestAdUnit) {
      return null;
    }
    
    // Find the best ad network
    const bestNetwork = this.adNetworks
      .filter(network => network.enabled)
      .sort((a, b) => b.fillRate - a.fillRate)[0];

    if (!bestNetwork) {
      return null;
    }

    // Create contextual targeting
    const contextualTargeting: AdTargeting = {
      interests: bestAdUnit.targeting.interests,
      demographics: bestAdUnit.targeting.demographics,
      contextual: {
        ...(context.cuisine && { cuisine: [context.cuisine] }),
        ...(context.userMood && { mood: [context.userMood] }),
        ...(context.budget && { budget: [context.budget] }),
        ...(context.occasion && { occasion: [context.occasion] })
      },
      frequency: bestAdUnit.targeting.frequency
    };

    // Estimate revenue based on network and targeting
    const estimatedRevenue = this.estimateAdRevenue(bestNetwork, contextualTargeting);

    return {
      adUnit: bestAdUnit,
      network: bestNetwork,
      targeting: contextualTargeting,
      estimatedRevenue
    };
  }

  /**
   * Estimate ad revenue based on network and targeting
   */
  private estimateAdRevenue(network: AdNetwork, targeting: AdTargeting): number {
    // Base CPM (Cost Per Mille) rates for different targeting levels
    const baseCPM = 2.50; // $2.50 per 1000 impressions
    const targetingMultiplier = 1.5; // 50% premium for targeted ads
    const networkMultiplier = network.revenueShare;
    
    // Calculate estimated revenue per impression
    const estimatedCPM = baseCPM * targetingMultiplier * networkMultiplier;
    const revenuePerImpression = estimatedCPM / 1000;
    
    return revenuePerImpression;
  }

  /**
   * Get affiliate link for a specific partner and context
   */
  getAffiliateLink(partnerId: string, context?: {
    restaurantName?: string;
    cuisine?: string;
    location?: string;
  }): {
    partner: AffiliatePartner;
    trackingUrl: string;
    estimatedCommission: number;
  } | null {
    const partner = this.affiliatePartners.find(p => p.id === partnerId && p.enabled);
    
    if (!partner) {
      return null;
    }

    // Build tracking URL with context
    let trackingUrl = partner.trackingUrl;
    if (context) {
      const params = new URLSearchParams();
      if (context.restaurantName) params.append('restaurant', context.restaurantName);
      if (context.cuisine) params.append('cuisine', context.cuisine);
      if (context.location) params.append('location', context.location);
      
      if (params.toString()) {
        trackingUrl += (trackingUrl.includes('?') ? '&' : '?') + params.toString();
      }
    }

    // Estimate commission based on average order value
    const averageOrderValue = this.getAverageOrderValue(partner.category);
    const estimatedCommission = averageOrderValue * partner.commissionRate;

    return {
      partner,
      trackingUrl,
      estimatedCommission
    };
  }

  /**
   * Get average order value by category
   */
  private getAverageOrderValue(category: string): number {
    switch (category) {
      case 'food':
        return 800; // ₱800 average food order
      case 'entertainment':
        return 1500; // ₱1,500 average entertainment ticket
      case 'events':
        return 2000; // ₱2,000 average event ticket
      case 'travel':
        return 5000; // ₱5,000 average travel booking
      default:
        return 1000; // ₱1,000 default
    }
  }

  /**
   * Get sponsored content for a specific context
   */
  getSponsoredContent(context?: {
    cuisine?: string;
    location?: string;
    occasion?: string;
  }): SponsoredContent[] {
    const now = new Date();
    
    return this.sponsoredContent.filter(content => 
      content.startDate <= now && 
      content.endDate >= now &&
      (context ? this.matchesContext(content, context) : true)
    );
  }

  /**
   * Check if sponsored content matches context
   */
  private matchesContext(content: SponsoredContent, context: any): boolean {
    // Simple matching logic - in production, you'd have more sophisticated matching
    return true; // For now, return all active content
  }

  /**
   * Get premium subscription tiers
   */
  getPremiumTiers(): PremiumTier[] {
    return this.premiumTiers;
  }

  /**
   * Track ad impression
   */
  trackAdImpression(adUnitId: string, networkId: string, revenue: number): void {
    console.log(`📊 Ad impression tracked: ${adUnitId} on ${networkId}, revenue: ₱${revenue.toFixed(2)}`);
    
    // In production, you'd send this to your analytics service
    // analytics.track('ad_impression', { adUnitId, networkId, revenue });
  }

  /**
   * Track affiliate click
   */
  trackAffiliateClick(partnerId: string, estimatedCommission: number): void {
    const partner = this.affiliatePartners.find(p => p.id === partnerId);
    if (partner) {
      partner.performance.clicks++;
      console.log(`💰 Affiliate click tracked: ${partner.name}, estimated commission: ₱${estimatedCommission.toFixed(2)}`);
    }
  }

  /**
   * Track sponsored content click
   */
  trackSponsoredClick(contentId: string): void {
    const content = this.sponsoredContent.find(c => c.id === contentId);
    if (content) {
      content.clicks++;
      console.log(`🎯 Sponsored content click tracked: ${content.title}`);
    }
  }

  /**
   * Get monetization statistics
   */
  getMonetizationStats(): {
    totalRevenue: number;
    adRevenue: number;
    affiliateRevenue: number;
    sponsoredRevenue: number;
    premiumRevenue: number;
    topPerformingAdUnit: string;
    topPerformingAffiliate: string;
    conversionRate: number;
  } {
    // Simulate revenue data - in production, this would come from your analytics
    const adRevenue = 1500; // ₱1,500 from ads
    const affiliateRevenue = 2500; // ₱2,500 from affiliates
    const sponsoredRevenue = 3000; // ₱3,000 from sponsored content
    const premiumRevenue = 5000; // ₱5,000 from premium subscriptions
    
    const totalRevenue = adRevenue + affiliateRevenue + sponsoredRevenue + premiumRevenue;
    
    return {
      totalRevenue,
      adRevenue,
      affiliateRevenue,
      sponsoredRevenue,
      premiumRevenue,
      topPerformingAdUnit: 'main_banner',
      topPerformingAffiliate: 'eatigo',
      conversionRate: 0.025 // 2.5% conversion rate
    };
  }

  /**
   * Get revenue projections
   */
  getRevenueProjections(userBase: number): {
    monthlyRevenue: number;
    yearlyRevenue: number;
    revenuePerUser: number;
    growthRate: number;
  } {
    const stats = this.getMonetizationStats();
    const currentRevenuePerUser = stats.totalRevenue / userBase;
    const growthRate = 0.15; // 15% monthly growth
    
    const monthlyRevenue = stats.totalRevenue * (1 + growthRate);
    const yearlyRevenue = monthlyRevenue * 12;
    
    return {
      monthlyRevenue,
      yearlyRevenue,
      revenuePerUser: currentRevenuePerUser,
      growthRate
    };
  }
}

// Export singleton instance
export const adMonetizationService = AdMonetizationService.getInstance(); 