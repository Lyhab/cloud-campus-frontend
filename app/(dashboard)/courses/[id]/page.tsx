"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  UserRound,
  FileText,
  Download,
  Star,
  Upload,
  SquarePen,
} from "lucide-react";

// Components
import Form from "@/app/components/form";

// Data
import { courses } from "../../../lib/data/courses";
import {
  getResourceCountForCourse,
  getResourcesForCourse,
} from "../../../lib/data/resources";
import {
  getUserCountForCourse,
  getUsersForCourse,
  users,
} from "../../../lib/data/users";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"resources" | "students">(
    "resources",
  );
  const [isEditOpen, setIsEditOpen] = useState(false);

  const course = courses.find((course) => course.id === params.id);

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Course not found
          </h1>

          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="mt-3 cursor-pointer text-sm"
            style={{ color: "var(--primary)" }}
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const memberCount = getUserCountForCourse(course.id);
  const resourceCount = getResourceCountForCourse(course.id);
  const courseResources = getResourcesForCourse(course.id);

  // Students enrolled in this course
  const courseStudents = getUsersForCourse(course.id);

  const user = {
    role: "student" as "admin" | "student",
  };

  const isAdmin = user.role === "admin";

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Top Actions */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/courses")}
          className="flex cursor-pointer items-center gap-2 text-[14px] transition-opacity hover:opacity-70"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to Courses
        </button>

        {/* Admin only */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-opacity bg-(--primary) hover:opacity-90"
          >
            <SquarePen size={15} strokeWidth={1.8} />
            Edit Course
          </button>
        )}
      </div>

      {/* Course Header */}
      <div
        className="rounded-xl border bg-background p-7 shadow-sm"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            {/* Course Code */}
            <span
              className="inline-flex rounded-md px-2.5 py-1 text-[12px] font-semibold"
              style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
              }}
            >
              {course.code}
            </span>

            {/* Course Name */}
            <h1
              className="mt-3 text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              {course.name}
            </h1>

            {/* Description */}
            <p
              className="mt-2 max-w-2xl text-[15px] leading-6"
              style={{ color: "var(--muted)" }}
            >
              {course.description}
            </p>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-6">
              <div
                className="flex items-center gap-2 text-[13px]"
                style={{ color: "var(--muted)" }}
              >
                <Users size={17} strokeWidth={1.6} />
                {memberCount} members
              </div>

              <div
                className="flex items-center gap-2 text-[13px]"
                style={{ color: "var(--muted)" }}
              >
                <FileText size={17} strokeWidth={1.6} />
                {resourceCount} resources
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-opacity bg-(--primary) hover:opacity-90"
            >
              <Upload size={16} strokeWidth={1.8} />
              Upload Resource
            </button>

            <button
              type="button"
              className="cursor-pointer rounded-lg bg-(--smoke) px-4 py-2.5 text-[13px] font-medium text-(--danger) transition-colors hover:bg-(--hover-danger)"
            >
              Leave Course
            </button>
          </div>
        </div>
      </div>

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
              className="mt-5 overflow-hidden rounded-xl border bg-background"
              style={{ borderColor: "var(--border)" }}
            >
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
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: "var(--primary-light)",
                        color: "var(--primary)",
                      }}
                    >
                      <UserRound size={18} strokeWidth={1.7} />
                    </div>

                    <div>
                      <h3
                        className="text-[14px] font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {student.name}
                      </h3>

                      <p
                        className="mt-1 text-[12px]"
                        style={{ color: "var(--muted)" }}
                      >
                        {student.email}
                      </p>
                    </div>
                  </div>

                  {/* Student Role */}
                  <span
                    className="rounded-md px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary)",
                    }}
                  >
                    Student
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isEditOpen && (
        <Form
          title="Edit Course"
          description="Update the course details."
          fields={[
            {
              name: "code",
              label: "Course Code",
              type: "text",
              placeholder: "e.g. COMP809",
            },
            {
              name: "name",
              label: "Course Name",
              type: "text",
              placeholder: "e.g. Data Mining and Machine Learning",
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              placeholder: "Enter a short course description...",
            },
          ]}
          initialValues={{
            code: course.code,
            name: course.name,
            description: course.description,
          }}
          onClose={() => setIsEditOpen(false)}
          onSubmit={(data) => {
            console.log("Update course:", course.id, data);
            setIsEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
