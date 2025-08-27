/**
 * Featured Place Types
 * 
 * Defines the data structure for featured places in Firestore
 */

export interface FeaturedPlace {
  // Basic Information
  id: string;
  name: string;
  category: string;
  cuisine?: string;
  description: string;
  
  // Location
  location: {
    address: string;
    barangay?: string;
    city: string;
    region: string;
    lat: number;
    lng: number;
    formatted_address?: string;
    vicinity?: string;
  };
  
  // Contact Information
  contact: {
    phone?: string;
    website?: string;
    facebook?: string;
    instagram?: string;
    email?: string;
  };
  
  // Business Information
  business_info: {
    hours: {
      monday?: string;
      tuesday?: string;
      wednesday?: string;
      thursday?: string;
      friday?: string;
      saturday?: string;
      sunday?: string;
    };
    price_range: string; // "₱", "₱₱", "₱₱₱", "₱₱₱₱"
    payment_methods: string[];
    features: string[];
    open_now?: boolean;
    business_status?: string;
  };
  
  // Images
  images: {
    hero: string;
    gallery: string[];
    thumbnails?: {
      hero: string;
      gallery: string[];
    };
  };
  
  // Discovery & Discovery
  discovery: {
    tags: string[];
    perfect_for: string[];
    best_time?: string;
    unique_features?: string;
    discovery_hook?: string;
    mood_score?: number;
    mood_category?: string;
  };
  
  // Partnership Information
  partnership: {
    tier: 'basic' | 'premium' | 'enterprise';
    monthly_fee: number;
    start_date: string;
    end_date: string;
    active: boolean;
    contact_person?: string;
  };
  
  // Analytics
  analytics: {
    impressions: number;
    swipe_right: number;
    swipe_left: number;
    profile_views: number;
    last_shown?: string | null;
  };
  
  // Metadata
  metadata: {
    created_at: string;
    updated_at: string;
    created_by: string;
    status: 'active' | 'inactive' | 'pending' | 'archived';
    version: number;
  };
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
  icon: string;
  active: boolean;
  description?: string;
  sort_order: number;
}

export interface AnalyticsData {
  id: string;
  date: string;
  total_impressions: number;
  total_swipes: number;
  featured_impressions: number;
  partner_performance: Record<string, {
    impressions: number;
    swipe_right: number;
    swipe_left: number;
    profile_views: number;
  }>;
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  created_at: string;
  last_login?: string;
  active: boolean;
}

// Request/Response Types
export interface CreateFeaturedPlaceRequest {
  name: string;
  category: string;
  cuisine?: string;
  description: string;
  location: FeaturedPlace['location'];
  contact: FeaturedPlace['contact'];
  business_info: FeaturedPlace['business_info'];
  images: FeaturedPlace['images'];
  discovery: FeaturedPlace['discovery'];
  partnership: FeaturedPlace['partnership'];
}

export interface UpdateFeaturedPlaceRequest extends Partial<CreateFeaturedPlaceRequest> {
  id: string;
}

export interface FeaturedPlaceQuery {
  category?: string;
  status?: string;
  partnership_tier?: string;
  tags?: string[];
  city?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'name' | 'impressions';
  sort_order?: 'asc' | 'desc';
}

// Image Upload Types
export interface ImageUploadRequest {
  placeId: string;
  imageType: 'hero' | 'gallery';
  imageFile: File;
  imageName?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  url: string;
  path: string;
  error?: string;
}

// Analytics Types
export interface AnalyticsQuery {
  start_date: string;
  end_date: string;
  place_id?: string;
  category?: string;
}

export interface PlaceAnalytics {
  place_id: string;
  place_name: string;
  impressions: number;
  swipe_right: number;
  swipe_left: number;
  profile_views: number;
  conversion_rate: number;
  performance_score: number;
}
