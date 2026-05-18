import { useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Mail01Icon,
  LockPasswordIcon,
  ArrowRight01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons"
import { useAuth } from "@/lib/auth-context"
import { AuthShell } from "./auth-shell"

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await signIn(email, password)
      // After sign-in, auth state change will load the user.
      // Navigate to dashboard; the callback or route guards handle onboarding redirect.
      navigate({ to: "/dashboard" })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to keep building. The same account works for buyers, sellers, and contractors."
      bottomPrompt={
        <>
          New to STRUKTURA?{" "}
          <Link
            to="/auth/signup"
            className="font-semibold text-brand-orange hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <p className="text-sm text-destructive">{error}</p>}

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

        <Field
          label="Password"
          right={
            <Link
              to="/"
              className="text-[11px] font-semibold text-brand-orange hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            show={showPw}
            onToggle={() => setShowPw((v) => !v)}
          />
        </Field>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && (
            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          Sign in
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </button>
      </form>
    </AuthShell>
  )
}

function Field({
  label,
  right,
  children,
}: {
  label: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-semibold text-brand-black">{label}</label>
        {right}
      </div>
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

function PasswordField({
  value,
  onChange,
  show,
  onToggle,
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/45">
        <HugeiconsIcon icon={LockPasswordIcon} className="size-4" />
      </span>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder="At least 8 characters"
        autoComplete="current-password"
        required
        minLength={8}
        className={`${inputClass} pr-10 pl-10`}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-black/45 transition-colors hover:text-brand-orange"
      >
        <HugeiconsIcon icon={show ? ViewOffSlashIcon : ViewIcon} className="size-4" />
      </button>
    </div>
  )
}
