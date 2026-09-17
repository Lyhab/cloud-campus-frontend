"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { User, UserShield, Lock, LockOpen } from "lucide-react";

// Components
import Table, { Column } from "@/app/components/table";
import SearchFilter from "@/app/components/search-filter";

// Data
import { users } from "../../lib/data/users";
import { resources } from "../../lib/data/resources";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  joinedAt: string;
  uploads: number;
  status: "active" | "disabled";
}

// Derive upload count from resources
const userRows: UserRow[] = users.map((user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  joinedAt: user.joinedAt,
  uploads: resources.filter((resource) => resource.uploadedBy === user.id)
    .length,
  status: user.status,
}));

const userColumns = (
  onRoleChange: (userId: string) => void,
  onStatusChange: (userId: string) => void,
): Column<UserRow>[] => [
  {
    key: "name",
    header: "User",
    width: "20%",
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
    width: "20%",
    render: (row) => (
      <span className="text-[13px]" style={{ color: "var(--muted)" }}>
        {row.email}
      </span>
    ),
  },

  {
    key: "role",
    header: "Role",
    width: "10%",
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
    width: "12%",
    align: "center",
  },

  {
    key: "uploads",
    header: "Uploads",
    width: "10%",
    align: "center",
  },

  {
    key: "status",
    header: "Status",
    width: "10%",
    align: "center",
    render: (row) => (
      <span
        className="rounded-md px-2.5 py-1 text-[11px] font-medium"
        style={{
          backgroundColor:
            row.status === "active"
              ? "var(--success-light)"
              : "var(--danger-light)",
          color: row.status === "active" ? "var(--success)" : "var(--danger)",
        }}
      >
        {row.status === "active" ? "Active" : "Disabled"}
      </span>
    ),
  },

  {
    key: "id",
    header: "Actions",
    width: "18%",
    align: "center",
    render: (row) => (
      <div className="flex items-center justify-center gap-4">
        {/* Make Admin / Student */}
        <button
          type="button"
          title={row.role === "admin" ? "Make Student" : "Make Admin"}
          onClick={(event) => {
            event.stopPropagation();
            onRoleChange(row.id);
          }}
          className="cursor-pointer transition-opacity hover:opacity-70"
          style={{
            color: row.role === "admin" ? "var(--primary)" : "var(--purple)",
          }}
        >
          {row.role === "admin" ? (
            <User size={18} strokeWidth={1.7} />
          ) : (
            <UserShield size={18} strokeWidth={1.7} />
          )}
        </button>

        {/* Enable / Disable */}
        <button
          type="button"
          title={row.status === "active" ? "Disable User" : "Enable User"}
          onClick={(event) => {
            event.stopPropagation();
            onStatusChange(row.id);
          }}
          className="cursor-pointer transition-opacity hover:opacity-70"
          style={{
            color: row.status === "active" ? "var(--danger)" : "var(--success)",
          }}
        >
          {row.status === "active" ? (
            <Lock size={18} strokeWidth={1.7} />
          ) : (
            <LockOpen size={18} strokeWidth={1.7} />
          )}
        </button>
      </div>
    ),
  },
];

export default function UsersPage() {
  const router = useRouter();

  // Temporary frontend role check.
  // Replace with authenticated user data later.
  const currentUser = {
    role: "admin" as "admin" | "student",
  };

  const isAdmin = currentUser.role === "admin";

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  if (!isAdmin) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Access Denied
          </h1>

          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = userRows.filter((user) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      user.name.toLowerCase().includes(searchValue) ||
      user.email.toLowerCase().includes(searchValue);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

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
          {userRows.length} registered users
        </p>
      </div>

      {/* Search + Filters */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        filters={[
          {
            name: "role",
            value: roleFilter,
            onChange: setRoleFilter,
            options: [
              { label: "All Roles", value: "all" },
              { label: "Students", value: "student" },
              { label: "Admins", value: "admin" },
            ],
          },
          {
            name: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Disabled", value: "disabled" },
            ],
          },
        ]}
      />

      {/* Users Table */}
      <div
        className="overflow-hidden rounded-xl border bg-background"
        style={{ borderColor: "var(--border)" }}
      >
        <Table
          columns={userColumns(
            (userId) => console.log("change role:", userId),
            (userId) => console.log("change status:", userId),
          )}
          data={filteredUsers}
          onRowClick={(row) => router.push(`/profile/${row.id}`)}
          pagination={{
            page: 1,
            pageSize: 5,
            total: filteredUsers.length,
            onPageChange: (page) => console.log(page),
          }}
        />
      </div>
    </div>
  );
}
