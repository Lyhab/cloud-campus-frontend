import { apiRequest } from "./client";

export type ResourceView = "admin" | "student";

export type ResourceStatus = "pending" | "approved" | "rejected";

export type ResourceSort =
  | "alphabetical"
  | "newest"
  | "most-downloaded"
  | "top-rated";

export type ResourceFilter = "all" | "bookmarked" | "my-uploads";

export interface ResourceCreator {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
}

export interface ResourceCourse {
  id: string;
  code: string;
  name: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSizeMb: string | null;
  downloads: number;
  status: ResourceStatus;
  avgRating: string;
  ratingCount: number;
  isBookmarked: boolean;
  creator: ResourceCreator;
  course: ResourceCourse;
  uploadedAt: string;
  updatedAt: string;
}

export interface ResourceCourseOption {
  id: string;
  code: string;
  name: string;
}

export interface PaginatedResources {
  data: Resource[];
  courses: ResourceCourseOption[];
  fileTypes: string[];
  page: number;
  limit: number;
  total: number;
}

export interface ListResourcesQuery {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  fileType?: string;
  filter?: ResourceFilter;
  status?: "all" | ResourceStatus;
  sort?: ResourceSort;
  view?: ResourceView;
}

export interface CreateResourceData {
  title: string;
  description?: string | null;
  courseId: string;
  file: File;
}

export interface UpdateResourceData {
  title?: string;
  description?: string | null;
  file?: File;
}

export interface ResourceBookmark {
  userId: string;
  resourceId: string;
  createdAt: string;
  bookmarked: boolean;
}

export interface ResourceRating {
  rating: number;
  resourceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateResourceStatusData {
  status: "approved" | "rejected";
}

export interface DeleteResourceResponse {
  message: string;
}

function buildQueryString<T extends object>(query: T): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

/* =========================
 *  Resources
 * ========================= */

export async function getResources(
  query: ListResourcesQuery = {},
): Promise<PaginatedResources> {
  return apiRequest<PaginatedResources>(
    `/resources${buildQueryString(query)}`,
    {
      method: "GET",
    },
  );
}

export async function getResource(resourceId: string): Promise<Resource> {
  return apiRequest<Resource>(`/resources/${resourceId}`, {
    method: "GET",
  });
}

/* =========================
 *  Download
 * ========================= */

export async function downloadResource(resourceId: string): Promise<Blob> {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

  const response = await fetch(
    `${apiBaseUrl}/resources/${resourceId}/download`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    let message = "Failed to download resource.";

    try {
      const error = (await response.json()) as {
        message?: string | string[];
      };

      if (Array.isArray(error.message)) {
        message = error.message.join(", ");
      } else if (error.message) {
        message = error.message;
      }
    } catch {
      // Response is not JSON.
    }

    throw new Error(message);
  }

  return response.blob();
}

/* =========================
 *  Related Resources
 * ========================= */

export async function getRelatedResources(
  resourceId: string,
): Promise<Resource[]> {
  return apiRequest<Resource[]>(`/resources/${resourceId}/related`, {
    method: "GET",
  });
}

/* =========================
 *  Create
 * ========================= */

export async function createResource(
  data: CreateResourceData,
): Promise<Resource> {
  const formData = new FormData();

  formData.append("title", data.title);
  formData.append("courseId", data.courseId);
  formData.append("file", data.file);

  if (data.description !== undefined && data.description !== null) {
    formData.append("description", data.description);
  }

  return apiRequest<Resource>("/resources", {
    method: "POST",
    body: formData,
  });
}

/* =========================
 *  Update
 * ========================= */

export async function updateResource(
  resourceId: string,
  data: UpdateResourceData,
): Promise<Resource> {
  const formData = new FormData();

  if (data.title !== undefined) {
    formData.append("title", data.title);
  }

  if (data.description !== undefined) {
    if (data.description !== null) {
      formData.append("description", data.description);
    } else {
      formData.append("description", "");
    }
  }

  if (data.file !== undefined) {
    formData.append("file", data.file);
  }

  return apiRequest<Resource>(`/resources/${resourceId}`, {
    method: "PATCH",
    body: formData,
  });
}

/* =========================
 *  Delete
 * ========================= */

export async function deleteResource(
  resourceId: string,
): Promise<DeleteResourceResponse> {
  return apiRequest<DeleteResourceResponse>(`/resources/${resourceId}`, {
    method: "DELETE",
  });
}

/* =========================
 *  Bookmarks
 * ========================= */

export async function bookmarkResource(
  resourceId: string,
): Promise<ResourceBookmark> {
  return apiRequest<ResourceBookmark>(`/resources/${resourceId}/bookmark`, {
    method: "POST",
  });
}

export async function removeBookmark(
  resourceId: string,
): Promise<ResourceBookmark> {
  return apiRequest<ResourceBookmark>(`/resources/${resourceId}/bookmark`, {
    method: "DELETE",
  });
}

/* =========================
 *  Ratings
 * ========================= */

export async function getResourceRating(
  resourceId: string,
): Promise<ResourceRating | null> {
  return apiRequest<ResourceRating | null>(`/resources/${resourceId}/rating`, {
    method: "GET",
  });
}

export async function rateResource(
  resourceId: string,
  rating: number,
): Promise<ResourceRating> {
  return apiRequest<ResourceRating>(`/resources/${resourceId}/rating`, {
    method: "POST",
    body: JSON.stringify({
      rating,
    }),
  });
}

/* =========================
 *  Admin Status
 * ========================= */

export async function updateResourceStatus(
  resourceId: string,
  data: UpdateResourceStatusData,
): Promise<Resource> {
  return apiRequest<Resource>(`/resources/${resourceId}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
