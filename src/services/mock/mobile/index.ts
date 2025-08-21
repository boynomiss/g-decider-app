// Mock Mobile Services
// Replace real mobile service calls with mock data for UI development

export const mockLocationService = {
  getCurrentLocation: async () => ({
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    timestamp: new Date().toISOString()
  }),
  
  requestLocationPermission: async () => ({
    granted: true,
    permission: 'granted',
    timestamp: new Date().toISOString()
  }),
  
  watchLocation: (callback: (location: any) => void) => {
    // Mock location updates every 5 seconds
    const interval = setInterval(() => {
      callback({
        latitude: 37.7749 + (Math.random() - 0.5) * 0.01,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.01,
        accuracy: 10,
        timestamp: new Date().toISOString()
      });
    }, 5000);
    
    return () => clearInterval(interval);
  },
  
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Mock distance calculation
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
               Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
};

export const mockDeviceService = {
  getDeviceInfo: () => ({
    platform: 'ios',
    version: '17.0',
    model: 'iPhone 15 Pro',
    screenWidth: 393,
    screenHeight: 852,
    pixelRatio: 3
  }),
  
  getNetworkStatus: async () => ({
    isConnected: true,
    type: 'wifi',
    strength: 'strong'
  }),
  
  requestPermissions: async (permissions: string[]) => ({
    granted: permissions.reduce((acc, perm) => ({ ...acc, [perm]: true }), {}),
    timestamp: new Date().toISOString()
  }),
  
  vibrate: (pattern: number | number[]) => ({
    success: true,
    pattern,
    timestamp: new Date().toISOString()
  })
};

export const mockPushNotificationService = {
  requestPermission: async () => ({
    granted: true,
    permission: 'granted'
  }),
  
  getToken: async () => 'mock_push_token_12345',
  
  subscribeToTopic: async (topic: string) => ({
    success: true,
    topic,
    subscribedAt: new Date().toISOString()
  }),
  
  unsubscribeFromTopic: async (topic: string) => ({
    success: true,
    topic,
    unsubscribedAt: new Date().toISOString()
  })
};
