# Google Sheets Database Integration Setup Guide

## 🎯 Overview

This guide will help you set up a spreadsheet interface for your Firebase database using Google Sheets. You'll be able to:

- **View your data** in a familiar spreadsheet format
- **Edit data** directly in Google Sheets
- **Sync changes** back to Firebase automatically
- **Collaborate** with team members on data management
- **Export data** for analysis and reporting

## 🚀 Quick Start

### 1. Create Google Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select your existing project
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and click "Create"
   - Click on the service account email
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key" > "JSON"
   - Download the JSON file

### 2. Set Up Environment Variables

Create a `.env` file in your project root:

```bash
# Google Sheets Configuration
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./google-service-account.json
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id_here

# Firebase Configuration (if not already set)
FIREBASE_PROJECT_ID=g--decider-app
```

### 3. Place Service Account Key

1. Rename your downloaded JSON file to `google-service-account.json`
2. Place it in your project root directory
3. **IMPORTANT**: Add this file to your `.gitignore` to keep it secure

```bash
# Add to .gitignore
google-service-account.json
.env
```

### 4. Create Your First Spreadsheet

1. Start your backend server: `npm run start-backend`
2. Open your admin panel
3. Navigate to the "Spreadsheet Manager"
4. Click "Create New Spreadsheet"
5. This will create a new Google Sheets with separate tabs for each collection

## 📊 What Gets Created

Your spreadsheet will have these sheets:

### **Places Sheet**
- `id` - Unique identifier
- `name` - Place name
- `category` - Restaurant, activity, etc.
- `cuisine` - Type of cuisine
- `description` - AI-generated description
- `location.address` - Street address
- `location.city` - City name
- `location.region` - Metro Manila, etc.
- `contact.phone` - Phone number
- `contact.website` - Website URL
- `contact.instagram` - Instagram handle
- `business_info.price_range` - Price range (₱₱, ₱₱₱)
- `discovery.tags` - Comma-separated tags
- `discovery.perfect_for` - Perfect for occasions
- `partnership.monthly_fee` - Monthly partnership fee
- `partnership.active` - Active status
- `analytics.impressions` - View count
- `analytics.swipe_right` - Positive interactions
- `status` - Active/inactive status

### **Users Sheet**
- `id` - User ID
- `email` - Email address
- `preferences` - User preferences
- `subscription` - Subscription details
- `created_at` - Account creation date

### **Analytics Sheet**
- `id` - Analytics record ID
- `user_id` - User identifier
- `action` - User action performed
- `timestamp` - When action occurred
- `metadata` - Additional context

### **Partnerships Sheet**
- `id` - Partnership ID
- `business_name` - Business name
- `contact_person` - Contact person
- `monthly_fee` - Monthly fee amount
- `start_date` - Partnership start date
- `status` - Active/pending/expired

## 🔄 How It Works

### **Data Flow**

```
Firebase Database ←→ Google Sheets API ←→ Google Sheets
       ↑                    ↑                    ↑
   Your App            Your Backend        Your Spreadsheet
```

### **Sync Process**

1. **Firebase → Sheets**: Export your data with proper formatting
2. **Sheets → Firebase**: Import changes and update your database
3. **Real-time Updates**: Changes sync automatically between systems

### **Data Types Handled**

- ✅ **Text**: Names, descriptions, addresses
- ✅ **Numbers**: Prices, fees, analytics
- ✅ **Arrays**: Tags, features (converted to comma-separated)
- ✅ **Objects**: Location, contact info (converted to JSON strings)
- ✅ **Dates**: Timestamps, creation dates
- ✅ **Booleans**: Active status, flags

## 🛠️ API Endpoints

Your backend now provides these endpoints:

### **Sync Data**
```typescript
POST /api/trpc/spreadsheet.syncToSheets
{
  "collection": "places",
  "sheetName": "places"
}
```

### **Get Data**
```typescript
GET /api/trpc/spreadsheet.getFromSheets
{
  "sheetName": "places",
  "range": "places!A:Z"
}
```

### **Update Data**
```typescript
POST /api/trpc/spreadsheet.updateFromSheets
{
  "collection": "places",
  "sheetName": "places"
}
```

### **Create Spreadsheet**
```typescript
POST /api/trpc/spreadsheet.createSpreadsheet
{
  "title": "G-Decider Database",
  "collections": ["places", "users", "analytics", "partnerships"]
}
```

## 📱 Using the Spreadsheet Manager

### **Sync Tab**
- Select which collection to sync
- Export Firebase data to Google Sheets
- Import changes from Google Sheets back to Firebase

### **View Tab**
- See your current spreadsheet configuration
- Open the spreadsheet directly in Google Sheets
- Check available sheets and data

### **Create Tab**
- Generate a new spreadsheet from scratch
- Pre-configure all collections with proper headers
- Set up the complete database structure

## 🔒 Security Considerations

### **Service Account Permissions**
- Only grant necessary permissions to the service account
- Use the principle of least privilege
- Regularly rotate service account keys

### **Data Access**
- Control who has access to your Google Sheets
- Use Google Workspace sharing settings
- Monitor access logs regularly

### **Environment Variables**
- Never commit sensitive keys to version control
- Use different keys for development and production
- Regularly rotate API keys

## 🚨 Troubleshooting

### **Common Issues**

1. **"Service account not found"**
   - Check that `google-service-account.json` exists
   - Verify the file path in your environment variables

2. **"API not enabled"**
   - Ensure Google Sheets API is enabled in Google Cloud Console
   - Check that your service account has the necessary permissions

3. **"Permission denied"**
   - Verify the service account email has access to your spreadsheet
   - Check that the spreadsheet ID is correct

4. **"Data not syncing"**
   - Check your Firebase connection
   - Verify collection names match exactly
   - Check the browser console for error messages

### **Debug Mode**

Enable debug logging by adding to your environment:

```bash
DEBUG=googleapis:*
NODE_ENV=development
```

## 📈 Advanced Features

### **Automated Syncing**
Set up a cron job to sync data automatically:

```typescript
// Sync every hour
setInterval(async () => {
  await syncToSheets({ collection: 'places' });
}, 60 * 60 * 1000);
```

### **Data Validation**
Add validation rules in Google Sheets:
- Data validation for categories
- Required field checks
- Format validation for emails and phone numbers

### **Conditional Formatting**
- Highlight inactive partnerships
- Color-code by price range
- Show trending places

### **Charts and Pivot Tables**
- Create visualizations of your data
- Analyze user behavior patterns
- Track business performance metrics

## 🎉 Next Steps

1. **Test the integration** with a small dataset
2. **Set up regular syncing** for your most important collections
3. **Train your team** on using the spreadsheet interface
4. **Create custom reports** and dashboards
5. **Integrate with other tools** like Google Data Studio

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the Google Sheets API documentation
3. Check your Firebase console for errors
4. Review the backend logs for detailed error messages

---

**Happy Spreadsheet Management! 📊✨**
