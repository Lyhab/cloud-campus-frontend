"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import AuthField from "../../_components/auth-field";
import { resetPassword } from "@/app/lib/api/auth";
import { useToast } from "@/app/components/ui/toast";

type FieldName = "password" | "confirmPassword";
type FormErrors = Partial<Record<FieldName, string>>;

function validatePasswords(formData: FormData): FormErrors {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const errors: FormErrors = {};

  if (!password) {
    errors.password = "New password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm your new password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function ConfirmResetPasswordForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const code = searchParams.get("code") ?? "";
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: FieldName) {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !code) {
      setFormError("Your reset session is incomplete. Request a new code.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors = validatePasswords(formData);
    setErrors(nextErrors);
    setFormError("");

    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = Object.keys(nextErrors)[0] as FieldName;
      const field = form.elements.namedItem(firstInvalidField);
      if (field instanceof HTMLElement) field.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await resetPassword({
        email,
        code,
        password: String(formData.get("password")),
      });
      toast.success("Password updated successfully.");
      router.replace("/sign-in?passwordReset=1");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to reset password.",
      );
      toast.error("Unable to update password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <section
        aria-labelledby="new-password-heading"
        className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 shadow-[0_2px_5px_rgba(15,23,42,0.10)] sm:px-11 sm:py-10"
      >
        <header className="mb-8">
          <h1
            id="new-password-heading"
            className="text-2xl font-bold tracking-[-0.025em] text-[#0f172a] sm:text-[28px]"
          >
            Choose a new password
          </h1>
          <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
            Use at least eight characters for your new password.
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <AuthField
            id="password"
            label="New password"
            type="password"
            placeholder="Enter a new password"
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

          {formError && (
            <p role="alert" className="text-sm text-[#e53e3e]">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-4 text-base font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2563eb]/30 focus-visible:ring-offset-2 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Updating password..." : "Update Password"}
          </button>
        </form>
      </section>

      <p className="mt-7 text-center text-sm sm:text-base">
        <Link
          href="/reset-password"
          className="font-medium text-[#2563eb] outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        >
          Request a new code
        </Link>
      </p>
    </div>
  );
}

export default function ConfirmResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#64748b]">Loading...</p>}>
      <ConfirmResetPasswordForm />
    </Suspense>
  );
}
