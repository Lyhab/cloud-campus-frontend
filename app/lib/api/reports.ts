import { apiRequest } from "./client";

export type ReportStatus = "pending" | "dismissed" | "resolved";

export type ReportSort = "newest" | "oldest";

export interface ReportResourceCreator {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
}

export interface ReportResourceCourse {
  id: string;
  code: string;
  name: string;
}

export interface ReportResource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string;
  fileSizeMb: string | null;
  downloads: number;
  status: string;
  avgRating: string;
  ratingCount: number;
  isBookmarked: boolean;
  creator: ReportResourceCreator;
  course: ReportResourceCourse;
  uploadedAt: string;
  updatedAt: string;
}

export interface ReportReporter {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
}

export interface Report {
  id: string;
  reason: string;
  status: ReportStatus;
  resource: ReportResource;
  reporter: ReportReporter;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedReports {
  data: Report[];
  pendingCount: number;
  page: number;
  limit: number;
  total: number;
}

export interface ListReportsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ReportStatus | "all";
  sort?: ReportSort;
}

export interface CreateReportData {
  resourceId: string;
  reason: string;
}

export interface UpdateReportStatusData {
  status: "dismissed" | "resolved";
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
 * Get paginated reports.
 * Admin only.
 */
export async function getReports(
  query: ListReportsQuery = {},
): Promise<PaginatedReports> {
  const queryString = buildQueryString({
    page: query.page,
    limit: query.limit,
    search: query.search,
    status: query.status,
    sort: query.sort,
  });

  return apiRequest<PaginatedReports>(`/reports${queryString}`);
}

/**
 * Get a single report by ID.
 * Admin only.
 */
export async function getReport(reportId: string): Promise<Report> {
  return apiRequest<Report>(`/reports/${reportId}`);
}

/**
 * Create a report for a resource.
 * Authenticated users only.
 */
export async function createReport(data: CreateReportData): Promise<Report> {
  return apiRequest<Report>("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Dismiss or resolve a report.
 * Admin only.
 */
export async function updateReportStatus(
  reportId: string,
  data: UpdateReportStatusData,
): Promise<Report> {
  return apiRequest<Report>(`/reports/${reportId}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
