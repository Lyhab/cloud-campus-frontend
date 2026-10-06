"use client";

import { Suspense, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Eye, FileText, Plus, SquarePen, Trash2, Users } from "lucide-react";

// Components
import Table, { Column } from "@/app/components/table";
import Cards from "@/app/components/cards";
import ViewToggle from "@/app/components/view-toggle";
import Form from "@/app/components/form";
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
  createCourse,
  deleteCourse,
  enrollSelf,
  getCourses,
  updateCourse,
  unenrollSelf,
  type Course,
  type ListCoursesQuery,
} from "@/app/lib/api/courses";

import { formatDateTime } from "@/app/lib/format-date";

interface CourseFormData {
  code: string;
  name: string;
  description: string;
}

const courseFields = [
  {
    name: "code",
    label: "Course Code",
    type: "text" as const,
    placeholder: "e.g. COMP809",
  },
  {
    name: "name",
    label: "Course Name",
    type: "text" as const,
    placeholder: "e.g. Data Mining and Machine Learning",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    placeholder: "Enter a short course description...",
  },
];

function AdminCoursesHeader({
  total,
  onCreate,
}: {
  total: number;
  onCreate: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{
            color: "var(--foreground)",
          }}
        >
          Manage Courses
        </h1>

        <p
          className="mt-1 text-[14px]"
          style={{
            color: "var(--muted)",
          }}
        >
          {total} courses total
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium text-background transition-colors duration-200 hover:opacity-90"
        style={{
          backgroundColor: "var(--primary)",
        }}
      >
        <Plus size={18} strokeWidth={2} />
        Create Course
      </button>
    </div>
  );
}

function StudentCoursesHeader({
  view,
  onViewChange,
  showToggle,
}: {
  view: "all" | "my-courses";
  onViewChange: (view: "all" | "my-courses") => void;
  showToggle: boolean;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{
            color: "var(--foreground)",
          }}
        >
          Explore Courses
        </h1>

        <p
          className="mt-1 text-[14px]"
          style={{
            color: "var(--muted)",
          }}
        >
          Browse courses and access their learning resources.
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
            {
              value: "all",
              label: "All Courses",
            },
            {
              value: "my-courses",
              label: "My Courses",
            },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onViewChange(item.value as "all" | "my-courses")}
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

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, isLoading: authLoading } = useAuth();

  const [viewAsStudent, setViewAsStudent] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);

  const [courseCodes, setCourseCodes] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [codeFilter, setCodeFilter] = useState("all");

  const [sort, setSort] = useState<"alphabetical" | "newest" | "oldest">(
    "alphabetical",
  );

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const isStudent = user?.role === "student";

  const isGuest = !user;

  /*
   * Admins can switch between the admin
   * and student views.
   *
   * Students are always in student view.
   *
   * Guests are always in student-style view.
   */
  const studentView = isAdmin ? viewAsStudent : true;

  /*
   * Guests can only see all courses.
   */
  const courseView = isGuest
    ? "all"
    : searchParams.get("filter") === "my-courses"
      ? "my-courses"
      : "all";

  /*
   * Debounce search by 500ms.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const PAGE_SIZE = isAdmin && !studentView ? 10 : 12;

  /*
   * Load courses.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function loadCourses() {
      try {
        setIsLoading(true);
        setError(null);

        const query: ListCoursesQuery = {
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          code: codeFilter !== "all" ? codeFilter : undefined,
          sort,
        };

        /*
         * Only authenticated users can
         * request My Courses.
         */
        if (courseView === "my-courses" && user) {
          query.filter = "my-courses";
        }

        const response = await getCourses(query);

        if (cancelled) {
          return;
        }

        setCourses(response.data);
        setCourseCodes(response.codes);
        setTotal(response.total);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to load courses.",
        );

        setCourses([]);
        setTotal(0);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCourses();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user,
    page,
    debouncedSearch,
    codeFilter,
    sort,
    courseView,
    PAGE_SIZE,
  ]);

  /*
   * Search change.
   */
  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  /*
   * Course code filter change.
   */
  function handleCodeFilterChange(value: string) {
    setCodeFilter(value);
    setPage(1);
  }

  /*
   * Sort change.
   */
  function handleSortChange(value: string) {
    setSort(value as "alphabetical" | "newest" | "oldest");

    setPage(1);
  }

  /*
   * All Courses / My Courses.
   */
  function handleCourseViewChange(view: "all" | "my-courses") {
    if (isGuest) {
      return;
    }

    setPage(1);

    if (view === "my-courses") {
      router.push("/courses?filter=my-courses");
    } else {
      router.push("/courses");
    }
  }

  /*
   * Create course.
   */
  async function handleCreateCourse(data: CourseFormData) {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await createCourse({
        code: data.code,
        name: data.name,
        description: data.description || null,
      });

      setIsCreateOpen(false);
      setPage(1);

      /*
       * Reload first page.
       */
      const response = await getCourses({
        page: 1,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        code: codeFilter !== "all" ? codeFilter : undefined,
        sort,
      });

      setCourses(response.data);
      setCourseCodes(response.codes);
      setTotal(response.total);

      setActionSuccess("Course created successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to create course.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  /*
   * Update course.
   */
  async function handleUpdateCourse(data: CourseFormData) {
    if (!courseToEdit) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await updateCourse(courseToEdit.id, {
        code: data.code,
        name: data.name,
        description: data.description || null,
      });

      setCourseToEdit(null);

      const response = await getCourses({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        code: codeFilter !== "all" ? codeFilter : undefined,
        sort,
      });

      setCourses(response.data);
      setCourseCodes(response.codes);
      setTotal(response.total);

      setActionSuccess("Course updated successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update course.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  /*
   * Delete course.
   */
  async function handleDeleteCourse() {
    if (!courseToDelete) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await deleteCourse(courseToDelete.id);

      setCourseToDelete(null);

      /*
       * If this was the last course
       * on the page, move back.
       */
      if (courses.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        const response = await getCourses({
          page,
          limit: PAGE_SIZE,
          search: debouncedSearch.trim() || undefined,
          code: codeFilter !== "all" ? codeFilter : undefined,
          sort,
        });

        setCourses(response.data);
        setCourseCodes(response.codes);
        setTotal(response.total);
      }

      setActionSuccess("Course deleted successfully.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete course.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  /*
   * Enrol current student.
   */
  async function handleEnrollCourse(courseId: string) {
    if (!isStudent) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await enrollSelf(courseId);

      setActionSuccess("Successfully enrolled in the course.");

      const response = await getCourses({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        code: codeFilter !== "all" ? codeFilter : undefined,
        sort,
        filter: courseView === "my-courses" ? "my-courses" : undefined,
      });

      setCourses(response.data);
      setCourseCodes(response.codes);
      setTotal(response.total);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to enrol in course.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  /*
   * Unenrol current student.
   */
  async function handleLeaveCourse(courseId: string) {
    if (!isStudent) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await unenrollSelf(courseId);

      /*
       * Reload current view.
       */
      const response = await getCourses({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch.trim() || undefined,
        code: codeFilter !== "all" ? codeFilter : undefined,
        sort,
        filter: courseView === "my-courses" ? "my-courses" : undefined,
      });

      /*
       * If leaving the final course
       * on the current page, go back.
       */
      if (response.data.length === 0 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        setCourses(response.data);
        setCourseCodes(response.codes);
        setTotal(response.total);
      }

      setActionSuccess("Successfully unenrolled from the course.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to leave course.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const courseColumns: Column<Course>[] = [
    {
      key: "code",
      header: "Course Code",
      width: "17%",
      render: (row) => (
        <span
          className="rounded-md px-2 py-1 text-[13px] font-medium"
          style={{
            backgroundColor: "var(--primary-light)",
            color: "var(--primary)",
          }}
        >
          {row.code}
        </span>
      ),
    },

    {
      key: "name",
      header: "Course Name",
      width: "39%",
      render: (row) => (
        <span
          className="text-[15px] font-semibold"
          style={{
            color: "var(--foreground)",
          }}
        >
          {row.name}
        </span>
      ),
    },

    {
      key: "studentCount",
      header: "Students",
      width: "14%",
      align: "center",
    },

    {
      key: "createdAt",
      header: "Created",
      width: "18%",
      align: "center",
      render: (row) => formatDateTime(row.createdAt),
    },

    {
      key: "id",
      header: "Actions",
      width: "12%",
      align: "center",
      render: (row) => (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            title="Edit"
            disabled={actionLoading}
            onClick={(event) => {
              event.stopPropagation();
              setCourseToEdit(row);
            }}
            className="cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              color: "var(--primary)",
            }}
          >
            <SquarePen size={18} strokeWidth={1.7} />
          </button>

          <button
            type="button"
            title="Delete"
            disabled={actionLoading}
            onClick={(event) => {
              event.stopPropagation();
              setCourseToDelete(row);
            }}
            className="cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              color: "var(--danger, #e53e3e)",
            }}
          >
            <Trash2 size={18} strokeWidth={1.7} />
          </button>
        </div>
      ),
    },
  ];

  /*
   * Only show the initial loading screen
   * while authentication is resolving.
   */
  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span
          className="text-sm"
          style={{
            color: "var(--muted)",
          }}
        >
          Loading courses...
        </span>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Admin / Student Toggle */}
      {isAdmin && (
        <ViewToggle
          value={viewAsStudent ? "student" : "admin"}
          onChange={(value) => {
            setPage(1);
            setViewAsStudent(value === "student");
          }}
        />
      )}

      {/* Page Header */}
      {isAdmin && !studentView ? (
        <AdminCoursesHeader
          total={total}
          onCreate={() => {
            setActionError(null);
            setActionSuccess(null);
            setIsCreateOpen(true);
          }}
        />
      ) : (
        <StudentCoursesHeader
          view={courseView}
          onViewChange={handleCourseViewChange}
          showToggle={!isGuest}
        />
      )}

      {/* Search + Filters */}
      <SearchFilter
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name or code..."
        filters={[
          {
            name: "code",
            value: codeFilter,
            onChange: handleCodeFilterChange,
            options: [
              {
                label: "All Codes",
                value: "all",
              },
              ...courseCodes.map((code) => ({
                label: code,
                value: code,
              })),
            ],
          },

          {
            name: "sort",
            value: sort,
            onChange: handleSortChange,
            options: [
              {
                label: "Name A–Z",
                value: "alphabetical",
              },
              {
                label: "Newest",
                value: "newest",
              },
              {
                label: "Oldest",
                value: "oldest",
              },
            ],
          },
        ]}
      />

      {/* Messages */}
      {actionError && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--danger, #e53e3e)",
            color: "var(--danger, #e53e3e)",
          }}
        >
          {actionError}
        </div>
      )}

      {actionSuccess && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "#10b981",
            color: "#059669",
            backgroundColor: "#ecfdf5",
          }}
        >
          {actionSuccess}
        </div>
      )}

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "var(--danger, #e53e3e)",
            color: "var(--danger, #e53e3e)",
          }}
        >
          {error}
        </div>
      )}

      {/* Admin Table */}
      {isAdmin && !studentView ? (
        <div
          className="relative overflow-hidden rounded-xl border bg-background"
          style={{
            borderColor: "var(--border)",
          }}
        >
          {isLoading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]"
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
          )}

          <Table
            columns={courseColumns}
            data={courses}
            onRowClick={(row) => router.push(`/courses/${row.id}`)}
            pagination={{
              page,
              pageSize: PAGE_SIZE,
              total,
              onPageChange: setPage,
            }}
          />
        </div>
      ) : (
        /* Student / Guest Cards */
        <div className="relative">
          {isLoading && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-xl backdrop-blur-[1px]"
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
          )}

          <Cards
            data={courses}
            render={(course) => (
              <div
                className="flex h-full w-full flex-col rounded-xl border bg-background p-4.5 shadow-sm"
                style={{
                  borderColor: "var(--border)",
                }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-md px-2 py-1 text-[11px] font-semibold"
                    style={{
                      backgroundColor: "var(--primary-light)",
                      color: "var(--primary)",
                    }}
                  >
                    {course.code}
                  </span>

                  {isStudent && course.isEnrolled && (
                    <span
                      className="rounded-md px-2 py-1 text-[11px] font-medium"
                      style={{
                        backgroundColor: "#ecfdf5",
                        color: "#059669",
                      }}
                    >
                      Joined
                    </span>
                  )}
                </div>

                {/* Course info */}
                <div className="mt-3 min-h-16">
                  <h3
                    className="text-[14px] font-semibold"
                    style={{
                      color: "var(--foreground)",
                    }}
                  >
                    {course.name}
                  </h3>

                  <p
                    className="mt-1.5 line-clamp-2 text-[13px] leading-5"
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    {course.description || "No description available."}
                  </p>
                </div>

                {/* Stats */}
                <div
                  className="my-4 flex items-center gap-4 border-t pt-3"
                  style={{ borderColor: "var(--border-light)" }}
                >
                  <div
                    className="flex items-center gap-1.5 text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    <FileText size={13} strokeWidth={1.6} />
                    {course.resourceCount} resources
                  </div>

                  <div
                    className="flex items-center gap-1.5 text-[11px]"
                    style={{ color: "var(--muted)" }}
                  >
                    <Users size={13} strokeWidth={1.6} />
                    {course.studentCount} members
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/courses/${course.id}`)}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors duration-200 hover:bg-(--hover)"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--foreground)",
                    }}
                  >
                    <Eye size={14} strokeWidth={1.7} />
                    View
                  </button>

                  {isStudent && course.isEnrolled && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleLeaveCourse(course.id)}
                      className="cursor-pointer rounded-lg bg-(--smoke) px-3 py-2 text-[12px] font-medium text-(--danger) transition-colors duration-200 hover:bg-(--hover-danger) disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Leave
                    </button>
                  )}

                  {isStudent && !course.isEnrolled && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => void handleEnrollCourse(course.id)}
                      className="cursor-pointer rounded-lg px-3 py-2 text-[12px] font-medium text-background transition-colors duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        backgroundColor: "var(--primary)",
                      }}
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            )}
            pagination={{
              page,
              pageSize: PAGE_SIZE,
              total,
              onPageChange: setPage,
            }}
          />
        </div>
      )}

      {/* Create Course */}
      {isCreateOpen && (
        <Form
          title="Create Course"
          description="Add a new course to Cloud Campus."
          fields={courseFields}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(data) =>
            void handleCreateCourse({
              code: String(data.code ?? ""),
              name: String(data.name ?? ""),
              description: String(data.description ?? ""),
            })
          }
        />
      )}

      {/* Edit Course */}
      {courseToEdit && (
        <Form
          title="Edit Course"
          description="Update the course details."
          fields={courseFields}
          initialValues={{
            code: courseToEdit.code,
            name: courseToEdit.name,
            description: courseToEdit.description ?? "",
          }}
          onClose={() => setCourseToEdit(null)}
          onSubmit={(data) =>
            void handleUpdateCourse({
              code: String(data.code ?? ""),
              name: String(data.name ?? ""),
              description: String(data.description ?? ""),
            })
          }
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={courseToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCourseToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. The course will be permanently
              deleted. A course with resources cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={actionLoading}
              onClick={() => void handleDeleteCourse()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={null}>
      <CoursesPageContent />
    </Suspense>
  );
}
