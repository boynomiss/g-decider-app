/**
 * Content Generation Index
 * 
 * AI descriptions, image sourcing, and content enhancement services.
 */

// 🤖 AI DESCRIPTION SERVICE (Recommended)
export * from './results/ai-description-service';

// 📝 LEGACY DESCRIPTIONS (Deprecated - use AI Description Service instead)
export * from './description-generator';

// 📸 IMAGES
export * from './photo-url-generator';
export * from './image-sourcing';

// 🤖 AI SERVICES
export * from './ai-project-agent';

// 📞 CONTACT INFORMATION  
export * from './results/contact-formatter';
export * from './results/contact-service';

/**
 * Quick Start:
 * 
 * // 🚀 RECOMMENDED: Enhanced AI descriptions
 * import { aiDescriptionService } from '@/services/ai/content';
 * const description = await aiDescriptionService.generateDescription(restaurantData);
 * 
 * // 📊 Quality testing and A/B testing
 * const variants = await aiDescriptionService.generateDescriptionVariantsForTesting(restaurantData, 3);
 * const quality = aiDescriptionService.testDescriptionQuality(description);
 * 
 * // 🔄 Legacy API (deprecated but still supported)
 * import { generateComprehensiveDescription } from '@/services/ai/content';
 * const description = await generateComprehensiveDescription(name, category, reviews);
 * 
 * // 📸 Image generation
 * import { generatePhotoUrls, getComprehensiveImages } from '@/services/ai/content';
 * 
 * // 🤖 AI project management
 * import { aiProjectAgent } from '@/services/ai/content';
 * 
 * // 📞 Contact formatting
 * import { extractContactDetails, ContactService } from '@/services/ai/content';
 */