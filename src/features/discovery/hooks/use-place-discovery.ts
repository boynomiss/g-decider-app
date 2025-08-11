import { useState, useCallback, useRef, useEffect } from 'react';
import { unifiedFilterService } from '../../filtering/services/filtering/unified-filter-service';
import { 
  DiscoveryFilters, 
  DiscoveryResult, 
  LoadingState, 
  AdvertisedPlace 
} from '../../shared/types/types/filtering';
import { createPlaceMoodService } from '../../filtering/services/filtering/mood';
import { useAppStore } from '../../../store/store';

interface UsePlaceDiscoveryOptions {
  googlePlacesApiKey: string;
  googleCloudCredentials?: any;
  advertisedPlaces?: AdvertisedPlace[];
}

interface UsePlaceDiscoveryReturn {
  // State
  isLoading: boolean;
  loadingState: LoadingState;
  discoveredPlaces: DiscoveryResult['places'];
  expansionInfo?: DiscoveryResult['expansionInfo'];
  poolInfo?: DiscoveryResult['poolInfo'];
  error: string | null;
  
  // Actions
  discoverPlaces: () => Promise<void>;
  getMorePlaces: () => Promise<void>;
  resetDiscovery: () => void;
  restartDiscovery: () => void;
  
  // Loading state helpers
  isSearching: boolean;
  isExpandingDistance: boolean;
  hasReachedLimit: boolean;
  isComplete: boolean;
  
  // Additional properties for compatibility
  currentRadius: number;
  expansionCount: number;
}

export const usePlaceDiscovery = (options: UsePlaceDiscoveryOptions): UsePlaceDiscoveryReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('initial');
  const [discoveredPlaces, setDiscoveredPlaces] = useState<DiscoveryResult['places']>([]);
  const [expansionInfo, setExpansionInfo] = useState<DiscoveryResult['expansionInfo']>();
  const [poolInfo, setPoolInfo] = useState<DiscoveryResult['poolInfo']>();
  const [error, setError] = useState<string | null>(null);

  // Get filters and location from app store
  const { filters, userLocation } = useAppStore();

  // Create service instances (memoized)
  const servicesRef = useRef<{
    moodService: any | null;
  }>({ moodService: null });

  // Initialize services
  useEffect(() => {
    if (!servicesRef.current.moodService && options.googlePlacesApiKey) {
      servicesRef.current.moodService = createPlaceMoodService(
        options.googlePlacesApiKey,
        options.googleCloudCredentials?.naturalLanguageApiKey
      );
    }

    // unifiedFilterService is already available globally
  }, [options]);

  // Build discovery filters from app store filters
  const buildDiscoveryFilters = useCallback((): DiscoveryFilters | null => {
    // Validate required filters
    if (!filters.category || !userLocation) {
      setError('Please select a category and enable location');
      return null;
    }

    if (filters.mood === undefined || filters.distanceRange === undefined) {
      setError('Please set mood and distance preferences');
      return null;
    }

    return {
      category: filters.category as 'food' | 'activity' | 'something-new',
      mood: filters.mood,
      socialContext: filters.socialContext,
      budget: filters.budget,
      timeOfDay: filters.timeOfDay,
      distanceRange: filters.distanceRange || 0,
      userLocation: userLocation
    };
  }, [filters, userLocation]);

  // Main discovery function
  const discoverPlaces = useCallback(async () => {
    const discoveryFilters = buildDiscoveryFilters();
    if (!discoveryFilters || !servicesRef.current.discoveryLogic) {
      return;
    }

    setIsLoading(true);
    setLoadingState('searching');
    setError(null);

    try {
      console.log('🎯 Starting place discovery');
      
      // Reset previous results and discover places using unifiedFilterService
      unifiedFilterService.reset();
      const result = await unifiedFilterService.discoverPlaces(discoveryFilters);
      
      // Update state with results
      setDiscoveredPlaces(result.places);
      setLoadingState(result.loadingState);
      setExpansionInfo(result.expansionInfo);
      setPoolInfo(result.poolInfo);
      
      // Log statistics
      if (result.expansionInfo) {
        console.log(`📊 Discovery complete:
          - Places found: ${result.places.length}
          - Expansions: ${result.expansionInfo.expansionCount}
          - Final radius: ${result.expansionInfo.finalRadius}m
          - Total places in area: ${result.expansionInfo.totalPlacesFound}`
        );
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to discover places';
      console.error('❌ Discovery error:', errorMessage);
      setError(errorMessage);
      setLoadingState('error');
    } finally {
      setIsLoading(false);
    }
  }, [buildDiscoveryFilters]);

  // Get more places from existing pool or expand
  const getMorePlaces = useCallback(async () => {
    const discoveryFilters = buildDiscoveryFilters();
    if (!discoveryFilters) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Getting more places');
      
      // Check if pool needs refresh
      if (poolInfo?.needsRefresh) {
        setLoadingState('searching');
      }
      
      // Get next batch using unifiedFilterService
      const result = await unifiedFilterService.getNextBatch(discoveryFilters);
      
      // Update state with results
      setDiscoveredPlaces(result.places);
      setLoadingState(result.loadingState);
      setPoolInfo(result.poolInfo);
      
      // Update expansion info if expanded
      if (result.expansionInfo) {
        setExpansionInfo(result.expansionInfo);
      }
      
      console.log(`📊 Next batch complete:
        - New places: ${result.places.length}
        - Remaining in pool: ${result.poolInfo.remainingPlaces}`
      );
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get more places';
      console.error('❌ Error getting more places:', errorMessage);
      setError(errorMessage);
      setLoadingState('error');
    } finally {
      setIsLoading(false);
    }
  }, [buildDiscoveryFilters, poolInfo]);

  // Reset discovery session
  const resetDiscovery = useCallback(() => {
    setDiscoveredPlaces([]);
    setLoadingState('initial');
    setExpansionInfo(undefined);
    setPoolInfo(undefined);
    setError(null);
    
    console.log('🔄 Discovery session reset');
  }, []);

  // Restart discovery (alias for resetDiscovery)
  const restartDiscovery = useCallback(() => {
    resetDiscovery();
  }, [resetDiscovery]);

  // Loading state helpers
  const isSearching = loadingState === 'searching';
  const isExpandingDistance = loadingState === 'expanding-distance';
  const hasReachedLimit = loadingState === 'limit-reach';
  const isComplete = loadingState === 'complete';

  // Check if limit has been reached
  // const isLimitReached = useCallback((): boolean => {
  //   return loadingState === 'limit-reach';
  // }, [loadingState]);

  // Additional properties for compatibility
  const currentRadius = expansionInfo?.finalRadius || 0;
  const expansionCount = expansionInfo?.expansionCount || 0;

  return {
    // State
    isLoading,
    loadingState,
    discoveredPlaces,
    expansionInfo,
    poolInfo: poolInfo || {
      remainingPlaces: 0,
      totalPoolSize: 0,
      needsRefresh: false
    },
    error,
    
    // Actions
    discoverPlaces,
    getMorePlaces,
    resetDiscovery,
    restartDiscovery,
    
    // Loading state helpers
    isSearching,
    isExpandingDistance,
    hasReachedLimit,
    isComplete,
    
    // Additional properties for compatibility
    currentRadius,
    expansionCount,
  };
};

// Hook for managing loading screens
export const useDiscoveryLoadingScreen = (loadingState: LoadingState, expansionInfo?: DiscoveryResult['expansionInfo']) => {
  const [message, setMessage] = useState('');
  const [subMessage, setSubMessage] = useState('');
  const [showLimitReached, setShowLimitReached] = useState(false);

  useEffect(() => {
    switch (loadingState) {
      case 'initial':
        setMessage('Ready to discover amazing places!');
        setSubMessage('Press G! to start');
        setShowLimitReached(false);
        break;
        
      case 'searching':
        setMessage('Searching for perfect places...');
        setSubMessage('Finding the best matches for you');
        setShowLimitReached(false);
        break;
        
      case 'expanding-distance':
        setMessage('Expanding search area...');
        setSubMessage(`Looking ${expansionInfo?.finalRadius ? `within ${expansionInfo.finalRadius}m` : 'further'} for more options`);
        setShowLimitReached(false);
        break;
        
      case 'limit-reach':
        setMessage('Found great places!');
        setSubMessage('Expanded search to maximum distance');
        setShowLimitReached(true);
        break;
        
      case 'complete':
        setMessage('Discovery complete!');
        setSubMessage('Swipe through your personalized recommendations');
        setShowLimitReached(expansionInfo && expansionInfo.expansionCount >= 2 ? true : false);
        break;
        
      case 'error':
        setMessage('Oops! Something went wrong');
        setSubMessage('Please try again');
        setShowLimitReached(false);
        break;
    }
  }, [loadingState, expansionInfo]);

  return {
    message,
    subMessage,
    showLimitReached,
    isLoading: ['searching', 'expanding-distance'].includes(loadingState)
  };
};