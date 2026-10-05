import { User } from "lucide-react";
import { formatDateTime } from "@/app/lib/format-date";

interface DashboardNewUsersProps {
  users: {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
  }[];
  onOpen: (id: string) => void;
}

export default function DashboardNewUsers({
  users,
  onOpen,
}: DashboardNewUsersProps) {
  return (
    <div
      className="h-full overflow-y-auto overflow-x-hidden rounded-xl border bg-background shadow-even-sm"
      style={{ borderColor: "var(--border)" }}
    >
      {users.length === 0 ? (
        <div
          className="px-6 py-10 text-center text-[14px]"
          style={{ color: "var(--muted)" }}
        >
          No new users found.
        </div>
      ) : (
        users.map((user) => (
          <button
            key={user.id}
            type="button"
            onClick={() => onOpen(user.id)}
            className="flex h-22 w-full shrink-0 cursor-pointer items-center gap-4 border-b px-6 py-4 text-left transition-colors duration-150 last:border-b-0 hover:bg-(--hover)"
            style={{ borderColor: "var(--border-light)" }}
          >
            {/* User Icon */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--purple-light)",
                color: "var(--purple)",
              }}
            >
              <User size={18} strokeWidth={1.7} />
            </div>

            {/* User Details */}
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-[13px] font-medium"
                style={{ color: "var(--foreground)" }}
                title={user.name}
              >
                {user.name}
              </p>

              <p
                className="mt-1 truncate text-[12px]"
                style={{ color: "var(--muted)" }}
                title={user.email}
              >
                {user.email}
              </p>
            </div>

            {/* Date */}
            <span
              className="shrink-0 text-[12px]"
              style={{ color: "var(--muted-light)" }}
            >
              {formatDateTime(user.joinedAt)}
            </span>
          </button>
        ))
      )}
    </div>
  );
}
