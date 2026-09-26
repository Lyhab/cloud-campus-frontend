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
}: AuthFieldProps) {
  const errorId = `${id}-error`;

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
        {labelAction ?? (optional && (
          <span className="text-xs font-normal text-[#64748b]">Optional</span>
        ))}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={onChange}
        className={`h-12 w-full rounded-lg border bg-white px-4 text-[15px] text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-3 focus:ring-[#2563eb]/10 ${
          error
            ? "border-[#e53e3e] focus:border-[#e53e3e] focus:ring-[#e53e3e]/10"
            : "border-[#e2e8f0]"
        }`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-[#e53e3e]">
          {error}
        </p>
      )}
    </div>
  );
}
