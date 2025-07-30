import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/hooks/use-app-store';

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
            onPress={() => {
              console.log('Category selected:', category.id);
              updateFilters({ category: category.id });
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
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  activeButton: {
    backgroundColor: '#7DD3C0',
  },
  icon: {
    fontSize: 24,
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