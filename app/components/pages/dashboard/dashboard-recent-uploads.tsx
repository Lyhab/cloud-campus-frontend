import { Download } from "lucide-react";
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";
import { formatDateTime } from "@/app/lib/format-date";

interface DashboardRecentUploadsProps {
  uploads: {
    id: string;
    title: string;
    course: string;
    type: string;
    uploadedBy: string;
    date: string;
  }[];
  onOpen: (id: string) => void;
}

export default function DashboardRecentUploads({
  uploads,
  onOpen,
}: DashboardRecentUploadsProps) {
  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden rounded-xl border bg-background shadow-even-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {uploads.length === 0 ? (
        <div
          className="px-6 py-10 text-center text-[14px]"
          style={{ color: "var(--muted)" }}
        >
          No recent uploads found.
        </div>
      ) : (
        uploads.map((upload) => {
          const displayTitle =
            upload.title.length > 60
              ? upload.title.slice(0, 60) + "..."
              : upload.title;

          return (
            <button
              key={upload.id}
              type="button"
              onClick={() => onOpen(upload.id)}
              className="flex h-22 w-full shrink-0 cursor-pointer items-center gap-4 border-b px-6 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-(--hover)"
              style={{ borderColor: "var(--border-light)" }}
            >
              {/* File Type */}
              <span
                className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold ${getFileTypeBadgeClass(
                  upload.type,
                )}`}
              >
                {upload.type}
              </span>

              {/* Title + Details */}
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-[14px] font-semibold"
                  style={{ color: "var(--foreground)" }}
                  title={upload.title}
                >
                  {displayTitle}
                </p>

                <p
                  className="mt-1 truncate text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  {upload.course}
                </p>

                <p
                  className="mt-0.5 truncate text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  {upload.uploadedBy}
                </p>
              </div>

              {/* Date */}
              <span
                className="w-40 shrink-0 text-right text-[13px]"
                style={{ color: "var(--muted-light)" }}
              >
                {formatDateTime(upload.date)}
              </span>

              {/* Download */}
              <span className="w-10 shrink-0 text-right">
                <Download
                  size={19}
                  strokeWidth={1.7}
                  style={{ color: "var(--muted)" }}
                  className="ml-auto"
                />
              </span>
            </button>
          );
        })
      )}
    </div>
  );
}
