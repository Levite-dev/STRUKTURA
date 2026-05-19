import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch } from '@/lib/api'
import type { AppUser, BackendRole } from '@/lib/auth-context'

export const userKeys = {
  me: ['users', 'me'] as const,
}

export function useMe() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => apiGet<AppUser>('/users/me'),
    retry: false,
    staleTime: 30_000,
  })
}

export function useAddRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (role: BackendRole) => apiPost('/users/me/roles', { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me }),
  })
}

export function useSetPrimaryRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (role: BackendRole) => apiPatch('/users/me/primary-role', { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.me }),
  })
}
