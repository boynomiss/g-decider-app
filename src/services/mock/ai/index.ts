// Mock AI Services
// Replace real AI calls with mock data for UI development

// Lorem Ipsum text generator limited to 35 words
const generateLoremIpsum = (maxWords: number = 35): string => {
  const loremWords = [
    'Lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'Ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
    'commodo', 'consequat', 'Duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
    'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
    'pariatur', 'Excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
    'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est',
    'laborum', 'Sed', 'ut', 'perspiciatis', 'unde', 'omnis', 'iste', 'natus',
    'error', 'sit', 'voluptatem', 'accusantium', 'doloremque', 'laudantium',
    'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo', 'inventore',
    'veritatis', 'et', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta', 'sunt',
    'explicabo', 'Nemo', 'enim', 'ipsam', 'voluptatem', 'quia', 'voluptas', 'sit',
    'aspernatur', 'aut', 'odit', 'aut', 'fugit', 'sed', 'quia', 'consequuntur',
    'magni', 'dolores', 'eos', 'qui', 'ratione', 'voluptatem', 'sequi', 'nesciunt'
  ];
  
  const shuffled = loremWords.sort(() => 0.5 - Math.random());
  const selectedWords = shuffled.slice(0, maxWords);
  return selectedWords.join(' ') + '.';
};

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
    description: generateLoremIpsum(35),
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
    enhancedDescription: generateLoremIpsum(35),
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
      description: generateLoremIpsum(35),
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
