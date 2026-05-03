-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FREE', 'PRO', 'ENTERPRISE', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'SCRAPING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('HEALTH', 'ELECTRONICS', 'BEAUTY', 'HOME', 'CLOTHING', 'SPORTS', 'TOYS', 'GROCERY', 'AUTOMOTIVE', 'OTHER');

-- CreateEnum
CREATE TYPE "SentimentType" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('CSV', 'PDF', 'JSON');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('SUCCEEDED', 'PENDING', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'FREE',
    "status" "AccountStatus" NOT NULL DEFAULT 'INACTIVE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "analysisCount" INTEGER NOT NULL DEFAULT 0,
    "monthlyAnalysisLimit" INTEGER NOT NULL DEFAULT 1,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "credits" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentIntentId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "productId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisJob" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "userProductUrl" TEXT NOT NULL,
    "competitorUrls" TEXT[],
    "userProductAsin" TEXT NOT NULL,
    "competitorAsins" TEXT[],
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "totalProductsScraped" INTEGER NOT NULL DEFAULT 0,
    "totalReviewsScraped" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "AnalysisJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "asin" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "brand" TEXT,
    "category" "ProductCategory",
    "categoryRaw" TEXT,
    "price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "listPrice" DOUBLE PRECISION,
    "monthlyRevenue" DOUBLE PRECISION,
    "bsr" INTEGER,
    "bsrCategory" TEXT,
    "rating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "ratingDistribution" JSONB,
    "images" TEXT[],
    "variations" JSONB,
    "availability" TEXT,
    "isAmazonChoice" BOOLEAN NOT NULL DEFAULT false,
    "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
    "isUserProduct" BOOLEAN NOT NULL DEFAULT false,
    "topPurchaseCriteria" JSONB,
    "sentimentBreakdown" JSONB,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "additionalData" JSONB,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "asin" TEXT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "reviewTitle" TEXT,
    "rating" INTEGER NOT NULL,
    "verifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "authorName" TEXT,
    "authorUrl" TEXT,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "totalFeedback" INTEGER NOT NULL DEFAULT 0,
    "sentiment" "SentimentType",
    "extractedCriteria" JSONB,
    "keyPhrases" TEXT[],
    "rawHtml" TEXT,
    "reviewUrl" TEXT,
    "scrapedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseCriterion" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mentionCount" INTEGER NOT NULL,
    "mentionPercentage" DOUBLE PRECISION NOT NULL,
    "overallSentiment" DOUBLE PRECISION NOT NULL,
    "keywords" TEXT[],
    "sampleQuotes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCriteria" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "sentimentScore" DOUBLE PRECISION NOT NULL,
    "mentionCount" INTEGER NOT NULL,
    "rankAmongCompetitors" INTEGER,

    CONSTRAINT "ProductCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentimentScore" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "criterion" TEXT NOT NULL,
    "sentimentScore" DOUBLE PRECISION NOT NULL,
    "positiveCount" INTEGER NOT NULL,
    "neutralCount" INTEGER NOT NULL,
    "negativeCount" INTEGER NOT NULL,
    "totalMentions" INTEGER NOT NULL,

    CONSTRAINT "SentimentScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "estimatedRoi" TEXT,
    "implementation" TEXT,
    "relatedCriterion" TEXT,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Export" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "format" "ExportFormat" NOT NULL,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Export_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentIntentId_key" ON "Payment"("paymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "AnalysisJob_userId_idx" ON "AnalysisJob"("userId");

-- CreateIndex
CREATE INDEX "AnalysisJob_sessionId_idx" ON "AnalysisJob"("sessionId");

-- CreateIndex
CREATE INDEX "AnalysisJob_status_idx" ON "AnalysisJob"("status");

-- CreateIndex
CREATE INDEX "AnalysisJob_startedAt_idx" ON "AnalysisJob"("startedAt");

-- CreateIndex
CREATE INDEX "AnalysisJob_userId_status_idx" ON "AnalysisJob"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Product_asin_key" ON "Product"("asin");

-- CreateIndex
CREATE INDEX "Product_asin_idx" ON "Product"("asin");

-- CreateIndex
CREATE INDEX "Product_analysisJobId_idx" ON "Product"("analysisJobId");

-- CreateIndex
CREATE INDEX "Product_bsr_idx" ON "Product"("bsr");

-- CreateIndex
CREATE INDEX "Product_monthlyRevenue_idx" ON "Product"("monthlyRevenue");

-- CreateIndex
CREATE INDEX "Product_reviewCount_idx" ON "Product"("reviewCount");

-- CreateIndex
CREATE INDEX "Product_isUserProduct_idx" ON "Product"("isUserProduct");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- CreateIndex
CREATE INDEX "Review_asin_idx" ON "Review"("asin");

-- CreateIndex
CREATE INDEX "Review_rating_idx" ON "Review"("rating");

-- CreateIndex
CREATE INDEX "Review_reviewDate_idx" ON "Review"("reviewDate");

-- CreateIndex
CREATE INDEX "Review_verifiedPurchase_idx" ON "Review"("verifiedPurchase");

-- CreateIndex
CREATE INDEX "Review_sentiment_idx" ON "Review"("sentiment");

-- CreateIndex
CREATE INDEX "Review_productId_sentiment_idx" ON "Review"("productId", "sentiment");

-- CreateIndex
CREATE INDEX "PurchaseCriterion_analysisJobId_idx" ON "PurchaseCriterion"("analysisJobId");

-- CreateIndex
CREATE INDEX "PurchaseCriterion_mentionPercentage_idx" ON "PurchaseCriterion"("mentionPercentage");

-- CreateIndex
CREATE INDEX "ProductCriteria_productId_idx" ON "ProductCriteria"("productId");

-- CreateIndex
CREATE INDEX "ProductCriteria_criterionId_idx" ON "ProductCriteria"("criterionId");

-- CreateIndex
CREATE INDEX "ProductCriteria_sentimentScore_idx" ON "ProductCriteria"("sentimentScore");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCriteria_productId_criterionId_key" ON "ProductCriteria"("productId", "criterionId");

-- CreateIndex
CREATE INDEX "SentimentScore_productId_idx" ON "SentimentScore"("productId");

-- CreateIndex
CREATE INDEX "SentimentScore_criterion_idx" ON "SentimentScore"("criterion");

-- CreateIndex
CREATE UNIQUE INDEX "SentimentScore_productId_criterion_key" ON "SentimentScore"("productId", "criterion");

-- CreateIndex
CREATE INDEX "Opportunity_analysisJobId_idx" ON "Opportunity"("analysisJobId");

-- CreateIndex
CREATE INDEX "Opportunity_impact_idx" ON "Opportunity"("impact");

-- CreateIndex
CREATE INDEX "Opportunity_isResolved_idx" ON "Opportunity"("isResolved");

-- CreateIndex
CREATE INDEX "Export_userId_idx" ON "Export"("userId");

-- CreateIndex
CREATE INDEX "Export_analysisJobId_idx" ON "Export"("analysisJobId");

-- CreateIndex
CREATE INDEX "SavedReport_userId_idx" ON "SavedReport"("userId");

-- CreateIndex
CREATE INDEX "SavedReport_isStarred_idx" ON "SavedReport"("isStarred");

-- CreateIndex
CREATE UNIQUE INDEX "SavedReport_userId_analysisJobId_key" ON "SavedReport"("userId", "analysisJobId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisJob" ADD CONSTRAINT "AnalysisJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseCriterion" ADD CONSTRAINT "PurchaseCriterion_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCriteria" ADD CONSTRAINT "ProductCriteria_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCriteria" ADD CONSTRAINT "ProductCriteria_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "PurchaseCriterion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentimentScore" ADD CONSTRAINT "SentimentScore_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedReport" ADD CONSTRAINT "SavedReport_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
