import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertCircle, X, RefreshCw as Refresh } from 'lucide-react-native';

export interface FilterRelaxationInfo {
  isRelaxed: boolean;
  relaxedFilters: string[];
  originalFilters: string[];
  message: string;
  severity: 'info' | 'warning' | 'success';
}

interface FilterFeedbackBannerProps {
  relaxationInfo?: FilterRelaxationInfo;
  onDismiss?: () => void;
  onRetryStrict?: () => void;
  visible?: boolean;
}

export default function FilterFeedbackBanner({
  relaxationInfo,
  onDismiss,
  onRetryStrict,
  visible = false
}: FilterFeedbackBannerProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-100));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (visible && relaxationInfo?.isRelaxed) {
      setIsVisible(true);
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible, relaxationInfo?.isRelaxed]);

  if (!isVisible || !relaxationInfo?.isRelaxed) {
    return null;
  }

  const getSeverityColors = (): [string, string] => {
    switch (relaxationInfo.severity) {
      case 'warning':
        return ['#FFA726', '#FF9800'];
      case 'success':
        return ['#66BB6A', '#4CAF50'];
      default:
        return ['#42A5F5', '#2196F3'];
    }
  };

  const getSeverityIcon = () => {
    switch (relaxationInfo.severity) {
      case 'warning':
        return <AlertCircle size={20} color="#FFFFFF" />;
      case 'success':
        return <Refresh size={20} color="#FFFFFF" />;
      default:
        return <AlertCircle size={20} color="#FFFFFF" />;
    }
  };

  const getRelaxedFiltersText = () => {
    if (relaxationInfo.relaxedFilters.length === 0) return '';
    
    const filterNames: Record<string, string> = {
      mood: 'Mood',
      budget: 'Budget',
      socialContext: 'Social Context',
      timeOfDay: 'Time of Day',
      distanceRange: 'Distance'
    };

    const relaxedNames = relaxationInfo.relaxedFilters
      .map(filter => filterNames[filter] || filter)
      .join(', ');

    return `Relaxed: ${relaxedNames}`;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={getSeverityColors()}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            {getSeverityIcon()}
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.message} numberOfLines={2}>
              {relaxationInfo.message}
            </Text>
            {relaxationInfo.relaxedFilters.length > 0 && (
              <Text style={styles.relaxedFilters} numberOfLines={1}>
                {getRelaxedFiltersText()}
              </Text>
            )}
          </View>

          <View style={styles.actionsContainer}>
            {onRetryStrict && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={onRetryStrict}
                activeOpacity={0.7}
              >
                <Refresh size={16} color="#FFFFFF" />
                <Text style={styles.actionText}>Retry</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <X size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 10,
  },
  gradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  relaxedFilters: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
  },
});

// Helper function to create filter relaxation info
export function createFilterRelaxationInfo(
  relaxedFilters: string[],
  originalFilters: string[],
  customMessage?: string
): FilterRelaxationInfo {
  const getDefaultMessage = () => {
    if (relaxedFilters.includes('budget')) {
      return "We couldn't find places that matched your budget, but here are some popular spots in the area.";
    }
    if (relaxedFilters.includes('mood')) {
      return "We expanded your mood preferences to show more great places nearby.";
    }
    if (relaxedFilters.includes('socialContext')) {
      return "We found places that work well for different group sizes.";
    }
    if (relaxedFilters.includes('timeOfDay')) {
      return "We included places with different operating hours.";
    }
    if (relaxedFilters.length > 1) {
      return "We relaxed some filters to find more great places for you.";
    }
    return "We found places that closely match your preferences.";
  };

  const getSeverity = (): 'info' | 'warning' | 'success' => {
    if (relaxedFilters.includes('budget')) return 'warning';
    if (relaxedFilters.length > 2) return 'warning';
    return 'info';
  };

  return {
    isRelaxed: relaxedFilters.length > 0,
    relaxedFilters,
    originalFilters,
    message: customMessage || getDefaultMessage(),
    severity: getSeverity(),
  };
}