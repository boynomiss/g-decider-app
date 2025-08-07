import { UserFilters } from '@/types/app';
import { DistanceUtils } from './distance-config';
import { SocialUtils } from './social-config';
import { MoodUtils } from './mood-config';
import { CategoryUtils } from './category-config';

// CATEGORY_TYPE_MAPPING now imported from category-config.ts

// MOOD_TYPE_MAPPING now imported from mood-config.ts

// SOCIAL_CONTEXT_MAPPING now imported from social-config.ts

// Helper functions
function getMoodCategory(moodScore: number): 'chill' | 'neutral' | 'hype' {
  return MoodUtils.getMoodCategoryId(moodScore);
}

function getMoodLabel(moodScore: number): string {
  return MoodUtils.getMoodLabel(moodScore);
}

function getDistanceLabel(distanceRange: number | null): string {
  return DistanceUtils.getDistanceLabel(distanceRange);
}

function getBudgetLabel(budget: string | null): string {
  if (!budget) return 'not-set';
  switch (budget) {
    case 'P': return 'Budget-friendly';
    case 'PP': return 'Moderate';
    case 'PPP': return 'Premium';
    default: return 'not-set';
  }
}

function getTimeOfDayLabel(timeOfDay: string | null): string {
  if (!timeOfDay) return 'not-set';
  switch (timeOfDay) {
    case 'morning': return 'Morning';
    case 'afternoon': return 'Afternoon';
    case 'night': return 'Night';
    default: return 'not-set';
  }
}

function getSocialContextLabel(socialContext: string | null): string {
  return SocialUtils.getSocialContextLabel(socialContext);
}

function getCategoryLabel(category: string | null): string {
  return CategoryUtils.getCategoryLabel(category);
}

function getCompatiblePlaceTypes(filters: UserFilters): string[] {
  let candidateTypes: string[] = [];
  
  // Start with category types
  if (filters.category) {
    candidateTypes = CategoryUtils.getPreferredPlaceTypes(filters.category);
  }
  
  // If we have multiple filters, use a more flexible approach
  const hasMoodFilter = filters.mood && filters.mood !== 50;
  const hasSocialFilter = filters.socialContext;
  
  if (hasMoodFilter || hasSocialFilter) {
    // Get mood-compatible types
    let moodCompatibleTypes: string[] = [];
    if (hasMoodFilter) {
      moodCompatibleTypes = MoodUtils.getPreferredPlaceTypes(filters.mood);
    }
    
    // Get social context compatible types
    let socialCompatibleTypes: string[] = [];
    if (hasSocialFilter && filters.socialContext) {
      socialCompatibleTypes = SocialUtils.getPreferredPlaceTypes(filters.socialContext);
    }
    
    // If we have both filters, show available types from each filter
    if (hasMoodFilter && hasSocialFilter) {
      const moodIntersection = candidateTypes.filter(type => moodCompatibleTypes.includes(type));
      const socialIntersection = candidateTypes.filter(type => socialCompatibleTypes.includes(type));
      
      // If there's no strict intersection, show available types from each filter
      const strictIntersection = moodIntersection.filter(type => socialIntersection.includes(type));
      if (strictIntersection.length === 0) {
        // Return available types from both filters (union of intersections)
        const allAvailableTypes = [...new Set([...moodIntersection, ...socialIntersection])];
        return allAvailableTypes;
      }
      
      // Return strict intersection if it exists
      return strictIntersection;
    }
    
    // If only mood filter, return mood-compatible types from category
    if (hasMoodFilter) {
      return candidateTypes.filter(type => moodCompatibleTypes.includes(type));
    }
    
    // If only social filter, return social-compatible types from category
    if (hasSocialFilter) {
      return candidateTypes.filter(type => socialCompatibleTypes.includes(type));
    }
  }
  
  // Return all category types if no additional filters
  return candidateTypes;
}

/**
 * Get detailed place type breakdown for debugging
 */
function getPlaceTypeBreakdown(filters: UserFilters): {
  categoryTypes: string[];
  moodCompatibleTypes: string[];
  socialCompatibleTypes: string[];
  finalTypes: string[];
} {
  const categoryTypes = filters.category 
    ? CategoryUtils.getPreferredPlaceTypes(filters.category)
    : [];
  
  const moodCompatibleTypes = (filters.mood && filters.mood !== 50) 
    ? MoodUtils.getPreferredPlaceTypes(filters.mood)
    : [];
  
  const socialCompatibleTypes = filters.socialContext 
    ? SocialUtils.getPreferredPlaceTypes(filters.socialContext)
    : [];
  
  const finalTypes = getCompatiblePlaceTypes(filters);
  
  return {
    categoryTypes,
    moodCompatibleTypes,
    socialCompatibleTypes,
    finalTypes
  };
}

/**
 * Generate dynamic log message based on current filters
 */
export function generateFilterLogMessage(filters: UserFilters): string {
  const category = getCategoryLabel(filters.category);
  const mood = getMoodLabel(filters.mood);
  const socialContext = getSocialContextLabel(filters.socialContext);
  const budget = getBudgetLabel(filters.budget);
  const timeOfDay = getTimeOfDayLabel(filters.timeOfDay);
  const distanceRange = getDistanceLabel(filters.distanceRange);
  const placeTypes = getCompatiblePlaceTypes(filters);
  
  const logMessage = [
    `Looking for: ${category}`,
    `Mood: ${mood}`,
    `Social Context: ${socialContext}`,
    `Budget: ${budget}`,
    `Time of day: ${timeOfDay}`,
    `Distance range: ${distanceRange}`,
    `Place types: ${placeTypes.join(', ')}`
  ].join('\n');
  
  return logMessage;
}

/**
 * Log filter changes with dynamic message
 */
export function logFilterChange(filters: UserFilters, changedFilter?: string): void {
  const logMessage = generateFilterLogMessage(filters);
  
  console.log('🎛️ Filter Update:', changedFilter ? `(${changedFilter} changed)` : '(initial state)');
  console.log(logMessage);
  console.log('─'.repeat(50));
}

/**
 * Get filter summary for display
 */
export function getFilterSummary(filters: UserFilters): {
  category: string;
  mood: string;
  socialContext: string;
  budget: string;
  timeOfDay: string;
  distanceRange: string;
  placeTypes: string[];
} {
  return {
    category: getCategoryLabel(filters.category),
    mood: getMoodLabel(filters.mood),
    socialContext: getSocialContextLabel(filters.socialContext),
    budget: getBudgetLabel(filters.budget),
    timeOfDay: getTimeOfDayLabel(filters.timeOfDay),
    distanceRange: getDistanceLabel(filters.distanceRange),
    placeTypes: getCompatiblePlaceTypes(filters)
  };
} 