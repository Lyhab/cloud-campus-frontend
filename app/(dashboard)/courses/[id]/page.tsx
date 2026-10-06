"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Components
import Form, { type FormField } from "@/app/components/form";
import CourseHeader from "@/app/components/pages/courses/course-header";
import CourseTabs from "@/app/components/pages/courses/course-tabs";
import EnrollStudentsModal from "@/app/components/pages/courses/enroll-students-modal";

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
  getCourse,
  getCourseStudents,
  enrollSelf,
  unenrollSelf,
  unenrollStudent,
  updateCourse,
  type Course,
  type CourseStudent,
} from "@/app/lib/api/courses";
import { createResource } from "@/app/lib/api/resources";

const uploadFields: FormField[] = [
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
    label: "File",
    type: "file",
    required: true,
    accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg",
  },
];

export default function CourseDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const courseId = params.id;

  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<CourseStudent[]>([]);

  const [studentSearch, setStudentSearch] = useState("");
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState("");
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<CourseStudent | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // NEW: real resource count + reload trigger for the tabs
  const [resourceCount, setResourceCount] = useState(0);
  const [resourcesRefreshKey, setResourcesRefreshKey] = useState(0);

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";

  const loadCourse = useCallback(async () => {
    const courseResponse = await getCourse(courseId);

    setCourse(courseResponse);
  }, [courseId]);

  const loadStudents = useCallback(async () => {
    const studentsResponse = await getCourseStudents(courseId, {
      limit: 100,
      search: debouncedStudentSearch.trim() || undefined,
    });

    setStudents(studentsResponse.data);
  }, [courseId, debouncedStudentSearch]);

  /*
   * Debounce student search by 500ms.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStudentSearch(studentSearch);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [studentSearch]);

  /*
   * Load course.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        await loadCourse();
      } catch (err) {
        if (cancelled) {
          return;
        }

        setCourse(null);
        setError(err instanceof Error ? err.message : "Failed to load course.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, loadCourse]);

  /*
   * Load students (re-runs when the search changes
   * without reloading the whole page).
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setStudentsLoading(true);

        await loadStudents();
      } catch (err) {
        if (cancelled) {
          return;
        }

        setStudents([]);
        setActionError(
          err instanceof Error ? err.message : "Failed to load students.",
        );
      } finally {
        if (!cancelled) {
          setStudentsLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authLoading, loadStudents]);

  async function handleUpdateCourse(data: {
    code: string;
    name: string;
    description: string;
  }) {
    if (!course) {
      return;
    }

    setActionError(null);

    try {
      await updateCourse(course.id, {
        code: data.code,
        name: data.name,
        description: data.description || null,
      });

      setIsEditOpen(false);

      await loadCourse();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to update course.",
      );
    }
  }

  async function handleCreateResource(data: {
    title: string;
    description: string;
    file: File;
  }): Promise<boolean> {
    if (!course) {
      return false;
    }

    setActionError(null);
    setActionSuccess(null);

    try {
      await createResource({
        title: data.title,
        description: data.description || null,
        courseId: course.id,
        file: data.file,
      });

      setActionSuccess("Uploaded, awaiting admin approval.");

      // NEW: reload the course's resource list
      setResourcesRefreshKey((key) => key + 1);

      return true;
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to upload resource.",
      );

      return false;
    }
  }

  async function handleMembership(action: "join" | "leave") {
    if (!course || !isStudent) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (action === "join") {
        await enrollSelf(course.id);
      } else {
        await unenrollSelf(course.id);
      }

      await Promise.all([loadCourse(), loadStudents()]);

      setActionSuccess(
        action === "join"
          ? "Successfully enrolled in the course."
          : "Successfully unenrolled from the course.",
      );
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : `Failed to ${action} course.`,
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveStudent() {
    if (!studentToRemove || !isAdmin) {
      return;
    }

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await unenrollStudent(courseId, studentToRemove.id);

      setStudentToRemove(null);

      await Promise.all([loadCourse(), loadStudents()]);

      setActionSuccess("Student removed from the course.");
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to remove student.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          Loading course...
        </span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {error ?? "Course not found"}
          </h1>

          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="mt-3 cursor-pointer text-sm"
            style={{ color: "var(--primary)" }}
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Top Actions */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.push("/courses")}
          className="flex cursor-pointer items-center gap-2 text-[14px] transition-opacity hover:opacity-70"
          style={{ color: "var(--muted)" }}
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to Courses
        </button>
      </div>

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

      <CourseHeader
        code={course.code}
        name={course.name}
        description={course.description}
        memberCount={course.studentCount}
        resourceCount={resourceCount}
        isAdmin={isAdmin}
        isStudent={isStudent}
        isEnrolled={course.isEnrolled ?? false}
        actionLoading={actionLoading}
        onEnrollClick={() => {
          setActionError(null);
          setActionSuccess(null);
          setIsEnrollOpen(true);
        }}
        onJoinClick={() => void handleMembership("join")}
        onLeaveClick={() => void handleMembership("leave")}
        onEditClick={() => {
          setActionError(null);
          setIsEditOpen(true);
        }}
        onUploadClick={() => {
          setActionError(null);
          setActionSuccess(null);
          setIsUploadOpen(true);
        }}
      />

      {/* CHANGED: fetches its own resources by courseId */}
      <CourseTabs
        courseId={course.id}
        resourcesRefreshKey={resourcesRefreshKey}
        onResourceCountChange={setResourceCount}
        courseStudents={students}
        studentSearch={studentSearch}
        onStudentSearchChange={setStudentSearch}
        studentsLoading={studentsLoading}
        isAdmin={isAdmin}
        actionLoading={actionLoading}
        onRemoveStudent={(student) => {
          setActionError(null);
          setActionSuccess(null);
          setStudentToRemove(student);
        }}
      />

      {isEnrollOpen && (
        <EnrollStudentsModal
          courseId={course.id}
          onClose={() => setIsEnrollOpen(false)}
          onEnrolled={async (count) => {
            setIsEnrollOpen(false);

            await Promise.all([loadCourse(), loadStudents()]);

            setActionSuccess(
              `${count} student${count === 1 ? "" : "s"} enrolled successfully.`,
            );
          }}
        />
      )}

      {isEditOpen && (
        <Form
          title="Edit Course"
          description="Update the course details."
          fields={[
            {
              name: "code",
              label: "Course Code",
              type: "text",
              placeholder: "e.g. COMP809",
            },
            {
              name: "name",
              label: "Course Name",
              type: "text",
              placeholder: "e.g. Data Mining and Machine Learning",
            },
            {
              name: "description",
              label: "Description",
              type: "textarea",
              placeholder: "Enter a short course description...",
            },
          ]}
          initialValues={{
            code: course.code,
            name: course.name,
            description: course.description ?? "",
          }}
          onClose={() => setIsEditOpen(false)}
          onSubmit={(data) =>
            void handleUpdateCourse({
              code: String(data.code ?? ""),
              name: String(data.name ?? ""),
              description: String(data.description ?? ""),
            })
          }
        />
      )}

      {/* Upload Resource */}
      {isUploadOpen && (
        <Form
          title="Upload Resource"
          description="Check existing resources before uploading."
          fields={uploadFields}
          onClose={() => setIsUploadOpen(false)}
          onSubmit={(data) => {
            const file = data.file;

            if (!(file instanceof File)) {
              return;
            }

            void (async () => {
              const success = await handleCreateResource({
                title: String(data.title ?? "").trim(),
                description: String(data.description ?? ""),
                file,
              });

              if (success) {
                setIsUploadOpen(false);
              }
            })();
          }}
        />
      )}

      {/* Remove Student Confirmation */}
      <AlertDialog
        open={studentToRemove !== null}
        onOpenChange={(open) => {
          if (!open) {
            setStudentToRemove(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this student?</AlertDialogTitle>

            <AlertDialogDescription>
              {studentToRemove
                ? `${[studentToRemove.firstName, studentToRemove.lastName].filter(Boolean).join(" ")} will be unenrolled from this course.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              variant="destructive"
              disabled={actionLoading}
              onClick={() => void handleRemoveStudent()}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
