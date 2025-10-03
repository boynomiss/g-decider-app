/**
 * Place Generator Helper
 * Template and utilities to help systematically create more places
 * 
 * USAGE:
 * 1. Research real Metro Manila places using Google Maps, Spot.ph, etc.
 * 2. Use the template below to format each place
 * 3. Add to the appropriate array in metro-manila-places.ts
 * 4. Run populate-database.ts to add to Firebase
 */

import { PlaceInput } from '../data/metro-manila-places';

/**
 * Place Template - Copy and fill out
 */
export const PLACE_TEMPLATE: PlaceInput = {
  name: "",
  category: "food", // food | activity | something-new
  description: "", // Short, no name/location repetition
  location: {
    address: "",
    city: "", // Makati, BGC, QC, Manila, Pasig, etc.
    lat: 0.0, // Get from Google Maps
    lng: 0.0
  },
  contact: {
    phone: "", // Optional: +63 format
    website: "" // Optional
  },
  businessInfo: {
    hours: "", // e.g., "9:00 AM - 10:00 PM"
    priceRange: "₱₱", // ₱ | ₱₱ | ₱₱₱ | ₱₱₱₱
    features: [] // ["WiFi", "Parking", etc.]
  },
  images: {
    hero: "", // Main image URL
    gallery: [] // 2-7 more images (3-8 total)
  },
  discovery: {
    tags: [], // Descriptive tags
    perfectFor: [], // Use cases
    moodScore: 50, // 1-100: Chill (1-40), Neutral (35-65), Hype (60-100)
    uniqueFeatures: "" // What makes it special?
  }
};

/**
 * Mood Score Guide
 */
export const MOOD_SCORE_GUIDE = {
  // CHILL (1-40)
  chill: {
    range: '1-40',
    examples: [
      'Quiet cafes and libraries (15-25)',
      'Spas and wellness centers (10-20)',
      'Peaceful parks and gardens (20-30)',
      'Fine dining with calm ambiance (25-35)',
      'Meditation and yoga studios (5-20)',
      'Bookshops and art galleries (20-30)'
    ]
  },
  
  // NEUTRAL (35-65)
  neutral: {
    range: '35-65',
    examples: [
      'Casual dining restaurants (40-60)',
      'Family-friendly activities (45-55)',
      'Shopping malls and markets (45-55)',
      'Museums and cultural sites (40-50)',
      'Coffee shops (40-60)',
      'Bowling and mini-golf (50-60)'
    ]
  },
  
  // HYPE (60-100)
  hype: {
    range: '60-100',
    examples: [
      'Bars and lounges (65-80)',
      'Nightclubs (85-100)',
      'Live music venues (70-85)',
      'Adventure sports (80-95)',
      'Theme parks and attractions (70-85)',
      'Lively restaurants and izakayas (65-75)'
    ]
  }
};

/**
 * Price Range Guide
 */
export const PRICE_RANGE_GUIDE = {
  '₱': 'Budget - Under ₱200 per person',
  '₱₱': 'Moderate - ₱200-500 per person',
  '₱₱₱': 'Upscale - ₱500-1000 per person',
  '₱₱₱₱': 'Luxury - Over ₱1000 per person'
};

/**
 * Metro Manila Cities/Areas
 */
export const METRO_MANILA_AREAS = [
  'Makati',
  'BGC (Bonifacio Global City)',
  'Taguig',
  'Pasig',
  'Mandaluyong',
  'Quezon City',
  'Manila',
  'Pasay',
  'Parañaque',
  'Las Piñas',
  'Muntinlupa',
  'Marikina',
  'San Juan',
  'Caloocan',
  'Malabon',
  'Navotas',
  'Valenzuela',
  
  // Nearby areas often included
  'Antipolo',
  'Tagaytay',
  'Cavite'
];

/**
 * Image Sources Priority
 * 1. Google Places API photos
 * 2. Google Maps user photos
 * 3. Official website/social media
 * 4. Travel blogs (Spot.ph, When In Manila)
 * 5. Food blogs and review sites
 */

/**
 * Category Guidelines
 */
export const CATEGORY_GUIDELINES = {
  food: {
    subcategories: [
      'Coffee shops and cafes',
      'Fine dining',
      'Casual dining',
      'Fast casual',
      'Bars and pubs',
      'Rooftop bars',
      'Street food',
      'Dessert shops',
      'International cuisine',
      'Filipino restaurants'
    ],
    distribute: 'Mix of cuisines, price points, and areas'
  },
  
  activity: {
    subcategories: [
      'Sports and fitness',
      'Entertainment venues',
      'Theme parks',
      'Bowling and arcades',
      'Cinemas',
      'Concert venues',
      'Outdoor activities',
      'Water sports',
      'Adventure sports',
      'Museums'
    ],
    distribute: 'Balance indoor/outdoor, skill levels, age groups'
  },
  
  'something-new': {
    subcategories: [
      'Hidden gems',
      'New openings',
      'Unusual concepts',
      'Unique experiences',
      'Pop-ups and markets',
      'Quirky cafes',
      'Secret spots',
      'Cultural experiences',
      'Underground venues',
      'Offbeat attractions'
    ],
    distribute: 'Focus on uniqueness and discovery factor'
  }
};

/**
 * Required Distribution per Combo: 100 places each
 */
export const REQUIRED_COUNTS = {
  'food + chill': 100,
  'food + neutral': 100,
  'food + hype': 100,
  'activity + chill': 100,
  'activity + neutral': 100,
  'activity + hype': 100,
  'something-new + chill': 100,
  'something-new + neutral': 100,
  'something-new + hype': 100,
  
  TOTAL: 900
};

/**
 * Quick Add Function - Use for batch adding
 */
export function createPlace(data: Partial<PlaceInput> & Pick<PlaceInput, 'name' | 'category' | 'location' | 'discovery'>): PlaceInput {
  return {
    name: data.name,
    category: data.category,
    description: data.description || '',
    location: data.location,
    contact: data.contact || {},
    businessInfo: {
      hours: data.businessInfo?.hours || '9:00 AM - 9:00 PM',
      priceRange: data.businessInfo?.priceRange || '₱₱',
      features: data.businessInfo?.features || []
    },
    images: {
      hero: data.images?.hero || '',
      gallery: data.images?.gallery || []
    },
    discovery: data.discovery
  };
}

/**
 * Batch Research Tips
 */
export const RESEARCH_TIPS = `
EFFICIENT PLACE RESEARCH STRATEGY:

1. START WITH AGGREGATORS:
   - Spot.ph Top 10 lists (by category)
   - When In Manila articles
   - Zomato/Google Maps "Top Rated" 
   - TripAdvisor Manila rankings

2. AREA-BASED RESEARCH:
   - Poblacion, Makati (bars, nightlife)
   - BGC (upscale dining, activities)
   - Maginhawa, QC (indie food)
   - Kapitolyo, Pasig (food park, cafes)
   - Eastwood, QC (entertainment)
   - Alabang (family-friendly)

3. CATEGORY SHORTCUTS:
   Food Chill: Search "quiet cafes manila", "study cafes", "garden cafes"
   Food Neutral: Chain restaurants, malls, "family restaurants"
   Food Hype: "best bars manila", "rooftop bars", "nightlife"
   Activity Chill: "spas manila", "parks", "yoga studios"
   Activity Neutral: "things to do manila", malls, "family activities"
   Activity Hype: "adventure manila", "nightclubs", "extreme sports"
   Something New Chill: "hidden cafes", "art galleries", "bookshops"
   Something New Neutral: "unique manila", "markets", "pop-ups"
   Something New Hype: "unusual activities manila", "new openings", "experiences"

4. IMAGE SOURCES:
   - Place name + "interior" or "food" in Google Images
   - Official Instagram accounts
   - Google Maps photo section
   - Blog reviews with photos

5. BATCH CREATION:
   - Research 20 places at once
   - Fill template for all 20
   - Add to appropriate array
   - Run population script
   - Verify with audit script
`;

console.log(RESEARCH_TIPS);


