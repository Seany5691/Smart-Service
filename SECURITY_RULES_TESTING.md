# Firebase Security Rules Testing Guide

## Overview

This document explains how to test the Firebase Security Rules to ensure they prevent unauthorized access.

## Security Rules Summary

### Users Collection (`/users/{userId}`)
- **Read**: Any authenticated user
- **Create**: Authenticated user can only create their own document
- **Update/Delete**: User can only modify their own document

### User Preferences Collection (`/userPreferences/{userId}`)
- **Read/Write**: User can only access their own preferences document

### Invoices Collection (`/invoices/{invoiceId}`)
- **Read/Write**: Any authenticated user (business requirement)

### Inventory Collection (`/inventory/{itemId}`)
- **Read/Write**: Any authenticated user (business requirement)

### Customers Collection (`/customers/{customerId}`)
- **Read/Write**: Any authenticated user
- **Contacts Subcollection**: Same as parent

### Tickets Collection (`/tickets/{ticketId}`)
- **Read/Write**: Any authenticated user
- **Timeline Subcollection**: Same as parent

### Hardware Collection (`/hardware/{hardwareId}`)
- **Read/Write**: Any authenticated user

### Settings Collection (`/settings/{settingId}`)
- **Read/Write**: Any authenticated user

### Notifications Collection (`/notifications/{notificationId}`)
- **Read/Write**: User can only access notifications where `userId` matches their UID

### Report Downloads Collection (`/reportDownloads/{downloadId}`)
- **Read/Write**: User can only access their own download history

## Deployment Instructions

### 1. Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project (if not already done)

```bash
cd smart-ticketing-app
firebase init
```

Select:
- Firestore: Configure security rules and indexes files
- Use existing project (select your project)
- Use `firestore.rules` for rules file
- Use `firestore.indexes.json` for indexes file

### 4. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 5. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

## Manual Testing Scenarios

### Test 1: Unauthenticated Access (Should Fail)

1. Open browser in incognito mode
2. Try to access Firebase Console and read any collection
3. **Expected**: Access denied

### Test 2: User Profile Access

**Scenario A: Read Own Profile (Should Succeed)**
1. Login as User A
2. Try to read `/users/{userA_uid}`
3. **Expected**: Success

**Scenario B: Read Other User Profile (Should Succeed)**
1. Login as User A
2. Try to read `/users/{userB_uid}`
3. **Expected**: Success (authenticated users can read all user profiles)

**Scenario C: Update Own Profile (Should Succeed)**
1. Login as User A
2. Try to update `/users/{userA_uid}`
3. **Expected**: Success

**Scenario D: Update Other User Profile (Should Fail)**
1. Login as User A
2. Try to update `/users/{userB_uid}`
3. **Expected**: Permission denied

### Test 3: User Preferences Access

**Scenario A: Read Own Preferences (Should Succeed)**
1. Login as User A
2. Try to read `/userPreferences/{userA_uid}`
3. **Expected**: Success

**Scenario B: Read Other User Preferences (Should Fail)**
1. Login as User A
2. Try to read `/userPreferences/{userB_uid}`
3. **Expected**: Permission denied

**Scenario C: Update Other User Preferences (Should Fail)**
1. Login as User A
2. Try to update `/userPreferences/{userB_uid}`
3. **Expected**: Permission denied

### Test 4: Invoices Access

**Scenario A: Read Invoices (Should Succeed)**
1. Login as any authenticated user
2. Try to read any invoice document
3. **Expected**: Success

**Scenario B: Create Invoice (Should Succeed)**
1. Login as any authenticated user
2. Try to create a new invoice
3. **Expected**: Success

### Test 5: Inventory Access

**Scenario A: Read Inventory (Should Succeed)**
1. Login as any authenticated user
2. Try to read any inventory item
3. **Expected**: Success

**Scenario B: Update Inventory (Should Succeed)**
1. Login as any authenticated user
2. Try to update any inventory item
3. **Expected**: Success

### Test 6: Notifications Access

**Scenario A: Read Own Notifications (Should Succeed)**
1. Login as User A
2. Try to read notifications where `userId == userA_uid`
3. **Expected**: Success

**Scenario B: Read Other User Notifications (Should Fail)**
1. Login as User A
2. Try to read notifications where `userId == userB_uid`
3. **Expected**: Permission denied

## Testing with Firebase Emulator (Recommended)

### 1. Install Emulator

```bash
firebase init emulators
```

Select Firestore Emulator

### 2. Start Emulator

```bash
firebase emulators:start
```

### 3. Update Firebase Config for Testing

In your `.env.local` file, add:

```
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

### 4. Run Automated Tests

Create test files in `src/__tests__/security-rules/` to automate testing:

```typescript
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

// Example test structure
describe('Security Rules', () => {
  it('should allow authenticated users to read user profiles', async () => {
    // Test implementation
  });
  
  it('should deny unauthenticated access to users collection', async () => {
    // Test implementation
  });
});
```

## Verification Checklist

- [ ] Rules deployed successfully to Firebase
- [ ] Unauthenticated users cannot access any data
- [ ] Users can read all user profiles (for technician assignment)
- [ ] Users can only update their own profile
- [ ] Users can only access their own preferences
- [ ] Authenticated users can access invoices and inventory
- [ ] Users can only access their own notifications
- [ ] All existing functionality still works after rules deployment

## Troubleshooting

### Issue: Permission Denied Errors in Application

**Solution**: Check that:
1. User is properly authenticated
2. Auth token is being sent with requests
3. Rules are deployed correctly
4. User document exists in Firestore

### Issue: Rules Not Taking Effect

**Solution**:
1. Verify deployment: `firebase deploy --only firestore:rules`
2. Check Firebase Console > Firestore > Rules tab
3. Clear browser cache and reload application
4. Check for syntax errors in rules file

### Issue: Indexes Not Working

**Solution**:
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Wait for indexes to build (can take several minutes)
3. Check Firebase Console > Firestore > Indexes tab

## Security Best Practices

1. **Never expose sensitive data**: Don't store passwords or API keys in Firestore
2. **Validate data**: Add validation rules for required fields and data types
3. **Use server timestamps**: Use `request.time` for timestamps to prevent manipulation
4. **Limit query results**: Implement pagination to prevent large data dumps
5. **Monitor usage**: Set up Firebase alerts for unusual access patterns

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Rules Unit Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Security Rules Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)
