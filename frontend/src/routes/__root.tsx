import { Suspense, useEffect } from "react"
import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import { CartProvider } from "@/components/cart/cart-context"
import { RoleProvider } from "@/components/dashboard/role-context"
import { ErrorBoundary } from "@/components/shared/error-boundary"
import { ActionGateProvider } from "@/components/onboarding/action-gate-provider"

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 animate-fade-in">
      <div className="space-y-3 text-center">
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-muted border-t-brand-orange" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
  pendingComponent: PageLoader,
  errorComponent: ({ error }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center animate-fade-in">
      <p className="text-sm text-destructive">{error.message || "An unexpected error occurred."}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full bg-brand-orange px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft"
      >
        Try again
      </button>
    </div>
  ),
})

function RootLayout() {
  const { location } = useRouterState()

  useEffect(() => {
    if (location.hash) return
    window.scrollTo({ top: 0, behavior: "instant" })
  }, [location.pathname, location.hash])

  return (
    <RoleProvider>
      <CartProvider>
        <ActionGateProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <div className="relative min-h-screen bg-gray-100" id="main-content">
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
          {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
        </ActionGateProvider>
      </CartProvider>
    </RoleProvider>
  )
}