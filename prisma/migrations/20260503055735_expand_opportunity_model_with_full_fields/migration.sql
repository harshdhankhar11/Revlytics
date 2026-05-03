/*
  Warnings:

  - You are about to drop the column `implementation` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `isResolved` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `resolvedAt` on the `Opportunity` table. All the data in the column will be lost.
  - Added the required column `category` to the `Opportunity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `effort` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Opportunity_isResolved_idx";

-- AlterTable
ALTER TABLE "Opportunity" DROP COLUMN "implementation",
DROP COLUMN "isResolved",
DROP COLUMN "resolvedAt",
ADD COLUMN     "actionSteps" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "competitorGap" TEXT,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "confidenceScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "customerDemand" TEXT,
ADD COLUMN     "effort" TEXT NOT NULL,
ADD COLUMN     "estimatedImpact" TEXT,
ADD COLUMN     "fullData" JSONB,
ADD COLUMN     "priorityScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sampleQuotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "Opportunity_category_idx" ON "Opportunity"("category");

-- CreateIndex
CREATE INDEX "Opportunity_effort_idx" ON "Opportunity"("effort");

-- CreateIndex
CREATE INDEX "Opportunity_priorityScore_idx" ON "Opportunity"("priorityScore");

-- CreateIndex
CREATE INDEX "Opportunity_status_idx" ON "Opportunity"("status");

-- CreateIndex
CREATE INDEX "Opportunity_analysisJobId_status_idx" ON "Opportunity"("analysisJobId", "status");
