import React, { useEffect } from 'react';
import { 
  Modal as RNModal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle,
  TextStyle,
  Dimensions
} from 'react-native';
import { X } from 'lucide-react-native';

const { height: screenHeight } = Dimensions.get('window');

/**
 * Modal Component Props
 * @interface ModalProps
 * @property {boolean} visible - Whether the modal is visible
 * @property {() => void} onClose - Function called when modal is closed
 * @property {string} title - Title text for the modal header
 * @property {React.ReactNode} children - Content to display inside the modal
 * @property {'small' | 'medium' | 'large' | 'full'} size - Modal size
 * @property {boolean} showCloseButton - Whether to show the close button
 * @property {ViewStyle} style - Additional styles for the modal container
 * @property {TextStyle} titleStyle - Additional styles for the modal title
 * @property {string} testID - Test identifier for testing
 */
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'full';
  showCloseButton?: boolean;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
}

/**
 * A reusable modal component with different sizes and customizable header
 * 
 * @example
 * ```tsx
 * <Modal 
 *   visible={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Settings"
 *   size="medium"
 * >
 *   <Text>Modal content goes here</Text>
 * </Modal>
 * ```
 */
export default function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  style,
  titleStyle,
  testID
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (visible) {
      // Add any modal-specific effects here
    }
  }, [visible]);

  const modalContainerStyle = [
    styles.modalContainer,
    styles[size],
    style
  ];

  const titleTextStyle = [
    styles.title,
    titleStyle
  ];

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID={testID}
    >
      <View style={styles.overlay}>
        <View style={modalContainerStyle}>
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title && (
                <Text style={titleTextStyle}>{title}</Text>
              )}
              {showCloseButton && (
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color="#999999" />
                </TouchableOpacity>
              )}
            </View>
          )}
          
          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: screenHeight * 0.9,
  },
  
  // Sizes
  small: {
    width: '80%',
    maxWidth: 300,
  },
  medium: {
    width: '90%',
    maxWidth: 500,
  },
  large: {
    width: '95%',
    maxWidth: 700,
  },
  full: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A4A4A',
    flex: 1,
  },
  
  closeButton: {
    padding: 4,
  },
  
  content: {
    padding: 24,
  },
});
