import { createFileRoute } from "@tanstack/react-router"
import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { About } from "@/components/landing/about"
import { WhatWeDo } from "@/components/landing/what-we-do"
import { Process } from "@/components/landing/process"
import { FeaturedProjects } from "@/components/landing/featured-projects"
import { Testimonial } from "@/components/landing/testimonial"
import { SellOnStruktura } from "@/components/marketplace/sell-on-struktura"
import { Footer } from "@/components/landing/footer"

export const Route = createFileRoute("/")({
  component: LandingPage,
})

function LandingPage() {
  return (
    <main className="bg-background">
      <Header />
      <Hero />
      <About />
      <WhatWeDo />
      <Process />
      <FeaturedProjects />
      <Testimonial />
      <SellOnStruktura />
      <Footer />
    </main>
  )
}
