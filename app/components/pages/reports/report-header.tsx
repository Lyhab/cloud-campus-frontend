"use client";

import { Check, X } from "lucide-react";

import type { Report } from "@/app/lib/api/reports";
import { formatDateTime } from "@/app/lib/format-date";

interface ReportHeaderProps {
  report: Report;
  reporterName: string;
  resourceTitle: string;
  actionLoading?: boolean;
  onResolve: () => void;
  onDismiss: () => void;
}

const statusStyle: Record<Report["status"], { bg: string; color: string }> = {
  pending: {
    bg: "var(--pending-light)",
    color: "var(--pending)",
  },
  dismissed: {
    bg: "var(--smoke)",
    color: "var(--muted)",
  },
  resolved: {
    bg: "var(--success-light)",
    color: "var(--success)",
  },
};

export default function ReportHeader({
  report,
  reporterName,
  resourceTitle,
  actionLoading = false,
  onResolve,
  onDismiss,
}: ReportHeaderProps) {
  return (
    <div
      className="rounded-xl border bg-background p-7 shadow-even-md"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-8">
        {/* Report Information */}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className="rounded-md px-2.5 py-1 text-[11px] font-bold"
              style={{
                backgroundColor: statusStyle[report.status].bg,
                color: statusStyle[report.status].color,
              }}
            >
              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
            </span>
          </div>

          <h1
            className="mt-3 text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Report Details
          </h1>

          <p className="mt-1 text-[14px]" style={{ color: "var(--primary)" }}>
            {resourceTitle}
          </p>

          {/* Metadata */}
          <div
            className="mt-5 flex items-center gap-2 text-[13px]"
            style={{ color: "var(--muted)" }}
          >
            <span>Reported by</span>

            <span
              className="font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {reporterName}
            </span>

            <span>·</span>

            <span>{formatDateTime(report.createdAt)}</span>
          </div>

          {/* Reason */}
          <div className="mt-5">
            <p
              className="text-[12px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--muted)" }}
            >
              Reason
            </p>

            <p
              className="mt-1.5 max-w-3xl text-[14px] leading-6"
              style={{ color: "var(--foreground)" }}
            >
              {report.reason}
            </p>
          </div>
        </div>

        {/* Actions (pending reports only) */}
        {report.status === "pending" && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              title="Dismiss report"
              disabled={actionLoading}
              onClick={onDismiss}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--smoke) px-4 py-2.5 text-[13px] font-medium text-(--danger) transition-colors hover:bg-(--hover-danger) disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X size={16} strokeWidth={1.8} />
              Dismiss
            </button>

            <button
              type="button"
              title="Resolve report"
              disabled={actionLoading}
              onClick={onResolve}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--success) px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={16} strokeWidth={1.8} />
              Resolve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
