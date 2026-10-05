import { apiRequest } from "./client";

export interface DashboardAdminStats {
  totalUsers: number;
  totalCourses: number;
  totalResources: number;
  pendingReports: number;
}

export interface DashboardStudentStats {
  myCourses: number;
  myUploads: number;
  bookmarked: number;
  totalResources: number;
}

export type DashboardStats = DashboardAdminStats | DashboardStudentStats;

export interface UploadStatsItem {
  label: string;
  value: number;
}

export interface RecentResource {
  id: string;
  title: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
  fileType: string;
  uploadedBy: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
  uploadedAt: string;
}

export interface NewUser {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  joinedAt: string;
}

export interface PendingReport {
  id: string;
  resource: {
    id: string;
    title: string;
  };
  reporter: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
  reason: string;
  date: string;
}

export interface MyCourse {
  id: string;
  code: string;
  name: string;
  description: string;
  resourceCount: number;
}

export interface DashboardResource {
  id: string;
  title: string;
  fileType: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
  uploadedBy: {
    id: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
  };
  downloads: number;
  rating: number;
  ratingCount: number;
}

export interface UploadStatsQuery {
  period?: string;
}

export interface RecentResourcesQuery {
  limit?: number;
  sort?: "newest" | "oldest";
}

export interface NewUsersQuery {
  limit?: number;
  sort?: "newest" | "oldest";
}

export interface PendingReportsQuery {
  limit?: number;
  sort?: "newest" | "oldest";
  status?: string;
}

export interface DashboardResourcesQuery {
  limit?: number;
  minRatingCount?: number;
  sort?: "rating" | "downloads" | "newest";
}

function buildQueryString(query: object): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiRequest<DashboardStats>("/dashboard/stats", {
    method: "GET",
  });
}

export async function getUploadStats(
  query: UploadStatsQuery = {},
): Promise<UploadStatsItem[]> {
  return apiRequest<UploadStatsItem[]>(
    `/dashboard/upload-stats${buildQueryString(query)}`,
    {
      method: "GET",
    },
  );
}

export async function getRecentResources(
  query: RecentResourcesQuery = {},
): Promise<RecentResource[]> {
  return apiRequest<RecentResource[]>(
    `/dashboard/recent-resources${buildQueryString(query)}`,
    {
      method: "GET",
    },
  );
}

export async function getNewUsers(
  query: NewUsersQuery = {},
): Promise<NewUser[]> {
  return apiRequest<NewUser[]>(
    `/dashboard/new-users${buildQueryString(query)}`,
    {
      method: "GET",
    },
  );
}

export async function getPendingReports(
  query: PendingReportsQuery = {},
): Promise<PendingReport[]> {
  return apiRequest<PendingReport[]>(
    `/dashboard/pending-reports${buildQueryString(query)}`,
    {
      method: "GET",
    },
  );
}

export async function getMyCourses(): Promise<MyCourse[]> {
  return apiRequest<MyCourse[]>("/dashboard/my-courses", {
    method: "GET",
  });
}

export async function getDashboardResources(
  query: DashboardResourcesQuery = {},
): Promise<DashboardResource[]> {
  return apiRequest<DashboardResource[]>(
    `/dashboard/resources${buildQueryString(query)}`,
    {
      method: "GET",
    },
  );
}
