import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, RotateCcw, ThumbsUp, MapPin } from 'lucide-react-native';
import { useAppStore } from '@/hooks/use-app-store';
import Footer from '@/components/Footer';

const { width } = Dimensions.get('window');

export default function ResultScreen() {
  const { currentSuggestion, resetSuggestion, generateSuggestion, retriesLeft, isLoading, effectiveFilters, openInMaps } = useAppStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Show error state if no suggestion and not loading
  if (!currentSuggestion && !isLoading) {
    return (
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ color: '#FFF', fontSize: 22, marginBottom: 16, textAlign: 'center', fontWeight: 'bold' }}>
          No Results Found
        </Text>
        <Text style={{ color: '#FFF', fontSize: 16, marginBottom: 28, textAlign: 'center' }}>
          We couldn't find any suggestions that match all your filters. Would you like to broaden your search?
        </Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#7DD3C0', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25, marginBottom: 16 }}
          onPress={async () => {
            // Broaden search: relax budget and mood filters, keep others
            const { updateFilters, generateSuggestion } = useAppStore.getState();
            updateFilters({ budget: null, mood: 50 });
            await generateSuggestion();
          }}
        >
          <Text style={{ color: '#4A4A4A', fontSize: 16, fontWeight: '600' }}>Broaden Search</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 }}
          onPress={() => {
            console.log('🏠 Going back home from error state');
            router.replace('/');
          }}
        >
          <Text style={{ color: '#4A4A4A', fontSize: 16, fontWeight: '600' }}>Go Back Home</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // Show loading if still generating suggestion
  if (isLoading || !currentSuggestion) {
    return (
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      >
        <Text style={{ color: '#FFF', fontSize: 18, marginBottom: 20 }}>Generating suggestion...</Text>
      </LinearGradient>
    );
  }

  const handlePass = () => {
    console.log('🚫 Pass button pressed, resetting and going home');
    resetSuggestion();
    router.replace('/');
  };

  const handleRestart = async () => {
    if (retriesLeft > 0) {
      try {
        await generateSuggestion();
      } catch (error) {
        console.error('Error restarting suggestion:', error);
      }
    }
  };

  const handleBookNow = () => {
    console.log('📝 Book Now button pressed, navigating to booking');
    router.push('/booking');
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  const getBudgetDisplay = () => {
    const budgetMap = {
      'P': '₱',
      'PP': '₱₱', 
      'PPP': '₱₱₱'
    };
    // Use effective filters (what was actually used in generation) instead of user's selected filter
    const budgetToShow = effectiveFilters?.budget || currentSuggestion?.budget || 'PP';
    return budgetMap[budgetToShow];
  };

  const containerStyle = {
    ...styles.container,
    paddingTop: insets.top + 8,
  };

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={containerStyle}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {currentSuggestion.images.map((image, index) => (
              <TouchableOpacity key={index} onPress={() => handleImagePress(index)}>
                <Image
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.imageIndicator}>
            {currentSuggestion.images.map((_, index) => (
              <View key={index} style={styles.dot} />
            ))}
          </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.name}>{currentSuggestion.name}</Text>
          <Text style={styles.location}>{currentSuggestion.location}</Text>
          
          <View style={styles.budgetContainer}>
            <Text style={styles.budget}>{getBudgetDisplay()}</Text>
          </View>

          <View style={styles.tagsContainer}>
            {currentSuggestion.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.description}>{currentSuggestion.description}</Text>

          {currentSuggestion.discount && (
            <View style={styles.discountContainer}>
              <Text style={styles.discountText}>🎉 {currentSuggestion.discount}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.mapButton}
              onPress={() => openInMaps(currentSuggestion)}
            >
              <MapPin size={20} color="#8B5FBF" />
              <Text style={styles.mapButtonText}>View in Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.grabButton} onPress={handleBookNow}>
              <Text style={styles.grabButtonText}>Grab</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handlePass}>
              <X size={24} color="#FF6B6B" />
              <Text style={styles.actionText}>Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleRestart}
              disabled={retriesLeft <= 0}
            >
              <RotateCcw size={24} color="#666" />
              <Text style={styles.actionText}>Restart</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleBookNow}>
              <ThumbsUp size={24} color="#4CAF50" />
              <Text style={styles.actionText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <Footer />
      
      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            onPress={() => setImageModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                style={styles.modalImageScroll}
                contentOffset={{ x: selectedImageIndex * width, y: 0 }}
              >
                {currentSuggestion.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.modalImage}
                    resizeMode="contain"
                  />
                ))}
              </ScrollView>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setImageModalVisible(false)}
              >
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  imageScroll: {
    flex: 1,
  },
  image: {
    width: width - 32,
    height: 300,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 16,
    padding: 24,
    marginTop: -20,
    opacity: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  budgetContainer: {
    alignSelf: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
  },
  budget: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
    color: '#4A90A4',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  discountContainer: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  discountText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  mapButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5FBF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  mapButtonText: {
    fontSize: 16,
    color: '#8B5FBF',
    fontWeight: '600',
  },
  grabButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grabButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageScroll: {
    flex: 1,
    width: '100%',
  },
  modalImage: {
    width: width,
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
});