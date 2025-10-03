# Metro Manila Places Database - Implementation Plan

## Current Status

✅ **Completed:**
- Updated `mvp-config.ts` to 3-category, 3-mood system
- Created database audit script (`scripts/audit-database.ts`)
- Created place population script (`scripts/populate-database.ts`)
- Created helper/template file (`scripts/place-generator-helper.ts`)
- Created initial place database with **45 sample places** (`data/metro-manila-places.ts`)

⚠️ **In Progress:**
- Need **855 more places** to reach target of 900 (100 per combination)

---

## Target Distribution

Each category-mood combination needs **100 active places**:

| Category | Mood Range | Score | Target | Current | Remaining |
|----------|------------|-------|--------|---------|-----------|
| food | chill | 1-40 | 100 | 5 | 95 |
| food | neutral | 35-65 | 100 | 5 | 95 |
| food | hype | 60-100 | 100 | 5 | 95 |
| activity | chill | 1-40 | 100 | 5 | 95 |
| activity | neutral | 35-65 | 100 | 5 | 95 |
| activity | hype | 60-100 | 100 | 5 | 95 |
| something-new | chill | 1-40 | 100 | 5 | 95 |
| something-new | neutral | 35-65 | 100 | 5 | 95 |
| something-new | hype | 60-100 | 100 | 5 | 95 |
| **TOTAL** | | | **900** | **45** | **855** |

---

## Implementation Strategy

### Phase 1: Infrastructure (✅ COMPLETE)
- [x] Update category system
- [x] Update mood configurations
- [x] Create audit script
- [x] Create population script
- [x] Create helper templates
- [x] Create initial 45 sample places

### Phase 2: Database Population (📍 CURRENT PHASE)

**Approach:** Batch creation in sets of 20-50 places per category-mood combo

#### Batch Creation Process:
1. **Research** (30-60 min per batch of 20):
   - Use Google Maps, Spot.ph, When In Manila
   - Search by area (Poblacion, BGC, Maginhawa, etc.)
   - Focus on one category-mood combo at a time

2. **Data Entry** (1-2 hours per batch of 20):
   - Copy template from `place-generator-helper.ts`
   - Fill in all required fields
   - Get coordinates from Google Maps
   - Find 3-8 images per place

3. **Add to Database** (2-3 min):
   - Add place objects to appropriate array in `metro-manila-places.ts`
   - Run `npm run populate` to add to Firebase
   - Run `npm run audit` to verify

4. **Repeat** until target reached

---

## Quick Start Guide

### 1. Check Current Database Status
```bash
npm run audit
```

### 2. Add New Places

**Edit:** `data/metro-manila-places.ts`

Find the appropriate array (e.g., `foodChillPlaces`) and add places:

```typescript
{
  name: "New Place Name",
  category: "food",
  description: "Short description without repeating name/location",
  location: {
    address: "Full address",
    city: "Makati",
    lat: 14.5547,
    lng: 121.0244
  },
  contact: {
    phone: "+63 2 1234 5678",
    website: "https://example.com"
  },
  businessInfo: {
    hours: "9:00 AM - 10:00 PM",
    priceRange: "₱₱",
    features: ["WiFi", "Parking", "Pet-Friendly"]
  },
  images: {
    hero: "https://example.com/hero.jpg",
    gallery: [
      "https://example.com/1.jpg",
      "https://example.com/2.jpg",
      "https://example.com/3.jpg"
    ]
  },
  discovery: {
    tags: ["cafe", "quiet", "work-friendly"],
    perfectFor: ["working", "studying", "quiet time"],
    moodScore: 25, // 1-40 for chill
    uniqueFeatures: "What makes this place special"
  }
}
```

### 3. Populate Firebase
```bash
npm run populate
```

### 4. Verify
```bash
npm run audit
```

---

## Research Resources

### Aggregators & Lists:
- **Spot.ph** - https://spot.ph (Top 10 lists by category)
- **When In Manila** - https://wheninmanila.com
- **Booky** - https://booky.ph
- **Zomato** - https://zomato.com/manila
- **TripAdvisor Manila** - https://tripadvisor.com

### By Area:
- **Poblacion, Makati** - Bars, nightlife, creative dining
- **BGC** - Upscale dining, rooftop bars, activities
- **Maginhawa, QC** - Indie restaurants, quirky cafes
- **Kapitolyo, Pasig** - Food parks, cafes
- **Eastwood, QC** - Entertainment, dining
- **Makati CBD** - Fine dining, corporate cafes
- **Alabang** - Family-friendly, malls
- **Manila (Intramuros, Binondo)** - Cultural, historic

### Image Sources:
1. Google Maps → Place → Photos tab
2. Official Instagram (@placename)
3. Google Images ("place name interior")
4. Blog reviews with photos
5. Official website press kit

---

## Tips for Efficient Creation

### Mood Score Assignment:
- **1-40 (Chill):** Quiet, peaceful, relaxing, minimal noise
- **35-65 (Neutral):** Moderate energy, versatile, comfortable
- **60-100 (Hype):** Loud, energetic, exciting, lively

### Description Guidelines:
- Keep it short (1-2 sentences)
- **Don't repeat** place name or city (shown separately in UI)
- Focus on what makes it special
- Use user memory preference: space before ellipsis (' ...')

### Image Requirements:
- **3-8 images** per place (user preference)
- High quality, enticing, from actual place
- No stock photos
- Show the actual venue/food/activity

### Features to Include:
Common: WiFi, Parking, Pet-Friendly, Air-Conditioned, Outdoor Seating
Food: Vegan Options, Halal, Delivery, Reservations
Activity: Beginners Welcome, Equipment Rental, Coaching

---

## Automation Ideas (Future)

### Potential Tools to Build:
1. **Google Places API Integration** - Auto-fetch place details
2. **Bulk Import from CSV** - Easier batch entry
3. **Image Scraper** - Auto-fetch from Google Maps
4. **Duplicate Detector** - Prevent duplicate entries
5. **Mood Score Suggester** - ML model to suggest scores

### Current Manual Process:
Manual entry ensures quality control and accurate mood scoring, which is critical for the user experience.

---

## Scripts Reference

### Audit Database
```bash
npm run audit
```
Shows current distribution and gaps

### Populate Database
```bash
npm run populate
```
Adds places from `metro-manila-places.ts` to Firebase

### View Helper
```bash
npm run place-helper
```
Shows templates and guidelines (if we add this script)

---

## Next Steps

1. **Immediate:** Start batch creation focusing on gaps
2. **Priority combos** to fill first:
   - food + chill (95 needed)
   - food + hype (95 needed) 
   - activity + neutral (95 needed)
3. **Research strategy:** 
   - Use Spot.ph "Top 10" lists as starting point
   - Focus on one area at a time (e.g., all Poblacion places)
4. **Quality over speed:**
   - Ensure each place is real and well-researched
   - 3-8 quality images per place
   - Accurate mood scores

---

## Questions?

Refer to:
- `scripts/place-generator-helper.ts` - Templates and guidelines
- `data/metro-manila-places.ts` - Current place database
- `scripts/audit-database.ts` - Check distribution
- `scripts/populate-database.ts` - Add to Firebase


