import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';

interface AIDescriptionCardProps {
  description: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onGenerate: () => void;
}

export const AIDescriptionCard: React.FC<AIDescriptionCardProps> = ({
  description,
  isLoading,
  error,
  onRetry,
  onGenerate
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Star size={16} color="#8B5FBF" />
          <Text style={styles.title}>AI Description</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating AI description...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <AlertCircle size={16} color="#FF6B6B" />
          <Text style={styles.title}>AI Description</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to generate AI description</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!description) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Star size={16} color="#8B5FBF" />
          <Text style={styles.title}>AI Description</Text>
        </View>
        <TouchableOpacity style={styles.generateButton} onPress={onGenerate}>
          <Text style={styles.generateButtonText}>Generate AI Description</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Star size={16} color="#8B5FBF" />
        <Text style={styles.title}>AI Description</Text>
      </View>
      <View style={styles.descriptionContainer}>
        <Text 
          style={styles.description} 
          numberOfLines={isDescriptionExpanded ? undefined : 3}
        >
          {description}
        </Text>
        
        {description.length > 150 && (
          <TouchableOpacity 
            style={styles.expandButton} 
            onPress={toggleDescription}
            activeOpacity={0.7}
          >
            <Text style={styles.expandButtonText}>
              {isDescriptionExpanded ? 'Show Less' : 'Read More'}
            </Text>
            {isDescriptionExpanded ? (
              <ChevronUp size={16} color="#8B5FBF" />
            ) : (
              <ChevronDown size={16} color="#8B5FBF" />
            )}
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.regenerateButton} onPress={onRetry}>
          <Text style={styles.regenerateButtonText}>Regenerate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  generateButtonText: {
    fontSize: 14,
    color: '#8B5FBF',
    fontWeight: '500',
  },
  descriptionContainer: {
    position: 'relative',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    marginBottom: 8,
  },
  expandButtonText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
    marginRight: 4,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F8F8F8',
  },
  regenerateButtonText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
  },
}); 