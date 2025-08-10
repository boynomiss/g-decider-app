import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Search, Star, Calendar, ExternalLink, RefreshCw as Refresh, AlertCircle } from 'lucide-react-native';
import { useScrapingService } from '../hooks/use-scraping-service';

interface ScrapedDeal {
  id: string;
  title: string;
  description: string;
  originalPrice?: number;
  discountedPrice?: number;
  percentageOff?: number;
  validUntil?: Date;
  sourceUrl: string;
  sourceType: 'website' | 'social_media';
  locationData?: {
    placeId?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  tags: string[];
  categories: string[];
  imageUrls: string[];
  scrapedTimestamp: Date;
  aiSummary?: string;
  aiTags?: string[];
}

interface ScrapedAttraction {
  id: string;
  title: string;
  description: string;
  type: 'restaurant' | 'attraction' | 'event' | 'popup';
  openingDate?: Date;
  sourceUrl: string;
  sourceType: 'website' | 'social_media';
  locationData?: {
    placeId?: string;
    address?: string;
    coordinates?: { lat: number; lng: number };
  };
  tags: string[];
  categories: string[];
  imageUrls: string[];
  scrapedTimestamp: Date;
  aiSummary?: string;
  aiTags?: string[];
}

interface ScrapedContentCardProps {
  type: 'deals' | 'attractions';
  onRefresh?: () => void;
}

export const ScrapedContentCard: React.FC<ScrapedContentCardProps> = ({
  type,
  onRefresh
}) => {
  const {
    deals,
    attractions,
    isLoadingDeals,
    isLoadingAttractions,
    dealsError,
    attractionsError,
    scrapeDeals,
    scrapeAttractions,
    getScrapingStats
  } = useScrapingService();

  const isLoading = type === 'deals' ? isLoadingDeals : isLoadingAttractions;
  const error = type === 'deals' ? dealsError : attractionsError;
  const data = type === 'deals' ? deals : attractions;
  const scrapeFunction = type === 'deals' ? scrapeDeals : scrapeAttractions;
  const stats = getScrapingStats();

  const handleRefresh = async () => {
    await scrapeFunction();
    onRefresh?.();
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return `₱${price.toLocaleString()}`;
  };

  const formatPercentage = (percentage?: number) => {
    if (!percentage) return '';
    return `${percentage}% OFF`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return '🍽️';
      case 'attraction': return '🎡';
      case 'event': return '🎪';
      case 'popup': return '🚀';
      default: return '📍';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'restaurant': return '#FF6B35';
      case 'attraction': return '#4ECDC4';
      case 'event': return '#45B7D1';
      case 'popup': return '#96CEB4';
      default: return '#8B5FBF';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Search size={20} color="#8B5FBF" />
          <Text style={styles.title}>
            {type === 'deals' ? 'Latest Deals' : 'New Attractions'}
          </Text>
          <TouchableOpacity style={styles.refreshButton} disabled>
            <Refresh size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Refresh size={24} color="#8B5FBF" style={styles.spinning} />
          <Text style={styles.loadingText}>
            {type === 'deals' ? 'Finding the best deals...' : 'Discovering new places...'}
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Search size={20} color="#FF6B6B" />
          <Text style={styles.title}>
            {type === 'deals' ? 'Latest Deals' : 'New Attractions'}
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Refresh size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color="#FF6B6B" />
          <Text style={styles.errorText}>Unable to load content</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Search size={20} color="#8B5FBF" />
          <Text style={styles.title}>
            {type === 'deals' ? 'Latest Deals' : 'New Attractions'}
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Refresh size={16} color="#666" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {type === 'deals' ? 'No deals found' : 'No new attractions found'}
          </Text>
          <Text style={styles.emptySubtext}>
            Tap refresh to search for new content
          </Text>
          <TouchableOpacity style={styles.refreshButtonLarge} onPress={handleRefresh}>
            <Refresh size={20} color="#8B5FBF" />
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Search size={20} color="#8B5FBF" />
        <Text style={styles.title}>
          {type === 'deals' ? 'Latest Deals' : 'New Attractions'}
        </Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Refresh size={16} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.contentScroll}
      >
        {data.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            {/* Image */}
            {item.imageUrls.length > 0 && (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.imageUrls[0] }}
                  style={styles.image}
                  resizeMode="cover"
                />
                {type === 'deals' && (item as ScrapedDeal).percentageOff && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {formatPercentage((item as ScrapedDeal).percentageOff)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Content */}
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {type === 'attractions' && (
                  <View style={[
                    styles.typeBadge, 
                    { backgroundColor: getTypeColor((item as ScrapedAttraction).type) + '20' }
                  ]}>
                    <Text style={[
                      styles.typeText, 
                      { color: getTypeColor((item as ScrapedAttraction).type) }
                    ]}>
                      {getTypeIcon((item as ScrapedAttraction).type)} {(item as ScrapedAttraction).type}
                    </Text>
                  </View>
                )}
              </View>

              {/* AI Summary */}
              {item.aiSummary && (
                <Text style={styles.aiSummary}>{item.aiSummary}</Text>
              )}

              {/* Price info for deals */}
              {type === 'deals' && (item as ScrapedDeal).discountedPrice && (
                <View style={styles.priceContainer}>
                  {(item as ScrapedDeal).originalPrice && (
                    <Text style={styles.originalPrice}>
                      {formatPrice((item as ScrapedDeal).originalPrice)}
                    </Text>
                  )}
                  <Text style={styles.discountedPrice}>
                    {formatPrice((item as ScrapedDeal).discountedPrice)}
                  </Text>
                </View>
              )}

              {/* Date info */}
              <View style={styles.dateContainer}>
                <Calendar size={12} color="#666" />
                <Text style={styles.dateText}>
                  {type === 'deals' 
                    ? `Valid until ${formatDate((item as ScrapedDeal).validUntil)}`
                    : `Opens ${formatDate((item as ScrapedAttraction).openingDate)}`
                  }
                </Text>
              </View>

              {/* Tags */}
              {(item.aiTags || item.tags).length > 0 && (
                <View style={styles.tagsContainer}>
                  <Star size={12} color="#666" />
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.tagsScroll}
                  >
                    {(item.aiTags || item.tags).slice(0, 3).map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Source link */}
              <TouchableOpacity style={styles.sourceButton}>
                <ExternalLink size={12} color="#8B5FBF" />
                <Text style={styles.sourceText}>View Source</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {data.length} {type === 'deals' ? 'deals' : 'attractions'} found
        </Text>
        <Text style={styles.statsSubtext}>
          Last updated: {stats.lastScraped ? formatDate(stats.lastScraped) : 'Never'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  refreshButton: {
    padding: 4,
  },
  contentScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  itemCard: {
    width: 280,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginRight: 12,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  itemContent: {
    padding: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  aiSummary: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
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
    color: '#FF6B6B',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsScroll: {
    marginLeft: 4,
  },
  tag: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#666',
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 11,
    color: '#8B5FBF',
    marginLeft: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  spinning: {
    // Add animation in production
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 8,
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#8B5FBF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshButtonText: {
    color: '#8B5FBF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  statsContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
  statsSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
}); 