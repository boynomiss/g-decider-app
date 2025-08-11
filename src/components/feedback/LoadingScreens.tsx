import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { LoadingState } from '../../features/filtering/types';

interface LoadingScreensProps {
  loadingState: LoadingState;
  currentRadius?: number;
  expansionCount?: number;
  onRestart?: () => void;
}

export default function LoadingScreens({
  loadingState,
  currentRadius = 0,
  expansionCount = 0,
  onRestart
}: LoadingScreensProps) {
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim1 = useRef(new Animated.Value(0)).current;
  const rippleAnim2 = useRef(new Animated.Value(0)).current;
  const rippleAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loadingState === 'initial' || loadingState === 'searching') {
      // Pulsing animation for initial loading
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }

    if (loadingState === 'expanding-distance') {
      // Ripple animation for expanding distance
      const rippleAnimation = () => {
        const createRipple = (animValue: Animated.Value, delay: number) => {
          return Animated.loop(
            Animated.sequence([
              Animated.delay(delay),
              Animated.timing(animValue, {
                toValue: 1,
                duration: 2000,
            useNativeDriver: true,
              }),
              Animated.timing(animValue, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
              }),
            ])
          );
        };

        Animated.parallel([
          createRipple(rippleAnim1, 0),
          createRipple(rippleAnim2, 400),
          createRipple(rippleAnim3, 800),
        ]).start();
      };

      rippleAnimation();
    }
    
    return undefined;
  }, [loadingState]);
  
  const renderInitialLoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <Animated.View style={[styles.spinnerContainer, { transform: [{ scale: pulseAnim }] }]}>
          <ActivityIndicator size="large" color="#7DD3C0" style={styles.spinner} />
        </Animated.View>
        
        <Text style={styles.loadingTitle}>Finding Amazing Places</Text>
        <Text style={styles.loadingSubtitle}>
          Fetching pool of results based on your preferences...
        </Text>
        
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.dot, styles.dotActive, { opacity: pulseAnim }]} />
        </View>
        
        <View style={styles.loadingSteps}>
          <Text style={styles.stepText}>🔍 Searching Google Places API...</Text>
          <Text style={styles.stepText}>🎭 Applying mood preferences...</Text>
          <Text style={styles.stepText}>💰 Filtering by budget...</Text>
          <Text style={styles.stepText}>👥 Matching social context...</Text>
        </View>
      </View>
    </View>
  );

  const renderExpandingDistanceScreen = () => {
    const previousRadius = currentRadius - 500;
    
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.expandingIcon}>
            <Animated.View 
              style={[
                styles.ripple, 
                styles.ripple1,
                {
                  opacity: rippleAnim1,
                  transform: [{ scale: rippleAnim1 }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.ripple, 
                styles.ripple2,
                {
                  opacity: rippleAnim2,
                  transform: [{ scale: rippleAnim2 }]
                }
              ]} 
            />
            <Animated.View 
              style={[
                styles.ripple, 
                styles.ripple3,
                {
                  opacity: rippleAnim3,
                  transform: [{ scale: rippleAnim3 }]
                }
              ]} 
            />
            <View style={styles.centerDot} />
          </View>
          
          <Text style={styles.loadingTitle}>Expanding Search Area</Text>
          <Text style={styles.loadingSubtitle}>
            Not enough results found within {Math.round(previousRadius)}m radius
          </Text>
          
          <View style={styles.expansionDetails}>
            <Text style={styles.expandingDetails}>
              📍 Expanding to {Math.round(currentRadius)}m radius...
            </Text>
            <Text style={styles.expandingProgress}>
              Expansion {expansionCount} of 3
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(expansionCount / 3) * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round((expansionCount / 3) * 100)}%</Text>
          </View>

          <View style={styles.expansionInfo}>
            <Text style={styles.infoText}>🔄 Searching wider area for more options</Text>
            <Text style={styles.infoText}>⏱️ This may take a moment...</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderLimitReachScreen = () => (
    <View style={styles.loadingContainer}>
      <View style={styles.limitReachContent}>
        <View style={styles.limitIcon}>
          <Text style={styles.limitEmoji}>🚫</Text>
        </View>
        
        <Text style={styles.limitTitle}>Limit Reached</Text>
        <Text style={styles.limitSubtitle}>
          We've ran out of places to suggest in your area
        </Text>
        
        <View style={styles.limitDetails}>
          <Text style={styles.limitDetailText}>
            📏 Searched up to {Math.round(currentRadius)}m radius
          </Text>
          <Text style={styles.limitDetailText}>
            🔍 Expanded search {expansionCount} times
          </Text>
          <Text style={styles.limitDetailText}>
            🎯 No more places match your preferences
          </Text>
        </View>
        
        <Text style={styles.restartMessage}>
          Please restart and tailor your preferences to find more places
        </Text>
        
        <TouchableOpacity 
          style={styles.restartButton} 
          onPress={onRestart}
          activeOpacity={0.8}
        >
          <Text style={styles.restartButtonText}>🔄 Restart Filters</Text>
        </TouchableOpacity>
        
        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>💡 Try adjusting:</Text>
          <Text style={styles.suggestionItem}>• Distance range (expand further)</Text>
          <Text style={styles.suggestionItem}>• Budget preferences (more flexible)</Text>
          <Text style={styles.suggestionItem}>• Mood preferences (broader range)</Text>
          <Text style={styles.suggestionItem}>• Category selection (try different types)</Text>
          <Text style={styles.suggestionItem}>• Social context (be more flexible)</Text>
          <Text style={styles.suggestionItem}>• Time of day (try different hours)</Text>
        </View>

        <View style={styles.alternativeActions}>
          <Text style={styles.alternativeTitle}>Or try these alternatives:</Text>
          <TouchableOpacity style={styles.alternativeButton}>
            <Text style={styles.alternativeButtonText}>🗺️ Browse All Nearby Places</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alternativeButton}>
            <Text style={styles.alternativeButtonText}>🎲 Surprise Me (Random)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render appropriate screen based on loading state
  switch (loadingState) {
    case 'initial':
    case 'searching':
      return renderInitialLoadingScreen();
    
    case 'expanding-distance':
      return renderExpandingDistanceScreen();
    
    case 'limit-reach':
      return renderLimitReachScreen();
    
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
  },
  spinnerContainer: {
    marginBottom: 32,
  },
  spinner: {
    marginBottom: 0,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  dotActive: {
    backgroundColor: '#7DD3C0',
  },
  loadingSteps: {
    alignItems: 'flex-start',
    width: '100%',
  },
  stepText: {
    fontSize: 14,
    color: '#7DD3C0',
    marginBottom: 8,
    fontWeight: '500',
  },
  
  // Expanding Distance Styles
  expandingIcon: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ripple: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: '#7DD3C0',
    borderRadius: 60,
  },
  ripple1: {
    width: 40,
    height: 40,
  },
  ripple2: {
    width: 70,
    height: 70,
  },
  ripple3: {
    width: 100,
    height: 100,
  },
  centerDot: {
    width: 16,
    height: 16,
    backgroundColor: '#7DD3C0',
    borderRadius: 8,
    zIndex: 10,
  },
  expansionDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  expandingDetails: {
    fontSize: 18,
    color: '#7DD3C0',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  expandingProgress: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7DD3C0',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#7DD3C0',
    fontWeight: 'bold',
  },
  expansionInfo: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  // Limit Reach Styles
  limitReachContent: {
    alignItems: 'center',
    maxWidth: 350,
    width: '100%',
  },
  limitIcon: {
    marginBottom: 24,
  },
  limitEmoji: {
    fontSize: 72,
  },
  limitTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  limitSubtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 24,
  },
  limitDetails: {
    backgroundColor: '#FFF3E0',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  limitDetailText: {
    fontSize: 15,
    color: '#F57C00',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  restartMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    fontWeight: '500',
  },
  restartButton: {
    backgroundColor: '#7DD3C0',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  restartButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  suggestionBox: {
    backgroundColor: '#E8F5E8',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionItem: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 6,
    paddingLeft: 8,
    lineHeight: 20,
  },
  alternativeActions: {
    width: '100%',
    alignItems: 'center',
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  alternativeButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#7DD3C0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
    width: '100%',
  },
  alternativeButtonText: {
    color: '#7DD3C0',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});