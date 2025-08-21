import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Calendar, Clock, Users, DollarSign, MapPin } from 'lucide-react-native';

/**
 * Booking Option Interface
 * @interface BookingOption
 * @property {string} id - Unique identifier for the booking option
 * @property {string} time - Time slot for the booking
 * @property {string} date - Date for the booking
 * @property {number} availableSeats - Number of available seats
 * @property {string} price - Price for this booking option
 * @property {string} location - Location or table description
 * @property {boolean} isAvailable - Whether this option is available
 */
interface BookingOption {
  id: string;
  time: string;
  date: string;
  availableSeats: number;
  price: string;
  location: string;
  isAvailable: boolean;
}

/**
 * BookingOptionsCard Component Props
 * @interface BookingOptionsCardProps
 * @property {string} title - Title of the booking options section
 * @property {BookingOption[]} options - Array of available booking options
 * @property {(option: BookingOption) => void} onOptionSelect - Function called when an option is selected
 * @property {ViewStyle} style - Additional styles for the card
 * @property {string} testID - Test identifier for testing
 */
interface BookingOptionsCardProps {
  title?: string;
  options: BookingOption[];
  onOptionSelect: (option: BookingOption) => void;
  style?: ViewStyle;
  testID?: string;
}

/**
 * A card component for displaying booking options with time slots, prices, and availability
 * 
 * @example
 * ```tsx
 * <BookingOptionsCard
 *   title="Available Times"
 *   options={bookingOptions}
 *   onOptionSelect={(option) => handleBooking(option)}
 * />
 * ```
 */
export default function BookingOptionsCard({
  title = "Available Times",
  options,
  onOptionSelect,
  style,
  testID
}: BookingOptionsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPriceText = (price: string) => {
    switch (price) {
      case '$': return 'Budget';
      case '$$': return 'Moderate';
      case '$$$': return 'Expensive';
      case '$$$$': return 'Luxury';
      default: return price;
    }
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              !option.isAvailable && styles.optionCardUnavailable
            ]}
            onPress={() => option.isAvailable && onOptionSelect(option)}
            disabled={!option.isAvailable}
            activeOpacity={option.isAvailable ? 0.8 : 1}
          >
            <View style={styles.optionHeader}>
              <View style={styles.timeContainer}>
                <Clock size={20} color="#7DD3C0" />
                <Text style={styles.timeText}>{option.time}</Text>
              </View>
              
              <View style={styles.priceContainer}>
                <DollarSign size={16} color="#666" />
                <Text style={styles.priceText}>
                  {getPriceText(option.price)}
                </Text>
              </View>
            </View>
            
            <View style={styles.optionDetails}>
              <View style={styles.detailRow}>
                <Calendar size={16} color="#666" />
                <Text style={styles.detailText}>
                  {formatDate(option.date)}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Users size={16} color="#666" />
                <Text style={styles.detailText}>
                  {option.availableSeats} seats available
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <MapPin size={16} color="#666" />
                <Text style={styles.detailText} numberOfLines={1}>
                  {option.location}
                </Text>
              </View>
            </View>
            
            {!option.isAvailable && (
              <View style={styles.unavailableOverlay}>
                <Text style={styles.unavailableText}>Unavailable</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {options.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            No booking options available
          </Text>
          <Text style={styles.emptyStateSubtext}>
            Try selecting a different date or time
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 16,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  optionCardUnavailable: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    opacity: 0.6,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7DD3C0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  optionDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
    flex: 1,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4A5568',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
  },
});
