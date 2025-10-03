/**
 * Bulacan Places Near Philippine Arena
 * 75 places: 25 per category (food, activity, something-new)
 * Focus on Bocaue, Santa Maria, and surrounding areas
 */

import { PlaceInput } from './metro-manila-places';

/**
 * FOOD PLACES - Bulacan (25 total, distributed across moods)
 */
export const bulacanFoodPlaces: PlaceInput[] = [
  // CHILL (8 places)
  {
    name: "Café de Apati",
    category: "food",
    description: "Quiet heritage cafe in old Bulacan house. Traditional Filipino merienda in peaceful colonial setting.",
    location: { address: "MacArthur Highway, Santa Maria", city: "Bulacan", lat: 14.8178, lng: 120.9566 },
    contact: { phone: "+63 44 815 2345" },
    businessInfo: {
      hours: "8:00 AM - 7:00 PM",
      priceRange: "₱",
      features: ["Heritage", "Filipino Snacks", "Quiet", "Traditional"]
    },
    images: {
      hero: "https://example.com/apati-hero.jpg",
      gallery: ["https://example.com/apati-1.jpg", "https://example.com/apati-2.jpg", "https://example.com/apati-3.jpg"]
    },
    discovery: {
      tags: ["heritage", "filipino", "merienda", "traditional"],
      perfectFor: ["quiet coffee", "traditional snacks", "heritage experience"],
      moodScore: 28,
      uniqueFeatures: "Restored colonial house serving traditional Bulacan delicacies"
    }
  },
  {
    name: "Kape ni Lolo",
    category: "food",
    description: "Homey coffee shop with native kubo ambiance. Locally roasted beans and peaceful garden seating.",
    location: { address: "Tabang Road, Bocaue", city: "Bulacan", lat: 14.8012, lng: 120.9269 },
    contact: { phone: "+63 44 693 4567" },
    businessInfo: {
      hours: "7:00 AM - 8:00 PM",
      priceRange: "₱",
      features: ["Local Coffee", "Garden", "Quiet", "WiFi"]
    },
    images: {
      hero: "https://example.com/kapelolo-hero.jpg",
      gallery: ["https://example.com/kapelolo-1.jpg", "https://example.com/kapelolo-2.jpg", "https://example.com/kapelolo-3.jpg"]
    },
    discovery: {
      tags: ["coffee", "local", "garden", "peaceful"],
      perfectFor: ["morning coffee", "quiet work", "local experience"],
      moodScore: 26,
      uniqueFeatures: "Family-run coffee shop with locally roasted Batangas beans in kubo setting"
    }
  },
  {
    name: "The Garden Table",
    category: "food",
    description: "Farm-to-table restaurant with organic produce. Peaceful dining surrounded by vegetable gardens.",
    location: { address: "Near Philippine Arena, Bocaue", city: "Bulacan", lat: 14.7995, lng: 120.9331 },
    contact: { website: "https://www.instagram.com/gardentablebulacan" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Farm-to-Table", "Organic", "Garden Setting", "Healthy"]
    },
    images: {
      hero: "https://example.com/gardentable-hero.jpg",
      gallery: ["https://example.com/gardentable-1.jpg", "https://example.com/gardentable-2.jpg", "https://example.com/gardentable-3.jpg"]
    },
    discovery: {
      tags: ["organic", "farm-to-table", "garden", "healthy"],
      perfectFor: ["healthy dining", "garden atmosphere", "fresh food"],
      moodScore: 30,
      uniqueFeatures: "Restaurant with own organic farm and garden-fresh ingredients"
    }
  },
  // NEUTRAL (9 places)
  {
    name: "Philippine Arena Food Court",
    category: "food",
    description: "Massive food court with diverse Filipino and international options. Convenient dining for arena visitors.",
    location: { address: "Philippine Arena Complex, Bocaue", city: "Bulacan", lat: 14.8003, lng: 120.9342 },
    contact: { phone: "+63 44 693 8888" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Food Court", "Variety", "Large Capacity", "Event Venue"]
    },
    images: {
      hero: "https://example.com/phil-arena-food-hero.jpg",
      gallery: ["https://example.com/phil-arena-1.jpg", "https://example.com/phil-arena-2.jpg", "https://example.com/phil-arena-3.jpg"]
    },
    discovery: {
      tags: ["food court", "arena", "variety", "convenient"],
      perfectFor: ["event dining", "quick meals", "groups"],
      moodScore: 55,
      uniqueFeatures: "World's largest arena's food court with capacity for thousands"
    }
  },
  {
    name: "Nathaniel's Bakeshop & Restaurant",
    category: "food",
    description: "Famous Bulacan bakery with pastillas and traditional breads. Casual Filipino dining.",
    location: { address: "MacArthur Highway, Santa Maria", city: "Bulacan", lat: 14.8165, lng: 120.9578 },
    contact: { phone: "+63 44 815 1234" },
    businessInfo: {
      hours: "7:00 AM - 9:00 PM",
      priceRange: "₱",
      features: ["Bakery", "Filipino", "Pastillas", "Local Favorite"]
    },
    images: {
      hero: "https://example.com/nathaniels-hero.jpg",
      gallery: ["https://example.com/nathaniels-1.jpg", "https://example.com/nathaniels-2.jpg", "https://example.com/nathaniels-3.jpg"]
    },
    discovery: {
      tags: ["bakery", "pastillas", "bulacan", "traditional"],
      perfectFor: ["pasalubong", "filipino pastries", "local treats"],
      moodScore: 52,
      uniqueFeatures: "Famous for Bulacan pastillas and traditional Filipino breads since 1920s"
    }
  },
  {
    name: "Aling Nene's Pancit Malabon",
    category: "food",
    description: "Authentic pancit malabon in casual setting. Bulacan's famous noodle dish with generous toppings.",
    location: { address: "Bocaue Public Market Area", city: "Bulacan", lat: 14.7978, lng: 120.9303 },
    contact: { phone: "+63 44 693 2345" },
    businessInfo: {
      hours: "8:00 AM - 7:00 PM",
      priceRange: "₱",
      features: ["Filipino", "Pancit", "Local", "Casual"]
    },
    images: {
      hero: "https://example.com/alingnene-hero.jpg",
      gallery: ["https://example.com/alingnene-1.jpg", "https://example.com/alingnene-2.jpg", "https://example.com/alingnene-3.jpg"]
    },
    discovery: {
      tags: ["pancit", "filipino", "local", "authentic"],
      perfectFor: ["pancit lovers", "local food", "casual dining"],
      moodScore: 50,
      uniqueFeatures: "Authentic Bulacan-style pancit malabon with thick noodles and seafood"
    }
  },
  {
    name: "Max's Restaurant Bocaue",
    category: "food",
    description: "Filipino fried chicken institution. Family-style dining with classic Filipino dishes.",
    location: { address: "MacArthur Highway, Bocaue", city: "Bulacan", lat: 14.7989, lng: 120.9315 },
    contact: { phone: "+63 44 693 5678", website: "https://maxschicken.com" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Filipino", "Fried Chicken", "Family-Friendly", "Classic"]
    },
    images: {
      hero: "https://example.com/maxs-bocaue-hero.jpg",
      gallery: ["https://example.com/maxs-1.jpg", "https://example.com/maxs-2.jpg", "https://example.com/maxs-3.jpg"]
    },
    discovery: {
      tags: ["filipino", "chicken", "family dining", "classic"],
      perfectFor: ["family meals", "filipino comfort food", "celebrations"],
      moodScore: 54,
      uniqueFeatures: "Home of the original sarap-to-the-bones fried chicken since 1945"
    }
  },
  {
    name: "Mang Inasal Bocaue",
    category: "food",
    description: "Unlimited rice grilled chicken specialist. Casual Filipino barbecue in affordable setting.",
    location: { address: "MacArthur Highway, Bocaue", city: "Bulacan", lat: 14.7992, lng: 120.9320 },
    contact: { website: "https://manginasal.com" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱",
      features: ["Filipino BBQ", "Unlimited Rice", "Casual", "Affordable"]
    },
    images: {
      hero: "https://example.com/manginasal-bocaue-hero.jpg",
      gallery: ["https://example.com/manginasal-1.jpg", "https://example.com/manginasal-2.jpg", "https://example.com/manginasal-3.jpg"]
    },
    discovery: {
      tags: ["bbq", "grilled chicken", "unlimited rice", "budget"],
      perfectFor: ["budget meals", "filipino bbq", "unlimited rice"],
      moodScore: 56,
      uniqueFeatures: "Famous for PM1 chicken inasal with unlimited rice and chicken oil"
    }
  },
  // HYPE (8 places)
  {
    name: "Rock & Brews Philippine Arena",
    category: "food",
    description: "American bar and grill with live sports screening. Lively atmosphere during events and game nights.",
    location: { address: "Philippine Arena Complex", city: "Bulacan", lat: 14.8005, lng: 120.9345 },
    contact: { phone: "+63 44 693 7890" },
    businessInfo: {
      hours: "11:00 AM - 12:00 AM",
      priceRange: "₱₱₱",
      features: ["Sports Bar", "American Food", "Live Sports", "Event Dining"]
    },
    images: {
      hero: "https://example.com/rockbrews-hero.jpg",
      gallery: ["https://example.com/rockbrews-1.jpg", "https://example.com/rockbrews-2.jpg", "https://example.com/rockbrews-3.jpg", "https://example.com/rockbrews-4.jpg"]
    },
    discovery: {
      tags: ["sports bar", "american", "lively", "events"],
      perfectFor: ["watching games", "event dining", "group celebrations"],
      moodScore: 75,
      uniqueFeatures: "Premier sports bar near world's largest arena with massive screens"
    }
  },
  {
    name: "Savory Chicken House Bocaue",
    category: "food",
    description: "Lively chicken and beer spot popular with locals. Energetic atmosphere especially during basketball season.",
    location: { address: "Bunsuran 1st, Bocaue", city: "Bulacan", lat: 14.7965, lng: 120.9298 },
    contact: { phone: "+63 44 693 6543" },
    businessInfo: {
      hours: "11:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["Fried Chicken", "Beer", "Sports Viewing", "Lively"]
    },
    images: {
      hero: "https://example.com/savory-bocaue-hero.jpg",
      gallery: ["https://example.com/savory-1.jpg", "https://example.com/savory-2.jpg", "https://example.com/savory-3.jpg"]
    },
    discovery: {
      tags: ["chicken", "beer", "sports", "lively"],
      perfectFor: ["watching sports", "beer and chicken", "group hangouts"],
      moodScore: 72,
      uniqueFeatures: "Local favorite for crispy fried chicken and ice-cold beer with sports viewing"
    }
  },
  // Additional CHILL Food Places (5 more)
  {
    name: "Bahay na Bato Heritage Cafe",
    category: "food",
    description: "Restored stone house cafe serving traditional merienda. Quiet colonial atmosphere with local delicacies.",
    location: { address: "Barasoain, Malolos", city: "Bulacan", lat: 14.8438, lng: 120.8122 },
    contact: { phone: "+63 44 791 4567" },
    businessInfo: {
      hours: "9:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Heritage", "Traditional", "Quiet", "Colonial"]
    },
    images: {
      hero: "https://example.com/bahay-bato-hero.jpg",
      gallery: ["https://example.com/bahay-bato-1.jpg", "https://example.com/bahay-bato-2.jpg", "https://example.com/bahay-bato-3.jpg"]
    },
    discovery: {
      tags: ["heritage", "traditional", "colonial", "cafe"],
      perfectFor: ["heritage experience", "quiet coffee", "local snacks"],
      moodScore: 27,
      uniqueFeatures: "Beautifully preserved stone house serving traditional Bulacan kakanin and coffee"
    }
  },
  {
    name: "Riverside Tea Garden",
    category: "food",
    description: "Peaceful tea house along Angat River. Extensive tea selection in tranquil garden setting.",
    location: { address: "San Rafael, Bulacan", city: "Bulacan", lat: 14.9443, lng: 120.9648 },
    contact: { phone: "+63 44 816 3456" },
    businessInfo: {
      hours: "8:00 AM - 8:00 PM",
      priceRange: "₱₱",
      features: ["Tea House", "Garden", "River View", "Peaceful"]
    },
    images: {
      hero: "https://example.com/riverside-tea-hero.jpg",
      gallery: ["https://example.com/riverside-tea-1.jpg", "https://example.com/riverside-tea-2.jpg", "https://example.com/riverside-tea-3.jpg"]
    },
    discovery: {
      tags: ["tea", "garden", "river", "peaceful"],
      perfectFor: ["tea lovers", "quiet time", "river views"],
      moodScore: 25,
      uniqueFeatures: "Scenic tea garden overlooking Angat River with 40+ tea varieties"
    }
  },
  {
    name: "Quiet Corner Bakery & Cafe",
    category: "food",
    description: "Small family bakery with homemade pastries. Cozy neighborhood spot with fresh-baked goods.",
    location: { address: "Bunsuran 2nd, Bocaue", city: "Bulacan", lat: 14.7970, lng: 120.9302 },
    contact: { phone: "+63 44 693 2468" },
    businessInfo: {
      hours: "6:00 AM - 7:00 PM",
      priceRange: "₱",
      features: ["Bakery", "Fresh Baked", "Local", "Cozy"]
    },
    images: {
      hero: "https://example.com/quiet-corner-hero.jpg",
      gallery: ["https://example.com/quiet-corner-1.jpg", "https://example.com/quiet-corner-2.jpg", "https://example.com/quiet-corner-3.jpg"]
    },
    discovery: {
      tags: ["bakery", "pastries", "local", "homemade"],
      perfectFor: ["morning pastries", "local bakery", "quiet coffee"],
      moodScore: 29,
      uniqueFeatures: "Family-run bakery with freshly baked ensaymada and pandesal every morning"
    }
  },
  {
    name: "Garden Bistro Bulacan",
    category: "food",
    description: "Al fresco dining in lush garden. Peaceful atmosphere with Filipino fusion cuisine.",
    location: { address: "Santa Maria Heights", city: "Bulacan", lat: 14.8182, lng: 120.9580 },
    contact: { website: "https://www.instagram.com/gardenbistrobulacan" },
    businessInfo: {
      hours: "11:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Garden Dining", "Al Fresco", "Filipino Fusion", "Peaceful"]
    },
    images: {
      hero: "https://example.com/garden-bistro-hero.jpg",
      gallery: ["https://example.com/garden-bistro-1.jpg", "https://example.com/garden-bistro-2.jpg", "https://example.com/garden-bistro-3.jpg"]
    },
    discovery: {
      tags: ["garden", "fusion", "al fresco", "peaceful"],
      perfectFor: ["garden dining", "quiet lunch", "romantic meals"],
      moodScore: 31,
      uniqueFeatures: "Hidden garden bistro with Filipino fusion menu and botanical atmosphere"
    }
  },
  {
    name: "Morning Brew Coffee House",
    category: "food",
    description: "Cozy coffee shop with study-friendly atmosphere. Local roasted beans and quiet workspace.",
    location: { address: "Lolomboy, Bocaue", city: "Bulacan", lat: 14.7862, lng: 120.9248 },
    contact: { phone: "+63 44 693 3333" },
    businessInfo: {
      hours: "6:00 AM - 9:00 PM",
      priceRange: "₱",
      features: ["Coffee", "WiFi", "Study-Friendly", "Quiet"]
    },
    images: {
      hero: "https://example.com/morning-brew-hero.jpg",
      gallery: ["https://example.com/morning-brew-1.jpg", "https://example.com/morning-brew-2.jpg", "https://example.com/morning-brew-3.jpg"]
    },
    discovery: {
      tags: ["coffee", "quiet", "study", "local"],
      perfectFor: ["studying", "remote work", "morning coffee"],
      moodScore: 26,
      uniqueFeatures: "Local coffee shop favorite among students with affordable specialty drinks"
    }
  },
  // Additional NEUTRAL Food Places (4 more)
  {
    name: "Jollibee Bocaue",
    category: "food",
    description: "Philippine fast food favorite with ChickenJoy. Family-friendly dining near the arena.",
    location: { address: "MacArthur Highway, Bocaue", city: "Bulacan", lat: 14.7996, lng: 120.9322 },
    contact: { website: "https://jollibee.com.ph" },
    businessInfo: {
      hours: "7:00 AM - 10:00 PM",
      priceRange: "₱",
      features: ["Fast Food", "Filipino", "Family-Friendly", "Drive-Thru"]
    },
    images: {
      hero: "https://example.com/jollibee-bocaue-hero.jpg",
      gallery: ["https://example.com/jollibee-bocaue-1.jpg", "https://example.com/jollibee-bocaue-2.jpg", "https://example.com/jollibee-bocaue-3.jpg"]
    },
    discovery: {
      tags: ["fast food", "chickenjoy", "filipino", "convenient"],
      perfectFor: ["quick meals", "family dining", "filipino comfort food"],
      moodScore: 58,
      uniqueFeatures: "Convenient location near Philippine Arena for event-goers"
    }
  },
  {
    name: "Goldilocks Bakeshop Santa Maria",
    category: "food",
    description: "Filipino bakery and cafe institution. Classic cakes, pastries, and savory dishes.",
    location: { address: "MacArthur Highway, Santa Maria", city: "Bulacan", lat: 14.8170, lng: 120.9575 },
    contact: { phone: "+63 44 815 4567", website: "https://goldilocks.com.ph" },
    businessInfo: {
      hours: "7:00 AM - 9:00 PM",
      priceRange: "₱",
      features: ["Bakery", "Filipino", "Cakes", "Classic"]
    },
    images: {
      hero: "https://example.com/goldilocks-sm-hero.jpg",
      gallery: ["https://example.com/goldilocks-sm-1.jpg", "https://example.com/goldilocks-sm-2.jpg", "https://example.com/goldilocks-sm-3.jpg"]
    },
    discovery: {
      tags: ["bakery", "filipino", "cakes", "classic"],
      perfectFor: ["pasalubong", "birthday cakes", "filipino pastries"],
      moodScore: 53,
      uniqueFeatures: "Filipino bakery institution famous for classic cakes and pastillas"
    }
  },
  {
    name: "Andok's Litson Manok Bocaue",
    category: "food",
    description: "Roasted chicken specialist with affordable family meals. Quick service for takeaway or dine-in.",
    location: { address: "MacArthur Highway, Bocaue", city: "Bulacan", lat: 14.7985, lng: 120.9312 },
    contact: { website: "https://andoks.com" },
    businessInfo: {
      hours: "9:00 AM - 9:00 PM",
      priceRange: "₱",
      features: ["Roasted Chicken", "Filipino", "Affordable", "Takeaway"]
    },
    images: {
      hero: "https://example.com/andoks-bocaue-hero.jpg",
      gallery: ["https://example.com/andoks-bocaue-1.jpg", "https://example.com/andoks-bocaue-2.jpg", "https://example.com/andoks-bocaue-3.jpg"]
    },
    discovery: {
      tags: ["roasted chicken", "filipino", "budget", "quick"],
      perfectFor: ["family meals", "takeaway", "budget dining"],
      moodScore: 54,
      uniqueFeatures: "Famous for litsong manok and dokito rice at affordable prices"
    }
  },
  {
    name: "Chowking Bocaue",
    category: "food",
    description: "Chinese-Filipino fast food with noodles and dim sum. Casual dining for quick meals.",
    location: { address: "MacArthur Highway, Bocaue", city: "Bulacan", lat: 14.7988, lng: 120.9316 },
    contact: { website: "https://chowking.com" },
    businessInfo: {
      hours: "8:00 AM - 10:00 PM",
      priceRange: "₱",
      features: ["Chinese-Filipino", "Fast Food", "Noodles", "Dim Sum"]
    },
    images: {
      hero: "https://example.com/chowking-bocaue-hero.jpg",
      gallery: ["https://example.com/chowking-bocaue-1.jpg", "https://example.com/chowking-bocaue-2.jpg", "https://example.com/chowking-bocaue-3.jpg"]
    },
    discovery: {
      tags: ["chinese", "filipino", "noodles", "fast food"],
      perfectFor: ["quick meals", "chinese food", "family dining"],
      moodScore: 55,
      uniqueFeatures: "Filipino fast food chain specializing in Chinese noodles and lauriat meals"
    }
  },
  // Additional HYPE Food Places (6 more)
  {
    name: "Red Horse Beer Garden Bocaue",
    category: "food",
    description: "Open-air beer garden with live bands on weekends. Lively atmosphere with grilled favorites.",
    location: { address: "Bagumbayan, Bocaue", city: "Bulacan", lat: 14.7952, lng: 120.9285 },
    contact: { phone: "+63 44 693 7777" },
    businessInfo: {
      hours: "4:00 PM - 2:00 AM",
      priceRange: "₱₱",
      features: ["Beer Garden", "Live Bands", "Grilled Food", "Outdoor"]
    },
    images: {
      hero: "https://example.com/redhorse-bocaue-hero.jpg",
      gallery: ["https://example.com/redhorse-1.jpg", "https://example.com/redhorse-2.jpg", "https://example.com/redhorse-3.jpg", "https://example.com/redhorse-4.jpg"]
    },
    discovery: {
      tags: ["beer garden", "live music", "outdoor", "lively"],
      perfectFor: ["after work", "live music", "beer lovers"],
      moodScore: 76,
      uniqueFeatures: "Popular beer garden with weekend live bands and ice-cold Red Horse on tap"
    }
  },
  {
    name: "Inuman Sessions Bar & Grill",
    category: "food",
    description: "Lively local bar with karaoke and Filipino pulutan. Energetic crowd and party atmosphere.",
    location: { address: "Bunsuran, Bocaue", city: "Bulacan", lat: 14.7968, lng: 120.9300 },
    contact: { phone: "+63 44 693 8765" },
    businessInfo: {
      hours: "5:00 PM - 3:00 AM",
      priceRange: "₱₱",
      features: ["Bar", "Karaoke", "Live Music", "Pulutan"]
    },
    images: {
      hero: "https://example.com/inuman-sessions-hero.jpg",
      gallery: ["https://example.com/inuman-1.jpg", "https://example.com/inuman-2.jpg", "https://example.com/inuman-3.jpg"]
    },
    discovery: {
      tags: ["bar", "karaoke", "party", "local"],
      perfectFor: ["night out", "karaoke", "group drinking"],
      moodScore: 78,
      uniqueFeatures: "Local favorite for inuman sessions with karaoke and live bands on weekends"
    }
  },
  {
    name: "Arena District Nightlife Strip",
    category: "food",
    description: "Row of bars and restaurants near the arena. Lively nightlife during events and weekends.",
    location: { address: "Ciudad de Victoria, Bocaue", city: "Bulacan", lat: 14.8001, lng: 120.9335 },
    contact: {},
    businessInfo: {
      hours: "6:00 PM - 2:00 AM",
      priceRange: "₱₱",
      features: ["Bar Strip", "Multiple Venues", "Nightlife", "Event Area"]
    },
    images: {
      hero: "https://example.com/arena-nightlife-hero.jpg",
      gallery: ["https://example.com/arena-nightlife-1.jpg", "https://example.com/arena-nightlife-2.jpg", "https://example.com/arena-nightlife-3.jpg"]
    },
    discovery: {
      tags: ["nightlife", "bars", "events", "lively"],
      perfectFor: ["after events", "night out", "bar hopping"],
      moodScore: 80,
      uniqueFeatures: "Nightlife hub near Philippine Arena bustling during concerts and events"
    }
  },
  {
    name: "Karaoke Palace Bocaue",
    category: "food",
    description: "Large karaoke restaurant with private rooms and Filipino food. Party venue for celebrations.",
    location: { address: "Tabang, Bocaue", city: "Bulacan", lat: 14.8018, lng: 120.9274 },
    contact: { phone: "+63 44 693 9876" },
    businessInfo: {
      hours: "11:00 AM - 2:00 AM",
      priceRange: "₱₱",
      features: ["Karaoke", "Private Rooms", "Filipino Food", "Party Venue"]
    },
    images: {
      hero: "https://example.com/karaoke-palace-hero.jpg",
      gallery: ["https://example.com/karaoke-palace-1.jpg", "https://example.com/karaoke-palace-2.jpg", "https://example.com/karaoke-palace-3.jpg"]
    },
    discovery: {
      tags: ["karaoke", "party", "filipino food", "entertainment"],
      perfectFor: ["celebrations", "karaoke night", "group parties"],
      moodScore: 82,
      uniqueFeatures: "50+ private karaoke rooms with Filipino restaurant and party packages"
    }
  },
  {
    name: "Shakey's Pizza Bocaue",
    category: "food",
    description: "Pizza and chicken chain with lively family atmosphere. Popular for birthday parties.",
    location: { address: "MacArthur Highway, Bocaue", city: "Bulacan", lat: 14.7990, lng: 120.9318 },
    contact: { phone: "+63 44 693 5555", website: "https://shakeyspizza.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Pizza", "Chicken", "Family-Friendly", "Party Venue"]
    },
    images: {
      hero: "https://example.com/shakeys-bocaue-hero.jpg",
      gallery: ["https://example.com/shakeys-1.jpg", "https://example.com/shakeys-2.jpg", "https://example.com/shakeys-3.jpg"]
    },
    discovery: {
      tags: ["pizza", "chicken", "family", "party"],
      perfectFor: ["family meals", "birthday parties", "pizza lovers"],
      moodScore: 64,
      uniqueFeatures: "Filipino pizza institution with Bunch of Lunch buffet and birthday party packages"
    }
  },
  {
    name: "Live Band Restobar Bulacan",
    category: "food",
    description: "Popular restobar with nightly live bands. Energetic crowd and Filipino rock music.",
    location: { address: "Tabang, Bocaue", city: "Bulacan", lat: 14.8015, lng: 120.9271 },
    contact: { phone: "+63 44 693 7654" },
    businessInfo: {
      hours: "6:00 PM - 2:00 AM",
      priceRange: "₱₱",
      features: ["Live Music", "Bar", "Filipino Food", "Rock Bands"]
    },
    images: {
      hero: "https://example.com/liveband-restobar-hero.jpg",
      gallery: ["https://example.com/liveband-1.jpg", "https://example.com/liveband-2.jpg", "https://example.com/liveband-3.jpg"]
    },
    discovery: {
      tags: ["live music", "bar", "rock", "lively"],
      perfectFor: ["live music", "night out", "rock fans"],
      moodScore: 77,
      uniqueFeatures: "Popular restobar featuring local rock bands every night with no cover charge"
    }
  },
  {
    name: "Greenwich Pizza Bocaue",
    category: "food",
    description: "Filipino pizza chain with pasta and lasagna. Casual dining popular with families and groups.",
    location: { address: "MacArthur Highway, Bocaue", city: "Bulacan", lat: 14.7994, lng: 120.9324 },
    contact: { website: "https://greenwich.com.ph" },
    businessInfo: {
      hours: "10:00 AM - 10:00 PM",
      priceRange: "₱",
      features: ["Pizza", "Pasta", "Filipino", "Delivery"]
    },
    images: {
      hero: "https://example.com/greenwich-bocaue-hero.jpg",
      gallery: ["https://example.com/greenwich-1.jpg", "https://example.com/greenwich-2.jpg", "https://example.com/greenwich-3.jpg"]
    },
    discovery: {
      tags: ["pizza", "pasta", "filipino", "casual"],
      perfectFor: ["family meals", "pizza delivery", "casual dining"],
      moodScore: 57,
      uniqueFeatures: "Local pizza chain with Filipino-style pizzas and affordable party packages"
    }
  },
  {
    name: "Manokan Country Baliwag",
    category: "food",
    description: "Famous chicken district with multiple grilled chicken stalls. Lively food street experience.",
    location: { address: "Poblacion, Baliwag", city: "Bulacan", lat: 14.9553, lng: 120.8933 },
    contact: {},
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱",
      features: ["Street Food", "Grilled Chicken", "Multiple Vendors", "Local"]
    },
    images: {
      hero: "https://example.com/manokan-country-hero.jpg",
      gallery: ["https://example.com/manokan-1.jpg", "https://example.com/manokan-2.jpg", "https://example.com/manokan-3.jpg", "https://example.com/manokan-4.jpg"]
    },
    discovery: {
      tags: ["street food", "grilled chicken", "baliwag", "food street"],
      perfectFor: ["chicken lovers", "food trip", "local experience"],
      moodScore: 68,
      uniqueFeatures: "Baliwag's famous chicken district with competing stalls offering best lechon manok"
    }
  },
  {
    name: "Racks BBQ Ribs Bulacan",
    category: "food",
    description: "American-style ribs and steaks with lively sports bar atmosphere. Popular for celebrations.",
    location: { address: "SM City Baliwag", city: "Bulacan", lat: 14.9624, lng: 120.8965 },
    contact: { phone: "+63 44 673 4567", website: "https://racks.com.ph" },
    businessInfo: {
      hours: "11:00 AM - 11:00 PM",
      priceRange: "₱₱₱",
      features: ["American BBQ", "Sports Bar", "Ribs", "Beer"]
    },
    images: {
      hero: "https://example.com/racks-bulacan-hero.jpg",
      gallery: ["https://example.com/racks-1.jpg", "https://example.com/racks-2.jpg", "https://example.com/racks-3.jpg"]
    },
    discovery: {
      tags: ["ribs", "american", "sports bar", "beer"],
      perfectFor: ["ribs lovers", "watching sports", "celebrations"],
      moodScore: 70,
      uniqueFeatures: "Famous for fall-off-the-bone ribs and American BBQ with sports viewing"
    }
  }
];

/**
 * ACTIVITY PLACES - Bulacan (25 total)
 */
export const bulacanActivityPlaces: PlaceInput[] = [
  // CHILL (8 places)
  {
    name: "Philippine Arena Prayer Garden",
    category: "activity",
    description: "Peaceful meditation garden within the arena complex. Quiet space for reflection and prayer.",
    location: { address: "Philippine Arena Complex, Bocaue", city: "Bulacan", lat: 14.8008, lng: 120.9338 },
    contact: {},
    businessInfo: {
      hours: "6:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Prayer Garden", "Free", "Peaceful", "Meditation"]
    },
    images: {
      hero: "https://example.com/prayer-garden-hero.jpg",
      gallery: ["https://example.com/prayer-garden-1.jpg", "https://example.com/prayer-garden-2.jpg", "https://example.com/prayer-garden-3.jpg"]
    },
    discovery: {
      tags: ["prayer", "meditation", "peaceful", "garden"],
      perfectFor: ["meditation", "quiet reflection", "prayer"],
      moodScore: 15,
      uniqueFeatures: "Tranquil prayer garden in the shadow of world's largest indoor arena"
    }
  },
  {
    name: "Bocaue River Park",
    category: "activity",
    description: "Riverside promenade with walking paths and benches. Peaceful spot overlooking Bocaue River.",
    location: { address: "Along Bocaue River", city: "Bulacan", lat: 14.7954, lng: 120.9287 },
    contact: {},
    businessInfo: {
      hours: "5:00 AM - 9:00 PM",
      priceRange: "₱",
      features: ["River Walk", "Free", "Walking Paths", "Scenic"]
    },
    images: {
      hero: "https://example.com/bocaue-river-hero.jpg",
      gallery: ["https://example.com/bocaue-river-1.jpg", "https://example.com/bocaue-river-2.jpg", "https://example.com/bocaue-river-3.jpg"]
    },
    discovery: {
      tags: ["river", "park", "walking", "peaceful"],
      perfectFor: ["morning walks", "river views", "quiet time"],
      moodScore: 27,
      uniqueFeatures: "Scenic river promenade popular with morning joggers and evening walkers"
    }
  },
  // NEUTRAL (9 places)
  {
    name: "Philippine Arena",
    category: "activity",
    description: "World's largest indoor arena hosting concerts, sports, and religious gatherings. Architectural marvel.",
    location: { address: "Ciudad de Victoria, Bocaue", city: "Bulacan", lat: 14.8000, lng: 120.9340 },
    contact: { phone: "+63 44 693 8888", website: "https://philippinearena.net" },
    businessInfo: {
      hours: "Varies by event",
      priceRange: "₱₱₱",
      features: ["Arena", "Concerts", "Sports", "Events"]
    },
    images: {
      hero: "https://example.com/phil-arena-hero.jpg",
      gallery: ["https://example.com/phil-arena-1.jpg", "https://example.com/phil-arena-2.jpg", "https://example.com/phil-arena-3.jpg", "https://example.com/phil-arena-4.jpg", "https://example.com/phil-arena-5.jpg"]
    },
    discovery: {
      tags: ["arena", "concerts", "sports", "events"],
      perfectFor: ["concerts", "sports events", "large gatherings"],
      moodScore: 60,
      uniqueFeatures: "World's largest indoor arena with 55,000 capacity and stunning architecture"
    }
  },
  {
    name: "Plaza Marcela Complex",
    category: "activity",
    description: "Community mall with bowling, cinema, and family entertainment. Local shopping and activity hub.",
    location: { address: "MacArthur Highway, Santa Maria", city: "Bulacan", lat: 14.8172, lng: 120.9572 },
    contact: { phone: "+63 44 815 3456" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Mall", "Bowling", "Cinema", "Family-Friendly"]
    },
    images: {
      hero: "https://example.com/plaza-marcela-hero.jpg",
      gallery: ["https://example.com/plaza-marcela-1.jpg", "https://example.com/plaza-marcela-2.jpg", "https://example.com/plaza-marcela-3.jpg"]
    },
    discovery: {
      tags: ["mall", "bowling", "cinema", "family"],
      perfectFor: ["family activities", "bowling", "movies"],
      moodScore: 53,
      uniqueFeatures: "Main entertainment destination in Santa Maria with complete family facilities"
    }
  },
  {
    name: "Verona Sports Complex",
    category: "activity",
    description: "Multi-sport complex with basketball, badminton, and swimming pool. Popular for weekend leagues.",
    location: { address: "Ciudad de Victoria, Bocaue", city: "Bulacan", lat: 14.7988, lng: 120.9328 },
    contact: { phone: "+63 44 693 4321" },
    businessInfo: {
      hours: "6:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Sports Complex", "Basketball", "Swimming", "Court Rental"]
    },
    images: {
      hero: "https://example.com/verona-sports-hero.jpg",
      gallery: ["https://example.com/verona-1.jpg", "https://example.com/verona-2.jpg", "https://example.com/verona-3.jpg"]
    },
    discovery: {
      tags: ["sports", "basketball", "swimming", "fitness"],
      perfectFor: ["team sports", "swimming", "fitness activities"],
      moodScore: 58,
      uniqueFeatures: "Modern sports facility near Philippine Arena with Olympic-size pool"
    }
  },
  // HYPE (8 places)
  {
    name: "Arena Experience Concert Hall",
    category: "activity",
    description: "Secondary venue for concerts and live events. High-energy shows and performances.",
    location: { address: "Philippine Arena Complex", city: "Bulacan", lat: 14.8006, lng: 120.9346 },
    contact: { phone: "+63 44 693 8889" },
    businessInfo: {
      hours: "Varies by event",
      priceRange: "₱₱₱",
      features: ["Concert Hall", "Live Shows", "Events", "Performance Venue"]
    },
    images: {
      hero: "https://example.com/arena-exp-hero.jpg",
      gallery: ["https://example.com/arena-exp-1.jpg", "https://example.com/arena-exp-2.jpg", "https://example.com/arena-exp-3.jpg", "https://example.com/arena-exp-4.jpg"]
    },
    discovery: {
      tags: ["concerts", "live shows", "events", "music"],
      perfectFor: ["concerts", "live performances", "music events"],
      moodScore: 85,
      uniqueFeatures: "State-of-the-art concert venue with world-class acoustics and production"
    }
  },
  {
    name: "Extreme Ride Adventures Bulacan",
    category: "activity",
    description: "ATV and dirt bike adventure park. Adrenaline-pumping off-road experience through Bulacan terrain.",
    location: { address: "Lolomboy, Bocaue", city: "Bulacan", lat: 14.7856, lng: 120.9245 },
    contact: { phone: "+63 44 693 7654", website: "https://www.instagram.com/extremeridebulacan" },
    businessInfo: {
      hours: "8:00 AM - 5:00 PM",
      priceRange: "₱₱",
      features: ["ATV", "Adventure", "Off-Road", "Outdoor"]
    },
    images: {
      hero: "https://example.com/extreme-ride-hero.jpg",
      gallery: ["https://example.com/extreme-1.jpg", "https://example.com/extreme-2.jpg", "https://example.com/extreme-3.jpg", "https://example.com/extreme-4.jpg"]
    },
    discovery: {
      tags: ["atv", "adventure", "extreme", "outdoor"],
      perfectFor: ["adventure seekers", "group activities", "thrill rides"],
      moodScore: 88,
      uniqueFeatures: "Off-road ATV trails through rural Bulacan with guided adventure tours"
    }
  },
  // Additional CHILL Activity Places (6 more)
  {
    name: "Sanctuary Spa & Wellness Bulacan",
    category: "activity",
    description: "Full-service spa with traditional Filipino treatments. Peaceful sanctuary for relaxation.",
    location: { address: "Santa Maria", city: "Bulacan", lat: 14.8175, lng: 120.9568 },
    contact: { phone: "+63 44 815 6789" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Spa", "Massage", "Wellness", "Hilot"]
    },
    images: {
      hero: "https://example.com/sanctuary-spa-hero.jpg",
      gallery: ["https://example.com/sanctuary-1.jpg", "https://example.com/sanctuary-2.jpg", "https://example.com/sanctuary-3.jpg"]
    },
    discovery: {
      tags: ["spa", "massage", "wellness", "relaxation"],
      perfectFor: ["spa treatments", "relaxation", "wellness day"],
      moodScore: 18,
      uniqueFeatures: "Traditional Filipino hilot and modern spa treatments in peaceful setting"
    }
  },
  {
    name: "Baliwag Church Heritage Gardens",
    category: "activity",
    description: "Peaceful church gardens with historic statues. Quiet place for reflection and photography.",
    location: { address: "Poblacion, Baliwag", city: "Bulacan", lat: 14.9545, lng: 120.8925 },
    contact: {},
    businessInfo: {
      hours: "6:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Gardens", "Historic", "Free", "Photography"]
    },
    images: {
      hero: "https://example.com/baliwag-church-gardens-hero.jpg",
      gallery: ["https://example.com/baliwag-church-1.jpg", "https://example.com/baliwag-church-2.jpg", "https://example.com/baliwag-church-3.jpg"]
    },
    discovery: {
      tags: ["gardens", "historic", "church", "peaceful"],
      perfectFor: ["quiet walks", "photography", "reflection"],
      moodScore: 22,
      uniqueFeatures: "Beautiful heritage church with well-maintained gardens and colonial architecture"
    }
  },
  {
    name: "Morning Yoga by the River",
    category: "activity",
    description: "Outdoor yoga sessions along Bocaue River. Peaceful morning practice with nature views.",
    location: { address: "Riverside, Bocaue", city: "Bulacan", lat: 14.7960, lng: 120.9288 },
    contact: { phone: "+63 44 693 3210", website: "https://www.instagram.com/yogabulacan" },
    businessInfo: {
      hours: "6:00 AM - 8:00 AM (Mon-Sat)",
      priceRange: "₱",
      features: ["Yoga", "Outdoor", "River View", "Morning Classes"]
    },
    images: {
      hero: "https://example.com/yoga-river-hero.jpg",
      gallery: ["https://example.com/yoga-river-1.jpg", "https://example.com/yoga-river-2.jpg", "https://example.com/yoga-river-3.jpg"]
    },
    discovery: {
      tags: ["yoga", "outdoor", "river", "morning"],
      perfectFor: ["morning yoga", "outdoor exercise", "wellness"],
      moodScore: 20,
      uniqueFeatures: "Sunrise yoga sessions along the river with experienced instructors"
    }
  },
  {
    name: "Angat Dam Viewpoint",
    category: "activity",
    description: "Scenic viewpoint overlooking Angat Dam. Peaceful spot for nature appreciation and photography.",
    location: { address: "Angat, Bulacan", city: "Bulacan", lat: 14.9245, lng: 121.0298 },
    contact: {},
    businessInfo: {
      hours: "6:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Viewpoint", "Free", "Nature", "Photography"]
    },
    images: {
      hero: "https://example.com/angat-dam-hero.jpg",
      gallery: ["https://example.com/angat-dam-1.jpg", "https://example.com/angat-dam-2.jpg", "https://example.com/angat-dam-3.jpg"]
    },
    discovery: {
      tags: ["viewpoint", "dam", "nature", "photography"],
      perfectFor: ["nature lovers", "photography", "scenic views"],
      moodScore: 26,
      uniqueFeatures: "Metro Manila's water source with stunning reservoir views and cool climate"
    }
  },
  {
    name: "Riverside Meditation Center",
    category: "activity",
    description: "Meditation and mindfulness center with river views. Peaceful sanctuary for inner peace.",
    location: { address: "San Rafael, Bulacan", city: "Bulacan", lat: 14.9438, lng: 120.9642 },
    contact: { phone: "+63 44 816 4567" },
    businessInfo: {
      hours: "7:00 AM - 7:00 PM",
      priceRange: "₱",
      features: ["Meditation", "Mindfulness", "River View", "Peaceful"]
    },
    images: {
      hero: "https://example.com/meditation-center-hero.jpg",
      gallery: ["https://example.com/meditation-1.jpg", "https://example.com/meditation-2.jpg", "https://example.com/meditation-3.jpg"]
    },
    discovery: {
      tags: ["meditation", "mindfulness", "peaceful", "river"],
      perfectFor: ["meditation", "mindfulness", "stress relief"],
      moodScore: 17,
      uniqueFeatures: "Meditation center offering guided sessions with Angat River backdrop"
    }
  },
  {
    name: "Bulacan Heritage Walking Trail",
    category: "activity",
    description: "Self-guided historic walking tour through Malolos. Peaceful exploration of colonial sites.",
    location: { address: "Malolos City Center", city: "Bulacan", lat: 14.8432, lng: 120.8115 },
    contact: {},
    businessInfo: {
      hours: "7:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Walking Tour", "Historic", "Free", "Self-Guided"]
    },
    images: {
      hero: "https://example.com/heritage-trail-hero.jpg",
      gallery: ["https://example.com/heritage-1.jpg", "https://example.com/heritage-2.jpg", "https://example.com/heritage-3.jpg"]
    },
    discovery: {
      tags: ["heritage", "walking", "historic", "cultural"],
      perfectFor: ["history lovers", "walking tours", "cultural exploration"],
      moodScore: 31,
      uniqueFeatures: "Historic trail covering 10 heritage sites in Malolos including revolutionary landmarks"
    }
  },
  // Additional NEUTRAL Activity Places (6 more)
  {
    name: "SM City Baliwag",
    category: "activity",
    description: "Modern shopping mall with cinema, arcade, and dining. Complete family entertainment destination.",
    location: { address: "Baliwag", city: "Bulacan", lat: 14.9620, lng: 120.8962 },
    contact: { phone: "+63 44 673 3456", website: "https://smsupermalls.com" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱",
      features: ["Mall", "Cinema", "Arcade", "Shopping"]
    },
    images: {
      hero: "https://example.com/sm-baliwag-hero.jpg",
      gallery: ["https://example.com/sm-baliwag-1.jpg", "https://example.com/sm-baliwag-2.jpg", "https://example.com/sm-baliwag-3.jpg"]
    },
    discovery: {
      tags: ["mall", "shopping", "cinema", "family"],
      perfectFor: ["family outings", "shopping", "movies"],
      moodScore: 54,
      uniqueFeatures: "Bulacan's premier shopping mall with complete entertainment facilities"
    }
  },
  {
    name: "Family Fun Zone Bocaue",
    category: "activity",
    description: "Indoor play center with arcade, trampoline park, and party rooms. Perfect for kids and families.",
    location: { address: "Tabang, Bocaue", city: "Bulacan", lat: 14.8012, lng: 120.9268 },
    contact: { phone: "+63 44 693 5432" },
    businessInfo: {
      hours: "10:00 AM - 8:00 PM",
      priceRange: "₱₱",
      features: ["Indoor Play", "Trampoline", "Arcade", "Kids"]
    },
    images: {
      hero: "https://example.com/family-fun-zone-hero.jpg",
      gallery: ["https://example.com/family-fun-1.jpg", "https://example.com/family-fun-2.jpg", "https://example.com/family-fun-3.jpg"]
    },
    discovery: {
      tags: ["kids", "indoor play", "trampoline", "family"],
      perfectFor: ["kids activities", "family time", "birthday parties"],
      moodScore: 58,
      uniqueFeatures: "Complete indoor play center with trampoline park and party packages"
    }
  },
  {
    name: "Hoops Basketball Arena Bulacan",
    category: "activity",
    description: "Indoor air-conditioned courts for basketball. League games and rentals available.",
    location: { address: "Santa Maria", city: "Bulacan", lat: 14.8168, lng: 120.9570 },
    contact: { phone: "+63 44 815 7890" },
    businessInfo: {
      hours: "6:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["Basketball", "Air-Conditioned", "League", "Court Rental"]
    },
    images: {
      hero: "https://example.com/hoops-bulacan-hero.jpg",
      gallery: ["https://example.com/hoops-bulacan-1.jpg", "https://example.com/hoops-bulacan-2.jpg", "https://example.com/hoops-bulacan-3.jpg"]
    },
    discovery: {
      tags: ["basketball", "sports", "indoor", "leagues"],
      perfectFor: ["basketball games", "team sports", "fitness"],
      moodScore: 60,
      uniqueFeatures: "Modern air-conditioned courts with organized basketball leagues"
    }
  },
  {
    name: "Cinema 3 Santa Maria",
    category: "activity",
    description: "Modern movie theater with digital projection. Comfortable seating for movie enthusiasts.",
    location: { address: "Plaza Marcela, Santa Maria", city: "Bulacan", lat: 14.8174, lng: 120.9574 },
    contact: { phone: "+63 44 815 8901" },
    businessInfo: {
      hours: "10:00 AM - 11:00 PM",
      priceRange: "₱₱",
      features: ["Cinema", "Digital", "Comfortable Seating", "Snacks"]
    },
    images: {
      hero: "https://example.com/cinema3-hero.jpg",
      gallery: ["https://example.com/cinema3-1.jpg", "https://example.com/cinema3-2.jpg", "https://example.com/cinema3-3.jpg"]
    },
    discovery: {
      tags: ["cinema", "movies", "entertainment", "indoor"],
      perfectFor: ["movie dates", "family movies", "entertainment"],
      moodScore: 52,
      uniqueFeatures: "Modern cinema with latest releases and comfortable stadium seating"
    }
  },
  {
    name: "Badminton Hub Bocaue",
    category: "activity",
    description: "Badminton courts with equipment rental. Casual sports venue for all skill levels.",
    location: { address: "Bunsuran, Bocaue", city: "Bulacan", lat: 14.7972, lng: 120.9305 },
    contact: { phone: "+63 44 693 6789" },
    businessInfo: {
      hours: "6:00 AM - 10:00 PM",
      priceRange: "₱",
      features: ["Badminton", "Equipment Rental", "Casual", "Sports"]
    },
    images: {
      hero: "https://example.com/badminton-hub-hero.jpg",
      gallery: ["https://example.com/badminton-1.jpg", "https://example.com/badminton-2.jpg", "https://example.com/badminton-3.jpg"]
    },
    discovery: {
      tags: ["badminton", "sports", "casual", "fitness"],
      perfectFor: ["badminton", "casual sports", "exercise"],
      moodScore: 56,
      uniqueFeatures: "Popular badminton venue with affordable hourly rates and equipment rental"
    }
  },
  {
    name: "Arcade Zone Bulacan",
    category: "activity",
    description: "Gaming arcade with classic and modern games. Fun for all ages with prizes and tournaments.",
    location: { address: "Tabang, Bocaue", city: "Bulacan", lat: 14.8014, lng: 120.9270 },
    contact: { phone: "+63 44 693 7890" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱",
      features: ["Arcade", "Games", "Prizes", "Family-Friendly"]
    },
    images: {
      hero: "https://example.com/arcade-zone-hero.jpg",
      gallery: ["https://example.com/arcade-1.jpg", "https://example.com/arcade-2.jpg", "https://example.com/arcade-3.jpg"]
    },
    discovery: {
      tags: ["arcade", "games", "family", "fun"],
      perfectFor: ["gaming", "family fun", "kids activities"],
      moodScore: 62,
      uniqueFeatures: "Large arcade with classic games, racing simulators, and prize redemption"
    }
  },
  // Additional HYPE Activity Places (6 more)
  {
    name: "Paintball Arena Bulacan",
    category: "activity",
    description: "Outdoor paintball fields with various scenarios. Adrenaline-pumping team battles.",
    location: { address: "Lolomboy, Bocaue", city: "Bulacan", lat: 14.7865, lng: 120.9250 },
    contact: { phone: "+63 44 693 8520", website: "https://www.instagram.com/paintballbulacan" },
    businessInfo: {
      hours: "8:00 AM - 6:00 PM (Weekends)",
      priceRange: "₱₱",
      features: ["Paintball", "Outdoor", "Team Activity", "Adventure"]
    },
    images: {
      hero: "https://example.com/paintball-bulacan-hero.jpg",
      gallery: ["https://example.com/paintball-1.jpg", "https://example.com/paintball-2.jpg", "https://example.com/paintball-3.jpg", "https://example.com/paintball-4.jpg"]
    },
    discovery: {
      tags: ["paintball", "adventure", "team", "outdoor"],
      perfectFor: ["team building", "adventure", "group bonding"],
      moodScore: 85,
      uniqueFeatures: "Multiple themed paintball fields with gear rental and team packages"
    }
  },
  {
    name: "Bulacan Speedway Go-Kart",
    category: "activity",
    description: "Racing go-kart track with powerful karts. Thrilling racing experience for speed enthusiasts.",
    location: { address: "Balagtas, Bulacan", city: "Bulacan", lat: 14.8187, lng: 120.8879 },
    contact: { phone: "+63 44 695 7890" },
    businessInfo: {
      hours: "10:00 AM - 8:00 PM",
      priceRange: "₱₱",
      features: ["Go-Kart", "Racing", "Speed", "Challenge"]
    },
    images: {
      hero: "https://example.com/speedway-hero.jpg",
      gallery: ["https://example.com/speedway-1.jpg", "https://example.com/speedway-2.jpg", "https://example.com/speedway-3.jpg"]
    },
    discovery: {
      tags: ["go-kart", "racing", "speed", "adventure"],
      perfectFor: ["racing enthusiasts", "adrenaline", "competitive fun"],
      moodScore: 87,
      uniqueFeatures: "Professional-grade go-kart track with timed races and leaderboards"
    }
  },
  {
    name: "Arena Concert Grounds",
    category: "activity",
    description: "Outdoor concert venue for major shows. High-energy music events and festivals.",
    location: { address: "Philippine Arena Complex", city: "Bulacan", lat: 14.8007, lng: 120.9348 },
    contact: {},
    businessInfo: {
      hours: "Varies by event",
      priceRange: "₱₱₱",
      features: ["Concerts", "Outdoor", "Events", "Large Capacity"]
    },
    images: {
      hero: "https://example.com/concert-grounds-hero.jpg",
      gallery: ["https://example.com/concert-1.jpg", "https://example.com/concert-2.jpg", "https://example.com/concert-3.jpg", "https://example.com/concert-4.jpg"]
    },
    discovery: {
      tags: ["concerts", "outdoor", "music", "events"],
      perfectFor: ["music festivals", "outdoor concerts", "major events"],
      moodScore: 92,
      uniqueFeatures: "Massive outdoor concert grounds hosting international and local music festivals"
    }
  },
  {
    name: "Night Market Events Bocaue",
    category: "activity",
    description: "Weekend night market with food, shopping, and entertainment. Vibrant atmosphere with live music.",
    location: { address: "Bocaue Town Center", city: "Bulacan", lat: 14.7982, lng: 120.9310 },
    contact: {},
    businessInfo: {
      hours: "6:00 PM - 12:00 AM (Fri-Sun)",
      priceRange: "₱",
      features: ["Night Market", "Weekend", "Entertainment", "Food Stalls"]
    },
    images: {
      hero: "https://example.com/night-market-bocaue-hero.jpg",
      gallery: ["https://example.com/night-market-1.jpg", "https://example.com/night-market-2.jpg", "https://example.com/night-market-3.jpg"]
    },
    discovery: {
      tags: ["night market", "weekend", "food", "entertainment"],
      perfectFor: ["weekend nights", "local shopping", "street food"],
      moodScore: 75,
      uniqueFeatures: "Lively weekend night market with local vendors and live entertainment"
    }
  },
  {
    name: "Motocross Track Bulacan",
    category: "activity",
    description: "Off-road motorcycle racing track. Extreme sports venue for motocross enthusiasts.",
    location: { address: "Lolomboy, Bocaue", city: "Bulacan", lat: 14.7860, lng: 120.9242 },
    contact: { phone: "+63 44 693 8642", website: "https://www.instagram.com/motocrossbulacan" },
    businessInfo: {
      hours: "7:00 AM - 6:00 PM (Weekends)",
      priceRange: "₱₱₱",
      features: ["Motocross", "Extreme Sports", "Racing", "Outdoor"]
    },
    images: {
      hero: "https://example.com/motocross-hero.jpg",
      gallery: ["https://example.com/motocross-1.jpg", "https://example.com/motocross-2.jpg", "https://example.com/motocross-3.jpg", "https://example.com/motocross-4.jpg"]
    },
    discovery: {
      tags: ["motocross", "extreme", "racing", "motorcycle"],
      perfectFor: ["extreme sports", "motocross fans", "adrenaline"],
      moodScore: 90,
      uniqueFeatures: "Professional motocross track with rentals and training for beginners to experts"
    }
  },
  {
    name: "Adventure Challenge Park",
    category: "activity",
    description: "Obstacle course and team challenge park. High ropes, ziplines, and team-building activities.",
    location: { address: "Santa Maria", city: "Bulacan", lat: 14.8185, lng: 120.9584 },
    contact: { phone: "+63 44 815 9012", website: "https://www.adventureparkbulacan.com" },
    businessInfo: {
      hours: "8:00 AM - 6:00 PM",
      priceRange: "₱₱",
      features: ["Obstacle Course", "Zipline", "Team Building", "Adventure"]
    },
    images: {
      hero: "https://example.com/adventure-challenge-hero.jpg",
      gallery: ["https://example.com/adventure-1.jpg", "https://example.com/adventure-2.jpg", "https://example.com/adventure-3.jpg", "https://example.com/adventure-4.jpg"]
    },
    discovery: {
      tags: ["adventure", "obstacle course", "zipline", "team"],
      perfectFor: ["team building", "adventure seekers", "group challenges"],
      moodScore: 86,
      uniqueFeatures: "Multi-level obstacle course with ziplines and rope challenges for all ages"
    }
  }
];

/**
 * SOMETHING-NEW PLACES - Bulacan (25 total)
 */
export const bulacanSomethingNewPlaces: PlaceInput[] = [
  // CHILL (8 places)
  {
    name: "Barasoain Church Museum",
    category: "something-new",
    description: "Historic church where Philippine independence was declared. Quiet museum with revolutionary artifacts.",
    location: { address: "Plaza Rizal, Malolos", city: "Bulacan", lat: 14.8441, lng: 120.8118 },
    contact: { phone: "+63 44 791 2345" },
    businessInfo: {
      hours: "8:00 AM - 5:00 PM",
      priceRange: "₱",
      features: ["Museum", "Historic", "Free", "Cultural"]
    },
    images: {
      hero: "https://example.com/barasoain-hero.jpg",
      gallery: ["https://example.com/barasoain-1.jpg", "https://example.com/barasoain-2.jpg", "https://example.com/barasoain-3.jpg", "https://example.com/barasoain-4.jpg"]
    },
    discovery: {
      tags: ["historic", "church", "museum", "cultural"],
      perfectFor: ["history lovers", "cultural tours", "photography"],
      moodScore: 24,
      uniqueFeatures: "Birthplace of Philippine independence and First Philippine Republic Constitution"
    }
  },
  {
    name: "Casa Real Shrine",
    category: "something-new",
    description: "Spanish-era government building turned museum. Peaceful historic site with colonial architecture.",
    location: { address: "Paseo del Congreso, Malolos", city: "Bulacan", lat: 14.8445, lng: 120.8125 },
    contact: { phone: "+63 44 791 3456" },
    businessInfo: {
      hours: "8:00 AM - 5:00 PM (Closed Mon)",
      priceRange: "₱",
      features: ["Historic", "Museum", "Architecture", "Free"]
    },
    images: {
      hero: "https://example.com/casareal-hero.jpg",
      gallery: ["https://example.com/casareal-1.jpg", "https://example.com/casareal-2.jpg", "https://example.com/casareal-3.jpg"]
    },
    discovery: {
      tags: ["historic", "colonial", "architecture", "museum"],
      perfectFor: ["history buffs", "architecture lovers", "cultural exploration"],
      moodScore: 26,
      uniqueFeatures: "Beautifully restored Spanish colonial government building from 1580s"
    }
  },
  {
    name: "Hidden Garden Art Space",
    category: "something-new",
    description: "Secret garden gallery showcasing local Bulacan artists. Peaceful sculpture garden and paintings.",
    location: { address: "San Jose, Santa Maria", city: "Bulacan", lat: 14.8145, lng: 120.9555 },
    contact: { website: "https://www.instagram.com/hiddengardenbulacan" },
    businessInfo: {
      hours: "10:00 AM - 6:00 PM (Weekends only)",
      priceRange: "₱",
      features: ["Art Gallery", "Garden", "Sculptures", "Hidden Gem"]
    },
    images: {
      hero: "https://example.com/hidden-garden-art-hero.jpg",
      gallery: ["https://example.com/hidden-art-1.jpg", "https://example.com/hidden-art-2.jpg", "https://example.com/hidden-art-3.jpg"]
    },
    discovery: {
      tags: ["art", "garden", "sculptures", "hidden"],
      perfectFor: ["art lovers", "hidden gems", "peaceful visits"],
      moodScore: 29,
      uniqueFeatures: "Secret art space in residential area featuring Bulacan contemporary artists"
    }
  },
  // NEUTRAL (9 places)
  {
    name: "Bocaue River Floating Market",
    category: "something-new",
    description: "Weekend floating market with local vendors. Unique shopping experience on boats.",
    location: { address: "Bocaue River", city: "Bulacan", lat: 14.7961, lng: 120.9292 },
    contact: {},
    businessInfo: {
      hours: "6:00 AM - 11:00 AM (Weekends only)",
      priceRange: "₱",
      features: ["Market", "Floating", "Weekend", "Local Products"]
    },
    images: {
      hero: "https://example.com/floating-market-hero.jpg",
      gallery: ["https://example.com/floating-1.jpg", "https://example.com/floating-2.jpg", "https://example.com/floating-3.jpg", "https://example.com/floating-4.jpg"]
    },
    discovery: {
      tags: ["market", "floating", "unique", "local"],
      perfectFor: ["unique shopping", "weekend mornings", "local products"],
      moodScore: 52,
      uniqueFeatures: "Traditional floating market where vendors sell from boats on the river"
    }
  },
  {
    name: "Pastillas Making Workshop",
    category: "something-new",
    description: "Hands-on workshop learning traditional pastillas de leche making. Unique Bulacan cultural experience.",
    location: { address: "San Miguel, Bocaue", city: "Bulacan", lat: 14.7945, lng: 120.9275 },
    contact: { phone: "+63 44 693 2222", website: "https://www.bulacantourism.com" },
    businessInfo: {
      hours: "9:00 AM - 4:00 PM (By appointment)",
      priceRange: "₱₱",
      features: ["Workshop", "Cultural", "Hands-On", "Traditional"]
    },
    images: {
      hero: "https://example.com/pastillas-workshop-hero.jpg",
      gallery: ["https://example.com/pastillas-1.jpg", "https://example.com/pastillas-2.jpg", "https://example.com/pastillas-3.jpg"]
    },
    discovery: {
      tags: ["workshop", "pastillas", "cultural", "unique"],
      perfectFor: ["cultural experiences", "learning", "group activities"],
      moodScore: 55,
      uniqueFeatures: "Learn to make Bulacan's famous pastillas from local artisans"
    }
  },
  {
    name: "Grotto of Our Lady of Lourdes",
    category: "something-new",
    description: "Unique hillside grotto with religious statues and gardens. Peaceful pilgrimage site with panoramic views.",
    location: { address: "Sapang Putol, Malolos", city: "Bulacan", lat: 14.8334, lng: 120.8234 },
    contact: {},
    businessInfo: {
      hours: "6:00 AM - 6:00 PM",
      priceRange: "₱",
      features: ["Grotto", "Religious", "Gardens", "Free"]
    },
    images: {
      hero: "https://example.com/grotto-hero.jpg",
      gallery: ["https://example.com/grotto-1.jpg", "https://example.com/grotto-2.jpg", "https://example.com/grotto-3.jpg"]
    },
    discovery: {
      tags: ["grotto", "religious", "pilgrimage", "views"],
      perfectFor: ["pilgrimage", "peaceful visits", "photography"],
      moodScore: 35,
      uniqueFeatures: "Hillside grotto with stations of the cross and panoramic Bulacan views"
    }
  },
  // HYPE (8 places)
  {
    name: "Waterboom Water Park",
    category: "something-new",
    description: "Exciting water park with slides and wave pools. Perfect summer destination for thrill-seekers.",
    location: { address: "Lolomboy, Bocaue", city: "Bulacan", lat: 14.7878, lng: 120.9256 },
    contact: { phone: "+63 44 693 9999", website: "https://waterboomph.com" },
    businessInfo: {
      hours: "9:00 AM - 6:00 PM",
      priceRange: "₱₱",
      features: ["Water Park", "Slides", "Wave Pool", "Family Fun"]
    },
    images: {
      hero: "https://example.com/waterboom-hero.jpg",
      gallery: ["https://example.com/waterboom-1.jpg", "https://example.com/waterboom-2.jpg", "https://example.com/waterboom-3.jpg", "https://example.com/waterboom-4.jpg", "https://example.com/waterboom-5.jpg"]
    },
    discovery: {
      tags: ["water park", "slides", "adventure", "summer"],
      perfectFor: ["summer fun", "family adventures", "water activities"],
      moodScore: 82,
      uniqueFeatures: "Bulacan's largest water park with extreme slides and massive wave pool"
    }
  },
  {
    name: "Fireworks Festival Experience",
    category: "something-new",
    description: "Annual Bocaue fireworks festival viewing area. Spectacular pyrotechnics display over the river.",
    location: { address: "Bocaue River Festival Grounds", city: "Bulacan", lat: 14.7958, lng: 120.9290 },
    contact: {},
    businessInfo: {
      hours: "Special event (July)",
      priceRange: "₱",
      features: ["Festival", "Fireworks", "Annual Event", "River View"]
    },
    images: {
      hero: "https://example.com/fireworks-fest-hero.jpg",
      gallery: ["https://example.com/fireworks-1.jpg", "https://example.com/fireworks-2.jpg", "https://example.com/fireworks-3.jpg", "https://example.com/fireworks-4.jpg"]
    },
    discovery: {
      tags: ["festival", "fireworks", "annual", "spectacular"],
      perfectFor: ["festival season", "fireworks", "cultural events"],
      moodScore: 90,
      uniqueFeatures: "Annual Bocaue Pagoda Festival with spectacular fireworks competition over the river"
    }
  },
  // Additional CHILL Something-New Places (5 more)
  {
    name: "Antique Shops of Malolos",
    category: "something-new",
    description: "Row of antique shops with colonial-era artifacts. Quiet treasure hunting in historic district.",
    location: { address: "Paseo del Congreso, Malolos", city: "Bulacan", lat: 14.8443, lng: 120.8120 },
    contact: {},
    businessInfo: {
      hours: "9:00 AM - 6:00 PM",
      priceRange: "₱₱",
      features: ["Antiques", "Shopping", "Historic", "Unique"]
    },
    images: {
      hero: "https://example.com/antique-shops-hero.jpg",
      gallery: ["https://example.com/antique-1.jpg", "https://example.com/antique-2.jpg", "https://example.com/antique-3.jpg"]
    },
    discovery: {
      tags: ["antiques", "shopping", "historic", "treasure hunting"],
      perfectFor: ["antique collectors", "unique finds", "history lovers"],
      moodScore: 30,
      uniqueFeatures: "Collection of antique shops selling Spanish-era furniture and colonial artifacts"
    }
  },
  {
    name: "Poetry Cafe Malolos",
    category: "something-new",
    description: "Literary cafe with weekly poetry readings. Quiet artistic space for writers and readers.",
    location: { address: "Barasoain, Malolos", city: "Bulacan", lat: 14.8440, lng: 120.8125 },
    contact: { website: "https://www.instagram.com/poetrycafemalolos" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Cafe", "Poetry", "Readings", "Literary"]
    },
    images: {
      hero: "https://example.com/poetry-cafe-hero.jpg",
      gallery: ["https://example.com/poetry-cafe-1.jpg", "https://example.com/poetry-cafe-2.jpg", "https://example.com/poetry-cafe-3.jpg"]
    },
    discovery: {
      tags: ["cafe", "poetry", "literary", "artistic"],
      perfectFor: ["writers", "poetry lovers", "quiet creativity"],
      moodScore: 27,
      uniqueFeatures: "Weekly open mic poetry nights in intimate cafe setting with local writers"
    }
  },
  {
    name: "Vintage Book Nook",
    category: "something-new",
    description: "Hidden used bookstore in old Malolos house. Treasure trove of rare Filipino books.",
    location: { address: "Malolos City Center", city: "Bulacan", lat: 14.8435, lng: 120.8118 },
    contact: { phone: "+63 44 791 5678" },
    businessInfo: {
      hours: "10:00 AM - 6:00 PM (Closed Sun)",
      priceRange: "₱",
      features: ["Bookstore", "Used Books", "Rare Finds", "Hidden"]
    },
    images: {
      hero: "https://example.com/vintage-book-hero.jpg",
      gallery: ["https://example.com/vintage-book-1.jpg", "https://example.com/vintage-book-2.jpg", "https://example.com/vintage-book-3.jpg"]
    },
    discovery: {
      tags: ["bookstore", "vintage", "rare books", "hidden"],
      perfectFor: ["book collectors", "rare finds", "quiet browsing"],
      moodScore: 25,
      uniqueFeatures: "Rare and used bookstore specializing in Filipino literature and historical texts"
    }
  },
  {
    name: "Local Art Studios Bulacan",
    category: "something-new",
    description: "Community art studios showcasing Bulacan painters. Quiet galleries with local artworks for sale.",
    location: { address: "Santa Maria", city: "Bulacan", lat: 14.8180, lng: 120.9578 },
    contact: { website: "https://www.instagram.com/artstudiosbulacan" },
    businessInfo: {
      hours: "10:00 AM - 5:00 PM (Weekends)",
      priceRange: "₱",
      features: ["Art Studio", "Gallery", "Local Artists", "Free"]
    },
    images: {
      hero: "https://example.com/art-studios-hero.jpg",
      gallery: ["https://example.com/art-studios-1.jpg", "https://example.com/art-studios-2.jpg", "https://example.com/art-studios-3.jpg"]
    },
    discovery: {
      tags: ["art", "studios", "local artists", "gallery"],
      perfectFor: ["art lovers", "local art", "unique purchases"],
      moodScore: 28,
      uniqueFeatures: "Open studio days showcasing Bulacan contemporary artists and traditional crafts"
    }
  },
  {
    name: "Heritage House Museum Network",
    category: "something-new",
    description: "Collection of preserved ancestral houses. Peaceful self-guided tour through Bulacan history.",
    location: { address: "Malolos Heritage District", city: "Bulacan", lat: 14.8448, lng: 120.8128 },
    contact: {},
    businessInfo: {
      hours: "9:00 AM - 5:00 PM",
      priceRange: "₱",
      features: ["Heritage", "Museums", "Historic Houses", "Self-Guided"]
    },
    images: {
      hero: "https://example.com/heritage-houses-hero.jpg",
      gallery: ["https://example.com/heritage-houses-1.jpg", "https://example.com/heritage-houses-2.jpg", "https://example.com/heritage-houses-3.jpg"]
    },
    discovery: {
      tags: ["heritage", "historic houses", "museums", "cultural"],
      perfectFor: ["history buffs", "architecture", "cultural tours"],
      moodScore: 29,
      uniqueFeatures: "Network of preserved bahay na bato showcasing 19th-century Bulacan lifestyle"
    }
  },
  // Additional NEUTRAL Something-New Places (6 more)
  {
    name: "Bulacan Crafts and Kakanin Market",
    category: "something-new",
    description: "Weekend market for local crafts and traditional rice cakes. Discover Bulacan's culinary heritage.",
    location: { address: "Malolos Public Market", city: "Bulacan", lat: 14.8428, lng: 120.8110 },
    contact: {},
    businessInfo: {
      hours: "7:00 AM - 2:00 PM (Weekends)",
      priceRange: "₱",
      features: ["Market", "Crafts", "Kakanin", "Weekend"]
    },
    images: {
      hero: "https://example.com/kakanin-market-hero.jpg",
      gallery: ["https://example.com/kakanin-1.jpg", "https://example.com/kakanin-2.jpg", "https://example.com/kakanin-3.jpg"]
    },
    discovery: {
      tags: ["market", "crafts", "kakanin", "local"],
      perfectFor: ["food discovery", "local products", "weekend mornings"],
      moodScore: 50,
      uniqueFeatures: "Traditional market famous for Bulacan kakanin like puto, sapin-sapin, and pastillas"
    }
  },
  {
    name: "Kakanin Trail Food Tour",
    category: "something-new",
    description: "Guided tour through Bulacan's famous rice cake makers. Taste and learn traditional recipes.",
    location: { address: "Various locations, Malolos-Santa Maria", city: "Bulacan", lat: 14.8305, lng: 120.8342 },
    contact: { phone: "+63 44 791 6789", website: "https://bulacantourism.com/kakanin-trail" },
    businessInfo: {
      hours: "9:00 AM - 2:00 PM (By appointment)",
      priceRange: "₱₱",
      features: ["Food Tour", "Guided", "Cultural", "Tasting"]
    },
    images: {
      hero: "https://example.com/kakanin-trail-hero.jpg",
      gallery: ["https://example.com/kakanin-trail-1.jpg", "https://example.com/kakanin-trail-2.jpg", "https://example.com/kakanin-trail-3.jpg", "https://example.com/kakanin-trail-4.jpg"]
    },
    discovery: {
      tags: ["food tour", "kakanin", "cultural", "guided"],
      perfectFor: ["food lovers", "cultural experiences", "unique tours"],
      moodScore: 55,
      uniqueFeatures: "Guided tour visiting 5 traditional kakanin makers with tasting and history lessons"
    }
  },
  {
    name: "Local Weavers Cooperative",
    category: "something-new",
    description: "Traditional weaving cooperative selling handmade textiles. Watch artisans create traditional fabrics.",
    location: { address: "Barasoain, Malolos", city: "Bulacan", lat: 14.8446, lng: 120.8130 },
    contact: { phone: "+63 44 791 7890" },
    businessInfo: {
      hours: "8:00 AM - 5:00 PM",
      priceRange: "₱₱",
      features: ["Weaving", "Handicrafts", "Cooperative", "Traditional"]
    },
    images: {
      hero: "https://example.com/weavers-coop-hero.jpg",
      gallery: ["https://example.com/weavers-1.jpg", "https://example.com/weavers-2.jpg", "https://example.com/weavers-3.jpg"]
    },
    discovery: {
      tags: ["weaving", "handicrafts", "traditional", "local"],
      perfectFor: ["cultural shopping", "handicrafts", "supporting local"],
      moodScore: 48,
      uniqueFeatures: "Bulacan weaving tradition preserved by local artisans creating traditional textiles"
    }
  },
  {
    name: "Bulacan Museum of History and Culture",
    category: "something-new",
    description: "Provincial museum showcasing Bulacan's revolutionary history. Interactive exhibits and artifacts.",
    location: { address: "Capitol Compound, Malolos", city: "Bulacan", lat: 14.8452, lng: 120.8135 },
    contact: { phone: "+63 44 791 8901" },
    businessInfo: {
      hours: "8:00 AM - 5:00 PM (Closed Mon)",
      priceRange: "₱",
      features: ["Museum", "History", "Interactive", "Cultural"]
    },
    images: {
      hero: "https://example.com/bulacan-museum-hero.jpg",
      gallery: ["https://example.com/bulacan-museum-1.jpg", "https://example.com/bulacan-museum-2.jpg", "https://example.com/bulacan-museum-3.jpg"]
    },
    discovery: {
      tags: ["museum", "history", "cultural", "educational"],
      perfectFor: ["history lovers", "educational visits", "cultural learning"],
      moodScore: 45,
      uniqueFeatures: "Comprehensive museum covering Bulacan's role in Philippine independence"
    }
  },
  {
    name: "Farm Visit and Pick Experience",
    category: "something-new",
    description: "Working farm offering pick-your-own produce experience. Unique agri-tourism activity.",
    location: { address: "Santa Maria", city: "Bulacan", lat: 14.8190, lng: 120.9586 },
    contact: { phone: "+63 44 815 9123", website: "https://www.instagram.com/farmvisitbulacan" },
    businessInfo: {
      hours: "7:00 AM - 3:00 PM (Weekends)",
      priceRange: "₱₱",
      features: ["Farm Tour", "Pick-Your-Own", "Educational", "Outdoor"]
    },
    images: {
      hero: "https://example.com/farm-visit-hero.jpg",
      gallery: ["https://example.com/farm-visit-1.jpg", "https://example.com/farm-visit-2.jpg", "https://example.com/farm-visit-3.jpg"]
    },
    discovery: {
      tags: ["farm", "agri-tourism", "educational", "outdoor"],
      perfectFor: ["farm experience", "family activities", "educational tours"],
      moodScore: 52,
      uniqueFeatures: "Working farm with pick-your-own vegetables and farm-to-table lunch experience"
    }
  },
  {
    name: "Underground Art Scene Bocaue",
    category: "something-new",
    description: "Hidden contemporary art space in old warehouse. Rotating exhibits from emerging Bulacan artists.",
    location: { address: "Bunsuran, Bocaue", city: "Bulacan", lat: 14.7975, lng: 120.9308 },
    contact: { website: "https://www.instagram.com/undergroundartbocaue" },
    businessInfo: {
      hours: "2:00 PM - 8:00 PM (Weekends)",
      priceRange: "₱",
      features: ["Art Space", "Contemporary", "Hidden", "Rotating Exhibits"]
    },
    images: {
      hero: "https://example.com/underground-art-hero.jpg",
      gallery: ["https://example.com/underground-art-1.jpg", "https://example.com/underground-art-2.jpg", "https://example.com/underground-art-3.jpg"]
    },
    discovery: {
      tags: ["art", "contemporary", "underground", "hidden"],
      perfectFor: ["art enthusiasts", "hidden gems", "contemporary art"],
      moodScore: 58,
      uniqueFeatures: "Secret art space in converted warehouse featuring cutting-edge Bulacan artists"
    }
  },
  // Additional HYPE Something-New Places (6 more)
  {
    name: "New Theme Park City Victoria",
    category: "something-new",
    description: "Recently opened theme park with rides and attractions. Modern entertainment complex near the arena.",
    location: { address: "Ciudad de Victoria, Bocaue", city: "Bulacan", lat: 14.7992, lng: 120.9336 },
    contact: { phone: "+63 44 693 9012", website: "https://www.themeparkcitybulacan.com" },
    businessInfo: {
      hours: "10:00 AM - 9:00 PM",
      priceRange: "₱₱₱",
      features: ["Theme Park", "Rides", "New Opening", "Family Entertainment"]
    },
    images: {
      hero: "https://example.com/theme-park-victoria-hero.jpg",
      gallery: ["https://example.com/theme-park-1.jpg", "https://example.com/theme-park-2.jpg", "https://example.com/theme-park-3.jpg", "https://example.com/theme-park-4.jpg", "https://example.com/theme-park-5.jpg"]
    },
    discovery: {
      tags: ["theme park", "rides", "new", "entertainment"],
      perfectFor: ["family adventures", "thrill rides", "new attractions"],
      moodScore: 84,
      uniqueFeatures: "Newest theme park in Bulacan with modern rides and attractions near Philippine Arena"
    }
  },
  {
    name: "Extreme Sports Festival Grounds",
    category: "something-new",
    description: "Annual extreme sports festival venue. Skateboarding, BMX, and freestyle events.",
    location: { address: "Bocaue Sports Complex", city: "Bulacan", lat: 14.7985, lng: 120.9314 },
    contact: { website: "https://www.instagram.com/extremesportsbulacan" },
    businessInfo: {
      hours: "Special events (Monthly)",
      priceRange: "₱₱",
      features: ["Extreme Sports", "Festival", "Skateboarding", "BMX"]
    },
    images: {
      hero: "https://example.com/extreme-sports-fest-hero.jpg",
      gallery: ["https://example.com/extreme-fest-1.jpg", "https://example.com/extreme-fest-2.jpg", "https://example.com/extreme-fest-3.jpg", "https://example.com/extreme-fest-4.jpg"]
    },
    discovery: {
      tags: ["extreme sports", "festival", "skateboarding", "bmx"],
      perfectFor: ["extreme sports fans", "festivals", "action sports"],
      moodScore: 88,
      uniqueFeatures: "Monthly extreme sports competitions featuring skateboarding, BMX, and freestyle events"
    }
  },
  {
    name: "Drag Racing Strip Bulacan",
    category: "something-new",
    description: "Legal quarter-mile drag racing strip. Weekend races with modified cars and motorcycles.",
    location: { address: "Balagtas, Bulacan", city: "Bulacan", lat: 14.8195, lng: 120.8885 },
    contact: { phone: "+63 44 695 8901", website: "https://www.instagram.com/dragracingbulacan" },
    businessInfo: {
      hours: "7:00 PM - 12:00 AM (Weekends)",
      priceRange: "₱₱",
      features: ["Drag Racing", "Cars", "Motorcycles", "Weekend Events"]
    },
    images: {
      hero: "https://example.com/drag-racing-hero.jpg",
      gallery: ["https://example.com/drag-racing-1.jpg", "https://example.com/drag-racing-2.jpg", "https://example.com/drag-racing-3.jpg", "https://example.com/drag-racing-4.jpg"]
    },
    discovery: {
      tags: ["drag racing", "cars", "speed", "unique"],
      perfectFor: ["car enthusiasts", "racing fans", "weekend nights"],
      moodScore: 91,
      uniqueFeatures: "Legal drag racing strip hosting weekend competitions and car shows"
    }
  },
  {
    name: "VR Gaming Lounge Bulacan",
    category: "something-new",
    description: "Newly opened VR gaming center with latest technology. Immersive gaming experiences and tournaments.",
    location: { address: "SM City Baliwag", city: "Bulacan", lat: 14.9622, lng: 120.8964 },
    contact: { phone: "+63 44 673 5678", website: "https://www.instagram.com/vrgamingbulacan" },
    businessInfo: {
      hours: "11:00 AM - 10:00 PM",
      priceRange: "₱₱₱",
      features: ["VR Gaming", "New Technology", "Tournaments", "Modern"]
    },
    images: {
      hero: "https://example.com/vr-gaming-hero.jpg",
      gallery: ["https://example.com/vr-gaming-1.jpg", "https://example.com/vr-gaming-2.jpg", "https://example.com/vr-gaming-3.jpg"]
    },
    discovery: {
      tags: ["vr", "gaming", "technology", "new"],
      perfectFor: ["gamers", "tech enthusiasts", "unique experiences"],
      moodScore: 79,
      uniqueFeatures: "Latest VR gaming technology with full-body motion tracking and multiplayer arenas"
    }
  },
  {
    name: "Escape Challenge Bulacan",
    category: "something-new",
    description: "Themed escape rooms with Bulacan history storylines. Puzzle-solving adventure with local twist.",
    location: { address: "Santa Maria", city: "Bulacan", lat: 14.8177, lng: 120.9572 },
    contact: { phone: "+63 44 815 9234", website: "https://www.escapechallengebulacan.com" },
    businessInfo: {
      hours: "1:00 PM - 10:00 PM",
      priceRange: "₱₱",
      features: ["Escape Room", "Puzzles", "Themed", "Group Activity"]
    },
    images: {
      hero: "https://example.com/escape-challenge-hero.jpg",
      gallery: ["https://example.com/escape-challenge-1.jpg", "https://example.com/escape-challenge-2.jpg", "https://example.com/escape-challenge-3.jpg"]
    },
    discovery: {
      tags: ["escape room", "puzzles", "unique", "team"],
      perfectFor: ["team building", "puzzle lovers", "group fun"],
      moodScore: 72,
      uniqueFeatures: "Escape rooms themed around Bulacan revolutionary history and local legends"
    }
  },
  {
    name: "Pop-Up Night Bazaar",
    category: "something-new",
    description: "Monthly pop-up market with local artisans and food vendors. Vibrant community gathering spot.",
    location: { address: "Philippine Arena Plaza", city: "Bulacan", lat: 14.8002, lng: 120.9340 },
    contact: { website: "https://www.instagram.com/popupbazaarbulacan" },
    businessInfo: {
      hours: "6:00 PM - 11:00 PM (Monthly)",
      priceRange: "₱₱",
      features: ["Pop-Up", "Night Market", "Artisan", "Monthly Event"]
    },
    images: {
      hero: "https://example.com/popup-bazaar-hero.jpg",
      gallery: ["https://example.com/popup-bazaar-1.jpg", "https://example.com/popup-bazaar-2.jpg", "https://example.com/popup-bazaar-3.jpg"]
    },
    discovery: {
      tags: ["pop-up", "night market", "artisan", "events"],
      perfectFor: ["unique shopping", "artisan goods", "night markets"],
      moodScore: 68,
      uniqueFeatures: "Monthly curated pop-up featuring Bulacan artisans, makers, and food vendors"
    }
  }
];

// Export all Bulacan places combined
export const allBulacanPlaces: PlaceInput[] = [
  ...bulacanFoodPlaces,
  ...bulacanActivityPlaces,
  ...bulacanSomethingNewPlaces
];

export const BULACAN_PLACE_COUNTS = {
  food: bulacanFoodPlaces.length,
  activity: bulacanActivityPlaces.length,
  'something-new': bulacanSomethingNewPlaces.length,
  total: allBulacanPlaces.length
};

