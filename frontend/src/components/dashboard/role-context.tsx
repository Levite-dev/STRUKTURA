import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { BackendRole } from '@/lib/auth-context'
import { useAuth } from '@/lib/auth-context'

// ─── Legacy dashboard role type (kept for backward compat) ────────────────────
export type Role = 'client' | 'seller' | 'contractor' | 'company' | 'admin' | 'jobSeeker'

export const roleLabels: Record<Role, string> = {
  client: 'Homeowner / Client',
  seller: 'Hardware Seller',
  contractor: 'Contractor',
  company: 'Service Company',
  admin: 'Platform Admin',
  jobSeeker: 'Job Seeker',
}

const LEGACY_STORAGE_KEY = 'struktura:role:v1'

type LegacyCtx = {
  role: Role
  setRole: (r: Role) => void
}

const LegacyRoleCtx = createContext<LegacyCtx | null>(null)

// ─── Multi-role context (BackendRole aware) ───────────────────────────────────
const STORAGE_KEY = 'struktura:activeRole'

type RoleContextValue = {
  roles: BackendRole[]
  activeRole: BackendRole | null
  setActiveRole: (role: BackendRole) => void
}

const RoleContext = createContext<RoleContextValue | null>(null)

// ─── Combined provider ────────────────────────────────────────────────────────
export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  // Legacy single-role state (for dashboard demo tiles)
  const [legacyRole, setLegacyRoleState] = useState<Role>(() => {
    try {
      return (localStorage.getItem(LEGACY_STORAGE_KEY) as Role | null) ?? 'client'
    } catch {
      return 'client'
    }
  })

  const setRole = (r: Role) => {
    setLegacyRoleState(r)
    try {
      localStorage.setItem(LEGACY_STORAGE_KEY, r)
    } catch {
      // ignore
    }
  }

  // Multi-role / BackendRole state
  const [activeRole, setActiveRoleState] = useState<BackendRole | null>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) as BackendRole | null
    } catch {
      return null
    }
  })

  const roles = (user?.roles ?? []) as BackendRole[]

  // Reset active role if user changes and no longer has that role
  useEffect(() => {
    if (activeRole && !roles.includes(activeRole)) {
      setActiveRoleState(null)
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
    }
  }, [roles, activeRole])

  const setActiveRole = (role: BackendRole) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, role)
    } catch {
      // ignore
    }
    setActiveRoleState(role)
  }

  const resolvedActive: BackendRole | null =
    activeRole ??
    (user?.primaryRole as BackendRole | null) ??
    roles[0] ??
    null

  return (
    <LegacyRoleCtx.Provider value={{ role: legacyRole, setRole }}>
      <RoleContext.Provider value={{ roles, activeRole: resolvedActive, setActiveRole }}>
        {children}
      </RoleContext.Provider>
    </LegacyRoleCtx.Provider>
  )
}

// ─── Legacy hook (used by dashboard demo, app-sidebar, sidebar-nav, etc.) ─────
export function useRole() {
  const ctx = useContext(LegacyRoleCtx)
  if (!ctx) throw new Error('useRole must be used within <RoleProvider>')
  return ctx
}

// ─── New multi-role hook ──────────────────────────────────────────────────────
export function useActiveRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useActiveRole must be inside RoleProvider')
  return ctx
}
