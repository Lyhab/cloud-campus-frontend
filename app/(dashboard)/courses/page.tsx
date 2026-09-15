"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

interface CourseRow {
  id: string;
  code: string;
  name: string;
  students: number;
  resources: number;
  createdAt: string;
}

// Map raw Course records into table rows, deriving counts from the related data.
const courseRows: CourseRow[] = courses.map((course) => ({
  id: course.id,
  code: course.code,
  name: course.name,
  students: getUserCountForCourse(course.id),
  resources: getResourceCountForCourse(course.id),
  createdAt: course.createdAt,
}));

const courseColumns = (
  onView: (courseId: string) => void,
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
  { key: "students", header: "Students", width: "12%", align: "center" },
  { key: "resources", header: "Resources", width: "12%", align: "center" },
  { key: "createdAt", header: "Created", width: "16%", align: "center" },
  {
    key: "id",
    header: "Actions",
    width: "10%",
    align: "center",
    render: (row) => (
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          title="View"
          onClick={() => onView(row.id)}
          className="cursor-pointer transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--muted)" }}
        >
          <Eye size={18} strokeWidth={1.7} />
        </button>
        <button
          type="button"
          title="Edit"
          onClick={() => onEdit(row.id)}
          className="cursor-pointer transition-colors duration-200 hover:opacity-70"
          style={{ color: "var(--primary)" }}
        >
          <SquarePen size={18} strokeWidth={1.7} />
        </button>
        <button
          type="button"
          title="Delete"
          onClick={() => onDelete(row.id)}
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
          className="cursor-pointer flex items-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-medium text-background transition-colors duration-200 hover:opacity-90"
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
          columns={courseColumns(
            (courseId) => router.push(`/courses/${courseId}`),
            setCourseToEdit,
            setCourseToDelete,
          )}
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

function StudentCoursesHeader() {
  return (
    <>
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Courses
          </h1>

          <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
            Browse and join courses to access shared study resources.
          </p>
        </div>

        <div
          className="flex items-center rounded-lg p-1"
          style={{ backgroundColor: "var(--primary-light)" }}
        >
          <button
            type="button"
            className="cursor-pointer rounded-md bg-background px-4 py-1.5 text-[12px] font-medium shadow-sm"
            style={{ color: "var(--foreground)" }}
          >
            All Courses
          </button>

          <button
            type="button"
            className="cursor-pointer rounded-md px-4 py-1.5 text-[12px] font-medium"
            style={{ color: "var(--muted)" }}
          >
            My Courses
          </button>
        </div>
      </div>
    </>
  );
}

function StudentCoursesContent() {
  const router = useRouter();

  return (
    <>
      {/* Course cards */}
      <Cards
        data={courses}
        // columns={2}
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
                className="flex-1 cursor-pointer rounded-lg border px-3 py-2 text-[12px] font-medium transition-colors duration-200 hover:bg-(--hover)"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
              >
                View
              </button>

              <button
                type="button"
                onClick={() => console.log("leave", course.id)}
                className="cursor-pointer rounded-lg px-3 py-2 text-[12px] font-medium transition-colors duration-200 text-(--danger) bg-(--smoke) hover:bg-(--hover-danger)"
              >
                Leave
              </button>
            </div>
          </div>
        )}
        pagination={{
          page: 1,
          pageSize: 5,
          total: courses.length,
          onPageChange: (page) => console.log(page),
        }}
      />
    </>
  );
}

const user = {
  role: "admin" as "admin" | "student",
};

export default function CoursesPage() {
  const [viewAsStudent, setViewAsStudent] = useState(false);
  const [search, setSearch] = useState("");
  const [codeFilter, setCodeFilter] = useState("all");
  const [sort, setSort] = useState("name-asc");

  const isAdmin = user.role === "admin";

  return (
    <div className="h-full overflow-y-auto p-8">
      {isAdmin && (
        <ViewToggle
          value={viewAsStudent ? "student" : "admin"}
          onChange={(value) => setViewAsStudent(value === "student")}
        />
      )}

      {/* Page Header */}
      {isAdmin ? (
        viewAsStudent ? (
          <StudentCoursesHeader />
        ) : (
          <AdminCoursesHeader />
        )
      ) : (
        <StudentCoursesHeader />
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
          <StudentCoursesContent />
        ) : (
          <AdminCoursesContent />
        )
      ) : (
        <StudentCoursesContent />
      )}
    </div>
  );
}
