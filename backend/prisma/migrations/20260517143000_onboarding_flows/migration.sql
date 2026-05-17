-- CreateEnum
CREATE TYPE "OnboardingProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'BLOCKED', 'SKIPPED', 'PENDING_VERIFICATION', 'REJECTED');

-- CreateEnum
CREATE TYPE "OnboardingStepStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'BLOCKED', 'FAILED');

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountSetupStage" TEXT,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "onboardingStatus" "OnboardingProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "primaryRole" "Role";

-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "interestedServices" TEXT[],
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "preferredLocation" TEXT,
ADD COLUMN     "province" TEXT;

-- AlterTable
ALTER TABLE "ContractorProfile" ADD COLUMN     "businessDescription" TEXT,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "portfolioFiles" JSONB,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "serviceArea" TEXT,
ADD COLUMN     "serviceCategories" TEXT[],
ADD COLUMN     "verificationDocuments" JSONB,
ALTER COLUMN "trade" SET DEFAULT '';

-- AlterTable
ALTER TABLE "SupplierProfile" ADD COLUMN     "businessDescription" TEXT,
ADD COLUMN     "businessEmail" TEXT,
ADD COLUMN     "businessType" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "coverImageUrl" TEXT,
ADD COLUMN     "deliveryAreas" TEXT[],
ADD COLUMN     "deliveryAvailable" BOOLEAN,
ADD COLUMN     "firstProduct" TEXT,
ADD COLUMN     "inventoryStock" INTEGER,
ADD COLUMN     "operatingHours" TEXT,
ADD COLUMN     "pickupAvailable" BOOLEAN,
ADD COLUMN     "productCategory" TEXT,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "storeName" TEXT,
ADD COLUMN     "verificationDocuments" JSONB,
ADD COLUMN     "yearsOperating" INTEGER;

-- AlterTable
ALTER TABLE "JobSeekerProfile" ADD COLUMN     "additionalSkills" TEXT[],
ADD COLUMN     "availabilityStatus" TEXT,
ADD COLUMN     "expectedDailyRate" DECIMAL(65,30),
ADD COLUMN     "expectedProjectRate" DECIMAL(65,30),
ADD COLUMN     "experienceDescription" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "portfolioFiles" JSONB,
ADD COLUMN     "preferredWorkType" TEXT,
ADD COLUMN     "primarySkill" TEXT,
ADD COLUMN     "toolsOwned" TEXT[],
ADD COLUMN     "verificationDocuments" JSONB,
ADD COLUMN     "willingToTravel" BOOLEAN;

-- CreateTable
CREATE TABLE "OnboardingFlow" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetRole" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingStep" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "stepCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "stepOrder" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "isSkippable" BOOLEAN NOT NULL DEFAULT false,
    "requiredPermission" TEXT,
    "estimatedMinutes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnboardingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "currentStepId" TEXT,
    "status" "OnboardingProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "lastActivityAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOnboardingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserOnboardingStepProgress" (
    "id" TEXT NOT NULL,
    "userOnboardingProgressId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" "OnboardingStepStatus" NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),
    "skippedAt" TIMESTAMP(3),
    "blockedReason" TEXT,
    "metadataJson" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOnboardingStepProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingRequirement" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "stepId" TEXT,
    "requirementCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "validationRuleJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingFlow_code_key" ON "OnboardingFlow"("code");

-- CreateIndex
CREATE INDEX "OnboardingFlow_targetRole_isActive_idx" ON "OnboardingFlow"("targetRole", "isActive");

-- CreateIndex
CREATE INDEX "OnboardingStep_stepCode_idx" ON "OnboardingStep"("stepCode");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingStep_flowId_stepCode_key" ON "OnboardingStep"("flowId", "stepCode");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingStep_flowId_stepOrder_key" ON "OnboardingStep"("flowId", "stepOrder");

-- CreateIndex
CREATE INDEX "UserOnboardingProgress_status_idx" ON "UserOnboardingProgress"("status");

-- CreateIndex
CREATE INDEX "UserOnboardingProgress_currentStepId_idx" ON "UserOnboardingProgress"("currentStepId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnboardingProgress_userId_flowId_key" ON "UserOnboardingProgress"("userId", "flowId");

-- CreateIndex
CREATE INDEX "UserOnboardingStepProgress_status_idx" ON "UserOnboardingStepProgress"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UserOnboardingStepProgress_userOnboardingProgressId_stepId_key" ON "UserOnboardingStepProgress"("userOnboardingProgressId", "stepId");

-- CreateIndex
CREATE INDEX "OnboardingRequirement_stepId_idx" ON "OnboardingRequirement"("stepId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingRequirement_flowId_requirementCode_key" ON "OnboardingRequirement"("flowId", "requirementCode");

-- CreateIndex
CREATE INDEX "User_primaryRole_idx" ON "User"("primaryRole");

-- CreateIndex
CREATE INDEX "User_onboardingStatus_idx" ON "User"("onboardingStatus");

-- AddForeignKey
ALTER TABLE "OnboardingStep" ADD CONSTRAINT "OnboardingStep_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "OnboardingFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnboardingProgress" ADD CONSTRAINT "UserOnboardingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnboardingProgress" ADD CONSTRAINT "UserOnboardingProgress_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "OnboardingFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnboardingProgress" ADD CONSTRAINT "UserOnboardingProgress_currentStepId_fkey" FOREIGN KEY ("currentStepId") REFERENCES "OnboardingStep"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnboardingStepProgress" ADD CONSTRAINT "UserOnboardingStepProgress_userOnboardingProgressId_fkey" FOREIGN KEY ("userOnboardingProgressId") REFERENCES "UserOnboardingProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOnboardingStepProgress" ADD CONSTRAINT "UserOnboardingStepProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OnboardingStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingRequirement" ADD CONSTRAINT "OnboardingRequirement_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "OnboardingFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingRequirement" ADD CONSTRAINT "OnboardingRequirement_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "OnboardingStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
