"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthField from "../_components/auth-field";
import { forgotPassword } from "../../lib/api/auth";

type FormErrors = {
  email?: string;
};

function validateForgotPassword(formData: FormData): FormErrors {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      email: "Email address is required.",
    };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      email: "Enter a valid email address.",
    };
  }

  return {};
}

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const nextErrors = validateForgotPassword(formData);

    setErrors(nextErrors);
    setSubmitError("");

    if (nextErrors.email) {
      const field = form.elements.namedItem("email");

      if (field instanceof HTMLElement) {
        field.focus();
      }

      return;
    }

    const email = String(formData.get("email") ?? "").trim();

    setIsSubmitting(true);

    try {
      await forgotPassword({
        email,
      });

      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <section
        aria-labelledby="forgot-password-heading"
        className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 shadow-[0_2px_5px_rgba(15,23,42,0.10)] sm:px-11 sm:py-10"
      >
        <header className="mb-8">
          <h1
            id="forgot-password-heading"
            className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-[28px]"
          >
            Forgot your password?
          </h1>

          <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
            Enter your email and we will send you a reset code
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          <AuthField
            id="email"
            label="Email address"
            type="email"
            placeholder="you@uni.edu"
            autoComplete="email"
            error={errors.email}
            onChange={() => {
              if (errors.email) {
                setErrors({});
              }

              if (submitError) {
                setSubmitError("");
              }
            }}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-4 text-base font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2563eb]/30 focus-visible:ring-offset-2 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Sending..." : "Send Reset Code"}
          </button>
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
