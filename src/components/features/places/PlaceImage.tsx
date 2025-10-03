import React from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { getImageUrl } from '../../../services/google-places-photos';

interface PlaceImageProps {
  imageUri: string;
  googlePlacesId?: string;
  testID?: string;
}

export default function PlaceImage({ imageUri, googlePlacesId, testID }: PlaceImageProps) {
  const [imageUrl, setImageUrl] = React.useState<string>(getImageUrl(imageUri));
  const [isLoading, setIsLoading] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  // Fallback image for when loading fails
  const fallbackImage = 'https://via.placeholder.com/800x400/E8E8E8/666666?text=Image+Not+Available';

  return (
    <View style={styles.imageContainer} testID={testID}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
      <Image 
        source={{ uri: hasError ? fallbackImage : imageUrl }}
        style={styles.placeImage}
        resizeMode="cover"
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    height: 300,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  placeImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
});
