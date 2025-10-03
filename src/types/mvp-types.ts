/**
 * MVP Types - Simplified for core functionality
 * Focuses on: Looking For categories and Mood
 */

// Core categories for "What are you looking for?"
export interface LookingForCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  active: boolean;
  sortOrder: number;
}

// Mood system - simple 1-100 scale
export interface MoodConfig {
  id: string;
  name: string;
  emoji: string;
  scoreRange: { min: number; max: number };
  description: string;
  color: string;
}

// Simplified place structure
export interface Place {
  id: string;
  name: string;
  category: string; // References LookingForCategory.id
  description: string;
  
  // Location
  location: {
    address: string;
    city: string;
    lat: number;
    lng: number;
  };
  
  // Contact
  contact: {
    phone?: string;
    website?: string;
  };
  
  // Business info
  businessInfo: {
    hours?: string;
    priceRange: '₱' | '₱₱' | '₱₱₱' | '₱₱₱₱';
    features: string[];
  };
  
  // Images
  images: {
    hero: string; // Can be Google Places photo reference or direct URL
    gallery: string[]; // Array of Google Places photo references or URLs
  };
  
  // Google Places Integration
  googlePlacesId?: string; // Optional Google Place ID for fetching photos
  
  // Discovery
  discovery: {
    tags: string[];
    perfectFor: string[];
    moodScore: number; // 1-100
    uniqueFeatures?: string;
  };
  
  // Metadata
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    status: 'active' | 'inactive' | 'pending';
  };
}

// User preferences
export interface UserPreferences {
  lookingFor: string[]; // Array of LookingForCategory.id
  mood: number; // 1-100
  distance: number; // in km
}

// Filter results
export interface FilterResult {
  places: Place[];
  totalCount: number;
  appliedFilters: UserPreferences;
}
