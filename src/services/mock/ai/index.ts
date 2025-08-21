// Mock AI Services
// Replace real AI calls with mock data for UI development

export const mockAIProjectAgent = {
  createProject: async (requirements: any) => ({
    projectId: 'mock_project_123',
    name: 'Mock AI Project',
    status: 'active',
    createdAt: new Date().toISOString()
  }),
  
  updateProject: async (projectId: string, updates: any) => ({
    success: true,
    projectId,
    updatedAt: new Date().toISOString()
  }),
  
  getProjectStatus: async (projectId: string) => ({
    status: 'completed',
    progress: 100,
    result: 'Mock project completed successfully'
  })
};

export const mockDescriptionGenerator = {
  generatePlaceDescription: async (placeData: any) => ({
    description: 'This is a mock AI-generated description for the place. It includes details about the atmosphere, cuisine, and overall experience.',
    highlights: [
      'Cozy and intimate atmosphere',
      'Expertly crafted dishes',
      'Attentive and friendly service',
      'Perfect for special occasions'
    ],
    mood: 'romantic',
    style: 'elegant'
  }),
  
  enhanceDescription: async (existingDescription: string, enhancements: any) => ({
    enhancedDescription: `${existingDescription} Enhanced with mock AI improvements including better flow and more engaging language.`,
    improvements: ['Better flow', 'More engaging', 'Enhanced details']
  })
};

export const mockImageSourcing = {
  findRelevantImages: async (query: string) => ({
    images: [
      'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Mock+Image+1',
      'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Mock+Image+2',
      'https://via.placeholder.com/400x300/45B7D1/FFFFFF?text=Mock+Image+3'
    ],
    totalFound: 3
  }),
  
  generateImageVariations: async (baseImage: string, variations: any) => ({
    variations: [
      'https://via.placeholder.com/400x300/FF6B6B/FFFFFF?text=Variation+1',
      'https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Variation+2'
    ]
  })
};

export const mockPhotoUrlGenerator = {
  generatePhotoUrl: async (photoReference: string, maxWidth?: number, maxHeight?: number) => {
    const width = maxWidth || 400;
    const height = maxHeight || 300;
    return `https://via.placeholder.com/${width}x${height}/FF6B6B/FFFFFF?text=Mock+Photo+${photoReference}`;
  },
  
  generateMultiplePhotoUrls: async (photoReferences: string[]) => {
    return photoReferences.map((ref, index) => 
      `https://via.placeholder.com/400x300/4ECDC4/FFFFFF?text=Photo+${index + 1}`
    );
  }
};

export const mockResultsServices = {
  aiDescriptionService: {
    generateEnhancedDescription: async (placeData: any) => ({
      description: 'Enhanced mock description with AI-generated insights and recommendations.',
      tags: ['romantic', 'fine-dining', 'local-favorite'],
      aiScore: 0.92
    })
  },
  
  contactService: {
    formatContactInfo: async (rawContact: any) => ({
      formatted: {
        phone: '+1 (555) 123-4567',
        email: 'info@mockplace.com',
        address: '123 Mock Street, Mock City, MC 12345',
        website: 'https://mockplace.com'
      },
      verified: true
    })
  }
};
