"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";
import { verifyResetCode } from "@/app/lib/api/auth";
import { useToast } from "@/app/components/ui/toast";

const CODE_LENGTH = 6;

function VerifyCodeForm() {
  const router = useRouter();
  const toast = useToast();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");
    if (digit && index < CODE_LENGTH - 1) inputs.current[index + 1]?.focus();
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
    if (!pastedDigits) return;

    event.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    pastedDigits.split("").forEach((digit, index) => {
      next[index] = digit;
    });
    setDigits(next);
    setError("");
    inputs.current[Math.min(pastedDigits.length, CODE_LENGTH) - 1]?.focus();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      setError("Request a password reset code first.");
      return;
    }

    const firstEmpty = digits.findIndex((digit) => !digit);
    if (firstEmpty !== -1) {
      setError("Enter the complete six-digit code.");
      inputs.current[firstEmpty]?.focus();
      return;
    }

    const code = digits.join("");
    setError("");
    setIsSubmitting(true);

    try {
      await verifyResetCode(code);
      toast.success("Code verified.");
      router.push(
        `/reset-password/confirm?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`,
      );
    } catch (verificationError) {
      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Unable to verify this code.",
      );
      toast.error("Unable to verify this code.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full">
      <section
        aria-labelledby="verify-heading"
        className="rounded-2xl border border-[#e2e8f0] bg-white px-6 py-7 shadow-[0_2px_5px_rgba(15,23,42,0.10)] sm:px-11 sm:py-10"
      >
        <header className="mb-8">
          <h1
            id="verify-heading"
            className="text-2xl font-bold tracking-[-0.025em] text-[#0f172a] sm:text-[28px]"
          >
            Enter verification code
          </h1>
          <p className="mt-1.5 text-sm leading-6 text-[#64748b] sm:text-base">
            Enter the six-digit code
            {email ? ` sent to ${email}` : " sent to your email address"}.
          </p>
        </header>

        <form noValidate onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting}>
            <legend className="sr-only">Six-digit verification code</legend>
            <div className="mx-auto grid max-w-[396px] grid-cols-6 gap-2 sm:gap-3">
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
                  className={`aspect-square w-full min-w-0 rounded-lg border bg-white text-center text-xl font-semibold text-[#0f172a] outline-none transition focus:border-[#2563eb] focus:ring-3 focus:ring-[#2563eb]/10 disabled:opacity-60 sm:text-2xl ${error ? "border-[#e53e3e]" : "border-[#e2e8f0]"}`}
                />
              ))}
            </div>
          </fieldset>

          {error && (
            <p
              id="verification-error"
              role="alert"
              className="mt-2 text-sm text-[#e53e3e]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-lg bg-[#2563eb] px-4 text-base font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2563eb]/30 focus-visible:ring-offset-2 active:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </button>
        </form>
      </section>

      <p className="mt-7 text-center text-sm sm:text-base">
        <Link
          href="/reset-password"
          className="font-medium text-[#2563eb] outline-none hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        >
          Request another code
        </Link>
      </p>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#64748b]">Loading...</p>}>
      <VerifyCodeForm />
    </Suspense>
  );
}
