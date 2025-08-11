// Google Gemini API configuration
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Service account configuration for server-side usage
// const GEMINI_SERVICE_ACCOUNT_PATH = './functions/gemini-api-client-key.json';

// Cache for AI-generated descriptions
const descriptionCache = new Map<string, { description: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Clear cache to force regeneration with new prompt format
descriptionCache.clear();

interface RestaurantData {
  name: string;
  location: string;
  budget: string;
  tags: string[];
  description?: string;
  reviews?: {
    author: string;
    rating: number;
    text: string;
    time: string;
  }[];
  images?: string[];
  category?: string;
  mood?: number;
  socialContext?: string;
  timeOfDay?: string;
}

export class AIDescriptionService {
  private static instance: AIDescriptionService;
  
  private constructor() {}
  
  static getInstance(): AIDescriptionService {
    if (!AIDescriptionService.instance) {
      AIDescriptionService.instance = new AIDescriptionService();
    }
    return AIDescriptionService.instance;
  }

  /**
   * Generate an AI-powered restaurant description using Google Gemini
   */
  async generateDescription(restaurantData: RestaurantData): Promise<string> {
    const cacheKey = this.generateCacheKey(restaurantData);
    
    // Check cache first
    const cached = descriptionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🎯 Using cached AI description');
      return cached.description;
    }

    try {
      const description = await this.callGeminiAPI(restaurantData);
      
      // Cache the result
      descriptionCache.set(cacheKey, {
        description,
        timestamp: Date.now()
      });
      
      console.log('🤖 Generated new AI description with Gemini');
      return description;
    } catch (error) {
      console.error('❌ Error generating AI description:', error);
      return this.generateFallbackDescription(restaurantData);
    }
  }

  /**
   * Call Google Gemini API to generate description
   */
  private async callGeminiAPI(restaurantData: RestaurantData): Promise<string> {
    const prompt = this.buildGeminiPrompt(restaurantData);
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          maxOutputTokens: 150,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No content generated from Gemini API');
    }

    return generatedText.trim();
  }

  /**
   * Build a comprehensive prompt for Gemini AI
   */
  private buildGeminiPrompt(restaurantData: RestaurantData): string {
    const {
      // name,
      // location,
      budget,
      tags,
      reviews,
      category,
      mood,
      // socialContext,
      timeOfDay
    } = restaurantData;

    // Extract key information from reviews
    const reviewHighlights = reviews?.slice(0, 3).map(review => 
      `"${review.text}" (${review.rating}/5 stars)`
    ).join('\n') || '';

    // Build mood context
    const moodContext = this.getMoodContext(mood);
    const socialContextText = this.getSocialContext(socialContext);
    const timeContext = this.getTimeContext(timeOfDay);

    // Create cuisine and features from tags
    const cuisineTags = tags.filter(tag => 
      !tag.toLowerCase().includes('budget') && 
      !tag.toLowerCase().includes('price') &&
      !tag.toLowerCase().includes('mood')
    );

    const features = tags.filter(tag => 
      tag.toLowerCase().includes('outdoor') ||
      tag.toLowerCase().includes('romantic') ||
      tag.toLowerCase().includes('family') ||
      tag.toLowerCase().includes('group') ||
      tag.toLowerCase().includes('live') ||
      tag.toLowerCase().includes('bar')
    );

    return `You are a helpful assistant that describes restaurants. Generate a concise, engaging 2-3 sentence description for the following restaurant, emphasizing aspects that align with a '${moodContext}' vibe.

Cuisine: ${cuisineTags.join(', ')}
Price Level: ${this.getBudgetText(budget)}
Key Features: ${features.join(', ')}
Category: ${category || 'restaurant'}

Context:
- Mood: ${moodContext}
- Social Setting: ${socialContextText}
- Time of Day: ${timeContext}

${reviewHighlights ? `Sample Reviews (for ambiance/vibe hints):\n${reviewHighlights}\n` : ''}

Please create a description that highlights the ambiance, cuisine, and what makes this place special. Focus on the experience and atmosphere that would appeal to someone looking for a ${moodContext} experience. DO NOT mention the restaurant name or location as these are already displayed elsewhere. Keep it to 2-3 sentences maximum.`;
  }

  /**
   * Generate a fallback description when AI fails
   */
  private generateFallbackDescription(restaurantData: RestaurantData): string {
    const { tags, budget, mood } = restaurantData;
    
    const budgetText = this.getBudgetText(budget);
    const cuisineTags = tags.filter(tag => 
      !tag.toLowerCase().includes('budget') && 
      !tag.toLowerCase().includes('price') &&
      !tag.toLowerCase().includes('mood')
    ).slice(0, 3);
    
    const moodContext = this.getMoodContext(mood);
    
    return `This establishment offers a delightful dining experience with ${budgetText} pricing and ${cuisineTags.join(', ')} options. It provides a ${moodContext} atmosphere perfect for all guests.`;
  }

  /**
   * Generate cache key for restaurant data
   */
  private generateCacheKey(restaurantData: RestaurantData): string {
    const { name, location, budget, tags, mood } = restaurantData;
    return `${name}-${location}-${budget}-${mood}-${tags.join(',')}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  /**
   * Get budget text for display
   */
  private getBudgetText(budget: string): string {
    const budgetMap = {
      'P': 'budget-friendly',
      'PP': 'moderate',
      'PPP': 'premium'
    };
    return budgetMap[budget as keyof typeof budgetMap] || 'moderate';
  }

  /**
   * Get mood context for AI prompt
   */
  private getMoodContext(mood?: number): string {
    if (!mood) return 'neutral';
    
    if (mood >= 80) return 'exciting and vibrant';
    if (mood >= 60) return 'energetic and lively';
    if (mood >= 40) return 'casual and comfortable';
    if (mood >= 20) return 'relaxed and peaceful';
    return 'calm and quiet';
  }

  /**
   * Get social context for AI prompt
   */
  private getSocialContext(social?: string): string {
    const contextMap = {
      'solo': 'perfect for solo dining',
      'couple': 'romantic atmosphere',
      'family': 'family-friendly environment',
      'group': 'great for group gatherings',
      'business': 'professional setting'
    };
    return contextMap[social as keyof typeof contextMap] || 'suitable for all occasions';
  }

  /**
   * Get time context for AI prompt
   */
  private getTimeContext(time?: string): string {
    const timeMap = {
      'morning': 'morning/breakfast',
      'afternoon': 'afternoon/lunch',
      'night': 'evening/dinner'
    };
    return timeMap[time as keyof typeof timeMap] || 'any time of day';
  }

  /**
   * Clear the description cache
   */
  clearCache(): void {
    descriptionCache.clear();
    console.log('🗑️ AI description cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; oldestEntry?: number } {
    const entries = Array.from(descriptionCache.values());
    const oldestEntry = entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : undefined;
    
    return {
      size: descriptionCache.size,
      ...(oldestEntry !== undefined && { oldestEntry })
    };
  }
}

// Export singleton instance
export const aiDescriptionService = AIDescriptionService.getInstance(); 