import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Bell, 
  HelpCircle, 
  Check,
  X,
  Edit
} from 'lucide-react-native';
import { Shield, CreditCard, LogOut, ChevronRight } from 'lucide-react-native';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  // Mock auth object - replace with actual auth hook
  const { user, isAuthenticated, signOut, updateProfile } = { 
    user: { name: 'John Doe', phone: '+1234567890' }, 
    isAuthenticated: false, 
    signOut: () => Promise.resolve(), 
    updateProfile: () => Promise.resolve({ success: true }) 
  };
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/home');
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile();
      if (result.success) {
        setIsEditingProfile(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditingProfile(false);
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary componentName="SettingsScreen">
        <LinearGradient
          colors={['#C8A8E9', '#B19CD9']}
          style={[styles.container, { paddingTop: insets.top }]}
        >
          <ErrorBoundary componentName="SettingsHeader">
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <ArrowLeft size={24} color="#666" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Settings</Text>
              <View style={styles.placeholder} />
            </View>
          </ErrorBoundary>

          <ErrorBoundary componentName="NotAuthenticatedContent">
            <View style={styles.notAuthenticatedContainer}>
              <Text style={styles.notAuthenticatedTitle}>Sign In Required</Text>
              <Text style={styles.notAuthenticatedText}>
                Please sign in to access your settings and manage your account.
              </Text>
              <TouchableOpacity 
                style={styles.signInButton} 
                onPress={() => router.push('/auth')}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ErrorBoundary>
        </LinearGradient>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary componentName="SettingsScreen">
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <ErrorBoundary componentName="SettingsHeader">
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={24} color="#666" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.placeholder} />
          </View>
        </ErrorBoundary>

        <ErrorBoundary componentName="SettingsContent">
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <ErrorBoundary componentName="ProfileSection">
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Profile</Text>
                <View style={styles.profileCard}>
                  {isEditingProfile ? (
                    <ErrorBoundary componentName="ProfileEditForm">
                      <View style={styles.editForm}>
                        <View style={styles.inputContainer}>
                          <User size={20} color="#666" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={profileData.name}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                            placeholder="Full Name"
                            placeholderTextColor="#999"
                          />
                        </View>
                        
                        <View style={styles.inputContainer}>
                          <Phone size={20} color="#666" style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            value={profileData.phone}
                            onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                            placeholder="Phone Number"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                          />
                        </View>
                        
                        <View style={styles.editActions}>
                          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                            <X size={20} color="#FF3B30" />
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                          </TouchableOpacity>
                          
                          <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                            <Check size={20} color="#34C759" />
                            <Text style={styles.saveButtonText}>Save</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ErrorBoundary>
                  ) : (
                    <ErrorBoundary componentName="ProfileDisplay">
                      <View style={styles.profileInfo}>
                        <View style={styles.profileHeader}>
                          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
                          <TouchableOpacity onPress={() => setIsEditingProfile(true)}>
                            <Edit size={20} color="#007AFF" />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.profilePhone}>{user?.phone || 'No phone number'}</Text>
                      </View>
                    </ErrorBoundary>
                  )}
                </View>
              </View>
            </ErrorBoundary>

            <ErrorBoundary componentName="PreferencesSection">
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.preferencesCard}>
                  <View style={styles.preferenceItem}>
                    <View style={styles.preferenceInfo}>
                      <Bell size={20} color="#666" />
                      <Text style={styles.preferenceText}>Push Notifications</Text>
                    </View>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: '#E5E5EA', true: '#34C759' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                </View>
              </View>
            </ErrorBoundary>

            <ErrorBoundary componentName="AccountSection">
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.accountCard}>
                  <TouchableOpacity style={styles.menuItem}>
                    <Shield size={20} color="#666" />
                    <Text style={styles.menuItemText}>Privacy Policy</Text>
                    <ChevronRight size={20} color="#666" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.menuItem}>
                    <HelpCircle size={20} color="#666" />
                    <Text style={styles.menuItemText}>Help & Support</Text>
                    <ChevronRight size={20} color="#666" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.menuItem}>
                    <CreditCard size={20} color="#666" />
                    <Text style={styles.menuItemText}>Billing</Text>
                    <ChevronRight size={20} color="#666" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                    <LogOut size={20} color="#FF3B30" />
                    <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>Sign Out</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ErrorBoundary>
          </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
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
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  editContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5FBF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumStatus: {
    color: '#4CAF50',
  },
  freeStatus: {
    color: '#8B5FBF',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  signOutText: {
    color: '#FF6B6B',
  },
  notAuthenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  notAuthenticatedTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  notAuthenticatedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  signInButton: {
    backgroundColor: '#8B5FBF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 32,
  },
  profileCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  profileInfo: {
    paddingVertical: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  profilePhone: {
    fontSize: 16,
    color: '#666',
  },
  editForm: {
    gap: 16,
  },
  preferencesCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  accountCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
});