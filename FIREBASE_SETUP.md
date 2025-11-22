# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard:
   - Enter project name: "Smart Service Ticketing"
   - Enable Google Analytics (optional)
   - Click "Create project"

## Step 2: Register Web App

1. In your Firebase project, click the **Web icon** (</>) to add a web app
2. Register app:
   - App nickname: "Smart Service Web"
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
3. **Copy the Firebase configuration** - you'll need this!

## Step 3: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Click "Sign-in method" tab
4. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Click "Save"

## Step 4: Create Firestore Database

1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
   - Location: Choose closest to you
   - Click "Enable"

**Important**: Test mode rules expire in 30 days. Update rules for production!

## Step 5: Enable Storage

1. Go to **Build > Storage**
2. Click "Get started"
3. Choose **Start in test mode**
4. Click "Done"

## Step 6: Configure Your App

1. Open `src/lib/firebase/config.ts`
2. Replace the placeholder values with your Firebase config:

```typescript
export const firebaseConfig = {
  apiKey: "AIza...",              // From Firebase Console
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

## Step 7: Set Firestore Security Rules (Production)

Go to Firestore > Rules and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tickets
    match /tickets/{ticketId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Customers
    match /customers/{customerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Invoices
    match /invoices/{invoiceId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Inventory
    match /inventory/{itemId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 8: Set Storage Security Rules (Production)

Go to Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024; // 5MB limit
    }
  }
}
```

## Step 9: Create First User

1. Go to **Authentication > Users**
2. Click "Add user"
3. Enter:
   - Email: admin@example.com
   - Password: (choose a secure password)
4. Click "Add user"

## Step 10: Test Your App

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. Try creating a ticket:
   - Click "New Ticket"
   - Fill in the form
   - Click "Create Ticket"
   - Check Firestore Console to see the data!

## Troubleshooting

### Error: "Firebase: Error (auth/configuration-not-found)"
- Make sure you've updated `src/lib/firebase/config.ts` with your actual Firebase config

### Error: "Missing or insufficient permissions"
- Check Firestore security rules
- Make sure you're authenticated
- In development, use test mode rules

### Tickets not appearing
- Check browser console for errors
- Verify Firestore database is created
- Check that collections are being created (they appear after first write)

## What's Working Now

✅ **Create Tickets** - New Ticket button opens modal, saves to Firebase  
✅ **View Tickets** - Kanban and List views load from Firebase  
✅ **Real-time Data** - All data comes from Firestore  
✅ **Search** - Filter tickets in real-time  
✅ **View Modes** - Switch between Kanban and List views  

## Next Steps to Implement

1. **Authentication** - Login/logout functionality
2. **Edit Tickets** - Update existing tickets
3. **Delete Tickets** - Remove tickets
4. **Customer Management** - CRUD for customers
5. **Invoice Generation** - Create and manage invoices
6. **File Uploads** - Attach files to tickets using Firebase Storage
7. **Reports** - Generate PDF reports from data

## Cost Estimate

Firebase Free Tier (Spark Plan):
- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Storage**: 5GB stored, 1GB/day downloads
- **Authentication**: Unlimited users

This is more than enough for development and small production use!

## Support

If you encounter issues:
1. Check Firebase Console for errors
2. Check browser developer console
3. Verify all Firebase services are enabled
4. Ensure security rules allow your operations
