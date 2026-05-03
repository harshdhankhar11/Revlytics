# Revlytics

Market intelligence platform for Amazon sellers. Analyze products, competitors, and market trends to make data-driven decisions.

## Features Implemented

### Authentication & Account Management
- User registration with email verification
- OTP-based email verification (10-minute expiry, 5 attempt limit)
- Secure login with NextAuth
- User profile management
- Account status tracking (PENDING_VERIFICATION, ACTIVE, INACTIVE, SUSPENDED)
- Rate limiting on all auth endpoints

### Payment & Billing
- Razorpay payment gateway integration
- One-time payment orders
- Transaction history tracking
- Payment status management (PENDING, SUCCEEDED, FAILED, CANCELLED)
- Automatic credit allocation on successful payment
- Analysis count increment (5 per successful payment)
- Payment webhooks for order status updates

### Dashboard
- User dashboard with responsive layout
- Collapsible sidebar navigation
- Top navigation bar
- Credit display and management
- User profile access

### Database
- PostgreSQL with Prisma ORM
- Comprehensive schema with migrations
- User management
- Transaction & Payment records
- Analysis jobs and results
- Product, Review, and Competitor data models
- Opportunity and Market Insight models

### UI Components
- Responsive design with Tailwind CSS
- Sidebar with navigation
- Navigation bars
- Cards, buttons, inputs
- Dropdown menus
- Tooltips and badges
- Skeleton loaders
- Avatar components

### Security
- bcrypt password hashing
- Redis-based OTP storage and verification
- Session-based authentication
- Rate limiting (IP and email-based)
- CSRF protection with NextAuth
- Protected routes and API endpoints

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis instance
- Razorpay account (for payments)

### Installation

1. Clone repository
2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables in `.env`:
```
DATABASE_URL=your_postgres_url
REDIS_URL=your_redis_url
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
EMAIL_USER=your_gmail
EMAIL_PASS=your_gmail_app_password
```

4. Generate Prisma client:
```bash
pnpm prisma generate
```

5. Run migrations:
```bash
pnpm prisma migrate dev
```

6. Start dev server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL, Prisma ORM
- **Cache**: Redis
- **Auth**: NextAuth, bcrypt
- **Payment**: Razorpay
- **Email**: Nodemailer with Gmail
