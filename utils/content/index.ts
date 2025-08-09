/**
 * Content Generation Index
 * 
 * AI descriptions, image sourcing, and content enhancement services.
 */

// 📝 DESCRIPTIONS
export * from './description-generator';

// 📸 IMAGES
export * from './photo-url-generator';
export * from './image-sourcing';

// 🤖 AI SERVICES
export * from './ai-project-agent';

// 📞 CONTACT INFORMATION  
export * from './results/contact-formatter';
export * from './results/contact-service';
export * from './results/ai-description-service';

/**
 * Quick Start:
 * 
 * // AI descriptions
 * import { generateComprehensiveDescription } from '@/utils/content';
 * 
 * // Image generation
 * import { generatePhotoUrls, getComprehensiveImages } from '@/utils/content';
 * 
 * // AI project management
 * import { aiProjectAgent } from '@/utils/content';
 * 
 * // Contact formatting
 * import { extractContactDetails, ContactService } from '@/utils/content';
 */