"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Star, Trash2, UserRound } from "lucide-react";

import {
  downloadResource,
  getResources,
  type Resource,
} from "@/app/lib/api/resources";
import type { CourseStudent } from "@/app/lib/api/courses";
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";
import { formatDateTime } from "@/app/lib/format-date";

interface CourseTabsProps {
  courseId: string;
  resourcesRefreshKey?: number;
  onResourceCountChange?: (count: number) => void;
  courseStudents: CourseStudent[];
  studentSearch: string;
  onStudentSearchChange: (value: string) => void;
  studentsLoading?: boolean;
  isAdmin?: boolean;
  actionLoading?: boolean;
  onRemoveStudent?: (student: CourseStudent) => void;
}

function getFullName(student: CourseStudent) {
  return [student.firstName, student.middleName, student.lastName]
    .filter(Boolean)
    .join(" ");
}

function getUploaderName(resource: Resource) {
  return [
    resource.creator.firstName,
    resource.creator.middleName,
    resource.creator.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function CourseTabs({
  courseId,
  resourcesRefreshKey = 0,
  onResourceCountChange,
  courseStudents,
  studentSearch,
  onStudentSearchChange,
  studentsLoading = false,
  isAdmin = false,
  actionLoading = false,
  onRemoveStudent,
}: CourseTabsProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"resources" | "students">(
    "resources",
  );

  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const [resourcesError, setResourcesError] = useState<string | null>(null);

  const [resourceSearch, setResourceSearch] = useState("");
  const [debouncedResourceSearch, setDebouncedResourceSearch] = useState("");

  /*
   * Debounce resource search by 500ms.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResourceSearch(resourceSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [resourceSearch]);

  /*
   * Load this course's resources.
   */
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setResourcesLoading(true);
        setResourcesError(null);

        const response = await getResources({
          courseId,
          limit: 100,
          sort: "newest",
          search: debouncedResourceSearch.trim() || undefined,
          view: "student",
        });

        if (cancelled) return;

        setResources(response.data);

        // Only report the unfiltered total to the header.
        if (!debouncedResourceSearch.trim()) {
          onResourceCountChange?.(response.total);
        }
      } catch (err) {
        if (cancelled) return;

        setResources([]);
        setResourcesError(
          err instanceof Error ? err.message : "Failed to load resources.",
        );
      } finally {
        if (!cancelled) setResourcesLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, debouncedResourceSearch, resourcesRefreshKey]);

  async function handleDownload(resource: Resource) {
    try {
      const blob = await downloadResource(resource.id);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.title}.${resource.fileType.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setResources((current) =>
        current.map((item) =>
          item.id === resource.id
            ? { ...item, downloads: item.downloads + 1 }
            : item,
        ),
      );
    } catch (err) {
      setResourcesError(
        err instanceof Error ? err.message : "Failed to download resource.",
      );
    }
  }

  return (
    <>
      {/* Tabs */}
      <div
        className="mt-7 flex border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("resources")}
          className="cursor-pointer border-b-2 px-5 pb-3 text-[14px] font-medium transition-colors"
          style={{
            borderColor:
              activeTab === "resources" ? "var(--primary)" : "transparent",
            color:
              activeTab === "resources" ? "var(--primary)" : "var(--muted)",
          }}
        >
          Resources
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("students")}
          className="cursor-pointer border-b-2 px-5 pb-3 text-[14px] font-medium transition-colors"
          style={{
            borderColor:
              activeTab === "students" ? "var(--primary)" : "transparent",
            color: activeTab === "students" ? "var(--primary)" : "var(--muted)",
          }}
        >
          Students
        </button>
      </div>

      {/* Tab Content */}
      <div key={activeTab} className="animate-[tabFade_0.2s_ease-out]">
        {/* Resources */}
        {activeTab === "resources" && (
          <>
            {/* Resource Search */}
            <div className="mt-6">
              <input
                type="text"
                value={resourceSearch}
                onChange={(event) => setResourceSearch(event.target.value)}
                placeholder="Search resources..."
                className="w-full rounded-lg border px-4 py-3 text-[14px] outline-none transition-colors focus:border-(--primary)"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {resourcesError && (
              <div
                className="mt-4 rounded-lg border px-4 py-3 text-sm"
                style={{
                  borderColor: "var(--danger, #e53e3e)",
                  color: "var(--danger, #e53e3e)",
                }}
              >
                {resourcesError}
              </div>
            )}

            {/* Resources List */}
            <div
              className={`mt-5 overflow-hidden rounded-xl border bg-background transition-opacity ${
                resourcesLoading ? "opacity-60" : ""
              }`}
              style={{ borderColor: "var(--border)" }}
            >
              {resources.length === 0 && (
                <p
                  className="px-5 py-6 text-center text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  {resourcesLoading
                    ? "Loading resources..."
                    : "No resources found."}
                </p>
              )}

              {resources.map((resource, index) => {
                const rating = Number(resource.avgRating) || 0;

                return (
                  <div
                    key={resource.id}
                    onClick={() => router.push(`/resources/${resource.id}`)}
                    className={`flex cursor-pointer items-center justify-between px-5 py-4 transition-colors hover:bg-(--hover) ${
                      index !== resources.length - 1 ? "border-b" : ""
                    }`}
                    style={{ borderColor: "var(--border-light)" }}
                  >
                    {/* Resource Info */}
                    <div className="flex min-w-0 items-center gap-4">
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold uppercase ${getFileTypeBadgeClass(
                          resource.fileType,
                        )}`}
                      >
                        {resource.fileType}
                      </span>

                      <div className="min-w-0">
                        <h3
                          className="truncate text-[14px] font-medium"
                          style={{ color: "var(--foreground)" }}
                        >
                          {resource.title}
                        </h3>

                        <p
                          className="mt-1 text-[12px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {getUploaderName(resource)} ·{" "}
                          {formatDateTime(resource.uploadedAt)} ·{" "}
                          {resource.fileSizeMb ?? "0"} MB
                        </p>
                      </div>
                    </div>

                    {/* Resource Actions */}
                    <div className="flex shrink-0 items-center gap-5">
                      <span
                        className="text-[12px]"
                        style={{ color: "var(--muted-light)" }}
                      >
                        {resource.downloads} downloads
                      </span>

                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          fill="currentColor"
                          strokeWidth={1.5}
                          style={{ color: "#f59e0b" }}
                        />

                        <span
                          className="text-[12px]"
                          style={{ color: "#f59e0b" }}
                        >
                          {rating.toFixed(1)}
                        </span>

                        <span
                          className="text-[12px]"
                          style={{ color: "var(--muted)" }}
                        >
                          ({resource.ratingCount})
                        </span>
                      </div>

                      <button
                        type="button"
                        title="Download"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleDownload(resource);
                        }}
                        className="cursor-pointer transition-opacity hover:opacity-60"
                        style={{ color: "var(--muted)" }}
                      >
                        <Download size={17} strokeWidth={1.7} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Students */}
        {activeTab === "students" && (
          <div className="mt-6">
            {/* Student Search */}
            <div>
              <input
                type="text"
                value={studentSearch}
                onChange={(event) => onStudentSearchChange(event.target.value)}
                placeholder="Search students..."
                className="w-full rounded-lg border px-4 py-3 text-[14px] outline-none transition-colors focus:border-(--primary)"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {/* Students List */}
            <div
              className={`mt-5 overflow-hidden rounded-xl border bg-background transition-opacity ${
                studentsLoading ? "opacity-60" : ""
              }`}
              style={{ borderColor: "var(--border)" }}
            >
              {courseStudents.length === 0 && (
                <p
                  className="px-5 py-6 text-center text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  {studentsLoading
                    ? "Loading students..."
                    : "No students found."}
                </p>
              )}

              {courseStudents.map((student, index) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between px-5 py-4 ${
                    index !== courseStudents.length - 1 ? "border-b" : ""
                  }`}
                  style={{ borderColor: "var(--border-light)" }}
                >
                  {/* Student Info */}
                  <div className="flex items-center gap-4">
                    {student.profilePhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={student.profilePhotoUrl}
                        alt={getFullName(student)}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: "var(--primary-light)",
                          color: "var(--primary)",
                        }}
                      >
                        <UserRound size={18} strokeWidth={1.7} />
                      </div>
                    )}

                    <div>
                      <h3
                        className="text-[14px] font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {getFullName(student)}
                      </h3>

                      <p
                        className="mt-1 text-[12px]"
                        style={{ color: "var(--muted)" }}
                      >
                        {student.email}
                      </p>
                    </div>
                  </div>

                  {/* Student Role + Actions */}
                  <div className="flex items-center gap-4">
                    <span
                      className="rounded-md px-2.5 py-1 text-[11px] font-medium"
                      style={{
                        backgroundColor: "var(--primary-light)",
                        color: "var(--primary)",
                      }}
                    >
                      Student
                    </span>

                    {isAdmin && (
                      <button
                        type="button"
                        title="Remove from course"
                        disabled={actionLoading}
                        onClick={() => onRemoveStudent?.(student)}
                        className="cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ color: "var(--danger, #e53e3e)" }}
                      >
                        <Trash2 size={17} strokeWidth={1.7} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
