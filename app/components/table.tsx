"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  align?: "start" | "center" | "end";
  render?: (row: T) => React.ReactNode;
}

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  pagination?: PaginationProps;
  onRowClick?: (row: T) => void;
}

export default function Table<T extends { id: string | number }>({
  columns,
  data,
  emptyMessage = "No results found.",
  pagination,
  onRowClick,
}: TableProps<T>) {
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  const startIndex = pagination
    ? (pagination.page - 1) * pagination.pageSize
    : 0;

  const endIndex = pagination ? startIndex + data.length : data.length;

  return (
    <div>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--border)" }}>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-6 py-3.5 text-[12px] font-semibold uppercase tracking-wide"
                style={{
                  color: "var(--muted)",
                  width: col.width,
                  textAlign: col.align ?? "start",
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-[14px]"
                style={{ color: "var(--muted)" }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b transition-colors duration-150 border-(--border-light) last:border-b-0 hover:bg-(--hover) ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="px-6 py-4 text-[14px]"
                    style={{
                      color: "var(--foreground)",
                      textAlign: col.align ?? "start",
                    }}
                  >
                    {col.render ? col.render(row) : String(row[col.key])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && totalPages > 1 && (
        <div
          className="flex items-center justify-between border-t px-6 py-4"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-[13px]" style={{ color: "var(--muted)" }}>
            Showing {startIndex + 1}–{Math.min(endIndex, pagination.total)} of{" "}
            {pagination.total}
          </span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-(--hover) disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--muted)" }}
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => pagination.onPageChange(page)}
                  className="cursor-pointer h-8 min-w-8 rounded-md px-2 text-[13px] font-medium transition-colors hover:bg-(--hover) "
                  style={{
                    backgroundColor:
                      pagination.page === page
                        ? "var(--primary)"
                        : "transparent",
                    color:
                      pagination.page === page
                        ? "var(--background)"
                        : "var(--muted)",
                  }}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={pagination.page === totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-(--hover) disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "var(--muted)" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
