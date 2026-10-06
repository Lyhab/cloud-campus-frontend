"use client";

import { useState } from "react";
import { Download, Star, Trash2, UserRound } from "lucide-react";

// Data
// NOTE: adjust this path/alias if your tsconfig "@/" alias doesn't point to the project root
import { users } from "@/app/lib/data/users";
import type { Resource } from "@/app/lib/types";
import type { CourseStudent } from "@/app/lib/api/courses";

interface CourseTabsProps {
  courseResources: Resource[];
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

export default function CourseTabs({
  courseResources,
  courseStudents,
  studentSearch,
  onStudentSearchChange,
  studentsLoading = false,
  isAdmin = false,
  actionLoading = false,
  onRemoveStudent,
}: CourseTabsProps) {
  const [activeTab, setActiveTab] = useState<"resources" | "students">(
    "resources",
  );

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
                placeholder="Search resources..."
                className="w-full rounded-lg border px-4 py-3 text-[14px] outline-none transition-colors focus:border-(--primary)"
                style={{
                  borderColor: "var(--border)",
                  backgroundColor: "var(--background)",
                  color: "var(--foreground)",
                }}
              />
            </div>

            {/* Resources List */}
            <div
              className="mt-5 overflow-hidden rounded-xl border bg-background"
              style={{ borderColor: "var(--border)" }}
            >
              {courseResources.map((resource, index) => {
                const uploader = users.find(
                  (user) => user.id === resource.uploadedBy,
                );

                return (
                  <div
                    key={resource.id}
                    className={`flex items-center justify-between px-5 py-4 ${
                      index !== courseResources.length - 1 ? "border-b" : ""
                    }`}
                    style={{
                      borderColor: "var(--border-light)",
                    }}
                  >
                    {/* Resource Info */}
                    <div className="flex items-center gap-4">
                      <span
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-[10px] font-bold uppercase"
                        style={{
                          backgroundColor:
                            resource.fileType === "pdf" ? "#fff1f2" : "#fff7ed",
                          color:
                            resource.fileType === "pdf" ? "#ef4444" : "#f97316",
                        }}
                      >
                        {resource.fileType}
                      </span>

                      <div>
                        <h3
                          className="text-[14px] font-medium"
                          style={{ color: "var(--foreground)" }}
                        >
                          {resource.title}
                        </h3>

                        <p
                          className="mt-1 text-[12px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {uploader?.name ?? resource.uploadedBy} ·{" "}
                          {resource.uploadedAt} · {resource.fileSizeMb} MB
                        </p>
                      </div>
                    </div>

                    {/* Resource Actions */}
                    <div className="flex items-center gap-5">
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
                          {resource.rating}
                        </span>
                      </div>

                      <button
                        type="button"
                        title="Download"
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
                  style={{
                    borderColor: "var(--border-light)",
                  }}
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
