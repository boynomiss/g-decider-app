# Time of Day Filter - Complete Implementation Consolidation

## Overview
This document consolidates ALL time of day filter implementations across the entire codebase for easier navigation, maintenance, and organization. This follows the same pattern as the distance-config.ts consolidation.

**Note:** The actual TypeScript configuration is in `utils/time-config.ts` - this markdown file serves as comprehensive documentation.

## Table of Contents
1. [Core Configuration](#core-configuration)
2. [Type Definitions](#type-definitions)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [State Management](#state-management)
6. [API Bridge](#api-bridge)
7. [Logging & Display](#logging--display)
8. [AI Integration](#ai-integration)
9. [Discovery Logic](#discovery-logic)
10. [Test Files](#test-files)
11. [Usage Examples](#usage-examples)

---

## Core Configuration

### TypeScript Configuration File
**File:** `utils/time-config.ts` - Importable TypeScript configuration

```typescript
// Main configuration exports
export const TIME_CATEGORIES: TimeCategory[] = [...];
export const TIME_RANGES = {...};
export const TIME_LABELS = {...};

// Utility class
export class TimeUtils {
  static getTimeCategory(timeId: string | null): TimeCategory | undefined;
  static isPlaceOpenAtTime(place: any, timeOfDay: string | null): boolean;
  static getTimeLabel(timeOfDay: string | null): string;
  static getTimeDisplayText(timeOfDay: string | null): string;
  static getPreferredPlaceTypes(timeOfDay: string | null): string[];
  // ... and more utility functions
}
```

### Time Ranges (24-hour format)
```typescript
// functions/src/filterPlaces.ts:101-104
const TIME_RANGES = {
  'morning': { start: 4, end: 11 },    // 4:00-11:59
  'afternoon': { start: 12, end: 17 }, // 12:00-17:59  
  'night': { start: 18, end: 3 }       // 18:00-3:59 (next day)
} as const;
```

### UI Options Configuration
```typescript
// components/MoodSlider.tsx:32-58
export const timeOptions = [
  { 
    id: 'morning', 
    label: 'Morning',
    timeRange: { start: '04:00', end: '12:00' },
    googleOpeningHours: {
      periods: [{ open: { day: 0, time: '0400' }, close: { day: 0, time: '1200' } }]
    },
    description: 'Early morning activities and breakfast spots'
  },
  { 
    id: 'afternoon', 
    label: 'Afternoon',
    timeRange: { start: '12:00', end: '18:00' },
    googleOpeningHours: {
      periods: [{ open: { day: 0, time: '1200' }, close: { day: 0, time: '1800' } }]
    },
    description: 'Lunch, shopping, and daytime activities'
  },
  { 
    id: 'night', 
    label: 'Night',
    timeRange: { start: '18:00', end: '04:00' },
    googleOpeningHours: {
      periods: [{ open: { day: 0, time: '1800' }, close: { day: 1, time: '0400' } }]
    },
    description: 'Dinner, nightlife, and evening entertainment'
  }
] as const;
```

### Display Labels
```typescript
// components/FilterControlPanel.tsx:74-77
const timeLabels = {
  'morning': '🌅 Morning',
  'afternoon': '☀️ Afternoon', 
  'night': '🌙 Night'
};
```

---

## Type Definitions

### Interface Definitions
```typescript
// functions/src/filterPlaces.ts:117
interface UserFilters {
  timeOfDay: 'morning' | 'afternoon' | 'night' | null;
}

// utils/place-discovery-logic.ts:16
interface DiscoveryFilters {
  timeOfDay?: 'morning' | 'afternoon' | 'night' | null;
}

// utils/ai-description-service.ts:32
interface RestaurantData {
  timeOfDay?: string;
}
```

### Type Aliases
```typescript
type TimeOfDay = 'morning' | 'afternoon' | 'night' | null;
```

---

## Backend Implementation

### Opening Hours Check Function
```typescript
// functions/src/filterPlaces.ts:190-210
function isPlaceOpenAtTime(place: any, timeOfDay: string | null): boolean {
  if (!timeOfDay || !place.opening_hours?.periods) return true;
  
  const timeRange = TIME_RANGES[timeOfDay as keyof typeof TIME_RANGES];
  if (!timeRange) return true;
  
  const now = new Date();
  const currentHour = now.getHours();
  
  // Handle overnight time ranges (night: 18:00-3:59)
  if (timeRange.start > timeRange.end) {
    return currentHour >= timeRange.start || currentHour <= timeRange.end;
  }
  
  return currentHour >= timeRange.start && currentHour <= timeRange.end;
}
```

### Main Filtering Logic
```typescript
// functions/src/filterPlaces.ts:793-797
// Filter by time of day (opening hours)
if (filters.timeOfDay) {
  filteredPlaces = filteredPlaces.filter(place => 
    isPlaceOpenAtTime(place, filters.timeOfDay)
  );
}
```

### Applied Filters Logging
```typescript
// functions/src/filterPlaces.ts:980
if (filters.timeOfDay) appliedFilters.push(`timeOfDay: ${filters.timeOfDay}`);
```

---

## Frontend Implementation

### MoodSlider Component
```typescript
// components/MoodSlider.tsx:220-235
const handleTimeOfDayPress = (timeId: 'morning' | 'afternoon' | 'night') => {
  const selectedTime = timeOptions.find(option => option.id === timeId);
  
  if (filters.timeOfDay === timeId) {
    // Deselecting
    console.log('Time of day deselected');
    updateFilters({ timeOfDay: null, _timeApiData: null });
  } else {
    // Enhanced logging with API-ready data (null-safe)
    const filterData = FilterApiBridge.logTimeOfDaySelection(timeId);
    updateFilters({ 
      timeOfDay: timeId,
      _timeApiData: filterData // Store API-ready data (may be null)
    });
  }
};
```

### FilterControlPanel Component
```typescript
// components/FilterControlPanel.tsx:340-365
{renderFilterSection(
  'Time of Day',
  'time',
  <View style={styles.optionsGrid}>
    {[
      { id: 'morning', label: 'Morning', icon: '🌅' },
      { id: 'afternoon', label: 'Afternoon', icon: '☀️' },
      { id: 'night', label: 'Night', icon: '🌙' }
    ].map((time) => (
      <TouchableOpacity
        key={time.id}
        style={[
          styles.optionButton,
          filters.timeOfDay === time.id && styles.activeOption
        ]}
        onPress={() => onFiltersChange({ 
          timeOfDay: filters.timeOfDay === time.id ? null : time.id as any 
        })}
      >
        <Text style={styles.optionIcon}>{time.icon}</Text>
        <Text style={[
          styles.optionText,
          filters.timeOfDay === time.id && styles.activeOptionText
        ]}>
          {time.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>,
  !!filters.timeOfDay
)}
```

### Filter Summary Logic
```typescript
// components/FilterControlPanel.tsx:73-79
if (filters.timeOfDay) {
  count++;
  summary.push(timeLabels[filters.timeOfDay]);
}
```

---

## State Management

### App Store (use-app-store.ts)
```typescript
// hooks/use-app-store.ts:72
// Initial state
timeOfDay: null

// hooks/use-app-store.ts:156
// Filter conversion
timeOfDay: state.filters.timeOfDay || null

// hooks/use-app-store.ts:196-198
// Update logic
case 'timeOfDay':
  filterData = FilterApiBridge.logTimeOfDaySelection(value as any);
  changedFilter = 'timeOfDay';

// hooks/use-app-store.ts:220
// Default fallback
timeOfDay: updatedFilters.timeOfDay || 'afternoon'
```

### App Store V2 (use-app-store-v2.ts)
```typescript
// hooks/use-app-store-v2.ts:84
// Initial state
timeOfDay: null

// hooks/use-app-store-v2.ts:163
// Filter conversion
timeOfDay: state.filters.timeOfDay,

// hooks/use-app-store-v2.ts:197-198
// Update logic
case 'timeOfDay':
  filterData = FilterApiBridge.logTimeOfDaySelection(value as any);

// hooks/use-app-store-v2.ts:221
// Default fallback
timeOfDay: updatedFilters.timeOfDay || 'afternoon'
```

### Place Discovery Hook
```typescript
// hooks/use-place-discovery.ts:85
timeOfDay: filters.timeOfDay,
```

---

## API Bridge

### Time of Day Selection Logging
```typescript
// utils/filter-api-bridge.ts:452-506
static logTimeOfDaySelection(timeId: 'morning' | 'afternoon' | 'night' | null): ApiReadyFilterData | null {
  if (!timeId) {
    console.warn('⚠️ Time of day selection called with null value');
    return null;
  }

  const selectedTime = TIME_OPTIONS.find(option => option.id === timeId);
  
  if (!selectedTime) {
    console.error(`❌ Invalid time of day: ${timeId}`);
    return null;
  }
  
  const filterData: ApiReadyFilterData = {
    filterId: `time_${timeId}_${Date.now()}`,
    filterType: 'time',
    timestamp: Date.now(),
    displayName: 'Time of Day',
    displayValue: selectedTime.label,
    emoji: '🕐',
    googlePlacesQuery: {
      openNow: true
    },
    searchModifiers: {
      priority: 'flexible',
      weight: 0.5,
      fallbackOptions: ['any_time'] // Fallback to any time if no open places
    },
    metadata: {
      userPreference: selectedTime.label,
      rawValue: timeId,
      category: 'time_filter',
      confidence: 0.7,
      timeRange: selectedTime.timeRange,
      googleOpeningHours: selectedTime.googleOpeningHours,
      description: selectedTime.description
    }
  };
  
  console.log('⏰ Time Filter (API Ready):', {
    selected: selectedTime.label,
    timeRange: `${selectedTime.timeRange.start}-${selectedTime.timeRange.end}`,
    openNow: true,
    description: selectedTime.description,
    priority: 'FLEXIBLE',
    apiQuery: filterData.googlePlacesQuery
  });
  
  return filterData;
}
```

---

## Logging & Display

### Filter Logger
```typescript
// utils/filter-logger.ts:91-97
function getTimeOfDayLabel(timeOfDay: string | null): string {
  if (!timeOfDay) return 'not-set';
  switch (timeOfDay) {
    case 'morning': return 'Morning';
    case 'afternoon': return 'Afternoon';
    case 'night': return 'Night';
    default: return 'not-set';
  }
}
```

### Filter Log Display
```typescript
// components/FilterLogDisplay.tsx:42
Time of day: <Text style={styles.value}>{filterSummary.timeOfDay}</Text>
```

### Discovery Demo
```typescript
// components/DiscoveryDemo.tsx:130
<Text style={styles.statusValue}>{filters.timeOfDay || 'Not set'}</Text>
```

---

## AI Integration

### AI Description Service
```typescript
// utils/ai-description-service.ts:249-257
private getTimeContext(time?: string): string {
  const timeMap = {
    'morning': 'morning/breakfast',
    'afternoon': 'afternoon/lunch',
    'night': 'evening/dinner'
  };
  return timeMap[time as keyof typeof timeMap] || 'any time of day';
}
```

### AI Description Integration
```typescript
// utils/ai-description-service.ts:146
const timeContext = this.getTimeContext(timeOfDay);
```

---

## Discovery Logic

### Place Discovery Logic
```typescript
// utils/place-discovery-logic.ts:897-898
if (filters?.timeOfDay && place.opening_hours) {
  const timeAlignment = this.calculateTimeAlignment(place, filters.timeOfDay);
}

// utils/place-discovery-logic.ts:967-987
private calculateTimeAlignment(place: PlaceData, timeOfDay: string): number {
  // Time alignment calculation logic
  const timePreferences = {
    'morning': ['cafe', 'bakery', 'restaurant', 'park', 'gym'],
    'afternoon': ['restaurant', 'museum', 'art_gallery', 'shopping_mall', 'park'],
    'night': ['restaurant', 'bar', 'night_club', 'movie_theater', 'casino']
  };
  
  const preferredTypes = timePreferences[timeOfDay] || [];
  // Calculate alignment score based on place types and time preferences
}
```

---

## Test Files

### Test Refactored Filtering
```javascript
// test-refactored-filtering.js:144-158
async function testTimeOfDayFiltering(testLocation) {
  const times = ['morning', 'afternoon', 'night'];
  
  for (const timeOfDay of times) {
    console.log(`   Testing ${timeOfDay} time filtering...`);
    
    const filters = {
      mood: 50,
      category: 'food',
      timeOfDay: timeOfDay,
      distanceRange: 50
    };
    
    console.log(`   ✅ ${timeOfDay} preferences mapped to place types`);
  }
}
```

### Test Discovery Logic
```javascript
// test-discovery-logic.js:45, 58, 71
// Morning scenario
timeOfDay: 'night',

// Afternoon scenario  
timeOfDay: 'afternoon',

// Night scenario
timeOfDay: 'morning',
```

### Test Firebase Function
```javascript
// test-firebase-function.js:17, 42, 60
timeOfDay: 'afternoon',
timeOfDay: ['afternoon'],
'timeOfDay: afternoon'
```

---

## Usage Examples

### Setting Time Filter
```typescript
// Set time of day
updateFilters({ timeOfDay: 'night' });

// Deselect time of day
updateFilters({ timeOfDay: null });
```

### Checking Time Filter
```typescript
// Check if time filter is active
if (filters.timeOfDay) {
  // Apply time-based filtering
}

// Get time label for display
const timeLabel = getTimeOfDayLabel(filters.timeOfDay);
```

### Filter Validation
```typescript
// Validate time of day value
const isValidTime = ['morning', 'afternoon', 'night'].includes(timeOfDay);
```

---

## File Organization Summary

### Core Files
1. **functions/src/filterPlaces.ts** - Backend filtering logic
2. **components/MoodSlider.tsx** - UI component with time options
3. **components/FilterControlPanel.tsx** - Filter panel UI
4. **hooks/use-app-store.ts** - Main state management
5. **utils/filter-api-bridge.ts** - API bridge functions
6. **utils/filter-logger.ts** - Logging functions

### Supporting Files
1. **utils/ai-description-service.ts** - AI integration
2. **utils/place-discovery-logic.ts** - Discovery logic
3. **components/FilterLogDisplay.tsx** - Display components
4. **components/DiscoveryDemo.tsx** - Demo components
5. **test-*.js** - Test files

### Configuration Files
1. **utils/time-config.ts** - TypeScript configuration file (importable)
2. **TIME_OF_DAY_FILTER_CONSOLIDATION.md** - This comprehensive documentation file

---

## Next Steps for Organization

1. **Create Filter-Specific Folders**: Create a `filters/` folder with subfolders for each filter type
2. **Consolidate Configurations**: Move all filter-specific configurations to dedicated files
3. **Standardize Interfaces**: Create consistent interfaces across all filter types
4. **Documentation**: Maintain comprehensive documentation for each filter type
5. **Testing**: Ensure all filter implementations have corresponding test files

This consolidation provides a complete reference for the time of day filter implementation across the entire codebase. 