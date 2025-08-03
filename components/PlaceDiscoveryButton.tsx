import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, AlertCircle } from 'lucide-react-native';
import { usePlaceDiscovery, useDiscoveryLoadingScreen } from '@/hooks/use-place-discovery';
import { useAppStore } from '@/hooks/use-app-store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PlaceDiscoveryButtonProps {
  googlePlacesApiKey: string;
  googleCloudCredentials?: any;
  onDiscoveryComplete?: (places: any[]) => void;
}

export default function PlaceDiscoveryButton({
  googlePlacesApiKey,
  googleCloudCredentials,
  onDiscoveryComplete
}: PlaceDiscoveryButtonProps) {
  const { filters } = useAppStore();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const {
    isLoading,
    loadingState,
    discoveredPlaces,
    expansionInfo,
    poolInfo,
    error,
    discoverPlaces,
    getMorePlaces,
    resetDiscovery,
    isSearching,
    isExpandingDistance,
    hasReachedLimit,
    isComplete
  } = usePlaceDiscovery({
    googlePlacesApiKey,
    googleCloudCredentials
  });

  const {
    message,
    subMessage,
    showLimitReached
  } = useDiscoveryLoadingScreen(loadingState, expansionInfo);

  // Handle button press animation
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  // Handle discovery
  const handleDiscover = async () => {
    await discoverPlaces();
    if (onDiscoveryComplete && discoveredPlaces.length > 0) {
      onDiscoveryComplete(discoveredPlaces);
    }
  };

  // Handle get more
  const handleGetMore = async () => {
    await getMorePlaces();
    if (onDiscoveryComplete && discoveredPlaces.length > 0) {
      onDiscoveryComplete(discoveredPlaces);
    }
  };

  // Check if ready to discover
  const isReady = filters.category && filters.userLocation && 
                  filters.mood !== undefined && filters.distanceRange !== undefined;

  return (
    <View style={styles.container}>
      {/* Main G! Button */}
      <Animated.View style={[styles.buttonWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          onPress={isComplete ? handleGetMore : handleDiscover}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={isLoading || !isReady}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isLoading ? ['#CCCCCC', '#AAAAAA'] : ['#7DD3C0', '#5EEAD4']}
            style={[styles.button, !isReady && styles.buttonDisabled]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>G!</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Status Message */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusMessage}>{message}</Text>
        <Text style={styles.statusSubMessage}>{subMessage}</Text>
      </View>

      {/* Loading Indicators */}
      {isSearching && (
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="small" color="#7DD3C0" />
          <Text style={styles.loadingText}>Searching nearby places...</Text>
        </View>
      )}

      {isExpandingDistance && (
        <View style={styles.loadingIndicator}>
          <MapPin size={20} color="#7DD3C0" />
          <Text style={styles.loadingText}>Expanding search area...</Text>
        </View>
      )}

      {/* Limit Reached Warning */}
      {showLimitReached && (
        <View style={styles.limitWarning}>
          <AlertCircle size={16} color="#F59E0B" />
          <Text style={styles.limitText}>
            Search expanded to maximum distance ({expansionInfo?.finalRadius}m)
          </Text>
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={resetDiscovery} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pool Info (Debug/Development) */}
      {__DEV__ && poolInfo && (
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>
            Pool: {poolInfo.remainingPlaces}/{poolInfo.totalPoolSize} places
          </Text>
          {poolInfo.needsRefresh && (
            <Text style={styles.debugWarning}>Pool needs refresh</Text>
          )}
        </View>
      )}

      {/* Discovery Stats */}
      {isComplete && discoveredPlaces.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{discoveredPlaces.length}</Text>
            <Text style={styles.statLabel}>Places Found</Text>
          </View>
          {expansionInfo && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{expansionInfo.expansionCount}</Text>
                <Text style={styles.statLabel}>Expansions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{expansionInfo.finalRadius}m</Text>
                <Text style={styles.statLabel}>Search Radius</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Get More Button */}
      {isComplete && poolInfo && poolInfo.remainingPlaces > 0 && (
        <TouchableOpacity
          style={styles.getMoreButton}
          onPress={handleGetMore}
          disabled={isLoading}
        >
          <Text style={styles.getMoreText}>
            Get More Recommendations ({poolInfo.remainingPlaces} available)
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  buttonWrapper: {
    marginBottom: 20,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusSubMessage: {
    fontSize: 14,
    color: '#666',
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  limitWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  limitText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#92400E',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#DC2626',
    borderRadius: 4,
  },
  retryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  debugInfo: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  debugText: {
    fontSize: 10,
    color: '#6B7280',
  },
  debugWarning: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    width: SCREEN_WIDTH - 40,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7DD3C0',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  getMoreButton: {
    backgroundColor: '#7DD3C0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  getMoreText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});