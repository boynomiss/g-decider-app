# 🔧 Spreadsheet Creation Error - Troubleshooting Guide

## 🚨 **Error: "Unknown error when creating a new spreadsheet"**

### **Root Cause Identified**
The error is actually a **permission error (403)** - your service account lacks the necessary Google Cloud permissions to create spreadsheets.

---

## 🛠️ **Solution 1: Fix Service Account Permissions (Recommended)**

### **Step 1: Enable Google Sheets API**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: `g--decider-app`
3. Navigate to **APIs & Services** > **Library**
4. Search for "Google Sheets API"
5. Click **Enable** if not already enabled

### **Step 2: Grant Service Account Permissions**
1. Go to **IAM & Admin** > **IAM**
2. Find your service account: `places-sheets-sync@g--decider-app.iam.gserviceaccount.com`
3. Click the **pencil icon** to edit permissions
4. Add these roles:
   - **Editor** (for general project access)
   - **Service Account Token Creator** (for OAuth token creation)
   - **Google Sheets API User** (if available)

### **Step 3: Verify Service Account Key**
- Ensure `google-service-account.json` is in your project root
- Check that the file has the correct permissions
- Verify the service account email matches your IAM configuration

---

## 🚀 **Solution 2: Use OAuth Authentication (Easier)**

Since you already have OAuth configured, you can bypass the service account issue:

### **Step 1: Use the OAuth Endpoint**
The frontend now automatically uses the OAuth endpoint (`/create-spreadsheet-oauth`) which doesn't require service account permissions.

### **Step 2: Re-authenticate if Needed**
1. Go to your admin panel
2. Click "Sign in with Google"
3. Grant the necessary permissions:
   - Google Sheets access
   - Google Drive file access

### **Step 3: Test Spreadsheet Creation**
1. Navigate to "Spreadsheet Manager"
2. Click "Create New Spreadsheet"
3. The OAuth flow will handle authentication automatically

---

## 🔍 **Debugging Steps**

### **Test Environment Variables**
```bash
curl http://localhost:3000/test-env
```

### **Test Service Account Endpoint**
```bash
curl -X POST http://localhost:3000/create-spreadsheet \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","collections":["places"]}'
```

### **Test OAuth Endpoint**
```bash
curl -X POST http://localhost:3000/create-spreadsheet-oauth \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","collections":["places"],"accessToken":"YOUR_TOKEN"}'
```

---

## 📋 **Required Environment Variables**

Ensure these are set in your `.env` file:

```bash
# Google OAuth Configuration
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/auth/callback

# Google Service Account (for service account method)
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./google-service-account.json

# Firebase Configuration
FIREBASE_PROJECT_ID=g--decider-app
```

---

## 🎯 **Quick Fix Summary**

1. **Use OAuth method** (easiest) - already configured in your app
2. **Fix service account permissions** (more secure) - requires Google Cloud Console access
3. **Verify API enablement** - ensure Google Sheets API is enabled
4. **Check environment variables** - ensure all required vars are set

---

## 📞 **Still Having Issues?**

If you continue to experience problems:

1. Check the browser console for detailed error messages
2. Verify your Google Cloud project has billing enabled
3. Ensure you're using the correct Google account
4. Try creating a new service account with full permissions

---

**Happy Spreadsheet Creating! 📊✨**
