"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Components
import ReportHeader from "@/app/components/pages/reports/report-header";
import ResourceHeader from "@/app/components/pages/resources/resource-header";
import ResourceFilePreview from "@/app/components/pages/resources/resource-file-preview";

// Data
import { reports } from "../../../lib/data/reports";
import { resources } from "../../../lib/data/resources";
import { courses } from "../../../lib/data/courses";
import { users } from "../../../lib/data/users";
import { mockViewer } from "../../../lib/data/mock-viewer";

// Helpers
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const isAdmin = mockViewer.role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Access Denied
          </h1>

          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            This page is available to administrators only.
          </p>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-3 cursor-pointer text-sm"
            style={{ color: "var(--primary)" }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const report = reports.find((report) => report.id === params.id);

  if (!report) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Report not found
          </h1>

          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="mt-3 cursor-pointer text-sm"
            style={{ color: "var(--primary)" }}
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const resource = resources.find(
    (resource) => resource.id === report.resourceId,
  );

  if (!resource) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Resource not found
          </h1>

          <button
            type="button"
            onClick={() => router.push("/reports")}
            className="mt-3 cursor-pointer text-sm"
            style={{ color: "var(--primary)" }}
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  const course = courses.find((course) => course.id === resource.courseId);

  const uploader = users.find((user) => user.id === resource.uploadedBy);

  const reporter = users.find((user) => user.id === report.reporterId);

  const fileType = resource.fileType.toUpperCase();
  const fileTypeClass = getFileTypeBadgeClass(resource.fileType);

  const courseLabel = course
    ? `${course.code} — ${course.name}`
    : "Unknown Course";

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8">
      {/* Back */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push("/reports")}
          className="flex cursor-pointer items-center gap-2 text-[14px] transition-opacity hover:opacity-70"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to Reports
        </button>
      </div>

      {/* Report Header */}
      <ReportHeader
        report={report}
        reporterName={reporter?.name ?? report.reporterId}
        resourceTitle={resource.title}
        onResolve={() => console.log("resolve report:", report.id)}
        onDismiss={() => console.log("dismiss report:", report.id)}
      />

      {/* Reported Resource */}
      <div className="mt-7">
        <h2
          className="mb-3 text-[16px] font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Reported Resource
        </h2>

        {/* Resource Container */}
        <div className="overflow-hidden rounded-xl border bg-background p-10 border-(--border) shadow-even-md">
          {/* Resource Header */}
          <ResourceHeader
            resource={resource}
            fileType={fileType}
            fileTypeClass={fileTypeClass}
            courseLabel={courseLabel}
            uploaderName={uploader?.name ?? resource.uploadedBy}
            isAdmin={isAdmin}
            showActions={false}
            onCourseClick={() => course && router.push(`/courses/${course.id}`)}
            averageRating={resource.rating}
            userRating={0}
            hoverRating={0}
            hasRated={false}
            onRate={() => {}}
            onHoverRating={() => {}}
          />

          {/* File Preview */}
          <div className="mt-7">
            <ResourceFilePreview
              fileType={fileType}
              fileTypeClass={fileTypeClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
