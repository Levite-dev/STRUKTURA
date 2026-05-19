import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import type { BackendRole } from '@/lib/auth-context';

type VerificationStatus = {
  status: string;
  missingDocs: string[];
};

export function useVerificationStatus(role: BackendRole) {
  return useQuery({
    queryKey: ['verification', role],
    queryFn: () => apiGet<VerificationStatus>(`/users/me/verification?role=${role}`),
  });
}
