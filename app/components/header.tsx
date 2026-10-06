"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Loader2,
} from "lucide-react";

import { logout } from "../lib/api/auth";
import { search, type SearchResponse } from "../lib/api/search";
import { useAuth } from "../context/AuthContext";
import { getFileTypeBadgeClass } from "@/app/lib/get-file-type-badge-class";

interface HeaderProps {
  name?: string;
  initials?: string;
  hasNotifications?: boolean;
}

interface SearchItem {
  key: string;
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeClass?: string;
  badgeStyle?: "course";
}

interface SearchSection {
  label: string;
  items: SearchItem[];
}

const MIN_QUERY_LENGTH = 2;
const RESULTS_PER_SECTION = 5;

function buildSections(data: SearchResponse): SearchSection[] {
  const sections: SearchSection[] = [
    {
      label: "Resources",
      items: data.resources.map((resource) => ({
        key: `resource-${resource.id}`,
        href: `/resources/${resource.id}`,
        title: resource.title,
        subtitle: `${resource.course.code} ${resource.course.name}`,
        badge: resource.fileType.toUpperCase(),
        badgeClass: getFileTypeBadgeClass(resource.fileType),
      })),
    },

    {
      label: "Courses",
      items: data.courses.map((course) => ({
        key: `course-${course.id}`,
        href: `/courses/${course.id}`,
        title: course.name,
        badge: course.code,
        badgeStyle: "course" as const,
      })),
    },
  ];

  // Admin only
  if (data.reports) {
    sections.push({
      label: "Reports",
      items: data.reports.map((report) => ({
        key: `report-${report.id}`,
        href: `/reports/${report.id}`,
        title: report.resource.title,
        subtitle: report.reason,
        badge: report.status.charAt(0).toUpperCase() + report.status.slice(1),
        badgeClass:
          report.status === "pending"
            ? "bg-(--pending-light) text-(--pending)"
            : report.status === "resolved"
              ? "bg-(--success-light) text-(--success)"
              : "bg-(--smoke) text-(--muted)",
      })),
    });
  }

  // Admin only
  if (data.users) {
    sections.push({
      label: "Users",
      items: data.users.map((u) => ({
        key: `user-${u.id}`,
        href: `/profile/${u.id}`,
        title: `${u.firstName} ${u.lastName}`,
        subtitle: u.email,
        badge: u.role === "admin" ? "Admin" : "Student",
        badgeClass:
          u.role === "admin"
            ? "bg-(--purple-light) text-(--purple)"
            : "bg-(--primary-light) text-(--primary)",
      })),
    });
  }

  return sections.filter((section) => section.items.length > 0);
}

export default function Header({
  name = "Guest",
  initials = "?",
  hasNotifications = false,
}: HeaderProps) {
  const router = useRouter();

  const { user, isAuthenticated, clearUser } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = debouncedQuery.trim();
  const hasQuery = trimmedQuery.length >= MIN_QUERY_LENGTH;

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Run search
  useEffect(() => {
    if (!isAuthenticated || !hasQuery) {
      return;
    }

    let cancelled = false;

    async function runSearch() {
      try {
        setSearchLoading(true);
        setSearchError(null);

        const response = await search({
          q: trimmedQuery,
          limit: RESULTS_PER_SECTION,
        });

        if (cancelled) return;

        setResults(response);
        setActiveIndex(-1);
      } catch (err) {
        if (cancelled) return;

        setResults(null);
        setSearchError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }

    void runSearch();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, hasQuery, trimmedQuery]);

  const sections = useMemo(
    () => (results ? buildSections(results) : []),
    [results],
  );

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items),
    [sections],
  );

  function closeSearch() {
    setSearchOpen(false);
    setActiveIndex(-1);
  }

  function openResult(href: string) {
    closeSearch();
    setQuery("");
    setDebouncedQuery("");
    router.push(href);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      closeSearch();
      return;
    }

    if (flatItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setActiveIndex((index) => (index + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();

      setActiveIndex((index) =>
        index <= 0 ? flatItems.length - 1 : index - 1,
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      openResult(flatItems[activeIndex].href);
    }
  }

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setMenuOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearUser();
      router.push("/");
      router.refresh();
      setIsLoggingOut(false);
    }
  }

  const displayName = user
    ? [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ")
    : name;

  const displayInitials = user
    ? [user.firstName, user.lastName]
        .filter(Boolean)
        .map((value) => value[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : initials;

  const showPanel = searchOpen && isAuthenticated && query.trim().length > 0;

  let itemIndex = -1;

  return (
    <header
      className="flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-6"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Search */}
      {isAuthenticated ? (
        <div ref={searchRef} className="relative w-full max-w-sm">
          <Search
            size={18}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--muted)" }}
          />

          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search anything..."
            className="h-10 w-full rounded-lg border bg-(--muted-background) pl-10 pr-10 text-[15px] outline-none transition-colors duration-200 focus:border-(--primary)"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
            }}
          />

          {searchLoading && (
            <Loader2
              size={16}
              strokeWidth={1.8}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
              style={{ color: "var(--muted)" }}
            />
          )}

          {/* Search results */}
          {showPanel && (
            <div
              className="absolute left-0 top-full z-30 mt-2 max-h-[70vh] w-md overflow-y-auto rounded-lg border bg-background shadow-lg"
              style={{ borderColor: "var(--border)" }}
            >
              {!hasQuery ? (
                <p
                  className="px-4 py-6 text-center text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  Type at least {MIN_QUERY_LENGTH} characters to search.
                </p>
              ) : searchError ? (
                <p
                  className="px-4 py-6 text-center text-[13px]"
                  style={{ color: "var(--danger, #e53e3e)" }}
                >
                  {searchError}
                </p>
              ) : sections.length === 0 ? (
                <p
                  className="px-4 py-6 text-center text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  {searchLoading
                    ? "Searching..."
                    : `No results for "${trimmedQuery}".`}
                </p>
              ) : (
                sections.map((section) => (
                  <div key={section.label}>
                    <div
                      className="sticky top-0 z-10 border-b bg-background px-4 py-2 text-[11px] font-semibold uppercase tracking-wide"
                      style={{
                        borderColor: "var(--border)",
                        color: "var(--muted)",
                      }}
                    >
                      {section.label}
                    </div>

                    {section.items.map((item) => {
                      itemIndex += 1;

                      const index = itemIndex;
                      const isActive = index === activeIndex;

                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => openResult(item.href)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={`flex w-full cursor-pointer items-center gap-3 border-b border-(--border-light) px-4 py-2.5 text-left transition-colors ${
                            isActive ? "bg-(--hover)" : ""
                          }`}
                        >
                          {item.badge && (
                            <div className="flex w-16 shrink-0 justify-start">
                              <span
                                className={`rounded-md px-2 py-2 text-[11px] font-semibold ${
                                  item.badgeStyle === "course"
                                    ? ""
                                    : `text-[10px] font-bold ${
                                        item.badgeClass ?? ""
                                      }`
                                }`}
                                style={
                                  item.badgeStyle === "course"
                                    ? {
                                        backgroundColor: "var(--primary-light)",
                                        color: "var(--primary)",
                                      }
                                    : item.badgeClass
                                      ? undefined
                                      : {
                                          backgroundColor: "var(--smoke)",
                                          color: "var(--muted)",
                                        }
                                }
                              >
                                {item.badge}
                              </span>
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p
                              className="truncate text-[14px] font-medium"
                              style={{
                                color: "var(--foreground)",
                              }}
                            >
                              {item.title}
                            </p>

                            {item.subtitle && (
                              <p
                                className="mt-0.5 truncate text-[12px]"
                                style={{
                                  color: "var(--muted)",
                                }}
                              >
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div />
      )}

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-5">
        {/* Notification bell */}
        <button
          type="button"
          title="Notifications"
          className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200 hover:bg-(--hover)"
          style={{ color: "var(--muted)" }}
        >
          <Bell size={20} strokeWidth={1.7} />

          {hasNotifications && (
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full"
              style={{
                backgroundColor: "var(--primary)",
              }}
            />
          )}
        </button>

        {/* Avatar + name + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-(--hover)"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-background"
              style={{
                backgroundColor: "var(--primary)",
              }}
            >
              {user?.profilePhotoUrl ? (
                <Image
                  src={user.profilePhotoUrl}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                />
              ) : (
                displayInitials
              )}
            </div>

            <span
              className="whitespace-nowrap text-[15px] font-medium"
              style={{ color: "var(--foreground)" }}
            >
              {displayName}
            </span>

            <ChevronDown
              size={16}
              strokeWidth={1.7}
              className={`transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
              style={{ color: "var(--muted)" }}
            />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border bg-background py-1.5 shadow-lg"
              style={{ borderColor: "var(--border)" }}
            >
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex cursor-pointer items-center gap-2.5 px-3.5 py-2 text-[14px] transition-colors duration-200 hover:bg-(--hover)"
                    style={{
                      color: "var(--foreground)",
                    }}
                  >
                    <User size={16} strokeWidth={1.7} />
                    View Profile
                  </Link>

                  <button
                    type="button"
                    disabled
                    title="Settings are not available yet"
                    className="flex w-full cursor-not-allowed items-center gap-2.5 px-3.5 py-2 text-left text-[14px] opacity-50"
                    style={{
                      color: "var(--foreground)",
                    }}
                  >
                    <Settings size={16} strokeWidth={1.7} />
                    Settings
                  </button>

                  <div
                    className="my-1 border-t"
                    style={{
                      borderColor: "var(--border-light)",
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full cursor-pointer items-center gap-2.5 px-3.5 py-2 text-left text-[14px] text-(--danger) transition-colors duration-200 hover:bg-(--hover-danger) disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut size={16} strokeWidth={1.7} />

                    {isLoggingOut ? "Logging out..." : "Log out"}
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-[14px] transition-colors duration-200 hover:bg-(--hover)"
                  style={{
                    color: "var(--foreground)",
                  }}
                >
                  <User size={16} strokeWidth={1.7} />
                  Sign in
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
