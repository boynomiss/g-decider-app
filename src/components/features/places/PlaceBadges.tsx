import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlaceBadgesProps {
  priceRange: string;
  rating: string;
  testID?: string;
}

export default function PlaceBadges({ priceRange, rating, testID }: PlaceBadgesProps) {
  return (
    <View style={styles.badgesContainer} testID={testID}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{priceRange}</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>⭐ {rating}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badgesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
