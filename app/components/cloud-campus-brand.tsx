import Link from "next/link";

interface CloudCampusBrandProps {
  compact?: boolean;
  footer?: boolean;
}

export default function CloudCampusBrand({
  compact = false,
  footer = false,
}: CloudCampusBrandProps) {
  return (
    <Link
      href="/"
      aria-label="Cloud Campus home"
      className={`inline-flex shrink-0 items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-4 ${footer ? "gap-2.5 text-[#94a3b8]" : "gap-3 text-[#0f172a]"}`}
    >
      <span
        className={`flex items-center justify-center bg-[#2563eb] text-white shadow-sm ${
          footer
            ? "size-7 rounded-md"
            : compact
              ? "size-9 rounded-lg"
              : "size-11 rounded-xl sm:size-12"
        }`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={footer ? "size-4" : compact ? "size-5" : "size-7"}>
          <path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 8.7 4.7 4.7 0 0 0 7 18Z" />
        </svg>
      </span>
      <span className={footer ? "text-sm font-normal" : compact ? "text-[17px] font-semibold tracking-[-0.02em]" : "text-xl font-semibold tracking-[-0.02em] sm:text-2xl"}>
        Cloud Campus
      </span>
    </Link>
  );
}
