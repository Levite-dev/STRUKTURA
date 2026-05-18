import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useOnboardingState } from '@/lib/api/onboarding';
import { useAddRole } from '@/lib/api/users';
import { Progress } from '@/components/ui/progress';

const ROLE_DESCRIPTIONS: Record<string, { label: string; pitch: string }> = {
  CONTRACTOR: { label: 'Contractor', pitch: 'Offer your services and earn from construction projects.' },
  SUPPLIER: { label: 'Supplier', pitch: 'Sell building materials to contractors and clients.' },
};

export function DiscoveryCard({ targetRole }: { targetRole: 'CONTRACTOR' | 'SUPPLIER' }) {
  const storageKey = `struktura:discoveryDismissed:${targetRole}`;
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem(storageKey) === '1',
  );
  const { data } = useOnboardingState();
  const addRole = useAddRole();
  const navigate = useNavigate();

  if (dismissed) return null;

  const dismiss = () => { setDismissed(true); sessionStorage.setItem(storageKey, '1'); };
  const info = ROLE_DESCRIPTIONS[targetRole];
  const roleData = data?.roles?.find((r: { role: string }) => r.role === targetRole);

  if (roleData?.status === 'COMPLETED') return null;

  if (roleData && roleData.status !== 'COMPLETED') {
    return (
      <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
        <div className="flex items-start justify-between">
          <p className="font-medium">{info.label} setup in progress</p>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>
        <Progress value={(roleData as { completionPercentage: number }).completionPercentage} className="h-1.5" />
        <button
          onClick={() => navigate({ to: `/onboarding/${targetRole.toLowerCase()}` })}
          className="text-sm text-primary font-medium"
        >
          Resume setup
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium">{info.label}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{info.pitch}</p>
        </div>
        <button onClick={dismiss} className="text-muted-foreground hover:text-foreground text-lg leading-none ml-4">×</button>
      </div>
      <button
        onClick={async () => {
          await addRole.mutateAsync(targetRole);
          navigate({ to: `/onboarding/${targetRole.toLowerCase()}` });
        }}
        disabled={addRole.isPending}
        className="text-sm bg-primary text-primary-foreground rounded px-3 py-1.5 disabled:opacity-50"
      >
        Get started
      </button>
    </div>
  );
}
