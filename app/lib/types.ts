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
  joinedAt: string;
  status: "active" | "disabled";
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

export interface Report {
  id: string;
  resourceId: string; // references Resource.id
  reporterId: string; // userId of the reporter (references User.id)
  reason: string;
  date: string;
  status: "pending" | "dismissed" | "resolved";
}
