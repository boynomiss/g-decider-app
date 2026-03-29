import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExternalLink, Star } from 'lucide-react-native';
import { useAdMonetization } from '../hooks/use-ad-monetization';

interface TargetedAdBannerProps {
  placement: 'main_page_top' | 'result_page_bottom' | 'main_page_exit';
  context?: {
    userMood?: string;
    cuisine?: string;
    budget?: string;
    location?: string;
    occasion?: string;
  };
  onAdClick?: (adData: any) => void;
}

interface AdData {
  adUnit: any;
  network: any;
  targeting: any;
  estimatedRevenue: number;
}

export const TargetedAdBanner: React.FC<TargetedAdBannerProps> = ({
  placement,
  context,
  onAdClick
}) => {
  const [adData, setAdData] = useState<AdData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    getTargetedAd,
    trackAdImpression
  } = useAdMonetization();

  useEffect(() => {
    loadTargetedAd();
  }, [placement, context]);

  const loadTargetedAd = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const targetedAd = getTargetedAd(context || {});
      
      if (targetedAd) {
        setAdData(targetedAd);
        
        // Track ad impression
        trackAdImpression(
          targetedAd.adUnit.id,
          targetedAd.network.id,
          targetedAd.estimatedRevenue
        );
        
        console.log(`📊 Targeted ad loaded for ${placement}:`, {
          network: targetedAd.network.name,
          revenue: targetedAd.estimatedRevenue,
          targeting: targetedAd.targeting
        });
      } else {
        setError('No targeted ads available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load ad';
      setError(errorMessage);
      console.error('❌ Ad loading failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdClick = () => {
    if (adData) {
      // Track ad click
      console.log(`🎯 Ad clicked: ${adData.adUnit.name}`);
      
      // Simulate opening ad URL
      // const adUrl = `https://example.com/ad/${adData.adUnit.id}`;
      // Linking.openURL(adUrl); // Removed Linking as per edit hint
      
      onAdClick?.(adData);
    }
  };

  const getBannerStyle = () => {
    switch (placement) {
      case 'main_page_top':
        return styles.mainPageBanner;
      case 'result_page_bottom':
        return styles.resultPageBanner;
      case 'main_page_exit':
        return styles.interstitialBanner;
      default:
        return styles.defaultBanner;
    }
  };

  const getBannerContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Star size={16} color="#8B5FBF" />
          <Text style={styles.loadingText}>Loading targeted ad...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ad temporarily unavailable</Text>
        </View>
      );
    }

    if (!adData) {
      return (
        <View style={styles.noAdContainer}>
          <Text style={styles.noAdText}>No ads available</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity style={styles.adContent} onPress={handleAdClick}>
        <View style={styles.adHeader}>
          <Star size={12} color="#8B5FBF" />
          <Text style={styles.adLabel}>Sponsored</Text>
          <Text style={styles.adNetwork}>{adData.network.name}</Text>
        </View>
        
        <View style={styles.adBody}>
          <Text style={styles.adTitle}>
            {getTargetedAdTitle(adData.targeting)}
          </Text>
          <Text style={styles.adDescription}>
            {getTargetedAdDescription(adData.targeting)}
          </Text>
        </View>
        
        <View style={styles.adFooter}>
          <ExternalLink size={12} color="#8B5FBF" />
          <Text style={styles.adCta}>Learn More</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getTargetedAdTitle = (targeting: any): string => {
    const { contextual } = targeting;
    
    if (contextual.cuisine?.length > 0) {
      const cuisine = contextual.cuisine[0];
      return `Discover Amazing ${cuisine} Restaurants`;
    }
    
    if (contextual.mood?.length > 0) {
      const mood = contextual.mood[0];
      return `Perfect for ${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`;
    }
    
    if (contextual.budget?.length > 0) {
      const budget = contextual.budget[0];
      return `${budget.charAt(0).toUpperCase() + budget.slice(1)} Dining Options`;
    }
    
    return 'Discover Great Places to Eat';
  };

  const getTargetedAdDescription = (targeting: any): string => {
    const { contextual } = targeting;
    
    if (contextual.cuisine?.length > 0 && contextual.mood?.length > 0) {
      const cuisine = contextual.cuisine[0];
      const mood = contextual.mood[0];
      return `Find the best ${cuisine} restaurants perfect for ${mood} moments`;
    }
    
    if (contextual.budget?.length > 0) {
      const budget = contextual.budget[0];
      return `Explore ${budget} dining options that match your preferences`;
    }
    
    return 'Get personalized restaurant recommendations based on your mood and preferences';
  };

  return (
    <View style={[styles.container, getBannerStyle()]}>
      {getBannerContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mainPageBanner: {
    height: 80,
    marginHorizontal: 16,
  },
  resultPageBanner: {
    height: 120,
    marginHorizontal: 16,
  },
  interstitialBanner: {
    height: 200,
    marginHorizontal: 16,
  },
  defaultBanner: {
    height: 60,
    marginHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#999',
  },
  noAdContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  noAdText: {
    fontSize: 12,
    color: '#999',
  },
  adContent: {
    flex: 1,
    padding: 12,
  },
  adHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adLabel: {
    fontSize: 10,
    color: '#8B5FBF',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  adNetwork: {
    fontSize: 10,
    color: '#666',
    marginLeft: 'auto',
  },
  adBody: {
    flex: 1,
    marginBottom: 8,
  },
  adTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  adFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  adCta: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '600',
    marginLeft: 4,
  },
}); 