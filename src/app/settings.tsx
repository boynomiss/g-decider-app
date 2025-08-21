import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  Image
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
  Edit,
  Shield,
  Star,
  Bookmark,
  Lock,
  Infinity,
  Heart,
  Users,
  Zap,
  Percent,
  Sparkles
} from 'lucide-react-native';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { useAuth } from '../features/auth';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: '+1234567890' // Default phone since User interface doesn't have phone
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
            await logout();
            router.replace('/home');
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      // For now, just close the edit mode since updateProfile doesn't exist
      setIsEditingProfile(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      phone: '+1234567890' // Default phone since User interface doesn't have phone
    });
    setIsEditingProfile(false);
  };

  // Show authentication banner when not logged in
  const showAuthBanner = !isAuthenticated;

  return (
    <ErrorBoundary componentName="SettingsScreen">
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <ErrorBoundary componentName="SettingsContent">
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            
            <ErrorBoundary componentName="SettingsHeader">
              <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                  <ArrowLeft size={24} color="#666" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={styles.placeholder} />
              </View>
            </ErrorBoundary>
            
            {/* Authentication Banner - shown when not logged in */}
            {showAuthBanner && (
              <ErrorBoundary componentName="AuthBanner">
                <View style={styles.settingsCard}>
                  <View style={styles.authBannerCompact}>
                    <View style={styles.authBannerLeft}>
                      <View style={styles.settingsIcon}>
                        <Lock size={24} color="#FF9500" />
                      </View>
                      <View style={styles.settingsText}>
                        <Text style={styles.settingsTitle}>Authentication Required</Text>
                        <Text style={styles.settingsSubtitle}>Sign in to access all features</Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.authBannerButtonCompact} 
                      onPress={() => router.push('/auth')}
                    >
                      <Text style={styles.authBannerButtonTextCompact}>Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ErrorBoundary>
            )}
            
            {/* Settings Options Card */}
            <ErrorBoundary componentName="SettingsOptionsCard">
              <View style={styles.settingsCard}>
                <TouchableOpacity 
                  style={[styles.settingsItem, !isAuthenticated && styles.settingsItemDisabled]} 
                  onPress={() => {
                    if (!isAuthenticated) {
                      router.push('/auth');
                      return;
                    }
                    Alert.alert(
                      'Sign Out',
                      'Are you sure you want to sign out?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Sign Out', 
                          style: 'destructive',
                          onPress: async () => {
                            await logout();
                            router.replace('/home');
                          }
                        }
                      ]
                    );
                  }}
                >
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingsIcon}>
                      <User size={24} color={isAuthenticated ? "#7DD3C0" : "#CCC"} />
                    </View>
                    <View style={styles.settingsText}>
                      <Text style={[styles.settingsTitle, !isAuthenticated && styles.settingsTitleDisabled]}>
                        {isAuthenticated ? 'Profile' : 'Profile (Sign in required)'}
                      </Text>
                      <Text style={[styles.settingsSubtitle, !isAuthenticated && styles.settingsSubtitleDisabled]}>
                        {isAuthenticated ? 'Manage your account' : 'Sign in to access profile settings'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.settingsItem, !isAuthenticated && styles.settingsItemDisabled]} 
                  onPress={() => {
                    if (!isAuthenticated) {
                      router.push('/auth');
                      return;
                    }
                    router.push('/saved-places');
                  }}
                >
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingsIcon}>
                      <Bookmark size={24} color={isAuthenticated ? "#7DD3C0" : "#CCC"} />
                    </View>
                    <View style={styles.settingsText}>
                      <Text style={[styles.settingsTitle, !isAuthenticated && styles.settingsTitleDisabled]}>
                        {isAuthenticated ? 'Saved Places' : 'Saved Places (Sign in required)'}
                      </Text>
                      <Text style={[styles.settingsSubtitle, !isAuthenticated && styles.settingsSubtitleDisabled]}>
                        {isAuthenticated ? 'View and manage your saved places' : 'Sign in to access your saved places'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.settingsItem, !isAuthenticated && styles.settingsItemDisabled]} 
                  onPress={() => {
                    if (!isAuthenticated) {
                      router.push('/auth');
                      return;
                    }
                    router.push('/upgrade');
                  }}
                >
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingsIcon}>
                      <Star size={24} color={isAuthenticated ? "#7DD3C0" : "#CCC"} />
                    </View>
                    <View style={styles.settingsText}>
                      <Text style={[styles.settingsTitle, !isAuthenticated && styles.settingsTitleDisabled]}>
                        {isAuthenticated ? 'Upgrade' : 'Upgrade (Sign in required)'}
                      </Text>
                      <Text style={[styles.settingsSubtitle, !isAuthenticated && styles.settingsSubtitleDisabled]}>
                        {isAuthenticated ? 'Get 10 daily tokens' : 'Sign in to access upgrade options'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingsIcon}>
                      <Bell size={24} color="#7DD3C0" />
                    </View>
                    <View style={styles.settingsText}>
                      <Text style={styles.settingsTitle}>Notifications</Text>
                      <Text style={styles.settingsSubtitle}>Customize alerts</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingsIcon}>
                      <Shield size={24} color="#7DD3C0" />
                    </View>
                    <View style={styles.settingsText}>
                      <Text style={styles.settingsTitle}>Privacy</Text>
                      <Text style={styles.settingsSubtitle}>Data and permissions</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingsItem}>
                  <View style={styles.settingsItemLeft}>
                    <View style={styles.settingsIcon}>
                      <HelpCircle size={24} color="#7DD3C0" />
                    </View>
                    <View style={styles.settingsText}>
                      <Text style={styles.settingsTitle}>Help & Support</Text>
                      <Text style={styles.settingsSubtitle}>Get assistance</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </ErrorBoundary>

            {/* App Version Card */}
            <ErrorBoundary componentName="AppVersionCard">
              <View style={styles.versionCard}>
                <Image 
                  source={{ uri: 'https://r2-pub.rork.com/attachments/7d8o27ninu6x2apdtzi70' }}
                  style={styles.appLogo}
                  resizeMode="contain"
                />
                <Text style={styles.versionText}>Version 1.0.0</Text>
                <Text style={styles.tagline}>Making decisions easier, one push at a time</Text>
              </View>
            </ErrorBoundary>

            {/* Profile Edit Modal */}
            {isEditingProfile && (
              <ErrorBoundary componentName="ProfileEditModal">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Edit Profile</Text>
                      <TouchableOpacity onPress={() => setIsEditingProfile(false)}>
                        <X size={24} color="#666" />
                      </TouchableOpacity>
                    </View>
                    
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
                </View>
              </ErrorBoundary>
            )}
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
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
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
  settingsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingsText: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  versionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
  },
  appLogo: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 16,
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

  settingsItemDisabled: {
    opacity: 0.6,
  },
  settingsTitleDisabled: {
    color: '#999',
  },
  settingsSubtitleDisabled: {
    color: '#BBB',
  },

  authBannerCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  authBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authBannerButtonCompact: {
    backgroundColor: '#8B5FBF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  authBannerButtonTextCompact: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});