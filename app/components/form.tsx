"use client";

import { useRef, useState } from "react";
import { X, Upload, FileText } from "lucide-react";

// Value a field can hold. Files are kept as raw File objects — the parent
// (or a wrapper around onSubmit) decides whether/how to upload them.
export type FormValue = string | File | boolean | null;

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "checkbox"
    | "file";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  // number-specific
  min?: number;
  max?: number;
  step?: number;
  // file-specific
  accept?: string; // e.g. "image/*" or ".pdf,.docx"
}

interface FormProps {
  title: string;
  description?: string;
  fields: FormField[];
  initialValues?: Record<string, FormValue>;

  // Final payload always has plain values — any File fields are resolved
  // to their uploaded URL (string) before this is called.
  onSubmit: (data: Record<string, string | boolean | null>) => void;
  onClose: () => void;

  // Optional: how to upload a file (e.g. to S3 via a presigned URL) and get
  // back its public URL. If omitted, file fields are passed through as
  // raw File objects instead — useful before upload wiring exists.
  onFileUpload?: (file: File, fieldName: string) => Promise<string>;
}

const ANIMATION_MS = 250;

export default function Form({
  title,
  description,
  fields,
  initialValues = {},
  onSubmit,
  onClose,
  onFileUpload,
}: FormProps) {
  const [formData, setFormData] =
    useState<Record<string, FormValue>>(initialValues);
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleChange = (name: string, value: FormValue) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    handleChange(name, file);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, ANIMATION_MS);
  };

  const handleSubmit = async () => {
    // Basic required-field check
    const missing = fields.find(
      (f) => f.required && !formData[f.name] && formData[f.name] !== false,
    );
    if (missing) return;

    setIsSubmitting(true);

    try {
      const resolved: Record<string, string | boolean | null> = {};

      for (const [name, value] of Object.entries(formData)) {
        if (value instanceof File) {
          // If the caller gave us an uploader, use it; otherwise skip the
          // field rather than passing a raw File into onSubmit.
          resolved[name] = onFileUpload
            ? await onFileUpload(value, name)
            : null;
        } else {
          resolved[name] = value;
        }
      }

      onSubmit(resolved);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputBaseClass =
    "w-full rounded-lg border px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:border-(--primary)";
  const inputBaseStyle = {
    borderColor: "var(--border)",
    color: "var(--foreground)",
    backgroundColor: "var(--background)",
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={handleClose}
        style={{
          animation: `${isClosing ? "fadeOut" : "fadeIn"} ${ANIMATION_MS}ms ease-out forwards`,
        }}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 z-50 flex h-full w-105 flex-col border-l bg-background shadow-xl"
        style={{
          borderColor: "var(--border)",
          animation: `${isClosing ? "slideOut" : "slideIn"} ${ANIMATION_MS}ms ease-out forwards`,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-6 py-5"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="cursor-pointer rounded-md p-2 transition-colors duration-200 hover:bg-(--primary-light)"
            style={{ color: "var(--muted)" }}
          >
            <X size={19} strokeWidth={1.8} />
          </button>
        </div>

        {/* Form content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            {fields.map((field) => {
              const value = formData[field.name];

              return (
                <div key={field.name}>
                  {field.type !== "checkbox" && (
                    <label
                      htmlFor={field.name}
                      className="mb-2 block text-[13px] font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {field.label}
                      {field.required && (
                        <span style={{ color: "var(--danger, #e53e3e)" }}>
                          {" "}
                          *
                        </span>
                      )}
                    </label>
                  )}

                  {field.type === "textarea" && (
                    <textarea
                      id={field.name}
                      name={field.name}
                      value={(value as string) ?? ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      rows={5}
                      className={`${inputBaseClass} resize-y`}
                      style={inputBaseStyle}
                    />
                  )}

                  {field.type === "select" && (
                    <select
                      id={field.name}
                      name={field.name}
                      value={(value as string) ?? ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={inputBaseClass}
                      style={inputBaseStyle}
                    >
                      <option value="">Select...</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {field.type === "checkbox" && (
                    <label
                      htmlFor={field.name}
                      className="flex cursor-pointer items-center gap-2.5 text-[14px]"
                      style={{ color: "var(--foreground)" }}
                    >
                      <input
                        id={field.name}
                        name={field.name}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) =>
                          handleChange(field.name, e.target.checked)
                        }
                        className="h-4 w-4 cursor-pointer rounded"
                        style={{ accentColor: "var(--primary)" }}
                      />
                      {field.label}
                      {field.required && (
                        <span style={{ color: "var(--danger, #e53e3e)" }}>
                          {" "}
                          *
                        </span>
                      )}
                    </label>
                  )}

                  {field.type === "file" && (
                    <div>
                      <input
                        ref={(el) => {
                          fileInputRefs.current[field.name] = el;
                        }}
                        id={field.name}
                        name={field.name}
                        type="file"
                        accept={field.accept}
                        onChange={(e) =>
                          handleFileChange(
                            field.name,
                            e.target.files?.[0] ?? null,
                          )
                        }
                        className="hidden"
                      />

                      <div
                        onClick={() =>
                          fileInputRefs.current[field.name]?.click()
                        }
                        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center transition-colors hover:bg-(--primary-light)"
                        style={{ borderColor: "var(--border)" }}
                      >
                        {value instanceof File ? (
                          <>
                            <div className="relative">
                              {value.type.startsWith("image/") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={URL.createObjectURL(value)}
                                  alt={value.name}
                                  className="h-16 w-16 rounded-md object-cover"
                                />
                              ) : (
                                <div className="flex h-16 w-16 items-center justify-center">
                                  <FileText
                                    size={28}
                                    strokeWidth={1.6}
                                    style={{ color: "var(--muted)" }}
                                  />
                                </div>
                              )}

                              <button
                                type="button"
                                aria-label={`Remove ${value.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileChange(field.name, null);
                                  const input =
                                    fileInputRefs.current[field.name];
                                  if (input) input.value = "";
                                }}
                                className="absolute -right-2 -top-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-background transition-opacity hover:opacity-80"
                                style={{
                                  backgroundColor: "var(--danger, #e53e3e)",
                                }}
                              >
                                <X size={12} strokeWidth={2.5} />
                              </button>
                            </div>
                            <span
                              className="text-[13px] font-medium"
                              style={{ color: "var(--foreground)" }}
                            >
                              {value.name}
                            </span>
                            <span
                              className="text-[12px] underline"
                              style={{ color: "var(--primary)" }}
                            >
                              Replace file
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload
                              size={22}
                              strokeWidth={1.6}
                              style={{ color: "var(--muted)" }}
                            />
                            <span
                              className="text-[13px]"
                              style={{ color: "var(--muted)" }}
                            >
                              Click to upload
                              {field.accept ? ` (${field.accept})` : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {(field.type === "text" ||
                    field.type === "email" ||
                    field.type === "password" ||
                    field.type === "number" ||
                    field.type === "date") && (
                    <input
                      id={field.name}
                      name={field.name}
                      type={field.type}
                      value={(value as string) ?? ""}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder}
                      min={field.type === "number" ? field.min : undefined}
                      max={field.type === "number" ? field.max : undefined}
                      step={field.type === "number" ? field.step : undefined}
                      className={inputBaseClass}
                      style={inputBaseStyle}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 border-t px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-lg px-4 py-2.5 text-[14px] font-medium transition-colors duration-200 hover:bg-(--hover-danger) text-(--danger)"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="cursor-pointer rounded-lg px-4 py-2.5 text-[14px] font-medium text-background transition-opacity duration-200 hover:opacity-90 bg-(--primary) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Saving..."
              : initialValues && Object.keys(initialValues).length > 0
                ? "Update"
                : "Create"}
          </button>
        </div>
      </div>
    </>
  );
}
