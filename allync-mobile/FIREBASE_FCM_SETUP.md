# Firebase Cloud Messaging (FCM) Setup Guide

This guide walks you through setting up Firebase Cloud Messaging for push notifications in the Allync Mobile app.

## Why Firebase FCM?

- **Production-Ready**: Google's official push notification service
- **Reliability**: 99.95% uptime SLA
- **Scalability**: Handles millions of push notifications
- **Advanced Features**: Analytics, A/B testing, message scheduling
- **No Limits**: Unlike Expo Push (600k/day limit), FCM has no hard limits

## Prerequisites

- Google account
- Expo account (already have: allync-ai)
- EAS CLI installed ✅

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `allync-mobile` (or your preferred name)
4. Enable/Disable Google Analytics (recommended: Enable)
5. Click **"Create project"** (takes ~30 seconds)

## Step 2: Add Android App to Firebase

1. In Firebase Console, click **"Add app"** → Select **Android**
2. Fill in the following details:
   - **Android package name**: `com.allyncai.mobile` ⚠️ MUST MATCH app.json
   - **App nickname**: `Allync Mobile` (optional)
   - **Debug signing certificate SHA-1**: Leave empty for now (optional for development)
3. Click **"Register app"**

## Step 3: Download google-services.json

1. Firebase will provide a `google-services.json` file
2. Click **"Download google-services.json"**
3. Save it to: `E:\allync\dashboard-allync\allync-mobile\google-services.json`
   - ⚠️ IMPORTANT: Place in root directory, NOT in android folder!

## Step 4: Get FCM Server Key (for Backend)

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Select **"Cloud Messaging"** tab
3. Scroll down to **"Cloud Messaging API (Legacy)"**
4. Click **"⋮"** → **"Manage API in Google Cloud Console"**
5. Enable **"Cloud Messaging API"** if not already enabled
6. Go back to Firebase → **"Cloud Messaging"** tab
7. Copy the **"Server key"** (starts with `AAAA...`)
   - This will be used in backend `.env` file

## Step 5: Update Mobile App Configuration

### A. Update `app.json`

Add Firebase plugin configuration:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "permissions": [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "POST_NOTIFICATIONS"
      ]
    },
    "plugins": [
      "expo-router",
      "expo-secure-store",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#3B82F6",
          "sounds": ["./assets/sounds/notification.wav"],
          "mode": "production"
        }
      ]
    ]
  }
}
```

### B. No Code Changes Needed!

The mobile app code already supports FCM through Expo Notifications API. The `expo-notifications` package handles FCM integration automatically.

## Step 6: Update Backend Configuration

### A. Add FCM Server Key to .env

```bash
# .env or .env.local
EXPO_ACCESS_TOKEN=your-expo-access-token
FCM_SERVER_KEY=AAAA...your-fcm-server-key...
```

### B. Update pushNotificationService.ts (Optional)

If you want to use FCM directly instead of Expo Push Service, you can add FCM integration. However, Expo's unified API is recommended for simplicity.

## Step 7: Enable Firebase Cloud Messaging API (Important!)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **"APIs & Services"** → **"Library"**
4. Search for **"Firebase Cloud Messaging API"**
5. Click **"Enable"** if not already enabled
6. Search for **"Cloud Messaging"** (the newer API)
7. Click **"Enable"** if not already enabled

## Step 8: Rebuild with EAS

Now that Firebase is configured, rebuild the app:

```bash
cd E:\allync\dashboard-allync\allync-mobile
npx eas build --profile development --platform android
```

This will:
- Include `google-services.json` in the build
- Configure FCM in the native Android app
- Generate a new APK with FCM enabled

Build time: ~15-20 minutes

## Step 9: Install and Test

1. Download the new APK from EAS build link
2. Install on physical Android device
3. Open app and login
4. Grant notification permissions
5. Check console logs for push token:
   ```
   ✅ Push token: ExponentPushToken[xxxxxxxxxxxxx]
   ```
6. Send test notification from web dashboard
7. Verify notification appears in system tray! 🎉

## Step 10: Verify Token in Supabase

```sql
SELECT
  id,
  full_name,
  email,
  push_token,
  push_enabled,
  push_platform
FROM profiles
WHERE push_token IS NOT NULL;
```

## Troubleshooting

### Issue: "Default FirebaseApp is not initialized"
**Solution**: Make sure `google-services.json` is in the root directory and rebuild with EAS.

### Issue: "No push token generated"
**Solution**:
1. Check if FCM API is enabled in Google Cloud Console
2. Verify `google-services.json` package name matches `app.json`
3. Test on physical device (not emulator)

### Issue: "Notifications not received"
**Solution**:
1. Check if push_token is saved in Supabase profiles table
2. Verify backend pushNotificationService is running
3. Check push_notifications_log table for errors
4. Ensure app has notification permissions enabled

## Production Checklist

Before publishing to Google Play Store:

- [ ] Firebase project created
- [ ] google-services.json added to project
- [ ] FCM API enabled in Google Cloud Console
- [ ] App signed with production keystore
- [ ] Tested on multiple physical devices
- [ ] Backend .env has FCM_SERVER_KEY
- [ ] Push notifications tested end-to-end
- [ ] Error logging monitored in Supabase

## Security Notes

⚠️ **IMPORTANT**:
- Add `google-services.json` to `.gitignore` (it's already added)
- Never commit FCM Server Key to git
- Store FCM_SERVER_KEY securely in environment variables
- Use different Firebase projects for development and production

## Architecture Overview

```
Mobile App (React Native + Expo)
  ↓ (registers device)
Firebase Cloud Messaging (FCM)
  ↓ (provides push token)
Supabase (stores token in profiles table)
  ↓ (notifications created)
Backend API (Node.js)
  ↓ (sends via Expo SDK)
Expo Push Notification Service
  ↓ (routes to FCM)
FCM delivers to device
  ↓
User's Android device 🔔
```

## Benefits of This Setup

✅ **Unified API**: One codebase works for both iOS and Android
✅ **Expo Managed**: Expo handles FCM complexities
✅ **Production Ready**: Google's infrastructure
✅ **Scalable**: No message limits
✅ **Analytics**: Firebase provides rich analytics
✅ **Future Proof**: Easy to add advanced features later

---

**Ready to begin?** Follow Step 1 above! 🚀
