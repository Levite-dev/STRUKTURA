import { redirect } from '@tanstack/react-router'

export function requireAuth(ctx: {
  context: { auth?: { isAuthenticated: boolean } }
  location: { href: string }
}) {
  if (!ctx.context?.auth?.isAuthenticated) {
    throw redirect({ to: '/auth/login', search: { from: ctx.location.href } })
  }
}

export function requireNoRoles(ctx: {
  context: { auth?: { user: { roles: string[] } | null } }
}) {
  const user = ctx.context?.auth?.user
  if (user && user.roles.length > 0) {
    throw redirect({ to: '/dashboard' })
  }
}
