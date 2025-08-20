/**
 * Description Generator - Compatibility Layer
 * 
 * This file provides backward compatibility for the old description generation API
 * while leveraging the new enhanced AI Description Service under the hood.
 * 
 * @deprecated Consider using the AI Description Service directly for new code
 */

import { aiDescriptionService } from './results/ai-description-service';

// Type definitions for compatibility
interface Review {
  text: string;
  rating: number;
  author?: string;
  time?: string;
}

// Helper: Convert budget level to readable text (for compatibility)
const getBudgetText = (budget: 'P' | 'PP' | 'PPP'): string => {
  const budgetTexts = {
    'P': 'budget-friendly',
    'PP': 'mid-range', 
    'PPP': 'premium'
  };
  return budgetTexts[budget];
};

/**
 * Convert legacy review format to AI service format
 */
const convertReviewsForAIService = (reviews: Review[]) => {
  return reviews.map(review => ({
    author: review.author || 'Anonymous',
    rating: review.rating,
    text: review.text,
    time: review.time || new Date().toISOString()
  }));
};

/**
 * Convert category to appropriate tags for the AI service
 */
const getCategoryTags = (category: string): string[] => {
  const categoryTagMap: Record<string, string[]> = {
    'food': ['restaurant', 'dining', 'cuisine'],
    'activity': ['entertainment', 'fun', 'adventure'],
    'something-new': ['unique', 'special', 'different']
  };
  
  return categoryTagMap[category] || ['restaurant'];
};

/**
 * Generate fallback description using simple templates (for emergencies only)
 */
const generateSimpleFallback = (placeName: string, category: string, budget?: 'P' | 'PP' | 'PPP'): string => {
  const budgetText = budget ? getBudgetText(budget) : 'reasonably priced';
  
  const templates: Record<string, string[]> = {
    food: [
      `Cozy dining spot with authentic flavors. ${budgetText} meals perfect for any occasion.`,
      `Local favorite featuring fresh ingredients. Known for ${budgetText} quality and warm service.`,
      `Hidden gem serving delicious cuisine. ${budgetText} pricing with memorable dining experiences.`
    ],
    activity: [
      `Exciting destination with unique experiences. ${budgetText} fun for adventure seekers.`,
      `Popular spot offering engaging activities. Perfect for ${budgetText} entertainment and memories.`,
      `Adventure hub with thrilling options. ${budgetText} excitement for all experience levels.`
    ],
    'something-new': [
      `Unique venue with distinctive character. ${budgetText} experiences that surprise and delight.`,
      `Special destination offering fresh perspectives. Known for ${budgetText} innovation and creativity.`,
      `Different kind of place with unique charm. ${budgetText} discoveries waiting to be made.`
    ]
  };
  
  const categoryTemplates = templates[category] || templates.food;
  if (!categoryTemplates || categoryTemplates.length === 0) {
    return 'A great place to visit.';
  }
  const randomIndex = Math.floor(Math.random() * categoryTemplates.length);
  return categoryTemplates[randomIndex] || 'A great place to visit.';
};

/**
 * Main function: Generate comprehensive description
 * 
 * @deprecated Use aiDescriptionService.generateDescription() directly for better results
 */
export const generateComprehensiveDescription = async (
  placeName: string,
  category: string,
  reviews: Review[],
  rating?: number,
  reviewCount?: number,
  budget?: 'P' | 'PP' | 'PPP'
): Promise<string> => {
  try {
    // Convert legacy data format to AI service format
    const restaurantData = {
      name: placeName,
      location: 'Unknown', // Legacy API doesn't provide location
      budget: budget || 'PP',
      tags: getCategoryTags(category),
      category: category === 'food' ? 'restaurant' : category,
      reviews: reviews ? convertReviewsForAIService(reviews) : [],
      ...(rating && { mood: Math.round((rating / 5) * 100) }), // Convert 5-star rating to 0-100 mood
    };

    // Use the new AI Description Service
    const aiDescription = await aiDescriptionService.generateDescription(restaurantData);
    
    // Ensure length is appropriate for legacy API expectations
    if (aiDescription.length <= 120) {
      return aiDescription;
    } else {
      // Truncate while keeping sentence structure
      const sentences = aiDescription.split(/[.!?]+/);
      if (sentences.length >= 2) {
        const truncated = `${sentences[0]}.${sentences[1] ? ` ${sentences[1]}.` : ''}`;
        return truncated.length <= 120 ? truncated : sentences[0] + '.';
      }
      return aiDescription.substring(0, 117) + '...';
    }
  } catch (error) {
    console.warn('AI Description Service failed, using simple fallback:', error);
    return generateSimpleFallback(placeName, category, budget);
  }
};

/**
 * Helper: Generate short description for cards
 * 
 * @deprecated Use aiDescriptionService.generateDescription() directly for better results
 */
export const generateShortDescription = async (
  placeName: string,
  category: string,
  rating?: number
): Promise<string> => {
  try {
    // Use the comprehensive description but ensure it's short
    const description = await generateComprehensiveDescription(placeName, category, [], rating);
    
    // If it's already short enough, return it
    if (description.length <= 80) {
      return description;
    }
    
    // Otherwise, create a short version
    const sentences = description.split(/[.!?]+/);
    const firstSentence = sentences[0];
    if (firstSentence && firstSentence.length <= 80) {
      return firstSentence + '.';
    }
    
    // Final fallback - use simple template
    return generateSimpleFallback(placeName, category).split('.')[0] + '.';
  } catch (error) {
    console.warn('Short description generation failed, using simple template:', error);
    return generateSimpleFallback(placeName, category).split('.')[0] + '.';
  }
}; 