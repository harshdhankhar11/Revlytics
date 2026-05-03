-- AlterEnum
ALTER TYPE "AnalysisStatus" ADD VALUE 'ANALYZING';

-- AlterTable
ALTER TABLE "AnalysisJob" ADD COLUMN     "analysisResults" JSONB;
