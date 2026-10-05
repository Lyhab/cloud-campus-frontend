"use client";

import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { useAuth } from "../context/AuthContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  const role = user?.role ?? "student";

  const name = user ? `${user.firstName} ${user.lastName}` : "Guest";

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />

      <div className="flex min-h-0 flex-1 flex-col">
        <Header
          name={isLoading ? "Loading..." : name}
          initials={isLoading ? "..." : initials}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
