import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Mail01Icon,
  RefreshIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import { useAuth, type PendingEmailVerification } from "@/lib/auth-context"
import { AuthShell } from "./auth-shell"

const inputClass =
  "w-full rounded-md border border-brand-black/15 bg-white px-4 py-3 text-center text-xl font-bold tracking-[0.35em] text-brand-black placeholder:text-brand-black/30 outline-none transition-shadow focus:border-brand-orange/40 focus:ring-2 focus:ring-brand-orange/20"

export function VerifyEmailPage() {
  const navigate = useNavigate()
  const {
    getPendingEmailVerification,
    resendEmailVerificationOtp,
    verifyEmailOtp,
  } = useAuth()
  const [pending, setPending] = useState<PendingEmailVerification | null>(null)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")

  useEffect(() => {
    setPending(getPendingEmailVerification())
  }, [getPendingEmailVerification])

  const maskedEmail = useMemo(() => {
    if (!pending?.email) return "your email"
    const [name, domain] = pending.email.split("@")
    if (!domain) return pending.email
    const visible = name.slice(0, 2)
    return `${visible}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`
  }, [pending?.email])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!pending) return
    setError("")
    setNotice("")
    setLoading(true)
    try {
      const result = await verifyEmailOtp(code)
      navigate({ to: "/onboarding/$role", params: { role: result.role } })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setNotice("")
    setResending(true)
    try {
      const nextPending = await resendEmailVerificationOtp()
      setPending(nextPending)
      setCode("")
      setNotice("A new verification code has been generated.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend code")
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthShell
      title="Verify your email."
      subtitle={`Enter the 6-digit code sent to ${maskedEmail} to continue to onboarding.`}
      bottomPrompt={
        <>
          Used the wrong email?{" "}
          <Link
            to="/auth/signup"
            className="font-semibold text-brand-orange hover:underline"
          >
            Create a new account
          </Link>
        </>
      }
    >
      {pending ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="rounded-md border border-brand-orange/20 bg-brand-orange/5 p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
                <HugeiconsIcon icon={Mail01Icon} className="size-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-brand-black">
                  Check your inbox
                </p>
                <p className="mt-1 text-xs leading-relaxed text-brand-black/70">
                  We will use this screen with the real email OTP service later.
                  For this UI preview, use code{" "}
                  <span className="font-bold text-brand-black">{pending.otp}</span>.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-brand-black">
              Verification code
            </label>
            <div className="mt-2">
              <input
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                minLength={6}
                maxLength={6}
                className={inputClass}
              />
            </div>
          </div>

          {notice && <p className="text-sm text-brand-black/70">{notice}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && (
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            Verify email
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-black/15 bg-white py-3 text-sm font-semibold text-brand-black transition-colors hover:border-brand-orange/50 hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-50"
          >
            <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
            {resending ? "Sending new code..." : "Resend code"}
          </button>
        </form>
      ) : (
        <div className="rounded-md border border-brand-black/10 bg-white p-5 text-center shadow-sm">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-black/5 text-brand-black">
            <HugeiconsIcon icon={Shield01Icon} className="size-5" />
          </span>
          <p className="mt-4 text-sm font-bold text-brand-black">
            No pending verification
          </p>
          <p className="mt-1 text-sm text-brand-black/70">
            Start signup again to generate a verification code.
          </p>
          <Link
            to="/auth/signup"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft"
          >
            Go to signup
          </Link>
        </div>
      )}
    </AuthShell>
  )
}
