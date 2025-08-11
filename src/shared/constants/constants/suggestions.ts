import { Suggestion } from '../../../features/discovery/types/place-types';

export const mockSuggestions: Suggestion[] = [
  // Food - Chill
  {
    id: '1',
    name: 'Café Adriatico',
    location: 'Remedios Circle, Malate, Manila',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?w=400&h=300&fit=crop'
    ],
    budget: 'PPP',
    tags: ['Good for couples', 'Open: 9am - 9pm', 'Chill Vibe'],
    description: 'A legendary Manila institution serving Filipino comfort food since 1980 in a nostalgic bohemian setting.',
    openHours: '9am - 9pm',
    discount: '20% off for couples',
    category: 'food',
    mood: 'chill',
    socialContext: ['with-bae', 'solo'],
    timeOfDay: ['morning', 'afternoon', 'night']
  },
  {
    id: '5',
    name: 'Wildflour Café + Bakery',
    location: 'BGC, Taguig',
    images: [
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Brunch Spot', 'Instagram-worthy', 'Relaxed'],
    description: 'Perfect morning spot with artisanal coffee and hearty breakfast options.',
    openHours: '7am - 3pm',
    discount: '10% off weekend brunch',
    category: 'food',
    mood: 'chill',
    socialContext: ['solo', 'with-bae'],
    timeOfDay: ['morning', 'afternoon']
  },
  {
    id: '6',
    name: 'Kamayan sa Palaisdaan',
    location: 'Tayabas, Quezon',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ],
    budget: 'P',
    tags: ['Authentic Filipino', 'Budget-friendly', 'Local Favorite'],
    description: 'Traditional Filipino comfort food served with love and nostalgia.',
    openHours: '11am - 8pm',
    category: 'food',
    mood: 'chill',
    socialContext: ['solo', 'barkada'],
    timeOfDay: ['afternoon', 'night']
  },
  // Food - Hype
  {
    id: '7',
    name: 'CUE Modern Barbecue',
    location: 'BGC, Taguig',
    images: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'
    ],
    budget: 'PPP',
    tags: ['Live Music', 'City Views', 'Party Vibe'],
    description: 'Sizzling BBQ with live DJ sets and stunning city skyline views.',
    openHours: '6pm - 2am',
    discount: 'Happy hour 6-8pm',
    category: 'food',
    mood: 'hype',
    socialContext: ['barkada', 'with-bae'],
    timeOfDay: ['night']
  },
  {
    id: '8',
    name: 'Romantic Baboy',
    location: 'Ortigas, Pasig',
    images: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Korean BBQ', 'All-you-can-eat', 'Group Dining'],
    description: 'Unlimited Korean BBQ perfect for group celebrations and bonding.',
    openHours: '11am - 11pm',
    discount: 'Birthday celebrant eats free',
    category: 'food',
    mood: 'hype',
    socialContext: ['barkada'],
    timeOfDay: ['afternoon', 'night']
  },
  // Activities - Chill
  {
    id: '4',
    name: 'Yoga by the Bay',
    location: 'Manila Bay, Roxas Boulevard',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    ],
    budget: 'P',
    tags: ['Wellness', 'Open: 5:30am - 7am', 'Peaceful'],
    description: 'Start your day with mindful movement and beautiful sunrise views in the heart of Manila.',
    openHours: '5:30am - 7am',
    discount: 'First session free',
    category: 'activity',
    mood: 'chill',
    socialContext: ['solo', 'with-bae'],
    timeOfDay: ['morning']
  },
  {
    id: '9',
    name: 'Ayala Museum',
    location: 'Makati Avenue, Makati',
    images: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Cultural', 'Educational', 'Inspiring'],
    description: 'Explore contemporary Filipino art in intimate gallery spaces.',
    openHours: '10am - 6pm',
    category: 'activity',
    mood: 'chill',
    socialContext: ['solo', 'with-bae'],
    timeOfDay: ['morning', 'afternoon']
  },
  // Activities - Hype
  {
    id: '2',
    name: 'Breakout Philippines',
    location: 'BGC, Taguig',
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Team Building', 'Open: 10am - 10pm', 'Hype Activity'],
    description: 'Challenge your mind with thrilling escape room experiences perfect for groups.',
    openHours: '10am - 10pm',
    discount: 'Group of 4+ gets 15% off',
    category: 'activity',
    mood: 'hype',
    socialContext: ['barkada', 'with-bae'],
    timeOfDay: ['afternoon', 'night']
  },
  {
    id: '10',
    name: 'Music21 Plaza',
    location: 'Timog Avenue, Quezon City',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop'
    ],
    budget: 'P',
    tags: ['Singing', 'Party Time', 'Filipino Classic'],
    description: 'Belt out your favorite tunes in premium KTV rooms with friends.',
    openHours: '2pm - 2am',
    discount: '2 hours for the price of 1',
    category: 'activity',
    mood: 'hype',
    socialContext: ['barkada'],
    timeOfDay: ['afternoon', 'night']
  },
  // Something New
  {
    id: '3',
    name: 'Mercato Centrale',
    location: 'BGC, Taguig',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop'
    ],
    budget: 'P',
    tags: ['Street Food', 'Open: 6pm - 12am', 'Local Experience'],
    description: 'Discover hidden gems in Manila\'s vibrant night markets with authentic Filipino street food.',
    openHours: '6pm - 12am',
    category: 'something-new',
    mood: 'both',
    socialContext: ['solo', 'with-bae', 'barkada'],
    timeOfDay: ['night']
  },
  {
    id: '11',
    name: 'EDSA Shangri-La Garden',
    location: 'Ortigas, Mandaluyong',
    images: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Learning', 'Sustainable', 'Hands-on'],
    description: 'Learn to grow your own herbs and vegetables in small urban spaces.',
    openHours: '9am - 12pm',
    discount: 'Take home starter kit included',
    category: 'something-new',
    mood: 'chill',
    socialContext: ['solo', 'with-bae'],
    timeOfDay: ['morning']
  },
  {
    id: '12',
    name: 'Greenhills Shopping Center',
    location: 'San Juan City',
    images: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&h=300&fit=crop'
    ],
    budget: 'P',
    tags: ['Shopping', 'Vintage', 'Treasure Hunt'],
    description: 'Hunt for unique vintage pieces and retro finds in bustling thrift markets.',
    openHours: '10am - 7pm',
    category: 'something-new',
    mood: 'both',
    socialContext: ['solo', 'with-bae', 'barkada'],
    timeOfDay: ['morning', 'afternoon']
  },
  // Additional Food Places
  {
    id: '13',
    name: 'Purple Yam Malate',
    location: 'Malate, Manila',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop'
    ],
    budget: 'PPP',
    tags: ['Filipino Cuisine', 'Fine Dining', 'Date Night'],
    description: 'Elevated Filipino cuisine in an intimate setting perfect for special occasions.',
    openHours: '6pm - 11pm',
    discount: 'Wine pairing available',
    category: 'food',
    mood: 'chill',
    socialContext: ['with-bae', 'solo'],
    timeOfDay: ['night']
  },
  {
    id: '14',
    name: 'Manam Comfort Filipino',
    location: 'Greenbelt, Makati',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Modern Filipino', 'Family Friendly', 'Comfort Food'],
    description: 'Modern takes on Filipino comfort food favorites in a vibrant atmosphere.',
    openHours: '11am - 10pm',
    category: 'food',
    mood: 'both',
    socialContext: ['barkada', 'with-bae'],
    timeOfDay: ['afternoon', 'night']
  },
  {
    id: '15',
    name: 'Ramen Nagi',
    location: 'SM Megamall, Ortigas',
    images: [
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Japanese Ramen', 'Quick Bite', 'Authentic'],
    description: 'Authentic Japanese ramen with customizable spice levels and toppings.',
    openHours: '11am - 10pm',
    category: 'food',
    mood: 'both',
    socialContext: ['solo', 'with-bae', 'barkada'],
    timeOfDay: ['afternoon', 'night']
  },
  // Additional Activities
  {
    id: '16',
    name: 'Manila Ocean Park',
    location: 'Behind Quirino Grandstand, Manila',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Marine Life', 'Educational', 'Family Fun'],
    description: 'Explore marine life and interactive exhibits in Southeast Asia\'s first world-class oceanarium.',
    openHours: '10am - 8pm',
    discount: 'Student discounts available',
    category: 'activity',
    mood: 'both',
    socialContext: ['with-bae', 'barkada'],
    timeOfDay: ['morning', 'afternoon']
  },
  {
    id: '17',
    name: 'Sky Ranch Tagaytay',
    location: 'Tagaytay City',
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=400&h=300&fit=crop'
    ],
    budget: 'PP',
    tags: ['Amusement Park', 'Sky Eye', 'Adventure'],
    description: 'Thrilling rides and panoramic views of Taal Lake from the famous Sky Eye ferris wheel.',
    openHours: '10am - 10pm',
    discount: 'Group packages available',
    category: 'activity',
    mood: 'hype',
    socialContext: ['barkada', 'with-bae'],
    timeOfDay: ['afternoon', 'night']
  },
  {
    id: '18',
    name: 'Intramuros Walking Tour',
    location: 'Intramuros, Manila',
    images: [
      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
    ],
    budget: 'P',
    tags: ['Historical', 'Walking Tour', 'Cultural'],
    description: 'Discover Manila\'s rich history through the cobblestone streets of the walled city.',
    openHours: '8am - 5pm',
    discount: 'Free guided tours available',
    category: 'activity',
    mood: 'chill',
    socialContext: ['solo', 'with-bae', 'barkada'],
    timeOfDay: ['morning', 'afternoon']
  }
];