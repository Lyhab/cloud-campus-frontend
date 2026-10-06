import { apiRequest } from "./client";

export type UserStats = {
  coursesJoined: number;
  resourcesUploaded: number;
  totalDownloads: number;
};

export interface User {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  role: "admin" | "student";
  status: "pending" | "active" | "inactive";
  profilePhotoUrl: string | null;
  stats?: UserStats;
  joinedAt: string;
  updatedAt: string;
}

export interface PaginatedUsers {
  data: User[];
  page: number;
  limit: number;
  total: number;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: "admin" | "student";
  status?: "pending" | "active" | "inactive";
  sort?: "alphabetical" | "newest" | "oldest";
}

export interface UpdateUserData {
  firstName?: string;
  middleName?: string | null;
  lastName?: string;
}

export interface ChangeUserRoleData {
  role: "admin" | "student";
}

export interface ChangeUserStatusData {
  status: "active" | "inactive";
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function buildQueryString(query: ListUsersQuery): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined) {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getUsers(
  query: ListUsersQuery = {},
): Promise<PaginatedUsers> {
  return apiRequest<PaginatedUsers>(`/users${buildQueryString(query)}`, {
    method: "GET",
  });
}

export async function getUser(userId: string): Promise<User> {
  return apiRequest<User>(`/users/${userId}`, {
    method: "GET",
  });
}

export async function updateUser(
  userId: string,
  data: UpdateUserData,
  profilePhoto?: File,
): Promise<User> {
  const formData = new FormData();

  if (data.firstName !== undefined) {
    formData.append("firstName", data.firstName);
  }

  if (data.middleName !== undefined) {
    formData.append("middleName", data.middleName ?? "");
  }

  if (data.lastName !== undefined) {
    formData.append("lastName", data.lastName);
  }

  if (profilePhoto) {
    formData.append("profilePhoto", profilePhoto);
  }

  return apiRequest<User>(`/users/${userId}`, {
    method: "PATCH",
    body: formData,
  });
}

export async function changeUserRole(
  userId: string,
  data: ChangeUserRoleData,
): Promise<User> {
  return apiRequest<User>(`/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function changeUserStatus(
  userId: string,
  data: ChangeUserStatusData,
): Promise<User> {
  return apiRequest<User>(`/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function changePassword(
  userId: string,
  data: ChangePasswordData,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/users/${userId}/password`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
