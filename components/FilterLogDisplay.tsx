import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '@/hooks/use-app-store';
import { useSearchPreview, useFilterChangeTracker } from '@/hooks/use-dynamic-filter-logger';

interface FilterLogDisplayProps {
  visible?: boolean;
  showPlaceTypes?: boolean;
  showSearchPreview?: boolean;
}

export default function FilterLogDisplay({ 
  visible = true, 
  showPlaceTypes = true,
  showSearchPreview = true
}: FilterLogDisplayProps) {
  const { filters } = useAppStore();
  const { searchPreview, searchKeywords, placeTypes, atmosphereKeywords } = useSearchPreview(filters);
  
  // Track filter changes automatically
  useFilterChangeTracker(filters);
  
  const [expanded, setExpanded] = React.useState(false);
  
  if (!visible) return null;
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <Text style={styles.title}>Current Filter Settings</Text>
        <Text style={styles.expandButton}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      
      <View style={styles.logContainer}>
        {/* Basic Filter Settings */}
        <Text style={styles.logLine}>
          Looking for: <Text style={styles.value}>{filters.category || 'none'}</Text>
        </Text>
        
        <Text style={styles.logLine}>
          Mood: <Text style={styles.value}>
            {filters.mood !== null ? filters.mood.toString() : 'none'}
          </Text>
        </Text>
        
        <Text style={styles.logLine}>
          Social Context: <Text style={styles.value}>
            {filters.socialContext || 'none'}
          </Text>
        </Text>
        
        <Text style={styles.logLine}>
          Budget: <Text style={styles.value}>{filters.budget || 'none'}</Text>
        </Text>
        
        <Text style={styles.logLine}>
          Time of day: <Text style={styles.value}>
            {filters.timeOfDay || 'none'}
          </Text>
        </Text>
        
        <Text style={styles.logLine}>
          Distance range: <Text style={styles.value}>
            {filters.distanceRange !== null ? filters.distanceRange.toString() : 'none'}
          </Text>
        </Text>
        
        {/* Search Preview Section */}
        {showSearchPreview && (
          <View style={styles.searchPreviewContainer}>
            <Text style={styles.sectionTitle}>🔍 Generated Search Query</Text>
            <Text style={styles.searchPreview}>{searchPreview}</Text>
          </View>
        )}
        
        {/* Expanded Details */}
        {expanded && (
          <>
            {/* Keywords Section */}
            <View style={styles.keywordsContainer}>
              <Text style={styles.sectionTitle}>🏷️ Search Keywords</Text>
              <Text style={styles.keywordsList}>
                {searchKeywords.length > 0 ? searchKeywords.join(', ') : 'None'}
              </Text>
            </View>
            
            {/* Place Types Section */}
            {showPlaceTypes && (
              <View style={styles.placeTypesContainer}>
                <Text style={styles.sectionTitle}>🏢 Place Types</Text>
                <Text style={styles.placeTypesList}>
                  {placeTypes.length > 0 ? placeTypes.join(', ') : 'None'}
                </Text>
              </View>
            )}
            
            {/* Atmosphere Keywords Section */}
            <View style={styles.atmosphereContainer}>
              <Text style={styles.sectionTitle}>🌟 Atmosphere Keywords</Text>
              <Text style={styles.atmosphereList}>
                {atmosphereKeywords.length > 0 ? atmosphereKeywords.join(', ') : 'None'}
              </Text>
            </View>
          </>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
  },
  expandButton: {
    fontSize: 14,
    color: '#6c757d',
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
  searchPreviewContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  searchPreview: {
    fontSize: 13,
    color: '#6c757d',
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  keywordsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  keywordsList: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  placeTypesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  placeTypesList: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  atmosphereContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  atmosphereList: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
}); 