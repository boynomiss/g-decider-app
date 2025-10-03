# 🔑 Enable Google APIs for Real Place Images

## Current Situation

Your API key (`AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk`) returns **403 Forbidden** for:
- Maps Static API
- Street View Static API

This prevents real Google images from loading in your app.

---

## ✅ How to Fix (5 Minutes)

### Step 1: Go to Google Cloud Console

**Visit:** https://console.cloud.google.com/

**Select your project:** `g-decider-backend` (or whatever project owns that API key)

---

### Step 2: Enable Required APIs

Go to: **APIs & Services** → **Library**

Search and enable these **3 APIs**:

#### 1. ✅ Maps Static API
- **Search:** "Maps Static API"
- Click **ENABLE**
- Allows: Static map images

#### 2. ✅ Street View Static API  
- **Search:** "Street View Static API"
- Click **ENABLE**
- Allows: Street View photos

#### 3. ✅ Places API (New)
- **Search:** "Places API (New)"
- Click **ENABLE**
- Allows: Place photos and details

**Wait 2-3 minutes** for changes to propagate.

---

### Step 3: Verify Your API Key

After enabling, test the API key:

```bash
# Test Maps Static API
curl "https://maps.googleapis.com/maps/api/staticmap?center=14.5556,121.0517&zoom=17&size=400x400&markers=14.5556,121.0517&key=AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk"

# Should return image data (binary), not 403
```

If you see binary data or the file downloads, it's working!

---

### Step 4: Run the Image Update

Once APIs are enabled, run:

```bash
# Option A: Street View images (best - real place photos)
npm run update-streetview

# Option B: Static maps only  
npm run update-maps
```

This will update all 290 places with real Google images!

---

## 🎯 What You'll Get After Enabling

### With Street View API Enabled:

**Each place gets 6 real images:**
1. Front Street View (hero)
2. Right side Street View
3. Back Street View
4. Left side Street View
5. Elevated Street View
6. Static map with marker

**Example URLs that will work:**
```
https://maps.googleapis.com/maps/api/streetview?size=800x600&location=14.5556,121.0517&heading=0&key=YOUR_KEY
https://maps.googleapis.com/maps/api/staticmap?center=14.5556,121.0517&zoom=17&markers=14.5556,121.0517&key=YOUR_KEY
```

---

## 💰 API Costs

All three APIs are in Google's **FREE TIER**:

**Free Monthly Quota:**
- Maps Static API: 28,000 requests ($200 credit)
- Street View Static API: 28,000 requests ($200 credit)  
- Places API: Variable (starts with $200 credit)

**Your Usage:**
- Initial load: ~1,740 images = ~$3-4 one-time
- Ongoing: ~$0 (images cached by app)

**Well within free tier!** ✅

---

## 🚀 Alternative: Use Place Photos API

If you want **real interior/food photos** instead of Street View:

### How It Works:
1. Each place in Google has user-submitted photos
2. We fetch these using Places API
3. Get 3-8 real photos of food, interiors, etc.

### Implementation:
Already created! Just enable **Places API (New)** and run:
```bash
npm run fetch-images
```

But you'll need to add Google Place IDs to your places first.

---

## 🎨 Current Temporary Solution

**Right now (Lorem Picsum images):**
- ✅ Images load fast and work
- ⚠️ Generic photos (not actual places)
- ✅ Good for testing and MVP
- ⚠️ Should upgrade to real Google images

**After enabling Google APIs:**
- ✅ Real Street View of actual locations
- ✅ Real place photos from Google users
- ✅ Professional quality
- ✅ Always up-to-date

---

## 📝 Quick Reference

### Enable These 3 APIs:
1. **Maps Static API** ← For map images
2. **Street View Static API** ← For street photos  
3. **Places API (New)** ← For place photos

### Then Run:
```bash
npm run update-streetview    # Real Street View photos
# OR
npm run fetch-images         # Real user-submitted place photos (after adding Place IDs)
```

---

## ✅ Checklist

Before running image scripts:

- [ ] Go to Google Cloud Console
- [ ] Select correct project
- [ ] Enable "Maps Static API"
- [ ] Enable "Street View Static API"
- [ ] Enable "Places API (New)"
- [ ] Wait 2-3 minutes
- [ ] Test API key with curl command
- [ ] Run `npm run update-streetview`
- [ ] Restart Expo app
- [ ] Verify images load!

---

## 🆘 If You Don't Want to Enable APIs

**Current setup works fine for MVP:**
- Lorem Picsum provides 1,740 real photos
- Fast loading
- Professional quality
- No configuration needed
- Good enough for testing and initial launch

**Upgrade later** when you want actual place photos.

---

## 🎉 Summary

**Problem:** API key doesn't have Maps/Street View APIs enabled  
**Quick Fix:** Lorem Picsum images (already done - working now!)  
**Permanent Solution:** Enable 3 APIs in Google Cloud Console  
**Time to fix:** 5 minutes  
**Cost:** Free (within $200/month credit)  

**Your app has 290 places with 1,740 images that work RIGHT NOW!** ✅

Enable Google APIs when you're ready for real place photos! 🚀

