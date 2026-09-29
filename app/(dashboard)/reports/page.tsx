"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

// Components
import Table, { Column } from "@/app/components/table";
import SearchFilter from "@/app/components/search-filter";

// Data
import { reports } from "../../lib/data/reports";
import { resources } from "../../lib/data/resources";
import { users } from "../../lib/data/users";
import { mockViewer } from "../../lib/data/mock-viewer";
import type { Report } from "../../lib/types";

// Helpers
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

const statusStyle: Record<Report["status"], { bg: string; color: string }> = {
  pending: { bg: "var(--pending-light)", color: "var(--pending)" },
  dismissed: { bg: "var(--smoke)", color: "var(--muted)" },
  resolved: { bg: "var(--success-light)", color: "var(--success)" },
};

const reportColumns = (
  onResolve: (reportId: string) => void,
  onDismiss: (reportId: string) => void,
): Column<Report>[] => [
  {
    key: "resourceId",
    header: "Reported Resource",
    width: "30%",
    render: (row) => {
      const resource = resources.find((r) => r.id === row.resourceId);
      const displayTitle =
        resource && resource.title.length > 60
          ? resource.title.slice(0, 60) + "..."
          : (resource?.title ?? "Unknown Resource");

      return (
        <div className="flex items-center gap-2.5">
          {resource && (
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${getFileTypeBadgeClass(
                resource.fileType,
              )}`}
            >
              {resource.fileType.toUpperCase()}
            </span>
          )}

          <span
            className="text-[14px] font-medium"
            style={{ color: "var(--foreground)" }}
            title={resource?.title ?? "Unknown Resource"}
          >
            {displayTitle}
          </span>
        </div>
      );
    },
  },
  {
    key: "reporterId",
    header: "Reporter",
    width: "15%",
    render: (row) => {
      const reporter = users.find((u) => u.id === row.reporterId);

      return (
        <span className="text-[13px]" style={{ color: "var(--muted)" }}>
          {reporter?.name ?? row.reporterId}
        </span>
      );
    },
  },
  {
    key: "reason",
    header: "Reason",
    width: "25%",
    render: (row) => {
      const displayReason =
        row.reason.length > 60 ? row.reason.slice(0, 60) + "..." : row.reason;

      return (
        <span
          className="text-[13px]"
          style={{ color: "var(--muted)" }}
          title={row.reason}
        >
          {displayReason}
        </span>
      );
    },
  },
  {
    key: "date",
    header: "Date",
    width: "12%",
    align: "center",
  },
  {
    key: "status",
    header: "Status",
    width: "10%",
    align: "center",
    render: (row) => (
      <span
        className="rounded-md px-2.5 py-1 text-[11px] font-medium"
        style={{
          backgroundColor: statusStyle[row.status].bg,
          color: statusStyle[row.status].color,
        }}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "id",
    header: "Actions",
    width: "8%",
    align: "center",
    render: (row) => (
      <div className="flex items-center justify-center gap-1">
        {/* Resolve (e.g. take down / disable resource) */}
        <button
          type="button"
          title="Resolve report"
          onClick={(event) => {
            event.stopPropagation();
            onResolve(row.id);
          }}
          className="cursor-pointer transition-opacity text-(--success) p-2 rounded-full hover:bg-(--success-light)"
        >
          <Check size={18} strokeWidth={1.8} />
        </button>

        {/* Dismiss report */}
        <button
          type="button"
          title="Dismiss report"
          onClick={(event) => {
            event.stopPropagation();
            onDismiss(row.id);
          }}
          className="cursor-pointer transition-opacity text-(--danger) p-2 rounded-full hover:bg-(--danger-light)"
        >
          <X size={18} strokeWidth={1.8} />
        </button>
      </div>
    ),
  },
];

export default function ReportsPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");

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

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  const filteredReports = reports.filter((report) => {
    const resource = resources.find((r) => r.id === report.resourceId);
    const reporter = users.find((u) => u.id === report.reporterId);

    const searchValue = search.toLowerCase();

    const matchesSearch =
      (resource?.title.toLowerCase().includes(searchValue) ?? false) ||
      (reporter?.name.toLowerCase().includes(searchValue) ?? false) ||
      report.reason.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Oldest first — admins should work through longest-open reports first
  const sortedReports = [...filteredReports].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Reports & Moderation
        </h1>

        <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
          {pendingCount} pending · {reports.length} total
        </p>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by resource, reporter, or reason..."
        filters={[
          {
            name: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Status", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Dismissed", value: "dismissed" },
              { label: "Resolved", value: "resolved" },
            ],
          },
        ]}
      />

      {/* Reports Table */}
      <div
        className="overflow-hidden rounded-xl border bg-background"
        style={{ borderColor: "var(--border)" }}
      >
        <Table
          columns={reportColumns(
            (reportId) => console.log("resolve report:", reportId),
            (reportId) => console.log("dismiss report:", reportId),
          )}
          data={sortedReports}
          onRowClick={(row) => router.push(`/reports/${row.id}`)}
          pagination={{
            page: 1,
            pageSize: 2,
            total: filteredReports.length,
            onPageChange: (page) => console.log(page),
          }}
        />
      </div>
    </div>
  );
}
