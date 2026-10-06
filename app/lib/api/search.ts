import { apiRequest } from "./client";

export interface SearchResourceCourse {
  id: string;
  code: string;
  name: string;
}

export interface SearchResourceResult {
  id: string;
  title: string;
  fileType: string;
  course: SearchResourceCourse;
}

export interface SearchCourseResult {
  id: string;
  code: string;
  name: string;
}

/**
 * Admin only.
 */
export interface SearchReportResult {
  id: string;
  reason: string;
  status: "pending" | "dismissed" | "resolved";
  resource: {
    id: string;
    title: string;
  };
}

/**
 * Admin only.
 */
export interface SearchUserResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
}

export interface SearchResponse {
  resources: SearchResourceResult[];
  courses: SearchCourseResult[];

  /*
   * Only returned for admins.
   */
  reports?: SearchReportResult[];
  users?: SearchUserResult[];
}

export interface SearchQuery {
  q: string;
  limit?: number;
}

function buildQueryString(
  query: Record<string, string | number | undefined>,
): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

/**
 * Search resources and courses.
 * Admins also receive matching reports and users.
 * Authenticated users only.
 */
export async function search(query: SearchQuery): Promise<SearchResponse> {
  const queryString = buildQueryString({
    q: query.q.trim(),
    limit: query.limit,
  });

  return apiRequest<SearchResponse>(`/search${queryString}`, {
    method: "GET",
  });
}
