import { UserFilters } from '../types/app';
import { ServerFilteringResponse, ServerFilteringError, ServerFilteringRequest, validateAndSanitizeResponse } from '../types/server-filtering';
import { enhancedCachingService } from './enhanced-caching-service';

// React Native compatible AbortSignal.timeout polyfill
function createTimeoutSignal(timeout: number): AbortSignal {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    const reason = new Error(
      `The operation was aborted due to timeout (${timeout}ms)`
    );
    reason.name = 'TimeoutError';
    controller.abort(reason);
  }, timeout);
  
  // Clean up timeout if signal is aborted by other means
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  }, { once: true });
  
  return controller.signal;
}

export class ServerFilteringService {
  private static instance: ServerFilteringService;
  private baseUrl: string;
  private timeout: number;
  private maxRetries: number;
  private retryDelay: number;
  private cacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };

  private constructor() {
    // Use Firebase Function URL for both development and production
    // Localhost doesn't work on mobile devices, so always use production URL
    this.baseUrl = 'https://asia-southeast1-g-decider-backend.cloudfunctions.net/filterPlaces';
    this.timeout = 30000; // 30 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second initial delay
  }

  static getInstance(): ServerFilteringService {
    if (!ServerFilteringService.instance) {
      ServerFilteringService.instance = new ServerFilteringService();
    }
    return ServerFilteringService.instance;
  }

  async filterPlaces(
    filters: UserFilters,
    minResults: number = 5,
    useCache: boolean = true
  ): Promise<ServerFilteringResponse> {
    console.log('🚀 Calling server-side filtering with filters:', filters);
    console.log('🌐 Using URL:', this.baseUrl);

    this.cacheStats.totalRequests++;

    // Try to get from cache first
    if (useCache) {
      const cachedResult = await enhancedCachingService.get(filters, minResults);
      if (cachedResult) {
        console.log('✅ Cache hit! Returning cached results');
        this.cacheStats.hits++;
        
        return {
          ...cachedResult,
          source: 'cache',
          cacheHit: true,
          performance: {
            ...cachedResult.performance,
            cacheHitRate: this.getCacheHitRate()
          }
        };
      }
      
      console.log('❌ Cache miss, fetching from server...');
      this.cacheStats.misses++;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`📡 Attempt ${attempt}/${this.maxRetries}...`);
        
        const response = await this.makeRequest(filters, minResults, useCache, attempt);
        console.log('✅ Server filtering successful on attempt', attempt);
        
        // Cache the result if caching is enabled
        if (useCache && response.success) {
          await enhancedCachingService.set(filters, response, minResults);
          console.log('💾 Cached response for future requests');
        }
        
        return response;
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        if (attempt < this.maxRetries) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`⏳ Retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }
    
    // All retries failed, throw the last error
    throw lastError || new Error('All retry attempts failed');
  }

  private async makeRequest(
    filters: UserFilters,
    minResults: number,
    useCache: boolean,
    attempt: number
  ): Promise<any> { // Return raw response for validation
    const startTime = Date.now();
    
    // Create request body
    const requestBody = {
      filters,
      minResults,
      useCache
    };

    // Prepare fetch options with proper headers for React Native
    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'G-Decider-App/1.0',
      },
      body: JSON.stringify(requestBody),
      signal: createTimeoutSignal(this.timeout)
    };

    console.log(`📋 Request body (attempt ${attempt}):`, JSON.stringify(requestBody));

    // Make the request
    const response = await fetch(this.baseUrl, fetchOptions);
    const responseTime = Date.now() - startTime;

    console.log(`📡 Response received (attempt ${attempt}):`, {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      responseTime: `${responseTime}ms`
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If we can't parse the error response, use the status text
      }
      throw new Error(errorMessage);
    }

    const data: ServerFilteringResponse = await response.json();

    console.log('✅ Server filtering response:', {
      success: data.success,
      resultsCount: data.results.length,
      source: data.source,
      cacheHit: data.cacheHit,
      responseTime: `${responseTime}ms`,
      performance: data.performance
    });

    return {
      ...data,
      performance: {
        ...data.performance,
        responseTime
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get cache hit rate
  private getCacheHitRate(): number {
    return this.cacheStats.totalRequests > 0 
      ? this.cacheStats.hits / this.cacheStats.totalRequests 
      : 0;
  }

  // Get cache statistics
  getCacheStats() {
    return {
      ...this.cacheStats,
      hitRate: this.getCacheHitRate(),
      enhancedCacheStats: enhancedCachingService.getStats()
    };
  }

  // Invalidate cache
  async invalidateCache(pattern: 'all' | 'category' | 'location' | 'budget', value?: any): Promise<void> {
    console.log(`🗑️ Invalidating cache with pattern: ${pattern}, value: ${value}`);
    await enhancedCachingService.invalidate(pattern, value);
  }

  // Warm cache with popular queries
  async warmCache(): Promise<void> {
    const popularQueries = enhancedCachingService.getPopularQueries();
    if (popularQueries.length > 0) {
      console.log(`🔥 Warming cache with ${popularQueries.length} popular queries`);
      await enhancedCachingService.warmCache(popularQueries);
    }
  }

  // Clear all cache
  async clearCache(): Promise<void> {
    console.log('🧹 Clearing all cache');
    await enhancedCachingService.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
  }

  // Legacy method for backward compatibility
  async filterPlacesWithXMLHttpRequest(
    filters: UserFilters,
    minResults: number = 5,
    useCache: boolean = true
  ): Promise<ServerFilteringResponse> {
    console.log('🔄 Using XMLHttpRequest fallback...');
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const requestBody = JSON.stringify({
        filters,
        minResults,
        useCache
      });

      xhr.open('POST', this.baseUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('User-Agent', 'G-Decider-App/1.0');

      xhr.timeout = this.timeout;

      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: ServerFilteringResponse = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (parseError) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      };

      xhr.onerror = function() {
        reject(new Error('Network error'));
      };

      xhr.ontimeout = function() {
        reject(new Error('Request timeout'));
      };

      xhr.send(requestBody);
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Testing server connection...');
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filters: { mood: 50, category: 'food' },
          minResults: 1,
          useCache: true
        }),
        signal: createTimeoutSignal(10000) // 10 second timeout for test
      });
      
      const isOk = response.ok;
      console.log('✅ Connection test result:', isOk);
      return isOk;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }

  async testBasicHTTPS(): Promise<boolean> {
    try {
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        signal: createTimeoutSignal(5000)
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Basic HTTPS test failed:', error);
      return false;
    }
  }

  getEndpointUrl(): string {
    return this.baseUrl;
  }

  setCustomEndpoint(url: string): void {
    this.baseUrl = url;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  setRetryConfig(maxRetries: number, retryDelay: number): void {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }
}

// Export singleton instance
export const serverFilteringService = ServerFilteringService.getInstance(); 