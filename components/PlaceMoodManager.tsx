import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { usePlaceMood, useMoodFiltering } from '@/hooks/use-place-mood';
import type { PlaceData } from '@/utils/place-mood-service';

interface PlaceMoodManagerProps {
  googlePlacesApiKey: string;
  googleCloudCredentials?: any;
}

export default function PlaceMoodManager({ 
  googlePlacesApiKey, 
  googleCloudCredentials 
}: PlaceMoodManagerProps) {
  const [placeIdInput, setPlaceIdInput] = useState('');
  const [batchPlaceIds, setBatchPlaceIds] = useState('');

  const {
    isLoading,
    error,
    places,
    moodStats,
    enhanceSinglePlace,
    enhanceMultiplePlaces,
    clearPlaces,
    clearError,
    getMoodCategory,
    getRandomMoodLabel
  } = usePlaceMood({
    googlePlacesApiKey,
    googleCloudCredentials
  });

  const {
    moodFilter,
    setMoodFilter,
    searchQuery,
    setSearchQuery,
    filteredPlaces,
    totalResults
  } = useMoodFiltering(places);

  // Handle single place enhancement
  const handleEnhanceSinglePlace = async () => {
    if (!placeIdInput.trim()) {
      Alert.alert('Error', 'Please enter a place ID');
      return;
    }

    const result = await enhanceSinglePlace(placeIdInput.trim());
    if (result) {
      setPlaceIdInput('');
      Alert.alert(
        'Success!', 
        `Enhanced ${result.name} with mood: ${result.final_mood}`
      );
    }
  };

  // Handle batch place enhancement
  const handleEnhanceBatchPlaces = async () => {
    if (!batchPlaceIds.trim()) {
      Alert.alert('Error', 'Please enter place IDs (one per line)');
      return;
    }

    const placeIds = batchPlaceIds
      .split('\n')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    if (placeIds.length === 0) {
      Alert.alert('Error', 'No valid place IDs found');
      return;
    }

    const results = await enhanceMultiplePlaces(placeIds);
    setBatchPlaceIds('');
    Alert.alert(
      'Batch Complete!', 
      `Enhanced ${results.length} out of ${placeIds.length} places`
    );
  };

  // Get mood color
  const getMoodColor = (moodScore?: number): string => {
    if (moodScore === undefined) return '#999';
    if (moodScore >= 70) return '#FF6B6B'; // Hype - Red
    if (moodScore <= 30) return '#4ECDC4'; // Chill - Teal
    return '#45B7D1'; // Neutral - Blue
  };

  // Get mood emoji
  const getMoodEmoji = (moodScore?: number): string => {
    if (moodScore === undefined) return '❓';
    if (moodScore >= 70) return '🔥'; // Hype
    if (moodScore <= 30) return '😌'; // Chill
    return '⚖️'; // Neutral
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Place Mood Manager</Text>
        <Text style={styles.subtitle}>
          Enhanced place discovery with AI-powered mood analysis
        </Text>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.clearErrorButton}>
            <Text style={styles.clearErrorText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Single Place Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Enhance Single Place</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Google Place ID"
          value={placeIdInput}
          onChangeText={setPlaceIdInput}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleEnhanceSinglePlace}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Enhance Place</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Batch Places Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Batch Enhance Places</Text>
        <TextInput
          style={[styles.textInput, styles.multilineInput]}
          placeholder="Enter Place IDs (one per line)"
          value={batchPlaceIds}
          onChangeText={setBatchPlaceIds}
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleEnhanceBatchPlaces}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Enhance Batch</Text>
        </TouchableOpacity>
      </View>

      {/* Mood Statistics */}
      {moodStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mood Statistics</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{moodStats.total}</Text>
              <Text style={styles.statLabel}>Total Places</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#4ECDC4' }]}>
                {moodStats.chill}
              </Text>
              <Text style={styles.statLabel}>Chill</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#45B7D1' }]}>
                {moodStats.neutral}
              </Text>
              <Text style={styles.statLabel}>Neutral</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#FF6B6B' }]}>
                {moodStats.hype}
              </Text>
              <Text style={styles.statLabel}>Hype</Text>
            </View>
          </View>
          <Text style={styles.averageScore}>
            Average Mood Score: {moodStats.averageScore}
          </Text>
        </View>
      )}

      {/* Filters */}
      {places.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter & Search</Text>
          
          {/* Search Input */}
          <TextInput
            style={styles.textInput}
            placeholder="Search places..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Mood Filter Buttons */}
          <View style={styles.filterContainer}>
            {(['all', 'chill', 'neutral', 'hype'] as const).map(filter => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  moodFilter === filter && styles.filterButtonActive
                ]}
                onPress={() => setMoodFilter(filter)}
              >
                <Text style={[
                  styles.filterButtonText,
                  moodFilter === filter && styles.filterButtonTextActive
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.resultsCount}>
            Showing {totalResults} of {places.length} places
          </Text>
        </View>
      )}

      {/* Places List */}
      {filteredPlaces.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Enhanced Places</Text>
            <TouchableOpacity onPress={clearPlaces} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          {filteredPlaces.map((place, index) => (
            <PlaceCard
              key={place.place_id}
              place={place}
              moodColor={getMoodColor(place.mood_score)}
              moodEmoji={getMoodEmoji(place.mood_score)}
              getMoodCategory={getMoodCategory}
            />
          ))}
        </View>
      )}

      {/* Empty State */}
      {places.length === 0 && !isLoading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No places enhanced yet. Enter a Google Place ID above to get started!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// Individual Place Card Component
interface PlaceCardProps {
  place: PlaceData;
  moodColor: string;
  moodEmoji: string;
  getMoodCategory: (score: number) => 'chill' | 'neutral' | 'hype';
}

const PlaceCard: React.FC<PlaceCardProps> = ({ 
  place, 
  moodColor, 
  moodEmoji, 
  getMoodCategory 
}) => {
  return (
    <View style={styles.placeCard}>
      <View style={styles.placeHeader}>
        <View style={styles.placeNameContainer}>
          <Text style={styles.placeName}>{place.name}</Text>
          <Text style={styles.placeCategory}>{place.category}</Text>
        </View>
        <View style={styles.moodContainer}>
          <Text style={styles.moodEmoji}>{moodEmoji}</Text>
          <Text style={[styles.moodScore, { color: moodColor }]}>
            {place.mood_score}
          </Text>
        </View>
      </View>

      <Text style={styles.placeAddress}>{place.address}</Text>

      <View style={styles.placeDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Final Mood:</Text>
          <Text style={[styles.detailValue, { color: moodColor }]}>
            {place.final_mood}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category:</Text>
          <Text style={styles.detailValue}>
            {place.mood_score ? getMoodCategory(place.mood_score) : 'Unknown'}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Rating:</Text>
          <Text style={styles.detailValue}>
            {place.rating}/5 ({place.user_ratings_total} reviews)
          </Text>
        </View>

        {place.current_busyness !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Busyness:</Text>
            <Text style={styles.detailValue}>{place.current_busyness}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFE6E6',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#CC0000',
    fontSize: 14,
    flex: 1,
  },
  clearErrorButton: {
    padding: 8,
  },
  clearErrorText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  averageScore: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  resultsCount: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF4444',
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  placeCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  placeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  placeNameContainer: {
    flex: 1,
  },
  placeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  moodContainer: {
    alignItems: 'center',
    marginLeft: 16,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  placeDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    margin: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});