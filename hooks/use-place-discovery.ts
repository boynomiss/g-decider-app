import { useState, useCallback, useRef, useEffect } from 'react';
import { PlaceDiscoveryLogic, DiscoveryFilters, DiscoveryResult, LoadingState, AdvertisedPlace } from '@/utils/filtering/unified-filter-service';
import { moodAnalysis } from '@/utils/filtering';
import { useAppStore } from '@/hooks/use-app-store';

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
  
  // Loading state helpers
  isSearching: boolean;
  isExpandingDistance: boolean;
  hasReachedLimit: boolean;
  isComplete: boolean;
}

export const usePlaceDiscovery = (options: UsePlaceDiscoveryOptions): UsePlaceDiscoveryReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('initial');
  const [discoveredPlaces, setDiscoveredPlaces] = useState<DiscoveryResult['places']>([]);
  const [expansionInfo, setExpansionInfo] = useState<DiscoveryResult['expansionInfo']>();
  const [poolInfo, setPoolInfo] = useState<DiscoveryResult['poolInfo']>();
  const [error, setError] = useState<string | null>(null);

  // Get filters from app store
  const { filters } = useAppStore();

  // Create service instances (memoized)
  const servicesRef = useRef<{
    moodService: PlaceMoodService | null;
    discoveryLogic: PlaceDiscoveryLogic | null;
  }>({ moodService: null, discoveryLogic: null });

  // Initialize services
  useEffect(() => {
    if (!servicesRef.current.moodService) {
      servicesRef.current.moodService = new PlaceMoodService(
        options.googlePlacesApiKey,
        options.googleCloudCredentials
      );
    }

    if (!servicesRef.current.discoveryLogic && servicesRef.current.moodService) {
      servicesRef.current.discoveryLogic = new PlaceDiscoveryLogic(
        servicesRef.current.moodService,
        options.googlePlacesApiKey,
        options.advertisedPlaces || []
      );
    }
  }, [options]);

  // Build discovery filters from app store filters
  const buildDiscoveryFilters = useCallback((): DiscoveryFilters | null => {
    // Validate required filters
    if (!filters.category || !filters.userLocation) {
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
      distanceRange: filters.distanceRange,
      userLocation: filters.userLocation
    };
  }, [filters]);

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
      
      // Reset previous results
      servicesRef.current.discoveryLogic.reset();
      
      // Discover places
      const result = await servicesRef.current.discoveryLogic.discoverPlaces(discoveryFilters);
      
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
    if (!discoveryFilters || !servicesRef.current.discoveryLogic) {
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
      
      // Get next batch
      const result = await servicesRef.current.discoveryLogic.getNextBatch(discoveryFilters);
      
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
    if (servicesRef.current.discoveryLogic) {
      servicesRef.current.discoveryLogic.reset();
    }
    
    setDiscoveredPlaces([]);
    setLoadingState('initial');
    setExpansionInfo(undefined);
    setPoolInfo(undefined);
    setError(null);
    
    console.log('🔄 Discovery session reset');
  }, []);

  // Loading state helpers
  const isSearching = loadingState === 'searching';
  const isExpandingDistance = loadingState === 'expanding-distance';
  const hasReachedLimit = loadingState === 'limit-reach';
  const isComplete = loadingState === 'complete';

  // Get specific loading message for each state
  const getLoadingMessage = useCallback((): string => {
    switch (loadingState) {
      case 'initial':
        return 'Getting ready to find amazing places...';
      case 'searching':
        return 'Fetching pool of results based on your preferences...';
      case 'expanding-distance':
        return `Expanding search area to ${Math.round(expansionInfo?.finalRadius || 0)}m radius...`;
      case 'limit-reach':
        return 'We\'ve ran out of places to suggest in your area';
      case 'complete':
        return 'Search complete!';
      default:
        return 'Loading...';
    }
  }, [loadingState, expansionInfo]);

  // Check if limit has been reached
  const isLimitReached = useCallback((): boolean => {
    return loadingState === 'limit-reach';
  }, [loadingState]);

  // Restart the entire discovery process
  const restartDiscovery = useCallback(() => {
    resetDiscovery();
    console.log('🔄 Discovery restarted - all filters and state cleared');
  }, [resetDiscovery]);

  return {
    // State
    isLoading,
    loadingState,
    discoveredPlaces,
    expansionInfo,
    poolInfo,
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
    
    // Loading screen specific
    getLoadingMessage,
    isLimitReached,
    
    // Expansion info
    expansionCount: expansionInfo?.expansionCount || 0,
    maxExpansions: 3,
    canExpand: (expansionInfo?.expansionCount || 0) < 3,
    currentRadius: expansionInfo?.finalRadius || 0,
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
        setShowLimitReached(expansionInfo && expansionInfo.expansionCount >= 2);
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