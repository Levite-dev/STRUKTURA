import { createFileRoute } from "@tanstack/react-router"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { QuoteForm } from "@/components/landing/quote-form"
import { SolutionsHero } from "@/components/solutions/solutions-hero"
import { PersonaGrid } from "@/components/solutions/persona-grid"
import { OutcomeStats } from "@/components/solutions/outcome-stats"
import { PersonaTestimonial } from "@/components/solutions/persona-testimonial"

export const Route = createFileRoute("/solutions")({
  component: SolutionsPage,
})

function SolutionsPage() {
  return (
    <main className="bg-background">
      <Header />
      <SolutionsHero />
      <PersonaGrid />
      <OutcomeStats />
      <PersonaTestimonial />
      <QuoteForm />
      <Footer />
    </main>
  )
}
