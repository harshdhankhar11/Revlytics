-- CreateEnum
CREATE TYPE "OpportunityImpact" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "OpportunityEffort" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'IMPLEMENTED');

-- CreateEnum
CREATE TYPE "PriorityLevel" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- AlterEnum
ALTER TYPE "ExportFormat" ADD VALUE 'EXCEL';

-- AlterTable
ALTER TABLE "AnalysisJob" ADD COLUMN     "benchmarkData" JSONB,
ADD COLUMN     "competitiveAdvantages" JSONB,
ADD COLUMN     "forecastData" JSONB,
ADD COLUMN     "marketExpansionOpportunities" JSONB,
ADD COLUMN     "performanceMetrics" JSONB,
ADD COLUMN     "strategicRecommendations" JSONB,
ADD COLUMN     "swotAnalysis" JSONB;

-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "investmentNeeded" TEXT,
ADD COLUMN     "marketSize" TEXT,
ADD COLUMN     "roiProjection" TEXT,
ADD COLUMN     "timeline" TEXT;

-- AlterTable
ALTER TABLE "PurchaseCriterion" ADD COLUMN     "category" TEXT,
ADD COLUMN     "importanceScore" DOUBLE PRECISION,
ADD COLUMN     "monthOverMonthChange" DOUBLE PRECISION,
ADD COLUMN     "trendDirection" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "containsImages" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "containsVideo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emotionScore" DOUBLE PRECISION,
ADD COLUMN     "helpfulnessRatio" DOUBLE PRECISION,
ADD COLUMN     "reviewLength" INTEGER;

-- AlterTable
ALTER TABLE "SavedReport" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "ProductMetric" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketInsight" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "data" JSONB,
    "sources" TEXT[],
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "MarketInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrategicGoal" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "PriorityLevel" NOT NULL,
    "kpis" JSONB,
    "milestones" JSONB,
    "resources" JSONB,
    "targetDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StrategicGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitiveAnalysis" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "marketShare" JSONB,
    "pricePosition" JSONB,
    "featureMatrix" JSONB,
    "competitorRanking" JSONB,
    "winLossAnalysis" JSONB,
    "differentiationScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitiveAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Forecast" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "forecastType" TEXT NOT NULL,
    "predictions" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL,
    "historicalData" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "Forecast_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductMetric_productId_idx" ON "ProductMetric"("productId");

-- CreateIndex
CREATE INDEX "ProductMetric_metricName_idx" ON "ProductMetric"("metricName");

-- CreateIndex
CREATE INDEX "ProductMetric_timestamp_idx" ON "ProductMetric"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ProductMetric_productId_metricName_timestamp_key" ON "ProductMetric"("productId", "metricName", "timestamp");

-- CreateIndex
CREATE INDEX "MarketInsight_analysisJobId_idx" ON "MarketInsight"("analysisJobId");

-- CreateIndex
CREATE INDEX "MarketInsight_category_idx" ON "MarketInsight"("category");

-- CreateIndex
CREATE INDEX "MarketInsight_severity_idx" ON "MarketInsight"("severity");

-- CreateIndex
CREATE INDEX "MarketInsight_isResolved_idx" ON "MarketInsight"("isResolved");

-- CreateIndex
CREATE INDEX "MarketInsight_createdAt_idx" ON "MarketInsight"("createdAt");

-- CreateIndex
CREATE INDEX "StrategicGoal_analysisJobId_idx" ON "StrategicGoal"("analysisJobId");

-- CreateIndex
CREATE INDEX "StrategicGoal_priority_idx" ON "StrategicGoal"("priority");

-- CreateIndex
CREATE INDEX "StrategicGoal_status_idx" ON "StrategicGoal"("status");

-- CreateIndex
CREATE INDEX "StrategicGoal_targetDate_idx" ON "StrategicGoal"("targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitiveAnalysis_analysisJobId_key" ON "CompetitiveAnalysis"("analysisJobId");

-- CreateIndex
CREATE INDEX "CompetitiveAnalysis_analysisJobId_idx" ON "CompetitiveAnalysis"("analysisJobId");

-- CreateIndex
CREATE INDEX "CompetitiveAnalysis_differentiationScore_idx" ON "CompetitiveAnalysis"("differentiationScore");

-- CreateIndex
CREATE UNIQUE INDEX "Forecast_analysisJobId_key" ON "Forecast"("analysisJobId");

-- CreateIndex
CREATE INDEX "Forecast_analysisJobId_idx" ON "Forecast"("analysisJobId");

-- CreateIndex
CREATE INDEX "Forecast_forecastType_idx" ON "Forecast"("forecastType");

-- CreateIndex
CREATE INDEX "Forecast_generatedAt_idx" ON "Forecast"("generatedAt");

-- CreateIndex
CREATE INDEX "AnalysisJob_completedAt_idx" ON "AnalysisJob"("completedAt");

-- CreateIndex
CREATE INDEX "AnalysisJob_overallScore_idx" ON "AnalysisJob"("overallScore");

-- CreateIndex
CREATE INDEX "Export_createdAt_idx" ON "Export"("createdAt");

-- CreateIndex
CREATE INDEX "Export_format_idx" ON "Export"("format");

-- CreateIndex
CREATE INDEX "Opportunity_confidenceScore_idx" ON "Opportunity"("confidenceScore");

-- CreateIndex
CREATE INDEX "Product_rating_idx" ON "Product"("rating");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "ProductCriteria_rankAmongCompetitors_idx" ON "ProductCriteria"("rankAmongCompetitors");

-- CreateIndex
CREATE INDEX "PurchaseCriterion_importanceScore_idx" ON "PurchaseCriterion"("importanceScore");

-- CreateIndex
CREATE INDEX "PurchaseCriterion_category_idx" ON "PurchaseCriterion"("category");

-- CreateIndex
CREATE INDEX "Review_helpfulCount_idx" ON "Review"("helpfulCount");

-- CreateIndex
CREATE INDEX "Review_reviewDate_rating_idx" ON "Review"("reviewDate", "rating");

-- CreateIndex
CREATE INDEX "SavedReport_createdAt_idx" ON "SavedReport"("createdAt");

-- CreateIndex
CREATE INDEX "SavedReport_tags_idx" ON "SavedReport"("tags");

-- CreateIndex
CREATE INDEX "SentimentScore_sentimentScore_idx" ON "SentimentScore"("sentimentScore");

-- AddForeignKey
ALTER TABLE "ProductMetric" ADD CONSTRAINT "ProductMetric_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketInsight" ADD CONSTRAINT "MarketInsight_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrategicGoal" ADD CONSTRAINT "StrategicGoal_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveAnalysis" ADD CONSTRAINT "CompetitiveAnalysis_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Forecast" ADD CONSTRAINT "Forecast_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
