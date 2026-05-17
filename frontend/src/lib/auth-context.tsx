import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { clearAccessToken } from "@/lib/api"

export type OnboardingStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAUSED"
  | "BLOCKED"
  | "SKIPPED"
  | "PENDING_VERIFICATION"
  | "REJECTED"

export type OnboardingStepStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "SKIPPED"
  | "BLOCKED"
  | "FAILED"

export type BackendRole =
  | "CLIENT"
  | "CONTRACTOR"
  | "SUPPLIER"
  | "JOB_SEEKER"
  | "ADMIN"
  | "MODERATOR"
  | "SUPPORT"

export type FrontendRole = "buyer" | "seller"

export const FRONTEND_TO_BACKEND: Record<FrontendRole, BackendRole> = {
  buyer: "CLIENT",
  seller: "SUPPLIER",
}

export const BACKEND_TO_FRONTEND: Partial<Record<BackendRole, FrontendRole>> = {
  CLIENT: "buyer",
  SUPPLIER: "seller",
}

export type User = {
  id: string
  email: string
  fullName: string | null
  roles: BackendRole[]
  emailVerified: boolean
}

export type PendingEmailVerification = {
  email: string
  fullName: string | null
  role: BackendRole
  otp: string
  expiresAt: string
}

export type OnboardingStep = {
  id: string
  stepCode: string
  title: string
  description: string | null
  stepOrder: number
  isRequired: boolean
  isSkippable: boolean
  estimatedMinutes: number | null
  status: OnboardingStepStatus
  metadataJson: Record<string, unknown>
  completedAt: string | null
  skippedAt: string | null
  blockedReason: string | null
}

export type OnboardingState = {
  id: string
  userId: string
  role: BackendRole
  flow: {
    id: string
    code: string
    name: string
    description: string | null
  }
  status: OnboardingStatus
  currentStep: string | null
  completionPercentage: number
  data: Record<string, Record<string, unknown>>
  steps: OnboardingStep[]
  missingSteps: string[]
  startedAt: string | null
  completedAt: string | null
  skippedAt: string | null
  rejectedAt: string | null
  rejectReason: string | null
}

type AuthCtx = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  onboardingStates: OnboardingState[]
  onboardingStatusFor: (role: BackendRole) => OnboardingStatus | null
  hasCompletedOnboarding: (role: BackendRole) => boolean
  hasPendingOnboarding: (role: BackendRole) => boolean
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    frontendRole?: FrontendRole,
  ) => Promise<{ emailVerified: boolean }>
  getPendingEmailVerification: () => PendingEmailVerification | null
  resendEmailVerificationOtp: () => Promise<PendingEmailVerification>
  verifyEmailOtp: (otp: string) => Promise<{ user: User; role: BackendRole }>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => void
  startOnboarding: (role: BackendRole) => Promise<OnboardingState>
  getOnboardingState: (role: BackendRole) => Promise<OnboardingState | null>
  getCachedOnboardingState: (role: BackendRole) => OnboardingState | null
  saveOnboardingStep: (
    role: BackendRole,
    step: string,
    data: Record<string, unknown>,
  ) => Promise<OnboardingState>
  submitOnboarding: (role: BackendRole) => Promise<OnboardingState>
}

type FlowStepSeed = {
  stepCode: string
  title: string
  description: string
  isRequired?: boolean
  isSkippable?: boolean
}

const AuthCtx = createContext<AuthCtx | null>(null)

const AUTH_KEY = "struktura:auth:v1"
const ONBOARDING_KEY = "struktura:onboarding:v2"
const SIGNUP_ROLE_KEY = "struktura:signup-role:v1"
const EMAIL_VERIFICATION_KEY = "struktura:email-verification:v1"
const SUPPORTED_ONBOARDING_ROLES: BackendRole[] = ["CLIENT", "SUPPLIER"]

const FLOW_SEEDS: Record<
  BackendRole,
  { code: string; name: string; description: string; steps: FlowStepSeed[] }
> = {
  CLIENT: {
    code: "client_onboarding",
    name: "Client onboarding",
    description: "Basic client profile, address, and preferences.",
    steps: [
      ["account_setup", "Account Setup", "Confirm account type and contact details."],
      ["profile_setup", "Profile Setup", "Add your name and contact profile."],
      ["address_setup", "Address Setup", "Add your primary project or delivery address."],
      ["preferences_setup", "Preferences", "Choose services and product categories."],
    ].map(([stepCode, title, description]) => ({ stepCode, title, description })),
  },
  CONTRACTOR: {
    code: "contractor_onboarding",
    name: "Contractor onboarding",
    description: "Disabled in the current onboarding preview.",
    steps: [],
  },
  SUPPLIER: {
    code: "supplier_onboarding",
    name: "Supplier onboarding",
    description: "Store profile, first product, inventory, and verification.",
    steps: [
      ["account_setup", "Account Setup", "Confirm account type and contact details."],
      ["supplier_profile", "Supplier Profile", "Add store and contact details."],
      ["business_information", "Business Information", "Add registration and business details."],
      ["product_setup", "Product Setup", "Add your first product listing."],
      ["inventory_setup", "Inventory Setup", "Add initial stock information."],
      ["document_upload", "Document Upload", "Provide verification document links."],
      ["verification_submission", "Verification Submission", "Review and submit for verification."],
    ].map(([stepCode, title, description]) => ({ stepCode, title, description })),
  },
  JOB_SEEKER: {
    code: "job_seeker_onboarding",
    name: "Job seeker onboarding",
    description: "Disabled in the current onboarding preview.",
    steps: [],
  },
  ADMIN: {
    code: "admin_onboarding",
    name: "Staff onboarding",
    description: "Disabled in the current onboarding preview.",
    steps: [],
  },
  MODERATOR: {
    code: "moderator_onboarding",
    name: "Moderator onboarding",
    description: "Internal staff setup.",
    steps: [],
  },
  SUPPORT: {
    code: "support_onboarding",
    name: "Support onboarding",
    description: "Internal staff setup.",
    steps: [],
  },
}

function loadAuth(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveAuth(user: User | null): void {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  else localStorage.removeItem(AUTH_KEY)
}

function loadOnboardingStates(): OnboardingState[] {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    const states = raw ? (JSON.parse(raw) as OnboardingState[]) : []
    return states.filter((state) => SUPPORTED_ONBOARDING_ROLES.includes(state.role))
  } catch {
    return []
  }
}

function saveOnboardingStates(states: OnboardingState[]): void {
  localStorage.setItem(ONBOARDING_KEY, JSON.stringify(states))
}

function makeMockUser(email: string, fullName?: string, role?: FrontendRole): User {
  return {
    id: `user_${Date.now()}`,
    email,
    fullName: fullName ?? null,
    roles: role ? [FRONTEND_TO_BACKEND[role]] : [],
    emailVerified: true,
  }
}

function makeMockUserForBackendRole(
  email: string,
  fullName: string | null,
  role: BackendRole,
): User {
  return {
    id: `user_${Date.now()}`,
    email,
    fullName,
    roles: [role],
    emailVerified: true,
  }
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function loadPendingEmailVerification(): PendingEmailVerification | null {
  try {
    const raw = localStorage.getItem(EMAIL_VERIFICATION_KEY)
    if (!raw) return null
    const pending = JSON.parse(raw) as PendingEmailVerification
    if (new Date(pending.expiresAt).getTime() <= Date.now()) {
      localStorage.removeItem(EMAIL_VERIFICATION_KEY)
      return null
    }
    return pending
  } catch {
    return null
  }
}

function savePendingEmailVerification(pending: PendingEmailVerification): void {
  localStorage.setItem(EMAIL_VERIFICATION_KEY, JSON.stringify(pending))
}

function createState(role: BackendRole, userId: string): OnboardingState {
  const seed = FLOW_SEEDS[role]
  const now = new Date().toISOString()
  const steps = seed.steps.map((step, index): OnboardingStep => ({
    id: `${role}_${step.stepCode}`,
    stepCode: step.stepCode,
    title: step.title,
    description: step.description,
    stepOrder: index + 1,
    isRequired: step.isRequired ?? true,
    isSkippable: step.isSkippable ?? false,
    estimatedMinutes: 3,
    status: index === 0 ? "IN_PROGRESS" : "PENDING",
    metadataJson: {},
    completedAt: null,
    skippedAt: null,
    blockedReason: null,
  }))

  return {
    id: `obs_${role}_${Date.now()}`,
    userId,
    role,
    flow: {
      id: `flow_${role}`,
      code: seed.code,
      name: seed.name,
      description: seed.description,
    },
    status: "IN_PROGRESS",
    currentStep: steps[0]?.stepCode ?? null,
    completionPercentage: 0,
    data: {},
    steps,
    missingSteps: steps.filter((step) => step.isRequired).map((step) => step.stepCode),
    startedAt: now,
    completedAt: null,
    skippedAt: null,
    rejectedAt: null,
    rejectReason: null,
  }
}

function requiresVerification(role: BackendRole): boolean {
  return role === "SUPPLIER"
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [onboardingStates, setOnboardingStates] = useState<OnboardingState[]>([])

  useEffect(() => {
    setUser(loadAuth())
    setOnboardingStates(loadOnboardingStates())
    setIsLoading(false)
  }, [])

  const rememberState = useCallback((state: OnboardingState) => {
    let nextStates: OnboardingState[] = []
    setOnboardingStates((prev) => {
      nextStates = [...prev.filter((item) => item.role !== state.role), state]
      saveOnboardingStates(nextStates)
      return nextStates
    })
    return state
  }, [])

  const onboardingStatusFor = useCallback(
    (role: BackendRole): OnboardingStatus | null =>
      onboardingStates.find((o) => o.role === role)?.status ?? null,
    [onboardingStates],
  )

  const hasCompletedOnboarding = useCallback(
    (role: BackendRole): boolean => onboardingStatusFor(role) === "COMPLETED",
    [onboardingStatusFor],
  )

  const hasPendingOnboarding = useCallback(
    (role: BackendRole): boolean =>
      onboardingStatusFor(role) === "PENDING_VERIFICATION",
    [onboardingStatusFor],
  )

  const signUp = async (
    email: string,
    _password: string,
    fullName?: string,
    frontendRole?: FrontendRole,
  ): Promise<{ emailVerified: boolean }> => {
    const role = frontendRole ? FRONTEND_TO_BACKEND[frontendRole] : "CLIENT"
    const pending: PendingEmailVerification = {
      email,
      fullName: fullName?.trim() ? fullName.trim() : null,
      role,
      otp: generateOtp(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }
    setUser(null)
    saveAuth(null)
    savePendingEmailVerification(pending)
    localStorage.setItem(SIGNUP_ROLE_KEY, role)
    return { emailVerified: false }
  }

  const getPendingEmailVerification = (): PendingEmailVerification | null =>
    loadPendingEmailVerification()

  const resendEmailVerificationOtp = async (): Promise<PendingEmailVerification> => {
    const existing = loadPendingEmailVerification()
    if (!existing) {
      throw new Error("No pending email verification found.")
    }
    const pending: PendingEmailVerification = {
      ...existing,
      otp: generateOtp(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    }
    savePendingEmailVerification(pending)
    return pending
  }

  const verifyEmailOtp = async (
    otp: string,
  ): Promise<{ user: User; role: BackendRole }> => {
    const pending = loadPendingEmailVerification()
    if (!pending) {
      throw new Error("No pending email verification found.")
    }
    if (pending.otp !== otp.trim()) {
      throw new Error("The verification code is incorrect.")
    }
    const verifiedUser = makeMockUserForBackendRole(
      pending.email,
      pending.fullName,
      pending.role,
    )
    setUser(verifiedUser)
    saveAuth(verifiedUser)
    localStorage.setItem(SIGNUP_ROLE_KEY, pending.role)
    localStorage.removeItem(EMAIL_VERIFICATION_KEY)
    return { user: verifiedUser, role: pending.role }
  }

  const signIn = async (email: string, _password: string): Promise<void> => {
    const existing = loadAuth()
    const nextUser = existing ?? makeMockUser(email)
    setUser(nextUser)
    saveAuth(nextUser)
  }

  const signOut = () => {
    setUser(null)
    setOnboardingStates([])
    saveAuth(null)
    saveOnboardingStates([])
    clearAccessToken()
    localStorage.removeItem(SIGNUP_ROLE_KEY)
    localStorage.removeItem(EMAIL_VERIFICATION_KEY)
  }

  const startOnboarding = useCallback(
    async (role: BackendRole): Promise<OnboardingState> => {
      if (!SUPPORTED_ONBOARDING_ROLES.includes(role)) {
        throw new Error("This onboarding flow is not available in the current preview.")
      }
      const existing = onboardingStates.find((state) => state.role === role)
      if (existing && existing.status !== "COMPLETED") return existing
      const state = createState(role, user?.id ?? "local_user")
      return rememberState(state)
    },
    [onboardingStates, rememberState, user?.id],
  )

  const getOnboardingState = useCallback(
    async (role: BackendRole): Promise<OnboardingState | null> =>
      onboardingStates.find((state) => state.role === role) ?? null,
    [onboardingStates],
  )

  const getCachedOnboardingState = useCallback(
    (role: BackendRole): OnboardingState | null =>
      onboardingStates.find((s) => s.role === role) ?? null,
    [onboardingStates],
  )

  const saveOnboardingStep = useCallback(
    async (
      role: BackendRole,
      stepCode: string,
      data: Record<string, unknown>,
    ): Promise<OnboardingState> => {
      const existing =
        onboardingStates.find((state) => state.role === role) ??
        createState(role, user?.id ?? "local_user")
      const stepIndex = existing.steps.findIndex((step) => step.stepCode === stepCode)
      const now = new Date().toISOString()
      const steps = existing.steps.map((step, index) => {
        if (step.stepCode === stepCode) {
          return {
            ...step,
            status: "COMPLETED" as const,
            metadataJson: data,
            completedAt: now,
          }
        }
        if (index === stepIndex + 1 && step.status === "PENDING") {
          return { ...step, status: "IN_PROGRESS" as const }
        }
        return step
      })
      const requiredSteps = steps.filter((step) => step.isRequired)
      const completedRequired = requiredSteps.filter(
        (step) => step.status === "COMPLETED",
      )
      const nextStep =
        steps.find((step, index) => index > stepIndex && step.status !== "COMPLETED") ??
        steps[stepIndex]
      const state: OnboardingState = {
        ...existing,
        status: "IN_PROGRESS",
        currentStep: nextStep?.stepCode ?? null,
        completionPercentage:
          requiredSteps.length === 0
            ? 100
            : Math.round((completedRequired.length / requiredSteps.length) * 100),
        data: { ...existing.data, [stepCode]: data },
        steps,
        missingSteps: requiredSteps
          .filter((step) => step.status !== "COMPLETED")
          .map((step) => step.stepCode),
      }
      return rememberState(state)
    },
    [onboardingStates, rememberState, user?.id],
  )

  const submitOnboarding = useCallback(
    async (role: BackendRole): Promise<OnboardingState> => {
      const existing = onboardingStates.find((state) => state.role === role)
      if (!existing) return startOnboarding(role)
      const now = new Date().toISOString()
      const state: OnboardingState = {
        ...existing,
        status: requiresVerification(role) ? "PENDING_VERIFICATION" : "COMPLETED",
        completionPercentage: 100,
        missingSteps: [],
        completedAt: requiresVerification(role) ? null : now,
      }
      return rememberState(state)
    },
    [onboardingStates, rememberState, startOnboarding],
  )

  return (
    <AuthCtx.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        onboardingStates,
        onboardingStatusFor,
        hasCompletedOnboarding,
        hasPendingOnboarding,
        signUp,
        getPendingEmailVerification,
        resendEmailVerificationOtp,
        verifyEmailOtp,
        signIn,
        signOut,
        startOnboarding,
        getOnboardingState,
        getCachedOnboardingState,
        saveOnboardingStep,
        submitOnboarding,
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>")
  return ctx
}

export function getSignupRole(): BackendRole | null {
  const raw = localStorage.getItem(SIGNUP_ROLE_KEY)
  if (!raw) return null
  localStorage.removeItem(SIGNUP_ROLE_KEY)
  return raw as BackendRole
}
