# Auth + Onboarding Test Plan

Validates the NestJS backend modules added in commit `7a0fe43` covering auth (signup, login, refresh, password reset, OAuth sync, logout, webhooks) and onboarding (start, save-step, submit, approve, reject, list-pending) for roles `CLIENT | CONTRACTOR | SUPPLIER | JOB_SEEKER`.

---

## 1. Scope

### In scope
- `AuthController` — `POST /auth/{signup,login,logout,refresh,password-reset/request,password-reset/confirm,oauth/callback}`
- `AuthWebhooksController` — `POST /auth/webhooks/email-verified`
- `OnboardingController` — `POST /onboarding/:role/start`, `GET /onboarding/:role`, `PATCH /onboarding/:role/step`, `POST /onboarding/:role/submit`
- `AdminOnboardingController` — `GET /admin/onboarding/pending`, `POST /admin/onboarding/:id/approve`, `POST /admin/onboarding/:id/reject`
- Guards: `SupabaseJwtGuard`, `EmailVerifiedGuard`, `RolesGuard`
- CQRS handlers (auth/users/onboarding) and `ProfileInputBuilder`
- Value objects: `Role`, `ONBOARDING_STEPS`, `requiresAdminApproval`, `requiresVerification`
- `SupabaseAuthAdapter` (against `AuthProviderPort` contract)
- Domain exceptions → HTTP filter mapping (`GlobalExceptionFilter`)

### Out of scope
- Real Supabase production project
- Frontend integration (covered in separate plan)
- Load/performance testing

---

## 2. Pre-requisites

### Environment
- Node 20+, pnpm
- Postgres test DB (or supabase local stack) reachable via `DATABASE_URL`
- Supabase **test** project credentials (separate from prod):
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET`
- `backend/.env.test` (gitignored) populated from `.env.example`

### Setup
```bash
cd backend
pnpm install
pnpm prisma migrate deploy
pnpm prisma db seed   # if seed exists; otherwise document fixture loader
```

### Test pyramid
- **Unit (Jest)** — handlers + VOs + guards + builder. Mock ports/repos/bus.
- **Integration (Jest + testcontainers or local PG)** — Prisma repositories against real DB.
- **E2E (Jest + Supertest)** — full HTTP slice with `AppModule`, real DB, **mocked** Supabase auth provider (override `AUTH_PROVIDER_PORT`).
- **Manual smoke (curl/Postman)** — real Supabase test project for OAuth + email verification flows that mocks cannot cover.

---

## 3. Unit Tests

### 3.1 Role / step VOs (`role.vo.ts`, `onboarding-steps.ts`)
| # | Case | Expectation |
|---|------|-------------|
| U1 | `isPublicRole('CLIENT' | 'CONTRACTOR' | 'SUPPLIER' | 'JOB_SEEKER')` | `true` |
| U2 | `isPublicRole('ADMIN' | 'MODERATOR' | 'SUPPORT')` | `false` |
| U3 | `requiresAdminApproval('CONTRACTOR' | 'SUPPLIER')` | `true` |
| U4 | `requiresAdminApproval('CLIENT' | 'JOB_SEEKER')` | `false` |
| U5 | `isValidStep('CONTRACTOR', 'TRADE_PROFILE')` | `true` |
| U6 | `isValidStep('CLIENT', 'TRADE_PROFILE')` | `false` |
| U7 | `requiresVerification('SUPPLIER')` | `true` |

### 3.2 Auth handlers (mock `AuthProviderPort`, `UserRepository`, `EventBus`)
| # | Handler | Case | Expectation |
|---|---------|------|-------------|
| U8 | `LoginHandler` | suspended user | `AccountSuspendedException` |
| U9 | `LoginHandler` | email not verified | `EmailNotVerifiedException` |
| U10 | `LoginHandler` | happy path | publishes `UserLoggedInEvent`, returns tokens |
| U11 | `SignupHandler` | duplicate email (provider error) | `ConflictException` |
| U12 | `SignupHandler` | success | creates user, publishes `UserSignedUpEvent` |
| U13 | `RefreshTokenHandler` | invalid refresh token | `InvalidTokenException` |
| U14 | `LogoutHandler` | revokes provider session, publishes `UserLoggedOutEvent` |
| U15 | `OAuthSyncHandler` | new supabase user | creates DB user |
| U16 | `OAuthSyncHandler` | suspended | `AccountSuspendedException` |
| U17 | `RequestPasswordResetHandler` | unknown email | resolves (no enumeration leak) |
| U18 | `ConfirmPasswordResetHandler` | invalid token | provider error surfaced |

### 3.3 Onboarding handlers
| # | Handler | Case | Expectation |
|---|---------|------|-------------|
| U19 | `StartOnboardingHandler` | role = `ADMIN` | `InvalidRoleForPublicOnboardingException` |
| U20 | `StartOnboardingHandler` | already completed | `OnboardingAlreadyCompletedException` |
| U21 | `StartOnboardingHandler` | first time CLIENT | creates state w/ first step = `PERSONAL_INFO` |
| U22 | `SaveStepHandler` | state missing | `OnboardingNotFoundException` |
| U23 | `SaveStepHandler` | invalid step name for role | rejects via VO check |
| U24 | `SaveStepHandler` | valid step | merges payload, advances pointer |
| U25 | `SubmitOnboardingHandler` | state missing | `OnboardingNotFoundException` |
| U26 | `SubmitOnboardingHandler` | CLIENT (no approval) | marks complete, sets profile active |
| U27 | `SubmitOnboardingHandler` | CONTRACTOR | marks pending approval, NOT active |
| U28 | `ApproveOnboardingHandler` / `RejectOnboardingHandler` | state missing | `OnboardingNotFoundException` |
| U29 | `ApproveOnboardingHandler` | pending CONTRACTOR | flips to approved + verified |
| U30 | `RejectOnboardingHandler` | with reason | persists reason, flips to rejected |

### 3.4 ProfileInputBuilder
| # | Case | Expectation |
|---|------|-------------|
| U31 | role = `CLIENT` | shape includes client fields only |
| U32 | role = `CONTRACTOR` | includes trade + portfolio |
| U33 | role = `SUPPLIER` | includes business + payout |
| U34 | role = `JOB_SEEKER` | includes skills |
| U35 | role = `ADMIN` | throws `Unsupported role for onboarding` |

### 3.5 Guards (mock `Reflector`, port, `QueryBus`)
| # | Guard | Case | Expectation |
|---|-------|------|-------------|
| U36 | `SupabaseJwtGuard` | `@Public()` handler | `true`, no token check |
| U37 | `SupabaseJwtGuard` | missing `Authorization` header | `UnauthorizedException('Missing or malformed...')` |
| U38 | `SupabaseJwtGuard` | malformed (not `Bearer x`) | same |
| U39 | `SupabaseJwtGuard` | valid token, no DB user | `InvalidTokenException('not provisioned')` |
| U40 | `SupabaseJwtGuard` | valid token + DB user | attaches `req.user`, `true` |
| U41 | `EmailVerifiedGuard` | unverified user | `EmailNotVerifiedException` |
| U42 | `RolesGuard` | user lacks required role | `ForbiddenException` |
| U43 | `RolesGuard` | matching role | `true` |

---

## 4. Integration Tests (Prisma repos)

Run against an ephemeral DB (testcontainers or `DATABASE_URL` pointing to throwaway schema). Truncate between tests.

| # | Repo | Case |
|---|------|------|
| I1 | `UserPrismaRepository.findBySupabaseId` | round-trip create/find |
| I2 | `UserPrismaRepository.assignRole` | persists role change |
| I3 | `UserPrismaRepository.markEmailVerified` | flips flag |
| I4 | `OnboardingStatePrismaRepository.save` | creates + idempotent update |
| I5 | `OnboardingStatePrismaRepository.findByUserAndRole` | composite key match |
| I6 | `OnboardingStatePrismaRepository.listPending` | filters role + status |
| I7 | `ProfilePrismaRepository.upsertForRole` | shape per role matches `ProfileInputBuilder` output |

---

## 5. E2E Tests (HTTP)

Bootstrap `AppModule`, override `AUTH_PROVIDER_PORT` with a stub that returns deterministic claims/tokens. Real DB.

### 5.1 Auth slice
| # | Route | Case | Status |
|---|-------|------|--------|
| E1 | `POST /auth/signup` | valid payload | `201`, returns user + tokens |
| E2 | `POST /auth/signup` | duplicate email | `409` |
| E3 | `POST /auth/signup` | weak password | `400` (validation pipe) |
| E4 | `POST /auth/login` | valid | `200`, tokens |
| E5 | `POST /auth/login` | wrong password (provider 401) | `401` |
| E6 | `POST /auth/login` | suspended | `403 AccountSuspended` |
| E7 | `POST /auth/login` | email not verified | `403 EmailNotVerified` |
| E8 | `POST /auth/refresh` | valid refresh | `200`, new tokens |
| E9 | `POST /auth/refresh` | revoked token | `401` |
| E10 | `POST /auth/logout` (auth required) | no token | `401` |
| E11 | `POST /auth/logout` | valid bearer | `204`, provider `signOut` called |
| E12 | `POST /auth/password-reset/request` | unknown email | `200` (no leak) |
| E13 | `POST /auth/password-reset/confirm` | invalid token | `400/401` |
| E14 | `POST /auth/oauth/callback` | first-time supabase user | `200`, DB user created |
| E15 | `POST /auth/webhooks/email-verified` | valid Supabase secret | `200`, user flag updated |
| E16 | `POST /auth/webhooks/email-verified` | wrong/missing secret | `401` |

### 5.2 Onboarding slice (auth bearer for CLIENT/CONTRACTOR test users)
| # | Route | Case | Status |
|---|-------|------|--------|
| E17 | `POST /onboarding/CLIENT/start` | first call | `201`, state w/ first step |
| E18 | `POST /onboarding/CLIENT/start` | already completed | `409 OnboardingAlreadyCompleted` |
| E19 | `POST /onboarding/ADMIN/start` | rejected role | `400 InvalidRoleForPublicOnboarding` |
| E20 | `GET /onboarding/CLIENT` | exists | `200`, current step |
| E21 | `GET /onboarding/CLIENT` | not started | `404 OnboardingNotFound` |
| E22 | `PATCH /onboarding/CONTRACTOR/step` | valid step `TRADE_PROFILE` | `200`, advances |
| E23 | `PATCH /onboarding/CONTRACTOR/step` | invalid step `XYZ` | `400` |
| E24 | `POST /onboarding/CLIENT/submit` | all steps done | `200`, status=`COMPLETED`, profile active |
| E25 | `POST /onboarding/CONTRACTOR/submit` | all steps done | `200`, status=`PENDING_APPROVAL` |
| E26 | role param mismatch (`:role` ≠ JWT user role) | `RoleParamPipe` rejects | `400/403` |

### 5.3 Admin slice (bearer for ADMIN user)
| # | Route | Case | Status |
|---|-------|------|--------|
| E27 | `GET /admin/onboarding/pending` | as CLIENT | `403` |
| E28 | `GET /admin/onboarding/pending` | as ADMIN | `200`, list of pending CONTRACTOR/SUPPLIER |
| E29 | `POST /admin/onboarding/:id/approve` | unknown id | `404` |
| E30 | `POST /admin/onboarding/:id/approve` | valid | `200`, user verified |
| E31 | `POST /admin/onboarding/:id/reject` | with reason | `200`, reason stored |
| E32 | `POST /admin/onboarding/:id/reject` | as MODERATOR | `200` (RolesGuard allows) |

---

## 6. Manual Smoke (real Supabase test project)

Run after E2E passes. Use Postman collection or `curl` against a local `pnpm start:dev` with real Supabase test creds.

1. **Signup → verify email → login**
   - Signup CLIENT → check Supabase dashboard for unverified user
   - Click verification link in inbox → webhook fires → DB `emailVerified=true`
   - Login → succeeds
2. **OAuth (Google) sync** — frontend or Supabase-hosted page → `/auth/oauth/callback` → DB user provisioned
3. **Full CONTRACTOR onboarding** — start → save 4 steps → submit → admin approves → contractor can log in to verified-only routes
4. **Password reset** — request → click email link → confirm new password → login with new password
5. **JWT expiry** — wait past access token TTL → call protected route → `401` → `/auth/refresh` → retry succeeds

---

## 7. Security / negative cases (must-have)

| # | Concern | Test |
|---|---------|------|
| S1 | JWT tampering | flip a byte in the signature → `InvalidTokenException` |
| S2 | Expired access token | provider rejects → `401` |
| S3 | Cross-tenant leak | user A bearer → `GET /onboarding/CLIENT` returns A's state only |
| S4 | Privilege escalation | CLIENT calls `/admin/onboarding/pending` → `403` |
| S5 | Webhook spoofing | call `/auth/webhooks/email-verified` without/with wrong signature → `401` |
| S6 | Password reset enumeration | unknown email returns same response shape as known |
| S7 | Rate limiting hooks | confirm throttler is wired on `signup`, `login`, `password-reset/request` (or flag as gap) |
| S8 | SQL injection via `:role` | non-enum value → `400` from `RoleParamPipe` |
| S9 | Email-verified bypass | suspended/unverified user attempts protected route → `EmailVerifiedGuard` blocks |

---

## 8. Tooling commands

```bash
# unit + integration
pnpm test
pnpm test:cov          # coverage report

# e2e
pnpm test:e2e

# single suite
pnpm test -- auth/application/commands/login
```

CI: add `pnpm test` and `pnpm test:e2e` as separate jobs in `.github/workflows/ci.yml` with a Postgres service container.

---

## 9. Exit criteria

- All unit + integration suites green
- All E2E green against ephemeral DB + mocked auth provider
- Manual smoke walkthrough completed end-to-end on Supabase test project (steps 1–5 in §6)
- Coverage thresholds: ≥ 85% lines on `application/commands/**`, `application/queries/**`, `presentation/guards/**`
- All §7 security cases pass
- No `console.log` / debug code in handlers

---

## 10. Known gaps / follow-ups

- E2E currently has placeholder `app.e2e-spec.ts` (`GET /` returns 'Hello World!'); replace before this plan runs.
- Throttling/rate limiting not yet wired (see S7) — either add `@nestjs/throttler` or document as deferred.
- Audit logger event handlers (`*.audit-handler.ts`) need observability tests: assert the right event types reach the audit port.
