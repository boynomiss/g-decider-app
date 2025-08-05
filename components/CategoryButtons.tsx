import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/hooks/use-app-store';
import { FilterApiBridge } from '@/utils/filter-api-bridge';
import { filterValidationService } from '@/utils/filter-validation-service';

const categories = [
  { id: 'food', label: 'Food', icon: '🍔' },
  { id: 'activity', label: 'Activity', icon: '🧩' },
  { id: 'something-new', label: 'Something\nNEW', icon: '✨' },
] as const;

export default function CategoryButtons() {
  const { filters, updateFilters } = useAppStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Looking for:</Text>
      
      <View style={styles.buttonsContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              filters.category === category.id && styles.activeButton
            ]}
            onPress={async () => {
              console.log('🎯 Category button pressed:', category.id);
              
              // Update filters
              updateFilters({ 
                category: category.id
              });
              console.log('✅ Filters updated');
              
              // Trigger validation
              try {
                console.log('🔍 Starting filter validation...');
                const validationResult = await filterValidationService.validateLookingForFilter(
                  category.id as 'food' | 'activity' | 'something-new'
                );
                
                if (validationResult.success) {
                  console.log(`✅ Validation successful: ${validationResult.placeCount} places found for ${category.id}`);
                } else {
                  console.warn(`⚠️ Validation failed for ${category.id}: ${validationResult.error}`);
                }
              } catch (error) {
                console.error('❌ Validation error:', error);
              }
            }}
          >
            <Text style={styles.icon}>{category.icon}</Text>
            <Text style={[
              styles.label,
              filters.category === category.id && styles.activeLabel
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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