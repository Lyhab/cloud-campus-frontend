import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import DashboardIcon from "../../_components/dashboard-icon";
import { courses } from "@/app/lib/data/courses";
import { getResourcesUploadedByUser } from "@/app/lib/data/resources";
import { users } from "@/app/lib/data/users";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = users.find((candidate) => candidate.id === id);

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            User not found
          </h1>
          <Link
            href="/users"
            className="mt-3 inline-flex text-sm"
            style={{ color: "var(--primary)" }}
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const enrolledCourses = courses.filter((course) =>
    user.courseIds.includes(course.id),
  );
  const uploadedResources = getResourcesUploadedByUser(user.id);
  const totalDownloads = uploadedResources.reduce(
    (total, resource) => total + resource.downloads,
    0,
  );
  const roleLabel = user.role === "admin" ? "Admin" : "Student";
  const statusLabel = user.status === "active" ? "Active" : "Disabled";

  const stats = [
    {
      value: enrolledCourses.length,
      label: "Courses Joined",
      icon: "book" as const,
    },
    {
      value: uploadedResources.length,
      label: "Resources Uploaded",
      icon: "file" as const,
    },
    {
      value: totalDownloads,
      label: "Total Downloads",
      icon: "download" as const,
    },
  ];

  const accountInformation = [
    ["User ID", user.id],
    ["Full Name", user.name],
    ["Email Address", user.email],
    ["Role", roleLabel],
    ["Status", statusLabel],
    ["Member Since", user.joinedAt],
    ["Bookmarks", String(user.bookmarkedResourceIds.length)],
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <Link
        href="/users"
        className="inline-flex items-center gap-2 text-[14px] transition-opacity hover:opacity-70"
        style={{ color: "var(--muted)" }}
      >
        <ArrowLeft size={16} strokeWidth={1.8} />
        Back to Users
      </Link>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-[-0.025em] sm:text-4xl">
          User Profile
        </h1>
        <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
          View user account and activity information.
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex items-center gap-5">
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[#3b82f6] text-2xl font-bold text-white sm:size-24 sm:text-3xl">
            {user.initials}
          </div>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{user.name}</h2>
            <p className="mt-1 text-sm text-[#64748b] sm:text-base">
              {user.email}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="inline-flex rounded-md bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#2563eb] sm:text-sm">
                {roleLabel}
              </span>
              <span
                className="inline-flex rounded-md px-2.5 py-1 text-xs font-medium sm:text-sm"
                style={{
                  backgroundColor:
                    user.status === "active"
                      ? "var(--success-light)"
                      : "var(--danger-light)",
                  color:
                    user.status === "active"
                      ? "var(--success)"
                      : "var(--danger)",
                }}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="User statistics"
        className="mt-6 grid gap-5 sm:grid-cols-3"
      >
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center shadow-[0_2px_5px_rgba(15,23,42,0.08)]"
          >
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]">
              <DashboardIcon name={stat.icon} className="size-6" />
            </span>
            <strong className="mt-4 text-2xl">{stat.value}</strong>
            <span className="mt-1 text-sm text-[#64748b]">{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:p-8">
        <h2 className="text-lg font-semibold sm:text-xl">
          Account Information
        </h2>
        <dl className="mt-6 divide-y divide-[#f1f5f9]">
          {accountInformation.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:text-base"
            >
              <dt className="text-[#64748b]">{label}</dt>
              <dd className="font-medium text-[#0f172a]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:p-8">
        <h2 className="text-lg font-semibold sm:text-xl">Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <ul className="mt-5 divide-y divide-[#f1f5f9]">
            {enrolledCourses.map((course) => (
              <li
                key={course.id}
                className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-[#0f172a]">
                  {course.name}
                </span>
                <span className="text-sm text-[#64748b]">{course.code}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-[#64748b]">
            This user is not enrolled in any courses.
          </p>
        )}
      </section>
    </div>
  );
}
