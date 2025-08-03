import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../hooks/use-app-store';
import { useAuth } from '../hooks/use-auth';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Extracted form input component
const FormInput = React.memo(({ 
  value, 
  onChangeText, 
  placeholder, 
  keyboardType = 'default' 
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'phone-pad';
}) => (
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#999"
      keyboardType={keyboardType}
    />
  </View>
));

// Extracted action buttons component
const ActionButtons = React.memo(({ onCancel, onConfirm }: {
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <View style={styles.actionButtons}>
    <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
      <Text style={styles.cancelButtonText}>Cancel</Text>
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
      <Text style={styles.confirmButtonText}>Confirm</Text>
    </TouchableOpacity>
  </View>
));

export default function BookingScreen() {
  const { currentSuggestion, effectiveFilters } = useAppStore();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Map social context to party size
  const getPartySizeFromSocialContext = useCallback((socialContext: string) => {
    switch (socialContext) {
      case 'solo': return 'Solo';
      case 'with-bae': return 'For two';
      case 'barkada': return 'For groups';
      default: return 'For two';
    }
  }, []);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    partySize: '',
    eta: '',
  });

  // Pre-populate form data when component mounts
  useEffect(() => {
    setFormData({
      name: (isAuthenticated && user && user.name) ? user.name : '',
      phone: (isAuthenticated && user && user.phone) ? user.phone : '',
      partySize: effectiveFilters ? getPartySizeFromSocialContext(effectiveFilters.socialContext) : 'For two',
      eta: '',
    });
  }, [isAuthenticated, user, effectiveFilters, getPartySizeFromSocialContext]);

  // Memoized handlers
  const handleConfirm = useCallback(() => {
    router.push('/confirmation');
  }, [router]);

  const handleCancel = useCallback(() => {
    router.push('/');
  }, [router]);

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  if (!currentSuggestion) {
    router.replace('/');
    return null;
  }

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
            <FormInput
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              placeholder="Full Name"
            />

            <FormInput
              value={formData.phone}
              onChangeText={(text) => handleInputChange('phone', text)}
              placeholder="Phone Number"
              keyboardType="phone-pad"
            />

            <FormInput
              value={formData.partySize}
              onChangeText={(text) => handleInputChange('partySize', text)}
              placeholder="For how many"
            />

            <FormInput
              value={formData.eta}
              onChangeText={(text) => handleInputChange('eta', text)}
              placeholder="Set ETA"
            />
          </View>

          <ActionButtons onCancel={handleCancel} onConfirm={handleConfirm} />
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
