"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DashboardBarGraphProps {
  data: {
    label: string;
    value: number;
  }[];
  title: string;
  description?: string;
}

export default function DashboardBarGraph({
  data,
  title,
  description,
}: DashboardBarGraphProps) {
  return (
    <div
      className="rounded-xl border bg-background p-6 shadow-even-sm"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mb-6">
        <h2
          className="text-[16px] font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-[13px]" style={{ color: "var(--muted)" }}>
            {description}
          </p>
        )}
      </div>

      <div className="h-70 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid vertical={false} stroke="var(--border-light)" />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--muted)",
                fontSize: 12,
              }}
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "var(--muted)",
                fontSize: 12,
              }}
            />

            <Tooltip
              cursor={{ fill: "var(--smoke-light)" }}
              contentStyle={{
                border: "1px solid var(--border)",
                borderRadius: "8px",
                backgroundColor: "var(--background)",
                color: "var(--foreground)",
                fontSize: "12px",
              }}
            />

            <Bar
              dataKey="value"
              fill="var(--primary)"
              radius={[5, 5, 0, 0]}
              maxBarSize={42}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
