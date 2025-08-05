import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../hooks/use-app-store';
import { ErrorBoundary } from '../components/ErrorBoundary';

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
  <ErrorBoundary componentName="FormInput">
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
  </ErrorBoundary>
));

// Extracted action buttons component
const ActionButtons = React.memo(({ onCancel, onConfirm }: {
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <ErrorBoundary componentName="ActionButtons">
    <View style={styles.actionButtons}>
      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  </ErrorBoundary>
));

export default function BookingScreen() {
  const { currentSuggestion, effectiveFilters } = useAppStore();
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
      name: '',
      phone: '',
      partySize: effectiveFilters ? getPartySizeFromSocialContext(effectiveFilters.socialContext) : 'For two',
      eta: '',
    });
  }, [effectiveFilters, getPartySizeFromSocialContext]);

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

  return (
    <ErrorBoundary componentName="BookingScreen">
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <ErrorBoundary componentName="Header">
          <Header />
        </ErrorBoundary>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <ErrorBoundary componentName="BookingContent">
            <View style={styles.content}>
              <ErrorBoundary componentName="PlaceInfo">
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName}>{currentSuggestion.name}</Text>
                  <Text style={styles.placeAddress}>{currentSuggestion.address}</Text>
                </View>
              </ErrorBoundary>

              <ErrorBoundary componentName="BookingForm">
                <View style={styles.form}>
                  <Text style={styles.formTitle}>Booking Details</Text>
                  
                  <FormInput
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Your Name"
                  />
                  
                  <FormInput
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="Phone Number"
                    keyboardType="phone-pad"
                  />
                  
                  <FormInput
                    value={formData.partySize}
                    onChangeText={(value) => handleInputChange('partySize', value)}
                    placeholder="Party Size"
                  />
                  
                  <FormInput
                    value={formData.eta}
                    onChangeText={(value) => handleInputChange('eta', value)}
                    placeholder="Estimated Arrival Time"
                  />
                </View>
              </ErrorBoundary>
            </View>
          </ErrorBoundary>
        </ScrollView>

        <ErrorBoundary componentName="ActionButtons">
          <ActionButtons onCancel={handleCancel} onConfirm={handleConfirm} />
        </ErrorBoundary>

        <ErrorBoundary componentName="Footer">
          <Footer />
        </ErrorBoundary>
      </LinearGradient>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  placeInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  placeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A4A',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeAddress: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: '#4A4A4A',
    paddingVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
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
