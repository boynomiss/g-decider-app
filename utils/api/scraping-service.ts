import { Suggestion } from '../../types/app';

// Data structures for scraped content
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

interface ScrapingSource {
  id: string;
  name: string;
  url: string;
  type: 'deal_site' | 'news_site' | 'social_media' | 'restaurant_site';
  enabled: boolean;
  lastScraped?: Date;
  successRate: number;
  robotsTxtRespected: boolean;
}

interface ScrapingConfig {
  rateLimitDelay: number; // milliseconds between requests
  maxRetries: number;
  timeout: number;
  userAgents: string[];
  proxyEnabled: boolean;
  proxyList?: string[];
}

export class ScrapingService {
  private static instance: ScrapingService;
  private GEMINI_API_KEY: string;
  private config: ScrapingConfig;
  private sources: ScrapingSource[];

  private constructor() {
    this.GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'your-gemini-api-key-here';
    this.config = this.initializeConfig();
    this.sources = this.initializeSources();
  }

  static getInstance(): ScrapingService {
    if (!ScrapingService.instance) {
      ScrapingService.instance = new ScrapingService();
    }
    return ScrapingService.instance;
  }

  /**
   * Initialize scraping configuration
   */
  private initializeConfig(): ScrapingConfig {
    return {
      rateLimitDelay: 2000, // 2 seconds between requests
      maxRetries: 3,
      timeout: 10000, // 10 seconds
      userAgents: [
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      ],
      proxyEnabled: false, // Enable in production with proper proxy service
      proxyList: []
    };
  }

  /**
   * Initialize scraping sources
   */
  private initializeSources(): ScrapingSource[] {
    return [
      // Deal sites (Philippines focus)
      {
        id: 'eatigo',
        name: 'Eatigo',
        url: 'https://eatigo.com/ph/en/',
        type: 'deal_site',
        enabled: true,
        successRate: 0.95,
        robotsTxtRespected: true
      },
      {
        id: 'groupon_ph',
        name: 'Groupon Philippines',
        url: 'https://www.groupon.com.ph/',
        type: 'deal_site',
        enabled: true,
        successRate: 0.90,
        robotsTxtRespected: true
      },
      // News sites
      {
        id: 'spot_ph',
        name: 'Spot.ph',
        url: 'https://www.spot.ph/',
        type: 'news_site',
        enabled: true,
        successRate: 0.85,
        robotsTxtRespected: true
      },
      {
        id: 'timeout_manila',
        name: 'Timeout Manila',
        url: 'https://www.timeout.com/manila',
        type: 'news_site',
        enabled: true,
        successRate: 0.80,
        robotsTxtRespected: true
      },
      // Restaurant sites
      {
        id: 'zomato_ph',
        name: 'Zomato Philippines',
        url: 'https://www.zomato.com/philippines',
        type: 'restaurant_site',
        enabled: true,
        successRate: 0.88,
        robotsTxtRespected: true
      }
    ];
  }

  /**
   * Check robots.txt for a given URL
   */
  async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const robotsUrl = new URL('/robots.txt', url).toString();
      const response = await fetch(robotsUrl, {
        headers: {
          'User-Agent': this.getRandomUserAgent()
        }
      });
      
      if (response.ok) {
        const robotsText = await response.text();
        // Simple check - in production, you'd want a proper robots.txt parser
        return !robotsText.includes('Disallow: /');
      }
      
      return true; // If no robots.txt, assume allowed
    } catch (error) {
      console.warn('⚠️ Could not check robots.txt for:', url);
      return true; // Assume allowed if can't check
    }
  }

  /**
   * Get random user agent
   */
  private getRandomUserAgent(): string {
    return this.config.userAgents[
      Math.floor(Math.random() * this.config.userAgents.length)
    ];
  }

  /**
   * Scrape deals from enabled sources
   */
  async scrapeDeals(): Promise<ScrapedDeal[]> {
    const deals: ScrapedDeal[] = [];
    
    for (const source of this.sources.filter(s => s.enabled && s.type === 'deal_site')) {
      try {
        console.log(`🔍 Scraping deals from: ${source.name}`);
        
        // Check robots.txt
        const allowed = await this.checkRobotsTxt(source.url);
        if (!allowed) {
          console.warn(`⚠️ Skipping ${source.name} - not allowed by robots.txt`);
          continue;
        }
        
        // Simulate scraping (in production, this would be actual scraping)
        const sourceDeals = await this.simulateScrapeDeals(source);
        deals.push(...sourceDeals);
        
        // Update source stats
        source.lastScraped = new Date();
        source.successRate = 0.95; // Simulate success
        
        // Rate limiting
        await this.delay(this.config.rateLimitDelay);
        
      } catch (error) {
        console.error(`❌ Failed to scrape ${source.name}:`, error);
        source.successRate = Math.max(0, source.successRate - 0.1);
      }
    }
    
    // Process deals with AI
    const processedDeals = await this.processDealsWithAI(deals);
    
    return processedDeals;
  }

  /**
   * Scrape new attractions from enabled sources
   */
  async scrapeAttractions(): Promise<ScrapedAttraction[]> {
    const attractions: ScrapedAttraction[] = [];
    
    for (const source of this.sources.filter(s => s.enabled && s.type === 'news_site')) {
      try {
        console.log(`🔍 Scraping attractions from: ${source.name}`);
        
        // Check robots.txt
        const allowed = await this.checkRobotsTxt(source.url);
        if (!allowed) {
          console.warn(`⚠️ Skipping ${source.name} - not allowed by robots.txt`);
          continue;
        }
        
        // Simulate scraping (in production, this would be actual scraping)
        const sourceAttractions = await this.simulateScrapeAttractions(source);
        attractions.push(...sourceAttractions);
        
        // Update source stats
        source.lastScraped = new Date();
        source.successRate = 0.90; // Simulate success
        
        // Rate limiting
        await this.delay(this.config.rateLimitDelay);
        
      } catch (error) {
        console.error(`❌ Failed to scrape ${source.name}:`, error);
        source.successRate = Math.max(0, source.successRate - 0.1);
      }
    }
    
    // Process attractions with AI
    const processedAttractions = await this.processAttractionsWithAI(attractions);
    
    return processedAttractions;
  }

  /**
   * Process deals with AI for summarization and tagging
   */
  private async processDealsWithAI(deals: ScrapedDeal[]): Promise<ScrapedDeal[]> {
    const processedDeals: ScrapedDeal[] = [];
    
    for (const deal of deals) {
      try {
        // Generate AI summary
        const summary = await this.generateDealSummary(deal);
        deal.aiSummary = summary;
        
        // Generate AI tags
        const tags = await this.generateDealTags(deal);
        deal.aiTags = tags;
        
        processedDeals.push(deal);
        
      } catch (error) {
        console.error('❌ Failed to process deal with AI:', error);
        processedDeals.push(deal); // Add without AI processing
      }
    }
    
    return processedDeals;
  }

  /**
   * Process attractions with AI for summarization and tagging
   */
  private async processAttractionsWithAI(attractions: ScrapedAttraction[]): Promise<ScrapedAttraction[]> {
    const processedAttractions: ScrapedAttraction[] = [];
    
    for (const attraction of attractions) {
      try {
        // Generate AI summary
        const summary = await this.generateAttractionSummary(attraction);
        attraction.aiSummary = summary;
        
        // Generate AI tags
        const tags = await this.generateAttractionTags(attraction);
        attraction.aiTags = tags;
        
        processedAttractions.push(attraction);
        
      } catch (error) {
        console.error('❌ Failed to process attraction with AI:', error);
        processedAttractions.push(attraction); // Add without AI processing
      }
    }
    
    return processedAttractions;
  }

  /**
   * Generate AI summary for a deal
   */
  private async generateDealSummary(deal: ScrapedDeal): Promise<string> {
    const prompt = `Summarize this restaurant deal in 2-3 sentences for a food discovery app. Focus on the value proposition and appeal to users:

Title: ${deal.title}
Description: ${deal.description}
Original Price: ${deal.originalPrice}
Discounted Price: ${deal.discountedPrice}
Percentage Off: ${deal.percentageOff}%

Make it engaging and highlight the savings and experience.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return response.trim();
    } catch (error) {
      console.error('❌ Failed to generate deal summary:', error);
      return deal.description; // Fallback to original description
    }
  }

  /**
   * Generate AI tags for a deal
   */
  private async generateDealTags(deal: ScrapedDeal): Promise<string[]> {
    const prompt = `Generate 5-8 relevant tags for this restaurant deal. Focus on cuisine type, dining experience, price range, and special features:

Title: ${deal.title}
Description: ${deal.description}
Price Range: ${deal.discountedPrice}

Return only the tags, separated by commas.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return response.split(',').map(tag => tag.trim()).filter(Boolean);
    } catch (error) {
      console.error('❌ Failed to generate deal tags:', error);
      return deal.tags; // Fallback to original tags
    }
  }

  /**
   * Generate AI summary for an attraction
   */
  private async generateAttractionSummary(attraction: ScrapedAttraction): Promise<string> {
    const prompt = `Summarize this new attraction or restaurant in 2-3 sentences for a discovery app. Focus on what makes it special and appealing:

Title: ${attraction.title}
Description: ${attraction.description}
Type: ${attraction.type}

Make it exciting and highlight unique features.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return response.trim();
    } catch (error) {
      console.error('❌ Failed to generate attraction summary:', error);
      return attraction.description; // Fallback to original description
    }
  }

  /**
   * Generate AI tags for an attraction
   */
  private async generateAttractionTags(attraction: ScrapedAttraction): Promise<string[]> {
    const prompt = `Generate 5-8 relevant tags for this new attraction or restaurant. Focus on type, experience, target audience, and special features:

Title: ${attraction.title}
Description: ${attraction.description}
Type: ${attraction.type}

Return only the tags, separated by commas.`;

    try {
      const response = await this.callGeminiAPI(prompt);
      return response.split(',').map(tag => tag.trim()).filter(Boolean);
    } catch (error) {
      console.error('❌ Failed to generate attraction tags:', error);
      return attraction.tags; // Fallback to original tags
    }
  }

  /**
   * Call Gemini API for AI processing
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    const response = await fetch(`${GEMINI_API_URL}?key=${this.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    return generatedText.trim();
  }

  /**
   * Simulate scraping deals (replace with actual scraping in production)
   */
  private async simulateScrapeDeals(source: ScrapingSource): Promise<ScrapedDeal[]> {
    // Simulate different deals based on source
    const deals: ScrapedDeal[] = [];
    
    if (source.id === 'eatigo') {
      deals.push({
        id: `deal_${Date.now()}_1`,
        title: '50% Off at Modern Filipino Restaurant',
        description: 'Experience contemporary Filipino cuisine with a modern twist. Perfect for date nights and special occasions.',
        originalPrice: 2000,
        discountedPrice: 1000,
        percentageOff: 50,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        sourceUrl: source.url,
        sourceType: 'website',
        tags: ['Filipino', 'Fine Dining', 'Date Night'],
        categories: ['Restaurant', 'Fine Dining'],
        imageUrls: ['https://example.com/image1.jpg'],
        scrapedTimestamp: new Date()
      });
    }
    
    if (source.id === 'groupon_ph') {
      deals.push({
        id: `deal_${Date.now()}_2`,
        title: 'Buy 1 Get 1 Free at Korean BBQ',
        description: 'Authentic Korean barbecue experience with premium meats and unlimited side dishes.',
        originalPrice: 1500,
        discountedPrice: 1500,
        percentageOff: 50, // BOGO = 50% off
        validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        sourceUrl: source.url,
        sourceType: 'website',
        tags: ['Korean', 'BBQ', 'All You Can Eat'],
        categories: ['Restaurant', 'Asian'],
        imageUrls: ['https://example.com/image2.jpg'],
        scrapedTimestamp: new Date()
      });
    }
    
    return deals;
  }

  /**
   * Simulate scraping attractions (replace with actual scraping in production)
   */
  private async simulateScrapeAttractions(source: ScrapingSource): Promise<ScrapedAttraction[]> {
    // Simulate different attractions based on source
    const attractions: ScrapedAttraction[] = [];
    
    if (source.id === 'spot_ph') {
      attractions.push({
        id: `attraction_${Date.now()}_1`,
        title: 'New Rooftop Bar Opens in BGC',
        description: 'A stunning new rooftop bar with panoramic views of the city skyline, featuring craft cocktails and tapas.',
        type: 'restaurant',
        openingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Opens in 3 days
        sourceUrl: source.url,
        sourceType: 'website',
        tags: ['Rooftop', 'Cocktails', 'Skyline View'],
        categories: ['Bar', 'Fine Dining'],
        imageUrls: ['https://example.com/image3.jpg'],
        scrapedTimestamp: new Date()
      });
    }
    
    if (source.id === 'timeout_manila') {
      attractions.push({
        id: `attraction_${Date.now()}_2`,
        title: 'Pop-up Ramen Festival in Makati',
        description: 'A week-long celebration of authentic Japanese ramen featuring 10 different vendors and unique flavors.',
        type: 'event',
        openingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Starts in 5 days
        sourceUrl: source.url,
        sourceType: 'website',
        tags: ['Ramen', 'Festival', 'Japanese'],
        categories: ['Event', 'Food Festival'],
        imageUrls: ['https://example.com/image4.jpg'],
        scrapedTimestamp: new Date()
      });
    }
    
    return attractions;
  }

  /**
   * Get scraping statistics
   */
  getScrapingStats(): {
    totalSources: number;
    enabledSources: number;
    lastScraped: Date | null;
    averageSuccessRate: number;
    dealsFound: number;
    attractionsFound: number;
  } {
    const enabledSources = this.sources.filter(s => s.enabled);
    const lastScraped = enabledSources.length > 0 
      ? Math.max(...enabledSources.map(s => s.lastScraped?.getTime() || 0))
      : null;
    
    const averageSuccessRate = enabledSources.length > 0
      ? enabledSources.reduce((sum, s) => sum + s.successRate, 0) / enabledSources.length
      : 0;
    
    return {
      totalSources: this.sources.length,
      enabledSources: enabledSources.length,
      lastScraped: lastScraped ? new Date(lastScraped) : null,
      averageSuccessRate,
      dealsFound: 0, // Would be updated from database
      attractionsFound: 0 // Would be updated from database
    };
  }

  /**
   * Delay function for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const scrapingService = ScrapingService.getInstance(); 