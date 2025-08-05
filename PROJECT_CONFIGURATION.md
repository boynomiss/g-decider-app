# 🏗️ Project Configuration Guide

## 📋 **Overview**

This guide provides clear documentation for the G-Decider App project configuration to prevent confusion and ensure consistent usage across all services.

## 🎯 **Project ID Mapping**

### **Primary Project: `g-decider-backend`**
- **Purpose**: Backend services, Firebase Functions, AI APIs
- **Services**: All server-side operations
- **APIs**: Natural Language, Gemini, Firebase Functions
- **Service Accounts**: All backend service accounts
- **Region**: `asia-southeast1` (optimized for Asia-Pacific)

### **Legacy Project: `g-decider-app-31jqvnsg`**
- **Status**: ❌ **DEPRECATED** - No longer used
- **Access**: Permission denied
- **Reason**: Migrated to `g-decider-backend`

## 🔧 **Service Account Configuration**

### **1. NLP Sentiment Analyst**
- **Email**: `nlp-sentiment-analyst@g-decider-backend.iam.gserviceaccount.com`
- **Project**: `g-decider-backend`
- **Purpose**: Natural Language API access
- **IAM Roles**: `roles/aiplatform.user`
- **Key File**: `functions/nlp-service-account.json`

### **2. Gemini AI Client**
- **Email**: `gemini-api-client@g-decider-backend.iam.gserviceaccount.com`
- **Project**: `g-decider-backend`
- **Purpose**: Gemini API access for AI features
- **IAM Roles**: `roles/aiplatform.user`, `roles/geminicloudassist.user`
- **Key File**: `functions/gemini-api-client-key.json`

### **3. Firebase Admin SDK**
- **Email**: `firebase-adminsdk-fbsvc@g-decider-backend.iam.gserviceaccount.com`
- **Project**: `g-decider-backend`
- **Purpose**: Firebase Functions default service account
- **IAM Roles**: `roles/firebase.sdkAdminServiceAgent`, `roles/iam.serviceAccountTokenCreator`
- **Key File**: `firebase-adminsdk.json`

## 🗺️ **API Configuration**

### **Google Places API (New)**
- **API Key**: `AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk`
- **Project**: `g-decider-backend`
- **Status**: ✅ **WORKING**
- **Endpoint**: `https://places.googleapis.com/v1/places:searchNearby`
- **Type**: New Places API (not legacy)

### **Google Cloud Natural Language API**
- **Project**: `g-decider-backend`
- **Service Account**: `nlp-sentiment-analyst@g-decider-backend.iam.gserviceaccount.com`
- **Status**: ✅ **WORKING**
- **Functions**: `analyzeSentiment`, `analyzeEntities`, `analyzeText`
- **Region**: `asia-southeast1`

### **Google Gemini API**
- **Project**: `g-decider-backend`
- **Service Account**: `gemini-api-client@g-decider-backend.iam.gserviceaccount.com`
- **Status**: ✅ **WORKING**
- **Functions**: `testGeminiAccess`, `generatePlaceDescription`, `analyzeMoodAndSuggest`
- **Region**: `asia-southeast1`

## 🚀 **Deployment Commands**

### **Firebase Functions**
```bash
# Deploy all functions
firebase deploy --only functions --project=g-decider-backend

# Deploy specific function
firebase deploy --only functions:functionName --project=g-decider-backend

# List deployed functions
firebase functions:list --project=g-decider-backend
```

### **Google Cloud Operations**
```bash
# Set project for all operations
gcloud config set project g-decider-backend

# Check current project
gcloud config get-value project

# List service accounts
gcloud iam service-accounts list --project=g-decider-backend

# Check API keys
gcloud services api-keys list --project=g-decider-backend
```

## 🔍 **Common Operations by Project**

| Operation | Use Project ID | Command Example |
|-----------|----------------|-----------------|
| **Firebase Functions** | `g-decider-backend` | `firebase deploy --project=g-decider-backend` |
| **Gemini API** | `g-decider-backend` | `gcloud ai ... --project=g-decider-backend` |
| **NLP API** | `g-decider-backend` | `gcloud language ... --project=g-decider-backend` |
| **Places API** | `g-decider-backend` | Uses API key from `g-decider-backend` |
| **Cleanup Policies** | `g-decider-backend` | `gcloud artifacts ... --project=g-decider-backend` |
| **Service Accounts** | `g-decider-backend` | `gcloud iam ... --project=g-decider-backend` |

## ⚠️ **Common Mistakes to Avoid**

### **❌ Don't Use Old Project ID**
```bash
# WRONG - Will cause permission errors
gcloud artifacts repositories describe gcf-artifacts --project=g-decider-app-31jqvnsg

# CORRECT - Use current project
gcloud artifacts repositories describe gcf-artifacts --project=g-decider-backend
```

### **❌ Don't Mix Project References**
```bash
# WRONG - Inconsistent project usage
firebase deploy --project=g-decider-backend
gcloud artifacts ... --project=g-decider-app-31jqvnsg

# CORRECT - Consistent project usage
firebase deploy --project=g-decider-backend
gcloud artifacts ... --project=g-decider-backend
```

## 🔧 **Environment Variables**

### **Frontend (.env)**
```env
# Google Places API (uses key from g-decider-backend project)
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyA0sLEk4pjKM4H4zNEEFHaMxnzUcEVGfhk

# Google Cloud Project (for reference)
GOOGLE_CLOUD_PROJECT_ID=g-decider-backend
```

### **Backend (Firebase Functions)**
```env
# Service account credentials
GOOGLE_APPLICATION_CREDENTIALS=./nlp-service-account.json
GOOGLE_APPLICATION_CREDENTIALS=./gemini-api-client-key.json
```

## 📊 **Verification Commands**

### **Check Project Configuration**
```bash
# Verify current project
gcloud config get-value project

# List all projects
gcloud projects list

# Check service accounts
gcloud iam service-accounts list --project=g-decider-backend
```

### **Test API Access**
```bash
# Test Places API
node api-test-direct.js

# Test NLP Functions
node test-nlp-service.js

# Test Gemini Functions
node test-gemini-functions.js
```

### **Check Firebase Functions**
```bash
# List deployed functions
firebase functions:list --project=g-decider-backend

# Check function logs
firebase functions:log --project=g-decider-backend
```

## 🎯 **Quick Reference**

### **Always Use:**
- **Project ID**: `g-decider-backend`
- **Region**: `asia-southeast1` (optimized for Asia-Pacific)
- **Runtime**: `nodejs18`

### **Key Files:**
- **Firebase Config**: `firebase.json`
- **Environment**: `.env`
- **Service Accounts**: `functions/*.json`, `firebase-adminsdk.json`

### **Important URLs:**
- **Google Cloud Console**: https://console.cloud.google.com/home/dashboard?project=g-decider-backend
- **Firebase Console**: https://console.firebase.google.com/project/g-decider-backend
- **API Library**: https://console.cloud.google.com/apis/library?project=g-decider-backend

## ✅ **Success Indicators**

When everything is configured correctly, you should see:

1. **✅ All Firebase Functions deployed** (11 functions in `asia-southeast1`)
2. **✅ All service accounts enabled** (3 service accounts)
3. **✅ All APIs working** (Places, NLP, Gemini)
4. **✅ No permission errors** in any operations
5. **✅ Consistent project ID usage** across all commands
6. **✅ Optimized region** for Asia-Pacific users

## 🚨 **Troubleshooting**

### **Permission Denied Errors**
- **Cause**: Using wrong project ID
- **Solution**: Always use `g-decider-backend`

### **API Not Enabled Errors**
- **Cause**: API not enabled in correct project
- **Solution**: Enable in `g-decider-backend` project

### **Service Account Not Found**
- **Cause**: Using old project reference
- **Solution**: Use `@g-decider-backend.iam.gserviceaccount.com`

### **Function URL Errors**
- **Cause**: Using old region URLs
- **Solution**: Use `asia-southeast1` region URLs

---

**Remember**: Always use `g-decider-backend` for all operations and `asia-southeast1` region for optimal performance in Asia-Pacific! 🎯 