"use client";

import { useState } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Download,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";

import Form, { type FormField } from "@/app/components/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import type { Resource } from "@/app/lib/api/resources";
import { formatDateTime } from "@/app/lib/format-date";

export interface ResourceUpdatePayload {
  title: string;
  description: string;
  file?: File;
}

interface ResourceHeaderProps {
  resource: Resource;
  fileType: string;
  fileTypeClass: string;
  courseLabel: string;
  uploaderName: string;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isOwner: boolean;
  showActions?: boolean;
  onCourseClick: () => void;
  averageRating: number;
  ratingCount: number;
  userRating: number;
  hoverRating: number;
  hasRated: boolean;
  onRate: (value: number) => void;
  onHoverRating: (value: number) => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onDownload: () => void;
  onUpdate: (data: ResourceUpdatePayload) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
  onUpdateStatus: (status: "approved" | "rejected") => void;
}

const editFields: FormField[] = [
  {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "e.g. AWS S3 Study Notes",
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Enter a short description...",
  },
  {
    name: "file",
    label: "Replace File (optional)",
    type: "file",
    accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg",
  },
];

export default function ResourceHeader({
  resource,
  fileType,
  fileTypeClass,
  courseLabel,
  uploaderName,
  isAdmin,
  isAuthenticated,
  isOwner,
  showActions = true,
  onCourseClick,
  averageRating,
  ratingCount,
  userRating,
  hoverRating,
  hasRated,
  onRate,
  onHoverRating,
  isBookmarked,
  onToggleBookmark,
  onDownload,
  onUpdate,
  onDelete,
  onUpdateStatus,
}: ResourceHeaderProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

          {/* Description */}
          {resource.description && (
            <p
              className="mt-4 max-w-2xl text-[14px] leading-6"
              style={{ color: "var(--muted)" }}
            >
              {resource.description}
            </p>
          )}

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
            <span>{formatDateTime(resource.uploadedAt)}</span>
            <span>·</span>
            <span>{resource.fileSizeMb ?? "0"} MB</span>
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
                {averageRating.toFixed(1)}
              </span>

              <span className="text-[12px]" style={{ color: "var(--muted)" }}>
                ({ratingCount})
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        {showActions && (
          <div className="flex shrink-0 items-center gap-2">
            {isAdmin ? (
              <>
                {/* Reject */}
                <button
                  type="button"
                  onClick={() => onUpdateStatus("rejected")}
                  disabled={resource.status === "rejected"}
                  className="cursor-pointer rounded-lg bg-(--smoke) px-4 py-2.5 text-[13px] font-medium text-(--danger) transition-colors hover:bg-(--hover-danger) disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reject
                </button>

                {/* Approve */}
                <button
                  type="button"
                  onClick={() => onUpdateStatus("approved")}
                  disabled={resource.status === "approved"}
                  className="cursor-pointer rounded-lg bg-(--primary) px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Approve
                </button>
              </>
            ) : (
              <>
                {/* Edit (owner only) */}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-(--hover)"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <Pencil size={16} strokeWidth={1.8} />
                    Edit
                  </button>
                )}

                {/* Delete (owner only) */}
                {isOwner && (
                  <button
                    type="button"
                    onClick={() => setIsDeleteOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--smoke) px-4 py-2.5 text-[13px] font-medium text-(--danger) transition-colors hover:bg-(--hover-danger)"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                    Delete
                  </button>
                )}

                {/* Bookmark */}
                {isAuthenticated && (
                  <button
                    type="button"
                    onClick={onToggleBookmark}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-(--hover)"
                    style={{
                      borderColor: "var(--border)",
                      color: isBookmarked
                        ? "var(--primary)"
                        : "var(--foreground)",
                    }}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck size={16} strokeWidth={1.8} />
                    ) : (
                      <Bookmark size={16} strokeWidth={1.8} />
                    )}
                    {isBookmarked ? "Bookmarked" : "Bookmark"}
                  </button>
                )}

                {/* Download */}
                <button
                  type="button"
                  onClick={onDownload}
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

      {/* Student Rating Row (hidden for owners) */}
      {!isAdmin && !isOwner && isAuthenticated && showActions && (
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

      {/* Edit Resource */}
      {isEditOpen && (
        <Form
          title="Edit Resource"
          description="Update the details or replace the file."
          fields={editFields}
          initialValues={{
            title: resource.title,
            description: resource.description ?? "",
          }}
          onClose={() => setIsEditOpen(false)}
          onSubmit={(data) => {
            void (async () => {
              const success = await onUpdate({
                title: String(data.title ?? "").trim(),
                description: String(data.description ?? ""),
                file: data.file instanceof File ? data.file : undefined,
              });

              if (success) setIsEditOpen(false);
            })();
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setIsDeleteOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resource?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. The resource will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault();

                void (async () => {
                  setIsDeleting(true);
                  const success = await onDelete();
                  setIsDeleting(false);

                  if (success) setIsDeleteOpen(false);
                })();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
