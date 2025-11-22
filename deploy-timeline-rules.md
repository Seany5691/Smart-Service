# Deploy Timeline Rules - Quick Fix

## Issue
Firebase permission error: "Missing or insufficient permissions" when accessing timeline collection.

## Cause
The timeline collection rules were missing from Firestore security rules.

## Fix Applied
Added timeline collection rules to `firestore.rules`:

```javascript
// Timeline collection (top-level) - read/write: authenticated users
match /timeline/{timelineId} {
  allow read: if isAuthenticated();
  allow create, update, delete: if isAuthenticated();
}
```

## Deploy Now

### Option 1: Firebase Console (Quickest)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the entire content from `firestore.rules` file
5. Paste into the console editor
6. Click **Publish**
7. ✅ Rules deployed instantly!

### Option 2: Firebase CLI
```bash
cd smart-ticketing-app
firebase deploy --only firestore:rules
```

## Verify Fix

After deploying, refresh your app and check:
- [ ] No more permission errors in console
- [ ] Timeline loads correctly
- [ ] Can add notes to tickets
- [ ] Can change progress status
- [ ] Can close/reopen tickets

## What This Rule Does

Allows all authenticated users to:
- ✅ Read timeline entries
- ✅ Create timeline entries
- ✅ Update timeline entries
- ✅ Delete timeline entries

This is appropriate for your internal ticketing system where all authenticated users are your team members.

## Security Note

The rule `isAuthenticated()` ensures only logged-in users can access timeline data. This is secure for your use case since:
- Only your team has accounts
- All team members need to see ticket history
- Timeline provides audit trail for accountability

---

**Deploy these rules now to fix the permission error!**
