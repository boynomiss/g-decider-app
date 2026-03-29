/**
 * Filter Configuration Types
 * 
 * Defines configuration interfaces for different filter categories
 */

import type { BudgetOption, MoodOption, SocialContext, TimeOfDay, LookingForOption } from './filter-interfaces';

// =================
// CONFIG INTERFACES
// =================

export interface BudgetCategory {
  id: BudgetOption;
  display: string;
  label: string;
  priceRange: { min: number; max: number };
  googlePriceLevel: number;
  description: string;
  preferredPlaceTypes: string[];
  atmosphereKeywords: string[];
}

export interface MoodCategory {
  id: MoodOption;
  label: string;
  icon: string;
  scoreRange: { min: number; max: number };
  description: string;
  preferredPlaceTypes: string[];
  socialCompatibility: SocialContext[];
  budgetPreferences: BudgetOption[];
  timeCompatibility: TimeOfDay[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
  energyLevel: 'low' | 'medium' | 'high';
  colorScheme: string;
}

export interface SocialContextConfig {
  id: SocialContext;
  label: string;
  icon: string;
  groupSize: number | { min: number; max: number };
  description: string;
  preferredPlaceTypes: string[];
  moodCompatibility: MoodOption[];
  budgetPreferences: BudgetOption[];
  timeCompatibility: TimeOfDay[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
}

export interface TimeCategory {
  id: TimeOfDay;
  label: string;
  icon: string;
  timeRange: { start: string; end: string };
  hourRange: { start: number; end: number };
  description: string;
  preferredPlaceTypes: string[];
}

export interface CategoryFilter {
  id: LookingForOption;
  label: string;
  icon: string;
  description: string;
  preferredPlaceTypes: string[];
  moodCompatibility: MoodOption[];
  socialCompatibility: SocialContext[];
  budgetPreferences: BudgetOption[];
  timeCompatibility: TimeOfDay[];
  activitySuggestions: string[];
  atmosphereKeywords: string[];
  searchKeywords: string[];
  priority: number;
}

export interface DistanceCategory {
  emoji: string;
  text: string;
  range: [number, number]; // percentage range [min, max]
  distanceMeters: { min: number; max: number };
  distanceKm: { min: number; max: number };
  label: string;
  percentage: number;
  meters: number;
}

// =================
// FILTER CONFIG COLLECTION
// =================

export interface FilterConfigs {
  budget: BudgetCategory[];
  mood: MoodCategory[];
  social: SocialContextConfig[];
  time: TimeCategory[];
  category: CategoryFilter[];
  distance: DistanceCategory[];
}

export type FilterConfigType = keyof FilterConfigs;
