import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Filter, X, RotateCcw, Settings, ChevronDown, ChevronUp } from 'lucide-react-native';
import { UserFilters } from '@/types/app';
import { DistanceUtils } from '@/utils/filtering/configs/distance-config';

interface FilterControlPanelProps {
  filters: UserFilters;
  onFiltersChange: (filters: Partial<UserFilters>) => void;
  onResetFilters: () => void;
  visible?: boolean;
  onClose?: () => void;
  showAsModal?: boolean;
}

export default function FilterControlPanel({
  filters,
  onFiltersChange,
  onResetFilters,
  visible = true,
  onClose,
  showAsModal = false
}: FilterControlPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['category']));

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.budget) count++;
    if (filters.socialContext) count++;
    if (filters.timeOfDay) count++;
    if (filters.mood !== 50) count++; // Assuming 50 is default
    if (filters.distanceRange && filters.distanceRange !== 50) count++; // Assuming 50 is default
    return count;
  };

  const getFilterSummary = () => {
    const summary: string[] = [];
    
    if (filters.category) {
      const categoryLabels = {
        food: 'Food',
        activity: 'Activity',
        'something-new': 'Something New'
      };
      summary.push(categoryLabels[filters.category] || filters.category);
    }
    
    if (filters.budget) {
      const budgetLabels = { P: '₱', PP: '₱₱', PPP: '₱₱₱' };
      summary.push(budgetLabels[filters.budget]);
    }
    
    if (filters.socialContext) {
      const socialLabels = {
        solo: 'Solo',
        'with-bae': 'With Partner',
        barkada: 'Group'
      };
      summary.push(socialLabels[filters.socialContext]);
    }
    
    if (filters.timeOfDay) {
      const timeLabels = {
        morning: 'Morning',
        afternoon: 'Afternoon',
        night: 'Night'
      };
      summary.push(timeLabels[filters.timeOfDay]);
    }
    
    return summary;
  };

  const renderMoodSlider = () => {
    const moodLabels = {
      0: 'Very Chill',
      25: 'Chill',
      50: 'Neutral',
      75: 'Energetic',
      100: 'Very Hype'
    };
    
    const getMoodLabel = (value: number) => {
      const closest = Object.keys(moodLabels).reduce((prev, curr) => 
        Math.abs(Number(curr) - value) < Math.abs(Number(prev) - value) ? curr : prev
      );
      return moodLabels[Number(closest) as keyof typeof moodLabels];
    };

    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <View 
            style={[
              styles.sliderThumb,
              { left: `${filters.mood}%` }
            ]}
          />
        </View>
        <Text style={styles.sliderValue}>
          {getMoodLabel(filters.mood)} ({filters.mood})
        </Text>
      </View>
    );
  };

  const renderDistanceSlider = () => {
    const distance = filters.distanceRange || 50;
    const getDistanceLabel = (value: number) => {
      return DistanceUtils.getDistanceLabelForUI(value);
    };

    return (
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <View 
            style={[
              styles.sliderThumb,
              { left: `${distance}%` }
            ]}
          />
        </View>
        <Text style={styles.sliderValue}>
          {getDistanceLabel(distance)}
        </Text>
      </View>
    );
  };

  const renderFilterSection = (
    title: string,
    sectionKey: string,
    content: React.ReactNode,
    isActive: boolean = false
  ) => {
    const isExpanded = expandedSections.has(sectionKey);
    
    return (
      <View style={styles.filterSection}>
        <TouchableOpacity
          style={[styles.sectionHeader, isActive && styles.activeSectionHeader]}
          onPress={() => toggleSection(sectionKey)}
          activeOpacity={0.7}
        >
          <Text style={[styles.sectionTitle, isActive && styles.activeSectionTitle]}>
            {title}
          </Text>
          {isExpanded ? (
            <ChevronUp size={20} color={isActive ? '#8B5FBF' : '#666'} />
          ) : (
            <ChevronDown size={20} color={isActive ? '#8B5FBF' : '#666'} />
          )}
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {content}
          </View>
        )}
      </View>
    );
  };

  const content = (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Filter size={20} color="#8B5FBF" />
          <Text style={styles.headerTitle}>Filters</Text>
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={onResetFilters}
            activeOpacity={0.7}
          >
            <RotateCcw size={16} color="#666" />
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
          
          {showAsModal && onClose && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Summary */}
      {getActiveFiltersCount() > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Active Filters:</Text>
          <Text style={styles.summaryText}>
            {getFilterSummary().join(' • ')}
          </Text>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category Filter */}
        {renderFilterSection(
          'Category',
          'category',
          <View style={styles.optionsGrid}>
            {[
              { id: 'food', label: 'Food', icon: '🍔' },
              { id: 'activity', label: 'Activity', icon: '🧩' },
              { id: 'something-new', label: 'Something New', icon: '✨' }
            ].map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.optionButton,
                  filters.category === category.id && styles.activeOption
                ]}
                onPress={() => onFiltersChange({ 
                  category: filters.category === category.id ? null : category.id as any 
                })}
              >
                <Text style={styles.optionIcon}>{category.icon}</Text>
                <Text style={[
                  styles.optionText,
                  filters.category === category.id && styles.activeOptionText
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>,
          !!filters.category
        )}

        {/* Mood Filter */}
        {renderFilterSection(
          'Mood',
          'mood',
          renderMoodSlider(),
          filters.mood !== 50
        )}

        {/* Social Context Filter */}
        {renderFilterSection(
          'Social Context',
          'social',
          <View style={styles.optionsGrid}>
            {[
              { id: 'solo', label: 'Solo', icon: '🧘' },
              { id: 'with-bae', label: 'With Partner', icon: '💕' },
              { id: 'barkada', label: 'Group', icon: '👥' }
            ].map((social) => (
              <TouchableOpacity
                key={social.id}
                style={[
                  styles.optionButton,
                  filters.socialContext === social.id && styles.activeOption
                ]}
                onPress={() => onFiltersChange({ 
                  socialContext: filters.socialContext === social.id ? null : social.id as any 
                })}
              >
                <Text style={styles.optionIcon}>{social.icon}</Text>
                <Text style={[
                  styles.optionText,
                  filters.socialContext === social.id && styles.activeOptionText
                ]}>
                  {social.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>,
          !!filters.socialContext
        )}

        {/* Budget Filter */}
        {renderFilterSection(
          'Budget',
          'budget',
          <View style={styles.optionsGrid}>
            {[
              { id: 'P', label: '₱', desc: 'Budget' },
              { id: 'PP', label: '₱₱', desc: 'Moderate' },
              { id: 'PPP', label: '₱₱₱', desc: 'Premium' }
            ].map((budget) => (
              <TouchableOpacity
                key={budget.id}
                style={[
                  styles.optionButton,
                  filters.budget === budget.id && styles.activeOption
                ]}
                onPress={() => onFiltersChange({ 
                  budget: filters.budget === budget.id ? null : budget.id as any 
                })}
              >
                <Text style={[
                  styles.optionText,
                  filters.budget === budget.id && styles.activeOptionText
                ]}>
                  {budget.label}
                </Text>
                <Text style={[
                  styles.optionDesc,
                  filters.budget === budget.id && styles.activeOptionDesc
                ]}>
                  {budget.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>,
          !!filters.budget
        )}

        {/* Time of Day Filter */}
        {renderFilterSection(
          'Time of Day',
          'time',
          <View style={styles.optionsGrid}>
            {[
              { id: 'morning', label: 'Morning', icon: '🌅' },
              { id: 'afternoon', label: 'Afternoon', icon: '☀️' },
              { id: 'night', label: 'Night', icon: '🌙' }
            ].map((time) => (
              <TouchableOpacity
                key={time.id}
                style={[
                  styles.optionButton,
                  filters.timeOfDay === time.id && styles.activeOption
                ]}
                onPress={() => onFiltersChange({ 
                  timeOfDay: filters.timeOfDay === time.id ? null : time.id as any 
                })}
              >
                <Text style={styles.optionIcon}>{time.icon}</Text>
                <Text style={[
                  styles.optionText,
                  filters.timeOfDay === time.id && styles.activeOptionText
                ]}>
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>,
          !!filters.timeOfDay
        )}

        {/* Distance Filter */}
        {renderFilterSection(
          'Distance Range',
          'distance',
          renderDistanceSlider(),
          (filters.distanceRange || 50) !== 50
        )}
      </ScrollView>
    </View>
  );

  if (showAsModal) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <LinearGradient
          colors={['#C8A8E9', '#B19CD9']}
          style={styles.modalContainer}
        >
          {content}
        </LinearGradient>
      </Modal>
    );
  }

  return visible ? (
    <LinearGradient
      colors={['#FFFFFF', '#F8F9FA']}
      style={styles.panelContainer}
    >
      {content}
    </LinearGradient>
  ) : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 50,
  },
  panelContainer: {
    borderRadius: 16,
    margin: 16,
    maxHeight: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  filterBadge: {
    backgroundColor: '#8B5FBF',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  closeButton: {
    padding: 4,
  },
  summaryContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5FBF',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 14,
    color: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  activeSectionHeader: {
    backgroundColor: '#F0F4FF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  activeSectionTitle: {
    color: '#8B5FBF',
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    margin: 4,
    minWidth: 80,
    alignItems: 'center',
    flex: 1,
  },
  activeOption: {
    backgroundColor: '#8B5FBF',
  },
  optionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  activeOptionText: {
    color: '#FFFFFF',
  },
  optionDesc: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  activeOptionDesc: {
    color: '#FFFFFF',
    opacity: 0.8,
  },
  sliderContainer: {
    paddingHorizontal: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
    marginBottom: 12,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: '#8B5FBF',
    borderRadius: 8,
    transform: [{ translateX: -8 }],
  },
  sliderValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});