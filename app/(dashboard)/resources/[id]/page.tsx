"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Bookmark, Download, FileText, Star } from "lucide-react";

// Data
import { resources } from "../../../lib/data/resources";
import { courses } from "../../../lib/data/courses";
import { users } from "../../../lib/data/users";

export default function ResourceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const resource = resources.find((resource) => resource.id === params.id);

  const user = {
    id: "current-user-id", // TODO: replace with real auth/session user
    role: "admin" as "admin" | "student",
  };

  const isAdmin = user.role === "admin";

  // --- Rating state ---
  // TODO: hydrate this from resource.ratings (e.g. find the entry for user.id)
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(
    resource?.rating ?? 0,
  );
  const [hasRated, setHasRated] = useState(false);

  const handleRate = (value: number) => {
    // Optimistic UI update — replace with real API call / persistence
    const wasAlreadyRated = hasRated;
    setUserRating(value);
    setHasRated(true);

    // Naive average recalculation for demo purposes.
    // Replace with a real recalculation once ratings are stored server-side.
    setAverageRating((prev) => {
      if (wasAlreadyRated) {
        // Replacing an existing rating — this is a placeholder approximation
        return Number(((prev + value) / 2).toFixed(1));
      }
      return Number(((prev + value) / 2).toFixed(1));
    });

    // TODO: call your API here, e.g.
    // await fetch(`/api/resources/${resource.id}/rate`, {
    //   method: "POST",
    //   body: JSON.stringify({ userId: user.id, value }),
    // });
  };

  if (!resource) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Resource not found
          </h1>

          <button
            type="button"
            onClick={() => router.push("/resources")}
            className="mt-3 cursor-pointer text-sm"
            style={{ color: "var(--primary)" }}
          >
            Back to Resources
          </button>
        </div>
      </div>
    );
  }

  const course = courses.find((course) => course.id === resource.courseId);

  const uploader = users.find((user) => user.id === resource.uploadedBy);

  const fileType = resource.fileType.toUpperCase();

  const fileTypeClass =
    fileType === "PDF"
      ? "pdf-badge"
      : fileType === "PPTX"
        ? "pptx-badge"
        : fileType === "DOCX"
          ? "docx-badge"
          : fileType === "XLSX"
            ? "xlsx-badge"
            : fileType === "CSV"
              ? "csv-badge"
              : "txt-badge";

  // Related resources from the same course
  const relatedResources = resources
    .filter(
      (item) => item.courseId === resource.courseId && item.id !== resource.id,
    )
    .slice(0, 5);

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Back */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push("/resources")}
          className="flex cursor-pointer items-center gap-2 text-[14px] transition-opacity hover:opacity-70"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to Resources
        </button>
      </div>

      {/* Resource Header */}
      <div
        className="rounded-xl border bg-background p-7 shadow-sm"
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
              onClick={() => course && router.push(`/courses/${course.id}`)}
              className="mt-2 cursor-pointer text-[14px] transition-opacity hover:opacity-70"
              style={{ color: "var(--primary)" }}
            >
              {course ? `${course.code} — ${course.name}` : "Unknown Course"}
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
                {uploader?.name ?? resource.uploadedBy}
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
        </div>

        {/* Student Rating Row */}
        {!isAdmin && (
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
              onMouseLeave={() => setHoverRating(0)}
            >
              {[1, 2, 3, 4, 5].map((value) => {
                const filled = (hoverRating || userRating) >= value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRate(value)}
                    onMouseEnter={() => setHoverRating(value)}
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

      {/* Main Content */}
      <div className="mt-7 grid grid-cols-[1fr_320px] gap-7">
        {/* File Preview */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <FileText
              size={17}
              strokeWidth={1.7}
              style={{ color: "var(--muted)" }}
            />

            <h2
              className="text-[15px] font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              File Preview
            </h2>
          </div>

          <div
            className="flex min-h-[650px] items-center justify-center rounded-xl border"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--smoke-light)",
            }}
          >
            {/* Temporary Preview */}
            <div className="text-center">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-xl text-[14px] font-bold ${fileTypeClass}`}
              >
                {fileType}
              </div>

              <h3
                className="mt-4 text-[15px] font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Preview unavailable
              </h3>

              <p
                className="mt-1 max-w-md text-[13px]"
                style={{ color: "var(--muted)" }}
              >
                The file preview will be available once the resource is
                connected to cloud storage.
              </p>

              <button
                type="button"
                className="mt-5 flex cursor-pointer items-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                <Download size={15} strokeWidth={1.8} />
                Download File
              </button>
            </div>
          </div>
        </div>

        {/* Related Resources */}
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

                const relatedTypeClass =
                  relatedType === "PDF"
                    ? "pdf-badge"
                    : relatedType === "PPTX"
                      ? "pptx-badge"
                      : relatedType === "DOCX"
                        ? "docx-badge"
                        : relatedType === "XLSX"
                          ? "xlsx-badge"
                          : relatedType === "CSV"
                            ? "csv-badge"
                            : "txt-badge";

                return (
                  <button
                    key={relatedResource.id}
                    type="button"
                    onClick={() =>
                      router.push(`/resources/${relatedResource.id}`)
                    }
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
                            {relatedResource.rating}
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

                <p
                  className="mt-1 text-[12px]"
                  style={{ color: "var(--muted)" }}
                >
                  There are no other resources in this course.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
