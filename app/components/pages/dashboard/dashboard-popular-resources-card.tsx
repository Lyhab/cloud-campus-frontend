import { Download, Star } from "lucide-react";

import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

interface DashboardPopularResourcesCardProps {
  title: string;
  type: string;
  course: string;
  uploadedBy: string;
  downloads: number;
  rating: number;
  onOpen: () => void;
}

export default function DashboardPopularResourcesCard({
  title,
  type,
  course,
  uploadedBy,
  downloads,
  rating,
  onOpen,
}: DashboardPopularResourcesCardProps) {
  return (
    <div
      className="rounded-xl border bg-background p-5 shadow-even-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`shrink-0 rounded-md px-2 py-2 text-[11px] font-bold ${getFileTypeBadgeClass(
              type,
            )}`}
          >
            {type}
          </span>

          <div className="min-w-0">
            <h3
              className="truncate text-[14px] font-semibold"
              style={{ color: "var(--foreground)" }}
              title={title}
            >
              {title.length > 40 ? title.slice(0, 40) + "..." : title}
            </h3>

            <p className="mt-0.5 text-[12px]" style={{ color: "var(--muted)" }}>
              {course}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 cursor-pointer text-[12px] font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          View
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <p className="text-[12px]" style={{ color: "var(--muted)" }}>
          {uploadedBy}
        </p>

        <span className="text-(--muted)">·</span>

        <div
          className="flex items-center gap-1.5 text-[12px]"
          style={{ color: "var(--muted)" }}
        >
          <Download size={14} strokeWidth={1.7} />
          {downloads}
        </div>

        <span className="text-(--muted)">·</span>

        <div
          className="flex items-center gap-1.5 text-[12px]"
          style={{ color: "#f59e0b" }}
        >
          <Star size={14} fill="currentColor" strokeWidth={1.5} />
          {rating}
        </div>
      </div>
    </div>
  );
}
