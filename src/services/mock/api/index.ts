// Mock API Services
// Replace real network calls with mock data for UI development

export const mockGooglePlacesClient = {
  searchNearby: async (params: any) => ({
    results: [
      {
        place_id: 'mock_place_1',
        name: 'Mock Restaurant',
        rating: 4.5,
        user_ratings_total: 150,
        vicinity: '123 Mock Street',
        types: ['restaurant', 'food'],
        geometry: {
          location: { lat: 37.7749, lng: -122.4194 }
        }
      },
      {
        place_id: 'mock_place_2',
        name: 'Mock Cafe',
        rating: 4.2,
        user_ratings_total: 89,
        vicinity: '456 Mock Avenue',
        types: ['cafe', 'food'],
        geometry: {
          location: { lat: 37.7849, lng: -122.4094 }
        }
      }
    ]
  }),
  
  getPlaceDetails: async (placeId: string) => ({
    place_id: placeId,
    name: 'Mock Place Details',
    formatted_address: '123 Mock Street, Mock City, MC 12345',
    formatted_phone_number: '+1 (555) 123-4567',
    website: 'https://mockplace.com',
    rating: 4.5,
    user_ratings_total: 150,
    opening_hours: {
      open_now: true,
      weekday_text: [
        'Monday: 9:00 AM – 10:00 PM',
        'Tuesday: 9:00 AM – 10:00 PM',
        'Wednesday: 9:00 AM – 10:00 PM',
        'Thursday: 9:00 AM – 10:00 PM',
        'Friday: 9:00 AM – 11:00 PM',
        'Saturday: 10:00 AM – 11:00 PM',
        'Sunday: 10:00 AM – 9:00 PM'
      ]
    },
    photos: [
      { photo_reference: 'mock_photo_ref_1', height: 400, width: 600 },
      { photo_reference: 'mock_photo_ref_2', height: 400, width: 600 }
    ]
  })
};

export const mockScrapingService = {
  scrapePlaceDetails: async (url: string) => ({
    title: 'Mock Scraped Title',
    description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
    images: ['https://via.placeholder.com/400x300'],
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@mockplace.com',
      address: '123 Mock Street, Mock City'
    }
  })
};

export const mockBookingIntegration = {
  checkAvailability: async (placeId: string, date: string) => ({
    available: true,
    slots: ['10:00 AM', '2:00 PM', '6:00 PM'],
    price: '$25'
  }),
  
  makeReservation: async (bookingData: any) => ({
    success: true,
    bookingId: 'mock_booking_123',
    confirmation: 'Your reservation has been confirmed!'
  })
};

export const mockFirebaseClient = {
  auth: () => ({
    currentUser: { uid: 'mock_user_123', email: 'test@example.com' },
    signInWithEmailAndPassword: async (email: string, password: string) => ({
      user: { uid: 'mock_user_123', email }
    }),
    signOut: async () => ({})
  }),
  
  firestore: () => ({
    collection: (path: string) => ({
      doc: (id: string) => ({
        get: async () => ({ exists: true, data: () => ({ name: 'Mock Document' }) }),
        set: async (data: any) => ({ id: 'mock_doc_id' }),
        update: async (data: any) => ({})
      }),
      add: async (data: any) => ({ id: 'mock_doc_id' }),
      where: (field: string, op: string, value: any) => ({
        get: async () => ({ docs: [] })
      })
    })
  })
};
