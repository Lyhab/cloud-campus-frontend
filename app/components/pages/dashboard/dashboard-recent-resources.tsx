"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { downloadResource } from "@/app/lib/api/resources";
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";
import { formatDate } from "@/app/lib/format-date";

interface DashboardRecentResourcesProps {
  resources: {
    id: string;
    title: string;
    course: string;
    type: string;
    uploadedBy: string;
    date: string;
  }[];
  onOpen: (id: string) => void;
}

export default function DashboardRecentResources({
  resources,
  onOpen,
}: DashboardRecentResourcesProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload(resource: {
    id: string;
    title: string;
    type: string;
  }) {
    try {
      setDownloadingId(resource.id);
      setError(null);

      const blob = await downloadResource(resource.id);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.title}.${resource.type.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download resource.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div
      className="overflow-hidden rounded-xl border bg-background shadow-even-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {error && (
        <div
          className="border-b px-6 py-3 text-sm"
          style={{
            borderColor: "var(--danger, #e53e3e)",
            color: "var(--danger, #e53e3e)",
          }}
        >
          {error}
        </div>
      )}

      <table className="w-full border-collapse text-left">
        <tbody>
          {resources.length === 0 ? (
            <tr>
              <td
                className="px-6 py-10 text-center text-[14px]"
                style={{ color: "var(--muted)" }}
              >
                No recent resources found.
              </td>
            </tr>
          ) : (
            resources.map((resource) => {
              const displayTitle =
                resource.title.length > 168
                  ? resource.title.slice(0, 168) + "..."
                  : resource.title;

              const isDownloading = downloadingId === resource.id;

              return (
                <tr
                  key={resource.id}
                  onClick={() => onOpen(resource.id)}
                  className="cursor-pointer border-b border-(--border-light) transition-colors duration-150 last:border-b-0 hover:bg-(--hover)"
                >
                  {/* Resource */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {/* File Type */}
                      <span
                        className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-bold ${getFileTypeBadgeClass(
                          resource.type,
                        )}`}
                      >
                        {resource.type}
                      </span>

                      {/* Title + Details */}
                      <div className="min-w-0">
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: "var(--foreground)" }}
                          title={resource.title}
                        >
                          {displayTitle}
                        </p>

                        <p
                          className="mt-1 text-[13px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {resource.course}
                        </p>

                        <p
                          className="mt-0.5 text-[13px]"
                          style={{ color: "var(--muted)" }}
                        >
                          {resource.uploadedBy}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Date */}
                  <td
                    className="w-32.5 px-4 py-4 text-[13px] text-right"
                    style={{ color: "var(--muted-light)" }}
                  >
                    {formatDate(resource.date)}
                  </td>

                  {/* Download */}
                  <td className="w-15 px-6 py-4 text-right">
                    <button
                      type="button"
                      title="Download"
                      disabled={isDownloading}
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleDownload(resource);
                      }}
                      className="cursor-pointer transition-opacity hover:opacity-60 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{ color: "var(--muted)" }}
                    >
                      {isDownloading ? (
                        <Loader2
                          size={19}
                          strokeWidth={1.7}
                          className="animate-spin"
                        />
                      ) : (
                        <Download size={19} strokeWidth={1.7} />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
