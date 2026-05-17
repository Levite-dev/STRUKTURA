import { createFileRoute } from "@tanstack/react-router"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { ResourcesHero } from "@/components/resources/resources-hero"
import { PostGrid } from "@/components/resources/post-grid"
import { GuidesBand } from "@/components/resources/guides-band"
import { WebinarsList } from "@/components/resources/webinars-list"

export const Route = createFileRoute("/resources")({
  component: ResourcesPage,
})

function ResourcesPage() {
  return (
    <main className="bg-background">
      <Header />
      <ResourcesHero />
      <PostGrid />
      <GuidesBand />
      <WebinarsList />
      <Footer />
    </main>
  )
}
