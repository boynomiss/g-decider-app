import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '@/hooks/use-app-store';
import { getFilterSummary } from '@/utils/filters/filter-logger';

interface FilterLogDisplayProps {
  visible?: boolean;
  showPlaceTypes?: boolean;
}

export default function FilterLogDisplay({ 
  visible = true, 
  showPlaceTypes = true 
}: FilterLogDisplayProps) {
  const { filters } = useAppStore();
  
  if (!visible) return null;
  
  const filterSummary = getFilterSummary(filters);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Filter Settings:</Text>
      
      <View style={styles.logContainer}>
        <Text style={styles.logLine}>
          Looking for: <Text style={styles.value}>{filterSummary.category}</Text>
        </Text>
        
        <Text style={styles.logLine}>
          Mood: <Text style={styles.value}>{filterSummary.mood}</Text>
        </Text>
        
        <Text style={styles.logLine}>
          Social Context: <Text style={styles.value}>{filterSummary.socialContext}</Text>
        </Text>
        
        <Text style={styles.logLine}>
          Budget: <Text style={styles.value}>{filterSummary.budget}</Text>
        </Text>
        
        <Text style={styles.logLine}>
          Time of day: <Text style={styles.value}>{filterSummary.timeOfDay}</Text>
        </Text>
        
        <Text style={styles.logLine}>
          Distance range: <Text style={styles.value}>{filterSummary.distanceRange}</Text>
        </Text>
        
        {showPlaceTypes && (
          <View style={styles.placeTypesContainer}>
            <Text style={styles.logLine}>
              Place types: <Text style={styles.value}>{filterSummary.placeTypes.length}</Text>
            </Text>
            {filterSummary.placeTypes.length > 0 && (
              <Text style={styles.placeTypesList}>
                {filterSummary.placeTypes.join(', ')}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  logContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  logLine: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 4,
  },
  value: {
    fontWeight: '600',
    color: '#495057',
  },
  placeTypesContainer: {
    marginTop: 4,
  },
  placeTypesList: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
    marginTop: 4,
    fontStyle: 'italic',
  },
}); 