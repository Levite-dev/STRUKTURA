import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { ShopPage } from "@/components/shop/shop-page"

const shopSearchSchema = z.object({
  q: z.string().optional(),
})

export const Route = createFileRoute("/shop")({
  validateSearch: (search) => shopSearchSchema.parse(search),
  component: ShopRoute,
})

function ShopRoute() {
  const { q } = Route.useSearch()
  return (
    <>
      <Header />
      <ShopPage initialQuery={q ?? ""} />
      <Footer />
    </>
  )
}
