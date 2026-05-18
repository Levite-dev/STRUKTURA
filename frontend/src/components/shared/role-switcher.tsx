import { useActiveRole } from '@/components/dashboard/role-context'
import { useSetPrimaryRole } from '@/lib/api/users'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Client',
  CONTRACTOR: 'Contractor',
  SUPPLIER: 'Supplier',
  JOB_SEEKER: 'Job Seeker',
}

export function RoleSwitcher() {
  const { roles, activeRole, setActiveRole } = useActiveRole()
  const setPrimary = useSetPrimaryRole()

  if (roles.length <= 1) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full border px-3 py-1 text-sm font-medium hover:bg-accent">
          {ROLE_LABELS[activeRole ?? ''] ?? activeRole}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {roles.map((role) => (
          <DropdownMenuItem
            key={role}
            className={role === activeRole ? 'font-medium bg-accent' : ''}
            onClick={() => {
              setActiveRole(role)
              setPrimary.mutate(role)
            }}
          >
            {ROLE_LABELS[role] ?? role}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
