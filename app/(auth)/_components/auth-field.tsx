"use client";

import { useState } from "react";

interface AuthFieldProps {
  id: string;
  label: string;
  type?: "text" | "email" | "password";
  placeholder: string;
  autoComplete: string;
  error?: string;
  optional?: boolean;
  required?: boolean;
  labelAction?: React.ReactNode;
  onChange: () => void;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      {open ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.7 17.7 0 0 1-3.2 4.2M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 4.4-1" />
          <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
        </>
      )}
    </svg>
  );
}

export default function AuthField({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  error,
  optional = false,
  required = false,
  labelAction,
  onChange,
  maxLength,
  inputMode,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  const isPassword = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-baseline justify-between gap-3 text-sm font-medium text-[#334155]"
      >
        <span>
          {label}
          {required && (
            <span className="ml-1 text-[#e53e3e]" aria-hidden="true">
              *
            </span>
          )}
        </span>

        {labelAction ??
          (optional && (
            <span className="text-xs font-normal text-[#64748b]">Optional</span>
          ))}
      </label>

      <div className="relative">
        <input
          id={id}
          name={id}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          maxLength={maxLength}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          onChange={onChange}
          className={`h-12 w-full rounded-lg border bg-white px-4 text-[15px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-3 focus:ring-[#2563eb]/10 ${
            isPassword ? "pr-12" : ""
          } ${
            error
              ? "border-[#e53e3e] focus:border-[#e53e3e] focus:ring-[#e53e3e]/10"
              : "border-[#e2e8f0]"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center rounded-r-lg text-[#64748b] outline-none transition hover:text-[#2563eb] focus-visible:ring-2 focus-visible:ring-[#2563eb]"
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-[#e53e3e]">
          {error}
        </p>
      )}
    </div>
  );
}
