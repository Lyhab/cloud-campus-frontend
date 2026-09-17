import { Download } from "lucide-react";
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class"; // adjust import path to wherever this actually lives

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
  return (
    <div
      className="overflow-hidden rounded-xl border bg-background shadow-even-sm"
      style={{ borderColor: "var(--border)" }}
    >
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
                    {resource.date}
                  </td>

                  {/* Download */}
                  <td className="w-15 px-6 py-4 text-right">
                    <Download
                      size={19}
                      strokeWidth={1.7}
                      style={{ color: "var(--muted)" }}
                    />
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
