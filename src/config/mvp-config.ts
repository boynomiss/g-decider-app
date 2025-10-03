/**
 * MVP Configuration - Simplified core data
 */

import { LookingForCategory, MoodConfig } from '../types/mvp-types';

// Core "What are you looking for?" categories
export const LOOKING_FOR_CATEGORIES: LookingForCategory[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: '🍽️',
    description: 'Restaurants, cafes, bars, and food experiences',
    active: true,
    sortOrder: 1
  },
  {
    id: 'activity',
    name: 'Activities',
    icon: '🎯',
    description: 'Entertainment, events, fun activities, sports, outdoor activities',
    active: true,
    sortOrder: 2
  },
  {
    id: 'something-new',
    name: 'Something New',
    icon: '✨',
    description: 'Unique/unusual experiences, hidden gems, new spots',
    active: true,
    sortOrder: 3
  }
];

// Mood configurations - simple 1-100 scale
// Note: Neutral range (35-65) overlaps with both Chill and Hype for versatility
export const MOOD_CONFIGS: MoodConfig[] = [
  {
    id: 'chill',
    name: 'Chill',
    emoji: '😌',
    scoreRange: { min: 1, max: 40 },
    description: 'Peaceful, quiet, and relaxing places',
    color: '#4CAF50'
  },
  {
    id: 'neutral',
    name: 'Neutral',
    emoji: '😊',
    scoreRange: { min: 35, max: 65 },
    description: 'Comfortable, versatile, moderate energy',
    color: '#2196F3'
  },
  {
    id: 'hype',
    name: 'Hype',
    emoji: '🔥',
    scoreRange: { min: 60, max: 100 },
    description: 'Exciting, lively, and energetic places',
    color: '#FF6B6B'
  }
];

// Default user preferences
export const DEFAULT_USER_PREFERENCES = {
  lookingFor: ['food'], // Default to food
  mood: 50, // Middle of the scale
  distance: 10 // 10km default
};
