import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Mail01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { supabase } from "@/lib/supabase"
import { AuthShell } from "./auth-shell"

export function VerifyEmailPage() {
  const email = sessionStorage.getItem("struktura:signup-email") ?? ""
  const [resending, setResending] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  const maskedEmail = (() => {
    if (!email) return "your email"
    const [name, domain] = email.split("@")
    if (!domain) return email
    const visible = name.slice(0, 2)
    return `${visible}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`
  })()

  const handleResend = async () => {
    if (!email) {
      setError("No email on record — please sign up again.")
      return
    }
    setError("")
    setNotice("")
    setResending(true)
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      })
      if (resendError) throw resendError
      setNotice("Verification email resent — check your inbox.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend email")
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthShell
      title="Check your inbox."
      subtitle={`We sent a verification link to ${maskedEmail}. Click the link to confirm your account and continue to onboarding.`}
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
      <div className="space-y-5">
        <div className="rounded-md border border-brand-orange/20 bg-brand-orange/5 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white">
              <HugeiconsIcon icon={Mail01Icon} className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-brand-black">
                Verification email sent
              </p>
              <p className="mt-1 text-xs leading-relaxed text-brand-black/70">
                Click the link in your email to verify your account. You can
                close this tab after verifying.
              </p>
            </div>
          </div>
        </div>

        {notice && <p className="text-sm text-brand-black/70">{notice}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-black/15 bg-white py-3 text-sm font-semibold text-brand-black transition-colors hover:border-brand-orange/50 hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HugeiconsIcon icon={RefreshIcon} className="size-3.5" />
          {resending ? "Sending…" : "Resend verification email"}
        </button>

        <Link
          to="/auth/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft"
        >
          Go to sign in
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Link>
      </div>
    </AuthShell>
  )
}
