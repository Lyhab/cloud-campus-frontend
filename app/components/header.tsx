"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  BookOpen,
  FileText,
  LoaderCircle,
  Menu,
  CheckCheck,
} from "lucide-react";
import {
  searchGlobal,
  type GlobalSearchResults,
} from "@/app/lib/api/global-search";

interface HeaderProps {
  name?: string;
  initials?: string;
  hasNotifications?: boolean;
  onMenuClick?: () => void;
}

type NotificationTone = "info" | "warning" | "success";

interface DashboardNotification {
  id: number;
  title: string;
  description: string;
  time: string;
  href: string;
  tone: NotificationTone;
  read: boolean;
}

const initialNotifications: DashboardNotification[] = [
  {
    id: 1,
    title: "Report awaiting review",
    description: "REST API Cheat Sheet was reported for possible copyright infringement.",
    time: "8 min ago",
    href: "/reports",
    tone: "warning",
    read: false,
  },
  {
    id: 2,
    title: "Resource approved",
    description: "Decision Tree Classification Notes is now available to students.",
    time: "1 hour ago",
    href: "/resources/r5",
    tone: "success",
    read: false,
  },
  {
    id: 3,
    title: "New course activity",
    description: "A new resource was added to Cloud Computing.",
    time: "Yesterday",
    href: "/courses/c1",
    tone: "info",
    read: true,
  },
];

const notificationToneClasses: Record<NotificationTone, string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
  success: "bg-green-600",
};

export default function Header({
  name = "Guest",
  initials = "?",
  hasNotifications = false,
  onMenuClick,
}: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GlobalSearchResults>({
    resources: [],
    courses: [],
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setSearching(true);
      setSearchError("");

      try {
        const results = await searchGlobal(trimmedQuery, {
          limit: 10,
          signal: controller.signal,
        });
        setSearchResults(results);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSearchError("Search is unavailable. Please try again.");
        setSearchResults({ resources: [], courses: [] });
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const hasResults =
    searchResults.resources.length > 0 || searchResults.courses.length > 0;
  const showSearchPanel = searchOpen && query.trim().length >= 2;
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  function openSearchResult(href: string) {
    setSearchOpen(false);
    setQuery("");
    router.push(href);
  }

  function openNotification(notification: DashboardNotification) {
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, read: true } : item,
      ),
    );
    setNotificationsOpen(false);
    router.push(notification.href);
  }

  return (
    <header
      className="flex h-16 w-full shrink-0 items-center gap-2 border-b bg-background px-3 sm:gap-4 sm:px-6"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Search */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-(--muted) hover:bg-(--hover) lg:hidden"
      >
        <Menu size={21} />
      </button>

      <div ref={searchRef} className="relative min-w-0 flex-1 sm:max-w-sm">
        <Search
          size={18}
          strokeWidth={1.7}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--muted)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            setSearchOpen(true);

            if (nextQuery.trim().length < 2) {
              setSearchResults({ resources: [], courses: [] });
              setSearchError("");
              setSearching(false);
            }
          }}
          onFocus={() => setSearchOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSearchOpen(false);
          }}
          placeholder="Search..."
          role="combobox"
          aria-label="Search courses and resources"
          aria-expanded={showSearchPanel}
          aria-controls="global-search-results"
          aria-autocomplete="list"
          className="h-10 w-full rounded-lg border bg-(--muted-background) pl-10 pr-4 text-[15px] outline-none transition-colors duration-200 focus:border-(--primary)"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        />

        {showSearchPanel && (
          <div
            id="global-search-results"
            role="listbox"
            className="absolute left-0 right-0 top-full z-30 mt-2 max-h-[28rem] overflow-y-auto rounded-xl border bg-background p-2 shadow-lg"
            style={{ borderColor: "var(--border)" }}
          >
            {searching ? (
              <div className="flex items-center justify-center gap-2 px-3 py-8 text-sm text-(--muted)">
                <LoaderCircle className="animate-spin" size={17} />
                Searching...
              </div>
            ) : searchError ? (
              <p
                role="alert"
                className="px-3 py-8 text-center text-sm text-(--danger)"
              >
                {searchError}
              </p>
            ) : !hasResults ? (
              <p className="px-3 py-8 text-center text-sm text-(--muted)">
                No courses or resources found.
              </p>
            ) : (
              <>
                {searchResults.resources.length > 0 && (
                  <section aria-labelledby="resource-search-heading">
                    <h2
                      id="resource-search-heading"
                      className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-(--muted)"
                    >
                      Resources
                    </h2>
                    {searchResults.resources.map((resource) => (
                      <button
                        key={resource.id}
                        type="button"
                        role="option"
                        aria-selected="false"
                        onClick={() =>
                          openSearchResult(`/resources/${resource.id}`)
                        }
                        className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-(--hover)"
                      >
                        <FileText
                          className="mt-0.5 shrink-0 text-(--primary)"
                          size={17}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-(--foreground)">
                            {resource.title}
                          </span>
                          <span className="block truncate text-xs text-(--muted)">
                            {resource.course.code} · {resource.fileType}
                          </span>
                        </span>
                      </button>
                    ))}
                  </section>
                )}

                {searchResults.courses.length > 0 && (
                  <section aria-labelledby="course-search-heading">
                    <h2
                      id="course-search-heading"
                      className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-(--muted)"
                    >
                      Courses
                    </h2>
                    {searchResults.courses.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        role="option"
                        aria-selected="false"
                        onClick={() => openSearchResult(`/courses/${course.id}`)}
                        className="flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-(--hover)"
                      >
                        <BookOpen className="mt-0.5 shrink-0 text-(--primary)" size={17} />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-(--foreground)">
                            {course.code}
                          </span>
                          <span className="block truncate text-xs text-(--muted)">
                            {course.name}
                          </span>
                        </span>
                      </button>
                    ))}
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-5">
        {/* Notifications */}
        <div ref={notificationsRef} className="group relative">
          <button
            type="button"
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
            onClick={() => {
              setNotificationsOpen((current) => !current);
              setMenuOpen(false);
            }}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-(--muted) transition-colors duration-200 hover:bg-(--hover)"
          >
            <Bell size={20} strokeWidth={1.7} />
            {(hasNotifications || unreadCount > 0) && (
              <span className="absolute right-1 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-(--primary) px-1 text-[10px] font-semibold leading-4 text-white">
                {unreadCount || 1}
              </span>
            )}
          </button>

          {!notificationsOpen && (
            <span
              role="tooltip"
              className="pointer-events-none absolute right-0 top-full z-30 mt-2 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-md group-hover:block group-focus-within:block"
            >
              Notifications
            </span>
          )}

          {notificationsOpen && (
            <section
              role="dialog"
              aria-label="Notifications"
              className="absolute right-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-(--border) bg-background shadow-lg"
            >
              <div className="flex items-center justify-between gap-3 border-b border-(--border-light) px-4 py-3">
                <div>
                  <h2 className="font-semibold text-(--foreground)">
                    Notifications
                  </h2>
                  <p className="text-xs text-(--muted)">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setNotifications((current) =>
                        current.map((item) => ({ ...item, read: true })),
                      )
                    }
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-(--primary) hover:bg-(--primary-light)"
                  >
                    <CheckCheck size={15} />
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Bell className="mx-auto text-(--muted)" size={24} />
                  <p className="mt-2 text-sm font-medium">You&apos;re all caught up</p>
                  <p className="mt-1 text-xs text-(--muted)">
                    New activity will appear here.
                  </p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto p-2">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={() => openNotification(notification)}
                      className={`flex w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-(--hover) ${
                        notification.read ? "" : "bg-(--primary-light)/60"
                      }`}
                    >
                      <span
                        className={`mt-1.5 size-2.5 shrink-0 rounded-full ${notificationToneClasses[notification.tone]}`}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-(--foreground)">
                          {notification.title}
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-(--muted)">
                          {notification.description}
                        </span>
                        <span className="mt-1 block text-[11px] text-(--muted-light)">
                          {notification.time}
                        </span>
                      </span>
                      {!notification.read && (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-(--primary)" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Avatar + name + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotificationsOpen(false);
            }}
            className="cursor-pointer flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-(--hover)"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-background"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {initials}
            </div>
            <span
              className="hidden whitespace-nowrap text-[15px] font-medium md:inline"
              style={{ color: "var(--foreground)" }}
            >
              {name}
            </span>
            <ChevronDown
              size={16}
              strokeWidth={1.7}
              className={`transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`}
              style={{ color: "var(--muted)" }}
            />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border bg-background py-1.5 shadow-lg"
              style={{ borderColor: "var(--border)" }}
            >
              <Link
                href="/profile"
                className="cursor-pointer flex items-center gap-2.5 px-3.5 py-2 text-[14px] transition-colors duration-200 hover:bg-(--hover)"
                style={{ color: "var(--foreground)" }}
              >
                <User size={16} strokeWidth={1.7} />
                View Profile
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3.5 py-2 text-[14px] transition-colors duration-200 hover:bg-(--hover)"
                style={{ color: "var(--foreground)" }}
              >
                <Settings size={16} strokeWidth={1.7} />
                Settings
              </Link>
              <div
                className="my-1 border-t"
                style={{ borderColor: "var(--border-light)" }}
              />
              <button
                type="button"
                onClick={() => {
                  // TODO: wire up real logout (clear session/cookies, redirect)
                }}
                className="cursor-pointer flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[14px] transition-colors duration-200 hover:bg-(--hover-danger) text-(--danger)"
              >
                <LogOut size={16} strokeWidth={1.7} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
