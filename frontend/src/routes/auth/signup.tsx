import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { SignupPage, type SignupRole } from "@/components/auth/signup-page"

const signupSearchSchema = z.object({
  role: z.enum(["buyer", "seller", "contractor"]).optional(),
})

export const Route = createFileRoute("/auth/signup")({
  validateSearch: (search) => signupSearchSchema.parse(search),
  component: SignupRoute,
})

function SignupRoute() {
  const { role } = Route.useSearch()
  return <SignupPage initialRole={(role as SignupRole | undefined) ?? "buyer"} />
}
