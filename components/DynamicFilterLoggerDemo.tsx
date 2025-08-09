import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { UnifiedFilters } from '../types/app';
import { useDynamicFilterLogger, useSearchPreview, useFilterChangeTracker } from '../hooks/use-dynamic-filter-logger';

interface FilterControlProps<T> {
  label: string;
  value: T | null;
  options: Array<{ label: string; value: T | null }>;
  onSelect: (value: T | null) => void;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expandButton: {
    fontSize: 14,
    color: '#6c757d',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333'
  },
  filterControl: {
    marginBottom: 16
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#444'
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8
  },
  filterOptionActive: {
    backgroundColor: '#007AFF'
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666'
  },
  filterOptionTextActive: {
    color: 'white',
    fontWeight: '500'
  },
  queryPreview: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  queryText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333'
  },
  breakdown: {
    marginBottom: 8
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 2
  },
  breakdownValue: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic'
  },
  changeItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8
  },
  changeField: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  changeQuery: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginTop: 2
  },
  changeTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4
  },
  noChanges: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  }
});

function FilterControl<T>({ label, value, options, onSelect }: FilterControlProps<T>) {
  return (
    <View style={styles.filterControl}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {options.map((option) => (
          <TouchableOpacity
            key={`${option.value}`}
            style={[
              styles.filterOption,
              value === option.value && styles.filterOptionActive
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.filterOptionText,
              value === option.value && styles.filterOptionTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export function DynamicFilterLoggerDemo() {
  const [filters, setFilters] = useState<UnifiedFilters>({
    category: null,
    mood: null,
    socialContext: null,
    budget: null,
    timeOfDay: null,
    distanceRange: null,
    location: '',
    userLocation: { lat: 0, lng: 0 }
  });

  const { 
    enableDebugLogging, 
    getChangeHistory, 
    getQueryHistory,
    startProgress,
    updateProgress,
    completeProgress,
    getActiveProgress
  } = useDynamicFilterLogger();
  const { searchPreview, searchKeywords, placeTypes, atmosphereKeywords } = useSearchPreview(filters);
  
  // Track filter changes automatically
  useFilterChangeTracker(filters);

  // Enable debug logging on mount
  useEffect(() => {
    enableDebugLogging(true);
    return () => enableDebugLogging(false);
  }, [enableDebugLogging]);

  const updateFilter = <K extends keyof UnifiedFilters>(
    key: K,
    value: UnifiedFilters[K] | null
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const categoryOptions: Array<{ label: string; value: 'food' | 'activity' | 'something-new' | null }> = [
    { label: 'None', value: null },
    { label: '🍽️ Food', value: 'food' },
    { label: '🎯 Activity', value: 'activity' },
    { label: '✨ Something New', value: 'something-new' }
  ];

  const moodOptions = [
    { label: 'None', value: null },
    { label: '😌 Chill (20)', value: 20 },
    { label: '😊 Neutral (50)', value: 50 },
    { label: '🔥 Hype (80)', value: 80 }
  ];

  const socialOptions: Array<{ label: string; value: 'solo' | 'with-bae' | 'barkada' | null }> = [
    { label: 'None', value: null },
    { label: '👤 Solo', value: 'solo' },
    { label: '💕 With Bae', value: 'with-bae' },
    { label: '👥 Barkada', value: 'barkada' }
  ];

  const budgetOptions: Array<{ label: string; value: 'P' | 'PP' | 'PPP' | null }> = [
    { label: 'None', value: null },
    { label: '💰 Budget (P)', value: 'P' },
    { label: '💰💰 Moderate (PP)', value: 'PP' },
    { label: '💰💰💰 Premium (PPP)', value: 'PPP' }
  ];

  const timeOptions: Array<{ label: string; value: 'morning' | 'afternoon' | 'night' | null }> = [
    { label: 'None', value: null },
    { label: '🌅 Morning', value: 'morning' },
    { label: '☀️ Afternoon', value: 'afternoon' },
    { label: '🌙 Night', value: 'night' }
  ];

  const changeHistory = getChangeHistory();
  const queryHistory = getQueryHistory();

  const [expanded, setExpanded] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Dynamic Filter Logger Demo</Text>
      <Text style={styles.subtitle}>
        Watch the console for real-time search query generation!
      </Text>

      {/* Filter Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter Controls</Text>
        
        <FilterControl
          label="Category"
          value={filters.category}
          options={categoryOptions}
          onSelect={(value) => updateFilter('category', value)}
        />

        <FilterControl
          label="Mood"
          value={filters.mood}
          options={moodOptions}
          onSelect={(value) => updateFilter('mood', value as number | null)}
        />

        <FilterControl
          label="Social Context"
          value={filters.socialContext}
          options={socialOptions}
          onSelect={(value) => updateFilter('socialContext', value)}
        />

        <FilterControl
          label="Budget"
          value={filters.budget}
          options={budgetOptions}
          onSelect={(value) => updateFilter('budget', value)}
        />

        <FilterControl
          label="Time of Day"
          value={filters.timeOfDay}
          options={timeOptions}
          onSelect={(value) => updateFilter('timeOfDay', value)}
        />
      </View>

      {/* Search Preview */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.header}
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.sectionTitle}>🎯 Generated Search Query</Text>
          <Text style={styles.expandButton}>{expanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        <View style={styles.queryPreview}>
          <Text style={styles.queryText}>{searchPreview}</Text>
        </View>
      </View>

      {/* Query Breakdown */}
      {expanded && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧩 Query Breakdown</Text>
          
          <View style={styles.breakdown}>
            <Text style={styles.breakdownLabel}>Search Keywords:</Text>
            <Text style={styles.breakdownValue}>
              {searchKeywords.length > 0 ? searchKeywords.join(', ') : 'None'}
            </Text>
          </View>

          <View style={styles.breakdown}>
            <Text style={styles.breakdownLabel}>Place Types:</Text>
            <Text style={styles.breakdownValue}>
              {placeTypes.length > 0 ? placeTypes.join(', ') : 'None'}
            </Text>
          </View>

          <View style={styles.breakdown}>
            <Text style={styles.breakdownLabel}>Atmosphere Keywords:</Text>
            <Text style={styles.breakdownValue}>
              {atmosphereKeywords.length > 0 ? atmosphereKeywords.join(', ') : 'None'}
            </Text>
          </View>
        </View>
      )}

      {/* Recent Changes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Recent Filter Changes</Text>
        {changeHistory.slice(0, 3).map((change, index) => (
          <View key={index} style={styles.changeItem}>
            <Text style={styles.changeField}>Changed: {change.changedField}</Text>
            <Text style={styles.changeQuery}>
              "{change.previousQuery}" → "{change.newQuery}"
            </Text>
            <Text style={styles.changeTime}>
              {change.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
        {changeHistory.length === 0 && (
          <Text style={styles.noChanges}>No filter changes yet</Text>
        )}
      </View>

      {/* Usage Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 How to Use</Text>
        <Text style={styles.instructions}>
          1. Select different filter options above{'\n'}
          2. Check the console for real-time logging{'\n'}
          3. Watch the "Generated Search Query" update{'\n'}
          4. See how keywords change based on your selections{'\n'}
          5. Review the change history below
        </Text>
      </View>
    </ScrollView>
  );
}