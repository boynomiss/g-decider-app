/**
 * Consolidated Filter Logger
 * 
 * Unified logging system that combines:
 * - Dynamic logging with real-time search query generation
 * - Static logging for basic filter changes
 * - Progress tracking for filter operations
 * - Enhanced debugging and analytics
 */

// Removed circular dependency - using direct utility functions instead
import { UnifiedFilters } from '../../types/app';

// =================
// INTERFACES & TYPES
// =================

export interface DynamicSearchQuery {
  filters: UnifiedFilters;
  generatedQuery: string;
  searchKeywords: string[];
  placeTypes: string[];
  atmosphereKeywords: string[];
  timestamp: Date;
}

export interface FilterChangeLog {
  previousFilters: UnifiedFilters;
  newFilters: UnifiedFilters;
  changedField: string;
  previousQuery: string;
  newQuery: string;
  timestamp: Date;
}

export interface ProgressTracker {
  operation: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  data?: any;
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
  operation?: string;
}

// =================
// CONSOLIDATED FILTER LOGGER
// =================

export class ConsolidatedFilterLogger {
  private static instance: ConsolidatedFilterLogger;
  private queryHistory: DynamicSearchQuery[] = [];
  private changeLog: FilterChangeLog[] = [];
  private progressTrackers: Map<string, ProgressTracker> = new Map();
  private logs: LogEntry[] = [];
  private readonly MAX_HISTORY = 100;
  private debugMode = false;

  static getInstance(): ConsolidatedFilterLogger {
    if (!ConsolidatedFilterLogger.instance) {
      ConsolidatedFilterLogger.instance = new ConsolidatedFilterLogger();
    }
    return ConsolidatedFilterLogger.instance;
  }

  // =================
  // DYNAMIC LOGGING METHODS
  // =================

  /**
   * Generate dynamic search query based on current filters
   */
  generateDynamicSearchQuery(filters: UnifiedFilters): DynamicSearchQuery {
    const query = this.buildTextSearchQuery(filters);
    const keywords = this.extractSearchKeywords(filters);
    const placeTypes = this.getPlaceTypes(filters);
    const atmosphereKeywords = this.getAtmosphereKeywords(filters);

    const searchQuery: DynamicSearchQuery = {
      filters,
      generatedQuery: query,
      searchKeywords: keywords,
      placeTypes,
      atmosphereKeywords,
      timestamp: new Date()
    };

    // Store in history
    this.queryHistory.unshift(searchQuery);
    if (this.queryHistory.length > this.MAX_HISTORY) {
      this.queryHistory = this.queryHistory.slice(0, this.MAX_HISTORY);
    }

    return searchQuery;
  }

  /**
   * Log filter changes with dynamic query comparison
   */
  logFilterChange(previousFilters: UnifiedFilters, newFilters: UnifiedFilters, changedField: string): void {
    const previousQuery = this.buildTextSearchQuery(previousFilters);
    const newQuery = this.buildTextSearchQuery(newFilters);

    const changeEntry: FilterChangeLog = {
      previousFilters,
      newFilters,
      changedField,
      previousQuery,
      newQuery,
      timestamp: new Date()
    };

    this.changeLog.unshift(changeEntry);
    if (this.changeLog.length > this.MAX_HISTORY) {
      this.changeLog = this.changeLog.slice(0, this.MAX_HISTORY);
    }

    // Log to console with dynamic query info
    console.group('🔄 Filter Change Detected');
    console.log(`📝 Changed field: ${changedField}`);
    console.log(`🔍 Previous query: "${previousQuery}"`);
    console.log(`🔍 New query: "${newQuery}"`);
    console.log(`📊 Filter summary: ${this.getFilterSummary(newFilters)}`);
    console.groupEnd();

    // Generate and log current search query
    const searchQuery = this.generateDynamicSearchQuery(newFilters);
    this.logSearchQueryDetails(searchQuery);

    // Add to static logs
    this.log('info', 'filter-change', `Filter changed: ${changedField}`, {
      previous: previousFilters,
      current: newFilters,
      previousQuery,
      newQuery
    });
  }

  /**
   * Log detailed search query information
   */
  logSearchQueryDetails(searchQuery: DynamicSearchQuery): void {
    console.group('🔍 Dynamic Search Query Generated');
    console.log('Query:', searchQuery.generatedQuery);
    console.log('Keywords:', searchQuery.searchKeywords);
    console.log('Place Types:', searchQuery.placeTypes);
    console.log('Atmosphere:', searchQuery.atmosphereKeywords);
    console.groupEnd();

    this.log('info', 'search-query', 'Generated dynamic search query', searchQuery);
  }

  /**
   * Get search preview for current filters
   */
  getSearchPreview(filters: UnifiedFilters): string {
    return this.buildTextSearchQuery(filters);
  }

  // =================
  // STATIC LOGGING METHODS
  // =================

  /**
   * Static logging method (from FilterLogger class)
   */
  staticLog(level: 'info' | 'warn' | 'error', category: string, message: string, data?: any): void {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      category,
      message,
      data
    };
    
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
    
    // Console output
    const prefix = `[${level.toUpperCase()}][${category}]`;
    switch (level) {
      case 'info':
        console.log(prefix, message, data !== undefined ? data : '');
        break;
      case 'warn':
        console.warn(prefix, message, data !== undefined ? data : '');
        break;
      case 'error':
        console.error(prefix, message, data !== undefined ? data : '');
        break;
    }
  }

  info(category: string, message: string, data?: any): void {
    this.staticLog('info', category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.staticLog('warn', category, message, data);
  }

  error(category: string, message: string, data?: any): void {
    this.staticLog('error', category, message, data);
  }

  debug(category: string, message: string, data?: any): void {
    if (this.debugMode) {
      const logEntry: LogEntry = {
        timestamp: new Date(),
        level: 'debug',
        category,
        message,
        data
      };
      
      this.logs.push(logEntry);
      console.log(`[DEBUG][${category}]`, message, data !== undefined ? data : '');
    }
  }

  /**
   * Log filter change with summary comparison
   */
  logFilterChangeWithSummary(oldFilters: any, newFilters: any): void {
    const oldSummary = this.getFilterSummary(oldFilters);
    const newSummary = this.getFilterSummary(newFilters);
    
    if (oldSummary !== newSummary) {
      this.info('filter-change', `Filter changed: ${oldSummary} -> ${newSummary}`, {
        old: oldFilters,
        new: newFilters
      });
    }
  }

  // =================
  // PROGRESS TRACKING METHODS
  // =================

  /**
   * Start tracking progress for an operation
   */
  startProgress(operation: string, message: string, data?: any): string {
    const trackerId = `${operation}_${Date.now()}`;
    const tracker: ProgressTracker = {
      operation,
      startTime: new Date(),
      status: 'pending',
      progress: 0,
      message,
      data
    };

    this.progressTrackers.set(trackerId, tracker);
    this.log('info', 'progress', `Started: ${operation}`, { trackerId, message });
    
    return trackerId;
  }

  /**
   * Update progress for an operation
   */
  updateProgress(trackerId: string, progress: number, message: string, data?: any): void {
    const tracker = this.progressTrackers.get(trackerId);
    if (tracker) {
      tracker.progress = Math.max(0, Math.min(100, progress));
      tracker.message = message;
      tracker.status = progress >= 100 ? 'completed' : 'in-progress';
      if (data) tracker.data = data;

      this.log('info', 'progress', `Progress: ${tracker.operation} - ${progress}%`, { 
        trackerId, 
        progress, 
        message,
        data 
      });
    }
  }

  /**
   * Complete progress tracking
   */
  completeProgress(trackerId: string, message?: string, data?: any): void {
    const tracker = this.progressTrackers.get(trackerId);
    if (tracker) {
      tracker.endTime = new Date();
      tracker.status = 'completed';
      tracker.progress = 100;
      if (message) tracker.message = message;
      if (data) tracker.data = data;

      this.log('info', 'progress', `Completed: ${tracker.operation}`, { 
        trackerId, 
        duration: tracker.endTime.getTime() - tracker.startTime.getTime(),
        data 
      });
    }
  }

  /**
   * Fail progress tracking
   */
  failProgress(trackerId: string, error: string, data?: any): void {
    const tracker = this.progressTrackers.get(trackerId);
    if (tracker) {
      tracker.endTime = new Date();
      tracker.status = 'failed';
      tracker.message = error;
      if (data) tracker.data = data;

      this.error('progress', `Failed: ${tracker.operation}`, { 
        trackerId, 
        error,
        data 
      });
    }
  }

  /**
   * Get current progress for an operation
   */
  getProgress(trackerId: string): ProgressTracker | undefined {
    return this.progressTrackers.get(trackerId);
  }

  /**
   * Get all active progress trackers
   */
  getActiveProgress(): ProgressTracker[] {
    return Array.from(this.progressTrackers.values()).filter(
      tracker => tracker.status === 'pending' || tracker.status === 'in-progress'
    );
  }

  // =================
  // UTILITY METHODS
  // =================

  /**
   * Unified logging method
   */
  log(level: 'info' | 'warn' | 'error' | 'debug', category: string, message: string, data?: any): void {
    if (level === 'debug') {
      this.debug(category, message, data);
    } else {
      this.staticLog(level, category, message, data);
    }
  }

  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    this.log('info', 'logger', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: 'info' | 'warn' | 'error' | 'debug'): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    this.log('info', 'logger', 'All logs cleared');
  }

  /**
   * Get change history
   */
  getChangeLog(): FilterChangeLog[] {
    return [...this.changeLog];
  }

  /**
   * Get query history
   */
  getQueryHistory(): DynamicSearchQuery[] {
    return [...this.queryHistory];
  }

  /**
   * Get filter summary
   */
  getFilterSummary(filters: any): string {
    const summary = [];
    if (filters.category) summary.push(`Category: ${filters.category}`);
    if (filters.mood) summary.push(`Mood: ${filters.mood}`);
    if (filters.socialContext) summary.push(`Social: ${filters.socialContext}`);
    if (filters.budget) summary.push(`Budget: ${filters.budget}`);
    if (filters.timeOfDay) summary.push(`Time: ${filters.timeOfDay}`);
    if (filters.distanceRange) summary.push(`Distance: ${filters.distanceRange}`);
    
    return summary.length > 0 ? summary.join(', ') : 'No filters';
  }

  // =================
  // PRIVATE HELPER METHODS
  // =================

  private buildTextSearchQuery(filters: UnifiedFilters): string {
    const queryParts: string[] = [];
    
    if (filters.category) {
      queryParts.push(filters.category);
    }
    
    if (filters.mood) {
      const moodKeywords = this.getMoodKeywords(filters.mood);
      queryParts.push(...moodKeywords);
    }
    
    if (filters.socialContext) {
      const socialKeywords = this.getSocialContextKeywords(filters.socialContext);
      queryParts.push(...socialKeywords);
    }
    
    return queryParts.join(' ');
  }

  private extractSearchKeywords(filters: UnifiedFilters): string[] {
    const keywords: string[] = [];
    
    if (filters.category) keywords.push(filters.category);
    if (filters.mood) keywords.push(...this.getMoodKeywords(filters.mood));
    if (filters.socialContext) keywords.push(...this.getSocialContextKeywords(filters.socialContext));
    
    return keywords;
  }

  private getPlaceTypes(filters: UnifiedFilters): string[] {
    // Implementation would depend on your place type mapping logic
    const placeTypes: string[] = [];
    
    if (filters.category === 'food') {
      placeTypes.push('restaurant', 'cafe', 'bar', 'bakery');
    } else if (filters.category === 'activity') {
      placeTypes.push('park', 'museum', 'stadium', 'amusement_park');
    }
    
    return placeTypes;
  }

  private getAtmosphereKeywords(filters: UnifiedFilters): string[] {
    const keywords: string[] = [];
    
    if (filters.mood) {
      keywords.push(...this.getMoodKeywords(filters.mood));
    }
    
    if (filters.socialContext) {
      keywords.push(...this.getSocialContextKeywords(filters.socialContext));
    }
    
    return keywords;
  }

  private getMoodKeywords(mood: number): string[] {
    if (mood <= 30) return ['chill', 'relaxed', 'quiet'];
    if (mood <= 70) return ['neutral', 'balanced'];
    return ['hype', 'energetic', 'exciting'];
  }

  private getSocialContextKeywords(socialContext: string): string[] {
    switch (socialContext) {
      case 'solo': return ['solo', 'individual'];
      case 'with-bae': return ['romantic', 'intimate', 'couple'];
      case 'barkada': return ['group', 'social', 'friends'];
      default: return [];
    }
  }
}

// =================
// LEGACY SUPPORT & EXPORTS
// =================

// Legacy support for existing code
export const DynamicFilterLogger = ConsolidatedFilterLogger;
export const FilterLogger = ConsolidatedFilterLogger;

// Convenience functions for backward compatibility
export function logFilterChange(filters: any, changedFilter?: string): void {
  console.warn('⚠️ logFilterChange is deprecated. Use ConsolidatedFilterLogger.getInstance().logFilterChange() instead.');
  
  const logger = ConsolidatedFilterLogger.getInstance();
  const searchQuery = logger.generateDynamicSearchQuery(filters);
  logger.logSearchQueryDetails(searchQuery);
  logger.logFilterChangeWithSummary({}, filters);
}

// Export the main logger instance
export const logger = ConsolidatedFilterLogger.getInstance();