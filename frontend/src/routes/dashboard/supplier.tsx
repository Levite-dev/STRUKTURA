import { createFileRoute } from '@tanstack/react-router';
import { requireAuth } from '@/lib/route-guards';
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner';

export const Route = createFileRoute('/dashboard/supplier')({
  beforeLoad: requireAuth,
  component: SupplierDashboard,
});

function SupplierDashboard() {
  return (
    <div>
      <OnboardingBanner />
      <div className="p-4">
        <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
        <p className="text-muted-foreground">Manage your products and orders.</p>
      </div>
    </div>
  );
}
