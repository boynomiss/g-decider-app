import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import PlaceBadges from './PlaceBadges';
import PrimaryActionButtons from './PrimaryActionButtons';
import { ResultActionBar } from '../results/ResultActionBar';

interface PlaceInfoCardProps {
  placeName: string;
  address: string;
  priceRange: string;
  rating: string;
  description: string;
  onViewInMaps: () => void;
  onContact: () => void;
  onPass: () => void;
  onRestart: () => void;
  onSave: () => void;
  isSaved: boolean;
  testID?: string;
}

export default function PlaceInfoCard({
  placeName,
  address,
  priceRange,
  rating,
  description,
  onViewInMaps,
  onContact,
  onPass,
  onRestart,
  onSave,
  isSaved,
  testID
}: PlaceInfoCardProps) {
  return (
    <View style={styles.infoCard} testID={testID}>
      {/* Restaurant Name */}
      <Text style={styles.placeName}>{placeName}</Text>
      
      {/* Address */}
      <Text style={styles.address}>{address}</Text>
      
      {/* Price and Rating */}
      <PlaceBadges priceRange={priceRange} rating={rating} />
      
      {/* Description */}
      <Text style={styles.description}>{description}</Text>
      
      {/* Primary Action Buttons */}
      <PrimaryActionButtons
        onViewInMaps={onViewInMaps}
        onContact={onContact}
      />
      
      {/* Result Action Bar */}
      <ResultActionBar
        onPass={onPass}
        onRestart={onRestart}
        onSave={onSave}
        isSaved={isSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  placeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 24,
  },
});
