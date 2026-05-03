#!/bin/bash

# ========================================
# REVLYTICS AUTHENTICATION WORKFLOW SETUP
# ========================================

# This script helps you set up environment variables for the email verification workflow

echo "🚀 Revlytics Email Verification Workflow Setup"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create a .env file in the root directory with the following variables:"
    echo ""
else
    echo "✅ .env file found"
fi

echo "Required Environment Variables:"
echo "==============================="
echo ""
echo "1. DATABASE_URL"
echo "   - PostgreSQL connection string"
echo "   - Format: postgresql://user:password@localhost:5432/revlytics"
echo ""

echo "2. REDIS_URL"
echo "   - Redis connection string"
echo "   - Format: redis://localhost:6379"
echo "   - Used for: OTP storage, Rate limiting"
echo ""

echo "3. NEXTAUTH_SECRET"
echo "   - Generate with: openssl rand -base64 32"
echo "   - Used for: NextAuth JWT encryption"
echo ""

echo "4. NEXTAUTH_URL"
echo "   - Your application URL"
echo "   - Development: http://localhost:3000"
echo "   - Production: https://yourdomain.com"
echo ""

echo "5. EMAIL_USER"
echo "   - Gmail address for sending emails"
echo "   - Example: your-email@gmail.com"
echo ""

echo "6. EMAIL_PASS"
echo "   - Gmail app password (not regular password)"
echo "   - Get from: https://myaccount.google.com/apppasswords"
echo ""

echo "========================================"
echo "Next Steps:"
echo "========================================"
echo "1. Update your .env file with the above variables"
echo "2. Run: pnpm prisma migrate dev --name init_schema"
echo "3. Run: pnpm dev"
echo "4. Visit: http://localhost:3000/register"
echo ""
