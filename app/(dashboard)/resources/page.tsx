"use client";

import { Suspense, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

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

// Auth
import { useAuth } from "@/app/context/AuthContext";

// API
import {
  getResources,
  deleteResource,
  updateResourceStatus,
  bookmarkResource,
  removeBookmark,
  type Resource,
  type ResourceStatus,
  type ResourceSort,
} from "@/app/lib/api/resources";

// Helpers
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";
import { formatDateTime } from "@/app/lib/format-date";

type ResourceView = "all" | "bookmarked" | "uploads";

type StatusFilter = "all" | ResourceStatus;

interface ResourceRow {
  id: string;
  title: string;
  uploader: string;
  course: string;
  type: string;
  uploadedAt: string;
  downloads: number;
  rating: number;
  status: ResourceStatus;
}

function getResourceUploader(resource: Resource): string {
  return [
    resource.creator.firstName,
    resource.creator.middleName,
    resource.creator.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function getRating(resource: Resource): number {
  const rating = Number(resource.avgRating);

  return Number.isFinite(rating) ? rating : 0;
}

/**
 * Translucent overlay shown on top of the existing
 * content while a new page / filter is loading.
 *
 * Keeps the page height stable so the scroll
 * position is not lost.
 */
function LoadingOverlay({ rounded = true }: { rounded?: boolean }) {
  return (
    <div
      className={`absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px] ${
        rounded ? "rounded-xl" : ""
      }`}
      style={{
        backgroundColor:
          "color-mix(in srgb, var(--background) 60%, transparent)",
      }}
    >
      <span
        className="rounded-md px-3 py-2 text-sm"
        style={{
          color: "var(--muted)",
          backgroundColor: "var(--background)",
        }}
      >
        Loading...
      </span>
    </div>
  );
}

function AdminResourcesHeader({ total }: { total: number }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
        Manage Resources
      </h1>

      <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
        {total} total resources
      </p>
    </div>
  );
}

function StudentResourcesHeader({
  view,
  onViewChange,
  showToggle,
}: {
  view: ResourceView;
  onViewChange: (view: ResourceView) => void;
  showToggle: boolean;
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

      {showToggle && (
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
              onClick={() => onViewChange(item.value as ResourceView)}
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
      )}
    </div>
  );
}

function AdminResourcesContent({
  resources,
  total,
  page,
  pageSize,
  onPageChange,
  onReview,
  onDelete,
  loading,
}: {
  resources: Resource[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onReview: (resourceId: string) => void;
  onDelete: (resourceId: string) => void;
  loading: boolean;
}) {
  const router = useRouter();

  const rows: ResourceRow[] = resources.map((resource) => ({
    id: resource.id,
    title: resource.title,
    uploader: getResourceUploader(resource),
    course: resource.course.code,
    type: resource.fileType.toUpperCase(),
    uploadedAt: resource.uploadedAt,
    downloads: resource.downloads,
    rating: getRating(resource),
    status: resource.status,
  }));

  const columns: Column<ResourceRow>[] = [
    {
      key: "title",
      header: "Resource",
      width: "34%",
      render: (row) => {
        const displayTitle =
          row.title.length > 55 ? `${row.title.slice(0, 55)}...` : row.title;

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
      width: "17%",
    },

    {
      key: "course",
      header: "Course",
      width: "8%",
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
      width: "19%",
      align: "center",
      render: (row) => formatDateTime(row.uploadedAt),
    },

    {
      key: "status",
      header: "Status",
      width: "8%",
      align: "center",
      render: (row) => {
        const styles = {
          pending: {
            backgroundColor: "var(--pending-light)",
            color: "var(--pending)",
          },
          approved: {
            backgroundColor: "var(--success-light)",
            color: "var(--success)",
          },
          rejected: {
            backgroundColor: "var(--danger-light)",
            color: "var(--danger)",
          },
        };

        return (
          <span
            className="rounded-md px-2.5 py-1 text-[11px] font-medium"
            style={styles[row.status]}
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
          <button
            type="button"
            title="Review"
            onClick={(event) => {
              event.stopPropagation();
              onReview(row.id);
            }}
            className="cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}
          >
            <ClipboardCheck size={18} strokeWidth={1.7} />
          </button>

          <button
            type="button"
            title="Delete"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(row.id);
            }}
            className="cursor-pointer transition-opacity hover:opacity-70"
            style={{ color: "var(--danger)" }}
          >
            <Trash2 size={18} strokeWidth={1.7} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-xl border bg-background"
      style={{ borderColor: "var(--border)" }}
    >
      {loading && <LoadingOverlay rounded={false} />}

      <Table
        columns={columns}
        data={rows}
        onRowClick={(row) => router.push(`/resources/${row.id}`)}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange,
        }}
      />
    </div>
  );
}

function StudentResourcesContent({
  resources,
  total,
  page,
  pageSize,
  onPageChange,
  onToggleBookmark,
  loading,
}: {
  resources: Resource[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onToggleBookmark: (resourceId: string) => void;
  loading: boolean;
}) {
  const router = useRouter();

  return (
    <div className="relative">
      {loading && <LoadingOverlay />}

      <Cards
        data={resources}
        render={(resource) => {
          const rating = getRating(resource);
          const isBookmarked = resource.isBookmarked;

          return (
            <div
              className="flex h-full w-full flex-col rounded-xl border bg-background p-4.5 shadow-sm"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`rounded-md px-2 py-2 text-[11px] font-bold ${getFileTypeBadgeClass(
                      resource.fileType,
                    )}`}
                  >
                    {resource.fileType.toUpperCase()}
                  </span>

                  <div className="min-w-0">
                    <h3
                      className="truncate text-[14px] font-semibold"
                      style={{ color: "var(--foreground)" }}
                      title={resource.title}
                    >
                      {resource.title}
                    </h3>

                    <p
                      className="mt-0.5 truncate text-[11px]"
                      style={{ color: "var(--muted)" }}
                    >
                      {resource.course.code} {resource.course.name}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                  onClick={() => onToggleBookmark(resource.id)}
                  className="cursor-pointer rounded-md p-1.5 transition-colors hover:bg-(--hover)"
                  style={{
                    color: isBookmarked ? "var(--primary)" : "var(--muted)",
                  }}
                >
                  {isBookmarked ? (
                    <BookmarkCheck
                      size={17}
                      strokeWidth={1.7}
                      fill="currentColor"
                      fillOpacity={0.15}
                    />
                  ) : (
                    <Bookmark size={17} strokeWidth={1.7} />
                  )}
                </button>
              </div>

              <div className="mt-4">
                <p
                  className="line-clamp-3 text-[13px] leading-5"
                  style={{ color: "var(--muted)" }}
                >
                  {resource.description ??
                    "Study material shared with students in this course."}
                </p>
              </div>

              <div
                className="mt-4 flex items-center justify-between border-t pt-3"
                style={{
                  borderColor: "var(--border-light)",
                }}
              >
                <div
                  className="flex min-w-0 items-center gap-1 truncate text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  <span className="truncate">
                    {getResourceUploader(resource)}
                  </span>

                  <span>·</span>

                  <span>{resource.fileSizeMb ?? "0"} MB</span>

                  <span>·</span>

                  <span>{resource.downloads} downloads</span>
                </div>

                <div className="ml-2 flex shrink-0 items-center gap-1 text-[11px]">
                  <Star
                    size={13}
                    fill="currentColor"
                    style={{ color: "#f59e0b" }}
                  />

                  <span style={{ color: "var(--muted)" }}>
                    {rating.toFixed(1)} ({resource.ratingCount ?? 0})
                  </span>
                </div>
              </div>

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
          page,
          pageSize,
          total,
          onPageChange,
        }}
      />
    </div>
  );
}

function ResourcesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isLoading: authLoading } = useAuth();

  const [viewAsStudent, setViewAsStudent] = useState(false);

  const [resources, setResources] = useState<Resource[]>([]);

  const [courses, setCourses] = useState<
    { id: string; code: string; name: string }[]
  >([]);

  const [fileTypes, setFileTypes] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [courseId, setCourseId] = useState("all");
  const [fileType, setFileType] = useState("all");

  const [sort, setSort] = useState<ResourceSort>("newest");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resourceToReview, setResourceToReview] = useState<string | null>(null);

  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.role === "admin";
  const isAuthenticated = Boolean(user);
  const isGuest = !user;

  const studentView = isAdmin ? viewAsStudent : true;

  const pageSize = isAdmin && !studentView ? 10 : 12;

  const urlFilter = searchParams.get("filter");

  const resourceView: ResourceView =
    urlFilter === "my-uploads"
      ? "uploads"
      : urlFilter === "bookmarked"
        ? "bookmarked"
        : "all";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadResources() {
      try {
        setLoading(true);
        setError(null);

        const response = await getResources({
          page,
          limit: pageSize,
          search: debouncedSearch.trim() || undefined,
          courseId: courseId !== "all" ? courseId : undefined,
          fileType: fileType !== "all" ? fileType : undefined,
          sort,
          filter:
            isAuthenticated && resourceView === "bookmarked"
              ? "bookmarked"
              : isAuthenticated && resourceView === "uploads"
                ? "my-uploads"
                : "all",
          status: isAdmin && !studentView ? statusFilter : undefined,
          view: isAdmin ? (studentView ? "student" : "admin") : "student",
        });

        if (cancelled) return;

        setResources(response.data);
        setCourses(response.courses);
        setFileTypes(response.fileTypes);
        setTotal(response.total);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Failed to load resources.",
        );

        setResources([]);
        setTotal(0);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadResources();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    page,
    pageSize,
    debouncedSearch,
    courseId,
    fileType,
    sort,
    statusFilter,
    resourceView,
    isAdmin,
    studentView,
    isAuthenticated,
  ]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCourseChange(value: string) {
    setCourseId(value);
    setPage(1);
  }

  function handleFileTypeChange(value: string) {
    setFileType(value);
    setPage(1);
  }

  function handleSortChange(value: string) {
    setSort(value as ResourceSort);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }

  function handleResourceViewChange(view: ResourceView) {
    if (isGuest) return;

    setPage(1);

    if (view === "uploads") {
      router.push("/resources?filter=my-uploads");
    } else if (view === "bookmarked") {
      router.push("/resources?filter=bookmarked");
    } else {
      router.push("/resources");
    }
  }

  async function handleToggleBookmark(resourceId: string) {
    if (!isAuthenticated) return;

    const resource = resources.find((item) => item.id === resourceId);

    if (!resource) return;

    const isCurrentlyBookmarked = resource.isBookmarked;

    try {
      if (isCurrentlyBookmarked) {
        await removeBookmark(resourceId);

        setResources((current) =>
          current.map((item) =>
            item.id === resourceId
              ? {
                  ...item,
                  isBookmarked: false,
                }
              : item,
          ),
        );

        if (resourceView === "bookmarked") {
          setResources((current) =>
            current.filter((item) => item.id !== resourceId),
          );

          setTotal((current) => Math.max(0, current - 1));
        }
      } else {
        await bookmarkResource(resourceId);

        setResources((current) =>
          current.map((item) =>
            item.id === resourceId
              ? {
                  ...item,
                  isBookmarked: true,
                }
              : item,
          ),
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update bookmark.",
      );
    }
  }

  async function handleUpdateStatus(status: "approved" | "rejected") {
    if (!resourceToReview) return;

    try {
      setActionLoading(true);

      await updateResourceStatus(resourceToReview, { status });

      setResourceToReview(null);

      const response = await getResources({
        page,
        limit: pageSize,
        search: debouncedSearch.trim() || undefined,
        courseId: courseId !== "all" ? courseId : undefined,
        fileType: fileType !== "all" ? fileType : undefined,
        sort,
        filter: "all",
        status: statusFilter,
        view: "admin",
      });

      setResources(response.data);
      setTotal(response.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update resource status.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteResource() {
    if (!resourceToDelete) return;

    try {
      setActionLoading(true);

      await deleteResource(resourceToDelete);

      setResourceToDelete(null);

      if (resources.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        const response = await getResources({
          page,
          limit: pageSize,
          search: debouncedSearch.trim() || undefined,
          courseId: courseId !== "all" ? courseId : undefined,
          fileType: fileType !== "all" ? fileType : undefined,
          sort,
          filter:
            isAuthenticated && resourceView === "bookmarked"
              ? "bookmarked"
              : isAuthenticated && resourceView === "uploads"
                ? "my-uploads"
                : "all",
          status: isAdmin && !studentView ? statusFilter : undefined,
          view: isAdmin ? (studentView ? "student" : "admin") : "student",
        });

        setResources(response.data);
        setTotal(response.total);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete resource.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const filters = [
    {
      name: "course",
      value: courseId,
      onChange: handleCourseChange,
      options: [
        {
          label: "All Courses",
          value: "all",
        },
        ...courses.map((course) => ({
          label: `${course.code} - ${course.name}`,
          value: course.id,
        })),
      ],
    },

    {
      name: "type",
      value: fileType,
      onChange: handleFileTypeChange,
      options: [
        {
          label: "All Types",
          value: "all",
        },
        ...fileTypes.map((type) => ({
          label: type.toUpperCase(),
          value: type,
        })),
      ],
    },

    {
      name: "sort",
      value: sort,
      onChange: handleSortChange,
      options: [
        {
          label: "Newest",
          value: "newest",
        },
        {
          label: "Most Downloaded",
          value: "most-downloaded",
        },
        {
          label: "Top Rated",
          value: "top-rated",
        },
      ],
    },

    ...(isAdmin && !studentView
      ? [
          {
            name: "status",
            value: statusFilter,
            onChange: handleStatusChange,
            options: [
              {
                label: "All Statuses",
                value: "all",
              },
              {
                label: "Pending",
                value: "pending",
              },
              {
                label: "Approved",
                value: "approved",
              },
              {
                label: "Rejected",
                value: "rejected",
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="h-full overflow-y-auto p-8">
      {isAdmin && (
        <ViewToggle
          value={studentView ? "student" : "admin"}
          onChange={(value) => setViewAsStudent(value === "student")}
        />
      )}

      {isAdmin && !studentView ? (
        <AdminResourcesHeader total={total} />
      ) : (
        <StudentResourcesHeader
          view={resourceView}
          onViewChange={handleResourceViewChange}
          showToggle={!isGuest}
        />
      )}

      <SearchFilter
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search resources by title..."
        filters={filters}
      />

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--danger)",
            color: "var(--danger)",
          }}
        >
          {error}
        </div>
      )}

      {isAdmin && !studentView ? (
        <AdminResourcesContent
          resources={resources}
          total={total}
          page={page}
          pageSize={10}
          onPageChange={setPage}
          onReview={setResourceToReview}
          onDelete={setResourceToDelete}
          loading={loading}
        />
      ) : (
        <StudentResourcesContent
          resources={resources}
          total={total}
          page={page}
          pageSize={12}
          onPageChange={setPage}
          onToggleBookmark={handleToggleBookmark}
          loading={loading}
        />
      )}

      {/* Review */}
      <AlertDialog
        open={resourceToReview !== null}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
            setResourceToReview(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review this resource?</AlertDialogTitle>

            <AlertDialogDescription>
              Approve the resource to make it available to students, or reject
              it if it does not meet the requirements.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={actionLoading}
              onClick={() => void handleUpdateStatus("rejected")}
            >
              Reject
            </AlertDialogAction>

            <AlertDialogAction
              disabled={actionLoading}
              onClick={() => void handleUpdateStatus("approved")}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete */}
      <AlertDialog
        open={resourceToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !actionLoading) {
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
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={actionLoading}
              onClick={() => void handleDeleteResource()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={null}>
      <ResourcesPageContent />
    </Suspense>
  );
}
