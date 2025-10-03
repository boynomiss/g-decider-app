/**
 * MVP Results Screen - Display filtered places from Firebase
 */

import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

import { 
  ResultsLayout, 
  PlaceImageCarousel, 
  PlaceInfoCard 
} from '../components';
import { useMVPStore } from '../store/mvp-store';
import { Place } from '../types/mvp-types';

export default function MVPResultsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { 
    filteredPlaces, 
    totalResults, 
    isLoading, 
    error, 
    clearError,
    fetchAllPlaces 
  } = useMVPStore();
  
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Fetch places if none available
  useEffect(() => {
    if (filteredPlaces.length === 0) {
      fetchAllPlaces();
    }
  }, [filteredPlaces.length, fetchAllPlaces]);

  const currentPlace = filteredPlaces[currentPlaceIndex];

  const handlePass = () => {
    // Move to next place
    if (currentPlaceIndex < filteredPlaces.length - 1) {
      setCurrentPlaceIndex(currentPlaceIndex + 1);
      setIsSaved(false);
    } else {
      // No more places, go back to home
      router.push('/mvp-home');
    }
  };

  const handleRestart = () => {
    // Navigate back to home to restart search
    router.push('/mvp-home');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    console.log(isSaved ? 'Unsaved:' : 'Saved:', currentPlace?.name);
  };

  const handleViewInMaps = () => {
    // Handle view in maps action
    console.log('View in maps:', currentPlace?.name);
  };

  const handleContact = () => {
    // Handle contact action
    console.log('Contact:', currentPlace?.name);
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#C8A8E9" />
        <Text style={styles.loadingText}>Finding perfect places for you...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={clearError}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.homeButton} onPress={handleRestart}>
          <Text style={styles.homeButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show no results state
  if (filteredPlaces.length === 0) {
    return (
      <View style={styles.noResultsContainer}>
        <StatusBar style="light" />
        <Text style={styles.noResultsTitle}>No places found</Text>
        <Text style={styles.noResultsMessage}>
          Try adjusting your preferences or check back later for new places.
        </Text>
        <TouchableOpacity style={styles.homeButton} onPress={handleRestart}>
          <Text style={styles.homeButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Ensure we have a current place
  if (!currentPlace) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar style="light" />
        <Text style={styles.errorTitle}>Place not found</Text>
        <Text style={styles.errorMessage}>The selected place could not be loaded.</Text>
        <TouchableOpacity style={styles.homeButton} onPress={handleRestart}>
          <Text style={styles.homeButtonText}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ResultsLayout topInset={insets.top}>
      <StatusBar style="light" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Found {totalResults} places</Text>
          <Text style={styles.resultsSubtitle}>
            Place {currentPlaceIndex + 1} of {filteredPlaces.length}
          </Text>
        </View>

        {/* Place Image Carousel */}
        <PlaceImageCarousel 
          heroImage={currentPlace.images?.hero || ''}
          galleryImages={currentPlace.images?.gallery || []}
        />

        {/* Place Information Card */}
        <PlaceInfoCard
          placeName={currentPlace.name}
          address={currentPlace.location.address}
          priceRange={currentPlace.businessInfo.priceRange}
          rating="4.5"
          description={currentPlace.description}
          onViewInMaps={handleViewInMaps}
          onContact={handleContact}
          onPass={handlePass}
          onRestart={handleRestart}
          onSave={handleSave}
          isSaved={isSaved}
        />
      </ScrollView>
    </ResultsLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#C8A8E9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  homeButton: {
    backgroundColor: '#6C757D',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noResultsMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});
