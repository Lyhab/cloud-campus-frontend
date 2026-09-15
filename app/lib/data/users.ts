import { User } from "../types";

// Each user can be enrolled in multiple courses via courseIds,
// and can bookmark resources across any course via bookmarkedResourceIds.
export const users: User[] = [
  {
    id: "u1",
    name: "Lyhab Rithyny",
    initials: "LR",
    email: "lyhabrithyny@gmail.com",
    role: "student",
    courseIds: ["c6", "c2"],
    bookmarkedResourceIds: ["r1", "r3"],
  },
  {
    id: "u2",
    name: "Mia Patel",
    initials: "MP",
    email: "mia.patel@example.com",
    role: "student",
    courseIds: ["c1"],
    bookmarkedResourceIds: ["r2"],
  },
  {
    id: "u3",
    name: "James Liu",
    initials: "JL",
    email: "james.liu@example.com",
    role: "student",
    courseIds: ["c1", "c3", "c4"],
    bookmarkedResourceIds: [],
  },
  {
    id: "u4",
    name: "Dr. Torres",
    initials: "RT",
    email: "torres@example.com",
    role: "admin",
    courseIds: ["c1"],
    bookmarkedResourceIds: [],
  },
  {
    id: "u5",
    name: "Sarah Kim",
    initials: "SK",
    email: "sarah.kim@example.com",
    role: "student",
    courseIds: ["c2"],
    bookmarkedResourceIds: ["r4"],
  },
  {
    id: "u6",
    name: "Noah Brown",
    initials: "NB",
    email: "noah.brown@example.com",
    role: "student",
    courseIds: ["c3"],
    bookmarkedResourceIds: [],
  },
];

// Derived helper — count how many users are enrolled in a given course.
export function getUserCountForCourse(courseId: string): number {
  return users.filter((u) => u.courseIds.includes(courseId)).length;
}

// Derived helper — get the actual user records for a course (e.g. a class roster).
export function getUsersForCourse(courseId: string): User[] {
  return users.filter((u) => u.courseIds.includes(courseId));
}

// Derived helper — get all courses a given user is enrolled in.
export function getCourseIdsForUser(userId: string): string[] {
  const user = users.find((u) => u.id === userId);
  return user ? user.courseIds : [];
}

// Derived helper — get the resource IDs a given user has bookmarked ("Bookmarks" page).
export function getBookmarkedResourceIdsForUser(userId: string): string[] {
  const user = users.find((u) => u.id === userId);
  return user ? user.bookmarkedResourceIds : [];
}
