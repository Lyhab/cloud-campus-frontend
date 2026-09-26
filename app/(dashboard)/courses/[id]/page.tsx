"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Components
import Form from "@/app/components/form";
import CourseHeader from "@/app/components/pages/courses/course-header";
import CourseTabs from "@/app/components/pages/courses/course-tabs";

// Data
import { courses } from "../../../lib/data/courses";
import {
  getResourceCountForCourse,
  getResourcesForCourse,
} from "../../../lib/data/resources";
import {
  getUserCountForCourse,
  getUsersForCourse,
} from "../../../lib/data/users";
import { mockViewer } from "../../../lib/data/mock-viewer";

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [isEditOpen, setIsEditOpen] = useState(false);

  const course = courses.find((course) => course.id === params.id);

  if (!course) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Course not found
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

  const memberCount = getUserCountForCourse(course.id);
  const resourceCount = getResourceCountForCourse(course.id);
  const courseResources = getResourcesForCourse(course.id);
  const courseStudents = getUsersForCourse(course.id);

  const isAdmin = mockViewer.role === "admin";

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

      <CourseHeader
        code={course.code}
        name={course.name}
        description={course.description}
        memberCount={memberCount}
        resourceCount={resourceCount}
        isAdmin={isAdmin}
        onEditClick={() => setIsEditOpen(true)}
      />

      <CourseTabs
        courseResources={courseResources}
        courseStudents={courseStudents}
      />

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
            description: course.description,
          }}
          onClose={() => setIsEditOpen(false)}
          onSubmit={(data) => {
            console.log("Update course:", course.id, data);
            setIsEditOpen(false);
          }}
        />
      )}
    </div>
  );
}
