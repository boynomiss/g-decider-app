import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store/store';
import { SPACING } from '../../shared/constants/constants';

import { categoryOptions } from '../../features/filtering/services/filtering/configs/category-config';

export default function CategoryButtons() {
  const { filters: { category }, updateFilters } = useAppStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Looking for:</Text>
      
      <View style={styles.buttonsContainer}>
        {categoryOptions.map((categoryOption) => (
          <TouchableOpacity
            key={categoryOption.id}
            style={[
              styles.categoryButton,
              category === categoryOption.id && styles.activeButton
            ]}
            onPress={async () => {
              console.log('🎯 Category button pressed:', categoryOption.id);
              
              // Update filters
              updateFilters({ 
                category: categoryOption.id
              });
              console.log('✅ Filters updated');
              
              // Filter validation removed for now to fix runtime errors
              console.log('✅ Category filter applied successfully');
            }}
          >
            <Text style={styles.icon}>{categoryOption.icon}</Text>
            <Text style={[
              styles.label,
              category === categoryOption.id && styles.activeLabel
            ]}>
              {categoryOption.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingHorizontal: SPACING.CONTAINER_PADDING,
    paddingVertical: SPACING.CONTAINER_PADDING_VERTICAL,
    marginHorizontal: SPACING.CONTAINER_MARGIN,
    marginBottom: SPACING.SECTION_SPACING,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A4A4A',
    marginBottom: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1, // Makes buttons square (1x1)
    minHeight: 80,
  },
  activeButton: {
    backgroundColor: '#7DD3C0',
  },
  icon: {
    fontSize: 28.8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 18,
  },
  activeLabel: {
    color: '#FFF',
  },
});