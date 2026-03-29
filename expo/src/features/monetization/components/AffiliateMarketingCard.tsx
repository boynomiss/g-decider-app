import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Globe, ExternalLink, Star, TrendingUp, Users, Clock } from 'lucide-react-native';
import { Linking } from 'react-native';
import { useAdMonetization } from '../hooks/use-ad-monetization';
import { AffiliatePartner, SponsoredContent } from '../types';

interface AffiliateMarketingCardProps {
  context?: {
    restaurantName?: string;
    cuisine?: string;
    location?: string;
    budget?: string;
  };
  onPartnerClick?: (partner: any) => void;
}

export const AffiliateMarketingCard: React.FC<AffiliateMarketingCardProps> = ({
  context,
  onPartnerClick
}) => {
  const [affiliatePartners, setAffiliatePartners] = useState<AffiliatePartner[]>([]);
  const [sponsoredContent, setSponsoredContent] = useState<SponsoredContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    getAffiliateLink,
    getSponsoredContent,
    trackAffiliateClick,
    trackSponsoredClick
  } = useAdMonetization();

  useEffect(() => {
    loadAffiliateData();
  }, [context]);

  const loadAffiliateData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load affiliate partners
      const partners = ['eatigo', 'klook', 'foodpanda', 'grab_food'];
      const affiliateData = partners.map(partnerId => {
        const affiliateLink = getAffiliateLink(partnerId, context);
        return affiliateLink?.partner;
      }).filter((partner): partner is AffiliatePartner => partner !== undefined);

      setAffiliatePartners(affiliateData);

      // Load sponsored content
      const sponsored = getSponsoredContent(context);
      setSponsoredContent(sponsored);

      console.log(`💰 Affiliate data loaded: ${affiliateData.length} partners, ${sponsored.length} sponsored items`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load affiliate data';
      setError(errorMessage);
      console.error('❌ Affiliate loading failed:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartnerClick = (partner: AffiliatePartner) => {
    const affiliateLink = getAffiliateLink(partner.id, context);
    
    if (affiliateLink) {
      // Track affiliate click
      trackAffiliateClick(partner.id, affiliateLink.estimatedCommission);
      
      // Open affiliate link
      Linking.openURL(affiliateLink.trackingUrl);
      
      onPartnerClick?.(partner);
      
      console.log(`💰 Affiliate click: ${partner.name}, estimated commission: ₱${affiliateLink.estimatedCommission.toFixed(2)}`);
    }
  };

  const handleSponsoredClick = (content: SponsoredContent) => {
    // Track sponsored content click
    trackSponsoredClick(content.id);
    
    // Simulate opening sponsored content
    const contentUrl = `https://example.com/sponsored/${content.id}`;
    Linking.openURL(contentUrl);
    
    console.log(`🎯 Sponsored content click: ${content.title}`);
  };

  const getPartnerIcon = (category: string) => {
    switch (category) {
      case 'food':
        return '🍽️';
      case 'entertainment':
        return '🎬';
      case 'events':
        return '🎪';
      case 'travel':
        return '✈️';
      default:
        return '💼';
    }
  };

  const getPartnerColor = (category: string) => {
    switch (category) {
      case 'food':
        return '#FF6B35';
      case 'entertainment':
        return '#4ECDC4';
      case 'events':
        return '#45B7D1';
      case 'travel':
        return '#96CEB4';
      default:
        return '#8B5FBF';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Globe size={20} color="#8B5FBF" />
          <Text style={styles.title}>Partner Offers</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Globe size={24} color="#8B5FBF" />
          <Text style={styles.loadingText}>Loading partner offers...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Globe size={20} color="#FF6B6B" />
          <Text style={styles.title}>Partner Offers</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load partner offers</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Globe size={20} color="#8B5FBF" />
        <Text style={styles.title}>Partner Offers</Text>
      </View>

      {/* Sponsored Content */}
      {sponsoredContent.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Offers</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.sponsoredScroll}
          >
            {sponsoredContent.map((content) => (
              <TouchableOpacity
                key={content.id}
                style={styles.sponsoredCard}
                onPress={() => handleSponsoredClick(content)}
              >
                <View style={styles.sponsoredHeader}>
                  <Star size={12} color="#FFD700" />
                  <Text style={styles.sponsoredLabel}>
                    {content.category === 'exclusive' ? 'Exclusive' : 'Featured'}
                  </Text>
                </View>
                
                <Text style={styles.sponsoredTitle}>{content.title}</Text>
                <Text style={styles.sponsoredDescription}>{content.description}</Text>
                
                <View style={styles.sponsoredFooter}>
                  <ExternalLink size={12} color="#8B5FBF" />
                  <Text style={styles.sponsoredCta}>View Offer</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Affiliate Partners */}
      {affiliatePartners.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book & Order</Text>
          <View style={styles.partnersGrid}>
            {affiliatePartners.map((partner) => (
              <TouchableOpacity
                key={partner.id}
                style={[
                  styles.partnerCard,
                  { borderLeftColor: getPartnerColor(partner.category) }
                ]}
                onPress={() => handlePartnerClick(partner)}
              >
                <View style={styles.partnerHeader}>
                  <Text style={styles.partnerIcon}>
                    {getPartnerIcon(partner.category)}
                  </Text>
                  <Text style={styles.partnerName}>{partner.name}</Text>
                </View>
                
                <View style={styles.partnerDetails}>
                  <Text style={styles.partnerCategory}>
                    {partner.category.charAt(0).toUpperCase() + partner.category.slice(1)}
                  </Text>
                  <Text style={styles.partnerCommission}>
                    {partner.commissionRate * 100}% commission
                  </Text>
                </View>
                
                <View style={styles.partnerFooter}>
                  <Users size={12} color="#666" />
                  <Text style={styles.partnerClicks}>
                    {partner.performance.clicks} clicks
                  </Text>
                  <ExternalLink size={12} color="#8B5FBF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {affiliatePartners.length} partners available
        </Text>
        <Text style={styles.statsSubtext}>
          {sponsoredContent.length} featured offers
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
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  sponsoredScroll: {
    marginBottom: 16,
  },
  sponsoredCard: {
    width: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
  },
  sponsoredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sponsoredLabel: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
    marginLeft: 4,
  },
  sponsoredTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sponsoredDescription: {
    fontSize: 10,
    color: '#666',
    lineHeight: 14,
    marginBottom: 8,
  },
  sponsoredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sponsoredCta: {
    fontSize: 10,
    color: '#8B5FBF',
    fontWeight: '600',
    marginLeft: 4,
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  partnerCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  partnerIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  partnerName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  partnerDetails: {
    marginBottom: 8,
  },
  partnerCategory: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  partnerCommission: {
    fontSize: 10,
    color: '#8B5FBF',
    fontWeight: '500',
  },
  partnerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerClicks: {
    fontSize: 10,
    color: '#666',
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