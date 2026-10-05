"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AuthField from "../_components/auth-field";
import { register } from "../../lib/api/auth";

type FieldName =
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword";

type FormErrors = Partial<Record<FieldName, string>>;

const PENDING_LOGIN_KEY = "pendingLogin";

function validateSignUp(formData: FormData): FormErrors {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const errors: FormErrors = {};

  if (!firstName) {
    errors.firstName = "First name is required.";
  }

  if (!lastName) {
    errors.lastName = "Last name is required.";
  }

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
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
    errors.confirmPassword = "Confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export default function SignUpPage() {
  const router = useRouter();

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
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

    const form = event.currentTarget;
    const formData = new FormData(form);

    const nextErrors = validateSignUp(formData);

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

    const firstName = String(formData.get("firstName") ?? "").trim();

    const middleName = String(formData.get("middleName") ?? "").trim();

    const lastName = String(formData.get("lastName") ?? "").trim();

    const email = String(formData.get("email") ?? "").trim();

    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);

    try {
      await register({
        firstName,
        ...(middleName ? { middleName } : {}),
        lastName,
        email,
        password,
      });

      // Save credentials temporarily so the user
      // can be signed in automatically after verification.
      sessionStorage.setItem(
        PENDING_LOGIN_KEY,
        JSON.stringify({
          email,
          password,
        }),
      );

      router.push(`/confirm-email?email=${encodeURIComponent(email)}`);
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
        aria-labelledby="sign-up-heading"
        className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 shadow-[0_2px_5px_rgba(15,23,42,0.10)] sm:px-11 sm:py-10"
      >
        <header className="mb-7">
          <h1
            id="sign-up-heading"
            className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-[28px]"
          >
            Create your account
          </h1>

          <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
            Join Cloud Campus and start sharing resources
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
            id="firstName"
            label="First name"
            placeholder="Enter your first name"
            autoComplete="given-name"
            required
            error={errors.firstName}
            onChange={() => clearError("firstName")}
          />

          <AuthField
            id="middleName"
            label="Middle name"
            placeholder="Enter your middle name"
            autoComplete="additional-name"
            optional
            error={errors.middleName}
            onChange={() => clearError("middleName")}
          />

          <AuthField
            id="lastName"
            label="Last name"
            placeholder="Enter your last name"
            autoComplete="family-name"
            required
            error={errors.lastName}
            onChange={() => clearError("lastName")}
          />

          <AuthField
            id="email"
            label="Email address"
            type="email"
            placeholder="you@uni.edu"
            autoComplete="email"
            required
            error={errors.email}
            onChange={() => clearError("email")}
          />

          <AuthField
            id="password"
            label="Password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
            error={errors.password}
            onChange={() => clearError("password")}
          />

          <AuthField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            placeholder="Repeat your password"
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
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </section>

      <p className="mt-7 text-center text-sm text-[#64748b] sm:text-base">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-[#2563eb] outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
