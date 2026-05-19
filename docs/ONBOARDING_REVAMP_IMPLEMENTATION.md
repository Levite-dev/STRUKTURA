# STRUKTURA Onboarding Revamp — Technical Implementation Plan

## Context

Current onboarding is half-built and diverges from the new STRUKTURA spec:

- Schema dual-tracks onboarding (`OnboardingState` legacy + `UserOnboardingProgress` new flow-based).
- `OnboardingStep` has no `phase` or `triggerType` metadata, so UI cannot distinguish phase 1–4 or Action Gate vs Persistent Card patterns.
- Profile tables stuff documents, portfolio, services, products, delivery, addresses into JSON blobs or flat columns — no normalized entities.
- Frontend signup mixes role selection inline (buyer/seller mapped to CLIENT/SUPPLIER), supports only 2 of 4 public roles, mocks email OTP in localStorage, has no Supabase Auth, no role picker screen, no progress banner, no Discovery Card, no Action Gate, and no API wiring.

Goal: a full vertical revamp that brings backend schema + onboarding module + frontend UX + Supabase Auth + API wiring in line with the spec. Pre-prod repo — destructive consolidation allowed. Full normalization. Admin/Moderator/Support roles out of scope (internal provisioning, revisit later).

Outcome: a user can sign up → verify email via Supabase → pick one or more roles → complete role-specific phased onboarding (or skip non-required steps) → land in the right dashboard with a live progress banner and Discovery Cards for unactivated supply-side roles, while Action Gates intercept Apply / Buy / Request-Quotation when prerequisite role onboarding is incomplete.

---

## Critical Files

**Backend**
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts` (new)
- `backend/src/modules/onboarding/application/commands/save-step/step-handler.registry.ts` (new)
- `backend/src/modules/onboarding/presentation/controllers/onboarding.controller.ts`
- `backend/src/modules/onboarding/application/commands/start-onboarding/start-onboarding.handler.ts`
- `backend/src/modules/onboarding/application/queries/get-onboarding-state/get-onboarding-state.handler.ts`
- `backend/src/modules/auth/application/commands/signup/signup.command.ts` + handler + DTO
- `backend/src/modules/users/presentation/controllers/users.controller.ts`
- `backend/src/modules/onboarding/domain/services/verification-gate.service.ts` (new)
- `backend/src/modules/auth/presentation/guards/verification.guard.ts` (new)

**Frontend**
- `frontend/src/lib/supabase.ts` (new)
- `frontend/src/lib/query-client.ts` (new)
- `frontend/src/lib/auth-context.tsx` (full rewrite)
- `frontend/src/lib/api.ts`
- `frontend/src/lib/route-guards.ts` (new)
- `frontend/src/lib/api/{users,onboarding,addresses,documents,products,services,verification,quotations,keys}.ts` (new)
- `frontend/src/routes/onboarding/role-select.tsx` (rebuild)
- `frontend/src/routes/onboarding/$role.tsx` (rebuild)
- `frontend/src/routes/auth/callback.tsx` (new)
- `frontend/src/components/auth/{signup-page,login-page,verify-email-page}.tsx`
- `frontend/src/components/onboarding/{role-flows.ts, action-gate-dialog.tsx, action-gate-provider.tsx}` (new)
- `frontend/src/components/onboarding/fields/*` (new RHF field primitives)
- `frontend/src/components/dashboard/{onboarding-banner.tsx, discovery-card.tsx, quick-action-cards.tsx}` (new)
- `frontend/src/components/dashboard/role-context.tsx` (replace with multi-role)
- `frontend/src/components/shared/{role-switcher.tsx, locked-action-button.tsx, dashboard-shell.tsx}`
- `frontend/src/components/jobs/job-detail-page.tsx`
- `frontend/src/components/shop/product-detail-page.tsx`
- `frontend/src/components/contractors/contractor-profile-page.tsx`

---

# Part A — Backend

## A1. Prisma schema diff (`backend/prisma/schema.prisma`)

### New enums

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

### Drop

- Model `OnboardingState` and its repository.
- Enum `OnboardingStatus` (only legacy consumer).
- `User.fullName` → split into `firstName String?` + `lastName String?`.

### `OnboardingStep` additions

```prisma
phase          Int
triggerType    OnboardingTriggerType @default(INTERNAL)
fieldGroupCode String?
@@index([flowId, phase])
```

### New normalized tables

| Table | Key fields | Notes |
|---|---|---|
| `Address` | `userId`, `ownerType: AddressOwnerType`, `label`, `line1`, `line2?`, `barangay?`, `city`, `province`, `postalCode?`, `contactName?`, `contactPhone?`, `isDefault` | Indexes `[userId, ownerType]`, `[userId, isDefault]`. |
| `Document` | `ownerUserId`, `ownerType: DocumentOwnerType`, `type: DocumentType`, `status: DocumentStatus @default(PENDING)`, `url`, `fileName?`, `mimeType?`, `sizeBytes?`, `expiryDate?`, `reviewedBy?`, `reviewedAt?`, `rejectionNote?` | Indexes `[ownerUserId, type]`, `[ownerUserId, status]`, `[type, status]`. |
| `PortfolioItem` | `ownerUserId`, `ownerType: PortfolioOwnerType`, `title`, `description?`, `imageUrls String[]`, `projectDate?`, `clientName?`, `location?`, `tagsJson Json?`, `displayOrder Int @default(0)` | Index `[ownerUserId, ownerType]`. |
| `ContractorService` | `contractorProfileId`, `name`, `categories String[]`, `pricingType: PricingType`, `basePriceMin Decimal?`, `basePriceMax Decimal?`, `serviceArea?`, `description?`, `availabilityStatus?`, `isActive` | Index `[contractorProfileId, isActive]`. |
| `Product` | `supplierProfileId`, `name`, `categoryId`, `unit`, `price Decimal`, `marketPrice Decimal?`, `discount Decimal?`, `availableStock Int`, `reservedStock Int @default(0)`, `reorderLevel Int?`, `warehouseLocation?`, `stockUnit?`, `description?`, `brand?`, `sku?`, `quality?`, `specifications Json?`, `images String[]`, `priceNotes?`, `isActive` | Unique `[supplierProfileId, sku]`. Indexes `[supplierProfileId, isActive]`, `[categoryId]`. |
| `PayoutAccount` | `userId`, `method: PayoutMethod`, `bankName?`, `accountName?`, `accountNumber?`, `gcashNumber?`, `mayaNumber?`, `isDefault`, `verifiedAt?` | Index `[userId, method]`. |
| `DeliverySetting` | `supplierProfileId @unique`, `deliveryAreas String[]`, `deliveryFee Decimal?`, `deliveryAvailable`, `pickupAvailable`, `pickupAddress?`, `minOrderForDelivery Decimal?`, `estimatedDays Int?`, `notes?` | One-to-one with SupplierProfile. |
| `QuotationTemplate` | `contractorProfileId`, `name`, `scopeOfWorkTemplate?`, `paymentTermsTemplate?`, `estimatedDurationTemplate?`, `fileUrl?`, `isDefault` | Index `[contractorProfileId]`. |

### Profile destructive cleanup

- `ClientProfile`: drop `region`, `address`, `firstName`/`lastName`/`phone` (User owns now). Keep `preferredCategories`, `interestedServices`, `preferredLocation`.
- `ContractorProfile`: drop `portfolioFiles`, `verificationDocuments`, `serviceArea`, `serviceCategories`, `trade`, `location`. Add relations `services`, `quotationTemplates`. Keep core identity columns + `verificationLevel`.
- `SupplierProfile`: drop `deliveryAreas`, `productCategory`, `firstProduct`, `inventoryStock`, `verificationDocuments`, `deliveryAvailable`, `pickupAvailable`, `payoutBankName`, `payoutAcctName`, `payoutAcctNo`, `verifiedAt`. Add `tinNumber String?`, `storePhotos String[]`. Add relations `products`, `deliverySetting`.
- `JobSeekerProfile`: drop `portfolioFiles`, `verificationDocuments`, `location`, `firstName`, `lastName` (User owns). Add `skillCategory String?`, `bio String?`, `previousEmployer String?`, `workHistoryJson Json?`.

JSON intentionally retained: `Product.specifications`, `PortfolioItem.tagsJson`, `OnboardingRequirement.validationRuleJson`, `UserOnboardingStepProgress.metadataJson`, `AuditLog.{oldValues,newValues,metadata}`, `JobSeekerProfile.workHistoryJson`.

## A2. Migration sequence

Two logical migrations (pre-prod — diff clarity over single-shot):

1. `pnpm prisma migrate dev --name onboarding_revamp_drop_legacy` — drops `OnboardingState`, `OnboardingStatus`, removed JSON/scalar columns, splits `User.fullName`.
2. `pnpm prisma migrate dev --name onboarding_revamp_normalize` — adds new enums, all new tables, `phase`/`triggerType`/`fieldGroupCode` on `OnboardingStep`, new indexes.
3. `pnpm prisma generate`.

## A3. Seed script (`backend/prisma/seed.ts`)

Register in `package.json`: `"prisma": { "seed": "ts-node prisma/seed.ts" }`.

Upserts 4 `OnboardingFlow` rows (one per public role) and steps per the spec's Step Groups Summary, each with `phase`, `triggerType`, `fieldGroupCode`, `stepOrder`, `isRequired`, `isSkippable`. Inserts `OnboardingRequirement` rows for verification gates: `contractor.requires.valid_id_approved`, `supplier.requires.business_permit_approved`, `jobseeker.requires.valid_id_approved`, etc. — each `validationRuleJson` names the action it gates (`quote.accept`, `order.fulfill`, `job.contact`).

Step counts: CLIENT 5, CONTRACTOR 12, SUPPLIER 13, JOB_SEEKER 12. Idempotent via upsert on `(flowId, stepCode)`.

## A4. Onboarding module rewrite

### Multi-role `StartOnboardingCommand`

`{ userId, roles: Role[] }`. For each role: upsert `UserOnboardingProgress`, seed all `UserOnboardingStepProgress` as PENDING. Set `User.primaryRole` to first role if null. Publish `OnboardingStartedEvent` per role.

### `SaveStepCommand` → step-handler registry

New `step-handler.registry.ts` maps `fieldGroupCode` → handler class. ~14 handlers under `application/commands/save-step/handlers/`:

| fieldGroupCode | handler | target table |
|---|---|---|
| `client.address` | ClientAddressStepHandler | Address |
| `client.preferences` | ClientPreferencesStepHandler | ClientProfile |
| `contractor.business_basics` | ContractorBusinessBasicsHandler | ContractorProfile |
| `contractor.first_service` / `contractor.service_details` | ContractorServiceHandler | ContractorService |
| `*.portfolio` | PortfolioItemHandler | PortfolioItem |
| `*.verification` / `*.license` / `*.certificates` / `*.tax` / `*.clearances` / `*.recommendations` | DocumentUploadHandler | Document |
| `contractor.quotation_templates` | QuotationTemplateHandler | QuotationTemplate |
| `contractor.payout` | PayoutAccountHandler | PayoutAccount |
| `supplier.store_*` / `supplier.business_registration` | SupplierProfilePatchHandler | SupplierProfile |
| `supplier.first_product` / `supplier.product_details` / `supplier.inventory` / `supplier.pricing_extras` | ProductHandler | Product |
| `supplier.delivery` | DeliverySettingHandler | DeliverySetting |
| `jobseeker.*` (skills/profile/preferences/tools/work_history) | JobSeekerProfilePatchHandler | JobSeekerProfile |
| `*.cover` | CoverImageHandler | profile.coverImageUrl |

Each handler: zod-validate → repo write → mark `UserOnboardingStepProgress` COMPLETED → recompute `completionPercentage` → advance `currentStepId` → publish `OnboardingStepCompletedEvent`. Last required step in phase emits `OnboardingPhaseCompletedEvent`.

### New endpoints on `onboarding.controller.ts`

- `POST /onboarding/role-selection` — body `{ roles: Role[] }`.
- `POST /onboarding/address`, `POST /onboarding/services`, `POST /onboarding/products`, `POST /onboarding/portfolio`, `POST /onboarding/documents`, `POST /onboarding/payout-accounts`, `POST /onboarding/quotation-templates`, `POST /onboarding/delivery-setting`.
- `POST /onboarding/step/:stepCode/skip` (requires `isSkippable`), `.../pause`.
- Existing `POST /onboarding/step/:stepCode` continues working via registry.

### `GetOnboardingStateQuery` new shape

```ts
{
  userId, primaryRole,
  roles: [{
    role, flowCode, status, completionPercentage,
    currentPhase: 1|2|3|4,
    currentStep: { code, title, phase, triggerType, fieldGroupCode } | null,
    blockers: [{ kind: 'verification', requiredDocumentTypes: DocumentType[] }],
    phases: [{ phase, status, steps: [{ code, status, isRequired, isSkippable, triggerType }] }]
  }]
}
```

New query `GetOnboardingChecklistQuery({ userId, role })` returns phase-grouped field metadata joined with filled-vs-empty state.

### Verification gate

`VerificationGateService.assertCanPerform(userId, action)` throws `VerificationRequiredException` listing missing doc types. Consumed by new `VerificationGuard` + `@RequiresVerification('quote.accept' | 'order.fulfill' | 'job.contact')` decorator.

## A5. Auth / Users

- Signup DTO: drop `role`, drop `fullName`. Accept `email`, `password`, `firstName`, `lastName`, `phone`. Creates User with `primaryRole = null`.
- `POST /users/me/roles` — adds UserRole, dispatches StartOnboarding for that role, emits `UserRoleAddedEvent`. Idempotent.
- `PATCH /users/me/primary-role` — swap active context.
- `GET /users/me` returns `{ user, roles[], primaryRole }`.

## A6. Domain events

`UserRoleAddedEvent`, `OnboardingStartedEvent`, `OnboardingStepCompletedEvent`, `OnboardingPhaseCompletedEvent`, `OnboardingCompletedEvent`, `DocumentSubmittedEvent`, `DocumentApprovedEvent`, `DocumentRejectedEvent`. Wire into existing `shared/infrastructure/audit/event-handlers/` for AuditLog writes.

## A7. Tests (Jest, minimal)

`backend/test/onboarding/`:

- `signup-to-first-step.e2e.spec.ts` — signup → role-selection [CLIENT] → save address → assert step COMPLETED + % advances.
- `multi-role.e2e.spec.ts` — add CONTRACTOR after CLIENT; two progress rows; primaryRole unchanged.
- `verification-gate.spec.ts` — contractor lacking approved docs → VerificationGuard throws on `quote.accept`.
- `save-step-handler-registry.spec.ts` — unit test dispatch.
- `seed.spec.ts` — seed runs idempotently, asserts flow/step counts.

---

# Part B — Frontend

## B1. New dependencies

`@supabase/supabase-js`, `@tanstack/react-query`, `@tanstack/react-query-devtools`, `react-hook-form`, `@hookform/resolvers`. (zod, sonner, vaul, motion already present.)

Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`.

## B2. Auth revamp

- `frontend/src/lib/supabase.ts` — singleton client with `persistSession`, custom `storageKey` `struktura:sb-session`.
- `frontend/src/lib/auth-context.tsx` — full rewrite. Drop mock state, drop `FrontendRole` buyer/seller, drop OTP localStorage. On mount: `getSession()` + `onAuthStateChange` → push JWT into `api.ts` via `setAccessToken`. Surface: `{ user, session, isAuthenticated, isLoading, signIn, signUp, signOut }`. Onboarding state moves to React Query hooks.
- `frontend/src/lib/api.ts` — in-memory token, 401-once-refresh via `supabase.auth.refreshSession()`. Typed helpers `apiGet/apiPost/apiPatch/apiDelete`.
- `frontend/src/components/auth/signup-page.tsx` — RHF + zod. Fields: firstName, lastName, email, password, phone. Drop role toggle.
- `frontend/src/components/auth/verify-email-page.tsx` — "check inbox" + resend (`supabase.auth.resend({ type: 'signup', email })`). Drop mock OTP.
- `frontend/src/routes/auth/callback.tsx` (new) — Supabase email-link landing; exchanges code; redirects to `/onboarding/role-select` if zero roles, else `/dashboard`.
- `frontend/src/components/auth/login-page.tsx` — Supabase signInWithPassword. Post-auth route via `lib/auth-routing.ts:resolvePostAuthRoute(user)`.

## B3. Role selection screen

`frontend/src/routes/onboarding/role-select.tsx` (rebuild):

- 4 cards: CLIENT, CONTRACTOR, SUPPLIER, JOB_SEEKER. Multi-select Checkbox. "You can add roles anytime" note.
- On submit → `POST /users/me/roles` per selected role → invalidate `useMe` → navigate `/dashboard`.
- `beforeLoad`: `requireAuth`. If `user.roles.length > 0` and no `?add=1`, redirect to `/dashboard`.

## B4. Per-role wizard

`frontend/src/routes/onboarding/$role.tsx` — validates role against the 4 public roles. Uses `useOnboardingProgress(role)` + `useSaveStep(role)`.

New `frontend/src/components/onboarding/role-flows.ts` — declarative per-role config of `{ stepCode, title, phase, schema, fieldset }`. Replaces the giant `STEP_FIELDS` map.

Step components in `frontend/src/components/onboarding/steps/<role>/<step>-step.tsx` — each built with `useForm({ resolver: zodResolver(schema) })` + shadcn primitives. New components for CONTRACTOR (4) and JOB_SEEKER (4); rewrite existing 9 to use RHF.

New field primitives under `frontend/src/components/onboarding/fields/`:

- `field-text`, `field-textarea`, `field-select`, `field-tag-input` — RHF wrappers.
- `field-file`, `field-file-multi`, `field-image-upload` — drag/drop with previews, uses `useFileUpload`.
- `field-address` — composite object (line1/line2/barangay/city/province/postal/contactName/contactPhone).
- `field-price-range` — `{ min, max }` with zod refinement.

Phase indicator pill ("Phase X of 4 — <Name>") added to `frontend/src/components/onboarding/onboarding-layout.tsx`.

## B5. Dashboard progress banner

`frontend/src/components/dashboard/onboarding-banner.tsx` — reads `useAllOnboardingProgress()`. For each role with `status !== COMPLETED`: shadcn `Card` + `Progress` + "Finish setup" CTA → `/onboarding/$role`. Per-role dismiss in `sessionStorage` (reappears next session). Mounted in `dashboard-shell.tsx` above header.

## B6. Persistent Discovery Card

`frontend/src/components/dashboard/discovery-card.tsx`:

- Props: `targetRole: 'CONTRACTOR' | 'SUPPLIER'`.
- Three render states:
  - Role not in `user.roles` → value-prop card + "Get started" → `POST /users/me/roles` → navigate `/onboarding/<role>`.
  - Role added, IN_PROGRESS → progress bar + "Resume".
  - Role COMPLETED → render `quick-action-cards.tsx` variant (`AddProductCard`, `ManageServicesCard`).
- `sessionStorage` dismissal.
- Mounted in `client-dashboard.tsx` and a new `job-seeker-dashboard.tsx`.

## B7. Action Gate

`frontend/src/components/onboarding/action-gate-dialog.tsx` — shadcn `Dialog` (md+) / vaul Drawer (mobile, `dismissible={false}`). `onPointerDownOutside`/`onEscapeKeyDown` prevented. Renders only steps within `requiredPhase`. Header shows progress chip.

`frontend/src/components/onboarding/action-gate-provider.tsx` — imperative `useActionGate().require({ role, phase, addRoleIfMissing, reason }): Promise<'completed' | 'cancelled'>`. Mounted in `__root.tsx`.

Touchpoint refactors:

- `job-detail-page.tsx` — add Apply CTA: `await actionGate.require({ role: 'JOB_SEEKER', phase: 2, addRoleIfMissing: true })` then `POST /applications`.
- `product-detail-page.tsx` `onBuy` — `await actionGate.require({ role: 'CLIENT', phase: 2 })` then `await actionGate.require({ role: 'CLIENT', phase: 3, addressOnly: true })` then continue to cart/checkout.
- `contractor-profile-page.tsx` — replace `/messages` link with new `request-quotation-button.tsx` → CLIENT phase 2 gate + Address gate → `POST /quotations`.

## B8. Verification soft-locks

`frontend/src/hooks/use-verification-status.ts` — `useVerificationStatus(role)` returns `{ status, missingDocs }` from `GET /users/me/verification?role=...`.

`frontend/src/components/shared/locked-action-button.tsx` — disabled Button + Tooltip + unlock-link. Used by new `frontend/src/components/contractors/quote-actions.tsx` (Accept Quote), supplier Fulfill Order action, job seeker contact CTA.

## B9. API layer (React Query)

`frontend/src/lib/query-client.ts` — `QueryClient` with `staleTime: 30_000`, `retry: 1`. Provider wraps `AuthProvider` in `main.tsx`.

`frontend/src/lib/api/` (one file per resource): `users.ts`, `onboarding.ts`, `addresses.ts`, `documents.ts`, `products.ts`, `services.ts`, `verification.ts`, `quotations.ts`, `keys.ts`. Each hook is a thin wrapper over `api<T>()`. Mutations invalidate relevant keys.

## B10. File uploads

`frontend/src/hooks/use-file-upload.ts` — `useFileUpload(bucket)` for buckets `documents` (private, signed URLs), `portfolios` (public), `products` (public), `avatars` (public). File path `${userId}/${role}/${uuid}-${filename}`. Buckets provisioned via Supabase dashboard out-of-band.

## B11. Multi-role context

Replace `frontend/src/components/dashboard/role-context.tsx`. Drop lowercase `Role` type; standardize on `BackendRole`. Provider reads `useMe().roles` and exposes `{ roles, activeRole, setActiveRole }`. `activeRole` persisted in `sessionStorage`.

`frontend/src/components/shared/role-switcher.tsx` — DropdownMenu chip in topbar (`site-header.tsx`); selecting reroutes to that role's dashboard.

Sweep all `useRole()` consumers (`app-sidebar.tsx`, `dashboard-index.tsx`, `sidebar-nav.tsx`, `shadcn-dashboard.tsx`, `role-table.tsx`, `role-stats.tsx`) to new shape.

## B12. Routing guards

`frontend/src/lib/route-guards.ts`:

- `requireAuth(ctx)` — redirect to `/auth/login` with `?from=...`.
- `requireRole(role)` — chain auth + assert `roles.includes(role)` else `/onboarding/role-select?add=1`.
- `requireOnboardingComplete(role, minPhase?)` — for deep actions.

Apply on `routes/dashboard/*`, `routes/onboarding/*`. Add new dashboard routes `routes/dashboard/supplier.tsx`, `routes/dashboard/job-seeker.tsx`.

## B13. Mock cleanup

Replace: `auth-context.tsx`, `role-context.tsx`, the profile/role/onboarding pieces consumed by banner + discovery card.
Keep (out of scope): `jobs-data.ts`, `bids-data.ts`, `shop-data.ts`, `contractors-data.ts`, dashboard stat stubs.

---

# Sequencing

1. **Backend schema + migrations + seed** — schema diffs, two migrations, seed.ts, verify 4 flows + ~42 steps.
2. **Backend auth/users surface** — signup DTO rewrite, `POST /users/me/roles`, `PATCH /users/me/primary-role`, `GET /users/me` shape.
3. **Backend onboarding core** — delete `OnboardingState` repo, multi-role StartOnboarding, repositories for new tables, step-handler registry + 14 handlers, SaveStep dispatch, GetOnboardingState new shape, GetOnboardingChecklist, new endpoints.
4. **Backend verification + events** — VerificationGateService, VerificationGuard, `@RequiresVerification`, new domain events wired to audit handlers.
5. **Backend tests** — Jest specs (§A7). Run `pnpm test` + `pnpm test:e2e`.
6. **Frontend infra + auth** — install deps, `supabase.ts`, `query-client.ts`, rewrite `api.ts` + `auth-context.tsx`, rewrite signup/login/verify pages, add `/auth/callback`, add guards.
7. **Frontend API hooks** — `lib/api/*` resource files + `use-file-upload`.
8. **Frontend role selection + multi-role context** — rebuild `role-select.tsx`, replace `role-context.tsx`, add `role-switcher.tsx`.
9. **Frontend per-role wizard** — `role-flows.ts`, RHF field primitives, rewrite step components, support all 4 roles.
10. **Frontend dashboard banner + Discovery Cards** — banner, discovery-card, quick-action-cards. Add supplier/job-seeker dashboards + routes with `requireRole` guards.
11. **Frontend Action Gates** — dialog, provider, wire Apply / Buy / Request-Quotation + Address sub-gate.
12. **Frontend verification soft-locks** — `use-verification-status`, `locked-action-button`, `quote-actions`, supplier/job-seeker action surfaces.
13. **Cleanup** — grep `fullName`, `OnboardingState`, `OnboardingStatus`, `FrontendRole`, `hasCompletedOnboarding`, `getCachedOnboardingState`; remove stragglers. Update `backend/README.md` + `docs/`. Generate Swagger.

---

# Verification

End-to-end happy path (manual, two terminals: backend + frontend):

1. `pnpm prisma migrate reset && pnpm prisma db seed` — assert 4 flows + ~42 steps.
2. `pnpm start:dev` (backend) + `pnpm dev` (frontend).
3. Sign up at `/auth/signup` with firstName/lastName/email/password/phone. Click Supabase confirmation email link → lands on `/auth/callback` → redirects to `/onboarding/role-select`.
4. Select CLIENT + CONTRACTOR → land on `/dashboard`. Verify topbar role-switcher lists both, banner shows two stacked progress rows, Discovery Card shows for SUPPLIER (not selected).
5. Navigate to `/shop/<id>` → click Buy → Action Gate dialog opens (CLIENT phase 2) → fill → continues to Address gate (phase 3) → fill → original Buy intent resumes → cart updated, `/checkout` reached.
6. Switch active role to CONTRACTOR → start onboarding wizard → fill business basics (P2), first service (P2), skip portfolio, attempt verification (upload mock docs) → progress % advances per step.
7. Without approved docs, contractor "Accept Quote" button (on a quote page or stubbed component) renders locked with tooltip linking to documents step.
8. `POST /users/me/roles { role: SUPPLIER }` via Discovery Card → wizard for supplier opens → fill store identity + first product (creates Product row) → land on supplier dashboard.
9. Sign up second user → click Apply on a job at `/jobs/<id>` → Action Gate auto-adds JOB_SEEKER role (`addRoleIfMissing`) → phase 2 fields collected → application submitted.

Automated checks:

- `pnpm --filter backend test` and `test:e2e` (specs in §A7).
- `pnpm --filter frontend lint && tsc --noEmit`.
- Manually hit `GET /onboarding/state` for the test user; verify shape matches §A4 (phases, currentStep, blockers).
- Supabase dashboard: confirm `documents` bucket private, others public; objects appear under `${userId}/...`.

Acceptance:

- No references to `OnboardingState`, `OnboardingStatus`, `fullName`, `FrontendRole`, `buyer`/`seller`, mock OTP localStorage keys.
- All 4 public roles have working flows. Multi-role assignment works. Address never asked before Buy/Request-Quotation. Verification documents soft-lock without blocking discovery.
- Banner shows live % per incomplete role; Discovery Card flips to quick-action card on completion.
