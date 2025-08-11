import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAPIKey } from '../../shared/constants/config/api-keys';

interface APIStatusProps {
  isVisible?: boolean;
}

export default function APIStatus({ isVisible = false }: APIStatusProps) {
  const [apiStatus, setApiStatus] = useState<'checking' | 'working' | 'fallback' | 'error'>('checking');

  useEffect(() => {
    if (!isVisible) return;

    const checkAPIStatus = async () => {
      try {
        const GOOGLE_API_KEY = getAPIKey.places();
        const params = new URLSearchParams({
          location: '14.5995,120.9842',
          radius: '5000',
          type: 'restaurant',
          key: GOOGLE_API_KEY
        });

        const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`);
        const data = await response.json();

        if (data.status === 'OK') {
          setApiStatus('working');
        } else if (data.status === 'REQUEST_DENIED') {
          setApiStatus('fallback');
        } else {
          setApiStatus('error');
        }
      } catch {
        setApiStatus('fallback');
      }
    };

    checkAPIStatus();
  }, [isVisible]);

  if (!isVisible) return null;

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'working': return '#4CAF50';
      case 'fallback': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'working': return 'API: Real Places';
      case 'fallback': return 'API: Local Data';
      case 'error': return 'API: Error';
      default: return 'API: Checking...';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
