// Mock External Services
// Replace real external service calls with mock data for UI development

export const mockAdMonetizationService = {
  getAds: async (placement: string) => ({
    ads: [
      {
        id: 'mock_ad_1',
        title: 'Mock Advertisement',
        description: 'This is a mock ad for UI development purposes.',
        imageUrl: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Mock+Ad',
        ctaText: 'Learn More',
        ctaUrl: '#',
        placement
      }
    ],
    totalAds: 1
  }),
  
  trackAdClick: async (adId: string) => ({
    success: true,
    adId,
    timestamp: new Date().toISOString()
  }),
  
  getAdPerformance: async (adId: string) => ({
    impressions: 1250,
    clicks: 45,
    ctr: 0.036,
    revenue: 12.50
  })
};

export const mockDiscountService = {
  getActiveDiscounts: async () => ({
    discounts: [
      {
        id: 'mock_discount_1',
        title: '20% Off First Visit',
        description: 'Get 20% off your first visit to any participating restaurant.',
        discountPercent: 20,
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        applicablePlaces: ['restaurant', 'cafe']
      },
      {
        id: 'mock_discount_2',
        title: 'Happy Hour Special',
        description: '50% off drinks during happy hour (4-7 PM).',
        discountPercent: 50,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        applicablePlaces: ['bar', 'restaurant']
      }
    ]
  }),
  
  applyDiscount: async (discountId: string, placeId: string) => ({
    success: true,
    discountId,
    placeId,
    appliedAt: new Date().toISOString()
  }),
  
  validateDiscount: async (discountCode: string) => ({
    valid: true,
    discount: {
      id: 'mock_validation_1',
      title: 'Valid Discount',
      discountPercent: 15
    }
  })
};

export const mockAffiliateMarketingService = {
  getAffiliateLinks: async (placeId: string) => ({
    links: [
      {
        id: 'mock_affiliate_1',
        title: 'Book via Partner',
        url: 'https://mock-affiliate.com/book',
        commission: '5%',
        description: 'Book through our partner and earn rewards.'
      }
    ]
  }),
  
  trackAffiliateClick: async (affiliateId: string) => ({
    success: true,
    affiliateId,
    timestamp: new Date().toISOString()
  }),
  
  getAffiliateEarnings: async () => ({
    totalEarnings: 45.75,
    monthlyEarnings: 12.30,
    pendingPayout: 8.50
  })
};
