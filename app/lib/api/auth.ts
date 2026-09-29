export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  password: string;
}

const useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(payload?.message ?? "The request could not be completed.");
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function login(input: LoginInput): Promise<void> {
  if (useMockApi) return;
  await postJson("/auth/login", input);
}

export async function register(input: RegisterInput): Promise<void> {
  if (useMockApi) return;
  await postJson("/auth/register", input);
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (useMockApi) return;
  await postJson("/auth/forgot-password", { email });
}

// The supplied API contract does not expose a separate verification endpoint.
// In real-API mode, the code is validated by POST /auth/reset-password.
export async function verifyResetCode(code: string): Promise<void> {
  if (!/^\d{6}$/.test(code)) throw new Error("Enter a valid six-digit code.");
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  if (useMockApi) return;
  await postJson("/auth/reset-password", input);
}
