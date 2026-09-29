"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface CardsProps<T extends { id: string | number }> {
  data: T[];
  columns?: number;
  render: (item: T) => React.ReactNode;
  emptyMessage?: string;
  pagination?: PaginationProps;
}

export default function Cards<T extends { id: string | number }>({
  data,
  columns,
  render,
  emptyMessage = "No results found.",
  pagination,
}: CardsProps<T>) {
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.pageSize)
    : 1;

  const startIndex = pagination
    ? (pagination.page - 1) * pagination.pageSize
    : 0;

  const endIndex = pagination ? startIndex + data.length : data.length;

  // Default: responsive 1 → 2 → 3 → 4
  // If columns is provided, cap the grid at that number.
  const maxColumns = columns ?? 4;

  const gridClassName =
    maxColumns === 1
      ? "grid-cols-1"
      : maxColumns === 2
        ? "grid-cols-1 md:grid-cols-2"
        : maxColumns === 3
          ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4";

  return (
    <div>
      {/* Cards */}
      {data.length === 0 ? (
        <div
          className="rounded-xl border px-6 py-10 text-center text-[14px]"
          style={{
            borderColor: "var(--border)",
            color: "var(--muted)",
          }}
        >
          {emptyMessage}
        </div>
      ) : (
        <div className={`grid w-full ${gridClassName} gap-4`}>
          {data.map((item) => (
            <div key={item.id} className="flex h-full w-full *:w-full">
              {render(item)}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div
          className="mt-4 flex flex-col items-start justify-between gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:px-6"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-[13px]" style={{ color: "var(--muted)" }}>
            Showing {startIndex + 1} – {Math.min(endIndex, pagination.total)} of{" "}
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
