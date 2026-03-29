import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ExternalLink, Clock, AlertCircle, Star } from 'lucide-react-native';
import { DiscountInfo } from '../hooks/use-discounts';

interface ActiveDiscountsCardProps {
  discounts: DiscountInfo[];
  isLoading: boolean;
  error: string | null;
  onDiscountPress: (discount: DiscountInfo) => void;
  placeType: 'food' | 'activity' | 'something-new';
  tags?: string[];
  description?: string;
}

export const ActiveDiscountsCard: React.FC<ActiveDiscountsCardProps> = ({
  discounts,
  isLoading,
  error,
  onDiscountPress,
  placeType,
  tags = [],
  description = ''
}) => {
  // Helper function to get the correct booking title based on place type
  const getBookingTitle = (type: 'food' | 'activity' | 'something-new'): string => {
    switch (type) {
      case 'food':
        return 'Book This Restaurant';
      case 'activity':
        return 'Book This Activity';
      case 'something-new':
        return analyzePlaceType();
      default:
        return 'Book This Place';
    }
  };

  // Helper function to analyze place type for 'something-new' category
  const analyzePlaceType = (): string => {
    const allText = `${description} ${tags.join(' ')}`.toLowerCase();
    
    // Check for restaurant-related keywords
    const restaurantKeywords = [
      'restaurant', 'cafe', 'bar', 'pub', 'bistro', 'diner', 'eatery', 'kitchen',
      'food', 'dining', 'cuisine', 'menu', 'chef', 'dinner', 'lunch', 'breakfast',
      'pizza', 'burger', 'sushi', 'pasta', 'steak', 'seafood', 'bakery', 'coffee'
    ];
    
    // Check for activity-related keywords
    const activityKeywords = [
      'activity', 'adventure', 'tour', 'experience', 'workshop', 'class', 'lesson',
      'game', 'sport', 'fitness', 'yoga', 'dance', 'art', 'craft', 'museum',
      'theater', 'cinema', 'concert', 'show', 'event', 'exhibition', 'gallery',
      'spa', 'massage', 'wellness', 'outdoor', 'hiking', 'climbing', 'swimming'
    ];
    
    // Count matches for each category
    const restaurantMatches = restaurantKeywords.filter(keyword => 
      allText.includes(keyword)
    ).length;
    
    const activityMatches = activityKeywords.filter(keyword => 
      allText.includes(keyword)
    ).length;
    
    // Determine the most likely type based on keyword matches
    if (restaurantMatches > activityMatches) {
      return 'Book This Restaurant';
    } else if (activityMatches > restaurantMatches) {
      return 'Book This Activity';
    } else {
      // If no clear match, use a generic term
      return 'Book This Place';
    }
  };
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Star size={16} color="#8B5FBF" />
          <Text style={styles.title}>{getBookingTitle(placeType)}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching for discounts...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AlertCircle size={16} color="#FF6B6B" />
          <Text style={styles.title}>{getBookingTitle(placeType)}</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load discounts</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  if (discounts.length === 0) {
    return null; // Don't show anything if no discounts
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Star size={16} color="#8B5FBF" />
        <Text style={styles.title}>{getBookingTitle(placeType)}</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.discountsScroll}
      >
        {discounts.map((discount, index) => (
          <TouchableOpacity
            key={index}
            style={styles.discountCard}
            onPress={() => onDiscountPress(discount)}
          >
            <View style={styles.discountContent}>
              <View style={styles.discountHeader}>
                <Text style={styles.discountText}>{discount.discount}</Text>
                <Text style={styles.platformText}>{discount.platform}</Text>
              </View>
              
              {discount.originalPrice && discount.discountedPrice && (
                <View style={styles.priceContainer}>
                  <Text style={styles.originalPrice}>{discount.originalPrice}</Text>
                  <Text style={styles.discountedPrice}>{discount.discountedPrice}</Text>
                </View>
              )}
              
              {discount.validUntil && (
                <View style={styles.validUntilContainer}>
                  <Clock size={12} color="#666" />
                  <Text style={styles.validUntilText}>
                    Valid until {new Date(discount.validUntil).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              <View style={styles.actionContainer}>
                <Text style={styles.actionText}>Tap to claim</Text>
                <ExternalLink size={12} color="#8B5FBF" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  errorSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  discountsScroll: {
    flexGrow: 0,
  },
  discountCard: {
    backgroundColor: '#FFF5F2',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 200,
    maxWidth: 250,
    borderWidth: 1,
    borderColor: '#FFE4D6',
  },
  discountContent: {
    flex: 1,
  },
  discountHeader: {
    marginBottom: 8,
  },
  discountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 2,
  },
  platformText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
  },
  validUntilContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validUntilText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
  },
}); 