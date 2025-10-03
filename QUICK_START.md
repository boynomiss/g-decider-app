# Quick Start Guide - Metro Manila Places Database

## 🚀 Get Started in 3 Steps

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Populate Sample Data
```bash
npm run populate-db
```
Adds 45 sample places (5 per combination) to Firebase.

### 3️⃣ Check Status
```bash
npm run audit-db
```
Shows distribution and what's needed.

---

## 📝 Daily Workflow

### Add New Places
1. Open `data/metro-manila-places.ts`
2. Find the right array (e.g., `foodChillPlaces`)
3. Add place objects (see template below)
4. Run `npm run populate-db`
5. Verify with `npm run audit-db`

---

## 📋 Place Template

```typescript
{
  name: "Place Name Here",
  category: "food", // food | activity | something-new
  description: "Short description WITHOUT name/location",
  location: {
    address: "Full street address",
    city: "Makati", // Any Metro Manila city
    lat: 14.5500, // From Google Maps
    lng: 121.0200
  },
  contact: {
    phone: "+63 2 1234 5678",
    website: "https://example.com"
  },
  businessInfo: {
    hours: "9:00 AM - 10:00 PM",
    priceRange: "₱₱", // ₱, ₱₱, ₱₱₱, ₱₱₱₱
    features: ["WiFi", "Parking", "Pet-Friendly"]
  },
  images: {
    hero: "https://example.com/hero.jpg",
    gallery: [
      "https://example.com/1.jpg",
      "https://example.com/2.jpg",
      "https://example.com/3.jpg"
    ] // 3-8 images total
  },
  discovery: {
    tags: ["tag1", "tag2", "tag3"],
    perfectFor: ["use case 1", "use case 2"],
    moodScore: 25, // See guide below
    uniqueFeatures: "What makes this place special"
  }
}
```

---

## 🎯 Mood Score Cheat Sheet

| Score | Mood | Examples |
|-------|------|----------|
| 1-40 | **Chill** 😌 | Quiet cafes (20-30), Spas (10-20), Parks (20-30) |
| 35-65 | **Neutral** 😊 | Casual restaurants (45-55), Museums (40-50), Malls (50-60) |
| 60-100 | **Hype** 🔥 | Bars (70-80), Nightclubs (90-100), Theme parks (75-85) |

---

## 📍 Where to Find Places

### Quick Research
- **Google Maps** → "Top rated restaurants Makati"
- **Spot.ph** → https://spot.ph (Top 10 lists)
- **When In Manila** → https://wheninmanila.com
- **Zomato** → https://zomato.com/manila

### By Area
| Area | Best For |
|------|----------|
| Poblacion, Makati | Bars, nightlife (food + hype) |
| BGC | Upscale everything (all categories) |
| Maginhawa, QC | Indie food (food + something-new) |
| Makati CBD | Cafes, fine dining (food chill/neutral) |

---

## 🖼️ Getting Images

1. Google Maps → Place page → Photos tab
2. Instagram → @placename
3. Google Images → "place name interior"
4. Official website

**Remember:** 3-8 images per place, from actual location

---

## 💰 Price Ranges

| Symbol | Meaning |
|--------|---------|
| ₱ | Budget (Under ₱200) |
| ₱₱ | Moderate (₱200-500) |
| ₱₱₱ | Upscale (₱500-1000) |
| ₱₱₱₱ | Luxury (₱1000+) |

---

## 🎯 Current Target

**Need:** 900 total places (100 per combination)  
**Have:** 45 places (5 per combination)  
**Remaining:** 855 places

### Targets by Combo
- ✅ food + chill: 5/100
- ✅ food + neutral: 5/100
- ✅ food + hype: 5/100
- ✅ activity + chill: 5/100
- ✅ activity + neutral: 5/100
- ✅ activity + hype: 5/100
- ✅ something-new + chill: 5/100
- ✅ something-new + neutral: 5/100
- ✅ something-new + hype: 5/100

---

## 🔧 NPM Scripts

```bash
npm run audit-db       # Check database status
npm run populate-db    # Add places to Firebase  
npm run place-helper   # Show templates/guides
```

---

## ⚡ Pro Tips

1. **Work in batches** - Research 20 places at once
2. **One combo at a time** - Complete food + chill before moving to next
3. **Use templates** - Copy/paste is your friend
4. **Verify often** - Run audit after each batch
5. **Real places only** - Everything must be findable in Metro Manila
6. **Quality images** - 3-8 enticing photos from actual place

---

## 📚 Full Documentation

- `DATABASE_POPULATION_SUMMARY.md` - Complete overview
- `PLACES_DATABASE_PLAN.md` - Detailed implementation plan
- `scripts/place-generator-helper.ts` - Templates and examples

---

## 🆘 Problems?

**Scripts won't run?**
```bash
npm install
```

**Places not in database?**
- Check `metadata.status === 'active'`
- Run audit to verify

**Need help with mood scores?**
```bash
npm run place-helper
```

---

## ✅ You're Ready!

1. Research 10-20 places
2. Add to `data/metro-manila-places.ts`
3. Run `npm run populate-db`
4. Check progress with `npm run audit-db`
5. Repeat until you hit 900! 🎉


