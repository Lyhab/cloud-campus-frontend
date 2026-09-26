"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

// Components
import ResourceHeader from "@/app/components/pages/resources/resource-header";
import ResourceFilePreview from "@/app/components/pages/resources/resource-file-preview";
import ResourceRelated from "@/app/components/pages/resources/resource-related";

// Data
import { resources } from "../../../lib/data/resources";
import { courses } from "../../../lib/data/courses";
import { users } from "../../../lib/data/users";
import { mockViewer } from "../../../lib/data/mock-viewer";

// Helpers
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

export default function ResourceDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const resource = resources.find((resource) => resource.id === params.id);

  const isAdmin = mockViewer.role === "admin";

  // --- Rating state ---
  // TODO: hydrate this from resource.ratings (e.g. find the entry for mockViewer.id)
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
    //   body: JSON.stringify({ userId: mockViewer.id, value }),
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
  const fileTypeClass = getFileTypeBadgeClass(resource.fileType);

  const courseLabel = course
    ? `${course.code} — ${course.name}`
    : "Unknown Course";

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

      <ResourceHeader
        resource={resource}
        fileType={fileType}
        fileTypeClass={fileTypeClass}
        courseLabel={courseLabel}
        uploaderName={uploader?.name ?? resource.uploadedBy}
        isAdmin={isAdmin}
        onCourseClick={() => course && router.push(`/courses/${course.id}`)}
        averageRating={averageRating}
        userRating={userRating}
        hoverRating={hoverRating}
        hasRated={hasRated}
        onRate={handleRate}
        onHoverRating={setHoverRating}
      />

      {/* Main Content */}
      <div className="mt-7 grid grid-cols-[1fr_320px] gap-7">
        <ResourceFilePreview
          fileType={fileType}
          fileTypeClass={fileTypeClass}
        />

        <ResourceRelated
          relatedResources={relatedResources}
          onSelect={(id) => router.push(`/resources/${id}`)}
        />
      </div>
    </div>
  );
}
