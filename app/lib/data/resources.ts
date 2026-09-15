import { Resource } from "../types";

export const resources: Resource[] = [
  {
    id: "r1",
    courseId: "c1",
    title: "REST API Cheat Sheet",
    fileType: "pdf",
    uploadedBy: "u3", // James Liu
    uploadedAt: "2024-11-20",
    fileSizeMb: 0.9,
    downloads: 445,
    rating: 4.9,
  },
  {
    id: "r2",
    courseId: "c1",
    title: "AWS S3 Study Notes",
    fileType: "pdf",
    uploadedBy: "u1", // Lyhab Rithyny
    uploadedAt: "2024-11-12",
    fileSizeMb: 2.4,
    downloads: 312,
    rating: 4.8,
  },
  {
    id: "r3",
    courseId: "c1",
    title: "Week 4 Cloud Architecture.",
    fileType: "pptx",
    uploadedBy: "u2", // Mia Patel
    uploadedAt: "2024-11-18",
    fileSizeMb: 8.1,
    downloads: 198,
    rating: 4.5,
  },
  {
    id: "r4",
    courseId: "c2",
    title: "Clustering Algorithms Overview",
    fileType: "pdf",
    uploadedBy: "u5", // Sarah Kim
    uploadedAt: "2024-10-05",
    fileSizeMb: 1.6,
    downloads: 120,
    rating: 4.6,
  },
];

// Derived helper — count how many resources belong to a course.
export function getResourceCountForCourse(courseId: string): number {
  return resources.filter((r) => r.courseId === courseId).length;
}

// Derived helper — get the actual resource records for a course.
export function getResourcesForCourse(courseId: string): Resource[] {
  return resources.filter((r) => r.courseId === courseId);
}

// Derived helper — get all resources uploaded by a given user ("My Uploads" page).
export function getResourcesUploadedByUser(userId: string): Resource[] {
  return resources.filter((r) => r.uploadedBy === userId);
}
