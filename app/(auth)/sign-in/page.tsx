"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthField from "../_components/auth-field";
import { login } from "@/app/lib/api/auth";
import { useToast } from "@/app/components/ui/toast";

type FieldName = "email" | "password";
type FormErrors = Partial<Record<FieldName, string>>;

function validateSignIn(formData: FormData): FormErrors {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const errors: FormErrors = {};

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) errors.password = "Password is required.";

  return errors;
}

export default function SignInPage() {
  const router = useRouter();
  const toast = useToast();
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

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextErrors = validateSignIn(formData);
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
      await login({
        email: String(formData.get("email")).trim(),
        password: String(formData.get("password")),
        rememberMe: formData.get("rememberMe") === "on",
      });
      toast.success("Signed in successfully.");
      router.replace("/dashboard");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
      toast.error("Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <section
        aria-labelledby="sign-in-heading"
        className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 shadow-[0_2px_5px_rgba(15,23,42,0.10)] sm:px-11 sm:py-10"
      >
        <header className="mb-8">
          <h1
            id="sign-in-heading"
            className="text-2xl font-bold tracking-[-0.025em] text-[#0f172a] sm:text-[28px]"
          >
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
            Sign in to your Cloud Campus account
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
            onChange={() => clearError("email")}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter password"
            autoComplete="current-password"
            error={errors.password}
            onChange={() => clearError("password")}
            labelAction={
              <Link
                href="/reset-password"
                className="text-sm font-normal text-[#2563eb] outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
              >
                Forgot password?
              </Link>
            }
          />

          <div className="flex items-center">
            <input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              autoComplete="off"
              className="size-4 cursor-pointer rounded border-[#94a3b8] accent-[#2563eb]"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2.5 cursor-pointer text-sm text-[#475569] sm:text-base"
            >
              Remember me for 30 days
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-4 text-base font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2563eb]/30 focus-visible:ring-offset-2 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>

          {formError && (
            <p role="alert" className="text-center text-sm text-[#e53e3e]">
              {formError}
            </p>
          )}

          <Link
            href="/reset-password"
            className="flex justify-center rounded-md text-sm font-medium text-[#2563eb] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
          >
            Use a password reset code
          </Link>
        </form>
      </section>

      <p className="mt-7 text-center text-sm text-[#64748b] sm:text-base">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-[#2563eb] outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
