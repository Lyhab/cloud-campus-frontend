import { apiRequest } from "./client";

export interface Course {
  id: string;
  code: string;
  name: string;
  description: string | null;
  studentCount: number;
  isEnrolled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedCourses {
  data: Course[];
  codes: string[];
  page: number;
  limit: number;
  total: number;
}

export interface ListCoursesQuery {
  page?: number;
  limit?: number;
  search?: string;
  code?: string;
  filter?: "my-courses";
  sort?: "alphabetical" | "newest" | "oldest";
}

export interface CreateCourseData {
  code: string;
  name: string;
  description?: string | null;
}

export interface UpdateCourseData {
  code?: string;
  name?: string;
  description?: string | null;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  joinedAt: string;
}

export interface CourseStudent {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
  enrolledAt: string;
}

export interface PaginatedCourseStudents {
  data: CourseStudent[];
  page: number;
  limit: number;
  total: number;
}

export interface ListCourseStudentsQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "alphabetical" | "newest" | "oldest";
}

export interface EnrollmentMessage {
  message: string;
}

export interface AvailableStudent {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  profilePhotoUrl: string | null;
}

export interface PaginatedAvailableStudents {
  data: AvailableStudent[];
  page: number;
  limit: number;
  total: number;
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

/**
 * List courses.
 *
 * Supports:
 * - pagination
 * - search
 * - course code filter
 * - my-courses filter
 * - sorting
 */
export async function getCourses(
  query: ListCoursesQuery = {},
): Promise<PaginatedCourses> {
  return apiRequest<PaginatedCourses>(`/courses${buildQueryString(query)}`, {
    method: "GET",
  });
}

/**
 * Get a single course.
 */
export async function getCourse(courseId: string): Promise<Course> {
  return apiRequest<Course>(`/courses/${courseId}`, {
    method: "GET",
  });
}

/**
 * List students enrolled in a course.
 */
export async function getCourseStudents(
  courseId: string,
  query: ListCourseStudentsQuery = {},
): Promise<PaginatedCourseStudents> {
  return apiRequest<PaginatedCourseStudents>(
    `/courses/${courseId}/students${buildQueryString(query)}`,
    {
      method: "GET",
    },
  );
}

/**
 * Create a course.
 * Admin only.
 */
export async function createCourse(data: CreateCourseData): Promise<Course> {
  return apiRequest<Course>("/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Enrol the authenticated user in a course.
 */
export async function enrollSelf(courseId: string): Promise<Enrollment> {
  return apiRequest<Enrollment>(`/courses/${courseId}/enrollment`, {
    method: "POST",
  });
}

/**
 * Enrol a specific student in a course.
 * Admin only.
 */
export async function enrollStudents(
  courseId: string,
  userIds: string[],
): Promise<Enrollment[]> {
  return apiRequest<Enrollment[]>(`/courses/${courseId}/students`, {
    method: "POST",
    body: JSON.stringify({ userIds }),
  });
}

/**
 * Update a course.
 * Admin only.
 */
export async function updateCourse(
  courseId: string,
  data: UpdateCourseData,
): Promise<Course> {
  return apiRequest<Course>(`/courses/${courseId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a course.
 * Admin only.
 */
export async function deleteCourse(
  courseId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/courses/${courseId}`, {
    method: "DELETE",
  });
}

/**
 * Unenrol the authenticated user from a course.
 */
export async function unenrollSelf(
  courseId: string,
): Promise<EnrollmentMessage> {
  return apiRequest<EnrollmentMessage>(`/courses/${courseId}/enrollment`, {
    method: "DELETE",
  });
}

/**
 * Unenrol a specific student from a course.
 * Admin only.
 */
export async function unenrollStudent(
  courseId: string,
  userId: string,
): Promise<EnrollmentMessage> {
  return apiRequest<EnrollmentMessage>(
    `/courses/${courseId}/students/${userId}`,
    {
      method: "DELETE",
    },
  );
}

/**
 * List students available for enrollment in a course.
 * Admin only.
 */
export async function getAvailableStudents(
  courseId: string,
  query: ListCourseStudentsQuery = {},
): Promise<PaginatedAvailableStudents> {
  return apiRequest<PaginatedAvailableStudents>(
    `/courses/${courseId}/students/available${buildQueryString(query)}`,
    { method: "GET" },
  );
}
