"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import AuthField from "../_components/auth-field";
import { resetPassword } from "../../lib/api/auth";

type FieldName = "code" | "password" | "confirmPassword";

type FormErrors = Partial<Record<FieldName, string>>;

function validateResetPassword(formData: FormData): FormErrors {
  const code = String(formData.get("code") ?? "").trim();

  const password = String(formData.get("password") ?? "");

  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const errors: FormErrors = {};

  if (!code) {
    errors.code = "Verification code is required.";
  } else if (!/^\d{6}$/.test(code)) {
    errors.code = "Enter the six-digit verification code.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must include an uppercase letter.";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Password must include a lowercase letter.";
  } else if (!/\d/.test(password)) {
    errors.password = "Password must include a number.";
  } else if (!/[^A-Za-z0-9]/.test(password)) {
    errors.password = "Password must include a special character.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];

      return next;
    });

    setSubmitError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setSubmitError("Email is missing. Please request a new reset code.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    const nextErrors = validateResetPassword(formData);

    setErrors(nextErrors);
    setSubmitError("");

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = Object.keys(nextErrors)[0] as FieldName;

      const field = form.elements.namedItem(firstInvalidField);

      if (field instanceof HTMLElement) {
        field.focus();
      }

      return;
    }

    const code = String(formData.get("code") ?? "").trim();

    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);

    try {
      await resetPassword({
        email,
        code,
        newPassword: password,
      });

      router.push("/sign-in");
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
        aria-labelledby="reset-password-heading"
        className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 shadow-[0_2px_5px_rgba(15,23,42,0.10)] sm:px-11 sm:py-10"
      >
        <header className="mb-8">
          <h1
            id="reset-password-heading"
            className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-[28px]"
          >
            Reset your password
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-[#64748b] sm:text-base">
            Enter the code sent to{" "}
            {email ? (
              <span className="font-medium text-[#0f172a]">{email}</span>
            ) : (
              "your email"
            )}{" "}
            and create a new password.
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
            id="code"
            label="Verification code"
            type="text"
            placeholder="Enter 6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            error={errors.code}
            onChange={() => clearError("code")}
            required
          />

          <AuthField
            id="password"
            label="New password"
            type="password"
            placeholder="Create a new password"
            autoComplete="new-password"
            required
            error={errors.password}
            onChange={() => clearError("password")}
          />

          <AuthField
            id="confirmPassword"
            label="Confirm new password"
            type="password"
            placeholder="Repeat your new password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword}
            onChange={() => clearError("confirmPassword")}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-4 text-base font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2563eb]/30 focus-visible:ring-offset-2 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
