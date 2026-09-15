"use client";

interface ViewToggleProps {
  value: "admin" | "student";
  onChange: (value: "admin" | "student") => void;
}

export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  const isStudent = value === "student";

  return (
    <div className="mb-5 flex items-center gap-3">
      <span
        className="text-[14px] font-medium"
        style={{ color: "var(--foreground)" }}
      >
        View as
      </span>

      <div
        className="relative grid grid-cols-2 overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Sliding background */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1/2 transition-transform duration-300 ease-in-out"
          style={{
            backgroundColor: "var(--primary)",
            transform: isStudent
              ? "translate3d(100%, 0, 0)"
              : "translate3d(0, 0, 0)",
          }}
        />

        <button
          type="button"
          onClick={() => onChange("admin")}
          className={`relative z-10 w-full cursor-pointer px-7 py-2.5 text-[14px] font-medium transition-colors duration-200 ${
            isStudent ? "hover:bg-(--primary-light)" : ""
          }`}
          style={{
            color: !isStudent ? "var(--background)" : "var(--muted)",
          }}
        >
          Admin
        </button>

        <button
          type="button"
          onClick={() => onChange("student")}
          className={`relative z-10 w-full cursor-pointer px-7 py-2.5 text-[14px] font-medium transition-colors duration-200 ${
            !isStudent ? "hover:bg-(--primary-light)" : ""
          }`}
          style={{
            color: isStudent ? "var(--background)" : "var(--muted)",
          }}
        >
          Student
        </button>
      </div>
    </div>
  );
}
