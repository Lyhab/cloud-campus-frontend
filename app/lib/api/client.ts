const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

type ApiRequestOptions = RequestInit & {
  skipRefresh?: boolean;
};

const EXPIRY_COOKIE = "cc_access_expires_at";
const REFRESH_BUFFER_MS = 30_000;

let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    return response.ok;
  } catch {
    return false;
  }
}

// All concurrent callers share one refresh call
export function refreshSession(): Promise<boolean> {
  refreshPromise ??= doRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export function accessTokenExpiresSoon(): boolean {
  if (typeof document === "undefined") return false;

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${EXPIRY_COOKIE}=(\\d+)`),
  );

  // Cookie missing = expired (browser deleted it) or never logged in.
  // The 401 fallback below handles that case.
  if (!match) return false;

  return Number(match[1]) - Date.now() < REFRESH_BUFFER_MS;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { skipRefresh = false, ...fetchOptions } = options;
  const isFormData = fetchOptions.body instanceof FormData;

  // Proactive refresh: token is about to expire, refresh before requesting
  if (!skipRefresh && !path.startsWith("/auth/") && accessTokenExpiresSoon()) {
    await refreshSession();
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...fetchOptions.headers,
    },
  });

  // Fallback: access token already expired → refresh → retry once
  if (
    response.status === 401 &&
    !skipRefresh &&
    path !== "/auth/refresh" &&
    !path.startsWith("/auth/login")
  ) {
    const refreshed = await refreshSession();

    if (refreshed) {
      return apiRequest<T>(path, {
        ...options,
        skipRefresh: true,
      });
    }

    // Refresh failed → session is dead, send user to sign in
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/sign-in"
    ) {
      // Full reload on purpose: clears all client state when the session dies.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/sign-in";
    }
  }

  if (!response.ok) {
    let message = "An unexpected error occurred.";

    try {
      const error = (await response.json()) as {
        message?: string | string[];
      };

      if (Array.isArray(error.message)) {
        message = error.message.join(", ");
      } else if (error.message) {
        message = error.message;
      }
    } catch {
      // Keep default error message
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
