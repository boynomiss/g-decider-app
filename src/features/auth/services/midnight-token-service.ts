/**
 * Midnight Token Refresh Service
 * 
 * Handles automatic token refresh at midnight for all users
 * Implements batch processing and timezone handling
 */

export interface TokenRefreshResult {
  userId: string;
  oldTokens: number;
  newTokens: number;
  userType: 'free' | 'premium';
  refreshed: boolean;
  error?: string;
}

export interface BatchRefreshStats {
  totalUsers: number;
  refreshedUsers: number;
  failedUsers: number;
  totalTokensRefreshed: number;
  processingTime: number;
}

export class MidnightTokenService {
  private static instance: MidnightTokenService;
  private isRunning: boolean = false;
  private lastRunTime: Date | null = null;

  private constructor() {}

  static getInstance(): MidnightTokenService {
    if (!MidnightTokenService.instance) {
      MidnightTokenService.instance = new MidnightTokenService();
    }
    return MidnightTokenService.instance;
  }

  /**
   * Check if it's time to refresh tokens (midnight in user's timezone)
   */
  isMidnightForUser(lastRefresh: string, userTimezone: string = 'UTC'): boolean {
    if (!lastRefresh) return true;
    
    try {
      const now = new Date();
      const lastRefreshDate = new Date(lastRefresh);
      
      // Convert to user's timezone if specified
      const userNow = this.convertToUserTimezone(now, userTimezone);
      const userLastRefresh = this.convertToUserTimezone(lastRefreshDate, userTimezone);
      
      // Check if it's a new day (after midnight)
      return userNow.getDate() !== userLastRefresh.getDate() || 
             userNow.getMonth() !== userLastRefresh.getMonth() || 
             userNow.getFullYear() !== userLastRefresh.getFullYear();
    } catch (error) {
      console.error('Error checking midnight for user:', error);
      return false;
    }
  }

  /**
   * Convert date to user's timezone
   */
  private convertToUserTimezone(date: Date, timezone: string): Date {
    try {
      // In a real app, you'd use a library like date-fns-tz or moment-timezone
      // For now, we'll use the browser's built-in timezone conversion
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const userDate = new Date(utc);
      
      // Apply timezone offset (simplified - in production use proper timezone library)
      if (timezone !== 'UTC') {
        // This is a simplified approach - production should use proper timezone handling
        const timezoneOffset = this.getTimezoneOffset(timezone);
        userDate.setHours(userDate.getHours() + timezoneOffset);
      }
      
      return userDate;
    } catch (error) {
      console.error('Error converting timezone:', error);
      return date; // Fallback to original date
    }
  }

  /**
   * Get timezone offset in hours (simplified)
   */
  private getTimezoneOffset(timezone: string): number {
    // Simplified timezone mapping - in production use proper timezone library
    const timezoneMap: Record<string, number> = {
      'America/New_York': -5,
      'America/Chicago': -6,
      'America/Denver': -7,
      'America/Los_Angeles': -8,
      'Europe/London': 0,
      'Europe/Paris': 1,
      'Asia/Tokyo': 9,
      'Asia/Shanghai': 8,
      'Asia/Manila': 8,
      'UTC': 0
    };
    
    return timezoneMap[timezone] || 0;
  }

  /**
   * Refresh tokens for a single user
   */
  async refreshUserTokens(
    userId: string, 
    currentTokens: number, 
    isPremium: boolean, 
    lastRefresh: string,
    userTimezone: string = 'UTC'
  ): Promise<TokenRefreshResult> {
    try {
      const shouldRefresh = this.isMidnightForUser(lastRefresh, userTimezone);
      
      if (!shouldRefresh) {
        return {
          userId,
          oldTokens: currentTokens,
          newTokens: currentTokens,
          userType: isPremium ? 'premium' : 'free',
          refreshed: false
        };
      }

      const newTokens = isPremium ? 10 : 3;
      
      // In a real app, this would update the database
      console.log(`🔄 Refreshing tokens for user ${userId}: ${currentTokens} → ${newTokens}`);
      
      return {
        userId,
        oldTokens: currentTokens,
        newTokens,
        userType: isPremium ? 'premium' : 'free',
        refreshed: true
      };
    } catch (error) {
      console.error(`❌ Error refreshing tokens for user ${userId}:`, error);
      return {
        userId,
        oldTokens: currentTokens,
        newTokens: currentTokens,
        userType: isPremium ? 'premium' : 'free',
        refreshed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Batch refresh tokens for multiple users
   */
  async batchRefreshTokens(users: Array<{
    userId: string;
    currentTokens: number;
    isPremium: boolean;
    lastRefresh: string;
    timezone?: string;
  }>): Promise<BatchRefreshStats> {
    if (this.isRunning) {
      throw new Error('Token refresh already in progress');
    }

    this.isRunning = true;
    const startTime = Date.now();
    
    try {
      console.log(`🚀 Starting batch token refresh for ${users.length} users`);
      
      const results: TokenRefreshResult[] = [];
      const batchSize = 50; // Process in batches of 50
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchResults = await Promise.all(
          batch.map(user => 
            this.refreshUserTokens(
              user.userId,
              user.currentTokens,
              user.isPremium,
              user.lastRefresh,
              user.timezone
            )
          )
        );
        
        results.push(...batchResults);
        
        // Small delay between batches to prevent overwhelming the system
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      const stats = this.calculateBatchStats(results, Date.now() - startTime);
      
      console.log(`✅ Batch token refresh completed:`, stats);
      
      return stats;
    } finally {
      this.isRunning = false;
      this.lastRunTime = new Date();
    }
  }

  /**
   * Calculate batch refresh statistics
   */
  private calculateBatchStats(results: TokenRefreshResult[], processingTime: number): BatchRefreshStats {
    const totalUsers = results.length;
    const refreshedUsers = results.filter(r => r.refreshed).length;
    const failedUsers = results.filter(r => r.error).length;
    const totalTokensRefreshed = results
      .filter(r => r.refreshed)
      .reduce((sum, r) => sum + r.newTokens, 0);

    return {
      totalUsers,
      refreshedUsers,
      failedUsers,
      totalTokensRefreshed,
      processingTime
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime,
      serviceName: 'MidnightTokenService'
    };
  }

  /**
   * Schedule daily token refresh (for server-side implementation)
   */
  scheduleDailyRefresh() {
    // In a real app, this would set up a cron job or scheduled task
    // For now, we'll just log the scheduling
    console.log('📅 Scheduling daily token refresh at midnight for all users');
    
    // Example cron schedule: 0 0 * * * (midnight every day)
    // This would typically be handled by your server's task scheduler
  }
}

export default MidnightTokenService;
