/**
 * Filter Insights Panel Component
 * 
 * Displays insights from Places Aggregate API about filter effectiveness
 * Shows users what filters will work best in their current location
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LocationFilterAnalysis } from '../utils/filter-enhancement-service';

interface FilterInsightsPanelProps {
  filterAnalysis?: LocationFilterAnalysis;
  onFilterRecommendationApply?: (filterType: string, value: string) => void;
  isVisible?: boolean;
}

export const FilterInsightsPanel: React.FC<FilterInsightsPanelProps> = ({
  filterAnalysis,
  onFilterRecommendationApply,
  isVisible = true
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!isVisible || !filterAnalysis) {
    return null;
  }

  const renderInsightCard = (
    title: string,
    insights: Record<string, any>,
    type: string
  ) => {
    const isExpanded = expandedSection === type;
    const topInsights = Object.entries(insights)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3);

    return (
      <View style={styles.insightCard} key={type}>
        <TouchableOpacity
          style={styles.cardHeader}
          onPress={() => setExpandedSection(isExpanded ? null : type)}
        >
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.cardContent}>
            {topInsights.map(([key, insight]) => (
              <View key={key} style={styles.insightRow}>
                <View style={styles.insightInfo}>
                  <Text style={styles.insightLabel}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.insightCount}>
                    {insight.count} places
                  </Text>
                  <View style={[
                    styles.densityBadge,
                    { backgroundColor: getDensityColor(insight.density) }
                  ]}>
                    <Text style={styles.densityText}>{insight.density}</Text>
                  </View>
                </View>
                
                {insight.recommendation === 'good-options' && (
                  <TouchableOpacity
                    style={styles.applyButton}
                    onPress={() => onFilterRecommendationApply?.(type, key)}
                  >
                    <Text style={styles.applyButtonText}>Apply</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const getDensityColor = (density: string) => {
    switch (density) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'low': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'good-options': return '#4CAF50';
      case 'too-many-options': return '#FF9800';
      case 'expand-search': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Filter Insights</Text>
        <Text style={styles.subtitle}>
          Based on {filterAnalysis.insights.totalPlaces} places within {filterAnalysis.radius/1000}km
        </Text>
      </View>

      {/* Overall Recommendations */}
      {filterAnalysis.recommendations.shouldExpandRadius && (
        <View style={[styles.recommendationCard, { backgroundColor: '#FFF3E0' }]}>
          <Text style={styles.recommendationTitle}>🔍 Recommendation</Text>
          <Text style={styles.recommendationText}>
            Consider expanding your search radius - limited options in current area
          </Text>
        </View>
      )}

      {filterAnalysis.recommendations.bestFilters.length > 0 && (
        <View style={[styles.recommendationCard, { backgroundColor: '#E8F5E8' }]}>
          <Text style={styles.recommendationTitle}>✨ Best Filters</Text>
          <Text style={styles.recommendationText}>
            Try: {filterAnalysis.recommendations.bestFilters.join(', ')}
          </Text>
        </View>
      )}

      {filterAnalysis.recommendations.alternativeCategories.length > 0 && (
        <View style={[styles.recommendationCard, { backgroundColor: '#E3F2FD' }]}>
          <Text style={styles.recommendationTitle}>🔄 Alternatives</Text>
          <Text style={styles.recommendationText}>
            Consider: {filterAnalysis.recommendations.alternativeCategories.join(', ')}
          </Text>
        </View>
      )}

      {/* Detailed Insights */}
      {renderInsightCard(
        '🍽️ By Category',
        filterAnalysis.insights.byCategory,
        'category'
      )}

      {renderInsightCard(
        '⭐ By Rating',
        filterAnalysis.insights.byRating,
        'rating'
      )}

      {renderInsightCard(
        '💰 By Price Level',
        filterAnalysis.insights.byPriceLevel,
        'price'
      )}

      {renderInsightCard(
        '🎯 Popular Combinations',
        filterAnalysis.insights.byCombination,
        'combination'
      )}

      {/* Filter Question Examples */}
      <View style={styles.examplesCard}>
        <Text style={styles.examplesTitle}>💡 Try asking:</Text>
        <Text style={styles.exampleText}>
          • "How many 4+ star restaurants are within 2km?"
        </Text>
        <Text style={styles.exampleText}>
          • "Show me inexpensive cafes currently open"
        </Text>
        <Text style={styles.exampleText}>
          • "What bars are in this area?"
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  recommendationCard: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
  },
  insightCard: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  expandIcon: {
    fontSize: 14,
    color: '#666',
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightInfo: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  insightCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  densityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  densityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  applyButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  examplesCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});

export default FilterInsightsPanel;