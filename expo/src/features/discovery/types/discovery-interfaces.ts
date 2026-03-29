/**
 * Discovery Interface Types
 * 
 * Defines discovery-specific filter and result types
 */

import type { Suggestion } from './place-types';

// =================
// DISCOVERY FILTERS
// =================

export interface DiscoveryFilters {
  // Core discovery parameters
  query?: string;
  location?: string;
  radius?: number;
  category?: string;
  mood?: string;
  budget?: string;
  timeOfDay?: string;
  socialContext?: string;
  
  // Advanced discovery options
  includeNewPlaces?: boolean;
  includeTrending?: boolean;
  includeLocalFavorites?: boolean;
  maxResults?: number;
  sortBy?: 'relevance' | 'rating' | 'distance' | 'popularity';
}

// =================
// DISCOVERY RESULT
// =================

export interface DiscoveryResult {
  places: Suggestion[];
  totalFound: number;
  hasMore: boolean;
  nextPageToken?: string;
  searchMetadata: {
    query: string;
    location: string;
    radius: number;
    timestamp: Date;
  };
}

// =================
// SCRAPED CONTENT INTERFACES
// =================

export interface ScrapedDeal {
  id: string;
  title: string;
  description: string;
  originalPrice?: number;
  discountedPrice?: number;
  percentageOff?: number;
  validUntil?: Date;
  sourceUrl: string;
  sourceType: 'website' | 'social_media';
  locationData?: {
    placeId?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  tags: string[];
  categories: string[];
  imageUrls: string[];
  scrapedTimestamp: Date;
  aiSummary?: string;
  aiTags?: string[];
}

export interface ScrapedAttraction {
  id: string;
  title: string;
  description: string;
  type: 'restaurant' | 'attraction' | 'event' | 'popup';
  openingDate?: Date;
  sourceUrl: string;
  sourceType: 'website' | 'social_media';
  locationData?: {
    placeId?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  tags: string[];
  categories: string[];
  imageUrls: string[];
  scrapedTimestamp: Date;
  aiSummary?: string;
  aiTags?: string[];
}

export interface ScrapingSource {
  id: string;
  name: string;
  url: string;
  type: 'deal_site' | 'news_site' | 'social_media' | 'restaurant_site';
  enabled: boolean;
  lastScraped?: Date;
  successRate: number;
  robotsTxtRespected: boolean;
}

export interface ScrapingConfig {
  rateLimitDelay: number; // milliseconds between requests
  maxRetries: number;
  timeout: number;
  userAgents: string[];
  proxyEnabled: boolean;
  proxyList?: string[];
}

// =================
// SCRAPING SERVICE RETURN INTERFACE
// =================

export interface UseScrapingServiceReturn {
  // Data
  deals: ScrapedDeal[];
  attractions: ScrapedAttraction[];
  
  // Loading states
  isLoadingDeals: boolean;
  isLoadingAttractions: boolean;
  
  // Error states
  dealsError: string | null;
  attractionsError: string | null;
  
  // Actions
  scrapeDeals: () => Promise<void>;
  scrapeAttractions: () => Promise<void>;
  scrapeAll: () => Promise<void>;
  
  // Statistics
  getScrapingStats: () => {
    totalSources: number;
    enabledSources: number;
    lastScraped: Date | null;
    averageSuccessRate: number;
    dealsFound: number;
    attractionsFound: number;
  };
  
  // Filtering
  filterDealsByCategory: (category: string) => ScrapedDeal[];
  filterAttractionsByType: (type: string) => ScrapedAttraction[];
  searchDeals: (query: string) => ScrapedDeal[];
  searchAttractions: (query: string) => ScrapedAttraction[];
}
