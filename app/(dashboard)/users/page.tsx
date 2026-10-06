"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, UserShield, Lock, LockOpen } from "lucide-react";

import Table, { Column } from "@/app/components/table";
import SearchFilter from "@/app/components/search-filter";
import { useAuth } from "@/app/context/AuthContext";

import {
  getUsers,
  changeUserRole,
  changeUserStatus,
  type User as UserData,
} from "@/app/lib/api/users";

import { formatDateTime } from "@/app/lib/format-date";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  joinedAt: string;
  status: "pending" | "active" | "inactive";
}

export default function UsersPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const pageSize = 10;

  const [isLoading, setIsLoading] = useState(true);
  const [roleChangingId, setRoleChangingId] = useState<string | null>(null);
  const [statusChangingId, setStatusChangingId] = useState<string | null>(null);

  /*
   * Debounce search input.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  /*
   * Load users.
   */
  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/sign-in");
      return;
    }

    if (user.role === "student") {
      router.replace("/dashboard");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }

    async function loadUsers() {
      try {
        setIsLoading(true);

        const response = await getUsers({
          page,
          limit: pageSize,
          search: debouncedSearch || undefined,
          role:
            roleFilter === "all"
              ? undefined
              : (roleFilter as "admin" | "student"),
          status:
            statusFilter === "all"
              ? undefined
              : (statusFilter as "pending" | "active" | "inactive"),
          sort: "newest",
        });

        setUsers(response.data);
        setTotal(response.total);
      } catch (error) {
        console.error("Failed to load users:", error);
      } finally {
        setIsLoading(false);
      }
    }

    void loadUsers();
  }, [
    authLoading,
    user,
    router,
    page,
    debouncedSearch,
    roleFilter,
    statusFilter,
  ]);

  /*
   * Change user role.
   */
  async function handleRoleChange(userId: string) {
    const targetUser = users.find((item) => item.id === userId);

    if (!targetUser || roleChangingId || statusChangingId) {
      return;
    }

    try {
      setRoleChangingId(userId);

      const updatedUser = await changeUserRole(userId, {
        role: targetUser.role === "admin" ? "student" : "admin",
      });

      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === userId ? updatedUser : item)),
      );
    } catch (error) {
      console.error("Failed to change user role:", error);
    } finally {
      setRoleChangingId(null);
    }
  }

  /*
   * Change user status.
   */
  async function handleStatusChange(userId: string) {
    const targetUser = users.find((item) => item.id === userId);

    if (
      !targetUser ||
      targetUser.status === "pending" ||
      roleChangingId ||
      statusChangingId
    ) {
      return;
    }

    try {
      setStatusChangingId(userId);

      const updatedUser = await changeUserStatus(userId, {
        status: targetUser.status === "active" ? "inactive" : "active",
      });

      setUsers((currentUsers) =>
        currentUsers.map((item) => (item.id === userId ? updatedUser : item)),
      );
    } catch (error) {
      console.error("Failed to change user status:", error);
    } finally {
      setStatusChangingId(null);
    }
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleRoleFilterChange(value: string) {
    setRoleFilter(value);
    setPage(1);
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  const userRows: UserRow[] = users.map((item) => ({
    id: item.id,
    name: [item.firstName, item.middleName, item.lastName]
      .filter(Boolean)
      .join(" "),
    email: item.email,
    role: item.role,
    joinedAt: formatDateTime(item.joinedAt),
    status: item.status,
  }));

  const userColumns = (
    onRoleChange: (userId: string) => void,
    onStatusChange: (userId: string) => void,
  ): Column<UserRow>[] => [
    {
      key: "name",
      header: "User",
      width: "25%",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold"
            style={{
              backgroundColor:
                row.role === "admin"
                  ? "var(--purple-light)"
                  : "var(--primary-light)",
              color: row.role === "admin" ? "var(--purple)" : "var(--primary)",
            }}
          >
            {row.name
              .split(" ")
              .map((name) => name[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>

          <span
            className="text-[14px] font-medium"
            style={{ color: "var(--foreground)" }}
          >
            {row.name}
          </span>
        </div>
      ),
    },

    {
      key: "email",
      header: "Email",
      width: "25%",
      render: (row) => (
        <span className="text-[13px]" style={{ color: "var(--muted)" }}>
          {row.email}
        </span>
      ),
    },

    {
      key: "role",
      header: "Role",
      width: "8%",
      align: "center",
      render: (row) => (
        <span
          className="rounded-md px-2.5 py-1 text-[11px] font-medium"
          style={{
            backgroundColor:
              row.role === "admin"
                ? "var(--purple-light)"
                : "var(--primary-light)",
            color: row.role === "admin" ? "var(--purple)" : "var(--primary)",
          }}
        >
          {row.role === "admin" ? "Admin" : "Student"}
        </span>
      ),
    },

    {
      key: "joinedAt",
      header: "Joined",
      width: "22%",
      align: "center",
    },

    {
      key: "status",
      header: "Status",
      width: "8%",
      align: "center",
      render: (row) => (
        <span
          className="rounded-md px-2.5 py-1 text-[11px] font-medium"
          style={{
            backgroundColor:
              row.status === "active"
                ? "var(--success-light)"
                : row.status === "pending"
                  ? "var(--warning-light)"
                  : "var(--danger-light)",
            color:
              row.status === "active"
                ? "var(--success)"
                : row.status === "pending"
                  ? "var(--warning)"
                  : "var(--danger)",
          }}
        >
          {row.status === "active"
            ? "Active"
            : row.status === "pending"
              ? "Pending"
              : "Inactive"}
        </span>
      ),
    },

    {
      key: "id",
      header: "Actions",
      width: "12%",
      align: "center",
      render: (row) => {
        const isChangingRole = roleChangingId === row.id;
        const isChangingStatus = statusChangingId === row.id;
        const isAnyActionRunning =
          roleChangingId !== null || statusChangingId !== null;

        return (
          <div className="flex items-center justify-center gap-4">
            {/* Change Role */}
            <button
              type="button"
              title={row.role === "admin" ? "Make Student" : "Make Admin"}
              disabled={row.status === "pending" || isAnyActionRunning}
              onClick={(event) => {
                event.stopPropagation();
                onRoleChange(row.id);
              }}
              className="cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                color:
                  row.role === "admin" ? "var(--primary)" : "var(--purple)",
              }}
            >
              {isChangingRole ? (
                <span className="block h-4.5 w-4.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : row.role === "admin" ? (
                <User size={18} strokeWidth={1.7} />
              ) : (
                <UserShield size={18} strokeWidth={1.7} />
              )}
            </button>

            {/* Change Status */}
            <button
              type="button"
              title={row.status === "active" ? "Disable User" : "Enable User"}
              disabled={row.status === "pending" || isAnyActionRunning}
              onClick={(event) => {
                event.stopPropagation();
                onStatusChange(row.id);
              }}
              className="cursor-pointer transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                color:
                  row.status === "active" ? "var(--danger)" : "var(--success)",
              }}
            >
              {isChangingStatus ? (
                <span className="block h-4.5 w-4.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : row.status === "active" ? (
                <Lock size={18} strokeWidth={1.7} />
              ) : (
                <LockOpen size={18} strokeWidth={1.7} />
              )}
            </button>
          </div>
        );
      },
    },
  ];

  /*
   * Only show the initial loading screen while authentication
   * is being resolved.
   */
  if (authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm" style={{ color: "var(--muted)" }}>
          Loading users...
        </span>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          Manage Users
        </h1>

        <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
          {total} registered users
        </p>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            name: "role",
            value: roleFilter,
            onChange: handleRoleFilterChange,
            options: [
              {
                label: "All Roles",
                value: "all",
              },
              {
                label: "Students",
                value: "student",
              },
              {
                label: "Admins",
                value: "admin",
              },
            ],
          },
          {
            name: "status",
            value: statusFilter,
            onChange: handleStatusFilterChange,
            options: [
              {
                label: "All Status",
                value: "all",
              },
              {
                label: "Active",
                value: "active",
              },
              {
                label: "Pending",
                value: "pending",
              },
              {
                label: "Disabled",
                value: "inactive",
              },
            ],
          },
        ]}
      />

      {/* Users Table */}
      <div
        className="relative overflow-hidden rounded-xl border bg-background"
        style={{ borderColor: "var(--border)" }}
      >
        {isLoading && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--background) 60%, transparent)",
            }}
          >
            <span
              className="rounded-md px-3 py-2 text-sm"
              style={{
                color: "var(--muted)",
                backgroundColor: "var(--background)",
              }}
            >
              Loading...
            </span>
          </div>
        )}

        <Table
          columns={userColumns(handleRoleChange, handleStatusChange)}
          data={userRows}
          onRowClick={(row) => router.push(`/profile/${row.id}`)}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
        />
      </div>
    </div>
  );
}
