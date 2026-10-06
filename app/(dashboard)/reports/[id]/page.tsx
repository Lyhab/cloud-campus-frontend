"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Components
import ReportHeader from "@/app/components/pages/reports/report-header";
import ResourceHeader from "@/app/components/pages/resources/resource-header";
import ResourceFilePreview from "@/app/components/pages/resources/resource-file-preview";

// Auth
import { useAuth } from "@/app/context/AuthContext";

// API
import {
  getReport,
  updateReportStatus,
  type Report,
} from "@/app/lib/api/reports";
import {
  downloadResource,
  type Resource,
  type ResourceStatus,
} from "@/app/lib/api/resources";

// Helpers
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

function getFullName(person: {
  firstName: string;
  middleName: string | null;
  lastName: string;
}) {
  return [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .join(" ");
}

export default function ReportDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.role === "admin";

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  /*
   * Access control:
   * guest   -> /resources
   * student -> /dashboard
   */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/resources");
    } else if (user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [authLoading, user, router]);

  /*
   * Load report.
   */
  useEffect(() => {
    if (authLoading || !isAdmin) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await getReport(reportId);

        if (cancelled) return;

        setReport(data);
      } catch (err) {
        if (cancelled) return;

        setReport(null);
        setError(err instanceof Error ? err.message : "Failed to load report.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAdmin, reportId]);

  async function handleUpdateStatus(status: "dismissed" | "resolved") {
    if (!report) return;

    try {
      setActionLoading(true);
      setError(null);

      const updated = await updateReportStatus(report.id, { status });

      setReport(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownload() {
    if (!report) return;

    const { resource } = report;

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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download resource.",
      );
    }
  }

  /*
   * Render nothing while auth resolves or while redirecting.
   */
  if (authLoading || !isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          Loading report...
        </span>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {error ?? "Report not found"}
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

  // ReportResource has the same shape as Resource, but status is a plain string.
  const resource: Resource = {
    ...report.resource,
    status: report.resource.status as ResourceStatus,
  };

  const fileType = resource.fileType.toUpperCase();
  const fileTypeClass = getFileTypeBadgeClass(resource.fileType);

  const courseLabel = `${resource.course.code} — ${resource.course.name}`;
  const uploaderName = getFullName(resource.creator);
  const reporterName = getFullName(report.reporter);

  return (
    <div className="h-full overflow-y-auto p-8">
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

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--danger, #e53e3e)",
            color: "var(--danger, #e53e3e)",
          }}
        >
          {error}
        </div>
      )}

      {/* Report Header */}
      <ReportHeader
        report={report}
        reporterName={reporterName}
        resourceTitle={resource.title}
        actionLoading={actionLoading}
        onResolve={() => void handleUpdateStatus("resolved")}
        onDismiss={() => void handleUpdateStatus("dismissed")}
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
          {/* Resource Header (read-only) */}
          <ResourceHeader
            resource={resource}
            fileType={fileType}
            fileTypeClass={fileTypeClass}
            courseLabel={courseLabel}
            uploaderName={uploaderName}
            isAdmin={isAdmin}
            isAuthenticated
            isOwner={false}
            showActions={false}
            onCourseClick={() => router.push(`/courses/${resource.course.id}`)}
            averageRating={Number(resource.avgRating) || 0}
            ratingCount={resource.ratingCount}
            userRating={0}
            hoverRating={0}
            hasRated={false}
            onRate={() => {}}
            onHoverRating={() => {}}
            isBookmarked={false}
            onToggleBookmark={() => {}}
            onDownload={() => void handleDownload()}
            onUpdate={async () => false}
            onDelete={async () => false}
            onReport={async () => false}
            onUpdateStatus={() => {}}
          />

          {/* File Preview */}
          <div className="mt-7">
            <ResourceFilePreview
              fileType={fileType}
              fileTypeClass={fileTypeClass}
              fileUrl={resource.fileUrl}
              onDownload={() => void handleDownload()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
