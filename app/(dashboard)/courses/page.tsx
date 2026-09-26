"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Icons
import { Plus, Eye, SquarePen, Trash2, Users, FileText } from "lucide-react";

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

// Data
import { courses } from "../../lib/data/courses";
import { getUserCountForCourse } from "../../lib/data/users";
import { getResourceCountForCourse } from "../../lib/data/resources";
import { mockViewer } from "../../lib/data/mock-viewer";

interface CourseRow {
  id: string;
  code: string;
  name: string;
  students: number;
  resources: number;
  createdAt: string;
}

// Map raw Course records into table rows, deriving counts from related data.
const courseRows: CourseRow[] = courses.map((course) => ({
  id: course.id,
  code: course.code,
  name: course.name,
  students: getUserCountForCourse(course.id),
  resources: getResourceCountForCourse(course.id),
  createdAt: course.createdAt,
}));

const courseColumns = (
  onEdit: (courseId: string) => void,
  onDelete: (courseId: string) => void,
): Column<CourseRow>[] => [
  {
    key: "code",
    header: "Course Code",
    width: "15%",
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
    width: "35%",
    render: (row) => (
      <span
        className="text-[15px] font-semibold"
        style={{ color: "var(--foreground)" }}
      >
        {row.name}
      </span>
    ),
  },
  {
    key: "students",
    header: "Students",
    width: "12%",
    align: "center",
  },
  {
    key: "resources",
    header: "Resources",
    width: "12%",
    align: "center",
  },
  {
    key: "createdAt",
    header: "Created",
    width: "16%",
    align: "center",
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
          title="Edit"
          onClick={(event) => {
            event.stopPropagation();
            onEdit(row.id);
          }}
          className="cursor-pointer transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          <SquarePen size={18} strokeWidth={1.7} />
        </button>

        <button
          type="button"
          title="Delete"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(row.id);
          }}
          className="cursor-pointer transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--danger, #e53e3e)" }}
        >
          <Trash2 size={18} strokeWidth={1.7} />
        </button>
      </div>
    ),
  },
];

// Inputs for course creation
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

function AdminCoursesHeader() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Manage Courses
          </h1>

          <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
            {courseRows.length} courses total
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium text-background transition-colors duration-200 hover:opacity-90"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <Plus size={18} strokeWidth={2} />
          Create Course
        </button>
      </div>

      {/* Create Course Form */}
      {isCreateOpen && (
        <Form
          title="Create Course"
          description="Add a new course to Cloud Campus."
          fields={courseFields}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={(data) => {
            console.log("Create course:", data);
            setIsCreateOpen(false);
          }}
        />
      )}
    </>
  );
}

function AdminCoursesContent() {
  const router = useRouter();

  const [courseToEdit, setCourseToEdit] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const editingCourse = courses.find((course) => course.id === courseToEdit);

  return (
    <>
      {/* Table */}
      <div
        className="overflow-hidden rounded-xl border bg-background"
        style={{ borderColor: "var(--border)" }}
      >
        <Table
          columns={courseColumns(setCourseToEdit, setCourseToDelete)}
          data={courseRows}
          onRowClick={(row) => router.push(`/courses/${row.id}`)}
          pagination={{
            page: 1,
            pageSize: 5,
            total: courseRows.length,
            onPageChange: (page) => console.log(page),
          }}
        />
      </div>

      {/* Edit Course Form */}
      {editingCourse && (
        <Form
          title="Edit Course"
          description="Update the course details."
          fields={courseFields}
          initialValues={{
            code: editingCourse.code,
            name: editingCourse.name,
            description: editingCourse.description,
          }}
          onClose={() => setCourseToEdit(null)}
          onSubmit={(data) => {
            console.log("Update course:", editingCourse.id, data);
            setCourseToEdit(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={courseToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setCourseToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this course?</AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. The course and its associated data
              will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                console.log("delete", courseToDelete);
                setCourseToDelete(null);
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

function StudentCoursesHeader({
  view,
  onViewChange,
}: {
  view: "all" | "my-courses";
  onViewChange: (view: "all" | "my-courses") => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Explore Courses
        </h1>

        <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
          Browse courses and access their learning resources.
        </p>
      </div>

      {/* Course Views */}
      <div
        className="flex items-center rounded-lg border p-1"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--smoke)",
        }}
      >
        {[
          { value: "all", label: "All Courses" },
          { value: "my-courses", label: "My Courses" },
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
    </div>
  );
}

function StudentCoursesContent({
  displayedCourses,
}: {
  displayedCourses: typeof courses;
}) {
  const router = useRouter();

  return (
    <>
      {/* Course cards */}
      <Cards
        data={displayedCourses}
        render={(course) => (
          <div
            className="flex h-full w-full flex-col rounded-xl border bg-background p-4.5 shadow-sm"
            style={{ borderColor: "var(--border)" }}
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

              <span
                className="rounded-md px-2 py-1 text-[11px] font-medium"
                style={{
                  backgroundColor: "#ecfdf5",
                  color: "#059669",
                }}
              >
                Joined
              </span>
            </div>

            {/* Course information */}
            <div className="mt-3 min-h-16">
              <h3
                className="text-[14px] font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {course.name}
              </h3>

              <p
                className="mt-1.5 line-clamp-2 text-[13px] leading-5"
                style={{ color: "var(--muted)" }}
              >
                {course.description}
              </p>
            </div>

            {/* Stats */}
            <div
              className="my-4 flex items-center gap-4 border-t pt-3"
              style={{ borderColor: "var(--border-light)" }}
            >
              <div className="flex items-center gap-1.5 text-[11px] text-(--muted)">
                <Users size={13} strokeWidth={1.6} />
                {getUserCountForCourse(course.id)} members
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-(--muted)">
                <FileText size={13} strokeWidth={1.6} />
                {getResourceCountForCourse(course.id)} resources
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

              <button
                type="button"
                onClick={() => console.log("leave", course.id)}
                className="cursor-pointer rounded-lg bg-(--smoke) px-3 py-2 text-[12px] font-medium text-(--danger) transition-colors duration-200 hover:bg-(--hover-danger)"
              >
                Leave
              </button>
            </div>
          </div>
        )}
        pagination={{
          page: 1,
          pageSize: 5,
          total: displayedCourses.length,
          onPageChange: (page) => console.log(page),
        }}
      />
    </>
  );
}

function CoursesPageContent() {
  // Admin / Student preview toggle
  const [viewAsStudent, setViewAsStudent] = useState(false);

  const [search, setSearch] = useState("");
  const [codeFilter, setCodeFilter] = useState("all");
  const [sort, setSort] = useState("name-asc");

  const searchParams = useSearchParams();
  const router = useRouter();

  const courseView =
    searchParams.get("filter") === "my-courses" ? "my-courses" : "all";

  const handleCourseViewChange = (view: "all" | "my-courses") => {
    if (view === "my-courses") {
      router.push("/courses?filter=my-courses");
    } else {
      router.push("/courses");
    }
  };

  const displayedCourses =
    courseView === "my-courses"
      ? courses.filter((course) => mockViewer.courseIds.includes(course.id))
      : courses;

  const isAdmin = mockViewer.role === "admin";

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Admin / Student Toggle */}
      {isAdmin && (
        <ViewToggle
          value={viewAsStudent ? "student" : "admin"}
          onChange={(value) => setViewAsStudent(value === "student")}
        />
      )}

      {/* Page Header */}
      {isAdmin ? (
        viewAsStudent ? (
          <StudentCoursesHeader
            view={courseView}
            onViewChange={handleCourseViewChange}
          />
        ) : (
          <AdminCoursesHeader />
        )
      ) : (
        <StudentCoursesHeader
          view={courseView}
          onViewChange={handleCourseViewChange}
        />
      )}

      {/* Search + Filters */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or code..."
        filters={[
          {
            name: "code",
            value: codeFilter,
            onChange: setCodeFilter,
            options: [
              { label: "All Codes", value: "all" },
              { label: "COMP", value: "COMP" },
              { label: "INFS", value: "INFS" },
            ],
          },
          {
            name: "sort",
            value: sort,
            onChange: setSort,
            options: [
              { label: "Name A–Z", value: "name-asc" },
              { label: "Name Z–A", value: "name-desc" },
              { label: "Newest", value: "date-newest" },
              { label: "Oldest", value: "date-oldest" },
            ],
          },
        ]}
      />

      {/* Content */}
      {isAdmin ? (
        viewAsStudent ? (
          <StudentCoursesContent displayedCourses={displayedCourses} />
        ) : (
          <AdminCoursesContent />
        )
      ) : (
        <StudentCoursesContent displayedCourses={displayedCourses} />
      )}
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
