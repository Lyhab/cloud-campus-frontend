import type { LucideIcon } from "lucide-react";

interface DashboardStatisticCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  onClick?: () => void;
}

export default function DashboardStatisticCard({
  label,
  value,
  change,
  icon: Icon,
  onClick,
}: DashboardStatisticCardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl border bg-background p-6 shadow-even-sm hover:bg-(--hover) ${
        onClick ? "cursor-pointer transition-opacity hover:opacity-80" : ""
      }`}
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[13px] font-medium uppercase tracking-wide"
            style={{ color: "var(--muted)" }}
          >
            {label}
          </p>

          <p
            className="mt-2 text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {value}
          </p>

          {change && (
            <p
              className="mt-2 text-[13px] font-medium"
              style={{ color: "var(--success)" }}
            >
              {change}
            </p>
          )}
        </div>

        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor: "var(--primary-light)",
            color: "var(--primary)",
          }}
        >
          <Icon size={22} strokeWidth={1.7} />
        </div>
      </div>
    </div>
  );
}
