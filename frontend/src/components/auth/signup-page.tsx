import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  LockPasswordIcon,
  UserIcon,
  ArrowRight01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  ShoppingBag03Icon,
  Store02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useAuth, type FrontendRole } from "@/lib/auth-context"
import { AuthShell } from "./auth-shell"

export type SignupRole = "buyer" | "seller"

const roles: { id: SignupRole; label: string; tagline: string; icon: typeof ShoppingBag03Icon }[] = [
  {
    id: "buyer",
    label: "Buyer",
    tagline: "Shop construction materials",
    icon: ShoppingBag03Icon,
  },
  {
    id: "seller",
    label: "Hardware Seller",
    tagline: "List and manage products",
    icon: Store02Icon,
  },
]

export function SignupPage({ initialRole = "buyer" }: { initialRole?: SignupRole }) {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [role, setRole] = useState<SignupRole>(initialRole)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agree) return
    setError("")
    setLoading(true)
    try {
      await signUp(email, password, name || undefined, role as FrontendRole)
      navigate({ to: "/auth/verify-email" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Create your account."
      subtitle="Choose whether you are buying construction materials or selling through the marketplace."
      bottomPrompt={
        <>
          Already have an account?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-brand-orange hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-brand-black">
            I&rsquo;m signing up as a…
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {roles.map((r) => {
              const isActive = role === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-1.5 rounded-md border px-3 py-4 text-center transition-colors",
                    isActive
                      ? "border-brand-orange bg-brand-orange/5"
                      : "border-brand-black/15 bg-white hover:border-brand-orange/40",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="role-pill"
                      className="absolute inset-0 -z-10 rounded-md bg-brand-orange/[0.06]"
                      transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    />
                  )}
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-full",
                      isActive
                        ? "bg-brand-orange text-white"
                        : "bg-brand-orange/10 text-brand-orange",
                    )}
                  >
                    <HugeiconsIcon icon={r.icon} className="size-4" />
                  </span>
                  <span className="text-sm font-bold text-brand-black">
                    {r.label}
                  </span>
                  <span className="text-[10px] leading-tight text-brand-black/65">
                    {r.tagline}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <Field label="Full name">
          <InputWithIcon
            icon={UserIcon}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maria Santos"
            autoComplete="name"
          />
        </Field>

        <Field label="Email">
          <InputWithIcon
            icon={Mail01Icon}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field label="Password" hint="At least 8 characters with a number">
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/45">
              <HugeiconsIcon icon={LockPasswordIcon} className="size-4" />
            </span>
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="At least 8 characters"
              className={`${inputClass} pr-10 pl-10`}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-black/45 transition-colors hover:text-brand-orange"
            >
              <HugeiconsIcon
                icon={showPw ? ViewOffSlashIcon : ViewIcon}
                className="size-4"
              />
            </button>
          </div>
        </Field>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <label className="flex items-start gap-2.5 text-xs text-brand-black/75">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-brand-black/20 text-brand-orange focus:ring-brand-orange/40"
            required
          />
          <span>
            I agree to STRUKTURA&rsquo;s{" "}
            <Link to="/" className="font-semibold text-brand-orange hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/" className="font-semibold text-brand-orange hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={!agree || loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
          Create account
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </button>
      </form>
    </AuthShell>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-black">
        {label}
      </label>
      {hint && <p className="mt-1 text-xs text-brand-black/70">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}

const inputClass =
  "w-full rounded-md border border-brand-black/15 bg-white px-4 py-3 text-sm text-brand-black placeholder:text-brand-black/45 outline-none transition-shadow focus:border-brand-orange/40 focus:ring-2 focus:ring-brand-orange/20"

function InputWithIcon({
  icon,
  ...props
}: { icon: typeof Mail01Icon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/45">
        <HugeiconsIcon icon={icon} className="size-4" />
      </span>
      <input {...props} className={`${inputClass} pl-10`} />
    </div>
  )
}
