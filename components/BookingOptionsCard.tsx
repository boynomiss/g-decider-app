import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, Clock, Users, ExternalLink } from 'lucide-react-native';

interface BookingPlatform {
  name: string;
  deepLinkBase: string;
  webUrlBase: string;
  affiliateId?: string;
  apiKey?: string;
}

interface BookingOptionsCardProps {
  platforms: BookingPlatform[];
  isLoading: boolean;
  error: string | null;
  onBookingPress: (platform: BookingPlatform) => void;
  restaurantName: string;
  location: string;
}

export const BookingOptionsCard: React.FC<BookingOptionsCardProps> = ({
  platforms,
  isLoading,
  error,
  onBookingPress,
  restaurantName,
  location
}) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Calendar size={16} color="#8B5FBF" />
          <Text style={styles.title}>Booking Options</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Checking booking availability...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Calendar size={16} color="#FF6B6B" />
          <Text style={styles.title}>Booking Options</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load booking options</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  if (platforms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Calendar size={16} color="#8B5FBF" />
          <Text style={styles.title}>Booking Options</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No booking platforms available</Text>
          <Text style={styles.emptySubtext}>Try searching for this restaurant directly on booking platforms</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Calendar size={16} color="#8B5FBF" />
        <Text style={styles.title}>Book This Restaurant</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.platformsScroll}
      >
        {platforms.map((platform, index) => {
          const style = getPlatformStyle(platform);
          
          return (
            <TouchableOpacity
              key={index}
              style={[styles.platformButton, { backgroundColor: style.backgroundColor }]}
              onPress={() => onBookingPress(platform)}
            >
              <View style={styles.platformContent}>
                <Text style={[styles.platformName, { color: style.color }]}>
                  {platform.name}
                </Text>
                <Text style={styles.platformSubtext}>
                  {restaurantName}
                </Text>
                <Text style={styles.platformLocation}>
                  {location}
                </Text>
                <View style={styles.platformIcon}>
                  <ExternalLink size={12} color={style.color} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Clock size={12} color="#666" />
          <Text style={styles.infoText}>Tap to open booking platform</Text>
        </View>
        <View style={styles.infoRow}>
          <Users size={12} color="#666" />
          <Text style={styles.infoText}>You'll be redirected to complete booking</Text>
        </View>
      </View>
    </View>
  );
};

const getPlatformStyle = (platform: BookingPlatform): { color: string; backgroundColor: string } => {
  switch (platform.name) {
    case 'Eatigo':
      return { color: '#FF6B35', backgroundColor: '#FFF5F2' };
    case 'Klook':
      return { color: '#00B4D8', backgroundColor: '#F0F9FF' };
    default:
      return { color: '#8B5FBF', backgroundColor: '#F8F5FF' };
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
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
  },
  platformsScroll: {
    marginBottom: 12,
  },
  platformButton: {
    marginRight: 12,
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  platformContent: {
    alignItems: 'center',
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  platformSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 2,
  },
  platformLocation: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
  platformIcon: {
    marginTop: 4,
  },
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
}); 