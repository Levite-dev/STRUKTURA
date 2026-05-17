import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"

export type Role = "client" | "seller" | "contractor" | "company" | "admin" | "jobSeeker"

const STORAGE_KEY = "struktura:role:v1"

type Ctx = {
  role: Role
  setRole: (r: Role) => void
}

const RoleCtx = createContext<Ctx | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("client")

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Role | null
      if (stored) setRoleState(stored)
    } catch {
      // ignore
    }
  }, [])

  const setRole = (r: Role) => {
    setRoleState(r)
    try {
      localStorage.setItem(STORAGE_KEY, r)
    } catch {
      // ignore
    }
  }

  return <RoleCtx.Provider value={{ role, setRole }}>{children}</RoleCtx.Provider>
}

export function useRole() {
  const ctx = useContext(RoleCtx)
  if (!ctx) throw new Error("useRole must be used within <RoleProvider>")
  return ctx
}

export const roleLabels: Record<Role, string> = {
  client: "Homeowner / Client",
  seller: "Hardware Seller",
  contractor: "Contractor",
  company: "Service Company",
  admin: "Platform Admin",
  jobSeeker: "Job Seeker",
}
