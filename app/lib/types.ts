export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: "admin" | "student";
  courseIds: string[]; // links this user (enrollments) to one or more courses
  bookmarkedResourceIds: string[]; // resources this user has bookmarked
}

export interface Resource {
  id: string;
  courseId: string; // links this resource to a course
  title: string;
  fileType: "pdf" | "pptx" | "docx" | "xlsx";
  uploadedBy: string; // userId of the uploader (references User.id)
  uploadedAt: string;
  fileSizeMb: number;
  downloads: number;
  rating: number;
}
