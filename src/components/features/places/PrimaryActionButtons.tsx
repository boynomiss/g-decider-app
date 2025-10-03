import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface PrimaryActionButtonsProps {
  onViewInMaps: () => void;
  onContact: () => void;
  testID?: string;
}

export default function PrimaryActionButtons({ 
  onViewInMaps, 
  onContact, 
  testID 
}: PrimaryActionButtonsProps) {
  return (
    <View style={styles.primaryActions} testID={testID}>
      <TouchableOpacity 
        style={styles.viewMapsButton}
        onPress={onViewInMaps}
        activeOpacity={0.8}
      >
        <Text style={styles.viewMapsIcon}>📍</Text>
        <Text style={styles.viewMapsText}>View in Maps</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.contactButton}
        onPress={onContact}
        activeOpacity={0.8}
      >
        <Text style={styles.phoneIcon}>📞</Text>
        <Text style={styles.contactText}>Contact</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  viewMapsButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C8A8E9',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  viewMapsIcon: {
    fontSize: 16,
  },
  viewMapsText: {
    color: '#C8A8E9',
    fontWeight: '600',
    fontSize: 14,
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  contactText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  phoneIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
});
