"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Bookmark,
  UploadCloud,
  ChevronsLeft,
} from "lucide-react";
import type { User } from "../lib/types";

const adminNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Resources", href: "/resources", icon: FileText },
  { label: "Users", href: "/users", icon: Users },
  { label: "Reports", href: "/reports", icon: BarChart3 },
];

const studentNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Resources", href: "/resources", icon: FileText },
  {
    label: "Bookmarks",
    href: "/resources?filter=bookmarked",
    icon: Bookmark,
  },
  {
    label: "My Uploads",
    href: "/resources?filter=my-uploads",
    icon: UploadCloud,
  },
];

interface SidebarProps {
  role: User["role"];
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  let navItems;
  if (role === "admin") {
    navItems = adminNavItems;
  } else {
    navItems = studentNavItems;
  }

  const activeIndex = navItems.findIndex(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  const backgroundIndex =
    hoveredIndex !== null ? hoveredIndex : Math.max(activeIndex, 0);

  return (
    <aside
      className={`flex h-screen flex-col border-r bg-background transition-[width] duration-300 ease-in-out ${
        collapsed ? "w-20" : "w-64"
      }`}
      style={{ borderColor: "var(--border)" }}
    >
      {/* Logo */}
      <div
        className="flex h-16 shrink-0 items-center border-b pl-6 pr-5"
        style={{ borderColor: "var(--border-light)" }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-background"
          style={{ backgroundColor: "var(--primary)" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 8.7 4.7 4.7 0 0 0 7 18Z" />
          </svg>
        </div>

        <span
          className={`ml-3 whitespace-nowrap text-[17px] font-semibold transition-[opacity,width] duration-200 ${
            collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"
          }`}
          style={{ color: "var(--foreground)" }}
        >
          Cloud Campus
        </span>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-3 py-6"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <div className="relative space-y-1">
          {/* Animated active/hover background */}
          <div
            className="pointer-events-none absolute left-0 right-0 h-10 rounded-lg transition-transform duration-300 ease-out"
            style={{
              backgroundColor: "var(--primary-light)",
              transform: `translateY(${backgroundIndex * 44}px)`,
            }}
          />

          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeIndex;

            return (
              <Link
                key={item.label}
                href={item.href}
                title={collapsed ? item.label : undefined}
                onMouseEnter={() => setHoveredIndex(index)}
                className="relative z-10 flex h-10 items-center rounded-lg px-3 text-[15px] transition-colors duration-200"
                style={{
                  color:
                    isActive || hoveredIndex === index
                      ? "var(--primary)"
                      : "var(--muted)",
                }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                  <Icon size={20} strokeWidth={1.7} />
                </span>

                <span
                  className={`ml-1 whitespace-nowrap transition-[opacity,width] duration-200 ${
                    collapsed
                      ? "w-0 overflow-hidden opacity-0"
                      : "w-auto opacity-100"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Collapse / Expand */}
      <div
        className="shrink-0 border-t p-2.5"
        style={{ borderColor: "var(--border-light)" }}
      >
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="cursor-pointer flex h-10 w-full items-center rounded-lg border border-transparent px-3 transition-colors duration-200 hover:bg-(--hover) hover:border-(--border)"
          style={{ color: "var(--muted)" }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <ChevronsLeft
              size={20}
              strokeWidth={1.7}
              className={`shrink-0 transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
          </span>

          <span
            className={`whitespace-nowrap text-[15px] transition-[opacity,width] duration-200 ${
              collapsed ? "w-0 overflow-hidden opacity-0" : "w-auto opacity-100"
            }`}
          >
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
