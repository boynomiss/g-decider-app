# G-Decider MVP

A simplified version of the G-Decider app focusing on core functionality: **Looking For categories** and **Mood-based filtering**.

## 🎯 Core Features

### 1. Category Selection
Users can select what they're looking for from 6 main categories:
- 🍽️ Food & Dining
- 🎭 Entertainment  
- 🏃‍♂️ Outdoor Activities
- 🛍️ Shopping
- 🎨 Culture & Arts
- 🧘‍♀️ Wellness & Relaxation

### 2. Mood Slider
Simple 1-100 mood scale with 4 mood zones:
- 😌 Chill & Relaxed (1-25)
- 😊 Casual & Social (26-50)
- 🤩 Energetic & Fun (51-75)
- 🚀 Adventurous & Bold (76-100)

### 3. Place Discovery
- Filter places based on selected categories and mood
- Clean, simple place cards with essential information
- Mock data included for testing

## 🏗️ Architecture

### Simplified Data Models
- **LookingForCategory**: Core activity categories
- **MoodConfig**: Mood zones and descriptions
- **Place**: Simplified place structure
- **UserPreferences**: User selections and mood

### Components
- `CategorySelector`: Horizontal scrolling category picker
- `MoodSlider`: Interactive mood selection
- `FindPlacesButton`: Search trigger
- `PlaceCard`: Clean place display

### Screens
- `mvp-home.tsx`: Main interface with category and mood selection
- `mvp-results.tsx`: Filtered results display
- `mvp-admin.tsx`: Editorial team interface for adding places

### State Management
- `mvp-store.ts`: Zustand store for user preferences and results
- Simple, focused state without complex filtering logic

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Firebase Setup
Ensure your Firebase configuration is set up in `src/config/firebase-config.ts`

### 3. Run the App
```bash
npm start
# or
yarn start
```

### 4. Navigate to MVP Screens
- `/mvp-home` - Main interface
- `/mvp-results` - Results display  
- `/mvp-admin` - Admin panel

## 📱 User Flow

1. **Home Screen**: User selects categories and sets mood
2. **Find Places**: Button becomes active when categories are selected
3. **Results**: Places filtered by preferences and mood
4. **Place Details**: Tap on place cards (placeholder for now)

## 🛠️ Admin Interface

The editorial team can:
- Add new places with comprehensive forms
- Set category, location, contact info
- Configure mood scores and discovery tags
- Manage place status (active/inactive)

## 🔄 Data Flow

1. User selects preferences → Store updates
2. Find Places button → Navigate to results
3. Results screen → Filter mock data (replace with Firebase)
4. Admin form → Save to Firebase (implemented)

## 📊 Database Structure

### Collections
- `places`: Place information and metadata
- `categories`: Activity categories
- `users`: User preferences and data

### Place Document Structure
```typescript
{
  id: string,
  name: string,
  category: string,
  description: string,
  location: { address, city, lat, lng },
  contact: { phone?, website? },
  businessInfo: { hours?, priceRange, features },
  images: { hero, gallery },
  discovery: { tags, perfectFor, moodScore, uniqueFeatures? },
  metadata: { createdAt, updatedAt, createdBy, status }
}
```

## 🎨 Design Principles

- **Clean & Simple**: Focus on essential functionality
- **Purple Theme**: Consistent with brand colors (#C8A8E9, #B19CD9)
- **Card-based**: Easy-to-scan place information
- **Responsive**: Works on various screen sizes

## 🔮 Next Steps

### Phase 2 Features
- Real Firebase integration
- Place details screen
- User authentication
- Location-based filtering
- Image upload for places

### Phase 3 Features
- Advanced filtering
- User reviews
- Booking integration
- Analytics dashboard

## 🐛 Known Issues

- Mock data only (Firebase integration pending)
- Place details navigation not implemented
- Image handling is basic
- No error boundaries yet

## 📝 Development Notes

- All complex filtering logic removed
- Focus on core user experience
- Easy to extend and modify
- Clean separation of concerns

## 🤝 Contributing

1. Keep it simple - this is an MVP
2. Focus on core functionality
3. Maintain clean, readable code
4. Test user flows thoroughly

---

**Remember**: This MVP is designed to be simple, functional, and easy to understand. Complexity can be added later as the app grows.
