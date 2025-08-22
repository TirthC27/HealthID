# Health Record Portal

A fullstack Next.js 14 application for centralized healthcare management with patient and doctor dashboards.

## Features

### 🏥 Two Role-Based Dashboards
- **Patient Dashboard**: Manage health records, generate QR codes, control data access
- **Doctor Dashboard**: Access patient records, write prescriptions, scan QR codes

### 🔐 Authentication & Security
- Separate registration/login for patients and doctors
- Session management with localStorage
- Consent-based access control
- Comprehensive audit logging

### 📱 QR Code Integration
- Patients can generate time-limited QR codes for secure data sharing
- Doctors can scan QR codes or enter HCID manually
- Automatic token verification and expiration

### 📊 Data Management
- Health records management for patients
- Prescription writing for doctors
- Consent management and approval flow
- Activity audit trails

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom light yellow theme
- **Icons**: Lucide React
- **Data Storage**: localStorage (mock database)
- **QR Codes**: Custom SVG generation
- **Authentication**: Custom JWT-like sessions

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or create the project:
```bash
npm create next-app@latest health-record-portal
cd health-record-portal
```

2. Install dependencies:
```bash
npm install next@14.0.4 react react-dom lucide-react @zxing/browser @zxing/library
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer eslint eslint-config-next
```

3. Initialize Tailwind CSS:
```bash
npx tailwindcss init -p
```

4. Copy all the provided files into your project directory

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
health-record-portal/
├── app/                    # Next.js App Router pages
│   ├── patient/           # Patient authentication & dashboard
│   ├── doctor/            # Doctor authentication & dashboard
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (Button, Input, etc.)
│   ├── Navbar.tsx        # Navigation component
│   ├── QRCodeDisplay.tsx # QR code generation
│   └── QRScanner.tsx     # QR code scanning
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication state management
├── types/                # TypeScript type definitions
│   └── index.ts          # All interface definitions
├── utils/                # Utility functions
│   ├── storage.ts        # localStorage helpers
│   ├── auth.ts           # Authentication utilities
│   ├── audit.ts          # Audit logging
│   └── qr.ts             # QR code utilities
└── styles/               # Global styles
    └── globals.css       # Tailwind CSS imports
```

## Data Models

### Collections (localStorage keys):
- `users` - User accounts (patients & doctors)
- `patients` - Patient profiles and health records
- `doctors` - Doctor profiles
- `consents` - Access permissions between patients and doctors
- `prescriptions` - Medical prescriptions
- `audits` - Activity logs
- `qrTokens` - QR code tokens with expiration

## Key Features Demo

### Patient Workflow:
1. Register/Login as patient
2. View profile with generated HCID
3. Add health records
4. Generate QR code for doctor access
5. Manage doctor consents
6. View activity audit log

### Doctor Workflow:
1. Register/Login as doctor
2. Enter patient HCID or scan QR code
3. Request/verify patient consent
4. View patient health records
5. Write and save prescriptions
6. View prescription history

## Theme & Design

- **Light mode only** with white background
- **Soft yellow accents** (#FFFBEA) for highlights
- **Clean card-based layout** with subtle shadows
- **Responsive design** for mobile and desktop
- **Consistent typography** and spacing

## Security Features

- Password hashing (demo implementation)
- Session expiration management
- Consent-based access control
- QR token expiration (15 minutes)
- Comprehensive audit logging
- Role-based route protection

## Development Notes

This is a **demo application** with the following limitations:
- Uses localStorage instead of a real database
- Simplified password hashing
- Basic QR code generation (no real QR scanning library)
- No real-time updates between users
- No email verification or password reset

For production use, implement:
- Real database (PostgreSQL, MongoDB, etc.)
- Proper authentication (NextAuth.js, Auth0)
- Real QR code libraries
- Email services
- Real-time updates (WebSocket)
- Enhanced security measures

## License

MIT License - feel free to use this project as a starting point for your own healthcare applications.
