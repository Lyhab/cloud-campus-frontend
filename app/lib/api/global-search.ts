import { courses } from "../data/courses";
import { resources } from "../data/resources";

export interface SearchCourse {
  id: string;
  code: string;
  name: string;
}

export interface SearchResource {
  id: string;
  title: string;
  fileType: string;
  course: SearchCourse;
}

export interface GlobalSearchResults {
  resources: SearchResource[];
  courses: SearchCourse[];
}

interface SearchOptions {
  limit?: number;
  signal?: AbortSignal;
}

const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

function searchMockData(query: string, limit: number): GlobalSearchResults {
  const normalizedQuery = query.toLowerCase();

  const matchedCourses = courses
    .filter(
      (course) =>
        course.code.toLowerCase().includes(normalizedQuery) ||
        course.name.toLowerCase().includes(normalizedQuery),
    )
    .slice(0, limit)
    .map(({ id, code, name }) => ({ id, code, name }));

  const matchedResources = resources
    .filter((resource) => {
      const course = courses.find((item) => item.id === resource.courseId);

      return (
        resource.title.toLowerCase().includes(normalizedQuery) ||
        course?.code.toLowerCase().includes(normalizedQuery) ||
        course?.name.toLowerCase().includes(normalizedQuery)
      );
    })
    .slice(0, limit)
    .flatMap((resource) => {
      const course = courses.find((item) => item.id === resource.courseId);
      if (!course) return [];

      return [
        {
          id: resource.id,
          title: resource.title,
          fileType: resource.fileType.toUpperCase(),
          course: {
            id: course.id,
            code: course.code,
            name: course.name,
          },
        },
      ];
    });

  return { resources: matchedResources, courses: matchedCourses };
}

export async function searchGlobal(
  query: string,
  { limit = 10, signal }: SearchOptions = {},
): Promise<GlobalSearchResults> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return { resources: [], courses: [] };

  if (useMockApi) {
    return searchMockData(trimmedQuery, limit);
  }

  const searchParams = new URLSearchParams({
    q: trimmedQuery,
    limit: String(limit),
  });
  const response = await fetch(`${apiBaseUrl}/search?${searchParams}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Global search failed with status ${response.status}.`);
  }

  return (await response.json()) as GlobalSearchResults;
}
