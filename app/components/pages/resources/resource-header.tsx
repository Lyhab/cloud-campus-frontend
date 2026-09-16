"use client";

import { Bookmark, Download, Star } from "lucide-react";

import type { Resource } from "@/app/lib/types";

interface ResourceHeaderProps {
  resource: Resource;
  fileType: string;
  fileTypeClass: string;
  courseLabel: string;
  uploaderName: string;
  isAdmin: boolean;
  showActions?: boolean;
  onCourseClick: () => void;
  averageRating: number;
  userRating: number;
  hoverRating: number;
  hasRated: boolean;
  onRate: (value: number) => void;
  onHoverRating: (value: number) => void;
}

export default function ResourceHeader({
  resource,
  fileType,
  fileTypeClass,
  courseLabel,
  uploaderName,
  isAdmin,
  showActions = true,
  onCourseClick,
  averageRating,
  userRating,
  hoverRating,
  hasRated,
  onRate,
  onHoverRating,
}: ResourceHeaderProps) {
  return (
    <div
      className="rounded-xl border bg-background p-7 shadow-even-md"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-8">
        {/* Resource Details */}
        <div className="min-w-0">
          {/* File Type */}
          <span
            className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold ${fileTypeClass}`}
          >
            {fileType}
          </span>

          {/* Title */}
          <h1
            className="mt-3 text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {resource.title}
          </h1>

          {/* Course */}
          <button
            type="button"
            onClick={onCourseClick}
            className="mt-2 cursor-pointer text-[14px] transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            {courseLabel}
          </button>

          {/* Metadata */}
          <div
            className="mt-5 flex items-center gap-2 text-[13px]"
            style={{ color: "var(--muted)" }}
          >
            <span>Uploaded by</span>

            <span
              className="font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {uploaderName}
            </span>

            <span>·</span>
            <span>{resource.uploadedAt}</span>
            <span>·</span>
            <span>{resource.fileSizeMb} MB</span>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6">
            <div
              className="flex items-center gap-2 text-[13px]"
              style={{ color: "var(--muted)" }}
            >
              <Download size={16} strokeWidth={1.7} />
              {resource.downloads} downloads
            </div>

            <div className="flex items-center gap-1.5">
              <Star
                size={15}
                fill="currentColor"
                strokeWidth={1.5}
                style={{ color: "#f59e0b" }}
              />

              <span
                className="text-[13px] font-medium"
                style={{ color: "#f59e0b" }}
              >
                {averageRating}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        {showActions && (
          <div className="flex shrink-0 items-center gap-2">
            {isAdmin ? (
              <>
                {/* Deny */}
                <button
                  type="button"
                  className="cursor-pointer rounded-lg bg-(--smoke) px-4 py-2.5 text-[13px] font-medium text-(--danger) transition-colors hover:bg-(--hover-danger)"
                >
                  Deny
                </button>

                {/* Approve */}
                <button
                  type="button"
                  className="cursor-pointer rounded-lg bg-(--primary) px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  Approve
                </button>
              </>
            ) : (
              <>
                {/* Bookmark */}
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-(--hover)"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <Bookmark size={16} strokeWidth={1.8} />
                  Bookmark
                </button>

                {/* Download */}
                <button
                  type="button"
                  className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Download size={16} strokeWidth={1.8} />
                  Download
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Student Rating Row */}
      {!isAdmin && showActions && (
        <div
          className="mt-3 flex items-center gap-3 border-t pt-3"
          style={{ borderColor: "var(--border-light)" }}
        >
          <span
            className="text-[13px] font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {hasRated ? "Your rating" : "Rate this resource"}
          </span>

          <div
            className="flex items-center gap-1"
            onMouseLeave={() => onHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const filled = (hoverRating || userRating) >= value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onRate(value)}
                  onMouseEnter={() => onHoverRating(value)}
                  className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                  aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                >
                  <Star
                    size={20}
                    fill={filled ? "currentColor" : "none"}
                    strokeWidth={1.6}
                    style={{
                      color: filled ? "#f59e0b" : "var(--muted-light)",
                    }}
                  />
                </button>
              );
            })}
          </div>

          {hasRated && (
            <span className="text-[12px]" style={{ color: "var(--muted)" }}>
              Thanks for rating!
            </span>
          )}
        </div>
      )}
    </div>
  );
}
