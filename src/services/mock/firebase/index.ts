// Mock Firebase Services
// Replace real Firebase calls with mock data for UI development

export const mockFirebaseFunctions = {
  filterPlaces: async (filters: any) => ({
    success: true,
    places: [
      {
        id: 'mock_filtered_1',
        name: 'Filtered Restaurant',
        rating: 4.7,
        category: 'restaurant',
        distance: '0.5 miles',
        price: '$$'
      },
      {
        id: 'mock_filtered_2',
        name: 'Filtered Cafe',
        rating: 4.3,
        category: 'cafe',
        distance: '0.8 miles',
        price: '$'
      }
    ]
  }),
  
  geminiFunctions: {
    generateDescription: async (placeData: any) => ({
      description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.',
      highlights: ['Great atmosphere', 'Friendly staff', 'Delicious food'],
      mood: 'cozy'
    }),
    
    analyzeMood: async (placeData: any) => ({
      mood: 'relaxed',
      confidence: 0.85,
      factors: ['ambiance', 'lighting', 'music']
    })
  },
  
  nlpFunctions: {
    processQuery: async (query: string) => ({
      intent: 'search',
      entities: ['restaurant', 'dinner'],
      confidence: 0.9
    }),
    
    extractFilters: async (text: string) => ({
      categories: ['restaurant'],
      priceRange: '$$',
      distance: '5 miles',
      mood: 'romantic'
    })
  }
};

export const mockFirebaseAdmin = {
  auth: () => ({
    verifyIdToken: async (token: string) => ({
      uid: 'mock_admin_user_123',
      email: 'admin@example.com'
    })
  }),
  
  firestore: () => ({
    collection: (path: string) => ({
      doc: (id: string) => ({
        get: async () => ({ exists: true, data: () => ({ name: 'Mock Admin Document' }) }),
        set: async (data: any) => ({ id: 'mock_admin_doc_id' }),
        update: async (data: any) => ({})
      })
    })
  })
};
