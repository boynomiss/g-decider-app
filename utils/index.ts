/**
 * Organized Utils Index
 * 
 * Clean, categorized exports from the reorganized utils structure.
 * Import what you need from specific categories or use convenience exports.
 */

// 🔍 FILTERING - Place discovery and filtering services
export * from './filtering';

// 💾 DATA - Caching and data management  
export * from './data';

// 🌐 API - External API integrations
export * from './api';

// 🎨 CONTENT - Content generation and enhancement
export * from './content';

// 💰 MONETIZATION - Revenue and business logic
export * from './monetization';

// 📱 MOBILE - Mobile-specific utilities
export * from './mobile';

// 🛠️ CORE - Core utilities and helpers
export * from './core';

/**
 * Quick Start Imports:
 * 
 * // Most common - unified filtering system
 * import { unifiedFilterService } from '@/utils/filtering';
 * 
 * // Or use the main export
 * import { unifiedFilterService } from '@/utils';
 * 
 * // Category-specific imports  
 * import { LocationService } from '@/utils/mobile';
 * import { AdMonetizationService } from '@/utils/monetization';
 * import { GooglePlacesClient } from '@/utils/api';
 */