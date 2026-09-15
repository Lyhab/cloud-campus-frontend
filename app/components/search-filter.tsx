"use client";

import { Search } from "lucide-react";

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  name: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface SearchFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: Filter[];
}

export default function SearchFilter({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
}: SearchFilterProps) {
  return (
    <div className="mb-6 flex w-full items-center gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={17}
          strokeWidth={1.8}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--muted-light)" }}
        />

        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border py-2.5 pl-10 pr-4 text-[14px] outline-none transition-colors focus:border-(--primary)"
          style={{
            borderColor: "var(--border)",
            color: "var(--foreground)",
            backgroundColor: "var(--background)",
          }}
        />
      </div>

      {/* Filters */}
      {filters.map((filter) => (
        <select
          key={filter.name}
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
          className="cursor-pointer rounded-lg border px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:border-(--primary)"
          style={{
            borderColor: "var(--border)",
            color: "var(--foreground)",
            backgroundColor: "var(--background)",
          }}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
