"use client";

import { useEffect, useRef, useState } from "react";
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface HeaderProps {
  name?: string;
  initials?: string;
  hasNotifications?: boolean;
}

export default function Header({
  name = "Guest",
  initials = "?",
  hasNotifications = false,
}: HeaderProps) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="flex h-16 w-full shrink-0 items-center justify-between border-b bg-background px-6"
      style={{ borderColor: "var(--border)" }}
    >
      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search
          size={18}
          strokeWidth={1.7}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--muted)" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search anything..."
          className="h-10 w-full rounded-lg border bg-(--muted-background) pl-10 pr-4 text-[15px] outline-none transition-colors duration-200 focus:border-(--primary)"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        />
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-5">
        {/* Notification bell */}
        <button
          type="button"
          title="Notifications"
          className="cursor-pointer relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-(--hover)"
          style={{ color: "var(--muted)" }}
        >
          <Bell size={20} strokeWidth={1.7} />
          {hasNotifications && (
            <span
              className="absolute right-2 top-2 h-2 w-2 rounded-full"
              style={{ backgroundColor: "var(--primary)" }}
            />
          )}
        </button>

        {/* Avatar + name + dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="cursor-pointer flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-200 hover:bg-(--hover)"
          >
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-background"
              style={{ backgroundColor: "var(--primary)" }}
            >
              {initials}
            </div>
            <span
              className="whitespace-nowrap text-[15px] font-medium"
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
              <a
                href="/profile"
                className="cursor-pointer flex items-center gap-2.5 px-3.5 py-2 text-[14px] transition-colors duration-200 hover:bg-(--hover)"
                style={{ color: "var(--foreground)" }}
              >
                <User size={16} strokeWidth={1.7} />
                View Profile
              </a>
              <a
                href="/settings"
                className="cursor-pointer flex items-center gap-2.5 px-3.5 py-2 text-[14px] transition-colors duration-200 hover:bg-(--hover)"
                style={{ color: "var(--foreground)" }}
              >
                <Settings size={16} strokeWidth={1.7} />
                Settings
              </a>
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
