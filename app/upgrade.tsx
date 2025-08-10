import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Check, 
  Star, 
  MapPin,
  Heart,
  Users
} from 'lucide-react-native';
import { Zap, Infinity } from 'lucide-react-native';
import { useAuth } from '../hooks/use-auth';


export default function UpgradeScreen() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, upgradeToPremium } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!isAuthenticated) {
      router.push('/auth');
      return;
    }

    setIsUpgrading(true);
    
    try {
      const result = await upgradeToPremium();
      if (result.success) {
        Alert.alert(
          'Welcome to Premium!',
          'You now have unlimited tries and access to all premium features.',
          [
            {
              text: 'Start Exploring',
              onPress: () => router.replace('/')
            }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to upgrade to premium');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const features = [
    {
      icon: <Infinity size={24} color="#8B5FBF" />,
      title: 'Unlimited Tries',
      description: 'Generate as many suggestions as you want, anytime'
    },
    {
      icon: <MapPin size={24} color="#8B5FBF" />,
      title: 'Priority Locations',
      description: 'Get access to exclusive and premium venues'
    },
    {
      icon: <Heart size={24} color="#8B5FBF" />,
      title: 'Save Favorites',
      description: 'Bookmark your favorite places for easy access'
    },
    {
      icon: <Users size={24} color="#8B5FBF" />,
      title: 'Group Planning',
      description: 'Plan activities with friends and share suggestions'
    },
    {
      icon: <Star size={24} color="#8B5FBF" />,
      title: 'Premium Support',
      description: 'Get priority customer support and assistance'
    },
    {
      icon: <Zap size={24} color="#8B5FBF" />,
      title: 'Early Access',
      description: 'Be the first to try new features and updates'
    }
  ];

  if (user && user.isPremium) {
    return (
      <LinearGradient
        colors={['#C8A8E9', '#B19CD9']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.premiumActiveContainer}>
          <View style={styles.premiumBadge}>
            <Star size={32} color="#FFD700" />
          </View>
          <Text style={styles.premiumActiveTitle}>Premium Active</Text>
          <Text style={styles.premiumActiveText}>
            You&apos;re enjoying all the premium features! Thank you for supporting G!
          </Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Your Premium Benefits:</Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.benefitItem}>
                <Check size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>{feature.title}</Text>
              </View>
            ))}
          </View>
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
          <Text style={styles.headerTitle}>Upgrade to Premium</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroIcon}>
            <Zap size={48} color="#FFD700" />
          </View>
          <Text style={styles.heroTitle}>Unlock Unlimited G!</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited tries and discover amazing places without limits
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Premium Features</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                {feature.icon}
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.pricingCard}>
            <Text style={styles.pricingTitle}>Premium Plan</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₱299</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <Text style={styles.pricingDescription}>
              Cancel anytime • 7-day free trial
            </Text>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={[styles.upgradeButton, isUpgrading && styles.disabledButton]}
            onPress={handleUpgrade}
            disabled={isUpgrading}
          >
            <Text style={styles.upgradeButtonText}>
              {isUpgrading ? 'Processing...' : 'Start Free Trial'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            This is a demo app. No actual payment will be processed.
          </Text>
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
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 24,
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
    paddingTop: 4,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  pricingSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  pricingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8B5FBF',
  },
  pricingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 36,
    fontWeight: '700',
    color: '#8B5FBF',
  },
  pricePeriod: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  pricingDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  ctaSection: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  upgradeButton: {
    backgroundColor: '#8B5FBF',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    marginBottom: 16,
    minWidth: 200,
  },
  disabledButton: {
    opacity: 0.6,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  premiumActiveContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  premiumBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  premiumActiveTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  premiumActiveText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  benefitsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  spacer: {
    height: 32,
  },
});