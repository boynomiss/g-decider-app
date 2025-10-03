# API Keys Setup Guide

## ✅ Current Status

### Working Keys:
1. **Firebase API**: ✅ Hardcoded in `firebase-config.ts` - Working!
2. **Google Places API**: ⚠️ Using fallback key - Should verify/replace

---

## 🔑 Getting Your Own Google Places API Key

### Step 1: Create/Access Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Select project: **g-decider-backend** (or create new one)
3. Enable billing (required for Google Places API)

### Step 2: Enable Google Places API

1. Go to: https://console.cloud.google.com/apis/library
2. Search for **"Places API"**
3. Click **"Enable"**

Also enable (for photo features):
- **Places API (New)**
- **Maps JavaScript API** (if using web)
- **Maps SDK for Android/iOS** (if using native)

### Step 3: Create API Key

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key (format: `AIzaSy...`)

### Step 4: Restrict API Key (Important!)

1. Click on your newly created API key
2. Under "Application restrictions":
   - Choose **"HTTP referrers"** (for web) or **"Android apps"** (for mobile)
3. Under "API restrictions":
   - Select **"Restrict key"**
   - Check:
     - ✅ Places API
     - ✅ Places API (New)
     - ✅ Maps JavaScript API
4. Click **"Save"**

### Step 5: Add to Your App

Update `.env.local`:
```bash
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=YOUR_NEW_API_KEY_HERE
```

---

## 📝 Environment Variables

### File: `.env.local`

```bash
# Google Places API
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSy...YOUR_KEY

# Google Natural Language (Optional)
EXPO_PUBLIC_GOOGLE_NATURAL_LANGUAGE_API_KEY=AIzaSy...YOUR_KEY

# Google Gemini (Optional)
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...YOUR_KEY

# Firebase (Already hardcoded)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyDdvXxkBOGYvBTPQ_BIT6kHPcfI3-JADA0
```

### Important Notes:
- ✅ File already created: `.env.local`
- ✅ Already in `.gitignore` (won't commit to GitHub)
- ⚠️ Restart Expo dev server after changing this file
- ⚠️ Use `EXPO_PUBLIC_` prefix for client-side variables

---

## 🧪 Testing Your API Key

### Test in Terminal:

```bash
# Replace YOUR_API_KEY with your actual key
curl "https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJN1t_tDeuEmsRUsoyG83frY4&fields=photos&key=YOUR_API_KEY"
```

Should return JSON with status: `"OK"`

### Test in App:

```typescript
import { API_KEYS } from './src/shared/constants/config/api-keys';

console.log('API Key:', API_KEYS.GOOGLE_PLACES);
// Should log your key, not "undefined"
```

---

## 💰 API Costs

### Google Places API Pricing:
- **$200 free credit per month** (enough for ~40,000 photo requests)
- **Place Details**: $0.017 per request
- **Place Photos**: $0.007 per request
- **Find Place**: $0.017 per request

### For This App:
- **~100 places** = ~$1.70 for initial photo fetch
- **User browsing** = Very minimal (photos cached by React Native Image)
- **Should stay within free tier** for MVP testing

---

## 🔒 Security Best Practices

### Current Setup:
✅ Firebase key is hardcoded (OK for client apps)
✅ Google Places key has fallback
✅ `.env.local` in `.gitignore` (won't commit secrets)

### Recommendations:
1. **Use your own API key** - Don't rely on fallback
2. **Restrict API key** - Limit to specific APIs and referrers
3. **Monitor usage** - Check Google Cloud Console regularly
4. **Set budget alerts** - Get notified if costs exceed $5/month

---

## 🚨 Common Issues

### "API key not valid" Error:
- ✅ Check key is enabled for **Places API**
- ✅ Wait 5 minutes after creating key (propagation time)
- ✅ Verify no typos in `.env.local`

### "REQUEST_DENIED" Error:
- ✅ Enable billing on Google Cloud project
- ✅ Enable Places API in API Library
- ✅ Check API restrictions aren't too strict

### Key Not Loading:
- ✅ Restart Expo dev server: `npm start -- --clear`
- ✅ Check `EXPO_PUBLIC_` prefix is correct
- ✅ Verify `.env.local` file exists in project root

---

## ✅ Verification Checklist

Before deploying:
- [ ] Created Google Cloud project
- [ ] Enabled Places API
- [ ] Created and restricted API key
- [ ] Added key to `.env.local`
- [ ] Tested API key works
- [ ] Set budget alert in Google Cloud
- [ ] Restarted Expo dev server
- [ ] Verified photos load in app

---

## 🎯 Current Keys Summary

| Service | Status | Location |
|---------|--------|----------|
| **Firebase** | ✅ Working | `firebase-config.ts` (hardcoded) |
| **Google Places** | ⚠️ Fallback | `.env.local` + `api-keys.ts` |
| **Google NL** | ⚠️ Fallback | `.env.local` + `api-keys.ts` |
| **Gemini** | ⚠️ Fallback | `.env.local` + `api-keys.ts` |

**Recommendation**: Get your own Google Places API key for production use!

---

## 🔗 Useful Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **API Credentials**: https://console.cloud.google.com/apis/credentials
- **API Library**: https://console.cloud.google.com/apis/library
- **Places API Docs**: https://developers.google.com/maps/documentation/places/web-service
- **Pricing**: https://mapsplatform.google.com/pricing/

---

## ✨ Summary

**For MVP/Testing:**
✅ Current fallback key will work
✅ Firebase key is already configured
✅ Can start using the app immediately

**For Production:**
⚠️ Get your own Google Places API key
⚠️ Add to `.env.local`
⚠️ Restart dev server
⚠️ Monitor usage and costs

**You're ready to populate the database!** 🚀

