import { createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"

export type RouterAuthContext = {
  isAuthenticated: boolean
  user: { roles: string[] } | null
}

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 30_000,
  defaultViewTransition: false,
  context: {
    auth: { isAuthenticated: false, user: null } as RouterAuthContext,
  },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}