import Image from "next/image";
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
        className={`flex shrink-0 items-center justify-center bg-[#2563eb] shadow-sm ${
          footer
            ? "size-7 rounded-md"
            : compact
              ? "size-9 rounded-lg"
              : "size-11 rounded-xl sm:size-12"
        }`}
      >
        <Image
          src="/cloud-campus-logo.png"
          alt=""
          width={96}
          height={96}
          priority={!footer}
          className={`object-contain ${footer ? "size-5" : compact ? "size-6" : "size-8"}`}
        />
      </span>
      <span
        className={
          footer
            ? "text-sm font-normal"
            : compact
              ? "text-[17px] font-semibold tracking-[-0.02em]"
              : "text-xl font-semibold tracking-[-0.02em] sm:text-2xl"
        }
      >
        Cloud Campus
      </span>
    </Link>
  );
}
