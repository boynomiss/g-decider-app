import { useState, useCallback } from 'react';
import { scrapingService } from '../utils/api/scraping-service';

interface ScrapedDeal {
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

interface ScrapedAttraction {
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

interface UseScrapingServiceReturn {
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

export const useScrapingService = (): UseScrapingServiceReturn => {
  const [deals, setDeals] = useState<ScrapedDeal[]>([]);
  const [attractions, setAttractions] = useState<ScrapedAttraction[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(false);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(false);
  const [dealsError, setDealsError] = useState<string | null>(null);
  const [attractionsError, setAttractionsError] = useState<string | null>(null);

  const scrapeDeals = useCallback(async () => {
    setIsLoadingDeals(true);
    setDealsError(null);

    try {
      const scrapedDeals = await scrapingService.scrapeDeals();
      setDeals(scrapedDeals);
      
      console.log('💰 Scraped deals:', scrapedDeals.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrape deals';
      setDealsError(errorMessage);
      console.error('❌ Deals scraping failed:', errorMessage);
    } finally {
      setIsLoadingDeals(false);
    }
  }, []);

  const scrapeAttractions = useCallback(async () => {
    setIsLoadingAttractions(true);
    setAttractionsError(null);

    try {
      const scrapedAttractions = await scrapingService.scrapeAttractions();
      setAttractions(scrapedAttractions);
      
      console.log('🎯 Scraped attractions:', scrapedAttractions.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrape attractions';
      setAttractionsError(errorMessage);
      console.error('❌ Attractions scraping failed:', errorMessage);
    } finally {
      setIsLoadingAttractions(false);
    }
  }, []);

  const scrapeAll = useCallback(async () => {
    await Promise.all([scrapeDeals(), scrapeAttractions()]);
  }, [scrapeDeals, scrapeAttractions]);

  const getScrapingStats = useCallback(() => {
    return scrapingService.getScrapingStats();
  }, []);

  const filterDealsByCategory = useCallback((category: string): ScrapedDeal[] => {
    return deals.filter(deal => 
      deal.categories.some(cat => 
        cat.toLowerCase().includes(category.toLowerCase())
      ) ||
      deal.tags.some(tag => 
        tag.toLowerCase().includes(category.toLowerCase())
      )
    );
  }, [deals]);

  const filterAttractionsByType = useCallback((type: string): ScrapedAttraction[] => {
    return attractions.filter(attraction => 
      attraction.type === type ||
      attraction.categories.some(cat => 
        cat.toLowerCase().includes(type.toLowerCase())
      ) ||
      attraction.tags.some(tag => 
        tag.toLowerCase().includes(type.toLowerCase())
      )
    );
  }, [attractions]);

  const searchDeals = useCallback((query: string): ScrapedDeal[] => {
    const lowerQuery = query.toLowerCase();
    return deals.filter(deal => 
      deal.title.toLowerCase().includes(lowerQuery) ||
      deal.description.toLowerCase().includes(lowerQuery) ||
      deal.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      deal.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
    );
  }, [deals]);

  const searchAttractions = useCallback((query: string): ScrapedAttraction[] => {
    const lowerQuery = query.toLowerCase();
    return attractions.filter(attraction => 
      attraction.title.toLowerCase().includes(lowerQuery) ||
      attraction.description.toLowerCase().includes(lowerQuery) ||
      attraction.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      attraction.categories.some(cat => cat.toLowerCase().includes(lowerQuery))
    );
  }, [attractions]);

  return {
    deals,
    attractions,
    isLoadingDeals,
    isLoadingAttractions,
    dealsError,
    attractionsError,
    scrapeDeals,
    scrapeAttractions,
    scrapeAll,
    getScrapingStats,
    filterDealsByCategory,
    filterAttractionsByType,
    searchDeals,
    searchAttractions
  };
}; 