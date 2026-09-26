interface DashboardIconProps {
  name: "home" | "book" | "file" | "bookmark" | "upload" | "user" | "search" | "bell" | "logout" | "download";
  className?: string;
}

export default function DashboardIcon({ name, className = "size-5" }: DashboardIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {name === "home" && <path d="m3 11 9-8 9 8v10h-6v-7H9v7H3V11Z" />}
      {name === "book" && <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm0 13a2 2 0 0 1 2-2h12" />}
      {name === "file" && <path d="M6 3h8l4 4v14H6V3Zm8 0v5h4" />}
      {name === "bookmark" && <path d="M6 3h12v18l-6-4-6 4V3Z" />}
      {name === "upload" && <path d="M12 16V3m0 0L7 8m5-5 5 5M5 14v6h14v-6" />}
      {name === "user" && <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />}
      {name === "search" && <path d="m21 21-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />}
      {name === "bell" && <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Zm-8 12h4" />}
      {name === "logout" && <path d="M10 5H4v14h6m4-4 4-3-4-3m4 3H9" />}
      {name === "download" && <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 18v3h14v-3" />}
    </svg>
  );
}
