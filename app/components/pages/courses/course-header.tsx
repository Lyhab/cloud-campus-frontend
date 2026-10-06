"use client";

import { FileText, SquarePen, Upload, UserPlus, Users } from "lucide-react";

interface CourseHeaderProps {
  code: string;
  name: string;
  description: string | null;
  memberCount: number;
  resourceCount: number;
  isAdmin: boolean;
  isStudent: boolean;
  isEnrolled: boolean;
  actionLoading?: boolean;
  onEditClick: () => void;
  onEnrollClick: () => void;
  onJoinClick: () => void;
  onLeaveClick: () => void;
}

export default function CourseHeader({
  code,
  name,
  description,
  memberCount,
  resourceCount,
  isAdmin,
  isStudent,
  isEnrolled,
  actionLoading = false,
  onEditClick,
  onEnrollClick,
  onJoinClick,
  onLeaveClick,
}: CourseHeaderProps) {
  return (
    <div
      className="rounded-xl border bg-background p-7 shadow-even-md"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          {/* Course Code */}
          <span
            className="inline-flex rounded-md px-2.5 py-1 text-[12px] font-semibold"
            style={{
              backgroundColor: "var(--primary-light)",
              color: "var(--primary)",
            }}
          >
            {code}
          </span>

          {/* Course Name */}
          <h1
            className="mt-3 text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {name}
          </h1>

          {/* Description */}
          <p
            className="mt-2 max-w-2xl text-[15px] leading-6"
            style={{ color: "var(--muted)" }}
          >
            {description || "No description available."}
          </p>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6">
            <div
              className="flex items-center gap-2 text-[13px]"
              style={{ color: "var(--muted)" }}
            >
              <FileText size={17} strokeWidth={1.6} />
              {resourceCount} resources
            </div>

            <div
              className="flex items-center gap-2 text-[13px]"
              style={{ color: "var(--muted)" }}
            >
              <Users size={17} strokeWidth={1.6} />
              {memberCount} members
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={onEnrollClick}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--smoke) px-4 py-2.5 text-[13px] font-medium text-(--foreground) transition-colors hover:bg-(--hover)"
              >
                <UserPlus size={15} strokeWidth={1.8} />
                Enroll Students
              </button>

              <button
                type="button"
                onClick={onEditClick}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-opacity bg-(--primary) hover:opacity-90"
              >
                <SquarePen size={15} strokeWidth={1.8} />
                Edit Course
              </button>
            </>
          ) : (
            isStudent && (
              <>
                {isEnrolled ? (
                  <>
                    {/* Upload Resource */}
                    <button
                      type="button"
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-opacity bg-(--primary) hover:opacity-90"
                    >
                      <Upload size={16} strokeWidth={1.8} />
                      Upload Resource
                    </button>

                    {/* Leave Course */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={onLeaveClick}
                      className="cursor-pointer rounded-lg bg-(--smoke) px-4 py-2.5 text-[13px] font-medium text-(--danger) transition-colors hover:bg-(--hover-danger) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Leave Course
                    </button>
                  </>
                ) : (
                  /* Join Course */
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={onJoinClick}
                    className="cursor-pointer rounded-lg px-4 py-2.5 text-[13px] font-medium text-white transition-opacity bg-(--primary) hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Join Course
                  </button>
                )}
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
