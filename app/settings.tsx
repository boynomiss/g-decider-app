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
  Edit,
  Bookmark
} from 'lucide-react-native';
import Shield from 'lucide-react-native/dist/esm/icons/shield';
import CreditCard from 'lucide-react-native/dist/esm/icons/credit-card';
import LogOut from 'lucide-react-native/dist/esm/icons/log-out';
import ChevronRight from 'lucide-react-native/dist/esm/icons/chevron-right';
import { useAuth } from '../hooks/use-auth';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, signOut, updateProfile } = useAuth();
  
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
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setIsEditingProfile(false);
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        Alert.alert('Error', result.error || 'Failed to update profile');
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
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

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
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#C8A8E9', '#B19CD9']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile</Text>
            {!isEditingProfile && (
              <TouchableOpacity onPress={() => setIsEditingProfile(true)}>
                <Edit size={20} color="#8B5FBF" />
              </TouchableOpacity>
            )}
          </View>

          {isEditingProfile ? (
            <View style={styles.editContainer}>
              <View style={styles.inputContainer}>
                <User size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={profileData.name}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, name: text }))}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Phone size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  value={profileData.phone}
                  onChangeText={(text) => setProfileData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <X size={16} color="#666" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Check size={16} color="white" />
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View>
              <View style={styles.profileItem}>
                <User size={20} color="#666" />
                <Text style={styles.profileText}>{user?.name || 'Not set'}</Text>
              </View>
              <View style={styles.profileItem}>
                <Phone size={20} color="#666" />
                <Text style={styles.profileText}>{user?.phone || 'Not set'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Account Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Plan:</Text>
            <Text style={[
              styles.statusValue,
              user?.isPremium ? styles.premiumStatus : styles.freeStatus
            ]}>
              {user?.isPremium ? 'Premium' : 'Free'}
            </Text>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Bell size={20} color="#666" />
              <Text style={styles.settingText}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#ccc', true: '#8B5FBF' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/saved-places')}
          >
            <View style={styles.menuLeft}>
              <Bookmark size={20} color="#666" />
              <Text style={styles.menuText}>Saved Places</Text>
            </View>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/upgrade')}
          >
            <View style={styles.menuLeft}>
              <CreditCard size={20} color="#666" />
              <Text style={styles.menuText}>
                {user?.isPremium ? 'Manage Premium' : 'Upgrade to Premium'}
              </Text>
            </View>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Shield size={20} color="#666" />
              <Text style={styles.menuText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <HelpCircle size={20} color="#666" />
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
            <View style={styles.menuLeft}>
              <LogOut size={20} color="#FF6B6B" />
              <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
            </View>
            <ChevronRight size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
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
});