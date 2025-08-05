# 📋 Backend API Response Documentation

## 🎯 **Enhanced Place Data Structure**

The backend now returns comprehensive, frontend-ready place data with properly formatted images and contact details extracted from the Google Places API.

## 📊 **Complete Response Structure**

### **Main Place Object**

```typescript
interface PlaceData {
  // Core identification
  place_id: string;
  name: string;
  address: string;
  category: string;
  
  // Ratings and reviews
  user_ratings_total: number;
  rating: number;
  reviews: Review[];
  
  // AI-powered mood analysis
  mood_score?: number;        // 0-100 scale from NLP sentiment analysis
  final_mood?: string;        // 'chill' | 'neutral' | 'hype'
  
  // 📸 ENHANCED PHOTO URLS - Ready for <img> tags
  photos?: {
    thumbnail: string[];      // 150x150px - Perfect for lists/cards
    medium: string[];         // 400x300px - Perfect for modals/details
    large: string[];          // 800x600px - Perfect for full screen
    count: number;            // Total number of photos available
  };
  
  // 📞 ENHANCED CONTACT INFORMATION - Formatted and validated
  contact?: {
    website?: string;         // Formatted URL with https://
    phone?: string;           // Raw phone number
    formattedPhone?: string;  // Display-friendly format
    internationalPhone?: string; // International format
    email?: string;           // Email if available
    hasContact: boolean;      // Quick check if any contact info exists
  };
  
  // 🔗 CONTACT ACTIONS - Ready for frontend interaction
  contactActions?: {
    canCall: boolean;         // True if phone number is valid
    canVisitWebsite: boolean; // True if website URL is valid
    callUrl?: string;         // tel: URL for mobile calling
    websiteUrl?: string;      // Direct website URL
  };
  
  // Additional place details
  price_level?: number;       // 0-4 Google price level
  opening_hours?: any;        // Google opening hours object
  business_status?: string;   // 'OPERATIONAL' | 'CLOSED_TEMPORARILY' etc.
  editorial_summary?: string; // Google's editorial description
  types?: string[];           // Google place types
  location?: { lat: number; lng: number };
  
  // Legacy support (maintained for backward compatibility)
  images?: {
    urls: string[];
    metadata?: {
      totalImages: number;
      authenticImages: number;
      averageConfidence: number;
      sources: string[];
    };
  };
  website?: string;           // Legacy website field
  phone?: string;             // Legacy phone field
}
```

### **Review Object**

```typescript
interface Review {
  text: string;               // Review content
  rating: number;             // 1-5 star rating
  time: number;               // Unix timestamp
}
```

## 🖼️ **Photo URL Usage Examples**

### **Frontend Implementation**

```jsx
// React component example
function PlaceCard({ place }) {
  return (
    <div className="place-card">
      {/* Thumbnail for list view */}
      <img 
        src={place.photos?.thumbnail[0]} 
        alt={place.name}
        className="place-thumbnail"
        width="150" 
        height="150"
      />
      
      {/* Medium for modal view */}
      <img 
        src={place.photos?.medium[0]} 
        alt={place.name}
        className="place-medium"
        width="400" 
        height="300"
      />
      
      {/* Large for full screen */}
      <img 
        src={place.photos?.large[0]} 
        alt={place.name}
        className="place-large"
        width="800" 
        height="600"
      />
    </div>
  );
}
```

### **HTML Implementation**

```html
<!-- Direct HTML usage -->
<div class="place-gallery">
  <img src="https://places.googleapis.com/v1/places/[place-id]/photos/[photo-ref]/media?maxWidthPx=150&maxHeightPx=150&key=[api-key]" 
       alt="Restaurant thumbnail" 
       width="150" 
       height="150">
  
  <img src="https://places.googleapis.com/v1/places/[place-id]/photos/[photo-ref]/media?maxWidthPx=400&maxHeightPx=300&key=[api-key]" 
       alt="Restaurant medium" 
       width="400" 
       height="300">
  
  <img src="https://places.googleapis.com/v1/places/[place-id]/photos/[photo-ref]/media?maxWidthPx=800&maxHeightPx=600&key=[api-key]" 
       alt="Restaurant large" 
       width="800" 
       height="600">
</div>
```

## 📞 **Contact Information Usage Examples**

### **Frontend Implementation**

```jsx
// React component example
function ContactSection({ place }) {
  const { contact, contactActions } = place;
  
  if (!contact?.hasContact) {
    return <div>No contact information available</div>;
  }
  
  return (
    <div className="contact-section">
      {/* Phone call button */}
      {contactActions?.canCall && (
        <a href={contactActions.callUrl} className="call-button">
          📞 Call {contact.formattedPhone}
        </a>
      )}
      
      {/* Website button */}
      {contactActions?.canVisitWebsite && (
        <a href={contactActions.websiteUrl} target="_blank" className="website-button">
          🌐 Visit Website
        </a>
      )}
    </div>
  );
}
```

### **JavaScript Implementation**

```javascript
// Pure JavaScript usage
function renderContactInfo(place) {
  const { contact, contactActions } = place;
  
  if (!contact?.hasContact) return '';
  
  let html = '<div class="contact-info">';
  
  // Add call button if phone is available
  if (contactActions?.canCall) {
    html += `<a href="${contactActions.callUrl}" class="btn-call">
               📞 ${contact.formattedPhone}
             </a>`;
  }
  
  // Add website button if website is available
  if (contactActions?.canVisitWebsite) {
    html += `<a href="${contactActions.websiteUrl}" target="_blank" class="btn-website">
               🌐 Visit Website
             </a>`;
  }
  
  html += '</div>';
  return html;
}
```

## 🎨 **Complete Frontend Example**

```jsx
function PlaceDetails({ place }) {
  return (
    <div className="place-details">
      {/* Header with main info */}
      <div className="place-header">
        <h1>{place.name}</h1>
        <p>{place.address}</p>
        <div className="rating">
          ⭐ {place.rating} ({place.user_ratings_total} reviews)
        </div>
        <div className="mood-score">
          Mood: {place.final_mood} ({place.mood_score}/100)
        </div>
      </div>
      
      {/* Photo gallery */}
      <div className="photo-gallery">
        {place.photos?.medium.map((photoUrl, index) => (
          <img 
            key={index}
            src={photoUrl} 
            alt={`${place.name} photo ${index + 1}`}
            className="gallery-photo"
          />
        ))}
      </div>
      
      {/* Contact information */}
      <div className="contact-section">
        <h3>Contact Information</h3>
        {place.contact?.hasContact ? (
          <div className="contact-actions">
            {place.contactActions?.canCall && (
              <a href={place.contactActions.callUrl} className="btn btn-call">
                📞 Call {place.contact.formattedPhone}
              </a>
            )}
            {place.contactActions?.canVisitWebsite && (
              <a href={place.contactActions.websiteUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="btn btn-website">
                🌐 Visit Website
              </a>
            )}
          </div>
        ) : (
          <p>No contact information available</p>
        )}
      </div>
      
      {/* Reviews section */}
      <div className="reviews-section">
        <h3>Recent Reviews</h3>
        {place.reviews.slice(0, 3).map((review, index) => (
          <div key={index} className="review">
            <div className="review-rating">⭐ {review.rating}</div>
            <p className="review-text">{review.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔧 **Technical Implementation Details**

### **Photo URL Generation**

The backend uses the `createFrontendPhotoUrls()` utility function that:

1. **Extracts photo references** from Google Places API response
2. **Generates multiple sizes** for different use cases
3. **Provides fallback images** when no photos are available
4. **Validates photo quality** and sorts by quality score
5. **Returns ready-to-use URLs** with proper API keys

### **Contact Information Processing**

The backend uses the `createFrontendContactObject()` utility function that:

1. **Extracts contact details** from Google Places API response
2. **Formats phone numbers** for display (e.g., +63 123 456 7890)
3. **Validates URLs** and ensures proper https:// protocol
4. **Creates action URLs** (tel: for calling, direct URLs for websites)
5. **Provides validation flags** (canCall, canVisitWebsite)

### **Response Structure Benefits**

- ✅ **Ready for Frontend**: No additional processing needed
- ✅ **Multiple Image Sizes**: Optimized for different UI components
- ✅ **Validated Contact Info**: All URLs and phone numbers are validated
- ✅ **Action-Ready**: Direct tel: and https: URLs for immediate use
- ✅ **Fallback Support**: Graceful handling when data is missing
- ✅ **Backward Compatible**: Legacy fields maintained for existing code

## 📱 **Mobile-Specific Features**

### **Calling Support**

```jsx
// Mobile calling
<a href={place.contactActions?.callUrl}>
  Call {place.contact?.formattedPhone}
</a>
// Generates: <a href="tel:+639123456789">Call +63 912 345 6789</a>
```

### **Responsive Images**

```jsx
// Responsive image selection
const getImageSize = (screenWidth) => {
  if (screenWidth < 768) return place.photos?.thumbnail[0];
  if (screenWidth < 1200) return place.photos?.medium[0];
  return place.photos?.large[0];
};
```

## 🎯 **Best Practices for Frontend Usage**

### **1. Always Check for Data Availability**

```javascript
// Good: Check if data exists before using
if (place.photos?.count > 0) {
  renderPhotos(place.photos.medium);
}

if (place.contact?.hasContact) {
  renderContactInfo(place.contact);
}
```

### **2. Use Appropriate Image Sizes**

```javascript
// Good: Use right size for context
const thumbnailForList = place.photos?.thumbnail[0];
const mediumForModal = place.photos?.medium[0];
const largeForFullscreen = place.photos?.large[0];
```

### **3. Handle Loading States**

```javascript
// Good: Provide loading states
const [imageLoading, setImageLoading] = useState(true);

<img 
  src={place.photos?.medium[0]} 
  onLoad={() => setImageLoading(false)}
  onError={() => setImageLoading(false)}
  style={{ display: imageLoading ? 'none' : 'block' }}
/>
```

### **4. Implement Error Handling**

```javascript
// Good: Handle missing data gracefully
const renderContactActions = (place) => {
  if (!place.contactActions) return null;
  
  return (
    <div>
      {place.contactActions.canCall && (
        <button onClick={() => window.location.href = place.contactActions.callUrl}>
          Call
        </button>
      )}
      {place.contactActions.canVisitWebsite && (
        <button onClick={() => window.open(place.contactActions.websiteUrl, '_blank')}>
          Website
        </button>
      )}
    </div>
  );
};
```

---

## 🎉 **Ready for Production!**

The backend now provides **complete, frontend-ready place data** with:

- ✅ **Multiple photo sizes** optimized for different UI components
- ✅ **Validated contact information** with direct action URLs
- ✅ **AI-powered mood analysis** for personalized recommendations
- ✅ **Comprehensive place details** from Google Places API
- ✅ **Backward compatibility** with existing frontend code
- ✅ **Mobile-optimized** contact actions (tel: URLs)
- ✅ **Error handling** with fallback data

**Your frontend can now consume this data directly without any additional processing!** 🚀