"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthField from "../_components/auth-field";
import { requestPasswordReset } from "@/app/lib/api/auth";
import { useToast } from "@/app/components/ui/toast";

type FormErrors = { email?: string };

function validateResetPassword(formData: FormData): FormErrors {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) return { email: "Email address is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { email: "Enter a valid email address." };
  }

  return {};
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const toast = useToast();
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors = validateResetPassword(formData);
    setErrors(nextErrors);
    setFormError("");

    if (nextErrors.email) {
      const field = form.elements.namedItem("email");
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    const email = String(formData.get("email")).trim();
    setIsSubmitting(true);

    try {
      await requestPasswordReset(email);
      toast.success("Verification code sent.");
      router.push(`/verify-code?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to send the reset code.",
      );
      toast.error("Unable to send the verification code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <section
        aria-labelledby="reset-password-heading"
        className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 shadow-[0_2px_5px_rgba(15,23,42,0.10)] sm:px-11 sm:py-10"
      >
        <header className="mb-8">
          <h1
            id="reset-password-heading"
            className="text-2xl font-bold tracking-[-0.025em] text-[#0f172a] sm:text-[28px]"
          >
            Reset your password
          </h1>
          <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
            Enter your email and we will send you a verification code
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <AuthField
            id="email"
            label="Email address"
            type="email"
            placeholder="you@uni.edu"
            autoComplete="email"
            error={errors.email}
            onChange={() => {
              if (errors.email) setErrors({});
            }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-4 text-base font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2563eb]/30 focus-visible:ring-offset-2 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending code..." : "Send Verification Code"}
          </button>

          {formError && (
            <p role="alert" className="text-center text-sm text-[#e53e3e]">
              {formError}
            </p>
          )}
        </form>
      </section>

      <p className="mt-7 text-center text-sm sm:text-base">
        <Link
          href="/sign-in"
          className="font-medium text-[#2563eb] outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        >
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
