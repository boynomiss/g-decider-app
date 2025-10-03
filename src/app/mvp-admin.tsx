/**
 * MVP Admin Panel - Manage places library
 */

import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { Place } from '../types/mvp-types';
import { PlacesService } from '../services/mvp/firebase-service';
import { LOOKING_FOR_CATEGORIES } from '../config/mvp-config';

export default function MVPAdminScreen() {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'food',
    description: '',
    address: '',
    city: '',
    lat: '',
    lng: '',
    phone: '',
    website: '',
    hours: '',
    priceRange: '₱₱',
    features: '',
    heroImage: '',
    tags: '',
    perfectFor: '',
    moodScore: '50',
    uniqueFeatures: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name || !formData.description || !formData.address || !formData.city) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Create place object
      const newPlace: Omit<Place, 'id' | 'metadata'> = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          lat: parseFloat(formData.lat) || 0,
          lng: parseFloat(formData.lng) || 0,
        },
        contact: {
          ...(formData.phone && { phone: formData.phone }),
          ...(formData.website && { website: formData.website }),
        },
        businessInfo: {
          ...(formData.hours && { hours: formData.hours }),
          priceRange: formData.priceRange as '₱' | '₱₱' | '₱₱₱' | '₱₱₱₱',
          features: formData.features ? formData.features.split(',').map(f => f.trim()) : [],
        },
        images: {
          hero: formData.heroImage || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
          gallery: [],
        },
        discovery: {
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
          perfectFor: formData.perfectFor ? formData.perfectFor.split(',').map(p => p.trim()) : [],
          moodScore: parseInt(formData.moodScore) || 50,
          ...(formData.uniqueFeatures && { uniqueFeatures: formData.uniqueFeatures }),
        },
      };

      // Save to Firebase database
      const placeId = await PlacesService.addPlace(newPlace);
      
      Alert.alert(
        'Success!', 
        `Place "${formData.name}" has been added successfully with ID: ${placeId}`,
        [{ text: 'OK', onPress: () => resetForm() }]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Failed to add place. Please try again.');
      console.error('Error adding place:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'food',
      description: '',
      address: '',
      city: '',
      lat: '',
      lng: '',
      phone: '',
      website: '',
      hours: '',
      priceRange: '₱₱',
      features: '',
      heroImage: '',
      tags: '',
      perfectFor: '',
      moodScore: '50',
      uniqueFeatures: '',
    });
    setShowForm(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>MVP Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Manage places for your editorial team</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowForm(!showForm)}
          >
            <Text style={styles.actionButtonText}>
              {showForm ? 'Cancel' : '➕ Add New Place'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Place Form */}
        {showForm && (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add New Place</Text>
            
            {/* Basic Information */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Place Name *"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
              />
              
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Category *</Text>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                  style={styles.picker}
                >
                  {LOOKING_FOR_CATEGORIES.map(category => (
                    <Picker.Item 
                      key={category.id} 
                      label={`${category.icon} ${category.name}`} 
                      value={category.id} 
                    />
                  ))}
                </Picker>
              </View>
              
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description *"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Location */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Address *"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
              />
              
              <TextInput
                style={styles.input}
                placeholder="City *"
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
              />
              
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Latitude"
                  value={formData.lat}
                  onChangeText={(value) => handleInputChange('lat', value)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Longitude"
                  value={formData.lng}
                  onChangeText={(value) => handleInputChange('lng', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Contact & Business */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Contact & Business</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                keyboardType="phone-pad"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Website"
                value={formData.website}
                onChangeText={(value) => handleInputChange('website', value)}
                keyboardType="url"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Business Hours"
                value={formData.hours}
                onChangeText={(value) => handleInputChange('hours', value)}
              />
              
              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Price Range</Text>
                <Picker
                  selectedValue={formData.priceRange}
                  onValueChange={(value) => handleInputChange('priceRange', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="₱ (Budget)" value="₱" />
                  <Picker.Item label="₱₱ (Affordable)" value="₱₱" />
                  <Picker.Item label="₱₱₱ (Mid-range)" value="₱₱₱" />
                  <Picker.Item label="₱₱₱₱ (Premium)" value="₱₱₱₱" />
                </Picker>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder="Features (comma-separated)"
                value={formData.features}
                onChangeText={(value) => handleInputChange('features', value)}
              />
            </View>

            {/* Discovery */}
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Discovery</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Hero Image URL"
                value={formData.heroImage}
                onChangeText={(value) => handleInputChange('heroImage', value)}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Tags (comma-separated)"
                value={formData.tags}
                onChangeText={(value) => handleInputChange('tags', value)}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Perfect For (comma-separated)"
                value={formData.perfectFor}
                onChangeText={(value) => handleInputChange('perfectFor', value)}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Mood Score (1-100)"
                value={formData.moodScore}
                onChangeText={(value) => handleInputChange('moodScore', value)}
                keyboardType="numeric"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Unique Features"
                value={formData.uniqueFeatures}
                onChangeText={(value) => handleInputChange('uniqueFeatures', value)}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Add Place</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Placeholder for existing places list */}
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Places management dashboard will be implemented here
          </Text>
          <Text style={styles.placeholderSubtext}>
            View, edit, and delete existing places
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  quickActions: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#C8A8E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
