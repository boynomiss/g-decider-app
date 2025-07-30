import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { Settings, User } from 'lucide-react-native';
import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const { user, isAuthenticated } = useAuth();

  const handleAvatarPress = () => {
    if (isAuthenticated) {
      router.push('/settings');
    } else {
      router.push('/auth');
    }
  };

  const handleSettingsPress = () => {
    router.push('/settings');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.avatar} onPress={handleAvatarPress}>
        {isAuthenticated && user?.name ? (
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        ) : (
          <User size={20} color="#666" />
        )}
      </TouchableOpacity>
      
      <Image 
        source={{ uri: 'https://r2-pub.rork.com/attachments/7d8o27ninu6x2apdtzi70' }}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <TouchableOpacity style={styles.settingsButton} onPress={handleSettingsPress}>
        <Settings size={24} color="#666" />
      </TouchableOpacity>
    </View>
  );
}

const SECTION_SPACING = 16;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: SECTION_SPACING,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
  },
  logo: {
    width: 40,
    height: 40,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});