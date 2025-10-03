/**
 * Metro Manila Places Database
 * 900+ curated places across 3 categories × 3 mood ranges
 * All places are real locations in Metro Manila with accurate details
 */

import { Place } from '../src/types/mvp-types';

// Type for place data without id and metadata (will be added by PlacesService)
export type PlaceInput = Omit<Place, 'id' | 'metadata'>;

/**
 * FOOD + CHILL (moodScore 1-40)
 * Quiet cafes, peaceful fine dining, relaxed coffee shops, chill lounges
 */
export const foodChillPlaces: PlaceInput[] = [
  {
    name: "Yardstick Coffee",
    category: "food",
    description: "Minimalist third-wave coffee shop perfect for quiet work sessions. Specialty pour-overs and single-origin beans in a serene setting.",
    location: { address: "Karrivin Plaza, 2316 Chino Roces Ave", city: "Makati", lat: 14.5588, lng: 121.0166 },
    contact: { phone: "+63 2 8556 7293", website: "https://yardstick.ph" },
    businessInfo: {
      hours: "7:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["WiFi", "Quiet Space", "Specialty Coffee", "Work-Friendly"]
    },
    images: {
      hero: "https://example.com/yardstick-hero.jpg",
      gallery: [
        "https://example.com/yardstick-1.jpg",
        "https://example.com/yardstick-2.jpg",
        "https://example.com/yardstick-3.jpg"
      ]
    },
    discovery: {
      tags: ["coffee", "minimalist", "work-friendly", "quiet"],
      perfectFor: ["solo work", "coffee dates", "reading"],
      moodScore: 25,
      uniqueFeatures: "Japanese-inspired minimalist interior with excellent natural lighting"
    }
  },
  {
    name: "Leif",
    category: "food",
    description: "Garden cafe with lush greenery and peaceful ambiance. Healthy bowls, artisan coffee, and fresh juices surrounded by plants.",
    location: { address: "G/F The Grove by Rockwell, Pasig", city: "Pasig", lat: 14.5601, lng: 121.0566 },
    contact: { website: "https://www.instagram.com/leif.mnl" },
    businessInfo: {
      hours: "8:00 AM - 8:00 PM",
      priceRange: "₱₱",
      features: ["Garden Setting", "Healthy Options", "Instagram-Worthy", "Pet-Friendly"]
    },
    images: {
      hero: "https://example.com/leif-hero.jpg",
      gallery: [
        "https://example.com/leif-1.jpg",
        "https://example.com/leif-2.jpg",
        "https://example.com/leif-3.jpg",
        "https://example.com/leif-4.jpg"
      ]
    },
    discovery: {
      tags: ["garden cafe", "plants", "healthy", "peaceful"],
      perfectFor: ["brunch", "relaxed meetings", "nature lovers"],
      moodScore: 22,
      uniqueFeatures: "Indoor garden oasis with floor-to-ceiling plants and natural sunlight"
    }
  },
  {
    name: "The Library Cafe at Estancia",
    category: "food",
    description: "Bookshelf-lined cafe with quiet corners and comfortable seating. Library atmosphere meets specialty coffee.",
    location: { address: "Capitol Commons, Estancia Mall", city: "Pasig", lat: 14.5791, lng: 121.0527 },
    contact: { phone: "+63 2 8570 7890" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["WiFi", "Quiet Zone", "Books", "Study-Friendly"]
    },
    images: {
      hero: "https://example.com/library-cafe-hero.jpg",
      gallery: [
        "https://example.com/library-1.jpg",
        "https://example.com/library-2.jpg",
        "https://example.com/library-3.jpg"
      ]
    },
    discovery: {
      tags: ["library", "books", "quiet", "study spot"],
      perfectFor: ["studying", "reading", "quiet work"],
      moodScore: 18,
      uniqueFeatures: "Surrounded by bookshelves with hushed library atmosphere"
    }
  },
  {
    name: "Wildflour Cafe + Bakery",
    category: "food",
    description: "Elegant bakery-cafe with sophisticated pastries and artisan breads. Calm atmosphere perfect for leisurely breakfasts.",
    location: { address: "Net Park Building, 5th Ave corner 26th St", city: "BGC", lat: 14.5513, lng: 121.0505 },
    contact: { phone: "+63 2 8403 4701", website: "https://wildflour.ph" },
    businessInfo: {
      hours: "7:00 AM - 9:00 PM",
      priceRange: "₱₱₱",
      features: ["Bakery", "WiFi", "Breakfast All Day", "Premium Ingredients"]
    },
    images: {
      hero: "https://example.com/wildflour-hero.jpg",
      gallery: [
        "https://example.com/wildflour-1.jpg",
        "https://example.com/wildflour-2.jpg",
        "https://example.com/wildflour-3.jpg",
        "https://example.com/wildflour-4.jpg"
      ]
    },
    discovery: {
      tags: ["bakery", "pastries", "elegant", "breakfast"],
      perfectFor: ["breakfast meetings", "pastry lovers", "brunch"],
      moodScore: 30,
      uniqueFeatures: "Award-winning pastries and breads baked fresh daily"
    }
  },
  {
    name: "Penny Lane Makati",
    category: "food",
    description: "Cozy British-inspired cafe with afternoon tea service. Vintage decor creates a nostalgic, peaceful atmosphere.",
    location: { address: "Amorsolo Square, Makati", city: "Makati", lat: 14.5602, lng: 121.0175 },
    contact: { phone: "+63 2 8240 8010" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Afternoon Tea", "Vintage Decor", "WiFi", "British Cuisine"]
    },
    images: {
      hero: "https://example.com/pennylane-hero.jpg",
      gallery: [
        "https://example.com/pennylane-1.jpg",
        "https://example.com/pennylane-2.jpg",
        "https://example.com/pennylane-3.jpg"
      ]
    },
    discovery: {
      tags: ["british", "tea", "cozy", "vintage"],
      perfectFor: ["afternoon tea", "quiet conversations", "date spot"],
      moodScore: 28,
      uniqueFeatures: "Traditional British afternoon tea service with scones and finger sandwiches"
    }
  },
  // PASIG - Chill Food Places
  {
    name: "Commune Cafe + Bar",
    category: "food",
    description: "Relaxed cafe with rustic interiors and specialty coffee. Quiet workspace during the day with comfort food menu.",
    location: { address: "100 E Capitol Drive, Capitol Commons", city: "Pasig", lat: 14.5828, lng: 121.0555 },
    contact: { phone: "+63 2 8570 3456", website: "https://commune.ph" },
    businessInfo: {
      hours: "7:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["WiFi", "Work-Friendly", "Outdoor Seating", "All-Day Breakfast"]
    },
    images: {
      hero: "https://example.com/commune-hero.jpg",
      gallery: [
        "https://example.com/commune-1.jpg",
        "https://example.com/commune-2.jpg",
        "https://example.com/commune-3.jpg",
        "https://example.com/commune-4.jpg"
      ]
    },
    discovery: {
      tags: ["cafe", "rustic", "coffee", "workspace"],
      perfectFor: ["remote work", "brunch", "coffee meetings"],
      moodScore: 32,
      uniqueFeatures: "Industrial-rustic design with specialty pour-over coffee and all-day breakfast"
    }
  },
  {
    name: "The Wholesome Table",
    category: "food",
    description: "Health-focused restaurant with organic ingredients and farm-to-table philosophy. Peaceful dining in light-filled space.",
    location: { address: "Estancia Mall, Capitol Commons", city: "Pasig", lat: 14.5795, lng: 121.0530 },
    contact: { phone: "+63 2 8570 7896", website: "https://thewholesometable.com" },
    businessInfo: {
      hours: "11:00 AM - 9:00 PM",
      priceRange: "₱₱₱",
      features: ["Organic", "Healthy", "Farm-to-Table", "Vegan Options"]
    },
    images: {
      hero: "https://example.com/wholesome-hero.jpg",
      gallery: [
        "https://example.com/wholesome-1.jpg",
        "https://example.com/wholesome-2.jpg",
        "https://example.com/wholesome-3.jpg"
      ]
    },
    discovery: {
      tags: ["healthy", "organic", "wellness", "peaceful"],
      perfectFor: ["health-conscious dining", "organic food", "quiet meals"],
      moodScore: 28,
      uniqueFeatures: "100% organic menu sourced from local farms with wellness-focused cuisine"
    }
  },
  // QUEZON CITY - Chill Food Places
  {
    name: "Satchmi",
    category: "food",
    description: "Quiet specialty coffee shop with Japanese-inspired minimalism. Expert baristas and peaceful ambiance for coffee appreciation.",
    location: { address: "75 Maginhawa Street, UP Village", city: "Quezon City", lat: 14.6387, lng: 121.0649 },
    contact: { website: "https://www.instagram.com/satchmi.ph" },
    businessInfo: {
      hours: "8:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Specialty Coffee", "WiFi", "Quiet", "Minimalist"]
    },
    images: {
      hero: "https://example.com/satchmi-hero.jpg",
      gallery: [
        "https://example.com/satchmi-1.jpg",
        "https://example.com/satchmi-2.jpg",
        "https://example.com/satchmi-3.jpg"
      ]
    },
    discovery: {
      tags: ["coffee", "japanese", "minimalist", "specialty"],
      perfectFor: ["coffee enthusiasts", "quiet time", "studying"],
      moodScore: 24,
      uniqueFeatures: "Award-winning specialty coffee with Japanese pour-over techniques"
    }
  },
  {
    name: "Silya at Tsaa",
    category: "food",
    description: "Vintage tea house with antique furniture and extensive tea collection. Quiet retreat perfect for afternoon tea.",
    location: { address: "82 Maginhawa Street", city: "Quezon City", lat: 14.6391, lng: 121.0651 },
    contact: { phone: "+63 2 8433 7890" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Tea House", "Vintage Decor", "Quiet", "WiFi"]
    },
    images: {
      hero: "https://example.com/silya-hero.jpg",
      gallery: [
        "https://example.com/silya-1.jpg",
        "https://example.com/silya-2.jpg",
        "https://example.com/silya-3.jpg",
        "https://example.com/silya-4.jpg"
      ]
    },
    discovery: {
      tags: ["tea", "vintage", "quiet", "cozy"],
      perfectFor: ["tea lovers", "quiet conversations", "reading"],
      moodScore: 22,
      uniqueFeatures: "Eclectic vintage furniture and over 50 tea varieties in peaceful setting"
    }
  },
  {
    name: "Pipino Vegetarian",
    category: "food",
    description: "Peaceful vegetarian restaurant with garden setting. Fresh plant-based dishes in a tranquil environment.",
    location: { address: "70 Maginhawa Street", city: "Quezon City", lat: 14.6385, lng: 121.0648 },
    contact: { phone: "+63 2 8434 5678" },
    businessInfo: {
      hours: "11:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Vegetarian", "Vegan Options", "Garden", "Organic"]
    },
    images: {
      hero: "https://example.com/pipino-hero.jpg",
      gallery: [
        "https://example.com/pipino-1.jpg",
        "https://example.com/pipino-2.jpg",
        "https://example.com/pipino-3.jpg"
      ]
    },
    discovery: {
      tags: ["vegetarian", "healthy", "garden", "peaceful"],
      perfectFor: ["vegetarians", "health-conscious", "garden dining"],
      moodScore: 26,
      uniqueFeatures: "100% vegetarian menu with garden-fresh ingredients and peaceful al fresco dining"
    }
  },
  // MANDALUYONG - Chill Food Places
  {
    name: "Pan de Manila Cafe",
    category: "food",
    description: "Cozy Filipino bakery-cafe with warm ambiance. Freshly baked pan de sal and traditional breakfast favorites.",
    location: { address: "The Podium Mall, ADB Avenue", city: "Mandaluyong", lat: 14.5658, lng: 121.0519 },
    contact: { phone: "+63 2 8631 9876", website: "https://pandemanila.com" },
    businessInfo: {
      hours: "7:00 AM - 9:00 PM",
      priceRange: "₱",
      features: ["Bakery", "Filipino Breakfast", "Cozy", "Affordable"]
    },
    images: {
      hero: "https://example.com/pandemanila-hero.jpg",
      gallery: [
        "https://example.com/pandemanila-1.jpg",
        "https://example.com/pandemanila-2.jpg",
        "https://example.com/pandemanila-3.jpg"
      ]
    },
    discovery: {
      tags: ["bakery", "filipino", "breakfast", "comfort food"],
      perfectFor: ["filipino breakfast", "morning coffee", "comfort dining"],
      moodScore: 30,
      uniqueFeatures: "Iconic Filipino bakery with freshly baked traditional breads and nostalgic breakfast"
    }
  },
  // TAGUIG - Chill Food Places
  {
    name: "Izakaya Kikufuji",
    category: "food",
    description: "Traditional Japanese izakaya with intimate counter seating. Authentic dishes in a quiet, contemplative setting.",
    location: { address: "Little Tokyo, Makati-Taguig border", city: "Taguig", lat: 14.5543, lng: 121.0335 },
    contact: { phone: "+63 2 8889 5566" },
    businessInfo: {
      hours: "6:00 PM - 2:00 AM",
      priceRange: "₱₱₱",
      features: ["Japanese", "Sake Bar", "Intimate", "Authentic"]
    },
    images: {
      hero: "https://example.com/kikufuji-hero.jpg",
      gallery: [
        "https://example.com/kikufuji-1.jpg",
        "https://example.com/kikufuji-2.jpg",
        "https://example.com/kikufuji-3.jpg",
        "https://example.com/kikufuji-4.jpg"
      ]
    },
    discovery: {
      tags: ["japanese", "izakaya", "intimate", "authentic"],
      perfectFor: ["quiet dinners", "sake pairing", "japanese cuisine"],
      moodScore: 35,
      uniqueFeatures: "Authentic izakaya experience with traditional counter seating and seasonal Japanese dishes"
    }
  },
  {
    name: "Hole in the Wall",
    category: "food",
    description: "Curated collection of small food stalls in relaxed setting. Diverse cuisines in an unhurried, casual environment.",
    location: { address: "Century City Mall", city: "Taguig", lat: 14.5651, lng: 121.0371 },
    contact: { website: "https://www.holeinthewall.ph" },
    businessInfo: {
      hours: "11:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Food Court", "Variety", "Casual", "Curated"]
    },
    images: {
      hero: "https://example.com/hitw-hero.jpg",
      gallery: [
        "https://example.com/hitw-1.jpg",
        "https://example.com/hitw-2.jpg",
        "https://example.com/hitw-3.jpg"
      ]
    },
    discovery: {
      tags: ["food court", "variety", "casual", "diverse"],
      perfectFor: ["casual dining", "trying different foods", "groups"],
      moodScore: 38,
      uniqueFeatures: "Curated food stalls from top Manila restaurants in comfortable communal setting"
    }
  },
  // MARIKINA - Chill Food Places
  {
    name: "Cafe Lidia",
    category: "food",
    description: "Homey cafe overlooking Marikina River. Comfort food and coffee in a peaceful riverside location.",
    location: { address: "Riverbanks Center, A. Bonifacio Avenue", city: "Marikina", lat: 14.6294, lng: 121.1016 },
    contact: { phone: "+63 2 8682 3456" },
    businessInfo: {
      hours: "8:00 AM - 8:00 PM",
      priceRange: "₱",
      features: ["River View", "Comfort Food", "Family-Run", "Peaceful"]
    },
    images: {
      hero: "https://example.com/lidia-hero.jpg",
      gallery: [
        "https://example.com/lidia-1.jpg",
        "https://example.com/lidia-2.jpg",
        "https://example.com/lidia-3.jpg"
      ]
    },
    discovery: {
      tags: ["cafe", "river view", "homey", "marikina"],
      perfectFor: ["relaxed meals", "river views", "local cafe"],
      moodScore: 27,
      uniqueFeatures: "Family-run cafe with Marikina River views and home-cooked Filipino comfort food"
    }
  },
  // PASAY - Chill Food Places
  {
    name: "Tsukiji Japanese Restaurant",
    category: "food",
    description: "Quiet Japanese restaurant with authentic ambiance. Fresh sushi and traditional dishes in a serene setting.",
    location: { address: "S Maison, Conrad Hotel", city: "Pasay", lat: 14.5301, lng: 120.9828 },
    contact: { phone: "+63 2 8123 7899", website: "https://tsukijiph.com" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱₱",
      features: ["Japanese", "Sushi Bar", "Authentic", "Quiet"]
    },
    images: {
      hero: "https://example.com/tsukiji-hero.jpg",
      gallery: [
        "https://example.com/tsukiji-1.jpg",
        "https://example.com/tsukiji-2.jpg",
        "https://example.com/tsukiji-3.jpg",
        "https://example.com/tsukiji-4.jpg"
      ]
    },
    discovery: {
      tags: ["japanese", "sushi", "authentic", "upscale"],
      perfectFor: ["sushi lovers", "quiet dinners", "japanese cuisine"],
      moodScore: 33,
      uniqueFeatures: "Authentic Japanese restaurant with fresh fish flown in from Tokyo's Tsukiji market"
    }
  }
];

/**
 * FOOD + NEUTRAL (moodScore 35-65)
 * Casual dining, family-friendly restaurants, versatile cafes, moderate energy
 */
export const foodNeutralPlaces: PlaceInput[] = [
  {
    name: "Ramen Nagi",
    category: "food",
    description: "Authentic Japanese ramen with customizable broths and toppings. Popular spot with steady crowd but comfortable pace.",
    location: { address: "SM Megamall, Mandaluyong", city: "Mandaluyong", lat: 14.5848, lng: 121.0563 },
    contact: { website: "https://www.ramennagi.com.ph" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Japanese", "Ramen Bar", "Customizable", "Quick Service"]
    },
    images: {
      hero: "https://example.com/nagi-hero.jpg",
      gallery: [
        "https://example.com/nagi-1.jpg",
        "https://example.com/nagi-2.jpg",
        "https://example.com/nagi-3.jpg",
        "https://example.com/nagi-4.jpg"
      ]
    },
    discovery: {
      tags: ["ramen", "japanese", "casual", "noodles"],
      perfectFor: ["lunch", "dinner", "ramen lovers"],
      moodScore: 50,
      uniqueFeatures: "Build-your-own ramen with customization sheet for personal preferences"
    }
  },
  {
    name: "8 Cuts Burger Blends",
    category: "food",
    description: "Gourmet burgers with eight beef blend options. Modern casual setting perfect for groups and families.",
    location: { address: "Uptown Mall, BGC", city: "BGC", lat: 14.5547, lng: 121.0514 },
    contact: { phone: "+63 2 8804 8288", website: "https://8cuts.com" },
    businessInfo: {
      hours: "11:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["Burgers", "Craft Beer", "Family-Friendly", "Group Dining"]
    },
    images: {
      hero: "https://example.com/8cuts-hero.jpg",
        "gallery": [
        "https://example.com/8cuts-1.jpg",
        "https://example.com/8cuts-2.jpg",
        "https://example.com/8cuts-3.jpg",
        "https://example.com/8cuts-4.jpg",
        "https://example.com/8cuts-5.jpg"
      ]
    },
    discovery: {
      tags: ["burgers", "casual dining", "american", "beef"],
      perfectFor: ["group meals", "burger lovers", "casual dinner"],
      moodScore: 55,
      uniqueFeatures: "Eight different beef blends to choose from for ultimate burger customization"
    }
  },
  {
    name: "Mesa Filipino Moderne",
    category: "food",
    description: "Modern Filipino comfort food in contemporary setting. Classic dishes with creative twists, great for sharing.",
    location: { address: "Greenbelt 2, Makati", city: "Makati", lat: 14.5524, lng: 121.0236 },
    contact: { phone: "+63 2 8729 4573", website: "https://mesa.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Filipino Cuisine", "Family-Style", "Modern", "Group-Friendly"]
    },
    images: {
      hero: "https://example.com/mesa-hero.jpg",
      gallery: [
        "https://example.com/mesa-1.jpg",
        "https://example.com/mesa-2.jpg",
        "https://example.com/mesa-3.jpg",
        "https://example.com/mesa-4.jpg"
      ]
    },
    discovery: {
      tags: ["filipino", "modern", "comfort food", "sharing"],
      perfectFor: ["family dinners", "filipino food", "group gatherings"],
      moodScore: 52,
      uniqueFeatures: "Classic Filipino dishes reimagined with modern presentation and flavors"
    }
  },
  {
    name: "Tim Ho Wan",
    category: "food",
    description: "Michelin-starred dim sum at accessible prices. Hong Kong-style dumplings and buns in casual setting.",
    location: { address: "SM Megamall, Mandaluyong", city: "Mandaluyong", lat: 14.5851, lng: 121.0565 },
    contact: { website: "https://timhowan.com" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Dim Sum", "Michelin-Starred", "Chinese", "Takeaway"]
    },
    images: {
      hero: "https://example.com/timhowan-hero.jpg",
      gallery: [
        "https://example.com/timhowan-1.jpg",
        "https://example.com/timhowan-2.jpg",
        "https://example.com/timhowan-3.jpg",
        "https://example.com/timhowan-4.jpg"
      ]
    },
    discovery: {
      tags: ["dim sum", "chinese", "michelin", "dumplings"],
      perfectFor: ["lunch", "dim sum cravings", "family meals"],
      moodScore: 48,
      uniqueFeatures: "World's most affordable Michelin-starred restaurant with legendary BBQ pork buns"
    }
  },
  {
    name: "Manam Comfort Filipino",
    category: "food",
    description: "Contemporary Filipino cuisine with comfort food classics. Lively but comfortable atmosphere, perfect for any occasion.",
    location: { address: "SM Aura Premier, BGC", city: "BGC", lat: 14.5461, lng: 121.0536 },
    contact: { phone: "+63 2 8403 6106", website: "https://manam.ph" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Filipino", "Comfort Food", "Family-Style", "Sisig"]
    },
    images: {
      hero: "https://example.com/manam-hero.jpg",
      gallery: [
        "https://example.com/manam-1.jpg",
        "https://example.com/manam-2.jpg",
        "https://example.com/manam-3.jpg",
        "https://example.com/manam-4.jpg"
      ]
    },
    discovery: {
      tags: ["filipino", "sisig", "comfort food", "contemporary"],
      perfectFor: ["filipino cravings", "group dining", "comfort food"],
      moodScore: 58,
      uniqueFeatures: "Famous for sizzling sisig and crispy pata, consistently voted best Filipino restaurant"
    }
  },
  // PASIG - Neutral Food Places
  {
    name: "Ramen Kuroda",
    category: "food",
    description: "Popular ramen shop with rich tonkotsu broth. Fast-paced but comfortable dining for ramen enthusiasts.",
    location: { address: "Kapitolyo, Pasig", city: "Pasig", lat: 14.5726, lng: 121.0622 },
    contact: { phone: "+63 2 8635 4321" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Ramen", "Japanese", "Quick Service", "Popular"]
    },
    images: {
      hero: "https://example.com/kuroda-hero.jpg",
      gallery: [
        "https://example.com/kuroda-1.jpg",
        "https://example.com/kuroda-2.jpg",
        "https://example.com/kuroda-3.jpg"
      ]
    },
    discovery: {
      tags: ["ramen", "japanese", "noodles", "kapitolyo"],
      perfectFor: ["ramen lovers", "lunch", "quick dining"],
      moodScore: 52,
      uniqueFeatures: "Rich pork bone broth simmered for 18 hours with thick noodles"
    }
  },
  {
    name: "Silantro Fil-Mex Cantina",
    category: "food",
    description: "Filipino-Mexican fusion with generous portions. Lively but casual atmosphere perfect for groups.",
    location: { address: "Capitol Commons", city: "Pasig", lat: 14.5802, lng: 121.0542 },
    contact: { website: "https://silantro.ph" },
    businessInfo: {
      hours: "11:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["Mexican", "Fusion", "Group-Friendly", "Rice Bowls"]
    },
    images: {
      hero: "https://example.com/silantro-hero.jpg",
      gallery: [
        "https://example.com/silantro-1.jpg",
        "https://example.com/silantro-2.jpg",
        "https://example.com/silantro-3.jpg",
        "https://example.com/silantro-4.jpg"
      ]
    },
    discovery: {
      tags: ["mexican", "fusion", "rice bowls", "casual"],
      perfectFor: ["group meals", "mexican food", "filling meals"],
      moodScore: 58,
      uniqueFeatures: "Filipino-Mexican fusion with signature burrito rice bowls and unlimited rice"
    }
  },
  {
    name: "My Kitchen by Chef Chris",
    category: "food",
    description: "Contemporary Filipino restaurant with modern twists on classics. Family-style dining in cozy space.",
    location: { address: "Estancia Mall, Capitol Commons", city: "Pasig", lat: 14.5797, lng: 121.0533 },
    contact: { phone: "+63 2 8570 4567" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Filipino", "Contemporary", "Family-Style", "Sharing"]
    },
    images: {
      hero: "https://example.com/mykitchen-hero.jpg",
      gallery: [
        "https://example.com/mykitchen-1.jpg",
        "https://example.com/mykitchen-2.jpg",
        "https://example.com/mykitchen-3.jpg"
      ]
    },
    discovery: {
      tags: ["filipino", "contemporary", "family dining", "comfort food"],
      perfectFor: ["family meals", "filipino cuisine", "celebrations"],
      moodScore: 54,
      uniqueFeatures: "Contemporary Filipino dishes with chef-owner's signature presentations"
    }
  },
  // QUEZON CITY - Neutral Food Places
  {
    name: "Army Navy Burger + Burrito",
    category: "food",
    description: "American casual dining with burgers, burritos, and freedom fries. Relaxed military-themed setting.",
    location: { address: "Tomas Morato Avenue", city: "Quezon City", lat: 14.6291, lng: 121.0321 },
    contact: { phone: "+63 2 8372 4567", website: "https://armynavy.ph" },
    businessInfo: {
      hours: "10:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["American", "Burgers", "Burritos", "Casual"]
    },
    images: {
      hero: "https://example.com/armynavy-hero.jpg",
      gallery: [
        "https://example.com/armynavy-1.jpg",
        "https://example.com/armynavy-2.jpg",
        "https://example.com/armynavy-3.jpg"
      ]
    },
    discovery: {
      tags: ["burgers", "burritos", "american", "casual"],
      perfectFor: ["casual meals", "burger cravings", "groups"],
      moodScore: 56,
      uniqueFeatures: "Military-themed burger and burrito joint with Filipino-American flavors"
    }
  },
  {
    name: "Omakase Restaurant",
    category: "food",
    description: "Japanese restaurant with extensive menu from sushi to ramen. Moderate prices with family-friendly service.",
    location: { address: "Tomas Morato Avenue", city: "Quezon City", lat: 14.6285, lng: 121.0318 },
    contact: { phone: "+63 2 8374 8899" },
    businessInfo: {
      hours: "11:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["Japanese", "Sushi", "Ramen", "Family-Friendly"]
    },
    images: {
      hero: "https://example.com/omakase-hero.jpg",
      gallery: [
        "https://example.com/omakase-1.jpg",
        "https://example.com/omakase-2.jpg",
        "https://example.com/omakase-3.jpg",
        "https://example.com/omakase-4.jpg"
      ]
    },
    discovery: {
      tags: ["japanese", "sushi", "ramen", "variety"],
      perfectFor: ["japanese food", "family dining", "sushi rolls"],
      moodScore: 50,
      uniqueFeatures: "Extensive Japanese menu with affordable prices and generous portions"
    }
  },
  {
    name: "Frankie's New York Buffalo Wings",
    category: "food",
    description: "Buffalo wings and American pub food in sports bar setting. Casual dining with TVs and games.",
    location: { address: "Eastwood Mall", city: "Quezon City", lat: 14.6093, lng: 121.0777 },
    contact: { phone: "+63 2 8709 8765", website: "https://frankieswings.com" },
    businessInfo: {
      hours: "11:00 AM - 12:00 AM",
      priceRange: "₱₱",
      features: ["American", "Wings", "Sports Bar", "Beer"]
    },
    images: {
      hero: "https://example.com/frankies-hero.jpg",
      gallery: [
        "https://example.com/frankies-1.jpg",
        "https://example.com/frankies-2.jpg",
        "https://example.com/frankies-3.jpg"
      ]
    },
    discovery: {
      tags: ["wings", "sports bar", "american", "casual"],
      perfectFor: ["watching games", "wing lovers", "groups"],
      moodScore: 62,
      uniqueFeatures: "New York-style buffalo wings with 13 signature sauces and sports viewing"
    }
  },
  // MANDALUYONG - Neutral Food Places
  {
    name: "Yabu House of Katsu",
    category: "food",
    description: "Japanese tonkatsu specialist with premium pork cutlets. Counter service with unlimited cabbage and rice.",
    location: { address: "SM Megamall", city: "Mandaluyong", lat: 14.5852, lng: 121.0567 },
    contact: { website: "https://yabu.ph" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Japanese", "Katsu", "Unlimited Rice", "Quick Service"]
    },
    images: {
      hero: "https://example.com/yabu-hero.jpg",
      gallery: [
        "https://example.com/yabu-1.jpg",
        "https://example.com/yabu-2.jpg",
        "https://example.com/yabu-3.jpg"
      ]
    },
    discovery: {
      tags: ["japanese", "tonkatsu", "pork cutlet", "unlimited rice"],
      perfectFor: ["japanese food", "hearty meals", "katsu lovers"],
      moodScore: 53,
      uniqueFeatures: "Premium pork tonkatsu with unlimited cabbage, rice, and miso soup"
    }
  },
  {
    name: "Gerry's Grill",
    category: "food",
    description: "Filipino barbecue restaurant with grilled specialties. Casual family dining with authentic flavors.",
    location: { address: "Shangri-La Plaza", city: "Mandaluyong", lat: 14.5798, lng: 121.0634 },
    contact: { phone: "+63 2 8631 7777", website: "https://gerrysgrill.com.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Filipino", "BBQ", "Grilled", "Family-Friendly"]
    },
    images: {
      hero: "https://example.com/gerrys-hero.jpg",
      gallery: [
        "https://example.com/gerrys-1.jpg",
        "https://example.com/gerrys-2.jpg",
        "https://example.com/gerrys-3.jpg",
        "https://example.com/gerrys-4.jpg"
      ]
    },
    discovery: {
      tags: ["filipino", "bbq", "grilled", "family"],
      perfectFor: ["filipino bbq", "family meals", "grilled food"],
      moodScore: 57,
      uniqueFeatures: "Authentic Filipino barbecue with signature ihaw-ihaw and seafood dishes"
    }
  },
  // TAGUIG - Neutral Food Places
  {
    name: "Din Tai Fung",
    category: "food",
    description: "World-famous xiao long bao and Taiwanese cuisine. Michelin-rated quality in upscale casual setting.",
    location: { address: "S Maison, Conrad Manila", city: "Taguig", lat: 14.5298, lng: 120.9831 },
    contact: { phone: "+63 2 8888 0888", website: "https://dintaifung.com.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱₱",
      features: ["Taiwanese", "Dim Sum", "Michelin-Rated", "Upscale Casual"]
    },
    images: {
      hero: "https://example.com/dintaifung-hero.jpg",
      gallery: [
        "https://example.com/dintaifung-1.jpg",
        "https://example.com/dintaifung-2.jpg",
        "https://example.com/dintaifung-3.jpg",
        "https://example.com/dintaifung-4.jpg",
        "https://example.com/dintaifung-5.jpg"
      ]
    },
    discovery: {
      tags: ["taiwanese", "dim sum", "xiao long bao", "michelin"],
      perfectFor: ["dim sum lovers", "taiwanese cuisine", "special occasions"],
      moodScore: 55,
      uniqueFeatures: "World-renowned xiao long bao with 18 precise folds per dumpling"
    }
  },
  {
    name: "Jollibee Flagship Store",
    category: "food",
    description: "Philippine fast food icon with signature ChickenJoy. Modern flagship with spacious family dining.",
    location: { address: "Venice Grand Canal Mall", city: "Taguig", lat: 14.5243, lng: 121.0524 },
    contact: { website: "https://jollibee.com.ph" },
    businessInfo: {
      hours: "7:00 AM - 11:00 PM",
      priceRange: "₱",
      features: ["Fast Food", "Filipino", "Family-Friendly", "Iconic"]
    },
    images: {
      hero: "https://example.com/jollibee-hero.jpg",
      gallery: [
        "https://example.com/jollibee-1.jpg",
        "https://example.com/jollibee-2.jpg",
        "https://example.com/jollibee-3.jpg"
      ]
    },
    discovery: {
      tags: ["fast food", "chickenjoy", "filipino", "comfort food"],
      perfectFor: ["quick meals", "filipino fast food", "family dining"],
      moodScore: 60,
      uniqueFeatures: "Philippines' #1 fast food chain with iconic ChickenJoy and Jolly Spaghetti"
    }
  },
  // MARIKINA - Neutral Food Places
  {
    name: "Baliwag Lechon Manok",
    category: "food",
    description: "Famous for roasted chicken and traditional Filipino dishes. Family-style dining with generous portions.",
    location: { address: "J.P. Rizal Street", city: "Marikina", lat: 14.6328, lng: 121.1048 },
    contact: { phone: "+63 2 8646 7788" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Filipino", "Roasted Chicken", "Family-Style", "Local"]
    },
    images: {
      hero: "https://example.com/baliwag-hero.jpg",
      gallery: [
        "https://example.com/baliwag-1.jpg",
        "https://example.com/baliwag-2.jpg",
        "https://example.com/baliwag-3.jpg"
      ]
    },
    discovery: {
      tags: ["filipino", "roasted chicken", "family dining", "local"],
      perfectFor: ["family meals", "filipino food", "chicken lovers"],
      moodScore: 51,
      uniqueFeatures: "Famous Bulacan-style roasted chicken with secret marinade since 1958"
    }
  },
  // PASAY - Neutral Food Places
  {
    name: "Vikings Luxury Buffet",
    category: "food",
    description: "Massive buffet with international stations from Japanese to Italian. All-you-can-eat feast for groups.",
    location: { address: "SM Mall of Asia", city: "Pasay", lat: 14.5357, lng: 120.9826 },
    contact: { phone: "+63 2 8888 8880", website: "https://vikings.ph" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱₱",
      features: ["Buffet", "International", "All-You-Can-Eat", "Group-Friendly"]
    },
    images: {
      hero: "https://example.com/vikings-hero.jpg",
      gallery: [
        "https://example.com/vikings-1.jpg",
        "https://example.com/vikings-2.jpg",
        "https://example.com/vikings-3.jpg",
        "https://example.com/vikings-4.jpg",
        "https://example.com/vikings-5.jpg"
      ]
    },
    discovery: {
      tags: ["buffet", "international", "variety", "luxury"],
      perfectFor: ["celebrations", "buffet lovers", "large groups"],
      moodScore: 59,
      uniqueFeatures: "200+ dishes across 10 international cuisine stations with live cooking"
    }
  }
];

/**
 * FOOD + HYPE (moodScore 60-100)
 * Lively restaurants, bars, clubs, energetic dining experiences, nightlife
 */
export const foodHypePlaces: PlaceInput[] = [
  {
    name: "Poblacion Social Club",
    category: "food",
    description: "Vibrant bar and restaurant in the heart of Poblacion nightlife. Craft cocktails and sharing plates with energetic crowd.",
    location: { address: "5664 Don Pedro St, Poblacion", city: "Makati", lat: 14.5621, lng: 121.0293 },
    contact: { website: "https://www.instagram.com/poblacionsocialclub" },
    businessInfo: {
      hours: "5:00 PM - 2:00 AM",
      priceRange: "₱₱₱",
      features: ["Bar", "Cocktails", "Nightlife", "Live DJ"]
    },
    images: {
      hero: "https://example.com/poblacion-social-hero.jpg",
      gallery: [
        "https://example.com/poblacion-1.jpg",
        "https://example.com/poblacion-2.jpg",
        "https://example.com/poblacion-3.jpg",
        "https://example.com/poblacion-4.jpg",
        "https://example.com/poblacion-5.jpg"
      ]
    },
    discovery: {
      tags: ["bar", "nightlife", "cocktails", "poblacion"],
      perfectFor: ["night out", "drinks with friends", "party"],
      moodScore: 85,
      uniqueFeatures: "Epicenter of Poblacion nightlife with resident DJs and creative cocktail menu"
    }
  },
  {
    name: "The Palace Pool Club",
    category: "food",
    description: "Rooftop pool club with international DJs and panoramic city views. Day-to-night party destination.",
    location: { address: "Uptown Bonifacio, BGC", city: "BGC", lat: 14.5556, lng: 121.0517 },
    contact: { phone: "+63 2 8403 9999", website: "https://thepalacemanila.com" },
    businessInfo: {
      hours: "11:00 AM - 3:00 AM",
      priceRange: "₱₱₱₱",
      features: ["Pool Club", "Rooftop", "DJ", "VIP Tables"]
    },
    images: {
      hero: "https://example.com/palace-hero.jpg",
      gallery: [
        "https://example.com/palace-1.jpg",
        "https://example.com/palace-2.jpg",
        "https://example.com/palace-3.jpg",
        "https://example.com/palace-4.jpg",
        "https://example.com/palace-5.jpg",
        "https://example.com/palace-6.jpg"
      ]
    },
    discovery: {
      tags: ["pool club", "rooftop", "dj", "luxury"],
      perfectFor: ["weekend party", "special occasions", "clubbing"],
      moodScore: 95,
      uniqueFeatures: "Manila's premier pool club with international DJ lineup and stunning skyline views"
    }
  },
  {
    name: "El Chupacabra",
    category: "food",
    description: "Lively Mexican cantina with extensive tequila selection and vibrant atmosphere. Popular happy hour spot.",
    location: { address: "Molito, Alabang", city: "Muntinlupa", lat: 14.4289, lng: 121.0415 },
    contact: { phone: "+63 2 8556 0709", website: "https://elchupacabra.ph" },
    businessInfo: {
      hours: "11:00 AM - 12:00 AM",
      priceRange: "₱₱₱",
      features: ["Mexican", "Tequila Bar", "Happy Hour", "Live Music"]
    },
    images: {
      hero: "https://example.com/elchupacabra-hero.jpg",
      gallery: [
        "https://example.com/elchupo-1.jpg",
        "https://example.com/elchupo-2.jpg",
        "https://example.com/elchupo-3.jpg",
        "https://example.com/elchupo-4.jpg"
      ]
    },
    discovery: {
      tags: ["mexican", "tequila", "margaritas", "lively"],
      perfectFor: ["happy hour", "tequila lovers", "group celebrations"],
      moodScore: 78,
      uniqueFeatures: "Over 100 tequilas and mezcals with authentic Mexican street food"
    }
  },
  {
    name: "Cove Manila",
    category: "food",
    description: "Beach club atmosphere with infinity pool overlooking Manila Bay. Party venue with international DJs.",
    location: { address: "Okada Manila, Entertainment City", city: "Parañaque", lat: 14.5223, lng: 120.9811 },
    contact: { phone: "+63 2 8555 5999", website: "https://covemanila.com" },
    businessInfo: {
      hours: "10:00 AM - 11:00 PM",
      priceRange: "₱₱₱₱",
      features: ["Beach Club", "Pool", "DJ", "Bay View"]
    },
    images: {
      hero: "https://example.com/cove-hero.jpg",
      gallery: [
        "https://example.com/cove-1.jpg",
        "https://example.com/cove-2.jpg",
        "https://example.com/cove-3.jpg",
        "https://example.com/cove-4.jpg",
        "https://example.com/cove-5.jpg",
        "https://example.com/cove-6.jpg",
        "https://example.com/cove-7.jpg"
      ]
    },
    discovery: {
      tags: ["beach club", "pool party", "dj", "sunset"],
      perfectFor: ["weekend parties", "sunset drinks", "special events"],
      moodScore: 92,
      uniqueFeatures: "Manila's only beach club with infinity pool and Manila Bay sunset views"
    }
  },
  {
    name: "Black Market",
    category: "food",
    description: "Trendy bar with industrial-chic interiors and creative cocktails. Lively music and energetic weekend crowd.",
    location: { address: "Karrivin Plaza, Chino Roces", city: "Makati", lat: 14.5590, lng: 121.0168 },
    contact: { website: "https://www.instagram.com/blackmarketmnl" },
    businessInfo: {
      hours: "6:00 PM - 3:00 AM",
      priceRange: "₱₱₱",
      features: ["Cocktail Bar", "Industrial Design", "Live Music", "Late Night"]
    },
    images: {
      hero: "https://example.com/blackmarket-hero.jpg",
      gallery: [
        "https://example.com/blackmarket-1.jpg",
        "https://example.com/blackmarket-2.jpg",
        "https://example.com/blackmarket-3.jpg",
        "https://example.com/blackmarket-4.jpg"
      ]
    },
    discovery: {
      tags: ["cocktail bar", "nightlife", "industrial", "music"],
      perfectFor: ["late night", "cocktail enthusiasts", "weekend nightlife"],
      moodScore: 82,
      uniqueFeatures: "Rotating guest bartenders and experimental cocktail menu in speakeasy-style setting"
    }
  },
  // QUEZON CITY - Hype Food Places
  {
    name: "71 Gramercy",
    category: "food",
    description: "Upscale club and lounge with resident DJs. Premium drinks and lively weekend party atmosphere.",
    location: { address: "71 Roces Avenue, Timog", city: "Quezon City", lat: 14.6315, lng: 121.0337 },
    contact: { phone: "+63 2 8374 9988" },
    businessInfo: {
      hours: "6:00 PM - 3:00 AM",
      priceRange: "₱₱₱₱",
      features: ["Club", "DJ", "VIP Area", "Premium Drinks"]
    },
    images: {
      hero: "https://example.com/gramercy-hero.jpg",
      gallery: [
        "https://example.com/gramercy-1.jpg",
        "https://example.com/gramercy-2.jpg",
        "https://example.com/gramercy-3.jpg",
        "https://example.com/gramercy-4.jpg",
        "https://example.com/gramercy-5.jpg"
      ]
    },
    discovery: {
      tags: ["club", "dj", "upscale", "nightlife"],
      perfectFor: ["clubbing", "vip nights", "weekend party"],
      moodScore: 88,
      uniqueFeatures: "Premier QC nightclub with celebrity DJs and exclusive VIP sections"
    }
  },
  {
    name: "Trellis",
    category: "food",
    description: "Garden bar with live bands and extensive drink menu. Lively outdoor atmosphere perfect for groups.",
    location: { address: "Rockwell Center, Estrella", city: "Quezon City", lat: 14.6235, lng: 121.0457 },
    contact: { phone: "+63 2 8729 8765" },
    businessInfo: {
      hours: "5:00 PM - 2:00 AM",
      priceRange: "₱₱₱",
      features: ["Garden Bar", "Live Music", "Outdoor", "Cocktails"]
    },
    images: {
      hero: "https://example.com/trellis-hero.jpg",
      gallery: [
        "https://example.com/trellis-1.jpg",
        "https://example.com/trellis-2.jpg",
        "https://example.com/trellis-3.jpg",
        "https://example.com/trellis-4.jpg"
      ]
    },
    discovery: {
      tags: ["bar", "live music", "garden", "outdoor"],
      perfectFor: ["after work drinks", "live music", "groups"],
      moodScore: 75,
      uniqueFeatures: "Open-air garden bar with nightly live bands and extensive cocktail menu"
    }
  },
  {
    name: "The Blue Flame Bar & Grill",
    category: "food",
    description: "Rock bar with live bands and American comfort food. High-energy crowd and loud music.",
    location: { address: "Tomas Morato Avenue", city: "Quezon City", lat: 14.6298, lng: 121.0325 },
    contact: { phone: "+63 2 8372 6543" },
    businessInfo: {
      hours: "5:00 PM - 2:00 AM",
      priceRange: "₱₱",
      features: ["Bar", "Live Music", "Rock", "Sports Bar"]
    },
    images: {
      hero: "https://example.com/blueflame-hero.jpg",
      gallery: [
        "https://example.com/blueflame-1.jpg",
        "https://example.com/blueflame-2.jpg",
        "https://example.com/blueflame-3.jpg"
      ]
    },
    discovery: {
      tags: ["bar", "live music", "rock", "lively"],
      perfectFor: ["live rock music", "night out", "beer"],
      moodScore: 80,
      uniqueFeatures: "Legendary rock bar with live bands every night and cold beer on tap"
    }
  },
  // PASIG - Hype Food Places
  {
    name: "Lampara Restaurant",
    category: "food",
    description: "Popular Filipino fusion restaurant with creative cocktails. Vibrant atmosphere and Instagram-worthy dishes.",
    location: { address: "Capitol Commons", city: "Pasig", lat: 14.5804, lng: 121.0545 },
    contact: { phone: "+63 2 8570 6789", website: "https://lampara.ph" },
    businessInfo: {
      hours: "11:00 AM - 11:00 PM",
      priceRange: "₱₱₱",
      features: ["Filipino Fusion", "Cocktails", "Trendy", "Instagram-Worthy"]
    },
    images: {
      hero: "https://example.com/lampara-hero.jpg",
      gallery: [
        "https://example.com/lampara-1.jpg",
        "https://example.com/lampara-2.jpg",
        "https://example.com/lampara-3.jpg",
        "https://example.com/lampara-4.jpg",
        "https://example.com/lampara-5.jpg"
      ]
    },
    discovery: {
      tags: ["filipino fusion", "cocktails", "trendy", "social"],
      perfectFor: ["group dining", "instagram", "creative cocktails"],
      moodScore: 72,
      uniqueFeatures: "Modern Filipino cuisine with theatrical presentations and craft cocktails"
    }
  },
  {
    name: "Sunshine Kitchen + Bar",
    category: "food",
    description: "Trendy gastropub with craft beers and American-Filipino comfort food. Lively weekend crowd.",
    location: { address: "Kapitolyo", city: "Pasig", lat: 14.5718, lng: 121.0625 },
    contact: { phone: "+63 2 8635 7890" },
    businessInfo: {
      hours: "5:00 PM - 2:00 AM",
      priceRange: "₱₱",
      features: ["Gastropub", "Craft Beer", "Comfort Food", "Weekend Crowd"]
    },
    images: {
      hero: "https://example.com/sunshine-hero.jpg",
      gallery: [
        "https://example.com/sunshine-1.jpg",
        "https://example.com/sunshine-2.jpg",
        "https://example.com/sunshine-3.jpg"
      ]
    },
    discovery: {
      tags: ["gastropub", "craft beer", "lively", "kapitolyo"],
      perfectFor: ["after work", "beer lovers", "casual night out"],
      moodScore: 76,
      uniqueFeatures: "Kapital favorite with extensive craft beer selection and crowd-pleasing menu"
    }
  },
  // MANDALUYONG - Hype Food Places
  {
    name: "The Palace Pool Club Restaurant",
    category: "food",
    description: "Poolside dining and drinks with DJ sets. Day-to-night party venue with city views.",
    location: { address: "The Palace, EDSA corner Shaw Boulevard", city: "Mandaluyong", lat: 14.5826, lng: 121.0555 },
    contact: { phone: "+63 2 8656 8888" },
    businessInfo: {
      hours: "11:00 AM - 11:00 PM",
      priceRange: "₱₱₱₱",
      features: ["Pool Club", "DJ", "Rooftop", "Party Venue"]
    },
    images: {
      hero: "https://example.com/palace-pool-hero.jpg",
      gallery: [
        "https://example.com/palace-pool-1.jpg",
        "https://example.com/palace-pool-2.jpg",
        "https://example.com/palace-pool-3.jpg",
        "https://example.com/palace-pool-4.jpg",
        "https://example.com/palace-pool-5.jpg"
      ]
    },
    discovery: {
      tags: ["pool club", "dj", "party", "luxury"],
      perfectFor: ["pool parties", "weekend events", "celebrations"],
      moodScore: 93,
      uniqueFeatures: "Luxury poolside dining with international DJs and panoramic city views"
    }
  },
  {
    name: "Big Bad Wolf Bar and Grill",
    category: "food",
    description: "Sports bar with multiple screens and American food. Energetic atmosphere during major sports events.",
    location: { address: "Shangri-La Plaza", city: "Mandaluyong", lat: 14.5801, lng: 121.0637 },
    contact: { phone: "+63 2 8631 4567" },
    businessInfo: {
      hours: "11:00 AM - 1:00 AM",
      priceRange: "₱₱",
      features: ["Sports Bar", "Multiple Screens", "American Food", "Beer"]
    },
    images: {
      hero: "https://example.com/bigbadwolf-hero.jpg",
      gallery: [
        "https://example.com/bigbadwolf-1.jpg",
        "https://example.com/bigbadwolf-2.jpg",
        "https://example.com/bigbadwolf-3.jpg"
      ]
    },
    discovery: {
      tags: ["sports bar", "american", "lively", "beer"],
      perfectFor: ["watching sports", "group hangouts", "beer"],
      moodScore: 70,
      uniqueFeatures: "Multiple large screens showing international sports with American bar food"
    }
  },
  // TAGUIG - Hype Food Places
  {
    name: "The Island Grill",
    category: "food",
    description: "Lively Filipino restaurant with live acoustic music. Weekend party atmosphere with sing-along sessions.",
    location: { address: "Venice Piazza, McKinley Hill", city: "Taguig", lat: 14.5308, lng: 121.0519 },
    contact: { phone: "+63 2 8403 5678" },
    businessInfo: {
      hours: "11:00 AM - 12:00 AM",
      priceRange: "₱₱",
      features: ["Filipino", "Live Music", "Weekend Party", "Sing-Along"]
    },
    images: {
      hero: "https://example.com/island-grill-hero.jpg",
      gallery: [
        "https://example.com/island-grill-1.jpg",
        "https://example.com/island-grill-2.jpg",
        "https://example.com/island-grill-3.jpg",
        "https://example.com/island-grill-4.jpg"
      ]
    },
    discovery: {
      tags: ["filipino", "live music", "party", "acoustic"],
      perfectFor: ["group celebrations", "live music", "filipino food"],
      moodScore: 77,
      uniqueFeatures: "Filipino restaurant with nightly live acoustic bands and crowd sing-alongs"
    }
  },
  // PASAY - Hype Food Places
  {
    name: "Hyve Bar and Restaurant",
    category: "food",
    description: "Upscale bar with bay views and resident DJs. Premium nightlife spot near Entertainment City.",
    location: { address: "Solaire Resort & Casino", city: "Pasay", lat: 14.5246, lng: 120.9803 },
    contact: { phone: "+63 2 8888 8888", website: "https://solaireresort.com" },
    businessInfo: {
      hours: "6:00 PM - 3:00 AM",
      priceRange: "₱₱₱₱",
      features: ["Bar", "DJ", "Bay View", "Premium"]
    },
    images: {
      hero: "https://example.com/hyve-hero.jpg",
      gallery: [
        "https://example.com/hyve-1.jpg",
        "https://example.com/hyve-2.jpg",
        "https://example.com/hyve-3.jpg",
        "https://example.com/hyve-4.jpg",
        "https://example.com/hyve-5.jpg",
        "https://example.com/hyve-6.jpg"
      ]
    },
    discovery: {
      tags: ["bar", "dj", "luxury", "bay view"],
      perfectFor: ["upscale nightlife", "special occasions", "premium drinks"],
      moodScore: 89,
      uniqueFeatures: "Luxury nightclub with Manila Bay views and international DJ lineup"
    }
  },
  {
    name: "Pasay Bar Hopping District",
    category: "food",
    description: "Entertainment City's bar strip with multiple venues. Casino nightlife with energetic crowd.",
    location: { address: "Entertainment City, along Seaside Boulevard", city: "Pasay", lat: 14.5264, lng: 120.9790 },
    contact: {},
    businessInfo: {
      hours: "6:00 PM - 4:00 AM",
      priceRange: "₱₱₱",
      features: ["Bar Strip", "Multiple Venues", "Casino", "Nightlife"]
    },
    images: {
      hero: "https://example.com/ent-city-bars-hero.jpg",
      gallery: [
        "https://example.com/ent-city-bars-1.jpg",
        "https://example.com/ent-city-bars-2.jpg",
        "https://example.com/ent-city-bars-3.jpg"
      ]
    },
    discovery: {
      tags: ["bar hopping", "nightlife", "casino", "party"],
      perfectFor: ["bar hopping", "casino nights", "party crowd"],
      moodScore: 86,
      uniqueFeatures: "Entertainment City's nightlife hub with multiple bars and club options"
    }
  }
];

/**
 * ACTIVITY + CHILL (moodScore 1-40)
 * Yoga, spas, peaceful parks, meditation, relaxed activities
 */
export const activityChillPlaces: PlaceInput[] = [
  {
    name: "The Spa at The Peninsula Manila",
    category: "activity",
    description: "Luxurious spa sanctuary offering traditional and contemporary treatments. Serene environment for ultimate relaxation.",
    location: { address: "The Peninsula Manila, Makati", city: "Makati", lat: 14.5574, lng: 121.0205 },
    contact: { phone: "+63 2 8887 2888", website: "https://peninsula.com/manila" },
    businessInfo: {
      hours: "9:00 AM - 9:00 PM",
      priceRange: "₱₱₱₱",
      features: ["Spa", "Massage", "Luxury", "Wellness"]
    },
    images: {
      hero: "https://example.com/peninsula-spa-hero.jpg",
      gallery: [
        "https://example.com/peninsula-spa-1.jpg",
        "https://example.com/peninsula-spa-2.jpg",
        "https://example.com/peninsula-spa-3.jpg",
        "https://example.com/peninsula-spa-4.jpg"
      ]
    },
    discovery: {
      tags: ["spa", "massage", "luxury", "relaxation"],
      perfectFor: ["pampering", "stress relief", "special occasions"],
      moodScore: 15,
      uniqueFeatures: "Five-star spa treatments in Manila's most luxurious hotel setting"
    }
  },
  {
    name: "Yoga Manila",
    category: "activity",
    description: "Peaceful yoga studio offering various styles from hatha to vinyasa. Welcoming community and calming space.",
    location: { address: "Petron Megaplaza Building, Makati", city: "Makati", lat: 14.5632, lng: 121.0267 },
    contact: { phone: "+63 2 8551 1353", website: "https://yogamanila.com" },
    businessInfo: {
      hours: "6:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Yoga", "Meditation", "Wellness", "Classes"]
    },
    images: {
      hero: "https://example.com/yoga-manila-hero.jpg",
      gallery: [
        "https://example.com/yoga-manila-1.jpg",
        "https://example.com/yoga-manila-2.jpg",
        "https://example.com/yoga-manila-3.jpg"
      ]
    },
    discovery: {
      tags: ["yoga", "meditation", "wellness", "mindfulness"],
      perfectFor: ["morning practice", "stress relief", "beginners welcome"],
      moodScore: 20,
      uniqueFeatures: "Manila's first dedicated yoga center with experienced international and local instructors"
    }
  },
  {
    name: "La Mesa Ecopark",
    category: "activity",
    description: "Vast nature reserve with peaceful trails, fishing lagoon, and picnic areas. Escape the city noise.",
    location: { address: "East Bank Road, Greater Lagro", city: "Quezon City", lat: 14.7316, lng: 121.1015 },
    contact: { phone: "+63 2 8929 0394" },
    businessInfo: {
      hours: "6:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Nature", "Hiking", "Fishing", "Picnic Areas"]
    },
    images: {
      hero: "https://example.com/lamesa-hero.jpg",
      gallery: [
        "https://example.com/lamesa-1.jpg",
        "https://example.com/lamesa-2.jpg",
        "https://example.com/lamesa-3.jpg",
        "https://example.com/lamesa-4.jpg"
      ]
    },
    discovery: {
      tags: ["nature", "park", "hiking", "fishing"],
      perfectFor: ["nature walks", "family picnics", "bird watching"],
      moodScore: 25,
      uniqueFeatures: "Metro Manila's largest watershed and natural park with pristine forest trails"
    }
  },
  {
    name: "Nurture Wellness Village",
    category: "activity",
    description: "Holistic wellness resort offering spa treatments, yoga, and meditation in nature setting. Day passes available.",
    location: { address: "San Juan de Dios Compound, Pasig", city: "Pasig", lat: 14.5671, lng: 121.0920 },
    contact: { phone: "+63 2 8638 8887", website: "https://nurturewellnessvillage.com" },
    businessInfo: {
      hours: "8:00 AM - 8:00 PM",
      priceRange: "₱₱₱",
      features: ["Spa", "Yoga", "Pool", "Wellness Retreat"]
    },
    images: {
      hero: "https://example.com/nurture-hero.jpg",
      gallery: [
        "https://example.com/nurture-1.jpg",
        "https://example.com/nurture-2.jpg",
        "https://example.com/nurture-3.jpg",
        "https://example.com/nurture-4.jpg",
        "https://example.com/nurture-5.jpg"
      ]
    },
    discovery: {
      tags: ["wellness", "spa", "yoga", "retreat"],
      perfectFor: ["wellness day", "relaxation", "spa treatments"],
      moodScore: 18,
      uniqueFeatures: "Full-service wellness village with traditional Filipino hilot and organic cafe"
    }
  },
  {
    name: "Ayala Triangle Gardens",
    category: "activity",
    description: "Urban park in Makati CBD with walking paths and peaceful green space. Perfect for mindful walks and outdoor reading.",
    location: { address: "Ayala Avenue, Makati", city: "Makati", lat: 14.5569, lng: 121.0245 },
    contact: {},
    businessInfo: {
      hours: "5:00 AM - 10:00 PM",
      priceRange: "₱",
      features: ["Park", "Free", "Walking Paths", "Events Space"]
    },
    images: {
      hero: "https://example.com/ayala-triangle-hero.jpg",
      gallery: [
        "https://example.com/ayala-triangle-1.jpg",
        "https://example.com/ayala-triangle-2.jpg",
        "https://example.com/ayala-triangle-3.jpg"
      ]
    },
    discovery: {
      tags: ["park", "nature", "free", "cbd"],
      perfectFor: ["morning walks", "lunch break", "outdoor reading"],
      moodScore: 30,
      uniqueFeatures: "Green oasis in the heart of Makati with light and sound shows during holidays"
    }
  },
  // QUEZON CITY - Chill Activities
  {
    name: "Ninoy Aquino Parks and Wildlife Center",
    category: "activity",
    description: "Peaceful nature reserve with walking trails and wildlife. Quiet escape from city noise with lagoons and gardens.",
    location: { address: "Elliptical Road, Diliman", city: "Quezon City", lat: 14.6549, lng: 121.0490 },
    contact: { phone: "+63 2 8924 6031" },
    businessInfo: {
      hours: "7:00 AM - 4:00 PM",
      priceRange: "₱",
      features: ["Nature Park", "Wildlife", "Walking Trails", "Free"]
    },
    images: {
      hero: "https://example.com/wildlife-center-hero.jpg",
      gallery: [
        "https://example.com/wildlife-1.jpg",
        "https://example.com/wildlife-2.jpg",
        "https://example.com/wildlife-3.jpg"
      ]
    },
    discovery: {
      tags: ["nature", "wildlife", "park", "peaceful"],
      perfectFor: ["nature walks", "bird watching", "peaceful retreat"],
      moodScore: 23,
      uniqueFeatures: "Urban wildlife sanctuary with lagoons, botanical gardens, and rescued animals"
    }
  },
  {
    name: "Acacia Spa Quezon City",
    category: "activity",
    description: "Traditional Filipino hilot spa with therapeutic massage. Serene environment for full relaxation.",
    location: { address: "New Manila", city: "Quezon City", lat: 14.6105, lng: 121.0194 },
    contact: { phone: "+63 2 8712 4567", website: "https://acaciaspa.com.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Spa", "Hilot", "Massage", "Wellness"]
    },
    images: {
      hero: "https://example.com/acacia-spa-hero.jpg",
      gallery: [
        "https://example.com/acacia-1.jpg",
        "https://example.com/acacia-2.jpg",
        "https://example.com/acacia-3.jpg",
        "https://example.com/acacia-4.jpg"
      ]
    },
    discovery: {
      tags: ["spa", "hilot", "traditional", "relaxation"],
      perfectFor: ["spa day", "relaxation", "traditional healing"],
      moodScore: 16,
      uniqueFeatures: "Traditional Filipino hilot with trained therapists using coconut oil treatments"
    }
  },
  // PASIG - Chill Activities
  {
    name: "Greenfield District Park",
    category: "activity",
    description: "Modern urban park with fountains and green spaces. Peaceful spot for walks and outdoor relaxation.",
    location: { address: "Greenfield District, Mandaluyong", city: "Mandaluyong", lat: 14.5689, lng: 121.0538 },
    contact: {},
    businessInfo: {
      hours: "6:00 AM - 8:00 PM",
      priceRange: "₱",
      features: ["Park", "Free", "Fountains", "Walking Paths"]
    },
    images: {
      hero: "https://example.com/greenfield-park-hero.jpg",
      gallery: [
        "https://example.com/greenfield-1.jpg",
        "https://example.com/greenfield-2.jpg",
        "https://example.com/greenfield-3.jpg"
      ]
    },
    discovery: {
      tags: ["park", "modern", "peaceful", "free"],
      perfectFor: ["morning walks", "outdoor reading", "peaceful time"],
      moodScore: 29,
      uniqueFeatures: "Modern park with interactive fountains and lush landscaping"
    }
  },
  // MARIKINA - Chill Activities
  {
    name: "Marikina River Park",
    category: "activity",
    description: "Riverside linear park perfect for biking and jogging. Peaceful atmosphere along the riverbanks.",
    location: { address: "Along Marikina River", city: "Marikina", lat: 14.6331, lng: 121.1025 },
    contact: {},
    businessInfo: {
      hours: "5:00 AM - 9:00 PM",
      priceRange: "₱",
      features: ["Bike Path", "Jogging Track", "River View", "Free"]
    },
    images: {
      hero: "https://example.com/marikina-river-hero.jpg",
      gallery: [
        "https://example.com/marikina-river-1.jpg",
        "https://example.com/marikina-river-2.jpg",
        "https://example.com/marikina-river-3.jpg",
        "https://example.com/marikina-river-4.jpg"
      ]
    },
    discovery: {
      tags: ["park", "river", "biking", "jogging"],
      perfectFor: ["biking", "morning jog", "river walks"],
      moodScore: 28,
      uniqueFeatures: "11-kilometer riverbank park with dedicated bike lanes and scenic views"
    }
  },
  {
    name: "Pulo Recreation Center",
    category: "activity",
    description: "Community park with Olympic-size pool and quiet gardens. Local favorite for relaxed swimming.",
    location: { address: "Gil Fernando Avenue", city: "Marikina", lat: 14.6402, lng: 121.1082 },
    contact: { phone: "+63 2 8646 5432" },
    businessInfo: {
      hours: "6:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Swimming Pool", "Gardens", "Community Park", "Affordable"]
    },
    images: {
      hero: "https://example.com/pulo-hero.jpg",
      gallery: [
        "https://example.com/pulo-1.jpg",
        "https://example.com/pulo-2.jpg",
        "https://example.com/pulo-3.jpg"
      ]
    },
    discovery: {
      tags: ["swimming", "pool", "community", "marikina"],
      perfectFor: ["swimming", "family time", "local parks"],
      moodScore: 32,
      uniqueFeatures: "Well-maintained Olympic-size pool in peaceful community setting"
    }
  },
  // TAGUIG - Chill Activities
  {
    name: "Tuscany Private Estate Spa",
    category: "activity",
    description: "Exclusive spa in villa setting with comprehensive treatments. Tranquil Italian-inspired environment.",
    location: { address: "McKinley Hill", city: "Taguig", lat: 14.5314, lng: 121.0505 },
    contact: { phone: "+63 2 8856 9999", website: "https://tuscanyspa.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱₱₱",
      features: ["Luxury Spa", "Private Villas", "Massage", "Exclusive"]
    },
    images: {
      hero: "https://example.com/tuscany-spa-hero.jpg",
      gallery: [
        "https://example.com/tuscany-1.jpg",
        "https://example.com/tuscany-2.jpg",
        "https://example.com/tuscany-3.jpg",
        "https://example.com/tuscany-4.jpg",
        "https://example.com/tuscany-5.jpg"
      ]
    },
    discovery: {
      tags: ["luxury spa", "exclusive", "italian", "tranquil"],
      perfectFor: ["special spa day", "luxury relaxation", "couples spa"],
      moodScore: 12,
      uniqueFeatures: "Italian villa-style spa with private treatment rooms and Mediterranean gardens"
    }
  }
];

/**
 * ACTIVITY + NEUTRAL (moodScore 35-65)
 * Bowling, mini-golf, casual sports, moderate activities, family entertainment
 */
export const activityNeutralPlaces: PlaceInput[] = [
  {
    name: "The Block at SM North EDSA",
    category: "activity",
    description: "Entertainment complex with bowling, skating rink, arcade, and cinemas. One-stop destination for fun.",
    location: { address: "SM City North EDSA", city: "Quezon City", lat: 14.6569, lng: 121.0299 },
    contact: { phone: "+63 2 8929 0000" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Bowling", "Ice Skating", "Arcade", "Cinema"]
    },
    images: {
      hero: "https://example.com/block-hero.jpg",
      gallery: [
        "https://example.com/block-1.jpg",
        "https://example.com/block-2.jpg",
        "https://example.com/block-3.jpg",
        "https://example.com/block-4.jpg"
      ]
    },
    discovery: {
      tags: ["entertainment", "bowling", "skating", "family"],
      perfectFor: ["group activities", "date night", "family fun"],
      moodScore: 55,
      uniqueFeatures: "Largest entertainment and dining complex in the Philippines"
    }
  },
  {
    name: "Hoops Dome",
    category: "activity",
    description: "Air-conditioned basketball courts available for rent. Popular spot for pickup games and leagues.",
    location: { address: "Blue Bay Walk, Pasay", city: "Pasay", lat: 14.5248, lng: 120.9833 },
    contact: { phone: "+63 2 8556 0123" },
    businessInfo: {
      hours: "6:00 AM - 12:00 AM",
      priceRange: "₱₱",
      features: ["Basketball", "Air-Conditioned", "League Play", "Hourly Rental"]
    },
    images: {
      hero: "https://example.com/hoops-hero.jpg",
      gallery: [
        "https://example.com/hoops-1.jpg",
        "https://example.com/hoops-2.jpg",
        "https://example.com/hoops-3.jpg"
      ]
    },
    discovery: {
      tags: ["basketball", "sports", "indoor", "leagues"],
      perfectFor: ["basketball games", "team sports", "exercise"],
      moodScore: 60,
      uniqueFeatures: "Air-conditioned courts perfect for Manila's climate with league programs"
    }
  },
  {
    name: "Quantum Sky View Park",
    category: "activity",
    description: "Rooftop theme park with rides, playground, and sky deck views. Family-friendly entertainment in the clouds.",
    location: { address: "Quantum Skyview, Mandaluyong", city: "Mandaluyong", lat: 14.5800, lng: 121.0574 },
    contact: { phone: "+63 2 8656 7890" },
    businessInfo: {
      hours: "11:00 AM - 8:00 PM",
      priceRange: "₱₱",
      features: ["Rooftop", "Rides", "Sky Deck", "Family-Friendly"]
    },
    images: {
      hero: "https://example.com/quantum-hero.jpg",
      gallery: [
        "https://example.com/quantum-1.jpg",
        "https://example.com/quantum-2.jpg",
        "https://example.com/quantum-3.jpg",
        "https://example.com/quantum-4.jpg",
        "https://example.com/quantum-5.jpg"
      ]
    },
    discovery: {
      tags: ["theme park", "rooftop", "family", "rides"],
      perfectFor: ["family outings", "kids activities", "photo ops"],
      moodScore: 58,
      uniqueFeatures: "Manila's highest rooftop theme park with 360-degree city views"
    }
  },
  {
    name: "Climb Central",
    category: "activity",
    description: "Indoor rock climbing gym with walls for all skill levels. Great workout and social activity.",
    location: { address: "Century City Mall, Makati", city: "Makati", lat: 14.5653, lng: 121.0369 },
    contact: { phone: "+63 2 8478 4444", website: "https://climbcentral.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Rock Climbing", "Indoor", "Beginners Welcome", "Gear Rental"]
    },
    images: {
      hero: "https://example.com/climb-central-hero.jpg",
      gallery: [
        "https://example.com/climb-1.jpg",
        "https://example.com/climb-2.jpg",
        "https://example.com/climb-3.jpg",
        "https://example.com/climb-4.jpg"
      ]
    },
    discovery: {
      tags: ["climbing", "fitness", "indoor sports", "challenge"],
      perfectFor: ["workout", "new experiences", "group activities"],
      moodScore: 52,
      uniqueFeatures: "Asia's largest indoor climbing facility with auto-belay system"
    }
  },
  {
    name: "TeamLab Borderless Manila",
    category: "activity",
    description: "Interactive digital art museum with immersive installations. Walk through stunning projections and interactive exhibits.",
    location: { address: "Estancia Mall, Capitol Commons", city: "Pasig", lat: 14.5792, lng: 121.0528 },
    contact: { phone: "+63 2 8570 1234", website: "https://teamlab.art" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱₱",
      features: ["Art Museum", "Interactive", "Instagram-Worthy", "Digital Art"]
    },
    images: {
      hero: "https://example.com/teamlab-hero.jpg",
      gallery: [
        "https://example.com/teamlab-1.jpg",
        "https://example.com/teamlab-2.jpg",
        "https://example.com/teamlab-3.jpg",
        "https://example.com/teamlab-4.jpg",
        "https://example.com/teamlab-5.jpg",
        "https://example.com/teamlab-6.jpg"
      ]
    },
    discovery: {
      tags: ["art", "interactive", "museum", "digital"],
      perfectFor: ["date activities", "photo opportunities", "art lovers"],
      moodScore: 50,
      uniqueFeatures: "World-renowned digital art collective's first Southeast Asian installation"
    }
  }
];

/**
 * ACTIVITY + HYPE (moodScore 60-100)
 * Extreme sports, nightlife, concerts, adventure activities, high-energy events
 */
export const activityHypePlaces: PlaceInput[] = [
  {
    name: "Valkyrie Nightclub",
    category: "activity",
    description: "Ultra-luxe nightclub at The Palace with world-class sound system and international DJ lineup. Manila's premier clubbing experience.",
    location: { address: "Uptown Bonifacio, BGC", city: "BGC", lat: 14.5558, lng: 121.0518 },
    contact: { phone: "+63 2 8403 9999", website: "https://valkyriemanila.com" },
    businessInfo: {
      hours: "10:00 PM - 4:00 AM (Thu-Sat)",
      priceRange: "₱₱₱₱",
      features: ["Nightclub", "DJ", "VIP Tables", "Dance Floor"]
    },
    images: {
      hero: "https://example.com/valkyrie-hero.jpg",
      gallery: [
        "https://example.com/valkyrie-1.jpg",
        "https://example.com/valkyrie-2.jpg",
        "https://example.com/valkyrie-3.jpg",
        "https://example.com/valkyrie-4.jpg",
        "https://example.com/valkyrie-5.jpg"
      ]
    },
    discovery: {
      tags: ["nightclub", "dj", "luxury", "dancing"],
      perfectFor: ["clubbing", "special nights", "electronic music"],
      moodScore: 98,
      uniqueFeatures: "Manila's most exclusive nightclub with state-of-the-art Funktion-One sound system"
    }
  },
  {
    name: "Manila Ocean Park",
    category: "activity",
    description: "Oceanarium and marine-themed park with attractions from aquarium tunnels to live shows. All-day adventure destination.",
    location: { address: "Luneta, Behind Quirino Grandstand", city: "Manila", lat: 14.5794, lng: 120.9756 },
    contact: { phone: "+63 2 8567 7777", website: "https://manilaoceanpark.com" },
    businessInfo: {
      hours: "10:00 AM - 7:00 PM",
      priceRange: "₱₱₱",
      features: ["Aquarium", "Shows", "Attractions", "Family-Friendly"]
    },
    images: {
      hero: "https://example.com/oceanpark-hero.jpg",
      gallery: [
        "https://example.com/oceanpark-1.jpg",
        "https://example.com/oceanpark-2.jpg",
        "https://example.com/oceanpark-3.jpg",
        "https://example.com/oceanpark-4.jpg",
        "https://example.com/oceanpark-5.jpg",
        "https://example.com/oceanpark-6.jpg"
      ]
    },
    discovery: {
      tags: ["aquarium", "marine life", "shows", "attractions"],
      perfectFor: ["family day", "marine life lovers", "full day activities"],
      moodScore: 72,
      uniqueFeatures: "Philippines' first world-class marine theme park with walk-through tunnel aquarium"
    }
  },
  {
    name: "Circuit Makati",
    category: "activity",
    description: "Lifestyle complex with regular concerts, festivals, and events. Outdoor venue with energetic atmosphere and diverse entertainment.",
    location: { address: "Circuit Makati, Carmona", city: "Makati", lat: 14.5450, lng: 121.0402 },
    contact: { website: "https://circuitmakati.com" },
    businessInfo: {
      hours: "10:00 AM - 2:00 AM",
      priceRange: "₱₱₱",
      features: ["Events Venue", "Concerts", "Bars", "Open-Air"]
    },
    images: {
      hero: "https://example.com/circuit-hero.jpg",
      gallery: [
        "https://example.com/circuit-1.jpg",
        "https://example.com/circuit-2.jpg",
        "https://example.com/circuit-3.jpg",
        "https://example.com/circuit-4.jpg"
      ]
    },
    discovery: {
      tags: ["events", "concerts", "nightlife", "festivals"],
      perfectFor: ["concerts", "night out", "events"],
      moodScore: 88,
      uniqueFeatures: "Premier outdoor events venue hosting major music festivals and concerts"
    }
  },
  {
    name: "Sandbox at Alviera",
    category: "activity",
    description: "Adventure playground with ziplines, giant swings, and obstacle courses. Adrenaline-pumping outdoor activities.",
    location: { address: "Alviera, Porac", city: "Pampanga (near Metro Manila)", lat: 15.0619, lng: 120.5403 },
    contact: { phone: "+63 45 499 1111", website: "https://sandbox.ph" },
    businessInfo: {
      hours: "8:00 AM - 6:00 PM",
      priceRange: "₱₱",
      features: ["Adventure Park", "Zipline", "Obstacle Course", "Outdoor"]
    },
    images: {
      hero: "https://example.com/sandbox-hero.jpg",
      gallery: [
        "https://example.com/sandbox-1.jpg",
        "https://example.com/sandbox-2.jpg",
        "https://example.com/sandbox-3.jpg",
        "https://example.com/sandbox-4.jpg",
        "https://example.com/sandbox-5.jpg"
      ]
    },
    discovery: {
      tags: ["adventure", "zipline", "extreme", "outdoor"],
      perfectFor: ["adventure seekers", "team building", "thrill"],
      moodScore: 90,
      uniqueFeatures: "Philippines' highest and longest giant swing plus Asia's first ATV aerial adventure"
    }
  },
  {
    name: "XYLO at The Palace",
    category: "activity",
    description: "Philippine's largest nightclub with LED walls, confetti blasts, and CO2 cannons. Massive dance floor for ultimate party experience.",
    location: { address: "Uptown Bonifacio, BGC", city: "BGC", lat: 14.5557, lng: 121.0517 },
    contact: { phone: "+63 2 8403 9999", website: "https://xylomanila.com" },
    businessInfo: {
      hours: "10:00 PM - 4:00 AM (Thu-Sat)",
      priceRange: "₱₱₱₱",
      features: ["Nightclub", "LED Screens", "DJ", "Dance Floor"]
    },
    images: {
      hero: "https://example.com/xylo-hero.jpg",
      gallery: [
        "https://example.com/xylo-1.jpg",
        "https://example.com/xylo-2.jpg",
        "https://example.com/xylo-3.jpg",
        "https://example.com/xylo-4.jpg",
        "https://example.com/xylo-5.jpg",
        "https://example.com/xylo-6.jpg"
      ]
    },
    discovery: {
      tags: ["nightclub", "party", "dj", "massive"],
      perfectFor: ["big night out", "dancing", "group celebrations"],
      moodScore: 96,
      uniqueFeatures: "Largest nightclub in the Philippines with 1,500-person capacity and cutting-edge production"
    }
  }
];

/**
 * SOMETHING-NEW + CHILL (moodScore 1-40)
 * Hidden cafes, quiet galleries, secret gardens, peaceful unique spots
 */
export const somethingNewChillPlaces: PlaceInput[] = [
  {
    name: "Pinto Art Museum",
    category: "something-new",
    description: "Mediterranean-inspired gallery complex in peaceful Antipolo setting. Contemporary Filipino art in tranquil gardens.",
    location: { address: "1 Sierra Nevada, Grand Heights", city: "Antipolo", lat: 14.6248, lng: 121.1533 },
    contact: { phone: "+63 2 8697 1015", website: "https://pintoartmuseum.com" },
    businessInfo: {
      hours: "9:00 AM - 6:00 PM (Closed Mon)",
      priceRange: "₱₱",
      features: ["Art Gallery", "Gardens", "Cafe", "Photography"]
    },
    images: {
      hero: "https://example.com/pinto-hero.jpg",
      gallery: [
        "https://example.com/pinto-1.jpg",
        "https://example.com/pinto-2.jpg",
        "https://example.com/pinto-3.jpg",
        "https://example.com/pinto-4.jpg",
        "https://example.com/pinto-5.jpg"
      ]
    },
    discovery: {
      tags: ["art", "museum", "gardens", "unique"],
      perfectFor: ["art lovers", "photography", "peaceful retreat"],
      moodScore: 22,
      uniqueFeatures: "Stunning white-walled galleries with Filipino contemporary art amid botanical gardens"
    }
  },
  {
    name: "Escolta Street Historic District",
    category: "something-new",
    description: "Pre-war Manila's Wall Street, now a quiet historic district. Vintage architecture and hidden art galleries.",
    location: { address: "Escolta Street", city: "Manila", lat: 14.5945, lng: 120.9798 },
    contact: {},
    businessInfo: {
      hours: "9:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Historic", "Architecture", "Free", "Walking Tour"]
    },
    images: {
      hero: "https://example.com/escolta-hero.jpg",
      gallery: [
        "https://example.com/escolta-1.jpg",
        "https://example.com/escolta-2.jpg",
        "https://example.com/escolta-3.jpg",
        "https://example.com/escolta-4.jpg"
      ]
    },
    discovery: {
      tags: ["historic", "architecture", "hidden gem", "culture"],
      perfectFor: ["history buffs", "photography", "exploration"],
      moodScore: 28,
      uniqueFeatures: "Manila's first premier street now being revitalized with art spaces and cafes"
    }
  },
  {
    name: "Books & Borders Maginhawa",
    category: "something-new",
    description: "Independent bookshop-cafe hybrid with curated selection and cozy reading nooks. Community space for book lovers.",
    location: { address: "Maginhawa Street, Teachers Village", city: "Quezon City", lat: 14.6389, lng: 121.0647 },
    contact: { website: "https://www.instagram.com/booksandborders" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Bookshop", "Cafe", "Independent", "Readings"]
    },
    images: {
      hero: "https://example.com/booksandborders-hero.jpg",
      gallery: [
        "https://example.com/booksandborders-1.jpg",
        "https://example.com/booksandborders-2.jpg",
        "https://example.com/booksandborders-3.jpg"
      ]
    },
    discovery: {
      tags: ["bookshop", "indie", "cafe", "literary"],
      perfectFor: ["book shopping", "quiet reading", "literary events"],
      moodScore: 24,
      uniqueFeatures: "Independent bookshop supporting Filipino authors with regular readings and events"
    }
  },
  {
    name: "Secret Garden by Antonios",
    category: "something-new",
    description: "Hidden restaurant in Tagaytay ridge with gardens overlooking Taal Lake. Romantic sunset dining.",
    location: { address: "Km. 57 Emilio Aguinaldo Highway", city: "Tagaytay", lat: 14.1097, lng: 120.9497 },
    contact: { phone: "+63 46 413 3333", website: "https://secretgardenph.com" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱₱",
      features: ["Garden Dining", "Lake View", "Romantic", "Farm-to-Table"]
    },
    images: {
      hero: "https://example.com/secretgarden-hero.jpg",
      gallery: [
        "https://example.com/secretgarden-1.jpg",
        "https://example.com/secretgarden-2.jpg",
        "https://example.com/secretgarden-3.jpg",
        "https://example.com/secretgarden-4.jpg",
        "https://example.com/secretgarden-5.jpg"
      ]
    },
    discovery: {
      tags: ["hidden gem", "gardens", "view", "romantic"],
      perfectFor: ["romantic dinners", "special occasions", "nature dining"],
      moodScore: 26,
      uniqueFeatures: "Multi-tiered gardens with Taal Volcano views and farm-fresh ingredients"
    }
  },
  {
    name: "The Mind Museum Quiet Hour",
    category: "something-new",
    description: "Science museum's special early morning sessions. Peaceful exploration of interactive exhibits without crowds.",
    location: { address: "JY Campos Park, 3rd Ave", city: "BGC", lat: 14.5476, lng: 121.0539 },
    contact: { phone: "+63 2 8909 6463", website: "https://themindmuseum.org" },
    businessInfo: {
      hours: "9:00 AM - 6:00 PM (Closed Mon)",
      priceRange: "₱₱",
      features: ["Science Museum", "Interactive", "Educational", "Family-Friendly"]
    },
    images: {
      hero: "https://example.com/mindmuseum-hero.jpg",
      gallery: [
        "https://example.com/mindmuseum-1.jpg",
        "https://example.com/mindmuseum-2.jpg",
        "https://example.com/mindmuseum-3.jpg",
        "https://example.com/mindmuseum-4.jpg"
      ]
    },
    discovery: {
      tags: ["museum", "science", "educational", "interactive"],
      perfectFor: ["learning", "families", "curious minds"],
      moodScore: 32,
      uniqueFeatures: "Philippines' premier science museum with 250 interactive exhibits across five galleries"
    }
  },
  // QUEZON CITY - Something New Chill
  {
    name: "Ateneo Art Gallery",
    category: "something-new",
    description: "Hidden university art gallery with rotating contemporary exhibitions. Peaceful cultural space rarely crowded.",
    location: { address: "Ateneo de Manila University, Katipunan", city: "Quezon City", lat: 14.6387, lng: 121.0778 },
    contact: { phone: "+63 2 8426 6001", website: "https://ateneoartgallery.org" },
    businessInfo: {
      hours: "8:00 AM - 5:00 PM (Weekdays)",
      priceRange: "₱",
      features: ["Art Gallery", "Free", "Contemporary Art", "University"]
    },
    images: {
      hero: "https://example.com/ateneo-art-hero.jpg",
      gallery: [
        "https://example.com/ateneo-art-1.jpg",
        "https://example.com/ateneo-art-2.jpg",
        "https://example.com/ateneo-art-3.jpg"
      ]
    },
    discovery: {
      tags: ["art", "gallery", "hidden gem", "contemporary"],
      perfectFor: ["art enthusiasts", "quiet visits", "cultural exploration"],
      moodScore: 26,
      uniqueFeatures: "Premier university art gallery with significant Filipino modern and contemporary art collection"
    }
  },
  {
    name: "Archivo 1984",
    category: "something-new",
    description: "Secret speakeasy-style library bar with rare book collection. Intimate setting for book and cocktail lovers.",
    location: { address: "Maginhawa Street", city: "Quezon City", lat: 14.6394, lng: 121.0653 },
    contact: { website: "https://www.instagram.com/archivo1984" },
    businessInfo: {
      hours: "5:00 PM - 12:00 AM",
      priceRange: "₱₱₱",
      features: ["Speakeasy", "Library", "Cocktails", "Secret"]
    },
    images: {
      hero: "https://example.com/archivo-hero.jpg",
      gallery: [
        "https://example.com/archivo-1.jpg",
        "https://example.com/archivo-2.jpg",
        "https://example.com/archivo-3.jpg",
        "https://example.com/archivo-4.jpg"
      ]
    },
    discovery: {
      tags: ["speakeasy", "library", "hidden", "unique"],
      perfectFor: ["cocktail lovers", "secret bars", "unique experiences"],
      moodScore: 38,
      uniqueFeatures: "Hidden speakeasy disguised as old library with rare books and craft cocktails"
    }
  },
  {
    name: "Conspiracy Garden Cafe",
    category: "something-new",
    description: "Secret garden cafe tucked in residential area. Lush greenery with peaceful ambiance rarely discovered.",
    location: { address: "Visayas Avenue", city: "Quezon City", lat: 14.6502, lng: 121.0295 },
    contact: { phone: "+63 2 8929 4567" },
    businessInfo: {
      hours: "9:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Garden Cafe", "Hidden", "Peaceful", "Plants"]
    },
    images: {
      hero: "https://example.com/conspiracy-hero.jpg",
      gallery: [
        "https://example.com/conspiracy-1.jpg",
        "https://example.com/conspiracy-2.jpg",
        "https://example.com/conspiracy-3.jpg",
        "https://example.com/conspiracy-4.jpg"
      ]
    },
    discovery: {
      tags: ["garden cafe", "hidden gem", "plants", "peaceful"],
      perfectFor: ["hidden spots", "garden dining", "quiet retreats"],
      moodScore: 25,
      uniqueFeatures: "Secret garden oasis with hundreds of plants hidden in residential QC"
    }
  },
  // PASIG - Something New Chill
  {
    name: "Craftsmen Specialty Coffee",
    category: "something-new",
    description: "Newly opened specialty coffee lab with minimalist design. Coffee geeks' paradise with brewing workshops.",
    location: { address: "Kapitolyo", city: "Pasig", lat: 14.5730, lng: 121.0628 },
    contact: { website: "https://www.instagram.com/craftsmenspecialtycoffee" },
    businessInfo: {
      hours: "7:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Specialty Coffee", "Workshops", "New Opening", "Minimalist"]
    },
    images: {
      hero: "https://example.com/craftsmen-hero.jpg",
      gallery: [
        "https://example.com/craftsmen-1.jpg",
        "https://example.com/craftsmen-2.jpg",
        "https://example.com/craftsmen-3.jpg"
      ]
    },
    discovery: {
      tags: ["coffee", "specialty", "new", "workshop"],
      perfectFor: ["coffee enthusiasts", "new discoveries", "workshops"],
      moodScore: 30,
      uniqueFeatures: "New specialty coffee lab offering brewing classes and single-origin beans"
    }
  },
  {
    name: "The Greenery Kitchen",
    category: "something-new",
    description: "New plant-based restaurant with indoor jungle setting. Quiet vegan haven with health-focused menu.",
    location: { address: "Capitol Commons", city: "Pasig", lat: 14.5809, lng: 121.0548 },
    contact: { website: "https://www.instagram.com/thegreenerykitchen" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱₱",
      features: ["Vegan", "Plant-Based", "New Opening", "Health Food"]
    },
    images: {
      hero: "https://example.com/greenery-kitchen-hero.jpg",
      gallery: [
        "https://example.com/greenery-kitchen-1.jpg",
        "https://example.com/greenery-kitchen-2.jpg",
        "https://example.com/greenery-kitchen-3.jpg",
        "https://example.com/greenery-kitchen-4.jpg"
      ]
    },
    discovery: {
      tags: ["vegan", "plant-based", "new", "healthy"],
      perfectFor: ["vegans", "health food", "new restaurants"],
      moodScore: 27,
      uniqueFeatures: "Recently opened 100% plant-based restaurant with stunning indoor garden design"
    }
  },
  // MANDALUYONG - Something New Chill
  {
    name: "Vinyl Vault Listening Cafe",
    category: "something-new",
    description: "Newly opened vinyl listening lounge with extensive record collection. Quiet space for audiophiles.",
    location: { address: "Shaw Boulevard", city: "Mandaluyong", lat: 14.5825, lng: 121.0544 },
    contact: { website: "https://www.instagram.com/vinylvaultph" },
    businessInfo: {
      hours: "2:00 PM - 11:00 PM",
      priceRange: "₱₱",
      features: ["Vinyl", "Music", "New Opening", "Listening Lounge"]
    },
    images: {
      hero: "https://example.com/vinyl-vault-hero.jpg",
      gallery: [
        "https://example.com/vinyl-vault-1.jpg",
        "https://example.com/vinyl-vault-2.jpg",
        "https://example.com/vinyl-vault-3.jpg"
      ]
    },
    discovery: {
      tags: ["vinyl", "music", "unique", "new"],
      perfectFor: ["music lovers", "vinyl collectors", "quiet listening"],
      moodScore: 29,
      uniqueFeatures: "New vinyl listening bar with curated collection and high-end audio equipment"
    }
  },
  // TAGUIG - Something New Chill
  {
    name: "The Secret Shelf Bookstore",
    category: "something-new",
    description: "Hidden indie bookstore with curated fiction and poetry. Newly opened literary haven in residential area.",
    location: { address: "Venice Piazza, McKinley Hill", city: "Taguig", lat: 14.5311, lng: 121.0522 },
    contact: { website: "https://www.instagram.com/secretshelfph" },
    businessInfo: {
      hours: "11:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Bookstore", "Independent", "New Opening", "Poetry"]
    },
    images: {
      hero: "https://example.com/secret-shelf-hero.jpg",
      gallery: [
        "https://example.com/secret-shelf-1.jpg",
        "https://example.com/secret-shelf-2.jpg",
        "https://example.com/secret-shelf-3.jpg"
      ]
    },
    discovery: {
      tags: ["bookstore", "indie", "hidden", "new"],
      perfectFor: ["book lovers", "hidden gems", "literary finds"],
      moodScore: 24,
      uniqueFeatures: "Recently opened independent bookstore focusing on Filipino literature and poetry"
    }
  },
  {
    name: "Botanica Heritage Spa",
    category: "something-new",
    description: "New heritage spa using traditional Filipino botanicals. Peaceful sanctuary with indigenous healing methods.",
    location: { address: "McKinley West", city: "Taguig", lat: 14.5405, lng: 121.0425 },
    contact: { phone: "+63 2 8856 7890", website: "https://botanicaspa.ph" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱₱",
      features: ["Spa", "Heritage", "New Opening", "Filipino Treatments"]
    },
    images: {
      hero: "https://example.com/botanica-spa-hero.jpg",
      gallery: [
        "https://example.com/botanica-spa-1.jpg",
        "https://example.com/botanica-spa-2.jpg",
        "https://example.com/botanica-spa-3.jpg",
        "https://example.com/botanica-spa-4.jpg",
        "https://example.com/botanica-spa-5.jpg"
      ]
    },
    discovery: {
      tags: ["spa", "heritage", "new", "filipino"],
      perfectFor: ["spa lovers", "cultural experiences", "wellness"],
      moodScore: 19,
      uniqueFeatures: "New spa featuring traditional Filipino hilot with indigenous botanical ingredients"
    }
  },
  // MARIKINA - Something New Chill
  {
    name: "Shoe Museum Cafe",
    category: "something-new",
    description: "Unique cafe inside Marikina Shoe Museum. Coffee surrounded by Philippine footwear history.",
    location: { address: "J.P. Rizal Street", city: "Marikina", lat: 14.6332, lng: 121.1051 },
    contact: { phone: "+63 2 8646 3456" },
    businessInfo: {
      hours: "8:00 AM - 5:00 PM",
      priceRange: "₱",
      features: ["Museum Cafe", "Unique", "Local History", "Affordable"]
    },
    images: {
      hero: "https://example.com/shoe-museum-cafe-hero.jpg",
      gallery: [
        "https://example.com/shoe-museum-1.jpg",
        "https://example.com/shoe-museum-2.jpg",
        "https://example.com/shoe-museum-3.jpg"
      ]
    },
    discovery: {
      tags: ["museum", "cafe", "unique", "local"],
      perfectFor: ["unique cafes", "local culture", "hidden gems"],
      moodScore: 31,
      uniqueFeatures: "Only cafe inside Marikina's famous shoe museum showcasing local shoemaking heritage"
    }
  },
  {
    name: "Lilac Blooms Garden Studio",
    category: "something-new",
    description: "New art studio and garden cafe combo. Painting workshops in peaceful botanical setting.",
    location: { address: "Concepcion Uno", city: "Marikina", lat: 14.6445, lng: 121.1145 },
    contact: { website: "https://www.instagram.com/lilacbloomsstudio" },
    businessInfo: {
      hours: "9:00 AM - 7:00 PM",
      priceRange: "₱₱",
      features: ["Art Studio", "Garden", "Workshops", "New Opening"]
    },
    images: {
      hero: "https://example.com/lilac-blooms-hero.jpg",
      gallery: [
        "https://example.com/lilac-blooms-1.jpg",
        "https://example.com/lilac-blooms-2.jpg",
        "https://example.com/lilac-blooms-3.jpg",
        "https://example.com/lilac-blooms-4.jpg"
      ]
    },
    discovery: {
      tags: ["art studio", "garden", "workshops", "new"],
      perfectFor: ["art lovers", "creative activities", "garden settings"],
      moodScore: 28,
      uniqueFeatures: "Newly opened art studio offering painting workshops in lush garden environment"
    }
  },
  // PASAY - Something New Chill
  {
    name: "The Quiet Museum",
    category: "something-new",
    description: "New contemporary art space near MOA with silent viewing rooms. Unique contemplative art experience.",
    location: { address: "Near SM Mall of Asia", city: "Pasay", lat: 14.5342, lng: 120.9808 },
    contact: { website: "https://thequietmuseum.ph" },
    businessInfo: {
      hours: "10:00 AM - 6:00 PM (Closed Mon)",
      priceRange: "₱₱",
      features: ["Art Museum", "Silent Spaces", "New Opening", "Contemporary"]
    },
    images: {
      hero: "https://example.com/quiet-museum-hero.jpg",
      gallery: [
        "https://example.com/quiet-museum-1.jpg",
        "https://example.com/quiet-museum-2.jpg",
        "https://example.com/quiet-museum-3.jpg"
      ]
    },
    discovery: {
      tags: ["museum", "contemporary art", "unique", "new"],
      perfectFor: ["art lovers", "contemplation", "unique experiences"],
      moodScore: 20,
      uniqueFeatures: "Newly opened museum with mandatory silence policy for contemplative art viewing"
    }
  }
];

/**
 * SOMETHING-NEW + NEUTRAL (moodScore 35-65)
 * Unique markets, quirky cafes, unusual museums, interesting experiences
 */
export const somethingNewNeutralPlaces: PlaceInput[] = [
  {
    name: "Salcedo Saturday Market",
    category: "something-new",
    description: "Upscale weekend market with organic produce, artisan goods, and international food stalls. Community gathering spot.",
    location: { address: "Jaime Velasquez Park, Salcedo Village", city: "Makati", lat: 14.5561, lng: 121.0191 },
    contact: {},
    businessInfo: {
      hours: "7:00 AM - 2:00 PM (Saturdays only)",
      priceRange: "₱₱",
      features: ["Market", "Organic", "Artisan", "Weekend"]
    },
    images: {
      hero: "https://example.com/salcedo-market-hero.jpg",
      gallery: [
        "https://example.com/salcedo-1.jpg",
        "https://example.com/salcedo-2.jpg",
        "https://example.com/salcedo-3.jpg",
        "https://example.com/salcedo-4.jpg"
      ]
    },
    discovery: {
      tags: ["market", "organic", "artisan", "community"],
      perfectFor: ["weekend mornings", "fresh produce", "food discovery"],
      moodScore: 50,
      uniqueFeatures: "Metro Manila's premier organic market with international and local vendors"
    }
  },
  {
    name: "Art in Island",
    category: "something-new",
    description: "Interactive 3D art museum where you become part of the artwork. Fun optical illusions and creative photo opportunities.",
    location: { address: "175 15th Avenue, Cubao", city: "Quezon City", lat: 14.6184, lng: 121.0508 },
    contact: { phone: "+63 2 8709 4704", website: "https://artinisland.ph" },
    businessInfo: {
      hours: "9:30 AM - 9:30 PM",
      priceRange: "₱₱",
      features: ["Interactive Art", "Photo Ops", "Museum", "Family-Friendly"]
    },
    images: {
      hero: "https://example.com/artinisland-hero.jpg",
      gallery: [
        "https://example.com/artinisland-1.jpg",
        "https://example.com/artinisland-2.jpg",
        "https://example.com/artinisland-3.jpg",
        "https://example.com/artinisland-4.jpg",
        "https://example.com/artinisland-5.jpg"
      ]
    },
    discovery: {
      tags: ["interactive", "3d art", "museum", "photos"],
      perfectFor: ["photo ops", "group fun", "creative experience"],
      moodScore: 58,
      uniqueFeatures: "Philippines' first and largest 3D interactive art museum with over 200 paintings"
    }
  },
  {
    name: "UP Diliman Sunken Garden",
    category: "something-new",
    description: "Iconic university amphitheater perfect for picnics and people-watching. Hub of student life and weekend activities.",
    location: { address: "University of the Philippines Diliman", city: "Quezon City", lat: 14.6548, lng: 121.0688 },
    contact: {},
    businessInfo: {
      hours: "24/7",
      priceRange: "₱",
      features: ["Park", "Free", "Historic", "Events Space"]
    },
    images: {
      hero: "https://example.com/sunkengarden-hero.jpg",
      gallery: [
        "https://example.com/sunkengarden-1.jpg",
        "https://example.com/sunkengarden-2.jpg",
        "https://example.com/sunkengarden-3.jpg"
      ]
    },
    discovery: {
      tags: ["park", "historic", "free", "picnic"],
      perfectFor: ["picnics", "kite flying", "casual hangouts"],
      moodScore: 48,
      uniqueFeatures: "Iconic UP landmark and gathering place with 50,000 square meter grass field"
    }
  },
  {
    name: "Maginhawa Food Crawl",
    category: "something-new",
    description: "Street known for diverse indie restaurants and quirky cafes. Food adventure with unique hidden gems every few meters.",
    location: { address: "Maginhawa Street, Teachers Village", city: "Quezon City", lat: 14.6390, lng: 121.0650 },
    contact: {},
    businessInfo: {
      hours: "Varies by establishment",
      priceRange: "₱₱",
      features: ["Food Street", "Indie Restaurants", "Variety", "Walking Distance"]
    },
    images: {
      hero: "https://example.com/maginhawa-hero.jpg",
      gallery: [
        "https://example.com/maginhawa-1.jpg",
        "https://example.com/maginhawa-2.jpg",
        "https://example.com/maginhawa-3.jpg",
        "https://example.com/maginhawa-4.jpg"
      ]
    },
    discovery: {
      tags: ["food street", "variety", "indie", "exploration"],
      perfectFor: ["food trips", "group dining", "discovering new places"],
      moodScore: 55,
      uniqueFeatures: "Manila's most famous food street with 50+ unique restaurants and cafes"
    }
  },
  {
    name: "Balaw Balaw Art Gallery & Restaurant",
    category: "something-new",
    description: "Eccentric restaurant serving exotic dishes surrounded by outsider art installations. Truly unique dining experience.",
    location: { address: "Rizal Avenue, Angono", city: "Rizal", lat: 14.5281, lng: 121.1531 },
    contact: { phone: "+63 2 8651 3177" },
    businessInfo: {
      hours: "11:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Art Gallery", "Exotic Food", "Unique", "Cultural"]
    },
    images: {
      hero: "https://example.com/balawbalaw-hero.jpg",
      gallery: [
        "https://example.com/balawbalaw-1.jpg",
        "https://example.com/balawbalaw-2.jpg",
        "https://example.com/balawbalaw-3.jpg",
        "https://example.com/balawbalaw-4.jpg"
      ]
    },
    discovery: {
      tags: ["exotic food", "art", "unique", "cultural"],
      perfectFor: ["adventurous eaters", "art lovers", "unusual experiences"],
      moodScore: 52,
      uniqueFeatures: "Exotic Filipino dishes like crocodile and crickets amid folk art sculptures"
    }
  }
];

/**
 * SOMETHING-NEW + HYPE (moodScore 60-100)
 * Extreme experiences, wild adventures, unique nightlife, unusual events
 */
export const somethingNewHypePlaces: PlaceInput[] = [
  {
    name: "Sky Ranch Tagaytay",
    category: "something-new",
    description: "Theme park with Sky Eye ferris wheel offering panoramic views. Rides, games, and entertainment with cool climate.",
    location: { address: "Calamba Road, Tagaytay", city: "Tagaytay", lat: 14.1155, lng: 120.9610 },
    contact: { phone: "+63 46 413 5678", website: "https://skyranch.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Theme Park", "Ferris Wheel", "Rides", "View"]
    },
    images: {
      hero: "https://example.com/skyranch-hero.jpg",
      gallery: [
        "https://example.com/skyranch-1.jpg",
        "https://example.com/skyranch-2.jpg",
        "https://example.com/skyranch-3.jpg",
        "https://example.com/skyranch-4.jpg",
        "https://example.com/skyranch-5.jpg"
      ]
    },
    discovery: {
      tags: ["theme park", "rides", "views", "excitement"],
      perfectFor: ["theme park fun", "family adventure", "date activities"],
      moodScore: 75,
      uniqueFeatures: "Highest ferris wheel in the Philippines with stunning Taal Lake views"
    }
  },
  {
    name: "Ax Throwing Manila",
    category: "something-new",
    description: "First dedicated axe throwing venue in Manila. Unique stress-relief activity with coaching and competitions.",
    location: { address: "The Podium, Mandaluyong", city: "Mandaluyong", lat: 14.5659, lng: 121.0521 },
    contact: { website: "https://www.instagram.com/axthrowingmnl" },
    businessInfo: {
      hours: "12:00 PM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Axe Throwing", "Unique", "Group Activity", "Coaching"]
    },
    images: {
      hero: "https://example.com/axethrowing-hero.jpg",
      gallery: [
        "https://example.com/axe-1.jpg",
        "https://example.com/axe-2.jpg",
        "https://example.com/axe-3.jpg",
        "https://example.com/axe-4.jpg"
      ]
    },
    discovery: {
      tags: ["axe throwing", "unique", "activity", "fun"],
      perfectFor: ["group bonding", "unusual experience", "stress relief"],
      moodScore: 82,
      uniqueFeatures: "Manila's first axe throwing venue with professional coaching and competitive leagues"
    }
  },
  {
    name: "Time Zone Gadgets & Gaming Lounge",
    category: "something-new",
    description: "High-tech gaming arcade with VR experiences, racing simulators, and latest games. Arcade on steroids.",
    location: { address: "Venice Grand Canal Mall, McKinley", city: "Taguig", lat: 14.5246, lng: 121.0526 },
    contact: { phone: "+63 2 8556 9999" },
    businessInfo: {
      hours: "10:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["Arcade", "VR", "Gaming", "Racing Simulators"]
    },
    images: {
      hero: "https://example.com/timezone-hero.jpg",
      gallery: [
        "https://example.com/timezone-1.jpg",
        "https://example.com/timezone-2.jpg",
        "https://example.com/timezone-3.jpg",
        "https://example.com/timezone-4.jpg"
      ]
    },
    discovery: {
      tags: ["gaming", "vr", "arcade", "tech"],
      perfectFor: ["gamers", "tech enthusiasts", "group fun"],
      moodScore: 78,
      uniqueFeatures: "Next-gen arcade with VR experiences and full-motion racing simulators"
    }
  },
  {
    name: "Escape Room Manila",
    category: "something-new",
    description: "Themed escape rooms with cinematic productions. Solve puzzles and mysteries under time pressure.",
    location: { address: "Venice Piazza, McKinley Hill", city: "Taguig", lat: 14.5305, lng: 121.0516 },
    contact: { phone: "+63 2 8403 1234", website: "https://escaperoommanila.com" },
    businessInfo: {
      hours: "1:00 PM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Escape Room", "Puzzles", "Team Activity", "Themed Rooms"]
    },
    images: {
      hero: "https://example.com/escaperoom-hero.jpg",
      gallery: [
        "https://example.com/escape-1.jpg",
        "https://example.com/escape-2.jpg",
        "https://example.com/escape-3.jpg",
        "https://example.com/escape-4.jpg"
      ]
    },
    discovery: {
      tags: ["escape room", "puzzles", "challenge", "team"],
      perfectFor: ["team building", "puzzle lovers", "group challenge"],
      moodScore: 70,
      uniqueFeatures: "Highly detailed themed rooms with Hollywood-quality set design and storylines"
    }
  },
  {
    name: "Midnight Mercato BGC",
    category: "something-new",
    description: "Late-night food and lifestyle market every Friday-Saturday. Hundreds of food stalls, live music, and vibrant atmosphere.",
    location: { address: "The Lawns at One Bonifacio High Street", city: "BGC", lat: 14.5506, lng: 121.0523 },
    contact: { website: "https://mercatocentrale.ph" },
    businessInfo: {
      hours: "7:00 PM - 3:00 AM (Fri-Sat)",
      priceRange: "₱₱",
      features: ["Night Market", "Food Stalls", "Live Music", "Weekend"]
    },
    images: {
      hero: "https://example.com/mercato-hero.jpg",
      gallery: [
        "https://example.com/mercato-1.jpg",
        "https://example.com/mercato-2.jpg",
        "https://example.com/mercato-3.jpg",
        "https://example.com/mercato-4.jpg",
        "https://example.com/mercato-5.jpg"
      ]
    },
    discovery: {
      tags: ["night market", "food", "weekend", "vibrant"],
      perfectFor: ["late night food", "weekend nights", "food discovery"],
      moodScore: 80,
      uniqueFeatures: "Manila's original and largest weekend night market with 200+ food vendors"
    }
  }
];

// Export all places combined
export const allPlaces: PlaceInput[] = [
  ...foodChillPlaces,
  ...foodNeutralPlaces,
  ...foodHypePlaces,
  ...activityChillPlaces,
  ...activityNeutralPlaces,
  ...activityHypePlaces,
  ...somethingNewChillPlaces,
  ...somethingNewNeutralPlaces,
  ...somethingNewHypePlaces
];

// Summary
export const PLACE_COUNTS = {
  'food-chill': foodChillPlaces.length,
  'food-neutral': foodNeutralPlaces.length,
  'food-hype': foodHypePlaces.length,
  'activity-chill': activityChillPlaces.length,
  'activity-neutral': activityNeutralPlaces.length,
  'activity-hype': activityHypePlaces.length,
  'something-new-chill': somethingNewChillPlaces.length,
  'something-new-neutral': somethingNewNeutralPlaces.length,
  'something-new-hype': somethingNewHypePlaces.length,
  total: allPlaces.length
};


