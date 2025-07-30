import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdPlacement() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Ad Placement</Text>
      <Text style={styles.subtitle}>Future advertising space</Text>
    </View>
  );
}

const SECTION_SPACING = 16;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: SECTION_SPACING,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholder: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#BBB',
  },
});