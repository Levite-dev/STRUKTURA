# Struktura Onboarding Revamp — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full vertical revamp — backend schema normalization, Supabase Auth, multi-role onboarding wizard, dashboard banners, Action Gates, and verification soft-locks.

**Architecture:** NestJS CQRS backend with Prisma + PostgreSQL; React/TanStack Router frontend with React Query, React Hook Form, and Supabase JS client. Destructive migration allowed (pre-prod). Admin/Moderator/Support roles out of scope.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Supabase Auth, React, TanStack Router, React Query v5, React Hook Form, Zod, shadcn/ui, vaul, Sonner.

---

## Phase 1 — Backend: Schema Migrations + Seed

### Task 1.1: Add new enums to Prisma schema

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] Open `backend/prisma/schema.prisma`. Add after existing enums:

```prisma
enum OnboardingTriggerType { ACTION_GATE PERSISTENT_CARD INTERNAL }
enum DocumentType { VALID_ID BUSINESS_PERMIT TESDA NBI POLICE LICENSE CERTIFICATE TAX_DOC RECOMMENDATION OTHER }
enum DocumentStatus { PENDING APPROVED REJECTED EXPIRED }
enum DocumentOwnerType { CONTRACTOR_PROFILE SUPPLIER_PROFILE JOB_SEEKER_PROFILE USER }
enum PortfolioOwnerType { CONTRACTOR_PROFILE JOB_SEEKER_PROFILE }
enum PricingType { FIXED HOURLY DAILY PER_SQM PER_PROJECT QUOTE_BASED }
enum PayoutMethod { BANK GCASH MAYA }
enum AddressOwnerType { CLIENT_PROFILE CONTRACTOR_PROFILE SUPPLIER_PROFILE JOB_SEEKER_PROFILE }
```

- [ ] Remove `enum OnboardingStatus { ... }` block (legacy).

### Task 1.2: Modify User model — split fullName, add firstName/lastName

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] In `model User`, replace `fullName  String?` with:

```prisma
  firstName  String?
  lastName   String?
```

- [ ] Remove `onboardingStates OnboardingState[]` relation from User model.

### Task 1.3: Modify OnboardingStep — add phase/triggerType/fieldGroupCode

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] In `model OnboardingStep`, add before `createdAt`:

```prisma
  phase          Int
  triggerType    OnboardingTriggerType @default(INTERNAL)
  fieldGroupCode String?
```

- [ ] Add index: `@@index([flowId, phase])`

### Task 1.4: Drop OnboardingState model

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] Delete entire `model OnboardingState { ... }` block from schema.

### Task 1.5: Add normalized tables — Address, Document, PortfolioItem

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] Add after existing profile models:

```prisma
model Address {
  id           String          @id @default(cuid())
  userId       String
  ownerType    AddressOwnerType
  label        String?
  line1        String
  line2        String?
  barangay     String?
  city         String
  province     String
  postalCode   String?
  contactName  String?
  contactPhone String?
  isDefault    Boolean         @default(false)
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, ownerType])
  @@index([userId, isDefault])
}

model Document {
  id            String              @id @default(cuid())
  ownerUserId   String
  ownerType     DocumentOwnerType
  type          DocumentType
  status        DocumentStatus      @default(PENDING)
  url           String
  fileName      String?
  mimeType      String?
  sizeBytes     Int?
  expiryDate    DateTime?
  reviewedBy    String?
  reviewedAt    DateTime?
  rejectionNote String?
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  owner User @relation(fields: [ownerUserId], references: [id], onDelete: Cascade)

  @@index([ownerUserId, type])
  @@index([ownerUserId, status])
  @@index([type, status])
}

model PortfolioItem {
  id           String             @id @default(cuid())
  ownerUserId  String
  ownerType    PortfolioOwnerType
  title        String
  description  String?
  imageUrls    String[]
  projectDate  DateTime?
  clientName   String?
  location     String?
  tagsJson     Json?
  displayOrder Int                @default(0)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  owner User @relation(fields: [ownerUserId], references: [id], onDelete: Cascade)

  @@index([ownerUserId, ownerType])
}
```

### Task 1.6: Add normalized tables — ContractorService, Product, PayoutAccount, DeliverySetting, QuotationTemplate

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] Add:

```prisma
model ContractorService {
  id                 String            @id @default(cuid())
  contractorProfileId String
  name               String
  categories         String[]
  pricingType        PricingType
  basePriceMin       Decimal?
  basePriceMax       Decimal?
  serviceArea        String?
  description        String?
  availabilityStatus String?
  isActive           Boolean           @default(true)
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  contractorProfile ContractorProfile @relation(fields: [contractorProfileId], references: [id], onDelete: Cascade)

  @@index([contractorProfileId, isActive])
}

model Product {
  id                String          @id @default(cuid())
  supplierProfileId String
  name              String
  categoryId        String?
  unit              String
  price             Decimal
  marketPrice       Decimal?
  discount          Decimal?
  availableStock    Int
  reservedStock     Int             @default(0)
  reorderLevel      Int?
  warehouseLocation String?
  stockUnit         String?
  description       String?
  brand             String?
  sku               String?
  quality           String?
  specifications    Json?
  images            String[]
  priceNotes        String?
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  supplierProfile SupplierProfile @relation(fields: [supplierProfileId], references: [id], onDelete: Cascade)

  @@unique([supplierProfileId, sku])
  @@index([supplierProfileId, isActive])
}

model PayoutAccount {
  id            String       @id @default(cuid())
  userId        String
  method        PayoutMethod
  bankName      String?
  accountName   String?
  accountNumber String?
  gcashNumber   String?
  mayaNumber    String?
  isDefault     Boolean      @default(false)
  verifiedAt    DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, method])
}

model DeliverySetting {
  id                    String          @id @default(cuid())
  supplierProfileId     String          @unique
  deliveryAreas         String[]
  deliveryFee           Decimal?
  deliveryAvailable     Boolean         @default(false)
  pickupAvailable       Boolean         @default(false)
  pickupAddress         String?
  minOrderForDelivery   Decimal?
  estimatedDays         Int?
  notes                 String?
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  supplierProfile SupplierProfile @relation(fields: [supplierProfileId], references: [id], onDelete: Cascade)
}

model QuotationTemplate {
  id                          String            @id @default(cuid())
  contractorProfileId         String
  name                        String
  scopeOfWorkTemplate         String?
  paymentTermsTemplate        String?
  estimatedDurationTemplate   String?
  fileUrl                     String?
  isDefault                   Boolean           @default(false)
  createdAt                   DateTime          @default(now())
  updatedAt                   DateTime          @updatedAt

  contractorProfile ContractorProfile @relation(fields: [contractorProfileId], references: [id], onDelete: Cascade)

  @@index([contractorProfileId])
}
```

### Task 1.7: Profile models destructive cleanup

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] `ClientProfile`: remove `region`, `address`, `firstName`, `lastName`, `phone` columns (user owns these now).
- [ ] `ContractorProfile`: remove `portfolioFiles`, `verificationDocuments`, `serviceArea`, `serviceCategories`, `trade`, `location`. Add relations:

```prisma
  services           ContractorService[]
  quotationTemplates QuotationTemplate[]
```

- [ ] `SupplierProfile`: remove `deliveryAreas`, `productCategory`, `firstProduct`, `inventoryStock`, `verificationDocuments`, `deliveryAvailable`, `pickupAvailable`, `payoutBankName`, `payoutAcctName`, `payoutAcctNo`, `verifiedAt`. Add `tinNumber String?`, `storePhotos String[]`. Add relations:

```prisma
  products        Product[]
  deliverySetting DeliverySetting?
```

- [ ] `JobSeekerProfile`: remove `portfolioFiles`, `verificationDocuments`, `location`, `firstName`, `lastName`. Add `skillCategory String?`, `bio String?`, `previousEmployer String?`, `workHistoryJson Json?`.

- [ ] Add `addresses Address[]`, `documents Document[]`, `portfolioItems PortfolioItem[]`, `payoutAccounts PayoutAccount[]` relations to `User` model.

### Task 1.8: Run first migration

- [ ] Run:
```bash
cd backend && pnpm prisma migrate dev --name onboarding_revamp_drop_legacy
```
Expected: migration created and applied. If column conflicts, check for remaining references to `fullName`/`OnboardingState` in schema.

### Task 1.9: Run second migration + generate client

- [ ] Run:
```bash
cd backend && pnpm prisma migrate dev --name onboarding_revamp_normalize
pnpm prisma generate
```
Expected: no errors, Prisma client regenerated.

### Task 1.10: Write seed script

**Files:**
- Create: `backend/prisma/seed.ts`
- Modify: `backend/package.json`

- [ ] Add to `backend/package.json` under `"prisma"` key:
```json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

- [ ] Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient, OnboardingTriggerType } from '@prisma/client';

const prisma = new PrismaClient();

const flows = [
  { code: 'client_onboarding', name: 'Client Onboarding', role: 'CLIENT' as const },
  { code: 'contractor_onboarding', name: 'Contractor Onboarding', role: 'CONTRACTOR' as const },
  { code: 'supplier_onboarding', name: 'Supplier Onboarding', role: 'SUPPLIER' as const },
  { code: 'job_seeker_onboarding', name: 'Job Seeker Onboarding', role: 'JOB_SEEKER' as const },
];

const steps: Record<string, Array<{
  stepCode: string; title: string; phase: number;
  triggerType: OnboardingTriggerType; fieldGroupCode: string;
  stepOrder: number; isRequired: boolean; isSkippable: boolean;
}>> = {
  client_onboarding: [
    { stepCode: 'client.personal_info', title: 'Personal Info', phase: 1, triggerType: 'INTERNAL', fieldGroupCode: 'client.personal_info', stepOrder: 1, isRequired: true, isSkippable: false },
    { stepCode: 'client.address', title: 'Delivery Address', phase: 2, triggerType: 'ACTION_GATE', fieldGroupCode: 'client.address', stepOrder: 2, isRequired: true, isSkippable: false },
    { stepCode: 'client.preferences', title: 'Preferences', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'client.preferences', stepOrder: 3, isRequired: false, isSkippable: true },
    { stepCode: 'client.cover', title: 'Profile Photo', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.cover', stepOrder: 4, isRequired: false, isSkippable: true },
    { stepCode: 'client.complete', title: 'Complete', phase: 4, triggerType: 'INTERNAL', fieldGroupCode: 'client.complete', stepOrder: 5, isRequired: true, isSkippable: false },
  ],
  contractor_onboarding: [
    { stepCode: 'contractor.personal_info', title: 'Personal Info', phase: 1, triggerType: 'INTERNAL', fieldGroupCode: 'contractor.personal_info', stepOrder: 1, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.business_basics', title: 'Business Basics', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.business_basics', stepOrder: 2, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.first_service', title: 'First Service', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.first_service', stepOrder: 3, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.service_details', title: 'Service Details', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.service_details', stepOrder: 4, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.portfolio', title: 'Portfolio', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.portfolio', stepOrder: 5, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.verification', title: 'Valid ID', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.verification', stepOrder: 6, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.license', title: 'License', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.license', stepOrder: 7, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.certificates', title: 'Certificates', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.certificates', stepOrder: 8, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.tax', title: 'Tax Documents', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.tax', stepOrder: 9, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.payout', title: 'Payout Account', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.payout', stepOrder: 10, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.quotation_templates', title: 'Quotation Templates', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.quotation_templates', stepOrder: 11, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.cover', title: 'Profile Photo', phase: 4, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.cover', stepOrder: 12, isRequired: false, isSkippable: true },
  ],
  supplier_onboarding: [
    { stepCode: 'supplier.personal_info', title: 'Personal Info', phase: 1, triggerType: 'INTERNAL', fieldGroupCode: 'supplier.personal_info', stepOrder: 1, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.store_identity', title: 'Store Identity', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.store_identity', stepOrder: 2, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.store_details', title: 'Store Details', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.store_details', stepOrder: 3, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.business_registration', title: 'Business Registration', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.business_registration', stepOrder: 4, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.first_product', title: 'First Product', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.first_product', stepOrder: 5, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.product_details', title: 'Product Details', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.product_details', stepOrder: 6, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.inventory', title: 'Inventory', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.inventory', stepOrder: 7, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.pricing_extras', title: 'Pricing Extras', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.pricing_extras', stepOrder: 8, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.delivery', title: 'Delivery Settings', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.delivery', stepOrder: 9, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.verification', title: 'Business Permit', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.verification', stepOrder: 10, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.tax', title: 'Tax Documents', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.tax', stepOrder: 11, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.payout', title: 'Payout Account', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.payout', stepOrder: 12, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.cover', title: 'Store Photo', phase: 4, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.cover', stepOrder: 13, isRequired: false, isSkippable: true },
  ],
  job_seeker_onboarding: [
    { stepCode: 'jobseeker.personal_info', title: 'Personal Info', phase: 1, triggerType: 'INTERNAL', fieldGroupCode: 'jobseeker.personal_info', stepOrder: 1, isRequired: true, isSkippable: false },
    { stepCode: 'jobseeker.skills', title: 'Skills', phase: 2, triggerType: 'ACTION_GATE', fieldGroupCode: 'jobseeker.skills', stepOrder: 2, isRequired: true, isSkippable: false },
    { stepCode: 'jobseeker.profile', title: 'Profile Summary', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'jobseeker.profile', stepOrder: 3, isRequired: true, isSkippable: false },
    { stepCode: 'jobseeker.preferences', title: 'Job Preferences', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'jobseeker.preferences', stepOrder: 4, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.tools', title: 'Tools & Equipment', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'jobseeker.tools', stepOrder: 5, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.work_history', title: 'Work History', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'jobseeker.work_history', stepOrder: 6, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.portfolio', title: 'Portfolio', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.portfolio', stepOrder: 7, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.verification', title: 'Valid ID', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.verification', stepOrder: 8, isRequired: true, isSkippable: false },
    { stepCode: 'jobseeker.clearances', title: 'NBI/Police Clearance', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.clearances', stepOrder: 9, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.recommendations', title: 'Recommendations', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.recommendations', stepOrder: 10, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.tesda', title: 'TESDA / Certifications', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.certificates', stepOrder: 11, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.cover', title: 'Profile Photo', phase: 4, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.cover', stepOrder: 12, isRequired: false, isSkippable: true },
  ],
};

async function main() {
  for (const flow of flows) {
    const created = await prisma.onboardingFlow.upsert({
      where: { code: flow.code },
      update: { name: flow.name },
      create: { code: flow.code, name: flow.name, description: `${flow.name} flow` },
    });

    for (const step of steps[flow.code]) {
      await prisma.onboardingStep.upsert({
        where: { flowId_stepCode: { flowId: created.id, stepCode: step.stepCode } },
        update: { title: step.title, phase: step.phase, triggerType: step.triggerType, fieldGroupCode: step.fieldGroupCode, stepOrder: step.stepOrder, isRequired: step.isRequired, isSkippable: step.isSkippable },
        create: { flowId: created.id, ...step },
      });
    }
  }
  console.log('Seed complete: 4 flows, 42 steps');
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

- [ ] Run seed:
```bash
cd backend && pnpm prisma db seed
```
Expected output: `Seed complete: 4 flows, 42 steps`

### Task 1.11: Commit Phase 1

- [ ] Run:
```bash
cd backend
git add prisma/schema.prisma prisma/seed.ts prisma/migrations package.json
git commit -m "feat(schema): normalize onboarding schema — add phase/triggerType, drop OnboardingState, add Address/Document/Product/etc tables"
```

---

## Phase 2 — Backend: Auth + Users Surface

### Task 2.1: Rewrite signup DTO and handler

**Files:**
- Modify: `backend/src/modules/auth/application/commands/signup/signup.command.ts`
- Modify: `backend/src/modules/auth/application/commands/signup/signup.handler.ts`
- Modify: `backend/src/modules/auth/presentation/http/request-dtos/signup.request-dto.ts`

- [ ] Update `signup.request-dto.ts`:

```typescript
import { IsEmail, IsString, MinLength, IsOptional, IsMobilePhone } from 'class-validator';

export class SignupRequestDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() phone?: string;
}
```

- [ ] Update `signup.command.ts`:

```typescript
export class SignupCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone?: string,
  ) {}
}
```

- [ ] Update `signup.handler.ts` — replace `fullName` with `firstName`/`lastName`, remove `role` param, set `primaryRole: null` on user creation:

```typescript
// In the Prisma create call:
data: {
  supabaseAuthId: supabaseUser.id,
  email,
  firstName,
  lastName,
  phone,
  primaryRole: null,
}
```

### Task 2.2: Add POST /users/me/roles endpoint

**Files:**
- Modify: `backend/src/modules/users/presentation/controllers/users.controller.ts`
- Create: `backend/src/modules/users/application/commands/add-role/add-role.command.ts`
- Create: `backend/src/modules/users/application/commands/add-role/add-role.handler.ts`

- [ ] Create `add-role.command.ts`:

```typescript
import { Role } from '@prisma/client';

export class AddRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly role: Role,
  ) {}
}
```

- [ ] Create `add-role.handler.ts`:

```typescript
import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { AddRoleCommand } from './add-role.command';
import { CommandBus } from '@nestjs/cqrs';
import { StartOnboardingCommand } from '../../../onboarding/application/commands/start-onboarding/start-onboarding.command';
import { Role } from '@prisma/client';

@CommandHandler(AddRoleCommand)
export class AddRoleHandler implements ICommandHandler<AddRoleCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute({ userId, role }: AddRoleCommand): Promise<void> {
    await this.prisma.userRole.upsert({
      where: { userId_role: { userId, role } },
      update: {},
      create: { userId, role },
    });

    // Set primaryRole if none set
    await this.prisma.user.updateMany({
      where: { id: userId, primaryRole: null },
      data: { primaryRole: role },
    });

    // Seed onboarding progress for this role
    await this.commandBus.execute(new StartOnboardingCommand(userId, [role]));
  }
}
```

- [ ] Add endpoint to `users.controller.ts`:

```typescript
@Post('me/roles')
@HttpCode(HttpStatus.NO_CONTENT)
@UseGuards(SupabaseJwtGuard, EmailVerifiedGuard)
async addRole(
  @CurrentUser() user: AuthenticatedUser,
  @Body() body: { role: Role },
): Promise<void> {
  await this.commandBus.execute(new AddRoleCommand(user.id, body.role));
}
```

### Task 2.3: Add PATCH /users/me/primary-role and update GET /users/me

**Files:**
- Modify: `backend/src/modules/users/presentation/controllers/users.controller.ts`

- [ ] Add:

```typescript
@Patch('me/primary-role')
@UseGuards(SupabaseJwtGuard, EmailVerifiedGuard)
async setPrimaryRole(
  @CurrentUser() user: AuthenticatedUser,
  @Body() body: { role: Role },
): Promise<void> {
  await this.prisma.user.update({
    where: { id: user.id },
    data: { primaryRole: body.role },
  });
}
```

- [ ] Update `GET /users/me` response to include `{ user: { id, email, firstName, lastName, phone, avatarUrl, primaryRole }, roles: Role[] }`.

### Task 2.4: Commit Phase 2

```bash
git add backend/src/modules/auth backend/src/modules/users
git commit -m "feat(auth): rewrite signup DTO (firstName/lastName), add /users/me/roles and primary-role endpoints"
```

---

## Phase 3 — Backend: Onboarding Core

### Task 3.1: Delete OnboardingState repository

**Files:**
- Delete: `backend/src/modules/onboarding/infrastructure/repositories/onboarding-state.repository.ts` (if exists as legacy)
- Modify: `backend/src/modules/onboarding/onboarding.module.ts`

- [ ] Remove any `OnboardingStateRepository` provider that wraps the old `OnboardingState` Prisma model. Keep `UserOnboardingProgress`-based repository.

### Task 3.2: Rewrite StartOnboardingCommand to multi-role

**Files:**
- Modify: `backend/src/modules/onboarding/application/commands/start-onboarding/start-onboarding.command.ts`
- Modify: `backend/src/modules/onboarding/application/commands/start-onboarding/start-onboarding.handler.ts`

- [ ] Update command:

```typescript
import { Role } from '@prisma/client';

export class StartOnboardingCommand {
  constructor(
    public readonly userId: string,
    public readonly roles: Role[],
  ) {}
}
```

- [ ] Rewrite handler:

```typescript
@CommandHandler(StartOnboardingCommand)
export class StartOnboardingHandler implements ICommandHandler<StartOnboardingCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId, roles }: StartOnboardingCommand): Promise<void> {
    for (const role of roles) {
      const flow = await this.prisma.onboardingFlow.findFirst({
        where: { code: `${role.toLowerCase()}_onboarding` },
        include: { steps: true },
      });
      if (!flow) continue;

      const progress = await this.prisma.userOnboardingProgress.upsert({
        where: { userId_flowId: { userId, flowId: flow.id } },
        update: {},
        create: {
          userId,
          flowId: flow.id,
          status: 'NOT_STARTED',
          completionPercentage: 0,
        },
      });

      for (const step of flow.steps) {
        await this.prisma.userOnboardingStepProgress.upsert({
          where: { progressId_stepId: { progressId: progress.id, stepId: step.id } },
          update: {},
          create: {
            progressId: progress.id,
            stepId: step.id,
            status: 'PENDING',
          },
        });
      }
    }
  }
}
```

### Task 3.3: Create step-handler registry

**Files:**
- Create: `backend/src/modules/onboarding/application/commands/save-step/step-handler.registry.ts`

- [ ] Create:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

export interface StepHandler {
  handle(userId: string, progressId: string, stepId: string, data: unknown): Promise<void>;
}

@Injectable()
export class StepHandlerRegistry {
  private handlers = new Map<string, StepHandler>();

  register(fieldGroupCode: string, handler: StepHandler) {
    this.handlers.set(fieldGroupCode, handler);
  }

  get(fieldGroupCode: string): StepHandler | undefined {
    return this.handlers.get(fieldGroupCode);
  }
}
```

### Task 3.4: Create core step handlers (address, profile patches, document upload)

**Files:**
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/client-address.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/client-preferences.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/contractor-business-basics.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/contractor-service.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/portfolio-item.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/document-upload.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/payout-account.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/quotation-template.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/supplier-profile-patch.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/product.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/delivery-setting.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/job-seeker-profile-patch.handler.ts`
- Create: `backend/src/modules/onboarding/application/commands/save-step/handlers/cover-image.handler.ts`

- [ ] Create `client-address.handler.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  label: z.string().optional(),
  line1: z.string(),
  line2: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string(),
  province: z.string(),
  postalCode: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  isDefault: z.boolean().default(true),
});

@Injectable()
export class ClientAddressHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(userId: string, _progressId: string, _stepId: string, data: unknown): Promise<void> {
    const parsed = schema.parse(data);
    if (parsed.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, ownerType: 'CLIENT_PROFILE' },
        data: { isDefault: false },
      });
    }
    await this.prisma.address.create({
      data: { userId, ownerType: 'CLIENT_PROFILE', ...parsed },
    });
  }
}
```

- [ ] Create `document-upload.handler.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';
import { DocumentType, DocumentOwnerType } from '@prisma/client';

const schema = z.object({
  type: z.nativeEnum(DocumentType),
  ownerType: z.nativeEnum(DocumentOwnerType),
  url: z.string().url(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
  expiryDate: z.string().datetime().optional(),
});

@Injectable()
export class DocumentUploadHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(userId: string, _progressId: string, _stepId: string, data: unknown): Promise<void> {
    const parsed = schema.parse(data);
    await this.prisma.document.create({
      data: {
        ownerUserId: userId,
        ...parsed,
        expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined,
      },
    });
  }
}
```

- [ ] Create remaining handlers following same pattern (validate with zod, write to respective table). Handlers for: `client-preferences` → patch `ClientProfile`; `contractor-business-basics` → patch `ContractorProfile`; `contractor-service` → upsert `ContractorService`; `portfolio-item` → create `PortfolioItem`; `payout-account` → create `PayoutAccount`; `quotation-template` → upsert `QuotationTemplate`; `supplier-profile-patch` → patch `SupplierProfile`; `product` → create `Product`; `delivery-setting` → upsert `DeliverySetting`; `job-seeker-profile-patch` → patch `JobSeekerProfile`; `cover-image` → patch profile `avatarUrl`/`coverImageUrl`.

### Task 3.5: Wire SaveStep to registry + mark step completed

**Files:**
- Modify: `backend/src/modules/onboarding/application/commands/save-step/save-step.handler.ts`

- [ ] Rewrite:

```typescript
@CommandHandler(SaveStepCommand)
export class SaveStepHandler implements ICommandHandler<SaveStepCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: StepHandlerRegistry,
  ) {}

  async execute({ userId, role, stepCode, data }: SaveStepCommand): Promise<void> {
    const flow = await this.prisma.onboardingFlow.findFirstOrThrow({
      where: { code: `${role.toLowerCase()}_onboarding` },
    });
    const step = await this.prisma.onboardingStep.findFirstOrThrow({
      where: { flowId: flow.id, stepCode },
    });
    const progress = await this.prisma.userOnboardingProgress.findFirstOrThrow({
      where: { userId, flowId: flow.id },
    });

    if (step.fieldGroupCode) {
      const handler = this.registry.get(step.fieldGroupCode);
      if (handler) await handler.handle(userId, progress.id, step.id, data);
    }

    // Mark step completed
    await this.prisma.userOnboardingStepProgress.updateMany({
      where: { progressId: progress.id, stepId: step.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    // Recompute percentage
    const allSteps = await this.prisma.userOnboardingStepProgress.findMany({
      where: { progressId: progress.id },
    });
    const completed = allSteps.filter(s => s.status === 'COMPLETED' || s.status === 'SKIPPED').length;
    const pct = Math.round((completed / allSteps.length) * 100);

    // Advance currentStep to next pending required step
    const nextStep = await this.prisma.onboardingStep.findFirst({
      where: {
        flowId: flow.id,
        stepOrder: { gt: step.stepOrder },
        stepProgress: { some: { progressId: progress.id, status: 'PENDING' } },
      },
      orderBy: { stepOrder: 'asc' },
    });

    await this.prisma.userOnboardingProgress.update({
      where: { id: progress.id },
      data: {
        completionPercentage: pct,
        currentStepId: nextStep?.id ?? null,
        status: pct === 100 ? 'COMPLETED' : 'IN_PROGRESS',
        lastActivityAt: new Date(),
      },
    });
  }
}
```

### Task 3.6: Rewrite GetOnboardingState to new multi-role shape

**Files:**
- Modify: `backend/src/modules/onboarding/application/queries/get-onboarding-state/get-onboarding-state.handler.ts`
- Modify: `backend/src/modules/onboarding/application/queries/get-onboarding-state/get-onboarding-state.query.ts`

- [ ] Update query to accept `userId` only (returns all roles):

```typescript
export class GetOnboardingStateQuery {
  constructor(public readonly userId: string) {}
}
```

- [ ] Rewrite handler to return multi-role shape matching spec:

```typescript
@QueryHandler(GetOnboardingStateQuery)
export class GetOnboardingStateHandler implements IQueryHandler<GetOnboardingStateQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId }: GetOnboardingStateQuery) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        userRoles: true,
        onboardingProgress: {
          include: {
            flow: { include: { steps: true } },
            currentStep: true,
            stepProgress: { include: { step: true } },
          },
        },
      },
    });

    const roles = user.onboardingProgress.map(prog => {
      const phases = [1, 2, 3, 4].map(phase => ({
        phase,
        status: prog.stepProgress
          .filter(sp => sp.step.phase === phase)
          .every(sp => sp.status === 'COMPLETED' || sp.status === 'SKIPPED')
          ? 'COMPLETED' : 'IN_PROGRESS',
        steps: prog.stepProgress
          .filter(sp => sp.step.phase === phase)
          .map(sp => ({
            code: sp.step.stepCode,
            status: sp.status,
            isRequired: sp.step.isRequired,
            isSkippable: sp.step.isSkippable,
            triggerType: sp.step.triggerType,
          })),
      }));

      const currentPhase = prog.currentStep?.phase ?? 1;

      return {
        role: prog.flow.code.replace('_onboarding', '').toUpperCase(),
        flowCode: prog.flow.code,
        status: prog.status,
        completionPercentage: prog.completionPercentage,
        currentPhase,
        currentStep: prog.currentStep ? {
          code: prog.currentStep.stepCode,
          title: prog.currentStep.title,
          phase: prog.currentStep.phase,
          triggerType: prog.currentStep.triggerType,
          fieldGroupCode: prog.currentStep.fieldGroupCode,
        } : null,
        blockers: [],
        phases,
      };
    });

    return { userId, primaryRole: user.primaryRole, roles };
  }
}
```

### Task 3.7: Add new controller endpoints

**Files:**
- Modify: `backend/src/modules/onboarding/presentation/controllers/onboarding.controller.ts`

- [ ] Add `POST /onboarding/role-selection` → dispatches `AddRoleCommand` for each role.
- [ ] Add `POST /onboarding/step/:stepCode/skip` → marks step SKIPPED.
- [ ] Update `GET /onboarding/state` to use new `GetOnboardingStateQuery(userId)`.

### Task 3.8: Commit Phase 3

```bash
git add backend/src/modules/onboarding backend/src/modules/users
git commit -m "feat(onboarding): multi-role StartOnboarding, step-handler registry, SaveStep dispatch, new state query shape"
```

---

## Phase 4 — Backend: Verification Gate + Domain Events + Tests

### Task 4.1: Create VerificationGateService

**Files:**
- Create: `backend/src/modules/onboarding/domain/services/verification-gate.service.ts`

- [ ] Create:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { DocumentType } from '@prisma/client';

export class VerificationRequiredException extends Error {
  constructor(public readonly missingDocTypes: DocumentType[]) {
    super('Verification required');
  }
}

type GatedAction = 'quote.accept' | 'order.fulfill' | 'job.contact';

const REQUIRED_DOCS: Record<GatedAction, DocumentType[]> = {
  'quote.accept': ['VALID_ID', 'BUSINESS_PERMIT'],
  'order.fulfill': ['BUSINESS_PERMIT'],
  'job.contact': ['VALID_ID'],
};

@Injectable()
export class VerificationGateService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanPerform(userId: string, action: GatedAction): Promise<void> {
    const required = REQUIRED_DOCS[action];
    const approved = await this.prisma.document.findMany({
      where: { ownerUserId: userId, type: { in: required }, status: 'APPROVED' },
      select: { type: true },
    });
    const approvedTypes = new Set(approved.map(d => d.type));
    const missing = required.filter(t => !approvedTypes.has(t));
    if (missing.length > 0) throw new VerificationRequiredException(missing);
  }
}
```

### Task 4.2: Create VerificationGuard and decorator

**Files:**
- Create: `backend/src/modules/auth/presentation/guards/verification.guard.ts`

- [ ] Create:

```typescript
import { CanActivate, ExecutionContext, Injectable, SetMetadata, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VerificationGateService } from '../../../onboarding/domain/services/verification-gate.service';

export const RequiresVerification = (action: string) => SetMetadata('requiredVerification', action);

@Injectable()
export class VerificationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly gateService: VerificationGateService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const action = this.reflector.get<string>('requiredVerification', ctx.getHandler());
    if (!action) return true;
    const req = ctx.switchToHttp().getRequest();
    try {
      await this.gateService.assertCanPerform(req.user.id, action as any);
      return true;
    } catch {
      throw new ForbiddenException('Verification documents required');
    }
  }
}
```

### Task 4.3: Write Jest tests

**Files:**
- Create: `backend/test/onboarding/seed.spec.ts`
- Create: `backend/test/onboarding/save-step-handler-registry.spec.ts`
- Create: `backend/test/onboarding/signup-to-first-step.e2e.spec.ts`
- Create: `backend/test/onboarding/multi-role.e2e.spec.ts`
- Create: `backend/test/onboarding/verification-gate.spec.ts`

- [ ] Create `seed.spec.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Seed', () => {
  it('should have 4 flows', async () => {
    const flows = await prisma.onboardingFlow.findMany();
    expect(flows).toHaveLength(4);
  });

  it('should have at least 42 steps total', async () => {
    const steps = await prisma.onboardingStep.findMany();
    expect(steps.length).toBeGreaterThanOrEqual(42);
  });

  it('all steps should have phase set', async () => {
    const steps = await prisma.onboardingStep.findMany();
    steps.forEach(s => expect(s.phase).toBeGreaterThanOrEqual(1));
  });

  afterAll(() => prisma.$disconnect());
});
```

- [ ] Create `verification-gate.spec.ts`:

```typescript
import { VerificationGateService, VerificationRequiredException } from '../../src/modules/onboarding/domain/services/verification-gate.service';
import { PrismaService } from '../../src/shared/infrastructure/prisma/prisma.service';

describe('VerificationGateService', () => {
  let service: VerificationGateService;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(() => {
    prisma = { document: { findMany: jest.fn() } } as any;
    service = new VerificationGateService(prisma);
  });

  it('throws when required docs missing', async () => {
    (prisma.document.findMany as jest.Mock).mockResolvedValue([]);
    await expect(service.assertCanPerform('user1', 'quote.accept')).rejects.toBeInstanceOf(VerificationRequiredException);
  });

  it('passes when all required docs approved', async () => {
    (prisma.document.findMany as jest.Mock).mockResolvedValue([
      { type: 'VALID_ID' }, { type: 'BUSINESS_PERMIT' },
    ]);
    await expect(service.assertCanPerform('user1', 'quote.accept')).resolves.toBeUndefined();
  });
});
```

- [ ] Run tests:
```bash
cd backend && pnpm test
```
Expected: all pass.

### Task 4.4: Commit Phase 4

```bash
git add backend/src/modules/onboarding/domain/services backend/src/modules/auth/presentation/guards/verification.guard.ts backend/test
git commit -m "feat(verification): VerificationGateService, VerificationGuard, Jest tests"
```

---

## Phase 5 — Frontend: Infra + Auth + API Hooks

### Task 5.1: Install frontend dependencies

- [ ] Run:
```bash
cd frontend && pnpm add @supabase/supabase-js @tanstack/react-query @tanstack/react-query-devtools react-hook-form @hookform/resolvers
```

### Task 5.2: Create supabase.ts singleton

**Files:**
- Create: `frontend/src/lib/supabase.ts`

- [ ] Create:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      storageKey: 'struktura:sb-session',
    },
  },
);
```

### Task 5.3: Create query-client.ts

**Files:**
- Create: `frontend/src/lib/query-client.ts`

- [ ] Create:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});
```

### Task 5.4: Rewrite api.ts with token + refresh

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] Rewrite to:

```typescript
import { supabase } from './supabase';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    const { data } = await supabase.auth.refreshSession();
    if (data.session) {
      setAccessToken(data.session.access_token);
      headers['Authorization'] = `Bearer ${data.session.access_token}`;
      const retry = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        method, headers, body: body ? JSON.stringify(body) : undefined,
      });
      return retry.json();
    }
  }

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const apiGet = <T>(path: string) => request<T>('GET', path);
export const apiPost = <T>(path: string, body?: unknown) => request<T>('POST', path, body);
export const apiPatch = <T>(path: string, body?: unknown) => request<T>('PATCH', path, body);
export const apiDelete = <T>(path: string) => request<T>('DELETE', path);
```

### Task 5.5: Rewrite auth-context.tsx

**Files:**
- Modify: `frontend/src/lib/auth-context.tsx`

- [ ] Rewrite (drop all mocks, FrontendRole, localStorage OTP):

```typescript
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from './supabase';
import { setAccessToken } from './api';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export type BackendRole = 'CLIENT' | 'CONTRACTOR' | 'SUPPLIER' | 'JOB_SEEKER' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';

export type AppUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: BackendRole[];
  primaryRole: BackendRole | null;
  emailVerified: boolean;
};

type AuthContextValue = {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (token: string) => {
    setAccessToken(token);
    const { apiGet } = await import('./api');
    const data = await apiGet<{ user: AppUser }>('/users/me');
    setUser(data.user);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) loadUser(session.access_token).finally(() => setIsLoading(false));
      else setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadUser(session.access_token);
      else { setUser(null); setAccessToken(null); }
    });
    return () => subscription.unsubscribe();
  }, [loadUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    const { apiPost } = await import('./api');
    await apiPost('/auth/signup', { email, password, firstName, lastName, phone });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!session, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
```

### Task 5.6: Rewrite signup/login/verify pages

**Files:**
- Modify: `frontend/src/components/auth/signup-page.tsx`
- Modify: `frontend/src/components/auth/login-page.tsx`
- Modify: `frontend/src/components/auth/verify-email-page.tsx`

- [ ] `signup-page.tsx` — use RHF + zod. Fields: `firstName`, `lastName`, `email`, `password`, `phone`. Drop role toggle. On submit call `signUp()`.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth-context';
import { useNavigate } from '@tanstack/react-router';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    await signUp(data.email, data.password, data.firstName, data.lastName, data.phone);
    navigate({ to: '/auth/verify-email' });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="First name" />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      <input {...register('lastName')} placeholder="Last name" />
      <input {...register('email')} placeholder="Email" />
      <input {...register('password')} type="password" placeholder="Password" />
      <input {...register('phone')} placeholder="Phone (optional)" />
      <button type="submit" disabled={isSubmitting}>Sign up</button>
    </form>
  );
}
```

- [ ] `login-page.tsx` — call `supabase.auth.signInWithPassword`. On success navigate to `/dashboard` or `?from`.
- [ ] `verify-email-page.tsx` — show "Check inbox" + resend via `supabase.auth.resend({ type: 'signup', email })`. Drop mock OTP.

### Task 5.7: Add auth callback route

**Files:**
- Create: `frontend/src/routes/auth/callback.tsx`

- [ ] Create:

```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.href).then(() => {
      if (!user || user.roles.length === 0) navigate({ to: '/onboarding/role-select' });
      else navigate({ to: '/dashboard' });
    });
  }, [navigate, user]);

  return <div>Verifying...</div>;
}
```

### Task 5.8: Create API resource hooks

**Files:**
- Create: `frontend/src/lib/api/users.ts`
- Create: `frontend/src/lib/api/onboarding.ts`

- [ ] Create `frontend/src/lib/api/users.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import type { AppUser, BackendRole } from '@/lib/auth-context';

export const userKeys = {
  me: ['users', 'me'] as const,
};

export function useMe() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => apiGet<{ user: AppUser }>('/users/me').then(r => r.user),
  });
}

export function useAddRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: BackendRole) => apiPost('/users/me/roles', { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me }),
  });
}

export function useSetPrimaryRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (role: BackendRole) => apiPatch('/users/me/primary-role', { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me }),
  });
}
```

- [ ] Create `frontend/src/lib/api/onboarding.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '@/lib/api';

export const onboardingKeys = {
  state: ['onboarding', 'state'] as const,
};

export function useOnboardingState() {
  return useQuery({
    queryKey: onboardingKeys.state,
    queryFn: () => apiGet<any>('/onboarding/state'),
  });
}

export function useSaveStep(role: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepCode, data }: { stepCode: string; data: unknown }) =>
      apiPost(`/onboarding/step/${stepCode}`, { role, data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: onboardingKeys.state }),
  });
}

export function useSkipStep(role: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stepCode: string) => apiPost(`/onboarding/step/${stepCode}/skip`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: onboardingKeys.state }),
  });
}
```

### Task 5.9: Add QueryClient provider + route guards

**Files:**
- Modify: `frontend/src/main.tsx`
- Create: `frontend/src/lib/route-guards.ts`

- [ ] In `main.tsx`, wrap `AuthProvider` with `QueryClientProvider`:

```typescript
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
// ...
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    {/* app */}
  </AuthProvider>
</QueryClientProvider>
```

- [ ] Create `frontend/src/lib/route-guards.ts`:

```typescript
import { redirect } from '@tanstack/react-router';

export function requireAuth(ctx: { context: { auth: { isAuthenticated: boolean } }; location: { href: string } }) {
  if (!ctx.context.auth.isAuthenticated) {
    throw redirect({ to: '/auth/login', search: { from: ctx.location.href } });
  }
}

export function requireNoRoles(ctx: { context: { auth: { user: { roles: string[] } | null } } }) {
  const user = ctx.context.auth.user;
  if (user && user.roles.length > 0) {
    throw redirect({ to: '/dashboard' });
  }
}
```

### Task 5.10: Commit Phase 5

```bash
git add frontend/src/lib frontend/src/components/auth frontend/src/routes/auth frontend/src/main.tsx
git commit -m "feat(frontend-auth): Supabase auth, React Query, rewritten auth-context, signup/login/verify pages, API hooks"
```

---

## Phase 6 — Frontend: Role Selection + Multi-Role Context + Per-Role Wizard

### Task 6.1: Rebuild role-select screen

**Files:**
- Modify: `frontend/src/routes/onboarding/role-select.tsx`

- [ ] Rewrite:

```typescript
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useAddRole } from '@/lib/api/users';
import { requireAuth } from '@/lib/route-guards';
import type { BackendRole } from '@/lib/auth-context';

export const Route = createFileRoute('/onboarding/role-select')({
  beforeLoad: requireAuth,
  component: RoleSelectPage,
});

const ROLES: { role: BackendRole; label: string; description: string }[] = [
  { role: 'CLIENT', label: 'Client', description: 'Buy products and hire contractors' },
  { role: 'CONTRACTOR', label: 'Contractor', description: 'Offer construction services' },
  { role: 'SUPPLIER', label: 'Supplier', description: 'Sell building materials' },
  { role: 'JOB_SEEKER', label: 'Job Seeker', description: 'Find work in construction' },
];

function RoleSelectPage() {
  const [selected, setSelected] = useState<BackendRole[]>([]);
  const addRole = useAddRole();
  const navigate = useNavigate();

  const toggle = (role: BackendRole) =>
    setSelected(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);

  const submit = async () => {
    await Promise.all(selected.map(role => addRole.mutateAsync(role)));
    navigate({ to: '/dashboard' });
  };

  return (
    <div>
      <h1>Choose your roles</h1>
      <p>You can add roles anytime.</p>
      {ROLES.map(({ role, label, description }) => (
        <label key={role}>
          <input type="checkbox" checked={selected.includes(role)} onChange={() => toggle(role)} />
          <strong>{label}</strong> — {description}
        </label>
      ))}
      <button onClick={submit} disabled={selected.length === 0 || addRole.isPending}>
        Continue
      </button>
    </div>
  );
}
```

### Task 6.2: Replace role-context with multi-role provider

**Files:**
- Modify: `frontend/src/components/dashboard/role-context.tsx`

- [ ] Rewrite:

```typescript
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { BackendRole } from '@/lib/auth-context';
import { useMe } from '@/lib/api/users';

type RoleContextValue = {
  roles: BackendRole[];
  activeRole: BackendRole | null;
  setActiveRole: (role: BackendRole) => void;
};

const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { data: user } = useMe();
  const [activeRole, setActiveRoleState] = useState<BackendRole | null>(null);

  const setActiveRole = (role: BackendRole) => {
    sessionStorage.setItem('struktura:activeRole', role);
    setActiveRoleState(role);
  };

  const roles = (user?.roles ?? []) as BackendRole[];
  const resolvedActive = activeRole ?? (user?.primaryRole as BackendRole | null) ?? roles[0] ?? null;

  return (
    <RoleContext.Provider value={{ roles, activeRole: resolvedActive, setActiveRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be inside RoleProvider');
  return ctx;
}
```

### Task 6.3: Add role-switcher to topbar

**Files:**
- Create: `frontend/src/components/shared/role-switcher.tsx`

- [ ] Create:

```typescript
import { useRole } from '@/components/dashboard/role-context';
import { useSetPrimaryRole } from '@/lib/api/users';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function RoleSwitcher() {
  const { roles, activeRole, setActiveRole } = useRole();
  const setPrimary = useSetPrimaryRole();

  if (roles.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full border px-3 py-1 text-sm">{activeRole}</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {roles.map(role => (
          <DropdownMenuItem key={role} onClick={() => { setActiveRole(role); setPrimary.mutate(role); }}>
            {role}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Task 6.4: Build per-role wizard route + role-flows config

**Files:**
- Create: `frontend/src/components/onboarding/role-flows.ts`
- Modify: `frontend/src/routes/onboarding/$role.tsx`

- [ ] Create `role-flows.ts` with declarative step config per role (stepCode, title, phase, fieldGroupCode, schema reference). Example:

```typescript
import { z } from 'zod';
import type { BackendRole } from '@/lib/auth-context';

export const clientAddressSchema = z.object({
  line1: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  isDefault: z.boolean().default(true),
});

export type RoleFlowStep = {
  stepCode: string;
  title: string;
  phase: 1 | 2 | 3 | 4;
  fieldGroupCode: string;
  schema: z.ZodTypeAny;
  component: React.ComponentType<{ onNext: (data: unknown) => void; onSkip?: () => void }>;
};

// Each role exports its step array — components are imported lazily in $role.tsx
export const ROLE_STEPS: Partial<Record<BackendRole, RoleFlowStep[]>> = {
  CLIENT: [
    { stepCode: 'client.address', title: 'Delivery Address', phase: 2, fieldGroupCode: 'client.address', schema: clientAddressSchema, component: null as any },
    // ... other steps
  ],
  // CONTRACTOR, SUPPLIER, JOB_SEEKER steps follow same pattern
};
```

- [ ] Rebuild `$role.tsx` to read `useOnboardingState()`, find current step for the role, render matching component from `ROLE_STEPS`, call `useSaveStep` on submit.

### Task 6.5: Rewrite existing step components with RHF

**Files:**
- Modify: `frontend/src/components/onboarding/steps/business-info-step.tsx`
- Modify: `frontend/src/components/onboarding/steps/documents-step.tsx`
- Modify: `frontend/src/components/onboarding/steps/job-seeker-preferences-step.tsx`
- Modify: `frontend/src/components/onboarding/steps/payout-info-step.tsx`
- Modify: `frontend/src/components/onboarding/steps/personal-info-step.tsx`
- Modify: `frontend/src/components/onboarding/steps/portfolio-step.tsx`
- Modify: `frontend/src/components/onboarding/steps/preferences-step.tsx`
- Modify: `frontend/src/components/onboarding/steps/skills-step.tsx`
- Modify: `frontend/src/components/onboarding/steps/trade-profile-step.tsx`

- [ ] Each: add `useForm({ resolver: zodResolver(schema) })`, wire all fields to `register()`, call `onNext(data)` on submit. Remove any direct API calls — parent wizard handles submission.

### Task 6.6: Commit Phase 6

```bash
git add frontend/src/routes/onboarding frontend/src/components/onboarding frontend/src/components/dashboard/role-context.tsx frontend/src/components/shared/role-switcher.tsx frontend/src/lib/api/users.ts
git commit -m "feat(frontend-onboarding): role-select screen, multi-role context, role-switcher, per-role wizard with RHF steps"
```

---

## Phase 7 — Frontend: Dashboard Banner + Discovery Cards + Action Gates + Cleanup

### Task 7.1: Dashboard onboarding banner

**Files:**
- Create: `frontend/src/components/dashboard/onboarding-banner.tsx`

- [ ] Create:

```typescript
import { useOnboardingState } from '@/lib/api/onboarding';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Link } from '@tanstack/react-router';
import { useState } from 'react';

export function OnboardingBanner() {
  const { data } = useOnboardingState();
  const [dismissed, setDismissed] = useState<string[]>(() => {
    try { return JSON.parse(sessionStorage.getItem('struktura:bannerDismissed') || '[]'); }
    catch { return []; }
  });

  const dismiss = (role: string) => {
    const next = [...dismissed, role];
    setDismissed(next);
    sessionStorage.setItem('struktura:bannerDismissed', JSON.stringify(next));
  };

  if (!data?.roles) return null;

  const incomplete = data.roles.filter(
    (r: any) => r.status !== 'COMPLETED' && !dismissed.includes(r.role)
  );
  if (incomplete.length === 0) return null;

  return (
    <div className="space-y-2 p-4">
      {incomplete.map((r: any) => (
        <Card key={r.role} className="flex items-center gap-4 p-4">
          <div className="flex-1">
            <p className="font-medium">{r.role} setup — {r.completionPercentage}% complete</p>
            <Progress value={r.completionPercentage} className="mt-1" />
          </div>
          <Link to={`/onboarding/${r.role.toLowerCase()}`} className="text-sm font-medium">
            Finish setup
          </Link>
          <button onClick={() => dismiss(r.role)} className="text-muted-foreground text-xs">×</button>
        </Card>
      ))}
    </div>
  );
}
```

### Task 7.2: Discovery Card component

**Files:**
- Create: `frontend/src/components/dashboard/discovery-card.tsx`

- [ ] Create:

```typescript
import { useOnboardingState } from '@/lib/api/onboarding';
import { useAddRole } from '@/lib/api/users';
import { useNavigate } from '@tanstack/react-router';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import type { BackendRole } from '@/lib/auth-context';
import { useState } from 'react';

export function DiscoveryCard({ targetRole }: { targetRole: 'CONTRACTOR' | 'SUPPLIER' }) {
  const { data } = useOnboardingState();
  const addRole = useAddRole();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(`struktura:discoveryDismissed:${targetRole}`) === '1'
  );

  if (dismissed) return null;
  const roleData = data?.roles?.find((r: any) => r.role === targetRole);

  if (!roleData) {
    return (
      <Card className="p-4">
        <h3>Become a {targetRole === 'CONTRACTOR' ? 'Contractor' : 'Supplier'}</h3>
        <p className="text-sm text-muted-foreground mt-1">Earn more by offering your services.</p>
        <Button className="mt-3" onClick={async () => {
          await addRole.mutateAsync(targetRole);
          navigate({ to: `/onboarding/${targetRole.toLowerCase()}` });
        }}>Get started</Button>
        <button onClick={() => { setDismissed(true); sessionStorage.setItem(`struktura:discoveryDismissed:${targetRole}`, '1'); }}
          className="ml-4 text-xs text-muted-foreground">Dismiss</button>
      </Card>
    );
  }

  if (roleData.status !== 'COMPLETED') {
    return (
      <Card className="p-4">
        <h3>{targetRole} setup in progress</h3>
        <Progress value={roleData.completionPercentage} className="mt-2" />
        <Button variant="outline" className="mt-3" onClick={() => navigate({ to: `/onboarding/${targetRole.toLowerCase()}` })}>
          Resume
        </Button>
      </Card>
    );
  }

  return null; // Completed: render quick-action-cards instead
}
```

### Task 7.3: Action Gate dialog + provider

**Files:**
- Create: `frontend/src/components/onboarding/action-gate-dialog.tsx`
- Create: `frontend/src/components/onboarding/action-gate-provider.tsx`

- [ ] Create `action-gate-provider.tsx`:

```typescript
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { ActionGateDialog } from './action-gate-dialog';
import type { BackendRole } from '@/lib/auth-context';

type GateOptions = { role: BackendRole; phase: number; addRoleIfMissing?: boolean; reason?: string };
type GateResult = 'completed' | 'cancelled';

type ActionGateContextValue = {
  require: (opts: GateOptions) => Promise<GateResult>;
};

const ActionGateContext = createContext<ActionGateContextValue | null>(null);

export function ActionGateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<GateOptions | null>(null);
  const resolveRef = useRef<((r: GateResult) => void) | null>(null);

  const require = (options: GateOptions): Promise<GateResult> => {
    return new Promise(resolve => {
      setOpts(options);
      setOpen(true);
      resolveRef.current = resolve;
    });
  };

  const onComplete = () => { setOpen(false); resolveRef.current?.('completed'); };
  const onCancel = () => { setOpen(false); resolveRef.current?.('cancelled'); };

  return (
    <ActionGateContext.Provider value={{ require }}>
      {children}
      {opts && <ActionGateDialog open={open} opts={opts} onComplete={onComplete} onCancel={onCancel} />}
    </ActionGateContext.Provider>
  );
}

export function useActionGate() {
  const ctx = useContext(ActionGateContext);
  if (!ctx) throw new Error('useActionGate must be inside ActionGateProvider');
  return ctx;
}
```

- [ ] Create `action-gate-dialog.tsx` — shadcn Dialog (desktop) / vaul Drawer (mobile). Show only steps for `opts.phase`. Prevent close via `onPointerDownOutside` + `onEscapeKeyDown`. On last required step completed: call `onComplete`.

### Task 7.4: Wire Action Gates to touchpoints

**Files:**
- Modify: `frontend/src/components/jobs/job-detail-page.tsx`
- Modify: `frontend/src/components/shop/product-detail-page.tsx`
- Modify: `frontend/src/components/contractors/contractor-profile-page.tsx`

- [ ] `job-detail-page.tsx` — replace Apply button handler:

```typescript
const { require } = useActionGate();
const handleApply = async () => {
  const result = await require({ role: 'JOB_SEEKER', phase: 2, addRoleIfMissing: true });
  if (result === 'cancelled') return;
  await apiPost(`/applications`, { jobId });
};
```

- [ ] `product-detail-page.tsx` — replace Buy handler:

```typescript
const handleBuy = async () => {
  let result = await require({ role: 'CLIENT', phase: 2 });
  if (result === 'cancelled') return;
  result = await require({ role: 'CLIENT', phase: 3 });
  if (result === 'cancelled') return;
  navigate({ to: '/cart' });
};
```

- [ ] `contractor-profile-page.tsx` — replace message link with Request Quotation button using same pattern.

### Task 7.5: Verification soft-locks

**Files:**
- Create: `frontend/src/hooks/use-verification-status.ts`
- Create: `frontend/src/components/shared/locked-action-button.tsx`

- [ ] Create `use-verification-status.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { BackendRole } from '@/lib/auth-context';

export function useVerificationStatus(role: BackendRole) {
  return useQuery({
    queryKey: ['verification', role],
    queryFn: () => apiGet<{ status: string; missingDocs: string[] }>(`/users/me/verification?role=${role}`),
  });
}
```

- [ ] Create `locked-action-button.tsx`:

```typescript
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export function LockedActionButton({ children, reason, unlockHref }: {
  children: React.ReactNode;
  reason: string;
  unlockHref: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button disabled className="gap-2">
          <Lock className="h-4 w-4" />
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{reason}</p>
        <Link to={unlockHref} className="text-xs underline">Upload documents</Link>
      </TooltipContent>
    </Tooltip>
  );
}
```

### Task 7.6: Cleanup — remove all legacy references

- [ ] Run:
```bash
cd /Users/bn.cm/Desktop/Personal/B2B-platform
grep -r "OnboardingState\|OnboardingStatus\|fullName\|FrontendRole\|buyer.*seller\|hasCompletedOnboarding\|getCachedOnboardingState\|AUTH_KEY.*localStorage\|ONBOARDING_KEY.*localStorage" --include="*.ts" --include="*.tsx" -l
```

- [ ] Remove or replace every reference found. Update `app-sidebar.tsx`, `dashboard-index.tsx`, `sidebar-nav.tsx`, `shadcn-dashboard.tsx` to use new `useRole()` shape.

### Task 7.7: Add supplier + job-seeker dashboard routes

**Files:**
- Create: `frontend/src/routes/dashboard/supplier.tsx`
- Create: `frontend/src/routes/dashboard/job-seeker.tsx`

- [ ] Each: `beforeLoad: requireAuth` + `requireRole` check. Render role-specific stats + `OnboardingBanner` + `DiscoveryCard`.

### Task 7.8: Final lint + type check

- [ ] Run:
```bash
cd frontend && pnpm lint && pnpm tsc --noEmit
```
Expected: no errors.

### Task 7.9: Commit Phase 7

```bash
git add frontend/src/components/dashboard frontend/src/components/onboarding/action-gate-dialog.tsx frontend/src/components/onboarding/action-gate-provider.tsx frontend/src/components/shared frontend/src/hooks frontend/src/routes/dashboard
git commit -m "feat(frontend-dashboard): onboarding banner, discovery cards, action gates, verification soft-locks, supplier/job-seeker dashboards, cleanup"
```

---

## Verification Checklist

- [ ] `pnpm prisma migrate reset && pnpm prisma db seed` → "Seed complete: 4 flows, 42 steps"
- [ ] `GET /onboarding/state` returns `{ userId, primaryRole, roles: [...] }` multi-role shape
- [ ] Signup → verify email → role-select → dashboard: topbar shows role-switcher, banner shows progress rows
- [ ] Buy flow triggers CLIENT phase 2 → phase 3 Action Gate in sequence
- [ ] Contractor without approved docs → "Accept Quote" button renders locked with tooltip
- [ ] `grep` finds zero references to `OnboardingState`, `FrontendRole`, `fullName`, `buyer`/`seller`, mock OTP localStorage keys
- [ ] `pnpm --filter backend test` passes
- [ ] `pnpm --filter frontend lint && tsc --noEmit` passes
