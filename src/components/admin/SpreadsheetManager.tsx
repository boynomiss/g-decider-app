import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpc } from '../../../lib/trpc';

interface SpreadsheetManagerProps {
  onClose?: () => void;
}

export const SpreadsheetManager: React.FC<SpreadsheetManagerProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'view' | 'create'>('sync');
  const [selectedCollection, setSelectedCollection] = useState<'places' | 'users' | 'analytics' | 'partnerships'>('places');
  const [isLoading, setIsLoading] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');

  // OAuth state
  const [accessToken, setAccessToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cross-platform storage functions
  const storage = {
    async getItem(key: string): Promise<string | null> {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          return window.localStorage.getItem(key);
        } else {
          return await AsyncStorage.getItem(key);
        }
      } catch (error) {
        console.warn('Storage getItem error:', error);
        return null;
      }
    },
    async setItem(key: string, value: string): Promise<void> {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.localStorage.setItem(key, value);
        } else {
          await AsyncStorage.setItem(key, value);
        }
      } catch (error) {
        console.warn('Storage setItem error:', error);
      }
    },
    async removeItem(key: string): Promise<void> {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.localStorage.removeItem(key);
        } else {
          await AsyncStorage.removeItem(key);
        }
      } catch (error) {
        console.warn('Storage removeItem error:', error);
      }
    }
  };

  // Cross-platform URL utilities
  const urlUtils = {
    getSearchParams(): URLSearchParams | null {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          return new URLSearchParams(window.location.search);
        }
        return null;
      } catch (error) {
        console.warn('URL utils error:', error);
        return null;
      }
    },
    replaceState(path: string): void {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, path);
        }
      } catch (error) {
        console.warn('History replaceState error:', error);
      }
    },
    openUrl(url: string): void {
      try {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.open(url, '_blank');
        } else {
          Linking.openURL(url);
        }
      } catch (error) {
        console.warn('Open URL error:', error);
        // Fallback to Linking
        Linking.openURL(url);
      }
    }
  };

  const collections = [
    { key: 'places', label: 'Places', description: 'Restaurants, activities, and venues' },
    { key: 'users', label: 'Users', description: 'User accounts and preferences' },
    { key: 'analytics', label: 'Analytics', description: 'User behavior and app metrics' },
    { key: 'partnerships', label: 'Partnerships', description: 'Business partnerships and fees' }
  ];

  // OAuth authentication functions
  const startOAuthFlow = () => {
    const authUrl = 'http://localhost:3000/auth/google';
    Linking.openURL(authUrl);
  };

  const handleLogout = async () => {
    setAccessToken('');
    setIsAuthenticated(false);
    await storage.removeItem('google_access_token');
    await storage.removeItem('google_refresh_token');
    Alert.alert('Logged Out', 'You have been logged out of Google.');
  };

  // tRPC hooks - wrapped in try-catch to prevent crashes
  let createSpreadsheetMutation: any = null;
  let getSpreadsheetInfoQuery: any = null;

  try {
    createSpreadsheetMutation = trpc.spreadsheet.createSpreadsheet.useMutation();
    getSpreadsheetInfoQuery = trpc.spreadsheet.getSpreadsheetInfo.useQuery(
      { spreadsheetId: spreadsheetId || '' },
      { enabled: !!spreadsheetId }
    );
  } catch (error) {
    console.warn('tRPC hooks initialization error:', error);
  }

  // Check for OAuth callback in URL (for web)
  useEffect(() => {
    const checkOAuthAndTokens = async () => {
      try {
        if (Platform.OS === 'web') {
          const urlParams = urlUtils.getSearchParams();
          
          if (urlParams) {
            // Check for OAuth success with tokens
            if (urlParams.get('success') === 'true') {
              const accessToken = urlParams.get('access_token');
              const refreshToken = urlParams.get('refresh_token');
              
              if (accessToken) {
                setAccessToken(accessToken);
                setIsAuthenticated(true);
                
                // Store tokens for persistence
                await storage.setItem('google_access_token', accessToken);
                if (refreshToken) {
                  await storage.setItem('google_refresh_token', refreshToken);
                }
                
                // Clear URL parameters
                urlUtils.replaceState('/admin');
                
                Alert.alert('Success', 'Google authentication successful! You can now create spreadsheets.');
              }
            }
            
            // Check for OAuth errors
            if (urlParams.get('error')) {
              const error = urlParams.get('error');
              const details = urlParams.get('details');
              Alert.alert('Authentication Error', `Error: ${error}${details ? `\n\nDetails: ${details}` : ''}`);
              
              // Clear URL parameters
              urlUtils.replaceState('/admin');
            }
          }
        }
        
        // Check for stored tokens on component mount
        const storedToken = await storage.getItem('google_access_token');
        if (storedToken) {
          setAccessToken(storedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.warn('OAuth check error:', error);
      }
    };

    checkOAuthAndTokens();
  }, []);

  const handleSyncToSheets = async () => {
    if (!spreadsheetId) {
      Alert.alert('Error', 'Please create a spreadsheet first');
      return;
    }
    
    if (!isAuthenticated || !accessToken) {
      Alert.alert('Error', 'Please authenticate with Google first');
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Implement sync functionality with OAuth
      Alert.alert('Info', 'Sync functionality will be implemented next');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data to Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFromSheets = async () => {
    if (!spreadsheetId) {
      Alert.alert('Error', 'Please create a spreadsheet first');
      return;
    }
    
    if (!isAuthenticated || !accessToken) {
      Alert.alert('Error', 'Please authenticate with Google first');
      return;
    }
    
    setIsLoading(true);
    try {
      // TODO: Implement update functionality with OAuth
      Alert.alert('Info', 'Update functionality will be implemented next');
    } catch (error) {
      Alert.alert('Error', 'Failed to update data from Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    if (!isAuthenticated || !accessToken) {
      Alert.alert('Error', 'Please authenticate with Google first');
      return;
    }
    
    if (!createSpreadsheetMutation) {
      Alert.alert('Error', 'Spreadsheet creation service not available');
      return;
    }
    
    console.log('🔑 Creating spreadsheet with access token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NO TOKEN');
    
    setIsLoading(true);
    try {
      const requestBody = {
        title: 'G-Decider Database',
        collections: ['places', 'users', 'analytics', 'partnerships'] as ('places' | 'users' | 'analytics' | 'partnerships')[],
        accessToken: accessToken
      };
      
      console.log('📤 Sending request via tRPC:', requestBody);
      
      // Use tRPC mutation instead of direct fetch
      const result = await createSpreadsheetMutation.mutateAsync(requestBody);
      
      if (result.success) {
        setSpreadsheetId(result.spreadsheetId || '');
        Alert.alert(
          'Spreadsheet Created!', 
          `Your new spreadsheet is ready: ${result.spreadsheetUrl}`,
          [
            { text: 'Open in Browser', onPress: () => urlUtils.openUrl(result.spreadsheetUrl || '') },
            { text: 'OK', style: 'default' }
          ]
        );
      } else {
        // Enhanced error handling with more details
        const errorMessage = result.message || 'Failed to create spreadsheet';
        
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Spreadsheet creation error:', error);
      Alert.alert('Error', `Failed to create spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderSyncTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Sync Firebase Data to Google Sheets</Text>
      
      {!isAuthenticated ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>Google Authentication Required</Text>
          <Text style={styles.warningDescription}>
            You need to authenticate with Google to use spreadsheet features.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={startOAuthFlow}
          >
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      ) : !spreadsheetId ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>No spreadsheet configured</Text>
          <Text style={styles.warningDescription}>
            Please create a new spreadsheet first using the "Create New" tab.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setActiveTab('create')}
          >
            <Text style={styles.buttonText}>Create Spreadsheet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.collectionSelector}>
            <Text style={styles.label}>Select Collection:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {collections.map((collection) => (
                <TouchableOpacity
                  key={collection.key}
                  style={[
                    styles.collectionButton,
                    selectedCollection === collection.key && styles.collectionButtonActive
                  ]}
                  onPress={() => setSelectedCollection(collection.key as any)}
                >
                  <Text style={[
                    styles.collectionButtonText,
                    selectedCollection === collection.key && styles.collectionButtonTextActive
                  ]}>
                    {collection.label}
                  </Text>
                  <Text style={styles.collectionDescription}>{collection.description}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSyncToSheets}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Syncing...' : 'Sync to Google Sheets'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleUpdateFromSheets}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Updating...' : 'Update from Google Sheets'}
              </Text>
            </TouchableOpacity>
          </View>

          {getSpreadsheetInfoQuery?.data?.success && (
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Current Spreadsheet</Text>
              <Text style={styles.infoText}>{getSpreadsheetInfoQuery.data.title}</Text>
              <Text style={styles.infoText}>Sheets: {getSpreadsheetInfoQuery.data.sheetNames?.join(', ') || 'None'}</Text>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => urlUtils.openUrl(getSpreadsheetInfoQuery.data.spreadsheetUrl || '')}
              >
                <Text style={styles.linkButtonText}>Open in Google Sheets</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderCreateTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Create New Google Sheets Database</Text>
      <Text style={styles.description}>
        This will create a new Google Sheets spreadsheet with separate sheets for each collection.
        Each sheet will be pre-populated with the correct column headers based on your Firebase data structure.
      </Text>

      {!isAuthenticated ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>Google Authentication Required</Text>
          <Text style={styles.warningDescription}>
            You need to authenticate with Google to create spreadsheets. This allows the app to create
            spreadsheets in your Google Drive account.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={startOAuthFlow}
          >
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.successCard}>
            <Text style={styles.successText}>✅ Google Authentication Successful</Text>
            <Text style={styles.successDescription}>
              You're signed in and can create spreadsheets in your Google Drive.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, styles.createButton]}
            onPress={handleCreateSpreadsheet}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating...' : 'Create New Spreadsheet'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      <View style={styles.featuresList}>
        <Text style={styles.featuresTitle}>Features:</Text>
        <Text style={styles.featureItem}>• Separate sheet for each collection</Text>
        <Text style={styles.featureItem}>• Pre-configured column headers</Text>
        <Text style={styles.featureItem}>• Real-time sync with Firebase</Text>
        <Text style={styles.featureItem}>• Excel-like editing experience</Text>
        <Text style={styles.featureItem}>• Collaborative editing</Text>
      </View>
    </View>
  );

  const renderViewTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>View Spreadsheet Data</Text>
      <Text style={styles.description}>
        View and analyze your data directly from Google Sheets. This provides a familiar spreadsheet interface
        for data analysis, filtering, and reporting.
      </Text>

      {!isAuthenticated ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>Google Authentication Required</Text>
          <Text style={styles.warningDescription}>
            You need to authenticate with Google to view spreadsheet data.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={startOAuthFlow}
          >
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </View>
      ) : !spreadsheetId ? (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>No spreadsheet configured</Text>
          <Text style={styles.warningDescription}>
            Please create a new spreadsheet first using the "Create New" tab.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => setActiveTab('create')}
          >
            <Text style={styles.buttonText}>Create Spreadsheet</Text>
          </TouchableOpacity>
        </View>
      ) : getSpreadsheetInfoQuery?.data?.success ? (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Available Data</Text>
          <Text style={styles.infoText}>Spreadsheet: {getSpreadsheetInfoQuery.data.title}</Text>
          <Text style={styles.infoText}>Sheets: {getSpreadsheetInfoQuery.data.sheetNames?.join(', ') || 'None'}</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => urlUtils.openUrl(getSpreadsheetInfoQuery.data.spreadsheetUrl || '')}
          >
            <Text style={styles.buttonText}>Open Spreadsheet</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>Loading spreadsheet info...</Text>
          <Text style={styles.warningDescription}>
            Please wait while we retrieve your spreadsheet information.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Spreadsheet Database Manager</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sync' && styles.activeTab]}
          onPress={() => setActiveTab('sync')}
        >
          <Text style={[styles.tabText, activeTab === 'sync' && styles.activeTabText]}>
            Sync Data
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'view' && styles.activeTab]}
          onPress={() => setActiveTab('view')}
        >
          <Text style={[styles.tabText, activeTab === 'view' && styles.activeTabText]}>
            View Data
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Create New
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'sync' && renderSyncTab()}
      {activeTab === 'view' && renderViewTab()}
      {activeTab === 'create' && renderCreateTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1f2937',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#3b82f6',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  collectionSelector: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  collectionButton: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 120,
    alignItems: 'center',
  },
  collectionButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  collectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  collectionButtonTextActive: {
    color: '#3b82f6',
  },
  collectionDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  actionButtons: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  createButton: {
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  linkButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  linkButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  warningText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  warningDescription: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 16,
    lineHeight: 20,
  },
  successCard: {
    backgroundColor: '#d1fae5',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  featuresList: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  featureItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    paddingLeft: 16,
  },
});
