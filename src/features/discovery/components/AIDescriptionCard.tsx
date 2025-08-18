import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Star, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react-native';

interface AIDescriptionCardProps {
  description: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onGenerate: () => void;
  variant?: 'card' | 'inline';
}

export const AIDescriptionCard: React.FC<AIDescriptionCardProps> = ({
  description,
  isLoading,
  error,
  onRetry,
  onGenerate,
  variant = 'card',
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  if (variant === 'inline') {
    if (isLoading) {
      return (
        <View style={styles.inlineContainer}>
          <Text style={styles.inlineLoadingText}>Generating description…</Text>
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.inlineContainer}>
          <Text style={styles.inlineErrorText}>Failed to generate description</Text>
          <TouchableOpacity onPress={onRetry} style={styles.inlineRetry}>
            <Text style={styles.inlineRetryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (!description) {
      return (
        <TouchableOpacity style={styles.inlineGenerate} onPress={onGenerate} testID="ai-generate-inline">
          <Text style={styles.inlineGenerateText}>Generate description</Text>
        </TouchableOpacity>
      );
    }
    return (
      <View style={styles.inlineContainer} testID="ai-description-inline">
        <Text
          style={styles.inlineDescription}
          numberOfLines={isDescriptionExpanded ? undefined : 3}
        >
          {description}
        </Text>
        {description.length > 150 && (
          <TouchableOpacity onPress={toggleDescription} style={styles.inlineExpandButton} activeOpacity={0.7}>
            <Text style={styles.inlineExpandText}>{isDescriptionExpanded ? 'Show Less' : 'Read More'}</Text>
            {isDescriptionExpanded ? (
              <ChevronUp size={16} color="#8B5FBF" />
            ) : (
              <ChevronDown size={16} color="#8B5FBF" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }

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
  inlineContainer: {
    marginTop: 8,
  },
  inlineDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4A4A4A',
  },
  inlineExpandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  inlineExpandText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
    marginRight: 4,
  },
  inlineGenerate: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  inlineGenerateText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
  },
  inlineLoadingText: {
    fontSize: 12,
    color: '#666',
  },
  inlineErrorText: {
    fontSize: 12,
    color: '#FF6B6B',
  },
  inlineRetry: {
    paddingVertical: 4,
  },
  inlineRetryText: {
    fontSize: 12,
    color: '#8B5FBF',
    fontWeight: '500',
  },
});