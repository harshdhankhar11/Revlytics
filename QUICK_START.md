# Quick Start Guide for Email Verification Workflow

## Prerequisites

Before running the application, make sure you have:

1. **PostgreSQL** running locally or a connection string
2. **Redis** running locally or a connection string  
3. **Gmail Account** with app password generated
4. **.env file** configured with all required variables

## Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/revlytics"

# Redis (for OTP storage and rate limiting)
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Email Service
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"  # Generate from Google Account settings
```

## Getting Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer" (or your device)
3. Google will generate a 16-character password
4. Copy and paste it as EMAIL_PASS in .env

## Database Setup

```bash
# Run migrations
pnpm prisma migrate dev --name init_schema

# Generate Prisma client
pnpm prisma generate
```

## Running the Application

```bash
# Start development server
pnpm dev

# Application will be available at http://localhost:3000
```

## Testing the Complete Workflow

### 1. Sign Up (Test Registration & Rate Limiting)
- Go to http://localhost:3000/register
- Fill in:
  - Full Name: John Doe
  - Email: test@example.com
  - Password: SecurePass123!
- Click "Create account"
- You should see: "Redirecting to verify email..."

**Test Rate Limiting:**
- Try to register again with same email (should fail after 3 attempts in 5 minutes)
- Try to register multiple times from same IP (should fail after 10 attempts in 5 minutes)

### 2. Verify Email (Test OTP Flow)
- After signup, you're redirected to verify-email page
- Check your email inbox for OTP
- Copy the 6-digit code
- Paste it into the OTP field
- Click "Verify Email"
- You should see: "Email verified successfully! Redirecting to login..."

**Test OTP Features:**
- Invalid OTP: Try wrong code (should fail after 5 attempts)
- Expired OTP: Wait 10+ minutes, then try (should fail)
- Resend OTP: Click "Resend Code" button (rate limited to 3 per 10 minutes)

### 3. Sign In (Test Authentication & Rate Limiting)
- Go to http://localhost:3000/login
- Use credentials from signup
- Click "Sign in"
- You should be redirected to dashboard

**Test Error Scenarios:**
- Wrong password: Should show error
- Wrong email: Should show error
- Unverified email: Create new account but don't verify → Try login → Should see "Your email is not verified yet"

**Test Rate Limiting:**
- Try logging in with wrong password 5+ times
- Should be rate limited (max 5 attempts per 5 minutes per email)

### 4. Dashboard (Test Protected Routes)
- After successful login, you're on dashboard
- Try accessing /dashboard directly without login → Should redirect to login
- Click Logout → Should return to login page

## API Endpoints for Testing

### Register
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Resend Email
```bash
curl -X POST http://localhost:3000/api/auth/send-verification-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Sign In (via NextAuth)
```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

## Database Queries for Testing

### Check user status
```sql
SELECT id, email, name, status, "isEmailVerified", "createdAt" FROM "User" 
WHERE email = 'test@example.com';
```

### Check if user is verified
```sql
SELECT status FROM "User" WHERE status = 'ACTIVE';
```

### View all pending verifications
```sql
SELECT id, email, status FROM "User" WHERE status = 'PENDING_VERIFICATION';
```

## Redis Commands for Testing

### Check OTP in Redis
```bash
redis-cli get "otp:test@example.com"
```

### Check OTP attempts
```bash
redis-cli get "otp:attempts:test@example.com"
```

### Check rate limiting
```bash
redis-cli get "rl:signin:email:test@example.com"
```

### Clear all keys for testing
```bash
redis-cli FLUSHDB
```

## Logs & Debugging

### Check if emails are being sent
- Look at terminal output when you register
- Errors should print to console

### Enable debug logging
- Add `console.log()` statements in route handlers
- Use VS Code debugger with breakpoints

### Check Redis connection
```bash
redis-cli ping
# Should return: PONG
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Emails not received | Check EMAIL_USER/EMAIL_PASS, check spam folder |
| Redis connection error | Start Redis: `redis-server` |
| Database errors | Run migrations: `pnpm prisma migrate dev` |
| OTP expiry not working | Check Redis is running |
| Rate limit not working | Check Redis connection |
| Session not persisting | Check NEXTAUTH_SECRET is set |

## Performance Testing

### Load Test Registration
```bash
# Test multiple registrations (change email each time)
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/register \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"User $i\",
      \"email\": \"user$i@example.com\",
      \"password\": \"SecurePass123!\"
    }"
done
```

## Success Indicators

✅ User can register
✅ OTP email is received
✅ User can verify email with OTP
✅ Account status changes to ACTIVE
✅ User can login with verified account
✅ User cannot login without verification
✅ Dashboard is accessible after login
✅ Dashboard is not accessible without login
✅ Rate limiting works
✅ Error messages are clear and helpful

Congratulations! Your authentication workflow is fully functional! 🎉
