import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/route-guards';
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner';

export const Route = createFileRoute('/dashboard/job-seeker')({
  beforeLoad: requireAuth,
  component: JobSeekerDashboard,
});

function JobSeekerDashboard() {
  return (
    <div>
      <OnboardingBanner />
      <div className="p-4">
        <h1 className="text-2xl font-bold">Job Seeker Dashboard</h1>
        <p className="text-muted-foreground">Browse jobs and manage your applications.</p>
      </div>
    </div>
  );
}
