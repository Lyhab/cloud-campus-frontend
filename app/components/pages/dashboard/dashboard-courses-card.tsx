import { BookOpen } from "lucide-react";

interface DashboardCoursesCardProps {
  code: string;
  name: string;
  description: string;
  resourceCount: number;
  onOpen: () => void;
}

export default function DashboardCoursesCard({
  code,
  name,
  description,
  resourceCount,
  onOpen,
}: DashboardCoursesCardProps) {
  return (
    <div
      className="rounded-xl border bg-background p-6 shadow-even-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <span
            className="inline-flex rounded-md px-2.5 py-1 text-[11px] font-semibold"
            style={{
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
            }}
          >
            {code}
          </span>

          <h3
            className="mt-3 text-[17px] font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {name}
          </h3>

          <p
            className="mt-2 text-[13px] leading-5"
            style={{ color: "var(--muted)" }}
          >
            {description}
          </p>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "var(--smoke-light)",
            color: "var(--muted)",
          }}
        >
          <BookOpen size={18} strokeWidth={1.7} />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-[13px]" style={{ color: "var(--muted-light)" }}>
          {resourceCount} resources
        </span>

        <button
          type="button"
          onClick={onOpen}
          className="cursor-pointer rounded-lg border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-(--hover)"
          style={{
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        >
          Open Course
        </button>
      </div>
    </div>
  );
}
