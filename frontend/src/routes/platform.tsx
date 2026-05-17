import { createFileRoute } from "@tanstack/react-router"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { QuoteForm } from "@/components/landing/quote-form"
import { PlatformHero } from "@/components/platform/platform-hero"
import { CapabilityNav } from "@/components/platform/capability-nav"
import { CapabilityDetails } from "@/components/platform/capability-details"
import { IntegrationsStrip } from "@/components/platform/integrations-strip"
import { SecurityStrip } from "@/components/platform/security-strip"

export const Route = createFileRoute("/platform")({
  component: PlatformPage,
})

function PlatformPage() {
  return (
    <main className="bg-background">
      <Header />
      <PlatformHero />
      <CapabilityNav />
      <CapabilityDetails />
      <IntegrationsStrip />
      <SecurityStrip />
      <QuoteForm />
      <Footer />
    </main>
  )
}
