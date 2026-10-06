"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

// Components
import Table, { Column } from "@/app/components/table";
import SearchFilter from "@/app/components/search-filter";

// Auth
import { useAuth } from "@/app/context/AuthContext";

// API
import {
  getReports,
  updateReportStatus,
  type Report,
  type ReportSort,
  type ReportStatus,
} from "@/app/lib/api/reports";

// Helpers
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";
import { formatDateTime } from "@/app/lib/format-date";

const PAGE_SIZE = 10;

type StatusFilter = "all" | ReportStatus;

const statusStyle: Record<ReportStatus, { bg: string; color: string }> = {
  pending: { bg: "var(--pending-light)", color: "var(--pending)" },
  dismissed: { bg: "var(--smoke)", color: "var(--muted)" },
  resolved: { bg: "var(--success-light)", color: "var(--success)" },
};

function getFullName(person: {
  firstName: string;
  middleName: string | null;
  lastName: string;
}) {
  return [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .join(" ");
}

const reportColumns = (
  onResolve: (reportId: string) => void,
  onDismiss: (reportId: string) => void,
  actionLoading: boolean,
): Column<Report>[] => [
  {
    key: "resource",
    header: "Reported Resource",
    width: "30%",
    render: (row) => {
      const title = row.resource.title;
      const displayTitle =
        title.length > 60 ? title.slice(0, 60) + "..." : title;

      return (
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${getFileTypeBadgeClass(
              row.resource.fileType,
            )}`}
          >
            {row.resource.fileType.toUpperCase()}
          </span>

          <span
            className="text-[14px] font-medium"
            style={{ color: "var(--foreground)" }}
            title={title}
          >
            {displayTitle}
          </span>
        </div>
      );
    },
  },
  {
    key: "reporter",
    header: "Reporter",
    width: "15%",
    render: (row) => (
      <span className="text-[13px]" style={{ color: "var(--muted)" }}>
        {getFullName(row.reporter)}
      </span>
    ),
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
    key: "createdAt",
    header: "Date",
    width: "14%",
    align: "center",
    render: (row) => formatDateTime(row.createdAt),
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
        {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
      </span>
    ),
  },
  {
    key: "id",
    header: "Actions",
    width: "8%",
    align: "center",
    render: (row) =>
      row.status === "pending" ? (
        <div className="flex items-center justify-center gap-1">
          {/* Resolve */}
          <button
            type="button"
            title="Resolve report"
            disabled={actionLoading}
            onClick={(event) => {
              event.stopPropagation();
              onResolve(row.id);
            }}
            className="cursor-pointer rounded-full p-2 text-(--success) transition-opacity hover:bg-(--success-light) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check size={18} strokeWidth={1.8} />
          </button>

          {/* Dismiss */}
          <button
            type="button"
            title="Dismiss report"
            disabled={actionLoading}
            onClick={(event) => {
              event.stopPropagation();
              onDismiss(row.id);
            }}
            className="cursor-pointer rounded-full p-2 text-(--danger) transition-opacity hover:bg-(--danger-light) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>
      ) : (
        <span className="text-[12px]" style={{ color: "var(--muted-light)" }}>
          —
        </span>
      ),
  },
];

export default function ReportsPage() {
  const router = useRouter();

  const { user, isLoading: authLoading } = useAuth();

  const isAdmin = user?.role === "admin";

  const [reports, setReports] = useState<Report[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [sort, setSort] = useState<ReportSort>("oldest");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
   * Debounce search by 500ms.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  /*
   * Load reports.
   */
  useEffect(() => {
    if (authLoading || !isAdmin) return;

    let cancelled = false;

    async function loadReports() {
      try {
        setLoading(true);
        setError(null);

        const response = await getReports({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          status: statusFilter,
          sort,
        });

        if (cancelled) return;

        setReports(response.data);
        setPendingCount(response.pendingCount);
        setTotal(response.total);
      } catch (err) {
        if (cancelled) return;

        setReports([]);
        setTotal(0);
        setError(
          err instanceof Error ? err.message : "Failed to load reports.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    isAdmin,
    page,
    debouncedSearch,
    statusFilter,
    sort,
    refreshKey,
  ]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }

  function handleSortChange(value: string) {
    setSort(value as ReportSort);
    setPage(1);
  }

  async function handleUpdateStatus(
    reportId: string,
    status: "dismissed" | "resolved",
  ) {
    try {
      setActionLoading(true);
      setError(null);

      await updateReportStatus(reportId, { status });

      /*
       * If this was the last item on a later page, go back one page.
       * Otherwise reload the current page.
       */
      if (reports.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        setRefreshKey((key) => key + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report.");
    } finally {
      setActionLoading(false);
    }
  }

  /*
   * Render nothing while auth resolves or while redirecting.
   */
  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Reports & Moderation
        </h1>

        <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
          {pendingCount} pending
        </p>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by resource, reporter, or reason..."
        filters={[
          {
            name: "status",
            value: statusFilter,
            onChange: handleStatusChange,
            options: [
              { label: "All Status", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Dismissed", value: "dismissed" },
              { label: "Resolved", value: "resolved" },
            ],
          },
          {
            name: "sort",
            value: sort,
            onChange: handleSortChange,
            options: [
              { label: "Oldest First", value: "oldest" },
              { label: "Newest First", value: "newest" },
            ],
          },
        ]}
      />

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

      {/* Reports Table */}
      <div
        className="relative overflow-hidden rounded-xl border bg-background"
        style={{ borderColor: "var(--border)" }}
      >
        {loading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--background) 60%, transparent)",
            }}
          >
            <span
              className="rounded-md px-3 py-2 text-sm"
              style={{
                color: "var(--muted)",
                backgroundColor: "var(--background)",
              }}
            >
              Loading...
            </span>
          </div>
        )}

        <Table
          columns={reportColumns(
            (reportId) => void handleUpdateStatus(reportId, "resolved"),
            (reportId) => void handleUpdateStatus(reportId, "dismissed"),
            actionLoading,
          )}
          data={reports}
          onRowClick={(row) => router.push(`/reports/${row.id}`)}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total,
            onPageChange: setPage,
          }}
        />
      </div>
    </div>
  );
}
