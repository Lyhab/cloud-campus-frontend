"use client";

import { useEffect } from "react";
import { refreshSession, accessTokenExpiresSoon } from "@/app/lib/api/client";

const REFRESH_INTERVAL_MS = 50 * 60 * 1000;

export function SessionRefresher() {
  useEffect(() => {
    const id = setInterval(refreshSession, REFRESH_INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;

      // Cookie gone (expired while asleep) or about to expire → refresh.
      // Otherwise the token is still fine, so do nothing.
      const hasExpiryCookie = document.cookie.includes("cc_access_expires_at=");
      if (!hasExpiryCookie || accessTokenExpiresSoon()) {
        refreshSession();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
