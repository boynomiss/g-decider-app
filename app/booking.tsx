import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../hooks/use-app-store';
import { useAuth } from '../hooks/use-auth';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function BookingScreen() {
  const { currentSuggestion, effectiveFilters } = useAppStore();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Map social context to party size
  const getPartySizeFromSocialContext = (socialContext: string) => {
    switch (socialContext) {
      case 'solo': return 'Solo';
      case 'with-bae': return 'For two';
      case 'barkada': return 'For groups';
      default: return 'For two';
    }
  };
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    partySize: '',
    eta: '',
  });

  // Pre-populate form data when component mounts
  useEffect(() => {
    setFormData({
      name: (isAuthenticated && user?.name) ? user.name : '',
      phone: (isAuthenticated && user?.phone) ? user.phone : '',
      partySize: effectiveFilters ? getPartySizeFromSocialContext(effectiveFilters.socialContext) : 'For two',
      eta: '',
    });
  }, [isAuthenticated, user, effectiveFilters]);

  if (!currentSuggestion) {
    router.replace('/');
    return null;
  }

  const handleConfirm = () => {
    // Handle booking confirmation
    router.push('/confirmation');
  };

  const handleCancel = () => {
    router.push('/');
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
        <Header />
        
        <View style={styles.contentCard}>
          <Text style={styles.title}>{currentSuggestion.name}</Text>
          <Text style={styles.location}>{currentSuggestion.location}</Text>
          
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=250&fit=crop' }}
              style={styles.placeImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                placeholder="Full Name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                placeholder="Phone Number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.partySize}
                onChangeText={(text) => setFormData(prev => ({ ...prev, partySize: text }))}
                placeholder="For how many"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.eta}
                onChangeText={(text) => setFormData(prev => ({ ...prev, eta: text }))}
                placeholder="Set ETA"
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      <Footer />
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
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    margin: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  placeImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    fontSize: 16,
    color: '#4A4A4A',
    paddingVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5FBF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#8B5FBF',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#7DD3C0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
});
