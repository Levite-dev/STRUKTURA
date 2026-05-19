import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { setAccessToken, apiPost, apiGet } from './api'

export type BackendRole =
  | 'CLIENT'
  | 'CONTRACTOR'
  | 'SUPPLIER'
  | 'JOB_SEEKER'
  | 'ADMIN'
  | 'MODERATOR'
  | 'SUPPORT'


export type AppUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone?: string | null
  avatarUrl?: string | null
  roles: BackendRole[]
  primaryRole: BackendRole | null
  emailVerified: boolean
}

// Legacy `User` type alias so existing imports still compile
export type User = AppUser

type AuthContextValue = {
  user: AppUser | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone?: string,
  ) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function fetchMe(): Promise<AppUser> {
  return apiGet<AppUser>('/users/me')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadUser = useCallback(async (token: string) => {
    setAccessToken(token)
    try {
      const u = await fetchMe()
      setUser(u)
    } catch {
      setUser(null)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (!session) return
    const u = await fetchMe()
    setUser(u)
  }, [session])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      if (s) {
        loadUser(s.access_token).finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) {
        loadUser(s.access_token)
      } else {
        setUser(null)
        setAccessToken(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUser])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phone?: string,
    ) => {
      // Backend creates the Supabase auth user (admin path when AUTH_SKIP_EMAIL_CONFIRM=true)
      // plus mirrors the internal users row. No client-side supabase.auth.signUp to avoid
      // the anon 60s email rate-limit.
      await apiPost('/auth/signup', { email, password, firstName, lastName, phone })

      // Immediately sign in to obtain a Supabase session.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
    },
    [],
  )

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setAccessToken(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!session,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
