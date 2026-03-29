# 🎯 g-decider-app

> **Smart Decision-Making for Food, Activities & New Experiences**

A modern React Native discovery app that helps users decide where to eat, what to do, and find something new through an intelligent 6-step filtering system. Built with React Native and Expo for seamless cross-platform experience.

**Created by [boynomiss](https://github.com/boynomiss)**

---

## ✨ Features

### 🎯 Smart 6-Step Filtering System
The app guides users through a personalized decision-making process:

1. **🍽️ Category Selection** - Choose between Food, Activity, or Something New
2. **😌 Mood Filter** - Select your vibe: Chill, Neutral, or Hype
3. **👥 Social Context** - Specify your company: Solo, With Bae, or Barkada (group)
4. **💰 Budget Range** - Set your spending limits
5. **⏰ Time of Day** - Morning, afternoon, evening preferences
6. **📍 Distance Range** - How far you're willing to travel

### 🔍 Core Functionality
- **AI-Powered Recommendations** - Smart filtering based on user preferences
- **Place Discovery** - Find hidden gems and popular spots
- **Mood-Based Matching** - Get suggestions that match your current vibe
- **Social Context Awareness** - Recommendations tailored to your group size
- **Real-Time Filtering** - Instant results as you adjust preferences
- **Saved Places** - Keep track of your favorite discoveries

---

## 🛠️ Technology Stack

- **Frontend**: React Native with Expo
- **State Management**: Custom hooks and context
- **AI Integration**: Gemini AI for enhanced descriptions
- **Backend Services**: Firebase Functions
- **APIs**: Google Places API, Google Maps
- **Language**: TypeScript
- **Build Tool**: Expo CLI

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/boynomiss/g-decider-app.git
   cd g-decider-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Add your API keys and configuration
   GOOGLE_PLACES_API_KEY=your_api_key_here
   FIREBASE_CONFIG=your_firebase_config
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

5. **Run on device/simulator**
   - Scan the QR code with Expo Go app (mobile)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

---

## 📱 Usage

### How the Filtering Process Works

1. **Launch the app** and select your discovery category
2. **Set your mood** - this influences the type of recommendations you'll receive
3. **Choose your social context** - solo adventure, romantic date, or group outing
4. **Define your budget** - set spending limits for your outing
5. **Pick your preferred time** - morning coffee, afternoon lunch, or evening entertainment
6. **Set distance range** - local spots or willing to travel further
7. **Get personalized recommendations** based on your unique combination of preferences

The app uses advanced algorithms to match your criteria with the best available options, considering factors like:
- Current location and accessibility
- User ratings and reviews
- Seasonal availability
- Popularity and trending status
- Special offers and discounts

---

## 🏗️ Project Structure

```
g-decider-app/
├── src/
│   ├── app/                 # Main app screens and navigation
│   ├── components/          # Reusable UI components
│   ├── features/            # Feature-based modules
│   │   ├── auth/           # Authentication system
│   │   ├── discovery/      # Core discovery functionality
│   │   ├── filtering/      # Smart filtering system
│   │   ├── booking/        # Booking integration
│   │   └── saved-places/   # User's saved locations
│   ├── services/            # External API integrations
│   ├── shared/              # Common utilities and types
│   └── store/               # State management
├── functions/               # Firebase Cloud Functions
├── backend/                 # Backend services and API
└── assets/                  # Images and static resources
```

### Key Components
- **EnhancedPlaceCard**: Main display component for place recommendations
- **FilterControlPanel**: Interactive filtering interface
- **AIProjectManager**: AI-powered content generation
- **PlaceDiscoveryInterface**: Core discovery logic

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Contribution Guidelines
- Follow the existing code style and conventions
- Add appropriate TypeScript types for new features
- Include JSDoc comments for complex functions
- Test your changes thoroughly
- Update documentation as needed

### Areas for Contribution
- 🎨 UI/UX improvements
- 🚀 Performance optimizations
- 🧪 Additional test coverage
- 📚 Documentation updates
- 🐛 Bug fixes
- ✨ New features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with ❤️ using React Native and Expo
- Powered by Google Places API and Firebase
- Enhanced with Gemini AI capabilities
- Special thanks to all contributors and the open-source community

---

## 📞 Support

If you have questions or need help:
- 📧 Open an issue on GitHub
- 💬 Join our community discussions
- 📖 Check the documentation

---

**Made with ❤️ by [boynomiss](https://github.com/boynomiss)**

*Helping people make better decisions, one discovery at a time.* 🎯✨
