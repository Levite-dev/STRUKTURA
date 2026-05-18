import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    supabase.auth.exchangeCodeForSession(window.location.search).then(() => {
      // Auth state change listener in AuthProvider will update user
    })
  }, [])

  useEffect(() => {
    if (isLoading) return
    if (!user || user.roles.length === 0) {
      navigate({ to: '/onboarding/role-select' })
    } else {
      navigate({ to: '/dashboard' })
    }
  }, [user, isLoading, navigate])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-brand-orange" />
        <p className="text-sm text-muted-foreground">Verifying…</p>
      </div>
    </div>
  )
}
