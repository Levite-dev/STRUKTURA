import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAddRole } from '@/lib/api/users'
import { requireAuth } from '@/lib/route-guards'
import { useAuth } from '@/lib/auth-context'
import type { BackendRole } from '@/lib/auth-context'

export const Route = createFileRoute('/onboarding/role-select')({
  beforeLoad: requireAuth,
  component: RoleSelectPage,
})

const ROLES: { role: BackendRole; label: string; description: string }[] = [
  { role: 'CLIENT', label: 'Client', description: 'Buy products and hire contractors for your projects.' },
  { role: 'CONTRACTOR', label: 'Contractor', description: 'Offer construction and renovation services.' },
  { role: 'SUPPLIER', label: 'Supplier', description: 'Sell building materials and products.' },
  { role: 'JOB_SEEKER', label: 'Job Seeker', description: 'Find work in construction and trades.' },
]

function RoleSelectPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const addRole = useAddRole()
  const [selected, setSelected] = useState<BackendRole[]>([])
  const [error, setError] = useState<string | null>(null)

  // Redirect if already has roles (and not adding more)
  if (user && user.roles.length > 0) {
    const search = new URLSearchParams(window.location.search)
    if (!search.has('add')) {
      navigate({ to: '/dashboard' })
      return null
    }
  }

  const toggle = (role: BackendRole) =>
    setSelected((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    )

  const handleSubmit = async () => {
    if (selected.length === 0) return
    setError(null)
    try {
      for (const role of selected) {
        await addRole.mutateAsync(role)
      }
      navigate({ to: '/dashboard' })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to set roles')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold">What brings you to Struktura?</h1>
          <p className="text-muted-foreground mt-1">Select all that apply. You can add roles anytime.</p>
        </div>
        <div className="space-y-3">
          {ROLES.map(({ role, label, description }) => {
            const isSelected = selected.includes(role)
            return (
              <button
                key={role}
                onClick={() => toggle(role)}
                className={`w-full text-left rounded-lg border p-4 transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                  </div>
                  <div>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={selected.length === 0 || addRole.isPending}
          className="w-full bg-primary text-primary-foreground rounded-lg py-3 font-medium disabled:opacity-50"
        >
          {addRole.isPending ? 'Setting up…' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
