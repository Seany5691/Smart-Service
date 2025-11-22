# User Profile Integration Testing

## Overview
The AuthContext has been updated to automatically create or update user profiles in Firestore when users log in.

## What Was Implemented

### 1. AuthContext Integration
- Modified `src/contexts/AuthContext.tsx` to call `userService.createOrUpdateUser()` when a user logs in
- The integration happens automatically in the `onAuthChange` callback
- User profiles are created/updated in the `users` collection
- Default preferences are created in the `userPreferences` collection

### 2. User Profile Structure
When a user logs in, the following document is created in the `users` collection:

```typescript
{
  uid: string,              // Firebase Auth UID
  email: string,            // User's email
  displayName: string | null, // User's display name
  role: 'technician',       // Default role (can be 'admin', 'technician', or 'viewer')
  isActive: true,           // User is active by default
  createdAt: Timestamp,     // When the profile was created
  updatedAt: Timestamp      // When the profile was last updated
}
```

### 3. User Preferences Structure
Default preferences are created in the `userPreferences` collection:

```typescript
{
  userId: string,
  notifications: {
    email: true,
    push: true,
    sms: false,
    weekly: true
  },
  theme: 'system',
  updatedAt: Timestamp
}
```

## How to Test

### Method 1: Using the Test Firebase Page

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   - Open your browser and go to `http://localhost:3000/test-firebase`

3. **Log in if not already logged in:**
   - Go to `http://localhost:3000/login`
   - Sign in with your credentials
   - Return to the test page

4. **Run the diagnostics:**
   - Click the "Run Tests" button
   - Look for the "User Profile Verification" test result
   - It should show "success" with details about your user profile

5. **Verify the structure:**
   - The test will check that all required fields are present:
     - uid
     - email
     - role
     - isActive
     - createdAt
     - updatedAt

### Method 2: Using Firebase Console

1. **Open Firebase Console:**
   - Go to https://console.firebase.google.com
   - Select your project

2. **Navigate to Firestore:**
   - Click on "Firestore Database" in the left sidebar

3. **Check the users collection:**
   - Look for a collection named `users`
   - Find your user document (the document ID should match your Firebase Auth UID)
   - Verify all fields are present and correct

4. **Check the userPreferences collection:**
   - Look for a collection named `userPreferences`
   - Find your preferences document (the document ID should match your Firebase Auth UID)
   - Verify the default preferences are set correctly

### Method 3: Manual Testing Flow

1. **Clear existing user data (optional):**
   - In Firebase Console, delete your user document from the `users` collection
   - Delete your preferences document from the `userPreferences` collection

2. **Log out and log back in:**
   - Go to your app and log out
   - Log back in with your credentials

3. **Verify automatic creation:**
   - Check Firebase Console to see that your user profile was automatically recreated
   - Check that preferences were also created

## Expected Behavior

### On First Login
- A new document is created in the `users` collection with your UID as the document ID
- A new document is created in the `userPreferences` collection with your UID as the document ID
- Default values are set for role ('technician') and isActive (true)
- Timestamps are set for createdAt and updatedAt

### On Subsequent Logins
- The existing user document is updated with the latest email and displayName from Firebase Auth
- The updatedAt timestamp is refreshed
- No duplicate documents are created

### Error Handling
- If user profile creation fails, an error is logged to the console
- The user can still use the app (authentication is not blocked)
- The profile will be created on the next login attempt

## Troubleshooting

### User Profile Not Created
1. Check Firebase Console for any error messages
2. Verify Firestore security rules allow authenticated users to write to the `users` collection
3. Check browser console for any error messages
4. Try logging out and logging back in

### Missing Fields
1. Verify that the `userService.createOrUpdateUser()` function is being called
2. Check that Firebase Auth is providing the expected user data
3. Review the console logs for any errors during profile creation

### Preferences Not Created
1. Check that the `createDefaultPreferences()` function is being called
2. Verify Firestore security rules allow writing to the `userPreferences` collection
3. Check browser console for errors

## Security Rules

Ensure your Firestore security rules allow authenticated users to create and update their profiles:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    match /userPreferences/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Next Steps

After verifying that user profiles are created correctly:
1. Task 4 will update ticket assignment to use real users from the `users` collection
2. Task 5 will implement ticket filtering based on user assignments
3. Task 6 will update the dashboard to show "My Open Tickets" for the current user
