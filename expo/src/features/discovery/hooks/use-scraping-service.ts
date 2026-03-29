import { useState, useCallback } from 'react';
import { ScrapingService } from '../../../services/api/api/scraping-service';
import type {
  ScrapedDeal,
  ScrapedAttraction,
  UseScrapingServiceReturn
} from '../types/discovery-interfaces';

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
      const scrapingService = ScrapingService.getInstance();
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
      const scrapingService = ScrapingService.getInstance();
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
    return ScrapingService.getInstance().getScrapingStats();
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