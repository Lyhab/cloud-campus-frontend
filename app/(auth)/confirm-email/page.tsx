"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  confirmEmail,
  login,
  resendConfirmationCode,
} from "../../lib/api/auth";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;
const PENDING_LOGIN_KEY = "pendingLogin";

function takePendingLogin(email: string) {
  try {
    const raw = sessionStorage.getItem(PENDING_LOGIN_KEY);

    sessionStorage.removeItem(PENDING_LOGIN_KEY);

    if (!raw) {
      return null;
    }

    const saved = JSON.parse(raw) as {
      email?: string;
      password?: string;
    };

    if (saved.email === email && saved.password) {
      return {
        email: saved.email,
        password: saved.password,
      };
    }
  } catch {
    // Ignore storage / parse errors.
  }

  return null;
}

function ConfirmEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setCooldown((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);

    const next = [...digits];
    next[index] = digit;

    setDigits(next);
    setError("");

    if (digit && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    const pastedDigits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pastedDigits) {
      return;
    }

    event.preventDefault();

    const next = Array(CODE_LENGTH).fill("");

    pastedDigits.split("").forEach((digit, index) => {
      next[index] = digit;
    });

    setDigits(next);
    setError("");

    inputs.current[Math.min(pastedDigits.length, CODE_LENGTH) - 1]?.focus();
  }

  async function handleResend() {
    if (!email) {
      setError("Email is missing. Please sign up again.");
      return;
    }

    setError("");
    setInfo("");
    setIsResending(true);

    try {
      await resendConfirmationCode({ email });

      setInfo("A new code has been sent to your email.");
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsResending(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setError("Email is missing. Please sign up again.");
      return;
    }

    const firstEmpty = digits.findIndex((digit) => !digit);

    if (firstEmpty !== -1) {
      setError("Enter the complete six-digit code.");
      inputs.current[firstEmpty]?.focus();
      return;
    }

    setError("");
    setInfo("");
    setIsSubmitting(true);

    try {
      // Step 1: Confirm the email.
      await confirmEmail({
        email,
        code: digits.join(""),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");

      setIsSubmitting(false);
      return;
    }

    // Step 2: Get the credentials saved during sign-up.
    const pending = takePendingLogin(email);

    // Step 3: Automatically sign in.
    if (pending) {
      try {
        await login({
          email: pending.email,
          password: pending.password,
          rememberMe: false,
        });

        // Step 4: Go to dashboard.
        router.push("/dashboard");
        router.refresh();

        return;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Email verified, but automatic sign-in failed.",
        );

        setIsSubmitting(false);
        return;
      }
    }

    // No saved credentials.
    router.push("/sign-in");
  }

  return (
    <div className="w-full">
      <section
        aria-labelledby="confirm-heading"
        className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 shadow-[0_2px_5px_rgba(15,23,42,0.10)] sm:px-11 sm:py-10"
      >
        <header className="mb-8">
          <h1
            id="confirm-heading"
            className="text-2xl font-bold tracking-tight text-[#0f172a] sm:text-[28px]"
          >
            Enter verification code
          </h1>

          <p className="mt-1.5 text-sm leading-6 text-[#64748b] sm:text-base">
            {email ? (
              <>
                Enter the six-digit code sent to{" "}
                <span className="font-medium text-[#0f172a]">{email}</span>.
              </>
            ) : (
              "Enter the six-digit code sent to your email address."
            )}
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit}>
          <fieldset>
            <legend className="sr-only">Six-digit verification code</legend>

            <div className="mx-auto grid max-w-99 grid-cols-6 gap-2 sm:gap-3">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputs.current[index] = element;
                  }}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  onPaste={handlePaste}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  aria-label={`Digit ${index + 1} of ${CODE_LENGTH}`}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "verification-error" : undefined}
                  className={`aspect-square w-full min-w-0 rounded-lg border bg-white text-center text-xl font-semibold text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:ring-3 focus:ring-[#2563eb]/10 sm:text-2xl ${
                    error ? "border-[#e53e3e]" : "border-[#e2e8f0]"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p
                id="verification-error"
                role="alert"
                className="mt-2 text-sm text-[#e53e3e]"
              >
                {error}
              </p>
            )}

            {info && (
              <p role="status" className="mt-2 text-sm text-[#16a34a]">
                {info}
              </p>
            )}
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-4 text-base font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2563eb]/30 focus-visible:ring-offset-2 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </section>

      <p className="mt-7 text-center text-sm text-[#64748b] sm:text-base">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending || cooldown > 0}
          className="cursor-pointer font-medium text-[#2563eb] outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:text-[#94a3b8] disabled:no-underline"
        >
          {isResending
            ? "Sending..."
            : cooldown > 0
              ? `Resend in ${cooldown}s`
              : "Resend code"}
        </button>
      </p>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmEmailForm />
    </Suspense>
  );
}
