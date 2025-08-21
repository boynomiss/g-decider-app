// Mock Store
// Replace real Redux store with mock data for UI development

import { create } from 'zustand';

interface MockPlace {
  id: string;
  name: string;
  rating: number;
  category: string;
  distance: string;
  price: string;
  mood?: string;
  saved?: boolean;
}

interface MockFilter {
  id: string;
  categories: string[];
  priceRange: string;
  distance: number;
  rating: number;
  mood?: string;
}

interface MockUser {
  id: string;
  email: string;
  preferences: {
    favoriteCategories: string[];
    preferredPriceRange: string;
    maxDistance: number;
  };
  savedPlaces: string[];
}

interface MockStore {
  // Places
  places: MockPlace[];
  filteredPlaces: MockPlace[];
  selectedPlace: MockPlace | null;
  
  // Filters
  activeFilters: MockFilter | null;
  filterHistory: MockFilter[];
  
  // User
  user: MockUser | null;
  
  // UI State
  loading: boolean;
  error: string | null;
  
  // Actions
  setPlaces: (places: MockPlace[]) => void;
  setFilteredPlaces: (places: MockPlace[]) => void;
  selectPlace: (place: MockPlace | null) => void;
  setActiveFilters: (filters: MockFilter | null) => void;
  addToFilterHistory: (filters: MockFilter) => void;
  setUser: (user: MockUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleSavedPlace: (placeId: string) => void;
}

// Mock initial data
const mockPlaces: MockPlace[] = [
  {
    id: 'place_1',
    name: 'Cozy Italian Restaurant',
    rating: 4.7,
    category: 'restaurant',
    distance: '0.3 miles',
    price: '$$$',
    mood: 'romantic'
  },
  {
    id: 'place_2',
    name: 'Modern Coffee Shop',
    rating: 4.3,
    category: 'cafe',
    distance: '0.5 miles',
    price: '$',
    mood: 'casual'
  },
  {
    id: 'place_3',
    name: 'Trendy Bar & Grill',
    rating: 4.1,
    category: 'bar',
    distance: '0.8 miles',
    price: '$$',
    mood: 'energetic'
  },
  {
    id: 'place_4',
    name: 'Artisan Bakery',
    rating: 4.6,
    category: 'bakery',
    distance: '1.2 miles',
    price: '$$',
    mood: 'cozy'
  }
];

const mockUser: MockUser = {
  id: 'user_123',
  email: 'test@example.com',
  preferences: {
    favoriteCategories: ['restaurant', 'cafe'],
    preferredPriceRange: '$$',
    maxDistance: 5
  },
  savedPlaces: ['place_1', 'place_3']
};

export const useMockStore = create<MockStore>((set, get) => ({
  // Initial state
  places: mockPlaces,
  filteredPlaces: mockPlaces,
  selectedPlace: null,
  activeFilters: null,
  filterHistory: [],
  user: mockUser,
  loading: false,
  error: null,
  
  // Actions
  setPlaces: (places) => set({ places }),
  
  setFilteredPlaces: (places) => set({ filteredPlaces: places }),
  
  selectPlace: (place) => set({ selectedPlace: place }),
  
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  
  addToFilterHistory: (filters) => set((state) => ({
    filterHistory: [filters, ...state.filterHistory.slice(0, 9)]
  })),
  
  setUser: (user) => set({ user }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  toggleSavedPlace: (placeId) => set((state) => {
    if (!state.user) return state;
    
    const savedPlaces = state.user.savedPlaces;
    const isSaved = savedPlaces.includes(placeId);
    
    const updatedSavedPlaces = isSaved
      ? savedPlaces.filter(id => id !== placeId)
      : [...savedPlaces, placeId];
    
    return {
      user: {
        ...state.user,
        savedPlaces: updatedSavedPlaces
      }
    };
  })
}));
