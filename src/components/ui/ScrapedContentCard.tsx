import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { MapPin, Star, Clock, DollarSign } from 'lucide-react-native';

/**
 * ScrapedContentCard Component Props
 * @interface ScrapedContentCardProps
 * @property {string} title - Title of the place/event
 * @property {string} description - Description or details
 * @property {string} imageUrl - URL of the main image
 * @property {number} rating - Rating out of 5
 * @property {number} reviewCount - Number of reviews
 * @property {string} address - Location address
 * @property {string} price - Price range (e.g., "$", "$$", "$$$")
 * @property {string} category - Category of the place/event
 * @property {boolean} isOpen - Whether the place is currently open
 * @property {() => void} onPress - Function called when card is pressed
 * @property {ViewStyle} style - Additional styles for the card
 * @property {string} testID - Test identifier for testing
 */
interface ScrapedContentCardProps {
  title: string;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  address: string;
  price: string;
  category: string;
  isOpen?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

/**
 * A card component for displaying scraped place/event information
 * 
 * @example
 * ```tsx
 * <ScrapedContentCard
 *   title="Amazing Restaurant"
 *   description="Best food in town"
 *   imageUrl="https://example.com/image.jpg"
 *   rating={4.5}
 *   reviewCount={150}
 *   address="123 Main St"
 *   price="$$"
 *   category="restaurant"
 *   onPress={() => console.log('Card pressed')}
 * />
 * ```
 */
export default function ScrapedContentCard({
  title,
  description,
  imageUrl,
  rating,
  reviewCount,
  address,
  price,
  category,
  isOpen = true,
  onPress,
  style,
  testID
}: ScrapedContentCardProps) {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} color="#FFD700" fill="#FFD700" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} color="#FFD700" fill="#FFD700" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} color="#E5E5E5" />);
    }
    
    return stars;
  };

  const getPriceText = (price: string) => {
    switch (price) {
      case '$': return 'Budget';
      case '$$': return 'Moderate';
      case '$$$': return 'Expensive';
      case '$$$$': return 'Luxury';
      default: return price;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'restaurant':
        return '🍽️';
      case 'cafe':
        return '☕';
      case 'bar':
        return '🍺';
      case 'activity':
        return '🎯';
      case 'entertainment':
        return '🎭';
      default:
        return '📍';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.9}
      testID={testID}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(category)}
            </Text>
            <Text style={styles.categoryText}>
              {category}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>
        
        <View style={styles.ratingContainer}>
          <View style={styles.stars}>
            {renderStars(rating)}
          </View>
          <Text style={styles.ratingText}>
            {rating.toFixed(1)} ({reviewCount} reviews)
          </Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <MapPin size={16} color="#666" />
            <Text style={styles.detailText} numberOfLines={1}>
              {address}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <DollarSign size={16} color="#666" />
            <Text style={styles.detailText}>
              {getPriceText(price)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Clock size={16} color="#666" />
            <Text style={[styles.detailText, { color: isOpen ? '#4CAF50' : '#F44336' }]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A5568',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  details: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
});
