/**
 * Blogger API Context Service
 * 
 * Uses Google Blogger API to find contextual information about places
 * and understand how they relate to user filters through blog content.
 */

export interface BloggerPost {
  id: string;
  title: string;
  content: string;
  published: string;
  url: string;
  author: {
    displayName: string;
  };
  labels?: string[];
}

export interface PlaceContextData {
  placeId: string;
  placeName: string;
  contextualInsights: {
    mood: string[];
    socialContext: string[];
    timeOfDay: string[];
    activities: string[];
    atmosphere: string[];
  };
  relevanceScore: number;
  sources: BloggerPost[];
}

export class BloggerContextService {
  private bloggerApiKey: string;
  private baseUrl = 'https://www.googleapis.com/blogger/v3';

  constructor(apiKey: string) {
    this.bloggerApiKey = apiKey;
  }

  /**
   * Search for blog posts related to a place to understand context
   */
  async getPlaceContext(placeName: string, location: string): Promise<PlaceContextData | null> {
    try {
      console.log('🔍 Searching Blogger API for place context:', { placeName, location });

      // Search for blog posts about the place
      const blogPosts = await this.searchBlogPosts(`${placeName} ${location} review experience`);
      
      if (blogPosts.length === 0) {
        return null;
      }

      // Analyze blog content to extract contextual insights
      const contextualInsights = this.analyzeBlogContent(blogPosts);
      
      // Calculate relevance score based on content quality and quantity
      const relevanceScore = this.calculateRelevanceScore(blogPosts, contextualInsights);

      return {
        placeId: '', // Will be set by caller
        placeName,
        contextualInsights,
        relevanceScore,
        sources: blogPosts.slice(0, 3) // Keep top 3 sources
      };

    } catch (error) {
      console.error('Error fetching place context from Blogger API:', error);
      return null;
    }
  }

  /**
   * Search blog posts using Blogger API
   */
  private async searchBlogPosts(query: string): Promise<BloggerPost[]> {
    try {
      // Note: Blogger API v3 requires a specific blog ID to search posts
      // For general search, we would need to search across known travel/food blogs
      // This is a simplified implementation - in production, you'd maintain a list of relevant blog IDs
      
      const blogIds = [
        // Add relevant blog IDs here - travel blogs, food blogs, local guides
        // These would be blogs that frequently review places and experiences
      ];

      const allPosts: BloggerPost[] = [];

      for (const blogId of blogIds) {
        const url = `${this.baseUrl}/blogs/${blogId}/posts/search`;
        const params = new URLSearchParams({
          q: query,
          key: this.bloggerApiKey,
          maxResults: '10'
        });

        const response = await fetch(`${url}?${params}`);
        
        if (!response.ok) {
          console.warn(`Failed to search blog ${blogId}:`, response.status);
          continue;
        }

        const data = await response.json();
        
        if (data.items) {
          allPosts.push(...data.items.map(this.transformBloggerPost));
        }
      }

      return allPosts;

    } catch (error) {
      console.error('Error searching blog posts:', error);
      return [];
    }
  }

  /**
   * Transform Blogger API response to our format
   */
  private transformBloggerPost(post: any): BloggerPost {
    return {
      id: post.id,
      title: post.title,
      content: post.content,
      published: post.published,
      url: post.url,
      author: {
        displayName: post.author?.displayName || 'Anonymous'
      },
      labels: post.labels || []
    };
  }

  /**
   * Analyze blog content to extract contextual insights
   */
  private analyzeBlogContent(posts: BloggerPost[]): PlaceContextData['contextualInsights'] {
    const insights = {
      mood: [] as string[],
      socialContext: [] as string[],
      timeOfDay: [] as string[],
      activities: [] as string[],
      atmosphere: [] as string[]
    };

    // Keywords to look for in blog content
    const moodKeywords = {
      romantic: ['romantic', 'date', 'intimate', 'cozy', 'candlelit'],
      energetic: ['lively', 'energetic', 'vibrant', 'exciting', 'bustling'],
      relaxed: ['relaxed', 'calm', 'peaceful', 'quiet', 'serene'],
      adventurous: ['adventure', 'exciting', 'thrilling', 'unique', 'bold']
    };

    const socialKeywords = {
      couple: ['date', 'romantic', 'couple', 'anniversary', 'proposal'],
      family: ['family', 'kids', 'children', 'parents', 'generations'],
      friends: ['friends', 'group', 'hangout', 'social', 'gathering'],
      solo: ['solo', 'alone', 'myself', 'individual', 'personal']
    };

    const timeKeywords = {
      morning: ['breakfast', 'morning', 'brunch', 'early'],
      afternoon: ['lunch', 'afternoon', 'midday'],
      evening: ['dinner', 'evening', 'night', 'late'],
      weekend: ['weekend', 'saturday', 'sunday']
    };

    const activityKeywords = {
      dining: ['eat', 'food', 'meal', 'cuisine', 'taste'],
      entertainment: ['music', 'show', 'performance', 'entertainment'],
      shopping: ['shop', 'buy', 'purchase', 'browse'],
      outdoor: ['outdoor', 'nature', 'park', 'garden', 'fresh air']
    };

    const atmosphereKeywords = {
      upscale: ['upscale', 'elegant', 'sophisticated', 'classy', 'refined'],
      casual: ['casual', 'relaxed', 'informal', 'laid-back'],
      trendy: ['trendy', 'hip', 'modern', 'contemporary', 'stylish'],
      traditional: ['traditional', 'classic', 'authentic', 'heritage']
    };

    // Analyze all blog content
    const allContent = posts.map(post => 
      `${post.title} ${post.content}`.toLowerCase()
    ).join(' ');

    // Extract insights based on keyword matches
    this.extractInsights(allContent, moodKeywords, insights.mood);
    this.extractInsights(allContent, socialKeywords, insights.socialContext);
    this.extractInsights(allContent, timeKeywords, insights.timeOfDay);
    this.extractInsights(allContent, activityKeywords, insights.activities);
    this.extractInsights(allContent, atmosphereKeywords, insights.atmosphere);

    return insights;
  }

  /**
   * Extract insights from content based on keywords
   */
  private extractInsights(content: string, keywords: Record<string, string[]>, insights: string[]) {
    for (const [category, terms] of Object.entries(keywords)) {
      const matches = terms.filter(term => content.includes(term));
      if (matches.length > 0) {
        insights.push(category);
      }
    }
  }

  /**
   * Calculate relevance score based on content quality and quantity
   */
  private calculateRelevanceScore(posts: BloggerPost[], insights: PlaceContextData['contextualInsights']): number {
    let score = 0;

    // Base score from number of posts
    score += Math.min(posts.length * 10, 50);

    // Bonus for rich insights
    const totalInsights = Object.values(insights).flat().length;
    score += Math.min(totalInsights * 5, 30);

    // Bonus for recent content
    const recentPosts = posts.filter(post => {
      const publishedDate = new Date(post.published);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return publishedDate > oneYearAgo;
    });
    score += recentPosts.length * 5;

    return Math.min(score, 100);
  }

  /**
   * Check if place context matches user filters
   */
  matchesUserFilters(context: PlaceContextData, userFilters: any): boolean {
    let matches = 0;
    let totalChecks = 0;

    // Check mood compatibility
    if (userFilters.mood && context.contextualInsights.mood.length > 0) {
      totalChecks++;
      // Convert mood number to category (this would need your mood mapping logic)
      const userMoodCategory = this.mapMoodToCategory(userFilters.mood);
      if (context.contextualInsights.mood.includes(userMoodCategory)) {
        matches++;
      }
    }

    // Check social context
    if (userFilters.socialContext && context.contextualInsights.socialContext.length > 0) {
      totalChecks++;
      if (context.contextualInsights.socialContext.includes(userFilters.socialContext)) {
        matches++;
      }
    }

    // Check time of day
    if (userFilters.timeOfDay && context.contextualInsights.timeOfDay.length > 0) {
      totalChecks++;
      if (context.contextualInsights.timeOfDay.includes(userFilters.timeOfDay)) {
        matches++;
      }
    }

    return totalChecks === 0 ? true : (matches / totalChecks) >= 0.5;
  }

  /**
   * Map mood number to category (implement based on your mood system)
   */
  private mapMoodToCategory(mood: number): string {
    // This should match your existing mood mapping logic
    if (mood <= 2) return 'relaxed';
    if (mood <= 4) return 'casual';
    if (mood <= 6) return 'energetic';
    if (mood <= 8) return 'trendy';
    return 'adventurous';
  }
}