"use client";

import { FileText, Star } from "lucide-react";

import type { Resource } from "@/app/lib/api/resources";
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

interface ResourceRelatedProps {
  relatedResources: Resource[];
  onSelect: (id: string) => void;
}

export default function ResourceRelated({
  relatedResources,
  onSelect,
}: ResourceRelatedProps) {
  return (
    <aside>
      <h2
        className="mb-3 text-[15px] font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        Related Resources
      </h2>

      <div
        className="overflow-hidden rounded-xl border bg-background"
        style={{ borderColor: "var(--border)" }}
      >
        {relatedResources.length > 0 ? (
          relatedResources.map((relatedResource, index) => {
            const relatedType = relatedResource.fileType.toUpperCase();
            const relatedTypeClass = getFileTypeBadgeClass(
              relatedResource.fileType,
            );
            const relatedRating = Number(relatedResource.avgRating) || 0;

            return (
              <button
                key={relatedResource.id}
                type="button"
                onClick={() => onSelect(relatedResource.id)}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-(--hover) ${
                  index !== relatedResources.length - 1 ? "border-b" : ""
                }`}
                style={{
                  borderColor: "var(--border-light)",
                }}
              >
                {/* File Type */}
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${relatedTypeClass}`}
                >
                  {relatedType}
                </span>

                {/* Resource Info */}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-[13px] font-medium"
                    style={{ color: "var(--foreground)" }}
                    title={relatedResource.title}
                  >
                    {relatedResource.title}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--muted)" }}
                    >
                      {relatedResource.downloads} downloads
                    </span>

                    <span
                      className="text-[11px]"
                      style={{ color: "var(--muted-light)" }}
                    >
                      ·
                    </span>

                    <div className="flex items-center gap-1">
                      <Star
                        size={11}
                        fill="currentColor"
                        strokeWidth={1.5}
                        style={{ color: "#f59e0b" }}
                      />

                      <span
                        className="text-[11px]"
                        style={{ color: "#f59e0b" }}
                      >
                        {relatedRating.toFixed(1)}
                      </span>

                      <span
                        className="text-[11px]"
                        style={{ color: "var(--muted)" }}
                      >
                        ({relatedResource.ratingCount})
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-5 py-8 text-center">
            <FileText
              size={24}
              strokeWidth={1.5}
              className="mx-auto"
              style={{ color: "var(--muted-light)" }}
            />

            <p
              className="mt-3 text-[13px] font-medium"
              style={{ color: "var(--foreground)" }}
            >
              No related resources
            </p>

            <p className="mt-1 text-[12px]" style={{ color: "var(--muted)" }}>
              There are no other resources in this course.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
