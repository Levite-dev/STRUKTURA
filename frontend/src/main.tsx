import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import "./index.css"
import { router } from "@/router"
import { queryClient } from "@/lib/query-client"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider, useAuth } from "@/lib/auth-context"

function AppRouter() {
  const auth = useAuth()
  const isAuthenticated = !!auth.session && !!auth.user
  const user = auth.user ? { roles: auth.user.roles } : null
  return (
    <RouterProvider router={router} context={{ auth: { isAuthenticated, user } }} />
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
