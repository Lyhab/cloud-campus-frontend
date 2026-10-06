"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Components
import ResourceHeader from "@/app/components/pages/resources/resource-header";
import ResourceFilePreview from "@/app/components/pages/resources/resource-file-preview";
import ResourceRelated from "@/app/components/pages/resources/resource-related";

// Auth
import { useAuth } from "@/app/context/AuthContext";

// API
import {
  getResource,
  getRelatedResources,
  getResourceRating,
  rateResource,
  bookmarkResource,
  removeBookmark,
  downloadResource,
  updateResourceStatus,
  updateResource,
  type Resource,
  deleteResource,
} from "@/app/lib/api/resources";

// Helpers
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

export default function ResourceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;

  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.role === "admin";

  const [resource, setResource] = useState<Resource | null>(null);
  const [related, setRelated] = useState<Resource[]>([]);

  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [resourceData, relatedData, ratingData] = await Promise.all([
          getResource(resourceId),
          getRelatedResources(resourceId).catch(() => [] as Resource[]),
          user ? getResourceRating(resourceId).catch(() => null) : null,
        ]);

        if (cancelled) return;

        setResource(resourceData);
        setRelated(relatedData.slice(0, 5));
        setUserRating(ratingData?.rating ?? 0);
      } catch (err) {
        if (cancelled) return;
        setResource(null);
        setError(
          err instanceof Error ? err.message : "Failed to load resource.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [resourceId, authLoading, user]);

  async function handleRate(value: number) {
    if (!user || !resource) return;

    const previous = userRating;
    setUserRating(value); // optimistic

    try {
      await rateResource(resource.id, value);

      // Refetch so avgRating / ratingCount come from the server
      const updated = await getResource(resource.id);
      setResource(updated);
    } catch (err) {
      setUserRating(previous);
      setError(err instanceof Error ? err.message : "Failed to rate resource.");
    }
  }

  async function handleToggleBookmark() {
    if (!user || !resource) return;

    const wasBookmarked = resource.isBookmarked;

    setResource({ ...resource, isBookmarked: !wasBookmarked }); // optimistic

    try {
      if (wasBookmarked) {
        await removeBookmark(resource.id);
      } else {
        await bookmarkResource(resource.id);
      }
    } catch (err) {
      setResource((current) =>
        current ? { ...current, isBookmarked: wasBookmarked } : current,
      );
      setError(
        err instanceof Error ? err.message : "Failed to update bookmark.",
      );
    }
  }

  async function handleDownload() {
    if (!resource) return;

    try {
      const blob = await downloadResource(resource.id);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${resource.title}.${resource.fileType.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

      setResource((current) =>
        current ? { ...current, downloads: current.downloads + 1 } : current,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download resource.",
      );
    }
  }

  async function handleUpdateStatus(status: "approved" | "rejected") {
    if (!resource) return;

    try {
      const updated = await updateResourceStatus(resource.id, { status });
      setResource(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  }

  async function handleUpdateResource(data: {
    title: string;
    description: string;
    file?: File;
  }): Promise<boolean> {
    if (!resource) return false;

    try {
      const updated = await updateResource(resource.id, {
        title: data.title,
        description: data.description,
        file: data.file,
      });

      // keep bookmark state, since update responses return isBookmarked: false
      setResource((current) => ({
        ...updated,
        isBookmarked: current?.isBookmarked ?? false,
      }));

      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update resource.",
      );
      return false;
    }
  }

  async function handleDeleteResource(): Promise<boolean> {
    if (!resource) return false;

    try {
      await deleteResource(resource.id);
      router.push("/resources");
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete resource.",
      );
      return false;
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          Loading...
        </span>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            {error ?? "Resource not found"}
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

  const fileType = resource.fileType.toUpperCase();
  const fileTypeClass = getFileTypeBadgeClass(resource.fileType);

  const courseLabel = `${resource.course.code} — ${resource.course.name}`;

  const uploaderName = [
    resource.creator.firstName,
    resource.creator.middleName,
    resource.creator.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const averageRating = Number(resource.avgRating) || 0;

  const isOwner = !isAdmin && Boolean(user) && resource.creator.id === user?.id;

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

      {error && (
        <div
          className="mb-4 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: "var(--danger)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}

      <ResourceHeader
        resource={resource}
        fileType={fileType}
        fileTypeClass={fileTypeClass}
        courseLabel={courseLabel}
        uploaderName={uploaderName}
        isAdmin={isAdmin}
        isAuthenticated={Boolean(user)}
        isOwner={isOwner}
        onCourseClick={() => router.push(`/courses/${resource.course.id}`)}
        averageRating={averageRating}
        ratingCount={resource.ratingCount}
        userRating={userRating}
        hoverRating={hoverRating}
        hasRated={userRating > 0}
        onRate={handleRate}
        onHoverRating={setHoverRating}
        isBookmarked={resource.isBookmarked}
        onToggleBookmark={handleToggleBookmark}
        onDownload={handleDownload}
        onUpdateStatus={handleUpdateStatus}
        onUpdate={handleUpdateResource}
        onDelete={handleDeleteResource}
      />

      {/* Main Content */}
      <div className="mt-7 grid grid-cols-[1fr_320px] gap-7">
        <ResourceFilePreview
          fileType={fileType}
          fileTypeClass={fileTypeClass}
          fileUrl={resource.fileUrl}
          onDownload={handleDownload}
        />

        <ResourceRelated
          relatedResources={related}
          onSelect={(id) => router.push(`/resources/${id}`)}
        />
      </div>
    </div>
  );
}
