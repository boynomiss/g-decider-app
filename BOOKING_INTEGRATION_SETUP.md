# Booking Platform Integration Setup

This feature integrates third-party booking platforms (Eatigo, Klook) into your decider app using deep linking and affiliate programs.

## 🎯 **Implementation Strategy**

### **Phase 1: Deep Linking (Current Implementation)**
- ✅ **Immediate functionality** with deep links
- ✅ **No API keys required** initially
- ✅ **Works with existing app structure**
- ✅ **User gets redirected to booking platforms**

### **Phase 2: API Integration (Future)**
- 🔄 **When platforms provide APIs**
- 🔄 **Direct booking within app**
- 🔄 **Real-time availability**
- 🔄 **Payment processing**

## 🚀 **Current Features**

### **Deep Linking Integration**
1. **Eatigo Integration**
   - Deep link: `eatigo://restaurant/`
   - Web fallback: `https://eatigo.com/restaurant/`
   - Affiliate tracking available

2. **Klook Integration**
   - Deep link: `klook://activity/`
   - Web fallback: `https://klook.com/activity/`
   - Affiliate tracking available

### **Smart Availability Detection**
- **Location-based filtering** (Eatigo for Asia, Klook globally)
- **Restaurant name matching**
- **Budget level consideration**

## 📋 **Setup Instructions**

### **1. Configure Affiliate IDs**

Update the affiliate IDs in `utils/booking-integration.ts`:

```typescript
private platforms: BookingPlatform[] = [
  {
    name: 'Eatigo',
    deepLinkBase: 'eatigo://restaurant/',
    webUrlBase: 'https://eatigo.com/restaurant/',
    affiliateId: 'your-actual-eatigo-affiliate-id' // Replace this
  },
  {
    name: 'Klook',
    deepLinkBase: 'klook://activity/',
    webUrlBase: 'https://klook.com/activity/',
    affiliateId: 'your-actual-klook-affiliate-id' // Replace this
  }
];
```

### **2. Get Affiliate IDs**

**For Eatigo:**
1. Contact Eatigo's partnership team
2. Apply for affiliate program
3. Get your affiliate ID
4. Update the configuration

**For Klook:**
1. Visit [Klook Partner Hub](https://www.klook.com/partner/)
2. Sign up for affiliate program
3. Get your affiliate ID
4. Update the configuration

### **3. Test Deep Links**

Test the integration:
1. Generate a restaurant suggestion
2. Look for "Book This Restaurant" card
3. Tap on booking platform buttons
4. Verify deep links work

## 🎨 **User Experience**

### **Booking Flow:**
1. **User gets restaurant suggestion**
2. **App checks booking availability**
3. **Shows available platforms**
4. **User taps booking button**
5. **Opens platform app or website**
6. **User completes booking on platform**

### **Visual Design:**
- **Platform-specific colors** (Eatigo orange, Klook blue)
- **Horizontal scrolling** for multiple platforms
- **Clear call-to-action** buttons
- **Informative messaging**

## 🔧 **Technical Implementation**

### **Deep Link Structure:**
```
eatigo://restaurant/?affiliate=YOUR_ID&restaurant=NAME&location=LOCATION
klook://activity/?affiliate=YOUR_ID&restaurant=NAME&location=LOCATION
```

### **Web Fallback:**
```
https://eatigo.com/restaurant/?affiliate=YOUR_ID&restaurant=NAME&location=LOCATION
https://klook.com/activity/?affiliate=YOUR_ID&restaurant=NAME&location=LOCATION
```

### **Error Handling:**
- ✅ **Deep link not available** → Web URL fallback
- ✅ **Platform not installed** → Web URL fallback
- ✅ **Network error** → Clear error message
- ✅ **No platforms available** → Informative message

## 📊 **Analytics & Tracking**

### **What to Track:**
- **Booking platform clicks**
- **Successful deep link opens**
- **Web fallback usage**
- **User engagement with booking options**

### **Affiliate Tracking:**
- **Commission tracking** via affiliate IDs
- **Conversion attribution**
- **Revenue reporting**

## 🔄 **Future Enhancements**

### **API Integration (When Available):**
1. **Real-time availability checking**
2. **Direct booking within app**
3. **Payment processing**
4. **Booking confirmation**

### **Additional Platforms:**
- **OpenTable** (global restaurant bookings)
- **Resy** (premium restaurant bookings)
- **Local booking platforms**

### **Advanced Features:**
- **Price comparison** across platforms
- **Availability alerts**
- **Group booking support**
- **Special offers integration**

## 🛠️ **Customization Options**

### **Platform Configuration:**
```typescript
// Add new platforms easily
{
  name: 'OpenTable',
  deepLinkBase: 'opentable://restaurant/',
  webUrlBase: 'https://opentable.com/restaurant/',
  affiliateId: 'your-opentable-affiliate-id'
}
```

### **Availability Logic:**
```typescript
// Customize availability checking
private async checkAvailability(restaurantData: any, platform: BookingPlatform): Promise<boolean> {
  // Add your custom logic here
  // Check location, cuisine, budget, etc.
}
```

### **Styling:**
```typescript
// Customize platform colors and styling
getPlatformStyle(platform: BookingPlatform) {
  // Add your custom styling
}
```

## 🚨 **Troubleshooting**

### **Common Issues:**
1. **Deep links not working**
   - Check if platform apps are installed
   - Verify deep link format
   - Test with web fallback

2. **Affiliate tracking not working**
   - Verify affiliate IDs are correct
   - Check platform's affiliate program status
   - Test with platform's tracking tools

3. **No booking options showing**
   - Check availability logic
   - Verify restaurant data format
   - Test with different restaurants

### **Debug Logs:**
Look for these console messages:
- `🔗 Found booking options: [Eatigo, Klook]`
- `🔗 Opened Eatigo booking via deep link`
- `🌐 Opened Klook booking via web URL`
- `❌ Failed to open booking`

## 📈 **Success Metrics**

### **Key Performance Indicators:**
- **Booking option click rate**
- **Deep link success rate**
- **Affiliate conversion rate**
- **User engagement with booking features**

### **Expected Results:**
- **50-70%** of users see booking options
- **30-50%** of users click booking buttons
- **20-30%** successful deep link opens
- **5-15%** affiliate conversions

## 🎉 **Ready to Launch**

The booking integration is now ready for testing! The implementation provides:

✅ **Immediate functionality** with deep linking  
✅ **Seamless user experience**  
✅ **Revenue potential** via affiliate programs  
✅ **Future-ready** for API integration  
✅ **Easy customization** for new platforms  

Start by testing the current implementation and then reach out to booking platforms for affiliate partnerships! 🚀 