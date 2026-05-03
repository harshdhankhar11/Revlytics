-- CreateTable
CREATE TABLE "CompetitorComparison" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "competitorProductId" TEXT NOT NULL,
    "userProductId" TEXT,
    "competitorRank" INTEGER,
    "competitorName" TEXT,
    "competitorBrand" TEXT,
    "estimatedMonthlyRevenue" DOUBLE PRECISION,
    "marketSharePercentage" DOUBLE PRECISION,
    "pricePosition" TEXT,
    "overallRating" DOUBLE PRECISION,
    "reviewCount" INTEGER,
    "ratingGap" DOUBLE PRECISION,
    "topStrengths" TEXT[],
    "topWeaknesses" TEXT[],
    "uniqueAdvantages" TEXT[],
    "strengtheData" JSONB,
    "weaknessData" JSONB,
    "analysisDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analysisStatus" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "CompetitorComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitorCriteria" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "competitorComparisionId" TEXT,
    "criteriaName" TEXT NOT NULL,
    "competitorScore" DOUBLE PRECISION NOT NULL,
    "userProductScore" DOUBLE PRECISION,
    "scoreDifference" DOUBLE PRECISION,
    "mentionCount" INTEGER NOT NULL,
    "importanceRank" INTEGER,
    "customerMentionPercentage" DOUBLE PRECISION,
    "criteriaData" JSONB,
    "competitorReviews" TEXT[],

    CONSTRAINT "CompetitorCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitiveGap" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "gapTitle" TEXT NOT NULL,
    "gapDescription" TEXT NOT NULL,
    "gapIcon" TEXT,
    "competitorsMentioning" INTEGER,
    "opportunitySize" TEXT,
    "yourAdvantage" TEXT,
    "estimatedImpact" TEXT,
    "implementation" TEXT,

    CONSTRAINT "CompetitiveGap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetitiveRecommendation" (
    "id" TEXT NOT NULL,
    "analysisJobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "expectedImpact" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "effort" TEXT NOT NULL DEFAULT 'MEDIUM',
    "actionSteps" TEXT[],
    "successMetrics" TEXT[],
    "timeline" TEXT,

    CONSTRAINT "CompetitiveRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompetitorComparison_analysisJobId_idx" ON "CompetitorComparison"("analysisJobId");

-- CreateIndex
CREATE INDEX "CompetitorComparison_competitorProductId_idx" ON "CompetitorComparison"("competitorProductId");

-- CreateIndex
CREATE INDEX "CompetitorComparison_competitorRank_idx" ON "CompetitorComparison"("competitorRank");

-- CreateIndex
CREATE INDEX "CompetitorComparison_marketSharePercentage_idx" ON "CompetitorComparison"("marketSharePercentage");

-- CreateIndex
CREATE INDEX "CompetitorCriteria_analysisJobId_idx" ON "CompetitorCriteria"("analysisJobId");

-- CreateIndex
CREATE INDEX "CompetitorCriteria_importanceRank_idx" ON "CompetitorCriteria"("importanceRank");

-- CreateIndex
CREATE INDEX "CompetitorCriteria_customerMentionPercentage_idx" ON "CompetitorCriteria"("customerMentionPercentage");

-- CreateIndex
CREATE UNIQUE INDEX "CompetitorCriteria_analysisJobId_criteriaName_key" ON "CompetitorCriteria"("analysisJobId", "criteriaName");

-- CreateIndex
CREATE INDEX "CompetitiveGap_analysisJobId_idx" ON "CompetitiveGap"("analysisJobId");

-- CreateIndex
CREATE INDEX "CompetitiveGap_opportunitySize_idx" ON "CompetitiveGap"("opportunitySize");

-- CreateIndex
CREATE INDEX "CompetitiveRecommendation_analysisJobId_idx" ON "CompetitiveRecommendation"("analysisJobId");

-- CreateIndex
CREATE INDEX "CompetitiveRecommendation_category_idx" ON "CompetitiveRecommendation"("category");

-- CreateIndex
CREATE INDEX "CompetitiveRecommendation_priority_idx" ON "CompetitiveRecommendation"("priority");

-- AddForeignKey
ALTER TABLE "CompetitorComparison" ADD CONSTRAINT "CompetitorComparison_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitorCriteria" ADD CONSTRAINT "CompetitorCriteria_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveGap" ADD CONSTRAINT "CompetitiveGap_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetitiveRecommendation" ADD CONSTRAINT "CompetitiveRecommendation_analysisJobId_fkey" FOREIGN KEY ("analysisJobId") REFERENCES "AnalysisJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
