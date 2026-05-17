import { createFileRoute } from "@tanstack/react-router"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { ContactHero } from "@/components/contact/contact-hero"
import { ContactGrid } from "@/components/contact/contact-grid"
import { OfficesGrid } from "@/components/contact/offices-grid"
import { ContactFAQ } from "@/components/contact/contact-faq"

export const Route = createFileRoute("/contact")({
  component: ContactPage,
})

function ContactPage() {
  return (
    <main className="bg-background">
      <Header />
      <ContactHero />
      <ContactGrid />
      <OfficesGrid />
      <ContactFAQ />
      <Footer />
    </main>
  )
}
