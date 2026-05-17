import { useEffect, useMemo, useState } from "react"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { AnimatePresence, motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { useAuth, type BackendRole, type OnboardingState } from "@/lib/auth-context"
import { OnboardingLayout } from "@/components/onboarding/onboarding-layout"
import { OnboardingComplete } from "@/components/onboarding/onboarding-complete"

type FieldKind = "text" | "email" | "tel" | "number" | "textarea" | "tags" | "url_list" | "select"

type FieldConfig = {
  name: string
  label: string
  kind?: FieldKind
  placeholder?: string
  required?: boolean
  options?: string[]
}

const ROLE_LABELS: Record<BackendRole, string> = {
  CLIENT: "Buyer",
  CONTRACTOR: "Contractor",
  SUPPLIER: "Hardware Seller",
  JOB_SEEKER: "Job Seeker",
  ADMIN: "Admin",
  MODERATOR: "Moderator",
  SUPPORT: "Support",
}

const STEP_FIELDS: Record<string, FieldConfig[]> = {
  account_setup: [
    { name: "phone", label: "Phone number", kind: "tel", placeholder: "+63 912 345 6789" },
  ],
  profile_setup: [
    { name: "first_name", label: "First name", required: true },
    { name: "last_name", label: "Last name", required: true },
    { name: "phone", label: "Phone number", kind: "tel" },
  ],
  address_setup: [
    { name: "address", label: "Address", required: true },
    { name: "city", label: "City", required: true },
    { name: "province", label: "Province", required: true },
  ],
  preferences_setup: [
    { name: "interested_services", label: "Interested services", kind: "tags", placeholder: "Plumbing, electrical, renovation" },
    { name: "interested_product_categories", label: "Interested product categories", kind: "tags", placeholder: "Cement, steel, tiles" },
    { name: "preferred_location", label: "Preferred location" },
  ],
  document_upload: [
    { name: "verification_documents", label: "Document links", kind: "url_list", placeholder: "https://drive.google.com/..." },
  ],
  verification_submission: [],
  supplier_profile: [
    { name: "business_name", label: "Business name", required: true },
    { name: "business_address", label: "Business address", required: true },
    { name: "contact_person", label: "Contact person", required: true },
  ],
  business_information: [
    { name: "business_registration_number", label: "Business registration number" },
    { name: "tax_identification_number", label: "Tax identification number" },
  ],
  product_setup: [
    { name: "product_category", label: "Product category", required: true },
    { name: "first_product", label: "First product", required: true },
  ],
  inventory_setup: [
    { name: "inventory_stock", label: "Available stock", kind: "number", required: true },
  ],
}

export const Route = createFileRoute("/onboarding/$role")({
  beforeLoad: async ({ params }) => {
    const validRoles: BackendRole[] = ["CLIENT", "SUPPLIER"]
    if (!validRoles.includes(params.role as BackendRole)) {
      throw redirect({ to: "/onboarding/role-select" })
    }
  },
  component: OnboardingWizard,
})

function OnboardingWizard() {
  const { role } = Route.useParams()
  const {
    getOnboardingState,
    startOnboarding,
    saveOnboardingStep,
    submitOnboarding,
  } = useAuth()
  const [currentState, setCurrentState] = useState<OnboardingState | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError("")
      try {
        const existing = await getOnboardingState(role as BackendRole)
        const state = existing ?? (await startOnboarding(role as BackendRole))
        if (!cancelled) setCurrentState(state)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load onboarding.")
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [getOnboardingState, role, startOnboarding])

  const steps = currentState?.steps ?? []
  const currentStepCode =
    currentState?.currentStep ?? steps.find((step) => step.status !== "COMPLETED")?.stepCode
  const currentStep = steps.find((step) => step.stepCode === currentStepCode) ?? steps[0]
  const currentStepIndex = currentStep
    ? Math.max(0, steps.findIndex((step) => step.stepCode === currentStep.stepCode))
    : 0
  const isLastStep = currentStepIndex === steps.length - 1
  const isSubmitted =
    currentState?.status === "COMPLETED" ||
    currentState?.status === "PENDING_VERIFICATION"

  const stepItems = useMemo(
    () =>
      steps.map((step) => ({
        key: step.stepCode,
        label: step.title,
        description: step.description,
        completed: step.status === "COMPLETED",
        current: step.stepCode === currentStep?.stepCode,
      })),
    [currentStep?.stepCode, steps],
  )

  async function handleSaveStep(step: string, data: Record<string, unknown>) {
    setSaving(true)
    setError("")
    try {
      const saved = await saveOnboardingStep(role as BackendRole, step, data)
      if (isLastStep) {
        setCurrentState(await submitOnboarding(role as BackendRole))
      } else {
        setCurrentState(saved)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save onboarding step.")
    } finally {
      setSaving(false)
    }
  }

  if (isSubmitted && currentState) {
    return (
      <OnboardingComplete
        roleLabel={ROLE_LABELS[role as BackendRole]}
        requiresVerification={currentState.status === "PENDING_VERIFICATION"}
      />
    )
  }

  if (!currentState || !currentStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-black/10 border-t-brand-orange" />
      </div>
    )
  }

  const fields = STEP_FIELDS[currentStep.stepCode] ?? []
  return (
    <OnboardingLayout
      roleLabel={ROLE_LABELS[role as BackendRole]}
      steps={stepItems}
      currentStepIndex={currentStepIndex + 1}
      totalSteps={steps.length}
      showBack={false}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep.stepCode}
          initial={{ opacity: 0, x: 24, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -18, filter: "blur(4px)" }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-xl"
        >
          <StepForm
            formId="onboarding-step-form"
            title={currentStep.title}
            description={currentStep.description}
            fields={fields}
            optional={!currentStep.isRequired}
            initialData={currentStep.metadataJson}
            onSave={(data) => handleSaveStep(currentStep.stepCode, data)}
          />

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

          <div className="mt-8 flex items-center justify-between border-t border-brand-black/10 pt-6">
            <div className="text-xs text-brand-black/40">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
            <button
              type="submit"
              form="onboarding-step-form"
              disabled={saving}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                isLastStep
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-brand-orange hover:bg-brand-orange-soft",
              )}
            >
              {saving && (
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {isLastStep ? "Submit for Review" : "Save & Continue"}
              {!isLastStep && <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </OnboardingLayout>
  )
}

function StepForm({
  formId,
  title,
  description,
  fields,
  optional,
  initialData,
  onSave,
}: {
  formId: string
  title: string
  description: string | null
  fields: FieldConfig[]
  optional: boolean
  initialData: Record<string, unknown>
  onSave: (data: Record<string, unknown>) => void
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initialData)

  useEffect(() => {
    setValues(initialData)
  }, [initialData])

  function update(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    onSave(values)
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-brand-black">
            {title}
          </h2>
          {optional && (
            <span className="rounded-full bg-brand-black/5 px-2.5 py-1 text-[11px] font-semibold text-brand-black/55">
              Optional
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-brand-black/60">{description}</p>
        )}
      </div>

      {fields.length === 0 ? (
        <div className="rounded-md border border-brand-black/10 bg-white p-4 text-sm text-brand-black/65">
          Review your saved onboarding details, then submit this flow.
        </div>
      ) : (
        fields.map((field) => (
          <FieldInput
            key={field.name}
            field={{ ...field, required: optional ? false : field.required }}
            value={values[field.name]}
            onChange={(value) => update(field.name, value)}
          />
        ))
      )}
    </form>
  )
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig
  value: unknown
  onChange: (value: unknown) => void
}) {
  const kind = field.kind ?? "text"
  const stringValue = typeof value === "string" || typeof value === "number" ? String(value) : ""
  const listValue = Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []

  return (
    <label className="block">
      <span className="text-sm font-semibold text-brand-black">
        {field.label}
      </span>
      <div className="mt-2">
        {kind === "textarea" ? (
          <textarea
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={`${inputClass} resize-none`}
          />
        ) : kind === "tags" || kind === "url_list" ? (
          <TagInput
            value={listValue}
            placeholder={field.placeholder}
            urlMode={kind === "url_list"}
            onChange={onChange}
          />
        ) : kind === "select" ? (
          <select
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            required={field.required}
            className={inputClass}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={kind}
            value={stringValue}
            onChange={(event) =>
              onChange(kind === "number" ? Number(event.target.value) : event.target.value)
            }
            placeholder={field.placeholder}
            required={field.required}
            className={inputClass}
          />
        )}
      </div>
    </label>
  )
}

function TagInput({
  value,
  placeholder,
  urlMode,
  onChange,
}: {
  value: string[]
  placeholder?: string
  urlMode?: boolean
  onChange: (value: string[]) => void
}) {
  const [draft, setDraft] = useState("")

  function add() {
    const trimmed = draft.trim()
    if (!trimmed || value.includes(trimmed)) return
    onChange([...value, trimmed])
    setDraft("")
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type={urlMode ? "url" : "text"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault()
              add()
            }
          }}
          placeholder={placeholder}
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          className="rounded-md bg-brand-orange px-4 text-sm font-semibold text-white hover:bg-brand-orange-soft"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter((next) => next !== item))}
                className="text-brand-orange/60 hover:text-brand-orange"
              >
                x
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

const inputClass =
  "w-full rounded-md border border-brand-black/15 bg-white px-4 py-3 text-sm text-brand-black placeholder:text-brand-black/40 outline-none transition-shadow focus:border-brand-orange/40 focus:ring-2 focus:ring-brand-orange/20"
