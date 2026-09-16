"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Icons
import {
  Eye,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Star,
  ClipboardCheck,
} from "lucide-react";

// Components
import Table, { Column } from "@/app/components/table";
import Cards from "@/app/components/cards";
import ViewToggle from "@/app/components/view-toggle";
import SearchFilter from "@/app/components/search-filter";

// UI
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

// Data
import { resources } from "../../lib/data/resources";
import { users } from "../../lib/data/users";
import { courses } from "../../lib/data/courses";

// Helpers
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

interface ResourceRow {
  id: string;
  title: string;
  uploader: string;
  course: string;
  type: string;
  uploadedAt: string;
  downloads: number;
  rating: number;
  status: "pending" | "approved" | "denied";
}

// Static current user for now.
// Replace with authenticated user later.
const user = {
  id: "u1",
  role: "admin" as "admin" | "student",
};

// Map resources into table rows.
const resourceRows: ResourceRow[] = resources.map((resource) => {
  const uploader = users.find((user) => user.id === resource.uploadedBy);
  const course = courses.find((course) => course.id === resource.courseId);

  return {
    id: resource.id,
    title: resource.title,
    uploader: uploader?.name ?? "Unknown",
    course: course?.code ?? "Unknown",
    type: resource.fileType.toUpperCase(),
    uploadedAt: resource.uploadedAt,
    downloads: resource.downloads,
    rating: resource.rating,
    status: "pending",
  };
});

// Admin resource table columns
const resourceColumns = (
  onReview: (resourceId: string) => void,
  onDelete: (resourceId: string) => void,
): Column<ResourceRow>[] => [
  {
    key: "title",
    header: "Resource",
    width: "37%",
    render: (row) => {
      const displayTitle =
        row.title.length > 60 ? row.title.slice(0, 60) + "..." : row.title;

      return (
        <div className="flex items-center gap-3">
          <span
            className={`rounded-md px-2 py-1 text-[11px] font-bold ${getFileTypeBadgeClass(
              row.type,
            )}`}
          >
            {row.type}
          </span>

          <span
            className="text-[14px] font-semibold"
            style={{ color: "var(--foreground)" }}
            title={row.title}
          >
            {displayTitle}
          </span>
        </div>
      );
    },
  },
  {
    key: "uploader",
    header: "Uploader",
    width: "18%",
  },
  {
    key: "course",
    header: "Course",
    width: "10%",
    render: (row) => (
      <span
        className="rounded-md px-2 py-1 text-[13px] font-medium"
        style={{
          backgroundColor: "var(--primary-light)",
          color: "var(--primary)",
        }}
      >
        {row.course}
      </span>
    ),
  },
  {
    key: "uploadedAt",
    header: "Upload Date",
    width: "15%",
    align: "center",
  },
  {
    key: "status",
    header: "Status",
    width: "10%",
    align: "center",
    render: (row) => {
      const statusStyles = {
        pending: {
          backgroundColor: "var(--smoke)",
          color: "var(--muted)",
        },
        approved: {
          backgroundColor: "var(--success-light)",
          color: "var(--success)",
        },
        denied: {
          backgroundColor: "var(--danger-light)",
          color: "var(--danger)",
        },
      };

      return (
        <span
          className="rounded-md px-2.5 py-1 text-[11px] font-medium"
          style={statusStyles[row.status]}
        >
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      );
    },
  },
  {
    key: "id",
    header: "Actions",
    width: "10%",
    align: "center",
    render: (row) => (
      <div className="flex items-center justify-center gap-3">
        {/* Review */}
        <button
          type="button"
          title="Review"
          onClick={(event) => {
            event.stopPropagation();
            onReview(row.id);
          }}
          className="cursor-pointer transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          <ClipboardCheck size={18} strokeWidth={1.7} />
        </button>

        {/* Delete */}
        <button
          type="button"
          title="Delete"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.id);
          }}
          className="cursor-pointer transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--danger)" }}
        >
          <Trash2 size={18} strokeWidth={1.7} />
        </button>
      </div>
    ),
  },
];

function AdminResourcesHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        Manage Resources
      </h1>

      <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
        {resources.length} total resources
      </p>
    </div>
  );
}

function AdminResourcesContent() {
  const router = useRouter();

  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  const [resourceToReview, setResourceToReview] = useState<string | null>(null);

  const [resourceStatuses, setResourceStatuses] = useState<
    Record<string, "pending" | "approved" | "denied">
  >({});

  // Apply current statuses to table rows
  const adminResourceRows = resourceRows.map((resource) => ({
    ...resource,
    status: resourceStatuses[resource.id] ?? "pending",
  }));

  const updateResourceStatus = (
    resourceId: string,
    status: "approved" | "denied",
  ) => {
    setResourceStatuses((current) => ({
      ...current,
      [resourceId]: status,
    }));

    setResourceToReview(null);
  };

  return (
    <>
      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border bg-background"
        style={{ borderColor: "var(--border)" }}
      >
        <Table
          columns={resourceColumns(setResourceToReview, setResourceToDelete)}
          data={adminResourceRows}
          onRowClick={(row) => router.push(`/resources/${row.id}`)}
          pagination={{
            page: 1,
            pageSize: 2,
            total: adminResourceRows.length,
            onPageChange: (page) => console.log(page),
          }}
        />
      </div>

      {/* Review Confirmation */}
      <AlertDialog
        open={resourceToReview !== null}
        onOpenChange={(open) => {
          if (!open) {
            setResourceToReview(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review this resource?</AlertDialogTitle>

            <AlertDialogDescription>
              Approve this resource to make it available to students, or deny it
              if it does not meet the requirements.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (resourceToReview) {
                  updateResourceStatus(resourceToReview, "denied");
                }
              }}
            >
              Deny
            </AlertDialogAction>

            <AlertDialogAction
              onClick={() => {
                if (resourceToReview) {
                  updateResourceStatus(resourceToReview, "approved");
                }
              }}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={resourceToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setResourceToDelete(null);
          }
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                console.log("delete resource:", resourceToDelete);
                setResourceToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function StudentResourcesHeader({
  view,
  onViewChange,
}: {
  view: "all" | "bookmarked" | "uploads";
  onViewChange: (view: "all" | "bookmarked" | "uploads") => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Explore Resources
        </h1>

        <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
          Browse study materials shared across all courses.
        </p>
      </div>

      {/* Resource Views */}
      <div
        className="flex items-center rounded-lg border p-1"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--smoke)",
        }}
      >
        {[
          { value: "all", label: "All Resources" },
          { value: "bookmarked", label: "Bookmarked" },
          { value: "uploads", label: "My Uploads" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() =>
              onViewChange(item.value as "all" | "bookmarked" | "uploads")
            }
            className={`cursor-pointer rounded-md px-3.5 py-1.5 text-[12px] font-medium transition-all duration-150 ${
              view === item.value
                ? "bg-(--primary) text-background shadow-sm"
                : "text-(--muted)"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StudentResourcesContent({
  view,
  search,
  courseId,
  fileType,
  sort,
}: {
  view: "all" | "bookmarked" | "uploads";
  search: string;
  courseId: string;
  fileType: string;
  sort: string;
}) {
  const router = useRouter();

  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(
    () =>
      users.find((item) => item.id === user.id)?.bookmarkedResourceIds ?? [],
  );

  const currentResources = resources.filter((resource) => {
    if (view === "bookmarked") {
      return bookmarkedIds.includes(resource.id);
    }

    if (view === "uploads") {
      return resource.uploadedBy === user.id;
    }

    return true;
  });

  const filteredResources = currentResources
    .filter((resource) => {
      const searchValue = search.toLowerCase();

      const matchesSearch = resource.title.toLowerCase().includes(searchValue);

      const matchesCourse =
        courseId === "all" || resource.courseId === courseId;

      const matchesType =
        fileType === "all" ||
        resource.fileType.toLowerCase() === fileType.toLowerCase();

      return matchesSearch && matchesCourse && matchesType;
    })
    .sort((a, b) => {
      if (sort === "downloads") {
        return b.downloads - a.downloads;
      }

      if (sort === "rating") {
        return b.rating - a.rating;
      }

      return (
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );
    });

  const toggleBookmark = (resourceId: string) => {
    setBookmarkedIds((current) =>
      current.includes(resourceId)
        ? current.filter((id) => id !== resourceId)
        : [...current, resourceId],
    );
  };

  return (
    <Cards
      data={filteredResources}
      render={(resource) => {
        const course = courses.find(
          (course) => course.id === resource.courseId,
        );

        const uploader = users.find((item) => item.id === resource.uploadedBy);

        const isBookmarked = bookmarkedIds.includes(resource.id);

        return (
          <div
            className="flex h-full w-full flex-col rounded-xl border bg-background p-4.5 shadow-sm"
            style={{ borderColor: "var(--border)" }}
          >
            {/* Top */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-md px-2 py-2 text-[11px] font-bold ${getFileTypeBadgeClass(
                    resource.fileType,
                  )}`}
                >
                  {resource.fileType.toUpperCase()}
                </span>

                <div>
                  <h3
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {resource.title}
                  </h3>

                  <p
                    className="mt-0.5 text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    {course?.code} {course?.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                onClick={() => toggleBookmark(resource.id)}
                className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-(--hover)"
                style={{
                  color: isBookmarked ? "var(--primary)" : "var(--muted)",
                }}
              >
                {isBookmarked ? (
                  <BookmarkCheck size={17} strokeWidth={1.7} />
                ) : (
                  <Bookmark size={17} strokeWidth={1.7} />
                )}
              </button>
            </div>

            {/* Resource info */}
            <div className="mt-4">
              <p
                className="text-[13px] leading-5"
                style={{ color: "var(--muted)" }}
              >
                {course?.description ??
                  "Study material shared with students in this course."}
              </p>
            </div>

            {/* Metadata */}
            <div
              className="mt-4 flex items-center justify-between border-t pt-3"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div
                className="flex items-center gap-1 text-[11px]"
                style={{ color: "var(--muted)" }}
              >
                <span>{uploader?.name ?? "Unknown"}</span>
                <span>·</span>
                <span>{resource.fileSizeMb} MB</span>
                <span>·</span>
                <span>{resource.downloads} downloads</span>
              </div>

              <div className="flex items-center gap-1 text-[11px]">
                <Star
                  size={13}
                  fill="currentColor"
                  style={{ color: "#f59e0b" }}
                />
                <span style={{ color: "var(--muted)" }}>{resource.rating}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto pt-3">
              <button
                type="button"
                onClick={() => router.push(`/resources/${resource.id}`)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors duration-200 hover:bg-(--hover)"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                <Eye size={14} strokeWidth={1.7} />
                View
              </button>
            </div>
          </div>
        );
      }}
      pagination={{
        page: 1,
        pageSize: 3,
        total: filteredResources.length,
        onPageChange: (page) => console.log(page),
      }}
    />
  );
}

export default function ResourcesPage() {
  const [viewAsStudent, setViewAsStudent] = useState(false);

  const [resourceView, setResourceView] = useState<
    "all" | "bookmarked" | "uploads"
  >("all");

  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("all");
  const [fileType, setFileType] = useState("all");
  const [sort, setSort] = useState("newest");

  const isAdmin = user.role === "admin";

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Admin / Student Toggle */}
      {isAdmin && (
        <ViewToggle
          value={viewAsStudent ? "student" : "admin"}
          onChange={(value) => setViewAsStudent(value === "student")}
        />
      )}

      {/* Header */}
      {isAdmin ? (
        viewAsStudent ? (
          <StudentResourcesHeader
            view={resourceView}
            onViewChange={setResourceView}
          />
        ) : (
          <AdminResourcesHeader />
        )
      ) : (
        <StudentResourcesHeader
          view={resourceView}
          onViewChange={setResourceView}
        />
      )}

      {/* Search + Filters */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          viewAsStudent || !isAdmin
            ? "Search resources by title..."
            : "Search by title or uploader..."
        }
        filters={[
          {
            name: "course",
            value: courseId,
            onChange: setCourseId,
            options: [
              { label: "All Courses", value: "all" },
              ...courses.map((course) => ({
                label: `${course.code} - ${course.name}`,
                value: course.id,
              })),
            ],
          },
          {
            name: "type",
            value: fileType,
            onChange: setFileType,
            options: [
              { label: "All Types", value: "all" },
              { label: "PDF", value: "pdf" },
              { label: "PPTX", value: "pptx" },
              { label: "DOCX", value: "docx" },
              { label: "XLSX", value: "xlsx" },
            ],
          },
          ...(viewAsStudent || !isAdmin
            ? [
                {
                  name: "sort",
                  value: sort,
                  onChange: setSort,
                  options: [
                    { label: "Newest", value: "newest" },
                    { label: "Most Downloaded", value: "downloads" },
                    { label: "Top Rated", value: "rating" },
                  ],
                },
              ]
            : []),
        ]}
      />

      {/* Content */}
      {isAdmin ? (
        viewAsStudent ? (
          <StudentResourcesContent
            view={resourceView}
            search={search}
            courseId={courseId}
            fileType={fileType}
            sort={sort}
          />
        ) : (
          <AdminResourcesContent />
        )
      ) : (
        <StudentResourcesContent
          view={resourceView}
          search={search}
          courseId={courseId}
          fileType={fileType}
          sort={sort}
        />
      )}
    </div>
  );
}
