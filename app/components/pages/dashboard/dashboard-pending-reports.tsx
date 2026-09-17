import { AlertTriangle } from "lucide-react";

interface DashboardPendingReportsProps {
  reports: {
    id: string;
    resourceTitle: string;
    reporter: string;
    reason: string;
    date: string;
  }[];
  onOpen: (id: string) => void;
}

export default function DashboardPendingReports({
  reports,
  onOpen,
}: DashboardPendingReportsProps) {
  return (
    <div
      className="overflow-hidden rounded-xl border bg-background shadow-even-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {reports.length === 0 ? (
        <div
          className="px-6 py-10 text-center text-[14px]"
          style={{ color: "var(--muted)" }}
        >
          No pending reports found.
        </div>
      ) : (
        reports.map((report) => (
          <button
            key={report.id}
            type="button"
            onClick={() => onOpen(report.id)}
            className="flex h-18 w-full shrink-0 cursor-pointer items-center gap-4 border-b px-6 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-(--hover)"
            style={{ borderColor: "var(--border-light)" }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{
                backgroundColor: "var(--warning-light)",
                color: "var(--warning)",
              }}
            >
              <AlertTriangle size={18} strokeWidth={1.7} />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[13px] font-medium"
                style={{ color: "var(--foreground)" }}
                title={report.resourceTitle}
              >
                {report.resourceTitle}
              </p>

              <p
                className="mt-1 truncate text-[12px]"
                style={{ color: "var(--muted)" }}
                title={report.reason}
              >
                {report.reason}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[12px]" style={{ color: "var(--muted)" }}>
                {report.reporter}
              </p>

              <p
                className="mt-1 text-[11px]"
                style={{ color: "var(--muted-light)" }}
              >
                {report.date}
              </p>
            </div>
          </button>
        ))
      )}
    </div>
  );
}
