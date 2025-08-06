# Entity-Enhanced Mood Analysis System

## Overview

The Entity-Enhanced Mood Analysis System uses Google's Natural Language API to extract more accurate and contextually relevant mood descriptors from place reviews. Instead of relying solely on predefined mood labels, this system analyzes the actual entities mentioned in reviews to determine the authentic atmosphere and energy of a place.

## How It Works

### 1. Entity Analysis Process

The system processes place reviews through Google's Natural Language API to:

- **Extract Entities**: Identifies people, places, events, and other entities mentioned in reviews
- **Analyze Sentiment**: Determines the sentiment associated with each entity
- **Calculate Salience**: Measures how important each entity is in the context
- **Weight by Recency**: Gives more weight to recent reviews and higher-rated reviews
- **Filter Positive Only**: Only considers positive reviews (4+ stars) and positive entities

### 2. Mood Descriptor Extraction

The system extracts mood descriptors by:

- **Positive Filtering**: Only considers positive reviews (4+ stars) and positive entities
- **Keyword Matching**: Identifies positive mood-related keywords in entity names
- **Sentiment Analysis**: Uses positive entity sentiment to determine mood direction
- **Context Analysis**: Considers the context in which entities are mentioned
- **Confidence Scoring**: Calculates confidence based on entity quality and quantity

### 3. Enhanced Mood Labels

The system uses three categories of enhanced mood labels:

#### Chill Places (0-30 mood score)
- **Adjectives**: cozy, peaceful, quiet, serene, tranquil, calm, relaxing, intimate, romantic, charming, quaint, rustic, homely, comfortable, welcoming, warm, gentle, soft, mellow, laid-back, casual, unpretentious, simple, minimalist
- **Nouns**: oasis, retreat, sanctuary, haven, escape, hideaway, nook, corner, spot, place, space, area, zone
- **Phrases**: perfect for, great for, ideal for, wonderful for, amazing for, excellent for, fantastic for

#### Neutral Places (31-69 mood score)
- **Adjectives**: decent, good, nice, pleasant, adequate, satisfactory, reasonable, fair, standard, typical, normal, regular, convenient, accessible, practical, functional, reliable
- **Nouns**: option, choice, alternative, place, spot, location, venue, establishment, facility, service
- **Phrases**: does the job, gets the job done, meets expectations, satisfies needs, fulfills requirements, serves its purpose

#### Hype Places (70-100 mood score)
- **Adjectives**: vibrant, lively, energetic, exciting, thrilling, amazing, incredible, fantastic, awesome, electric, pumping, wild, crazy, insane, intense, dynamic, bustling, happening, trendy, hip, cool, popular, hot, buzzing, bustling
- **Nouns**: spot, place, venue, destination, hotspot, scene, atmosphere, vibe, energy, excitement, thrill
- **Phrases**: must visit, worth checking out, definitely go, highly recommend, absolutely amazing, incredible experience, unforgettable

## Configuration

### Entity Analysis Settings

```typescript
export const ENTITY_ANALYSIS_CONFIG = {
  // Minimum salience score for entities to be considered
  MIN_SALIENCE: 0.1,
  
  // Minimum sentiment magnitude for entity sentiment to be considered
  MIN_SENTIMENT_MAGNITUDE: 0.3,
  
  // Entity types to focus on for mood analysis
  RELEVANT_ENTITY_TYPES: [
    'PERSON', 'ORGANIZATION', 'LOCATION', 'EVENT', 'WORK_OF_ART',
    'CONSUMER_GOOD', 'OTHER'
  ],
  
  // Weight multipliers for different entity types
  ENTITY_TYPE_WEIGHTS: {
    'PERSON': 1.0,        // People mentioned in reviews
    'ORGANIZATION': 0.8,   // Business names, brands
    'LOCATION': 0.6,       // Place names, landmarks
    'EVENT': 1.2,          // Events, activities (higher weight)
    'WORK_OF_ART': 0.9,    // Creative works, performances
    'CONSUMER_GOOD': 0.7,  // Products, services
    'OTHER': 0.5           // Other entities
  }
};
```

### Review Processing Settings

```typescript
REVIEW_PROCESSING: {
  // Minimum review length to analyze
  MIN_REVIEW_LENGTH: 10,
  
  // Maximum reviews to analyze per place
  MAX_REVIEWS_TO_ANALYZE: 20,
  
  // Recent review weight multiplier (recent reviews count more)
  RECENT_REVIEW_WEIGHT: 1.5,
  
  // Older review weight multiplier
  OLD_REVIEW_WEIGHT: 0.8
}
```

## Usage

### Basic Usage

```typescript
import { EntityEnhancedMoodService } from './utils/entity-enhanced-mood-service';

const entityMoodService = new EntityEnhancedMoodService();

// Analyze place mood from reviews
const analysis = await entityMoodService.analyzePlaceMoodFromReviews(
  reviews,
  placeCategory
);

console.log('Mood Score:', analysis.moodScore);
console.log('Mood Category:', analysis.moodCategory);
console.log('Extracted Descriptors:', analysis.extractedDescriptors);
console.log('Confidence:', analysis.confidence);
```

### Integration with Place Mood Service

```typescript
import { PlaceMoodService } from './utils/place-mood-service';

const placeMoodService = new PlaceMoodService(googlePlacesApiKey);

// Enhanced place with entity-based mood analysis
const enhancedPlace = await placeMoodService.enhancePlaceWithMood(placeId);

console.log('Place:', enhancedPlace.name);
console.log('Mood Score:', enhancedPlace.mood_score);
console.log('Mood Label:', enhancedPlace.final_mood);
```

## API Reference

### EntityEnhancedMoodService

#### Constructor
```typescript
constructor(serviceAccountPath?: string)
```

#### Methods

##### analyzePlaceMoodFromReviews
```typescript
async analyzePlaceMoodFromReviews(
  reviews: ReviewEntity[],
  placeCategory: string
): Promise<EntityMoodAnalysis>
```

Analyzes place reviews using entity analysis to extract mood descriptors.

**Parameters:**
- `reviews`: Array of review objects with text, rating, and timestamp
- `placeCategory`: The category/type of the place

**Returns:**
- `EntityMoodAnalysis` object with mood score, category, descriptors, and confidence

### EntityMoodAnalysis Interface

```typescript
interface EntityMoodAnalysis {
  moodScore: number;                    // 0-100 mood score
  moodCategory: 'chill' | 'neutral' | 'hype';
  extractedDescriptors: string[];       // Mood descriptors from entities
  confidence: number;                   // 0-100 confidence score
  entityInsights: {
    positiveEntities: string[];         // Entities with positive sentiment
    negativeEntities: string[];         // Entities with negative sentiment
    neutralEntities: string[];          // Entities with neutral sentiment
  };
}
```

## Examples

### Example 1: Nightclub Analysis

**Input Reviews:**
```
"Amazing atmosphere! The DJ was incredible and the crowd was electric."
"Incredible night out! The vibe here is absolutely insane."
```

**Output:**
```
Mood Score: 85
Mood Category: HYPE
Extracted Descriptors: ["amazing", "incredible", "electric", "insane"]
Confidence: 92%
```

### Example 2: Spa Analysis

**Input Reviews:**
```
"Peaceful and serene atmosphere. The massage was incredibly relaxing."
"Such a calming experience. The spa is so quiet and peaceful."
```

**Output:**
```
Mood Score: 25
Mood Category: CHILL
Extracted Descriptors: ["peaceful", "serene", "calming", "quiet"]
Confidence: 88%
```

### Example 3: Restaurant Analysis

**Input Reviews:**
```
"Good food and decent service. The atmosphere is pleasant."
"Standard restaurant experience. The food is adequate."
```

**Output:**
```
Mood Score: 55
Mood Category: NEUTRAL
Extracted Descriptors: ["good", "decent", "pleasant", "adequate"]
Confidence: 75%
```

## Benefits

### 1. Authentic Positive Descriptors
- Uses real positive words from actual reviews
- Reflects genuine positive user experiences
- More relatable and trustworthy
- Ensures only positive mood labels are displayed

### 2. Contextual Accuracy
- Considers the context of entity mentions
- Weights recent and highly-rated reviews more heavily
- Accounts for sentiment magnitude
- Filters out negative sentiment entirely

### 3. Dynamic Adaptation
- Adapts to changing place atmospheres
- Reflects current positive user sentiment
- Updates based on new positive reviews
- Maintains positive bias in mood scoring

### 4. Confidence Scoring
- Provides confidence levels for mood analysis
- Indicates reliability of extracted descriptors
- Helps identify when fallback is needed
- Ensures high-quality positive descriptors

## Fallback System

When entity analysis fails or has low confidence, the system falls back to:

1. **Category-based mood mapping** (predefined positive scores for place types)
2. **Traditional sentiment analysis** (overall positive review sentiment only)
3. **Default positive mood labels** (standard positive chill/neutral/hype labels)

## Testing

Run the test script to see the system in action:

```bash
node test-entity-enhanced-mood.js
```

This will test the system with sample reviews for different types of places and show the extracted mood descriptors and confidence levels.

## Performance Considerations

- **API Rate Limits**: Respects Google Natural Language API rate limits
- **Retry Logic**: Implements exponential backoff for failed requests
- **Caching**: Can be extended with caching for frequently analyzed places
- **Batch Processing**: Supports batch analysis of multiple places

## Future Enhancements

1. **Machine Learning Integration**: Train custom models on place-specific data
2. **Multi-language Support**: Extend to support multiple languages
3. **Temporal Analysis**: Track mood changes over time
4. **Seasonal Adjustments**: Account for seasonal mood variations
5. **User Preference Learning**: Adapt to individual user preferences 