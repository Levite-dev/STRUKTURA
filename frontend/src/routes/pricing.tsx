import { createFileRoute } from "@tanstack/react-router"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { QuoteForm } from "@/components/landing/quote-form"
import { PricingHero } from "@/components/pricing/pricing-hero"
import { useBilling } from "@/components/pricing/use-billing"
import { PricingTiers } from "@/components/pricing/pricing-tiers"
import { ComparisonTable } from "@/components/pricing/comparison-table"
import { EnterpriseBand } from "@/components/pricing/enterprise-band"
import { PricingFAQ } from "@/components/pricing/pricing-faq"

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
})

function PricingPage() {
  const [billing, setBilling] = useBilling()

  return (
    <main className="bg-background">
      <Header />
      <PricingHero billing={billing} onChange={setBilling} />
      <PricingTiers billing={billing} />
      <ComparisonTable />
      <EnterpriseBand />
      <PricingFAQ />
      <QuoteForm />
      <Footer />
    </main>
  )
}
