# Filtering Services Usage Examples

## Modern Usage (Recommended)

```typescript
import { 
  unifiedFilterService, 
  filterConfigRegistry,
  FilterUtilities,
  moodAnalysis
} from '@/utils/filtering';

// 1. Search places with registry-based config
const results = await unifiedFilterService.searchPlaces({
  lat: 37.7749, lng: -122.4194,
  lookingFor: 'food', mood: 'neutral',
  socialContext: 'withBae', budget: '2-3',
  includeMoodAnalysis: true // NEW: Include mood analysis
});

// 2. Get config data from registry
const budgetConfig = filterConfigRegistry.getConfig('budget', '2-3');
console.log(budgetConfig?.label); // "Moderate"

// 3. Validate filters
const isValid = filterConfigRegistry.validateFilterValue('mood', 'neutral');

// 4. Check compatibility
const compatibility = filterConfigRegistry.checkCompatibility({
  mood: 'hype', socialContext: 'solo'
});

// 5. Use shared utilities
const distance = FilterUtilities.calculateDistance(lat1, lng1, lat2, lng2);
const chunks = FilterUtilities.chunk(places, 10);

// 6. Mood analysis (NEW)
const reviews = [{ text: "Amazing vibe!", rating: 5, time: Date.now() }];
const entityMoodResult = await moodAnalysis.entity.analyzeFromReviews(reviews, 'restaurant');
const placeMoodResult = await moodAnalysis.place.analyzePlaceMood('place_id_123');

// 7. Performance monitoring
const monitoredFn = FilterUtilities.createPerformanceMonitor(
  'search-operation', 
  async () => { /* your code here */ }
);
```

## Configuration Usage

```typescript
import { MoodUtils, BudgetUtils, CategoryUtils } from '@/utils/filtering';

// Get config data
const moodConfig = MoodUtils.getMoodCategory(75); // 'hype'
const budgetConfig = BudgetUtils.getBudgetCategory('PP'); // Moderate

// Validate values
const isValidMood = MoodUtils.validateMoodScore(75);
const isValidBudget = BudgetUtils.validateBudget('PP');
```

## Legacy Usage (Deprecated but still works)

```typescript
import { PlaceDiscoveryLogic } from '@/utils/filtering';

const discovery = new PlaceDiscoveryLogic(moodService, apiKey, ads);
const results = await discovery.discoverPlaces(legacyFilters);
```