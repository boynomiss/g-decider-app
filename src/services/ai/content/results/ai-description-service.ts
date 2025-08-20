// Google Gemini API configuration
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const GEMINI_ENABLED = (process.env.EXPO_PUBLIC_ENABLE_GEMINI ?? 'false') === 'true';

// Skip Toolkit LLM due to consistent 500 errors
const SKIP_TOOLKIT_LLM = (process.env.EXPO_PUBLIC_SKIP_TOOLKIT_LLM ?? 'true') === 'true';

// Cache for AI-generated descriptions
const descriptionCache = new Map<string, { description: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Clear cache to force regeneration with new prompt format
descriptionCache.clear();

// Debug logging for configuration
console.log('🤖 AI Description Service Configuration:', {
  GEMINI_ENABLED,
  GEMINI_API_KEY_PRESENT: !!GEMINI_API_KEY,
  GEMINI_API_KEY_LENGTH: GEMINI_API_KEY.length,
  NODE_ENV: process.env.NODE_ENV
});

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
    relativeTimeDescription?: string;
  }[];
  images?: string[];
  category?: string;
  mood?: number;
  socialContext?: string;
  timeOfDay?: string;
  // Enhanced Google Places API data
  rating?: number;
  reviewCount?: number;
  editorialSummary?: string;
  openHours?: string;
  website?: string;
  phone?: string;
  businessStatus?: string;
  openNow?: boolean;
}

// Enhanced interfaces for better data processing
interface ExtractedFeatures {
  uniqueFeatures: string[];
  atmosphereWords: string[];
  sensoryDetails: string[];
  signatureItems: string[];
  decorElements: string[];
}

interface DescriptionVariant {
  text: string;
  score: number;
  features: string[];
}

export class AIDescriptionService {
  private static instance: AIDescriptionService;
  
  // Banned phrases that indicate generic template language
  private static readonly BANNED_PHRASES = [
    'this establishment is',
    'this moderate-priced',
    'this venue offers',
    'located in',
    'suitable for any time of day',
    'general audience',
    'calm and quiet atmosphere',
    'perfect for any occasion',
    'offers a variety of',
    'features a selection of',
    'provides an atmosphere',
    'creates an environment',
    'ensures a pleasant',
    'guarantees a memorable',
    'delivers an exceptional',
    'maintains a consistent',
    'offers something for everyone',
    'caters to all tastes',
    'accommodates various preferences',
    'meets diverse needs'
  ];
  
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
    const cacheKey = this.generateEnhancedCacheKey(restaurantData);
    const cached = descriptionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('🎯 Using cached AI description');
      return cached.description;
    }

    try {
      let description: string | null = null;
      
      // Try Gemini API first if enabled and configured
      if (GEMINI_ENABLED && GEMINI_API_KEY) {
        try {
          console.log('🤖 Attempting Gemini API call...');
          description = await this.callGeminiAPI(restaurantData);
          console.log('✅ Generated new AI description with Gemini');
        } catch (geminiErr) {
          console.warn('⚠️ Gemini API failed:', geminiErr instanceof Error ? geminiErr.message : 'Unknown error');
          console.log('ℹ️ Gemini failed, using improved local generation...');
        }
      } else {
        console.log('ℹ️ Gemini API disabled or not configured, using improved local generation...');
      }
      
      // Skip Toolkit LLM entirely due to consistent 500 errors
      // Go straight to the improved local generation for better performance and reliability
      if (!description) {
        try {
          console.log('🤖 Using enhanced local generation (skipping unreliable Toolkit LLM)...');
          description = await this.generateLocalAIDescription(restaurantData);
          console.log('✅ Generated new AI description locally with enhanced variety');
        } catch (localErr) {
          console.warn('⚠️ Local AI generation failed:', localErr instanceof Error ? localErr.message : 'Unknown error');
        }
      }

      // If all AI methods failed, use the enhanced fallback
      if (!description) {
        console.log('ℹ️ Using enhanced local fallback description for best reliability');
        description = this.generateEnhancedFallbackDescription(restaurantData);
      }

      // Quality control and validation
      const validation = this.validateDescription(description);
      if (!validation.valid) {
        console.warn('⚠️ Generated description failed validation:', validation.issues);
        // Try to fix common issues
        description = this.fixDescriptionIssues(description, validation.issues);
      }

      // Cache the successful result
      descriptionCache.set(cacheKey, { description, timestamp: Date.now() });
      return description;
      
    } catch (error) {
      console.error('❌ Critical error in AI description generation:', error);
      console.warn('⚠️ Using enhanced fallback description due to critical error');
      return this.generateEnhancedFallbackDescription(restaurantData);
    }
  }

  /**
   * Call Google Gemini API to generate description
   */
  private async callGeminiAPI(restaurantData: RestaurantData): Promise<string> {
    const prompt = this.buildEnhancedGeminiPrompt(restaurantData);
    const url = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [ { parts: [ { text: prompt } ] } ],
        generationConfig: { 
          temperature: 0.8, 
          topK: 40, 
          topP: 0.95, 
          maxOutputTokens: 200 
        }
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
   * Build an enhanced, comprehensive prompt for AI providers
   */
  private buildEnhancedGeminiPrompt(restaurantData: RestaurantData): string {
    const extractedFeatures = this.extractUniqueFeatures(restaurantData);
    const atmosphereWords = this.generateAtmosphereWords(restaurantData);
    
    const reviewInsights = this.extractReviewInsights(restaurantData.reviews || []);
    const sensoryContext = this.buildSensoryContext(restaurantData, extractedFeatures);
    const googlePlacesContext = this.buildGooglePlacesContext(restaurantData);
    
    const prompt = `You are a local food critic and venue expert who writes compelling, specific venue descriptions that make people want to visit immediately.

CRITICAL OUTPUT REQUIREMENTS:
- Exactly 2 sentences, 15-35 words total
- First sentence: distinctive visual/atmospheric feature that creates immediate visual appeal
- Second sentence: specific experience or unique reason to choose this place
- Use sensory language: what would someone see, hear, smell, feel, or taste?

STRICTLY FORBIDDEN PHRASES (never use these):
${AIDescriptionService.BANNED_PHRASES.map(phrase => `- "${phrase}"`).join('\n')}

HIGH-QUALITY EXAMPLES:
- "Intimate speakeasy hidden behind a vintage bookcase with exposed brick walls. Craft cocktails served in crystal glasses with live jazz every Thursday night."
- "Sun-drenched patio with string lights and herb gardens growing fresh ingredients. Known for wood-fired pizzas and an impressive local wine selection."
- "Industrial-chic space with soaring ceilings and an open kitchen where you can watch chefs work. Perfect for date nights with their signature tasting menu."

VENUE DATA:
- Category: ${restaurantData.category || 'restaurant'}
- Unique Features: ${extractedFeatures.uniqueFeatures.join(', ') || 'n/a'}
- Atmosphere: ${atmosphereWords.join(', ') || 'n/a'}
- Sensory Details: ${sensoryContext}
- Budget: ${this.getEnhancedBudgetText(restaurantData.budget)}
- Mood: ${this.getEnhancedMoodContext(restaurantData.mood)}
- Social Setting: ${this.getEnhancedSocialContext(restaurantData.socialContext)}
- Time Context: ${this.getEnhancedTimeContext(restaurantData.timeOfDay)}
${googlePlacesContext}
${reviewInsights ? `- Review Insights:\n${reviewInsights}` : ''}

Write a description that makes someone think "I want to go there right now" based on the specific details above.`;

    console.log('🔍 [AI Description Service] Enhanced prompt built for:', restaurantData.name);
    console.log('🔍 [AI Description Service] Prompt length:', prompt.length, 'characters');
    console.log('🔍 [AI Description Service] Has Google Places context:', !!googlePlacesContext);
    console.log('🔍 [AI Description Service] Has review insights:', !!reviewInsights);
    
    return prompt;
  }

  /**
   * Extract unique features from reviews and tags
   */
  private extractUniqueFeatures(restaurantData: RestaurantData): ExtractedFeatures {
    const { reviews = [], tags = [], category = '', businessStatus, openHours, website, phone } = restaurantData;
    
    // Extract features from reviews
    const reviewFeatures: string[] = [];
    const sensoryDetails: string[] = [];
    const signatureItems: string[] = [];
    const decorElements: string[] = [];
    
    reviews.forEach(review => {
      const text = review.text.toLowerCase();
      
      // Extract sensory details
      if (text.includes('lighting') || text.includes('light')) sensoryDetails.push('lighting');
      if (text.includes('music') || text.includes('sound')) sensoryDetails.push('music');
      if (text.includes('smell') || text.includes('aroma')) sensoryDetails.push('aroma');
      if (text.includes('decor') || text.includes('atmosphere')) decorElements.push('decor');
      if (text.includes('seating') || text.includes('chairs')) decorElements.push('seating');
      if (text.includes('kitchen') || text.includes('chef')) decorElements.push('kitchen');
      
      // Extract signature items
      if (text.includes('signature') || text.includes('famous') || text.includes('best')) {
        signatureItems.push('signature dishes');
      }
    });
    
    // Extract features from tags
    const uniqueFeatures = tags.filter(tag => 
      !tag.toLowerCase().includes('budget') && 
      !tag.toLowerCase().includes('price') &&
      !tag.toLowerCase().includes('mood') &&
      !tag.toLowerCase().includes('restaurant') &&
      !tag.toLowerCase().includes('food')
    ).map(tag => this.enhanceTagDescription(tag));
    
    // Add Google Places API specific features
    if (businessStatus) {
      uniqueFeatures.push(`Business Status: ${businessStatus}`);
    }
    if (openHours) {
      uniqueFeatures.push(`Hours: ${openHours}`);
    }
    if (website) {
      uniqueFeatures.push('Has Website');
    }
    if (phone) {
      uniqueFeatures.push('Phone Available');
    }
    
    // Generate atmosphere words based on category and features
    const atmosphereWords = this.generateAtmosphereWords(restaurantData);
    
    return {
      uniqueFeatures: Array.from(new Set([...uniqueFeatures, ...reviewFeatures])),
      atmosphereWords,
      sensoryDetails: Array.from(new Set(sensoryDetails)),
      signatureItems: Array.from(new Set(signatureItems)),
      decorElements: Array.from(new Set(decorElements))
    };
  }

  /**
   * Enhance generic tags into descriptive features
   */
  private enhanceTagDescription(tag: string): string {
    const enhancements: Record<string, string> = {
      'outdoor': 'outdoor seating',
      'romantic': 'romantic atmosphere',
      'family': 'family-friendly space',
      'group': 'group seating',
      'live': 'live entertainment',
      'bar': 'full bar service',
      'cafe': 'casual cafe vibe',
      'coffee': 'specialty coffee',
      'bakery': 'fresh-baked goods',
      'wine': 'wine selection',
      'cocktail': 'craft cocktails',
      'beer': 'craft beer',
      'organic': 'organic ingredients',
      'vegan': 'vegan options',
      'gluten-free': 'gluten-free menu'
    };
    
    return enhancements[tag.toLowerCase()] || tag;
  }

  /**
   * Generate atmospheric words based on venue data
   */
  private generateAtmosphereWords(restaurantData: RestaurantData): string[] {
    const { category = '', mood, tags = [] } = restaurantData;
    const atmosphereWords: string[] = [];
    
    // Category-based atmosphere
    if (category.toLowerCase().includes('bar')) {
      atmosphereWords.push('buzzing', 'energetic', 'social', 'vibrant');
    } else if (category.toLowerCase().includes('cafe')) {
      atmosphereWords.push('cozy', 'relaxed', 'casual', 'welcoming');
    } else if (category.toLowerCase().includes('restaurant')) {
      atmosphereWords.push('elegant', 'sophisticated', 'refined', 'polished');
    }
    
    // Mood-based atmosphere
    if (mood !== undefined && mood !== null) {
      if (mood >= 80) atmosphereWords.push('pulsing', 'electric', 'dynamic');
      else if (mood >= 60) atmosphereWords.push('buzzing', 'lively', 'energetic');
      else if (mood >= 40) atmosphereWords.push('relaxed', 'comfortable', 'easygoing');
      else if (mood >= 20) atmosphereWords.push('peaceful', 'tranquil', 'serene');
      else atmosphereWords.push('intimate', 'cozy', 'quiet');
    }
    
    // Tag-based atmosphere
    if (tags.some(tag => tag.toLowerCase().includes('outdoor'))) {
      atmosphereWords.push('al fresco', 'open-air', 'natural');
    }
    if (tags.some(tag => tag.toLowerCase().includes('romantic'))) {
      atmosphereWords.push('romantic', 'intimate', 'charming');
    }
    
    return Array.from(new Set(atmosphereWords));
  }

  /**
   * Extract insights from reviews
   */
  private extractReviewInsights(reviews: RestaurantData['reviews']): string {
    console.log('🔍 [AI Description Service] Extracting review insights from:', reviews?.length || 0, 'reviews');
    
    if (!reviews || reviews.length === 0) {
      console.log('🔍 [AI Description Service] No reviews available for insights');
      return '';
    }
    
    const insights: string[] = [];
    const positiveReviews = reviews.filter(r => r.rating >= 4);
    const negativeReviews = reviews.filter(r => r.rating <= 2);
    
    console.log('🔍 [AI Description Service] Review analysis:', {
      totalReviews: reviews.length,
      positiveReviews: positiveReviews.length,
      negativeReviews: negativeReviews.length
    });
    
    if (positiveReviews.length > 0) {
      const topReview = positiveReviews[0];
      if (topReview) {
        const text = topReview.text.substring(0, 100).replace(/\s+\w+$/, '');
        const author = topReview.author || 'Anonymous';
        const timeInfo = topReview.relativeTimeDescription ? ` (${topReview.relativeTimeDescription})` : '';
        insights.push(`Top review by ${author}${timeInfo} (${topReview.rating}/5): "${text}..."`);
      }
    }
    
    if (positiveReviews.length > negativeReviews.length) {
      insights.push('Consistently praised by visitors');
    } else if (negativeReviews.length > positiveReviews.length) {
      insights.push('Mixed reviews from visitors');
    }
    
    // Add review statistics
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    if (reviews.length > 0) {
      insights.push(`Average rating: ${avgRating.toFixed(1)}/5 from ${reviews.length} reviews`);
    }
    
    // Extract common themes from reviews
    const commonThemes = this.extractCommonThemes(reviews);
    if (commonThemes.length > 0) {
      insights.push(`Common themes: ${commonThemes.join(', ')}`);
    }
    
    const result = insights.join('\n');
    console.log('🔍 [AI Description Service] Review insights result:', result || 'No insights available');
    
    return result;
  }

  /**
   * Extract common themes from reviews
   */
  private extractCommonThemes(reviews: RestaurantData['reviews']): string[] {
    if (!reviews || reviews.length === 0) return [];
    
    const themeKeywords: Record<string, string[]> = {
      'atmosphere': ['atmosphere', 'ambiance', 'vibe', 'mood', 'feeling', 'energy'],
      'service': ['service', 'staff', 'friendly', 'helpful', 'attentive', 'professional'],
      'food': ['food', 'delicious', 'tasty', 'flavor', 'quality', 'fresh', 'amazing'],
      'value': ['value', 'worth', 'price', 'affordable', 'expensive', 'reasonable'],
      'location': ['location', 'convenient', 'accessible', 'parking', 'area'],
      'cleanliness': ['clean', 'hygiene', 'tidy', 'maintained', 'spotless'],
      'speed': ['fast', 'quick', 'slow', 'wait', 'timing', 'efficient']
    };
    
    const themeCounts: Record<string, number> = {};
    
    reviews.forEach(review => {
      const text = review.text.toLowerCase();
      
      Object.entries(themeKeywords).forEach(([theme, keywords]) => {
        const matches = keywords.filter(keyword => text.includes(keyword));
        if (matches.length > 0) {
          themeCounts[theme] = (themeCounts[theme] || 0) + matches.length;
        }
      });
    });
    
    // Return top 3 themes by frequency
    return Object.entries(themeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);
  }

  /**
   * Build sensory context for the prompt
   */
  private buildSensoryContext(restaurantData: RestaurantData, features: ExtractedFeatures): string {
    const contexts: string[] = [];
    
    if (features.sensoryDetails.length > 0) {
      contexts.push(`Sensory: ${features.sensoryDetails.join(', ')}`);
    }
    
    if (features.decorElements.length > 0) {
      contexts.push(`Decor: ${features.decorElements.join(', ')}`);
    }
    
    if (features.signatureItems.length > 0) {
      contexts.push(`Signature: ${features.signatureItems.join(', ')}`);
    }
    
    return contexts.join(' | ') || 'Standard venue atmosphere';
  }

  /**
   * Build Google Places context for the prompt
   */
  private buildGooglePlacesContext(restaurantData: RestaurantData): string {
    const { rating, reviewCount, editorialSummary, openHours, website, phone, businessStatus, openNow } = restaurantData;
    const context: string[] = [];

    console.log('🔍 [AI Description Service] Building Google Places context with data:', {
      name: restaurantData.name,
      rating,
      reviewCount,
      hasEditorialSummary: !!editorialSummary,
      hasOpenHours: !!openHours,
      hasWebsite: !!website,
      hasPhone: !!phone,
      businessStatus,
      openNow
    });

    if (rating !== undefined && rating !== null) {
      context.push(`Rating: ${rating.toFixed(1)}/5`);
    }
    if (reviewCount !== undefined && reviewCount !== null) {
      context.push(`Reviews: ${reviewCount} reviews`);
    }
    if (editorialSummary) {
      context.push(`Editorial Summary: ${editorialSummary}`);
    }
    if (openHours) {
      context.push(`Open Hours: ${openHours}`);
    }
    if (website) {
      context.push(`Website: ${website}`);
    }
    if (phone) {
      context.push(`Phone: ${phone}`);
    }
    if (businessStatus) {
      context.push(`Business Status: ${businessStatus}`);
    }
    if (openNow !== undefined && openNow !== null) {
      context.push(`Open Now: ${openNow ? 'Yes' : 'No'}`);
    }

    const result = context.length > 0 ? `Google Places Details:\n${context.join('\n')}` : '';
    console.log('🔍 [AI Description Service] Google Places context result:', result || 'No context available');
    
    return result;
  }

  /**
   * Generate enhanced fallback description with variety
   */
  private generateEnhancedFallbackDescription(restaurantData: RestaurantData): string {
    const { tags, budget, category, mood, socialContext, timeOfDay } = restaurantData;
    const extractedFeatures = this.extractUniqueFeatures(restaurantData);
    
    // Generate multiple variants and select the best
    const variants = this.generateDescriptionVariants(restaurantData, 3);
    const bestVariant = variants.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return bestVariant.text;
  }

  /**
   * Generate multiple description variants for testing
   */
  private generateDescriptionVariants(restaurantData: RestaurantData, count: number): DescriptionVariant[] {
    const { tags, budget, category, mood, socialContext, timeOfDay } = restaurantData;
    const extractedFeatures = this.extractUniqueFeatures(restaurantData);
    
    const variants: DescriptionVariant[] = [];
    
    // Generate more diverse variants based on available data
    const availableVariants = this.generateAllPossibleVariants(restaurantData, extractedFeatures);
    
    // Randomly select variants to ensure variety
    const shuffledVariants = availableVariants.sort(() => Math.random() - 0.5);
    
    return shuffledVariants.slice(0, count);
  }

  /**
   * Generate all possible description variants for maximum variety
   */
  private generateAllPossibleVariants(restaurantData: RestaurantData, extractedFeatures: ExtractedFeatures): DescriptionVariant[] {
    const { tags, budget, category, mood, socialContext, timeOfDay } = restaurantData;
    const variants: DescriptionVariant[] = [];
    
    // Variant 1: Feature-focused with sensory details
    const primaryFeature = extractedFeatures.uniqueFeatures[0] || this.getRandomAtmosphereWord();
    const cuisineTags = tags.filter(tag => 
      !tag.toLowerCase().includes('budget') && 
      !tag.toLowerCase().includes('price') &&
      !tag.toLowerCase().includes('mood')
    ).slice(0, 2);
    
    const variant1 = `${this.capitalizeFirst(primaryFeature)} with ${cuisineTags.length ? cuisineTags.join(', ') : 'delicious offerings'}. ${this.getEnhancedBudgetText(budget)} pricing perfect for ${this.getEnhancedSocialContext(socialContext) || 'any occasion'}.`;
    
    variants.push({
      text: variant1,
      score: this.scoreDescription(variant1),
      features: ['feature-focused', 'cuisine-highlighted']
    });
    
    // Variant 2: Atmosphere-focused with mood context
    const moodContext = this.getEnhancedMoodContext(mood);
    const timeContext = this.getEnhancedTimeContext(timeOfDay);
    
    const variant2 = `${moodContext ? `A ${moodContext} ` : 'A welcoming '}${category || 'venue'} featuring ${extractedFeatures.atmosphereWords.slice(0, 2).join(', ') || 'unique charm'}. ${timeContext ? `Ideal for ${timeContext} ` : 'Perfect for any time '}with ${this.getEnhancedBudgetText(budget)} options.`;
    
    variants.push({
      text: variant2,
      score: this.scoreDescription(variant2),
      features: ['atmosphere-focused', 'mood-highlighted']
    });
    
    // Variant 3: Experience-focused with signature items
    const signatureItems = extractedFeatures.signatureItems.length > 0 ? 
      extractedFeatures.signatureItems[0] : 'memorable dining';
    
    const variant3 = `${this.capitalizeFirst(category || 'establishment')} known for ${signatureItems} and ${extractedFeatures.decorElements[0] || 'distinctive atmosphere'}. ${this.getEnhancedBudgetText(budget)} experience that ${this.getEnhancedSocialContext(socialContext) || 'caters to all preferences'}.`;
    
    variants.push({
      text: variant3,
      score: this.scoreDescription(variant3),
      features: ['experience-focused', 'signature-highlighted']
    });

    // Variant 4: Sensory-focused with lighting and ambiance
    const sensoryDetails = extractedFeatures.sensoryDetails.length > 0 ? 
      extractedFeatures.sensoryDetails[0] : 'warm lighting';
    const decorElement = extractedFeatures.decorElements[0] || 'charming decor';
    
    const variant4 = `${this.capitalizeFirst(sensoryDetails || 'warm lighting')} creates a ${this.getRandomAtmosphereWord()} atmosphere with ${decorElement}. ${this.getEnhancedBudgetText(budget)} venue perfect for ${this.getEnhancedSocialContext(socialContext) || 'any gathering'}.`;
    
    variants.push({
      text: variant4,
      score: this.scoreDescription(variant4),
      features: ['sensory-focused', 'ambiance-highlighted']
    });

    // Variant 5: Time-focused with specific moments
    const timeSpecific = timeOfDay ? this.getTimeSpecificDescription(timeOfDay) : 'any time of day';
    const moodSpecific = mood !== undefined && mood !== null ? this.getMoodSpecificDescription(mood) : 'relaxed atmosphere';
    
    const variant5 = `${this.capitalizeFirst(moodSpecific)} ${category || 'venue'} that shines during ${timeSpecific}. ${this.getEnhancedBudgetText(budget)} experience with ${extractedFeatures.uniqueFeatures.slice(0, 1).join(', ') || 'unique offerings'}.`;
    
    variants.push({
      text: variant5,
      score: this.scoreDescription(variant5),
      features: ['time-focused', 'mood-specific']
    });

    // Variant 6: Social context focused
    const socialSpecific = this.getSocialSpecificDescription(socialContext);
    const categorySpecific = this.getCategorySpecificDescription(category);
    
    const variant6 = `${this.capitalizeFirst(categorySpecific)} designed for ${socialSpecific} with ${extractedFeatures.atmosphereWords.slice(0, 1).join(', ') || 'welcoming atmosphere'}. ${this.getEnhancedBudgetText(budget)} pricing makes it accessible to everyone.`;
    
    variants.push({
      text: variant6,
      score: this.scoreDescription(variant6),
      features: ['social-focused', 'category-specific']
    });
    
    return variants;
  }

  /**
   * Get random atmosphere word for variety
   */
  private getRandomAtmosphereWord(): string {
    const atmosphereWords = [
      'cozy', 'welcoming', 'charming', 'intimate', 'vibrant', 'energetic', 
      'relaxed', 'elegant', 'casual', 'sophisticated', 'warm', 'inviting'
    ];
    const randomIndex = Math.floor(Math.random() * atmosphereWords.length);
    return atmosphereWords[randomIndex] || 'cozy';
  }

  /**
   * Get time-specific description
   */
  private getTimeSpecificDescription(timeOfDay: string | undefined): string {
    if (!timeOfDay) return 'any time of day';
    
    const timeMap: Record<string, string> = {
      'morning': 'morning light and breakfast specialties',
      'afternoon': 'afternoon sun and lunch favorites', 
      'night': 'evening ambiance and dinner highlights',
      'morning, afternoon': 'morning light and afternoon warmth',
      'afternoon, night': 'afternoon sun and evening glow',
      'morning, night': 'morning freshness and evening charm',
      'morning, afternoon, night': 'any time of day'
    };
    return timeMap[timeOfDay] || 'any time of day';
  }

  /**
   * Get mood-specific description
   */
  private getMoodSpecificDescription(mood: number): string {
    if (mood >= 80) return 'pulsing with energy';
    if (mood >= 60) return 'buzzing with life';
    if (mood >= 40) return 'relaxed and comfortable';
    if (mood >= 20) return 'peaceful and serene';
    return 'intimate and cozy';
  }

  /**
   * Get social-specific description
   */
  private getSocialSpecificDescription(social?: string): string {
    const socialMap: Record<string, string> = {
      'solo': 'solo diners and quiet moments',
      'couple': 'romantic couples and intimate dates',
      'family': 'families and group gatherings',
      'group': 'group celebrations and social events',
      'business': 'business meetings and professional gatherings',
      'solo, with-bae': 'both solo diners and romantic couples',
      'with-bae, barkada': 'romantic dates and group celebrations',
      'solo, with-bae, barkada': 'all types of gatherings'
    };
    return socialMap[social || ''] || 'any gathering';
  }

  /**
   * Get category-specific description
   */
  private getCategorySpecificDescription(category?: string): string {
    const categoryMap: Record<string, string> = {
      'restaurant': 'dining establishment',
      'cafe': 'coffee shop',
      'bar': 'cocktail lounge',
      'bakery': 'artisan bakery',
      'pizza': 'pizzeria',
      'sushi': 'sushi bar',
      'steakhouse': 'steakhouse',
      'seafood': 'seafood restaurant',
      'italian': 'Italian restaurant',
      'chinese': 'Chinese restaurant',
      'japanese': 'Japanese restaurant',
      'mexican': 'Mexican restaurant',
      'indian': 'Indian restaurant',
      'thai': 'Thai restaurant',
      'vietnamese': 'Vietnamese restaurant',
      'korean': 'Korean restaurant',
      'mediterranean': 'Mediterranean restaurant',
      'american': 'American restaurant',
      'french': 'French bistro',
      'spanish': 'Spanish tapas bar'
    };
    return categoryMap[(category || '').toLowerCase()] || 'venue';
  }

  /**
   * Score a description for quality
   */
  private scoreDescription(description: string): number {
    let score = 0;
    
    // Penalize banned phrases
    if (AIDescriptionService.BANNED_PHRASES.some(phrase => 
      description.toLowerCase().includes(phrase.toLowerCase())
    )) {
      score -= 50;
    }
    
    // Reward sensory language
    const sensoryWords = ['lighting', 'music', 'aroma', 'texture', 'atmosphere', 'vibe', 'energy'];
    score += sensoryWords.filter(word => description.toLowerCase().includes(word)).length * 5;
    
    // Reward specific features
    const specificWords = ['exposed', 'brick', 'patio', 'garden', 'kitchen', 'bar', 'wine', 'cocktail'];
    score += specificWords.filter(word => description.toLowerCase().includes(word)).length * 3;
    
    // Penalize generic words
    const genericWords = ['establishment', 'venue', 'place', 'restaurant', 'offers', 'provides', 'features'];
    score -= genericWords.filter(word => description.toLowerCase().includes(word)).length * 2;
    
    // Reward appropriate length
    const wordCount = description.split(' ').length;
    if (wordCount >= 15 && wordCount <= 35) score += 10;
    else score -= Math.abs(wordCount - 25);
    
    return score;
  }

  /**
   * Validate description quality
   */
  private validateDescription(description: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for banned phrases
    const bannedFound = AIDescriptionService.BANNED_PHRASES.filter(phrase => 
      description.toLowerCase().includes(phrase.toLowerCase())
    );
    if (bannedFound.length > 0) {
      issues.push(`Contains banned phrases: ${bannedFound.join(', ')}`);
    }
    
    // Check sentence count
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length !== 2) {
      issues.push(`Expected 2 sentences, found ${sentences.length}`);
    }
    
    // Check word count
    const wordCount = description.split(' ').length;
    if (wordCount < 15 || wordCount > 35) {
      issues.push(`Word count ${wordCount} outside range 15-35`);
    }
    
    // Check for repetitive patterns
    const words = description.toLowerCase().split(' ');
    const wordFrequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const repeatedWords = Object.entries(wordFrequency)
      .filter(([_, count]) => count > 2)
      .map(([word, _]) => word);
    
    if (repeatedWords.length > 0) {
      issues.push(`Repetitive words: ${repeatedWords.join(', ')}`);
    }
    
    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Fix common description issues
   */
  private fixDescriptionIssues(description: string, issues: string[]): string {
    let fixed = description;
    
    // Fix banned phrases
    AIDescriptionService.BANNED_PHRASES.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      fixed = fixed.replace(regex, this.getAlternativePhrase(phrase));
    });
    
    // Ensure proper sentence count
    const sentences = fixed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length !== 2) {
      // Split into two sentences if needed
      const words = fixed.split(' ');
      const midPoint = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, midPoint).join(' ');
      const secondHalf = words.slice(midPoint).join(' ');
      fixed = `${firstHalf}. ${secondHalf}.`;
    }
    
    return fixed;
  }

  /**
   * Get alternative phrases for banned ones
   */
  private getAlternativePhrase(bannedPhrase: string): string {
    const alternatives: Record<string, string> = {
      'this establishment is': 'This',
      'this moderate-priced': 'This',
      'this venue offers': 'This',
      'located in': 'Found in',
      'suitable for any time of day': 'perfect for any occasion',
      'general audience': 'everyone',
      'calm and quiet atmosphere': 'peaceful atmosphere',
      'perfect for any occasion': 'ideal for any gathering',
      'offers a variety of': 'features',
      'features a selection of': 'includes',
      'provides an atmosphere': 'creates',
      'creates an environment': 'offers',
      'ensures a pleasant': 'delivers',
      'guarantees a memorable': 'creates',
      'delivers an exceptional': 'provides',
      'maintains a consistent': 'offers',
      'offers something for everyone': 'caters to all',
      'caters to all tastes': 'pleases everyone',
      'accommodates various preferences': 'welcomes all',
      'meets diverse needs': 'serves everyone'
    };
    
    return alternatives[bannedPhrase.toLowerCase()] || 'This';
  }

  /**
   * Generate AI-like description locally using enhanced templates
   */
  private async generateLocalAIDescription(restaurantData: RestaurantData): Promise<string> {
    const variants = this.generateDescriptionVariants(restaurantData, 3);
    const bestVariant = variants.reduce((best, current) => 
      current.score > best.score ? current : best
    );
    
    return bestVariant.text;
  }

  private capitalizeFirst(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Generate enhanced cache key with more data points
   */
  private generateEnhancedCacheKey(restaurantData: RestaurantData): string {
    const { name, location, budget, tags, mood, category, socialContext, timeOfDay } = restaurantData;
    const reviewHash = restaurantData.reviews?.length || 0;
    const imageHash = restaurantData.images?.length || 0;
    
    return `${name}-${location}-${budget}-${mood}-${category}-${socialContext}-${timeOfDay}-${reviewHash}-${imageHash}-${tags.join(',')}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  /**
   * Get enhanced budget text with value propositions
   */
  private getEnhancedBudgetText(budget: string): string {
    const budgetMap = {
      'P': 'affordable',
      'PP': 'moderate',
      'PPP': 'premium'
    };
    return budgetMap[budget as keyof typeof budgetMap] || 'moderate';
  }

  /**
   * Get enhanced mood context with vivid descriptions
   */
  private getEnhancedMoodContext(mood?: number): string {
    if (mood === undefined || mood === null) return '';
    if (mood >= 80) return 'pulsing with live music and electric crowd energy';
    if (mood >= 60) return 'buzzing with animated conversation and infectious laughter';
    if (mood >= 40) return 'relaxed with gentle background music and easy conversation';
    if (mood >= 20) return 'peaceful retreat with soft lighting and hushed tones';
    return 'intimate setting with candlelit tables and whispered conversations';
  }

  /**
   * Get enhanced social context with specific arrangements
   */
  private getEnhancedSocialContext(social?: string): string {
    const contextMap = {
      'solo': 'solo diners with counter seating',
      'couple': 'romantic tables for two',
      'family': 'family-friendly with spacious booths',
      'group': 'communal tables and group seating',
      'business': 'quiet corners for business meetings'
    } as const;
    const key = (social || '') as keyof typeof contextMap;
    return contextMap[key] || '';
  }

  /**
   * Get enhanced time context with lighting and energy
   */
  private getEnhancedTimeContext(time?: string): string {
    const timeMap = {
      'morning': 'morning light and breakfast specialties',
      'afternoon': 'afternoon sun and lunch favorites',
      'night': 'evening ambiance and dinner highlights'
    };
    const mapped = timeMap[time as keyof typeof timeMap];
    return mapped || '';
  }

  /**
   * @deprecated This method is disabled due to consistent 500 errors from the service
   * Use local generation instead for better reliability
   */
  private async callToolkitLLM(restaurantData: RestaurantData): Promise<string> {
    const prompt = this.buildEnhancedGeminiPrompt(restaurantData);
    
    type LLMResponse = { completion?: string };
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { 
            role: 'system', 
            content: 'You write engaging, specific venue descriptions in exactly 2 sentences (15–35 words total). First sentence: distinctive visual/atmosphere. Second: what visitors can expect. No place name or location. Avoid forbidden openings. Use only provided data.' 
          },
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

  /**
   * Generate multiple descriptions for A/B testing
   */
  async generateDescriptionVariantsForTesting(restaurantData: RestaurantData, count: number = 3): Promise<string[]> {
    const variants = this.generateDescriptionVariants(restaurantData, count);
    return variants.map(v => v.text);
  }

  /**
   * Test description quality with scoring
   */
  testDescriptionQuality(description: string): { score: number; feedback: string[] } {
    const validation = this.validateDescription(description);
    const score = this.scoreDescription(description);
    
    const feedback: string[] = [];
    if (score < 0) feedback.push('Low quality score - consider regeneration');
    if (validation.issues.length > 0) feedback.push(`Validation issues: ${validation.issues.join(', ')}`);
    if (score > 20) feedback.push('High quality description');
    
    return { score, feedback };
  }
}

// Export singleton instance
export const aiDescriptionService = AIDescriptionService.getInstance(); 