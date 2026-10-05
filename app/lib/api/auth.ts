import { apiRequest } from "./client";

export interface RegisterPayload {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ConfirmEmailPayload {
  email: string;
  code: string;
}

export interface ResendConfirmationPayload {
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface MessageResponse {
  message: string;
}

// TODO: match what authService.getMe() returns
export interface CurrentUser {
  [key: string]: unknown;
}

export async function register(
  payload: RegisterPayload,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipRefresh: true,
  });
}

export async function confirmEmail(
  payload: ConfirmEmailPayload,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/confirm-email", {
    method: "POST",
    body: JSON.stringify(payload),
    skipRefresh: true,
  });
}

export async function resendConfirmationCode(
  payload: ResendConfirmationPayload,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/resend-code", {
    method: "POST",
    body: JSON.stringify(payload),
    skipRefresh: true,
  });
}

export async function login(payload: LoginPayload): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
    skipRefresh: true,
  });
}

export async function getMe(): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/auth/me", {
    method: "GET",
  });
}

export async function logout(): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/logout", {
    method: "POST",
    skipRefresh: true,
  });
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipRefresh: true,
  });
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
    skipRefresh: true,
  });
}
