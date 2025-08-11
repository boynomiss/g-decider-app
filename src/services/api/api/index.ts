/**
 * API Integration Index
 * 
 * External API clients and integrations.
 */

// 🌐 GOOGLE APIS
export * from './google-api-clients';
export * from './google-auth-server.js';

// 🔥 FIREBASE
export * from './firebase-client';

// 🎫 BOOKING INTEGRATIONS
export * from './booking-integration';

// 🕷️ WEB SCRAPING
export * from './scraping-service';

/**
 * Quick Start:
 * 
 * // Google APIs
 * import { GooglePlacesClient, GoogleNaturalLanguageClient } from '@/utils/api';
 * 
 * // Firebase
 * import { initializeFirebaseAdmin } from '@/utils/api';
 * 
 * // Booking services
 * import { bookingIntegrationService } from '@/utils/api';
 */