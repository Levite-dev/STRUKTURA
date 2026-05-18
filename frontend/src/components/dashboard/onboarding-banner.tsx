import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useOnboardingState } from '@/lib/api/onboarding';
import { Progress } from '@/components/ui/progress';

const STORAGE_KEY = 'struktura:bannerDismissed';

function loadDismissed(): string[] {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

export function OnboardingBanner() {
  const { data } = useOnboardingState();
  const [dismissed, setDismissed] = useState<string[]>(loadDismissed);

  const dismiss = (role: string) => {
    const next = [...dismissed, role];
    setDismissed(next);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  if (!data?.roles) return null;

  const incomplete = data.roles.filter(
    (r: { role: string; status: string }) =>
      r.status !== 'COMPLETED' && !dismissed.includes(r.role),
  );
  if (incomplete.length === 0) return null;

  return (
    <div className="space-y-2 px-4 pt-4">
      {incomplete.map((r: { role: string; completionPercentage: number }) => (
        <div key={r.role} className="rounded-lg border bg-card p-4 flex items-center gap-4 shadow-sm">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {r.role.replace('_', ' ')} setup — {r.completionPercentage}% complete
            </p>
            <Progress value={r.completionPercentage} className="mt-1.5 h-1.5" />
          </div>
          <Link
            to={`/onboarding/${r.role.toLowerCase()}`}
            className="text-sm font-medium text-primary whitespace-nowrap"
          >
            Finish setup
          </Link>
          <button
            onClick={() => dismiss(r.role)}
            className="text-muted-foreground hover:text-foreground text-lg leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
