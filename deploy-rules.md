# Quick Deploy Guide for Firebase Security Rules

## Prerequisites

1. Firebase CLI installed: `npm install -g firebase-tools`
2. Logged in to Firebase: `firebase login`
3. Project configured: `.firebaserc` file created with project ID `smart-service-b1537`

## First Time Setup

If you haven't logged in to Firebase CLI yet:

```bash
firebase login
```

This will open a browser window for authentication.

## Deploy Commands

### Deploy Security Rules Only

```bash
cd smart-ticketing-app
firebase deploy --only firestore:rules
```

### Deploy Indexes Only

```bash
firebase deploy --only firestore:indexes
```

### Deploy Both Rules and Indexes

```bash
firebase deploy --only firestore
```

## Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database > Rules
4. Verify the rules are updated with the latest timestamp

## Test in Application

After deploying rules, test the following in your application:

1. **Login** - Ensure users can still authenticate
2. **View Dashboard** - Check "My Open Tickets" loads correctly
3. **View Tickets** - Verify ticket filtering works
4. **Create Ticket** - Test ticket creation with user assignment
5. **Update Profile** - Test profile updates in Settings
6. **View Analytics** - Ensure analytics data loads
7. **Create Invoice** - Test invoice creation
8. **Manage Inventory** - Test inventory operations
9. **Generate Reports** - Test report generation

## Rollback (if needed)

If rules cause issues, you can rollback in Firebase Console:

1. Go to Firestore Database > Rules
2. Click on "Rules History"
3. Select a previous version
4. Click "Publish"

## Common Issues

### "Permission Denied" Errors

- Verify user is authenticated
- Check that the user document exists in `/users/{uid}`
- Ensure rules are deployed correctly

### "Missing Index" Errors

- Deploy indexes: `firebase deploy --only firestore:indexes`
- Wait for indexes to build (check Firebase Console)
- Indexes can take 5-10 minutes to become active

## Next Steps

After successful deployment:

1. Monitor Firebase Console for any permission errors
2. Test all major features in the application
3. Check browser console for any Firebase errors
4. Verify that unauthorized access is properly blocked
