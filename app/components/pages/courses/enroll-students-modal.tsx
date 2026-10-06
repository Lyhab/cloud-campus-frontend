"use client";

import { useEffect, useState } from "react";
import { UserRound, X } from "lucide-react";

import {
  enrollStudents,
  getAvailableStudents,
  type AvailableStudent,
} from "@/app/lib/api/courses";

interface EnrollStudentsModalProps {
  courseId: string;
  onClose: () => void;
  onEnrolled: (count: number) => void | Promise<void>;
}

function getFullName(student: AvailableStudent) {
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");
}

export default function EnrollStudentsModal({
  courseId,
  onClose,
  onEnrolled,
}: EnrollStudentsModalProps) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [students, setStudents] = useState<AvailableStudent[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Debounce search by 500ms.
   */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);

    return () => clearTimeout(timer);
  }, [search]);

  /*
   * Load students who are not in the course yet.
   */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getAvailableStudents(courseId, {
          limit: 100,
          search: debouncedSearch.trim() || undefined,
        });

        if (!cancelled) {
          setStudents(response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setStudents([]);
          setError(
            err instanceof Error ? err.message : "Failed to load students.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [courseId, debouncedSearch]);

  const allSelected =
    students.length > 0 && students.every((s) => selected.has(s.id));

  function toggleStudent(id: string) {
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  /*
   * Selects / clears every student currently listed.
   */
  function toggleAll() {
    setSelected((current) => {
      const next = new Set(current);

      if (allSelected) {
        students.forEach((s) => next.delete(s.id));
      } else {
        students.forEach((s) => next.add(s.id));
      }

      return next;
    });
  }

  async function handleEnroll() {
    if (selected.size === 0) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ids = [...selected];

      await enrollStudents(courseId, ids);
      await onEnrolled(ids.length);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to enroll students.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "color-mix(in srgb, black 40%, transparent)",
      }}
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl border bg-background shadow-lg"
        style={{ borderColor: "var(--border)" }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Enroll Students
            </h2>

            <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
              Select students to add to this course.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer transition-opacity hover:opacity-60"
            style={{ color: "var(--muted)" }}
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border px-4 py-2.5 text-[14px] outline-none transition-colors focus:border-(--primary)"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--background)",
              color: "var(--foreground)",
            }}
          />
        </div>

        {/* Select all */}
        <label
          className="mt-4 flex cursor-pointer items-center gap-3 border-b px-6 pb-3 text-[13px] font-medium"
          style={{
            borderColor: "var(--border-light)",
            color: "var(--foreground)",
          }}
        >
          <input
            type="checkbox"
            checked={allSelected}
            disabled={students.length === 0}
            onChange={toggleAll}
            className="h-4 w-4 cursor-pointer accent-(--primary)"
          />
          Select all ({students.length})
        </label>

        {/* List */}
        <div
          className={`min-h-40 flex-1 overflow-y-auto transition-opacity ${
            isLoading ? "opacity-60" : ""
          }`}
        >
          {students.length === 0 && (
            <p
              className="px-6 py-8 text-center text-[13px]"
              style={{ color: "var(--muted)" }}
            >
              {isLoading ? "Loading students..." : "No students available."}
            </p>
          )}

          {students.map((student) => (
            <label
              key={student.id}
              className="flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors hover:bg-(--hover)"
            >
              <input
                type="checkbox"
                checked={selected.has(student.id)}
                onChange={() => toggleStudent(student.id)}
                className="h-4 w-4 cursor-pointer accent-(--primary)"
              />

              {student.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.profilePhotoUrl}
                  alt={getFullName(student)}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: "var(--primary-light)",
                    color: "var(--primary)",
                  }}
                >
                  <UserRound size={16} strokeWidth={1.7} />
                </div>
              )}

              <div className="min-w-0">
                <p
                  className="truncate text-[14px] font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {getFullName(student)}
                </p>

                <p
                  className="truncate text-[12px]"
                  style={{ color: "var(--muted)" }}
                >
                  {student.email}
                </p>
              </div>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div
          className="border-t p-6 pt-4"
          style={{ borderColor: "var(--border-light)" }}
        >
          {error && (
            <p
              className="mb-3 text-[13px]"
              style={{ color: "var(--danger, #e53e3e)" }}
            >
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleEnroll()}
            disabled={selected.size === 0 || isSubmitting}
            className="w-full cursor-pointer rounded-lg px-4 py-2.5 text-[14px] font-medium text-white transition-opacity bg-(--primary) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Enrolling..."
              : selected.size > 0
                ? `Enroll Students (${selected.size})`
                : "Enroll Students"}
          </button>
        </div>
      </div>
    </div>
  );
}
