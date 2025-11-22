# Smart Service Ticketing System 🎫

A modern, professional service ticketing system built with Next.js, Firebase, and TypeScript. Features a beautiful gradient UI, real-time updates, and comprehensive customer management.

![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.14-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## ✨ Features

### 🎨 Modern UI
- Beautiful gradient headers throughout
- Glass morphism effects
- Smooth animations and transitions
- Dark/Light mode support
- Fully responsive design
- Professional color scheme

### 🎫 Ticket Management
- Create and track service tickets
- Real-time updates
- SLA tracking and warnings
- Priority levels (Critical, High, Medium, Low)
- Status tracking (Open, In Progress, Pending, Resolved)
- Category and subcategory organization
- Technician assignment
- Activity timeline with immutable logs
- Hardware tracking per ticket

### 👥 Customer Management
- Complete customer database
- Contact management
- Hardware inventory per customer
- Service history
- Tabbed interface for easy navigation
- Customer detail pages
- Contact detail pages

### 🔔 Notifications
- Real-time notification system
- Unread count badges
- Click to navigate
- Mark as read functionality
- Color-coded by type (Ticket, Customer, SLA, System)

### 📊 Analytics & Reporting
- Performance metrics
- Ticket trends
- SLA compliance tracking
- Customer activity reports
- Revenue analysis

### 💰 Billing
- Invoice management
- Payment tracking
- Revenue statistics
- Next billing date reminders

### 📦 Inventory
- Hardware stock management
- Location tracking
- Low stock alerts
- Search functionality

### ⚙️ Settings
- Profile management
- Password updates
- Notification preferences
- Security settings

## 🚀 Tech Stack

- **Framework**: Next.js 16.0.3 with App Router
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner (Toast)

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Git

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Seany5691/Smart-Service.git
   cd Smart-Service/smart-ticketing-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Copy your Firebase config

4. **Configure environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
smart-ticketing-app/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── tickets/              # Tickets pages
│   │   │   ├── customers/            # Customers pages
│   │   │   ├── analytics/            # Analytics page
│   │   │   ├── billing/              # Billing page
│   │   │   ├── inventory/            # Inventory page
│   │   │   ├── reports/              # Reports page
│   │   │   ├── settings/             # Settings page
│   │   │   └── layout.tsx            # Dashboard layout
│   │   ├── login/                    # Login page
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── modals/                   # Modal components
│   │   ├── ui/                       # UI components
│   │   └── NotificationsDropdown.tsx # Notifications
│   ├── contexts/
│   │   └── AuthContext.tsx           # Auth context
│   ├── lib/
│   │   └── firebase/                 # Firebase services
│   └── styles/
│       └── globals.css               # Global styles
├── public/                           # Static files
└── package.json
```

## 🔥 Firebase Collections

### tickets
- ticketId, title, description
- customer, companyId, contactId
- category, subcategory
- priority, status
- assignee, assigneeId
- slaHours, slaDeadline
- hardware (array)
- createdAt, updatedAt

### customers
- companyName, regNumber, vatNumber
- email, telephone, city, address
- contacts (array)
- sites, openTickets, activeContracts
- pbxLink
- createdAt

### hardware
- customerId, hardwareType, hardwareLabel
- nickname, serialNumber, macAddress, ipAddress
- quantity, notes
- addedBy, addedAt

### timeline
- ticketId, type, action, description
- userId, userName, userEmail
- isPublic
- createdAt

### notifications
- userId, title, message
- type (ticket, customer, sla, system)
- read, link
- createdAt

## 🎨 Color Scheme

- **Dashboard**: Blue → Indigo → Purple
- **Tickets**: Indigo → Purple → Pink
- **Customers**: Emerald → Teal → Cyan
- **Analytics**: Violet → Purple → Fuchsia
- **Billing**: Green → Emerald → Teal
- **Inventory**: Orange → Red → Pink
- **Reports**: Cyan → Blue → Indigo
- **Settings**: Slate-700 → Slate-900

## 🔐 Authentication

The app uses Firebase Authentication with email/password. Protected routes automatically redirect to login if not authenticated.

## 📱 Responsive Design

Fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Netlify
- Firebase Hosting
- AWS Amplify

## 📝 Environment Variables

Required variables in `.env.local`:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sean**
- GitHub: [@Seany5691](https://github.com/Seany5691)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for the backend infrastructure
- Shadcn for the beautiful UI components
- Tailwind CSS for the styling system

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

## 🎉 Features Highlights

- ✅ Real-time updates
- ✅ Beautiful modern UI
- ✅ Dark/Light mode
- ✅ Notifications system
- ✅ SLA tracking
- ✅ Customer management
- ✅ Hardware inventory
- ✅ Activity timeline
- ✅ Analytics dashboard
- ✅ Responsive design
- ✅ Professional appearance
- ✅ Production-ready

---

Made with ❤️ using Next.js and Firebase
