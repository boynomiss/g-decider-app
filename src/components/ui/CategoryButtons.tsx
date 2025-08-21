import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useAppStore } from '../../store/store';
import { SPACING } from '../../shared/constants/constants';
import { categoryOptions } from '../../features/filtering/services/filtering/configs/category-config';

/**
 * CategoryButtons Component Props
 * @interface CategoryButtonsProps
 * @property {string} title - Title text above the category buttons
 * @property {ViewStyle} style - Additional styles for the container
 * @property {string} testID - Test identifier for testing
 */
interface CategoryButtonsProps {
  title?: string;
  style?: ViewStyle;
  testID?: string;
}

/**
 * A component that displays category selection buttons for filtering
 * 
 * @example
 * ```tsx
 * <CategoryButtons title="Looking for:" />
 * ```
 */
export default function CategoryButtons({ 
  title = "Looking for:",
  style,
  testID 
}: CategoryButtonsProps) {
  const { filters: { category }, updateFilters } = useAppStore();

  const handleCategoryPress = (categoryId: string) => {
    updateFilters({ category: categoryId });
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.buttonsContainer}>
        {categoryOptions.map((categoryOption) => (
          <TouchableOpacity
            key={categoryOption.id}
            style={[
              styles.categoryButton,
              category === categoryOption.id && styles.activeButton
            ]}
            onPress={() => handleCategoryPress(categoryOption.id)}
            activeOpacity={0.8}
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
    aspectRatio: 1,
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