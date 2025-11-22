# Firebase Security Rules Implementation

## Overview

This document describes the Firebase Security Rules implementation for the Smart Ticketing App. The rules ensure proper access control and data security across all Firestore collections.

## Files Created

1. **firestore.rules** - Security rules for all collections
2. **firebase.json** - Firebase project configuration
3. **firestore.indexes.json** - Database indexes for optimized queries
4. **SECURITY_RULES_TESTING.md** - Comprehensive testing guide
5. **deploy-rules.md** - Quick deployment guide

## Security Rules Summary

### Collection Access Matrix

| Collection | Read | Create | Update | Delete | Notes |
|------------|------|--------|--------|--------|-------|
| users | Authenticated | Own document | Own document | Own document | All users can read profiles for assignment |
| userPreferences | Own document | Own document | Own document | Own document | Private preferences |
| invoices | Authenticated | Authenticated | Authenticated | Authenticated | Business data access |
| inventory | Authenticated | Authenticated | Authenticated | Authenticated | Business data access |
| customers | Authenticated | Authenticated | Authenticated | Authenticated | Business data access |
| tickets | Authenticated | Authenticated | Authenticated | Authenticated | Business data access |
| hardware | Authenticated | Authenticated | Authenticated | Authenticated | Business data access |
| settings | Authenticated | Authenticated | Authenticated | Authenticated | System configuration |
| notifications | Own documents | Authenticated | Own documents | Own documents | User-specific notifications |
| reportDownloads | Own documents | Own documents | Own documents | Own documents | User download history |

## Key Security Features

### 1. Authentication Required

All operations require authentication. Unauthenticated users cannot access any data.

```javascript
function isAuthenticated() {
  return request.auth != null;
}
```

### 2. User Profile Protection

Users can read all profiles (needed for technician assignment) but can only modify their own:

```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && isOwner(userId);
  allow update, delete: if isAuthenticated() && isOwner(userId);
}
```

### 3. Private User Preferences

User preferences are completely private - users can only access their own:

```javascript
match /userPreferences/{userId} {
  allow read, write: if isAuthenticated() && isOwner(userId);
}
```

### 4. Business Data Access

Invoices, inventory, customers, tickets, and hardware are accessible to all authenticated users (business requirement):

```javascript
match /invoices/{invoiceId} {
  allow read: if isAuthenticated();
  allow create, update, delete: if isAuthenticated();
}
```

### 5. User-Specific Data

Notifications and report downloads are filtered by userId:

```javascript
match /notifications/{notificationId} {
  allow read: if isAuthenticated() && 
                 resource.data.userId == request.auth.uid;
  allow create: if isAuthenticated();
  allow update, delete: if isAuthenticated() && 
                           resource.data.userId == request.auth.uid;
}
```

## Database Indexes

The following indexes are configured for optimal query performance:

### 1. Users Index
- Fields: `isActive` (ASC), `role` (ASC)
- Purpose: Efficiently query active users by role for technician assignment

### 2. Invoices Index
- Fields: `status` (ASC), `issueDate` (DESC)
- Purpose: Filter invoices by status and sort by date

### 3. Inventory Index
- Fields: `status` (ASC), `quantity` (ASC)
- Purpose: Find low stock items efficiently

### 4. Tickets Index
- Fields: `assigneeId` (ASC), `status` (ASC), `createdAt` (DESC)
- Purpose: Support "My Open Tickets" filter and other ticket queries

### 5. Notifications Index
- Fields: `userId` (ASC), `read` (ASC), `createdAt` (DESC)
- Purpose: Efficiently query unread notifications for a user

## Deployment Steps

### Step 1: Initialize Firebase (First Time Only)

If you haven't initialized Firebase in this project:

```bash
cd smart-ticketing-app
firebase login
firebase init
```

Select:
- Firestore
- Use existing project
- Accept default file names (firestore.rules and firestore.indexes.json)

### Step 2: Deploy Rules

```bash
firebase deploy --only firestore:rules
```

Expected output:
```
✔ Deploy complete!
```

### Step 3: Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

Expected output:
```
✔ Deploy complete!
```

Note: Indexes may take 5-10 minutes to build.

### Step 4: Verify Deployment

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Firestore Database > Rules
4. Verify the rules show the latest timestamp
5. Go to Firestore Database > Indexes
6. Verify all indexes are "Enabled" (may show "Building" initially)

## Testing the Rules

### Automated Testing (Recommended)

Use Firebase Emulator for local testing:

```bash
# Install emulator
firebase init emulators

# Start emulator
firebase emulators:start

# Run tests (if you create test files)
npm test
```

### Manual Testing

Follow the test scenarios in `SECURITY_RULES_TESTING.md`:

1. Test unauthenticated access (should fail)
2. Test user profile access (read all, write own)
3. Test user preferences (own only)
4. Test business data access (all authenticated)
5. Test notifications (own only)

### Quick Verification in Application

After deployment, test these features:

1. ✅ Login and view dashboard
2. ✅ View "My Open Tickets"
3. ✅ Create/edit tickets with user assignment
4. ✅ Update profile in Settings
5. ✅ Change notification preferences
6. ✅ Create invoices
7. ✅ Manage inventory
8. ✅ Generate reports
9. ✅ View analytics

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 1.1**: Users collection with proper access control
- **Requirement 6.5**: User preferences with privacy protection
- **Requirement 6.9**: Profile updates with security

### Specific Task Requirements

- ✅ Security rules for users collection (read: authenticated, write: own document)
- ✅ Security rules for userPreferences collection (read/write: own document)
- ✅ Security rules for invoices collection (read/write: authenticated)
- ✅ Security rules for inventory collection (read/write: authenticated)
- ✅ Testing documentation to verify rules prevent unauthorized access

## Security Considerations

### What's Protected

1. **User Profiles**: Users can only modify their own profile
2. **User Preferences**: Completely private to each user
3. **Notifications**: Users only see their own notifications
4. **Report Downloads**: Users only see their own download history
5. **Unauthenticated Access**: Completely blocked

### What's Shared

1. **User Profiles (Read)**: All authenticated users can read profiles (needed for technician assignment)
2. **Business Data**: Invoices, inventory, customers, tickets, hardware are accessible to all authenticated users (business requirement)

### Future Enhancements

Consider adding:

1. **Role-based access**: Admin vs Technician vs Viewer roles
2. **Data validation**: Validate field types and required fields
3. **Rate limiting**: Prevent abuse with request limits
4. **Audit logging**: Track who modified what and when

## Troubleshooting

### Issue: "Permission Denied" in Application

**Cause**: Rules are too restrictive or user not authenticated

**Solution**:
1. Check user is logged in
2. Verify user document exists in `/users/{uid}`
3. Check browser console for specific error
4. Verify rules deployed correctly

### Issue: "Missing Index" Error

**Cause**: Query requires an index that hasn't been created

**Solution**:
1. Deploy indexes: `firebase deploy --only firestore:indexes`
2. Wait for indexes to build (5-10 minutes)
3. Check Firebase Console > Indexes tab

### Issue: Rules Not Taking Effect

**Cause**: Rules not deployed or cached

**Solution**:
1. Redeploy: `firebase deploy --only firestore:rules`
2. Clear browser cache
3. Check Firebase Console for deployment timestamp
4. Wait 1-2 minutes for propagation

### Issue: Application Stopped Working After Deployment

**Cause**: Rules too restrictive for existing functionality

**Solution**:
1. Check browser console for specific errors
2. Rollback rules in Firebase Console (Rules > History)
3. Review and adjust rules
4. Redeploy

## Monitoring and Maintenance

### Regular Checks

1. **Monitor Firebase Console**: Check for permission denied errors
2. **Review Access Patterns**: Ensure rules match application needs
3. **Update Indexes**: Add new indexes as queries evolve
4. **Audit Rules**: Periodically review for security improvements

### Performance Monitoring

1. Check query performance in Firebase Console
2. Ensure indexes are being used
3. Monitor read/write operations
4. Optimize rules for frequently accessed data

## Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Security Rules Reference](https://firebase.google.com/docs/reference/rules)
- [Testing Security Rules](https://firebase.google.com/docs/rules/unit-tests)
- [Best Practices](https://firebase.google.com/docs/firestore/security/rules-conditions)

## Support

For issues or questions:

1. Check `SECURITY_RULES_TESTING.md` for testing guidance
2. Review `deploy-rules.md` for deployment help
3. Check Firebase Console for error messages
4. Review browser console for client-side errors
