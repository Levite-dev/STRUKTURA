import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, StarIcon } from "@hugeicons/core-free-icons"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { peso } from "@/components/shared/price-tag"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/cart/cart-context"
import { products, type Product } from "./shop-data"

const sampleReviews = [
  {
    author: "Maria S.",
    rating: 5,
    date: "2 weeks ago",
    text: "Great quality and arrived earlier than expected. Will reorder for our next project.",
  },
  {
    author: "Carlo D.",
    rating: 5,
    date: "1 month ago",
    text: "Solid product, fair price. Supplier was responsive when I asked about bulk pricing.",
  },
  {
    author: "Aileen R.",
    rating: 4,
    date: "2 months ago",
    text: "Met expectations overall. Packaging could be better but the contents were intact.",
  },
]

const bulletByCategory: Record<string, string[]> = {
  "Cement & Concrete": [
    "Type I Portland — fresh stock",
    "Bulk pricing available",
    "Standard 40kg / bag",
  ],
  "Tiles & Flooring": [
    "Premium-grade porcelain finish",
    "Stain-resistant matte surface",
    "Box covers 1.44 m²",
  ],
  "Paint & Finishes": [
    "Low-VOC formulation",
    "Indoor + outdoor use",
    "Color match guarantee",
  ],
  default: [
    "Sourced from a verified supplier",
    "Bulk pricing available on request",
    "Escrow-protected purchase",
  ],
}

export function ProductDetailPage({ product }: { product: Product }) {
  const [activeImg, setActiveImg] = useState(0)
  const cart = useCart()
  const navigate = useNavigate()
  const bullets = bulletByCategory[product.category] ?? bulletByCategory.default

  const onAdd = () => cart.add(product.id, 1)
  const onBuy = () => {
    cart.add(product.id, 1)
    navigate({ to: "/checkout" })
  }

  const ratingNum = Math.round(product.rating)
  const thumbs = [product.image, product.image, product.image, product.image]

  return (
    <div className="bg-background">
      <Header />
      <main className="mx-auto max-w-[1280px] px-6 py-12 sm:px-12 lg:px-20 xl:px-24">
        <div className="rounded-md border border-border bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          <nav
            aria-label="Breadcrumb"
            className="mb-10 flex flex-wrap items-center gap-2 text-base font-medium text-brand-black/70"
          >
            <Link to="/" className="hover:text-brand-orange">
              Home
            </Link>
            <span className="text-brand-black/40">/</span>
            <Link to="/shop" className="hover:text-brand-orange">
              Products
            </Link>
            <span className="text-brand-black/40">/</span>
            <Link
              to="/shop"
              className="hover:text-brand-orange"
            >
              {product.category}
            </Link>
            <span className="text-brand-black/40">/</span>
            <span className="text-brand-orange">{product.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-4">
              <div className="flex flex-col gap-3">
                {thumbs.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "aspect-square overflow-hidden border bg-muted transition-colors",
                      activeImg === i ? "border-brand-orange" : "border-border hover:border-brand-black/30"
                    )}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={src}
                      alt=""
                      className={cn("size-full object-cover", activeImg === i ? "" : "opacity-80")}
                    />
                  </button>
                ))}
              </div>
              <div className="aspect-square overflow-hidden border border-border bg-muted">
                <img
                  src={thumbs[activeImg]}
                  alt={product.name}
                  className="size-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <h1 className="text-4xl font-bold tracking-tight text-brand-black sm:text-5xl">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-brand-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    className={cn(
                      "size-5",
                      i < ratingNum ? "text-brand-orange" : "text-brand-black/15"
                    )}
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-brand-black/70">
                  ({product.reviews})
                </span>
              </div>

              <div className="mt-8 flex flex-col gap-1">
                {product.oldPrice && product.oldPrice > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    MRP: {peso(product.oldPrice)}
                  </span>
                )}
                <span className="text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">
                  MRP: {peso(product.price)}
                </span>
                <span className="text-sm text-muted-foreground">(inclusive of all taxes)</span>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-bold text-brand-black">About Product</h2>
                <ul className="mt-3 space-y-2 text-sm text-brand-black/80">
                  {bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-block size-1.5 rounded-full bg-brand-black/40" />
                      {b}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-brand-black/60">
                    <span className="mt-1.5 inline-block size-1.5 rounded-full bg-brand-black/40" />
                    Supplied by {product.supplier} · {product.unit}
                  </li>
                </ul>
              </div>

              <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onAdd}
                  className="h-14 bg-muted text-sm font-semibold tracking-wide text-brand-black transition-colors hover:bg-brand-black/10"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={onBuy}
                  className="inline-flex h-14 items-center justify-center gap-2 bg-brand-orange text-sm font-semibold tracking-wide text-white transition-colors hover:bg-brand-orange-soft"
                >
                  Buy now
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-20 rounded-md border border-border bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold tracking-tight text-brand-black">
            Description
          </h2>
          <div className="mt-4 max-w-3xl space-y-4 text-sm leading-relaxed text-brand-black/75">
            <p>
              {product.name} from {product.supplier} is sourced and stocked through
              STRUKTURA&apos;s verified supplier network. Every order is backed by
              escrow-protected payment, so your funds are released only when the
              materials arrive in good condition. This product belongs to our{" "}
              {product.category.toLowerCase()} catalog and is suitable for both
              residential and small-commercial construction projects across the
              Philippines.
            </p>
            <p>
              For bulk orders or project-grade requirements, message the supplier
              directly to negotiate volume pricing, lead time, and delivery
              schedule. STRUKTURA supports bi-weekly seller payouts and a
              7-day return window for materials that do not match the listed
              specifications.
            </p>
          </div>
        </section>

        <section className="mt-16 border-t border-border pt-12">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-brand-black">
              Reviews
            </h2>
            <div className="inline-flex items-center gap-2 text-sm">
              <div className="inline-flex items-center gap-1 text-brand-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <HugeiconsIcon
                    key={i}
                    icon={StarIcon}
                    className={cn(
                      "size-4",
                      i < ratingNum ? "text-brand-orange" : "text-brand-black/15"
                    )}
                  />
                ))}
              </div>
              <span className="font-semibold text-brand-black">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">({product.reviews} reviews)</span>
            </div>
          </header>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {sampleReviews.map((r, i) => (
              <li key={i} className="border border-border bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-brand-black">
                      {r.author}
                    </p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                  <div className="inline-flex items-center gap-0.5 text-brand-orange">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <HugeiconsIcon key={j} icon={StarIcon} className="size-3.5" />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm text-brand-black/80">{r.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 border-t border-border pt-12">
          <header className="mb-6 flex items-end justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-brand-black">
              You may also like
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-brand-orange uppercase hover:underline"
            >
              See all
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
            </Link>
          </header>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <Link
                  key={p.id}
                  to="/shop/$productId"
                  params={{ productId: p.id }}
                  className="group flex flex-col gap-3 border border-border bg-white p-3 transition-shadow hover:shadow-md"
                >
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col gap-1 px-1">
                    <p className="line-clamp-2 text-sm font-semibold text-brand-black">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.supplier}</p>
                    <p className="mt-1 text-base font-bold tracking-tight text-brand-black">
                      {peso(p.price)}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
