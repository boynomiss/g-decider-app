/**
 * Dynamic Filter Logger Hook
 * 
 * React hook for integrating dynamic filter logging into components.
 * Provides real-time search query preview and logging functionality.
 */

import { useCallback, useEffect, useRef } from 'react';
import { ConsolidatedFilterLogger, DynamicSearchQuery, FilterChangeLog } from '../utils/filtering/filter-logger';
import { UnifiedFilters } from '../types/app';

interface UseDynamicFilterLoggerReturn {
  /**
   * Log a filter change with previous and new filters
   */
  logFilterChange: (previousFilters: UnifiedFilters, newFilters: UnifiedFilters, changedField: string) => void;
  
  /**
   * Get current search preview for the filters
   */
  getSearchPreview: (filters: UnifiedFilters) => string;
  
  /**
   * Generate dynamic search query analysis
   */
  generateSearchQuery: (filters: UnifiedFilters) => DynamicSearchQuery;
  
  /**
   * Get filter change history
   */
  getChangeHistory: () => FilterChangeLog[];
  
  /**
   * Get search query history
   */
  getQueryHistory: () => DynamicSearchQuery[];
  
  /**
   * Enable/disable debug logging
   */
  enableDebugLogging: (enabled: boolean) => void;
  
  /**
   * Start progress tracking
   */
  startProgress: (operation: string, message: string, data?: any) => string;
  
  /**
   * Update progress
   */
  updateProgress: (trackerId: string, progress: number, message: string, data?: any) => void;
  
  /**
   * Complete progress
   */
  completeProgress: (trackerId: string, message?: string, data?: any) => void;
  
  /**
   * Get active progress trackers
   */
  getActiveProgress: () => any[];
}

export function useDynamicFilterLogger(): UseDynamicFilterLoggerReturn {
  const loggerRef = useRef<ConsolidatedFilterLogger | null>(null);
  const debugEnabled = useRef(false);

  // Initialize logger
  useEffect(() => {
    loggerRef.current = ConsolidatedFilterLogger.getInstance();
  }, []);

  const logFilterChange = useCallback((
    previousFilters: UnifiedFilters, 
    newFilters: UnifiedFilters, 
    changedField: string
  ) => {
    if (!loggerRef.current) return;

    loggerRef.current.logFilterChange(previousFilters, newFilters, changedField);
    
    if (debugEnabled.current) {
      console.group('🔧 Debug: Filter Change Details');
      console.log('Previous filters:', previousFilters);
      console.log('New filters:', newFilters);
      console.log('Changed field:', changedField);
      console.groupEnd();
    }
  }, []);

  const getSearchPreview = useCallback((filters: UnifiedFilters): string => {
    if (!loggerRef.current) return '';
    return loggerRef.current.getSearchPreview(filters);
  }, []);

  const generateSearchQuery = useCallback((filters: UnifiedFilters): DynamicSearchQuery => {
    if (!loggerRef.current) {
      throw new Error('ConsolidatedFilterLogger not initialized');
    }
    return loggerRef.current.generateDynamicSearchQuery(filters);
  }, []);

  const getChangeHistory = useCallback((): FilterChangeLog[] => {
    if (!loggerRef.current) return [];
    return loggerRef.current.getChangeLog();
  }, []);

  const getQueryHistory = useCallback((): DynamicSearchQuery[] => {
    if (!loggerRef.current) return [];
    return loggerRef.current.getQueryHistory();
  }, []);

  const enableDebugLogging = useCallback((enabled: boolean) => {
    debugEnabled.current = enabled;
    if (loggerRef.current) {
      loggerRef.current.setDebugMode(enabled);
    }
    console.log(`🔧 Dynamic filter logging debug mode: ${enabled ? 'enabled' : 'disabled'}`);
  }, []);

  const startProgress = useCallback((operation: string, message: string, data?: any): string => {
    if (!loggerRef.current) return '';
    return loggerRef.current.startProgress(operation, message, data);
  }, []);

  const updateProgress = useCallback((trackerId: string, progress: number, message: string, data?: any): void => {
    if (!loggerRef.current) return;
    loggerRef.current.updateProgress(trackerId, progress, message, data);
  }, []);

  const completeProgress = useCallback((trackerId: string, message?: string, data?: any): void => {
    if (!loggerRef.current) return;
    loggerRef.current.completeProgress(trackerId, message, data);
  }, []);

  const getActiveProgress = useCallback((): any[] => {
    if (!loggerRef.current) return [];
    return loggerRef.current.getActiveProgress();
  }, []);

  return {
    logFilterChange,
    getSearchPreview,
    generateSearchQuery,
    getChangeHistory,
    getQueryHistory,
    enableDebugLogging,
    startProgress,
    updateProgress,
    completeProgress,
    getActiveProgress
  };
}

// =================
// CONVENIENCE HOOKS
// =================

/**
 * Hook for debugging filter changes
 */
export function useFilterChangeTracker(filters: UnifiedFilters) {
  const { logFilterChange } = useDynamicFilterLogger();
  const previousFiltersRef = useRef<UnifiedFilters>(filters);

  useEffect(() => {
    const previousFilters = previousFiltersRef.current;
    
    // Find what changed
    let changedField = '';
    if (previousFilters.category !== filters.category) changedField = 'category';
    else if (previousFilters.mood !== filters.mood) changedField = 'mood';
    else if (previousFilters.socialContext !== filters.socialContext) changedField = 'socialContext';
    else if (previousFilters.budget !== filters.budget) changedField = 'budget';
    else if (previousFilters.timeOfDay !== filters.timeOfDay) changedField = 'timeOfDay';
    else if (previousFilters.distanceRange !== filters.distanceRange) changedField = 'distanceRange';

    if (changedField) {
      logFilterChange(previousFilters, filters, changedField);
    }

    previousFiltersRef.current = filters;
  }, [filters, logFilterChange]);
}

/**
 * Hook for search preview functionality
 */
export function useSearchPreview(filters: UnifiedFilters) {
  const { getSearchPreview, generateSearchQuery } = useDynamicFilterLogger();
  
  const searchPreview = getSearchPreview(filters);
  const searchQuery = generateSearchQuery(filters);
  
  return {
    searchPreview,
    searchKeywords: searchQuery.searchKeywords,
    placeTypes: searchQuery.placeTypes,
    atmosphereKeywords: searchQuery.atmosphereKeywords
  };
}