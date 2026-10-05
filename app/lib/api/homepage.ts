import { apiRequest } from "./client";

export interface HomepageStats {
  totalStudents: number;
  totalCourses: number;
  totalResources: number;
  totalDownloads: number;
}

export async function getHomepageStats(): Promise<HomepageStats> {
  return apiRequest<HomepageStats>("/homepage", {
    method: "GET",
    skipRefresh: true,
  });
}
