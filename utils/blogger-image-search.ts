/**
 * Blogger Image Search Service
 * 
 * Searches for authentic place images from travel and food blogs
 * Uses Blogger API v3 and Google Custom Search to find relevant images
 */

export interface BloggerImageResult {
  url: string;
  title: string;
  blogName: string;
  blogUrl: string;
  postUrl: string;
  publishDate: string;
  author: string;
  confidence: number; // 0-100, how confident we are this image is of the actual place
  context: string; // Surrounding text that mentions the place
}

export interface BlogSearchConfig {
  placeName: string;
  placeAddress?: string;
  placeTypes?: string[];
  coordinates?: { lat: number; lng: number };
  maxResults?: number;
}

const BLOGGER_API_KEY = process.env.EXPO_PUBLIC_BLOGGER_API_KEY || '';
const CUSTOM_SEARCH_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_CUSTOM_SEARCH_API_KEY || '';
const CUSTOM_SEARCH_ENGINE_ID = process.env.EXPO_PUBLIC_GOOGLE_CUSTOM_SEARCH_ENGINE_ID || '';

export class BloggerImageSearchService {
  private baseUrl = 'https://www.googleapis.com/blogger/v3';
  private customSearchUrl = 'https://www.googleapis.com/customsearch/v1';

  /**
   * Search for authentic place images from blogs
   * Enhanced to find more high-quality images with better confidence scoring
   */
  async searchPlaceImages(config: BlogSearchConfig): Promise<BloggerImageResult[]> {
    console.log(`🔍 Enhanced blog image search for ${config.placeName} (targeting ${config.maxResults || 6} high-quality images)`);
    
    const results: BloggerImageResult[] = [];
    const maxResults = config.maxResults || 6;

    try {
      // Step 1: Multiple search strategies for better coverage
      const searchStrategies = [
        this.searchBlogPosts(config), // Original search
        this.searchBlogPosts({...config, placeName: `"${config.placeName}" review`}), // Review-focused
        this.searchBlogPosts({...config, placeName: `"${config.placeName}" photos`}), // Photo-focused
        this.searchBlogPosts({...config, placeName: `visit ${config.placeName}`}) // Visit-focused
      ];
      
      // Execute all searches in parallel
      const allSearchResults = await Promise.allSettled(searchStrategies);
      
      // Step 2: Process all successful search results
      for (const searchResult of allSearchResults) {
        if (searchResult.status === 'fulfilled') {
          const blogPosts = searchResult.value;
          
          for (const post of blogPosts) {
            const images = await this.extractImagesFromPost(post, config);
            results.push(...images);
            
            // Stop if we have enough high-quality results
            if (results.filter(r => r.confidence >= 70).length >= maxResults) {
              break;
            }
          }
        }
      }

      // Step 3: Enhanced filtering and sorting
      const uniqueResults = this.deduplicateResults(results);
      const highQualityResults = uniqueResults.filter(r => r.confidence >= 60); // Lower threshold for more results
      
      // Sort by confidence and quality indicators
      highQualityResults.sort((a, b) => {
        // Primary sort by confidence
        if (b.confidence !== a.confidence) {
          return b.confidence - a.confidence;
        }
        // Secondary sort by context quality
        return this.calculateContextQuality(b.context) - this.calculateContextQuality(a.context);
      });
      
      const finalResults = highQualityResults.slice(0, maxResults);
      console.log(`📚 Found ${finalResults.length} high-quality blog images for ${config.placeName}`);
      
      return finalResults;

    } catch (error) {
      console.error('Enhanced blog image search failed:', error);
      return [];
    }
  }

  /**
   * Search for blog posts about the place using Custom Search API
   */
  private async searchBlogPosts(config: BlogSearchConfig): Promise<any[]> {
    if (!CUSTOM_SEARCH_API_KEY || !CUSTOM_SEARCH_ENGINE_ID) {
      console.warn('Custom Search API not configured for blog search');
      return [];
    }

    const searchQuery = this.buildSearchQuery(config);
    const url = `${this.customSearchUrl}?key=${CUSTOM_SEARCH_API_KEY}&cx=${CUSTOM_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        console.error('Custom Search API error:', data.error);
        return [];
      }

      return data.items || [];
    } catch (error) {
      console.error('Failed to search blog posts:', error);
      return [];
    }
  }

  /**
   * Build an effective search query for the place
   */
  private buildSearchQuery(config: BlogSearchConfig): string {
    const terms = [
      `"${config.placeName}"`,
      config.placeAddress ? `"${config.placeAddress}"` : '',
      'review',
      'photos',
      'visited',
      'experience'
    ].filter(Boolean);

    // Add place type context
    if (config.placeTypes && config.placeTypes.length > 0) {
      const primaryType = config.placeTypes[0];
      if (primaryType.includes('restaurant') || primaryType.includes('food')) {
        terms.push('food', 'dining', 'restaurant');
      } else if (primaryType.includes('tourist') || primaryType.includes('attraction')) {
        terms.push('travel', 'tourism', 'attraction');
      } else if (primaryType.includes('lodging')) {
        terms.push('hotel', 'stay', 'accommodation');
      }
    }

    // Limit to travel and food blogs
    terms.push('site:blogger.com OR site:wordpress.com OR site:medium.com');
    
    return terms.join(' ');
  }

  /**
   * Extract and validate images from blog post content
   */
  private async extractImagesFromPost(post: any, config: BlogSearchConfig): Promise<BloggerImageResult[]> {
    const results: BloggerImageResult[] = [];

    try {
      // For Custom Search results, we get image information directly
      if (post.link && post.image) {
        const confidence = this.calculateImageConfidence(post, config);
        
        if (confidence >= 60) { // Only include high-confidence images
          results.push({
            url: post.image.contextLink || post.link,
            title: post.title || 'Blog Image',
            blogName: this.extractDomainName(post.displayLink || post.link),
            blogUrl: post.displayLink || post.link,
            postUrl: post.link,
            publishDate: new Date().toISOString(), // Custom Search doesn't provide dates
            author: 'Blog Author',
            confidence,
            context: post.snippet || ''
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Failed to extract images from post:', error);
      return [];
    }
  }

  /**
   * Calculate confidence that an image is actually of the place
   */
  private calculateImageConfidence(post: any, config: BlogSearchConfig): number {
    let confidence = 50; // Base confidence

    const title = (post.title || '').toLowerCase();
    const snippet = (post.snippet || '').toLowerCase();
    const placeName = config.placeName.toLowerCase();

    // Check if place name appears in title
    if (title.includes(placeName)) {
      confidence += 30;
    }

    // Check if place name appears in snippet/context
    if (snippet.includes(placeName)) {
      confidence += 20;
    }

    // Check for review-related keywords
    const reviewKeywords = ['review', 'visited', 'experience', 'tried', 'went to'];
    if (reviewKeywords.some(keyword => snippet.includes(keyword))) {
      confidence += 15;
    }

    // Check for photo-related keywords
    const photoKeywords = ['photo', 'picture', 'image', 'shot', 'captured'];
    if (photoKeywords.some(keyword => snippet.includes(keyword))) {
      confidence += 10;
    }

    // Penalize generic terms that might indicate stock photos
    const genericTerms = ['stock', 'shutterstock', 'getty', 'unsplash', 'pixabay'];
    if (genericTerms.some(term => (title + snippet).includes(term))) {
      confidence -= 40;
    }

    // Check if address is mentioned
    if (config.placeAddress && snippet.includes(config.placeAddress.toLowerCase())) {
      confidence += 15;
    }

    return Math.max(0, Math.min(100, confidence));
  }

  /**
   * Extract domain name from URL for blog identification
   */
  private extractDomainName(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown Blog';
    }
  }

  /**
   * Validate that an image URL is accessible and appropriate
   */
  async validateImageUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        return false;
      }

      const contentType = response.headers.get('content-type');
      return contentType ? contentType.startsWith('image/') : false;
    } catch {
      return false;
    }
  }

  /**
   * Remove duplicate results based on URL
   */
  private deduplicateResults(results: BloggerImageResult[]): BloggerImageResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      if (seen.has(result.url)) {
        return false;
      }
      seen.add(result.url);
      return true;
    });
  }

  /**
   * Calculate context quality score for better sorting
   */
  private calculateContextQuality(context: string): number {
    let score = 0;
    const lowerContext = context.toLowerCase();
    
    // Quality indicators
    const qualityKeywords = ['amazing', 'beautiful', 'stunning', 'perfect', 'excellent', 'wonderful', 'incredible', 'gorgeous', 'spectacular'];
    const experienceKeywords = ['visited', 'tried', 'went to', 'experienced', 'enjoyed', 'loved', 'recommend'];
    const photoKeywords = ['photo', 'picture', 'shot', 'captured', 'image'];
    
    // Score based on keyword presence
    qualityKeywords.forEach(keyword => {
      if (lowerContext.includes(keyword)) score += 3;
    });
    
    experienceKeywords.forEach(keyword => {
      if (lowerContext.includes(keyword)) score += 2;
    });
    
    photoKeywords.forEach(keyword => {
      if (lowerContext.includes(keyword)) score += 1;
    });
    
    // Length bonus (longer context usually means more detailed review)
    if (context.length > 100) score += 2;
    if (context.length > 200) score += 3;
    
    return score;
  }

  /**
   * Get blog information using Blogger API
   */
  private async getBlogInfo(blogUrl: string): Promise<any> {
    if (!BLOGGER_API_KEY) {
      return null;
    }

    try {
      const url = `${this.baseUrl}/blogs/byurl?url=${encodeURIComponent(blogUrl)}&key=${BLOGGER_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      return data.error ? null : data;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const bloggerImageSearch = new BloggerImageSearchService();