import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../../store/store';
import { useSearchPreview, useFilterChangeTracker } from '../hooks/use-dynamic-filter-logger';
import { getCategoryFilter } from '../services/filtering/configs/category-config';
import { getMoodCategory } from '../services/filtering/configs/mood-config';
import { getSocialContext } from '../services/filtering/configs/social-config';
import { getBudgetCategory } from '../services/filtering/configs/budget-config';
import { getTimeCategory } from '../services/filtering/configs/time-config';
import { getDistanceCategory } from '../services/filtering/configs/distance-config';
import { SPACING } from '../../../shared/constants/constants';

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
  const { searchPreview, placeTypes } = useSearchPreview(filters);
  
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
          Looking for: <Text style={styles.value}>
            {filters.category ? getCategoryFilter(filters.category)?.label || filters.category : 'none'}
          </Text>
        </Text>
        
        <Text style={styles.logLine}>
          Mood: <Text style={styles.value}>
            {filters.mood !== null ? getMoodCategory(filters.mood)?.label || filters.mood.toString() : 'none'}
          </Text>
        </Text>
        
        <Text style={styles.logLine}>
          Social Context: <Text style={styles.value}>
            {filters.socialContext ? getSocialContext(filters.socialContext)?.label || filters.socialContext : 'none'}
          </Text>
        </Text>
        
        <Text style={styles.logLine}>
          Budget: <Text style={styles.value}>
            {filters.budget ? getBudgetCategory(filters.budget)?.display || filters.budget : 'none'}
          </Text>
        </Text>
        
        <Text style={styles.logLine}>
          Time of day: <Text style={styles.value}>
            {filters.timeOfDay ? getTimeCategory(filters.timeOfDay)?.label || filters.timeOfDay : 'none'}
          </Text>
        </Text>
        
        <Text style={styles.logLine}>
          Distance range: <Text style={styles.value}>
            {filters.distanceRange !== null ? getDistanceCategory(filters.distanceRange).text : 'none'}
          </Text>
        </Text>
        
        {/* Search Preview Section */}
        {showSearchPreview && (
          <View style={styles.searchPreviewContainer}>
            <Text style={styles.sectionTitle}>🔍 Generated Search Query</Text>
            <Text style={styles.searchPreview}>{searchPreview}</Text>
          </View>
        )}
        
        {/* Dynamic Text Search Section */}
        {expanded && (
          <View style={styles.dynamicSearchContainer}>
            <Text style={styles.sectionTitle}>🔍 Dynamic Text Search</Text>
            <Text style={styles.dynamicSearchText}>
              {(() => {
                const searchTerms: string[] = [];
                
                // Add category-based terms
                if (filters.category) {
                  const category = getCategoryFilter(filters.category);
                  if (category) {
                    searchTerms.push(category.label.toLowerCase());
                    searchTerms.push(...category.searchKeywords);
                  }
                }
                
                // Add mood-based terms
                if (filters.mood !== null) {
                  const mood = getMoodCategory(filters.mood);
                  if (mood) {
                    searchTerms.push(mood.label.toLowerCase());
                    searchTerms.push(...mood.atmosphereKeywords);
                  }
                }
                
                // Add social context terms
                if (filters.socialContext) {
                  const social = getSocialContext(filters.socialContext);
                  if (social) {
                    searchTerms.push(social.label.toLowerCase());
                    searchTerms.push(...social.atmosphereKeywords);
                  }
                }
                
                // Add budget terms
                if (filters.budget) {
                  const budget = getBudgetCategory(filters.budget);
                  if (budget) {
                    searchTerms.push(budget.label.toLowerCase());
                    searchTerms.push(...budget.atmosphereKeywords);
                  }
                }
                
                // Add time-based terms
                if (filters.timeOfDay) {
                  const time = getTimeCategory(filters.timeOfDay);
                  if (time) {
                    searchTerms.push(time.label.toLowerCase());
                  }
                }
                
                // Add place types
                if (placeTypes.length > 0) {
                  searchTerms.push(...placeTypes);
                }
                
                // Remove duplicates and filter out empty strings
                const uniqueTerms = [...new Set(searchTerms)].filter(term => term.trim().length > 0);
                
                return uniqueTerms.length > 0 ? uniqueTerms.join(', ') : 'No search terms available';
              })()}
            </Text>
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
    padding: SPACING.CONTAINER_PADDING, // Changed from 16 to use constant
    margin: SPACING.CONTAINER_MARGIN, // Changed from 16 to use constant (which is now 0)
    marginTop: 200, // Changed from 400px to 200px
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
    padding: SPACING.CONTAINER_PADDING, // Changed from 12 to use constant
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
  dynamicSearchContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  dynamicSearchText: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
    fontFamily: 'monospace',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
}); 