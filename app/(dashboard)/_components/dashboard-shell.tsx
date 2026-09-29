"use client";

import { useState } from "react";
import Header from "@/app/components/header";
import Sidebar from "@/app/components/sidebar";
import type { User } from "@/app/lib/types";

interface DashboardShellProps {
  children: React.ReactNode;
  role: User["role"];
  name: string;
  initials: string;
}

export default function DashboardShell({
  children,
  role,
  name,
  initials,
}: DashboardShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <div className="flex h-dvh overflow-hidden">
      {mobileNavigationOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileNavigationOpen(false)}
          className="fixed inset-0 z-40 cursor-default bg-slate-950/35 lg:hidden"
        />
      )}

      <Sidebar
        role={role}
        mobileOpen={mobileNavigationOpen}
        onNavigate={() => setMobileNavigationOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          name={name}
          initials={initials}
          onMenuClick={() => setMobileNavigationOpen(true)}
        />
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
