-- CreateEnum
CREATE TYPE "OnboardingTriggerType" AS ENUM ('ACTION_GATE', 'PERSISTENT_CARD', 'INTERNAL');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('VALID_ID', 'BUSINESS_PERMIT', 'TESDA', 'NBI', 'POLICE', 'LICENSE', 'CERTIFICATE', 'TAX_DOC', 'RECOMMENDATION', 'OTHER');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('CONTRACTOR_PROFILE', 'SUPPLIER_PROFILE', 'JOB_SEEKER_PROFILE', 'USER');

-- CreateEnum
CREATE TYPE "PortfolioOwnerType" AS ENUM ('CONTRACTOR_PROFILE', 'JOB_SEEKER_PROFILE');

-- CreateEnum
CREATE TYPE "PricingType" AS ENUM ('FIXED', 'HOURLY', 'DAILY', 'PER_SQM', 'PER_PROJECT', 'QUOTE_BASED');

-- CreateEnum
CREATE TYPE "PayoutMethod" AS ENUM ('BANK', 'GCASH', 'MAYA');

-- CreateEnum
CREATE TYPE "AddressOwnerType" AS ENUM ('CLIENT_PROFILE', 'CONTRACTOR_PROFILE', 'SUPPLIER_PROFILE', 'JOB_SEEKER_PROFILE');

-- DropForeignKey
ALTER TABLE "OnboardingState" DROP CONSTRAINT "OnboardingState_userId_fkey";

-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phone",
DROP COLUMN "province",
DROP COLUMN "region";

-- AlterTable
ALTER TABLE "ContractorProfile" DROP COLUMN "location",
DROP COLUMN "portfolioFiles",
DROP COLUMN "serviceArea",
DROP COLUMN "serviceCategories",
DROP COLUMN "verificationDocuments";

-- AlterTable
ALTER TABLE "JobSeekerProfile" DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "location",
DROP COLUMN "portfolioFiles",
DROP COLUMN "verificationDocuments",
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "previousEmployer" TEXT,
ADD COLUMN     "skillCategory" TEXT,
ADD COLUMN     "workHistoryJson" JSONB;

-- AlterTable
ALTER TABLE "OnboardingStep" ADD COLUMN     "fieldGroupCode" TEXT,
ADD COLUMN     "phase" INTEGER NOT NULL,
ADD COLUMN     "triggerType" "OnboardingTriggerType" NOT NULL DEFAULT 'INTERNAL';

-- AlterTable
ALTER TABLE "SupplierProfile" DROP COLUMN "deliveryAreas",
DROP COLUMN "deliveryAvailable",
DROP COLUMN "firstProduct",
DROP COLUMN "inventoryStock",
DROP COLUMN "payoutAcctName",
DROP COLUMN "payoutAcctNo",
DROP COLUMN "payoutBankName",
DROP COLUMN "pickupAvailable",
DROP COLUMN "productCategory",
DROP COLUMN "verificationDocuments",
DROP COLUMN "verifiedAt",
ADD COLUMN     "storePhotos" TEXT[],
ADD COLUMN     "tinNumber" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;

-- DropTable
DROP TABLE "OnboardingState";

-- DropEnum
DROP TYPE "OnboardingStatus";

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ownerType" "AddressOwnerType" NOT NULL,
    "label" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "barangay" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "ownerType" "DocumentOwnerType" NOT NULL,
    "type" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "ownerType" "PortfolioOwnerType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrls" TEXT[],
    "projectDate" TIMESTAMP(3),
    "clientName" TEXT,
    "location" TEXT,
    "tagsJson" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorService" (
    "id" TEXT NOT NULL,
    "contractorProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT[],
    "pricingType" "PricingType" NOT NULL,
    "basePriceMin" DECIMAL(65,30),
    "basePriceMax" DECIMAL(65,30),
    "serviceArea" TEXT,
    "description" TEXT,
    "availabilityStatus" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "supplierProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT,
    "unit" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "marketPrice" DECIMAL(65,30),
    "discount" DECIMAL(65,30),
    "availableStock" INTEGER NOT NULL,
    "reservedStock" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER,
    "warehouseLocation" TEXT,
    "stockUnit" TEXT,
    "description" TEXT,
    "brand" TEXT,
    "sku" TEXT,
    "quality" TEXT,
    "specifications" JSONB,
    "images" TEXT[],
    "priceNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" "PayoutMethod" NOT NULL,
    "bankName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "gcashNumber" TEXT,
    "mayaNumber" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliverySetting" (
    "id" TEXT NOT NULL,
    "supplierProfileId" TEXT NOT NULL,
    "deliveryAreas" TEXT[],
    "deliveryFee" DECIMAL(65,30),
    "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false,
    "pickupAvailable" BOOLEAN NOT NULL DEFAULT false,
    "pickupAddress" TEXT,
    "minOrderForDelivery" DECIMAL(65,30),
    "estimatedDays" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliverySetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotationTemplate" (
    "id" TEXT NOT NULL,
    "contractorProfileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "scopeOfWorkTemplate" TEXT,
    "paymentTermsTemplate" TEXT,
    "estimatedDurationTemplate" TEXT,
    "fileUrl" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuotationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_userId_ownerType_idx" ON "Address"("userId", "ownerType");

-- CreateIndex
CREATE INDEX "Address_userId_isDefault_idx" ON "Address"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "Document_ownerUserId_type_idx" ON "Document"("ownerUserId", "type");

-- CreateIndex
CREATE INDEX "Document_ownerUserId_status_idx" ON "Document"("ownerUserId", "status");

-- CreateIndex
CREATE INDEX "Document_type_status_idx" ON "Document"("type", "status");

-- CreateIndex
CREATE INDEX "PortfolioItem_ownerUserId_ownerType_idx" ON "PortfolioItem"("ownerUserId", "ownerType");

-- CreateIndex
CREATE INDEX "ContractorService_contractorProfileId_isActive_idx" ON "ContractorService"("contractorProfileId", "isActive");

-- CreateIndex
CREATE INDEX "Product_supplierProfileId_isActive_idx" ON "Product"("supplierProfileId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Product_supplierProfileId_sku_key" ON "Product"("supplierProfileId", "sku");

-- CreateIndex
CREATE INDEX "PayoutAccount_userId_method_idx" ON "PayoutAccount"("userId", "method");

-- CreateIndex
CREATE UNIQUE INDEX "DeliverySetting_supplierProfileId_key" ON "DeliverySetting"("supplierProfileId");

-- CreateIndex
CREATE INDEX "QuotationTemplate_contractorProfileId_idx" ON "QuotationTemplate"("contractorProfileId");

-- CreateIndex
CREATE INDEX "OnboardingStep_flowId_phase_idx" ON "OnboardingStep"("flowId", "phase");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioItem" ADD CONSTRAINT "PortfolioItem_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorService" ADD CONSTRAINT "ContractorService_contractorProfileId_fkey" FOREIGN KEY ("contractorProfileId") REFERENCES "ContractorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutAccount" ADD CONSTRAINT "PayoutAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverySetting" ADD CONSTRAINT "DeliverySetting_supplierProfileId_fkey" FOREIGN KEY ("supplierProfileId") REFERENCES "SupplierProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationTemplate" ADD CONSTRAINT "QuotationTemplate_contractorProfileId_fkey" FOREIGN KEY ("contractorProfileId") REFERENCES "ContractorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
