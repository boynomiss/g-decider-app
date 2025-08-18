// Google Gemini API configuration
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_ENABLED = (process.env.EXPO_PUBLIC_ENABLE_GEMINI ?? 'false') === 'true';

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
    const cached = descriptionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🎯 Using cached AI description');
      return cached.description;
    }

    const prompt = this.buildGeminiPrompt(restaurantData);

    try {
      let description: string | null = null;
      if (GEMINI_ENABLED && GEMINI_API_KEY) {
        try {
          description = await this.callGeminiAPI(prompt);
          console.log('🤖 Generated new AI description with Gemini');
        } catch (geminiErr) {
          console.warn('ℹ️ Gemini unavailable or disabled, using Toolkit LLM fallback.');
        }
      }
      if (!description) {
        description = await this.callToolkitLLM(prompt);
        console.log('🤖 Generated new AI description with Toolkit LLM');
      }

      descriptionCache.set(cacheKey, { description, timestamp: Date.now() });
      return description;
    } catch (error) {
      console.warn('⚠️ AI description providers failed. Using fallback description.');
      return this.generateFallbackDescription(restaurantData);
    }
  }

  /**
   * Call Google Gemini API to generate description
   */
  private async callGeminiAPI(prompt: string): Promise<string> {
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [ { parts: [ { text: prompt } ] } ],
        generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 150 }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      const statusText = (errorData as any)?.error?.status ?? '';
      const reason = (errorData as any)?.error?.details?.[0]?.reason ?? '';
      if (response.status === 403 || statusText === 'PERMISSION_DENIED' || reason === 'API_KEY_SERVICE_BLOCKED') {
        throw new Error('GEMINI_DISABLED');
      }
      throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: any = await response.json();
    const generatedText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedText) throw new Error('No content generated from Gemini API');
    return generatedText.trim();
  }

  /**
   * Build a comprehensive prompt for AI providers
   */
  private buildGeminiPrompt(restaurantData: RestaurantData): string {
    const {
      budget,
      tags,
      reviews,
      category,
      mood,
      socialContext,
      timeOfDay
    } = restaurantData;

    const reviewFacts = reviews?.slice(0, 3).map(review => {
      const txt = (review.text || '').replace(/\s+/g, ' ').trim();
      return txt ? `- Review (${review.rating}/5): ${txt}` : '';
    }).filter(Boolean).join('\n');

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
      tag.toLowerCase().includes('bar') ||
      tag.toLowerCase().includes('cafe') ||
      tag.toLowerCase().includes('coffee') ||
      tag.toLowerCase().includes('bakery')
    );

    const moodContext = this.getMoodContext(mood);
    const socialContextText = this.getSocialContext(socialContext);
    const timeContext = this.getTimeContext(timeOfDay);

    return `You generate engaging, specific venue descriptions.

Output:
- Exactly 2 sentences, 15–35 words total, plain text only.
- First sentence: distinctive visual/atmospheric feature or unique selling point.
- Second sentence: what visitors can expect or why they'd choose this place.

Strict rules:
- Do not include the place name or location.
- Never start with: "This establishment is", "This moderate-priced restaurant", "This venue offers", "Located in", "Suitable for any time of day", "General audience", "Calm and quiet atmosphere".
- Use only details explicitly present in the data below (category, tags, features, reviews, price level, mood/time/social cues). No invented features or hype.
- Use concrete, sensory wording; avoid generic adjectives unless quoted from reviews.

Data:
- Category: ${category || 'restaurant'}
- Cuisine/Tags: ${cuisineTags.join(', ') || 'n/a'}
- Features: ${features.join(', ') || 'n/a'}
- Price level: ${this.getBudgetText(budget)}
- Mood cue: ${moodContext}
- Social setting: ${socialContextText}
- Time of day: ${timeContext}
${reviewFacts ? `- Reviews:\n${reviewFacts}` : ''}

Write the description now.`;
  }

  /**
   * Generate a fallback description when AI fails
   */
  private generateFallbackDescription(restaurantData: RestaurantData): string {
    const { tags, budget } = restaurantData;
    const budgetText = this.getBudgetText(budget);

    const cuisineTags = tags.filter(tag => 
      !tag.toLowerCase().includes('budget') && 
      !tag.toLowerCase().includes('price') &&
      !tag.toLowerCase().includes('mood')
    ).slice(0, 3);

    const featureTags = tags.filter(tag =>
      tag.toLowerCase().includes('bar') ||
      tag.toLowerCase().includes('outdoor') ||
      tag.toLowerCase().includes('cafe') ||
      tag.toLowerCase().includes('coffee') ||
      tag.toLowerCase().includes('bakery') ||
      tag.toLowerCase().includes('family') ||
      tag.toLowerCase().includes('group')
    ).slice(0, 2);

    const cuisineText = cuisineTags.length ? cuisineTags.join(', ') : 'comfort classics';
    const primaryFeature = featureTags[0] || 'cozy seating';

    const moodText = this.getMoodContext(restaurantData.mood);
    const socialText = this.getSocialContext(restaurantData.socialContext);
    const timeText = this.getTimeContext(restaurantData.timeOfDay);

    const firstParts: string[] = [this.capitalizeFirst(primaryFeature), 'with', cuisineText];
    if (moodText) firstParts.push(',', moodText);
    const first = firstParts.join(' ').replace(/\s+,/g, ',');

    const secondParts: string[] = ['Expect', budgetText, 'pricing'];
    if (socialText) secondParts.push('and', socialText);
    if (timeText) secondParts.push('for', timeText);
    secondParts.push('with', 'straightforward', 'choices');
    const second = secondParts.join(' ');

    return `${first}. ${second}.`;
  }

  private capitalizeFirst(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

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
    if (mood === undefined || mood === null) return '';
    if (mood >= 80) return 'pulsing with music and crowd energy';
    if (mood >= 60) return 'buzzing with conversation and laughter';
    if (mood >= 40) return 'relaxed vibe with gentle background music';
    if (mood >= 20) return 'peaceful retreat with soft lighting';
    return 'intimate setting with hushed conversations';
  }

  /**
   * Get social context for AI prompt
   */
  private getSocialContext(social?: string): string {
    const contextMap = {
      'solo': 'solo-friendly',
      'couple': 'for couples',
      'family': 'family-friendly',
      'group': 'spacious seating for groups',
      'business': 'suitable for business meetups'
    } as const;
    const key = (social || '') as keyof typeof contextMap;
    return contextMap[key] || '';
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
    const mapped = timeMap[time as keyof typeof timeMap];
    return mapped || '';
  }

  private async callToolkitLLM(prompt: string): Promise<string> {
    type LLMResponse = { completion?: string };
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You write engaging, specific venue descriptions in exactly 2 sentences (15–35 words total). First sentence: distinctive visual/atmosphere. Second: what visitors can expect. No place name or location. Avoid forbidden openings. Use only provided data.' },
          { role: 'user', content: prompt }
        ]
      })
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Toolkit LLM error: ${response.status} - ${text}`);
    }
    const data: LLMResponse = await response.json();
    const completion = data?.completion ?? '';
    if (!completion) throw new Error('Empty completion from Toolkit LLM');
    return completion.trim();
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