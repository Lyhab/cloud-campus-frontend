"use client";

import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  Flag,
  Upload,
  Users,
  Bookmark,
} from "lucide-react";

import DashboardStatisticCard from "@/app/components/pages/dashboard/dashboard-statistic-card";
import DashboardCoursesCard from "@/app/components/pages/dashboard/dashboard-courses-card";
import DashboardPopularResourcesCard from "@/app/components/pages/dashboard/dashboard-popular-resources-card";
import DashboardBarGraph from "@/app/components/pages/dashboard/dashboard-bar-graph";
import DashboardRecentUploads from "@/app/components/pages/dashboard/dashboard-recent-uploads";
import DashboardNewUsers from "@/app/components/pages/dashboard/dashboard-new-users";
import DashboardPendingReports from "@/app/components/pages/dashboard/dashboard-pending-reports";
import DashboardRecentResources from "@/app/components/pages/dashboard/dashboard-recent-resources";

import { courses } from "@/app/lib/data/courses";
import { resources } from "@/app/lib/data/resources";
import { users } from "@/app/lib/data/users";
import { reports } from "@/app/lib/data/reports";
import { mockViewer } from "@/app/lib/data/mock-viewer";

export default function DashboardPage() {
  const router = useRouter();

  const isAdmin = mockViewer.role === "admin";

  const recentUploads = resources.slice(0, 5).map((resource) => {
    const uploader = users.find((user) => user.id === resource.uploadedBy);

    const course = courses.find((course) => course.id === resource.courseId);

    return {
      id: resource.id,
      title: resource.title,
      course: course ? `${course.code} · ${course.name}` : "Unknown Course",
      type: resource.fileType.toUpperCase(),
      uploadedBy: uploader?.name ?? "Unknown User",
      date: resource.uploadedAt,
    };
  });

  const newUsers = [...users]
    .sort(
      (a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
    )
    .slice(0, 5)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      joinedAt: user.joinedAt,
    }));

  const pendingReports = reports
    .filter((report) => report.status === "pending")
    .slice(0, 5)
    .map((report) => {
      const resource = resources.find(
        (resource) => resource.id === report.resourceId,
      );

      const reporter = users.find((user) => user.id === report.reporterId);

      return {
        id: report.id,
        resourceTitle: resource?.title ?? "Unknown Resource",
        reporter: reporter?.name ?? "Unknown User",
        reason: report.reason,
        date: report.date,
      };
    });

  const recentResources = resources.slice(0, 5).map((resource) => {
    const uploader = users.find((user) => user.id === resource.uploadedBy);

    const course = courses.find((course) => course.id === resource.courseId);

    return {
      id: resource.id,
      title: resource.title,
      course: course ? `${course.code} · ${course.name}` : "Unknown Course",
      type: resource.fileType.toUpperCase(),
      uploadedBy: uploader?.name ?? "Unknown User",
      date: resource.uploadedAt,
    };
  });

  const popularResources = [...resources]
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
    .map((resource) => {
      const course = courses.find((course) => course.id === resource.courseId);

      const uploader = users.find((user) => user.id === resource.uploadedBy);

      return {
        id: resource.id,
        title: resource.title,
        type: resource.fileType.toUpperCase(),
        course: course ? `${course.code} · ${course.name}` : "Unknown Course",
        uploadedBy: uploader?.name ?? "Unknown User",
        downloads: resource.downloads,
        rating: resource.rating,
      };
    });

  const studentCourses = courses
    .filter((course) => mockViewer.courseIds.includes(course.id))
    .map((course) => ({
      code: course.code,
      name: course.name,
      description: course.description,
      resourceCount: resources.filter(
        (resource) => resource.courseId === course.id,
      ).length,
    }));

  const uploadsByMonth = [
    { label: "Jan", value: 12 },
    { label: "Feb", value: 18 },
    { label: "Mar", value: 15 },
    { label: "Apr", value: 24 },
    { label: "May", value: 21 },
    { label: "Jun", value: 29 },
  ];

  function getGreeting() {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good morning";
    }

    if (hour < 18) {
      return "Good afternoon";
    }

    return "Good evening";
  }

  return (
    <main className="space-y-6 overflow-y-auto p-4 sm:space-y-8 sm:p-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          {getGreeting()}, {mockViewer.name}
        </h1>

        <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
          {isAdmin
            ? "Overview of Cloud Campus activity and moderation."
            : "Welcome back. Here is what is happening on your campus today."}
        </p>
      </div>

      {isAdmin ? (
        <>
          {/* Admin Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatisticCard
              label="Total Users"
              value={users.length}
              icon={Users}
              onClick={() => router.push("/users")}
            />

            <DashboardStatisticCard
              label="Total Courses"
              value={courses.length}
              icon={BookOpen}
              onClick={() => router.push("/courses")}
            />

            <DashboardStatisticCard
              label="Total Resources"
              value={resources.length}
              icon={FileText}
              onClick={() => router.push("/resources")}
            />

            <DashboardStatisticCard
              label="Pending Reports"
              value={
                reports.filter((report) => report.status === "pending").length
              }
              icon={Flag}
              onClick={() => router.push("/reports")}
            />
          </div>

          {/* Upload Chart */}
          <DashboardBarGraph
            title="Resource Uploads"
            description="Number of resources uploaded over time."
            data={uploadsByMonth}
          />

          {/* Recent Uploads + New Users */}
          <div className="grid grid-cols-1 items-stretch gap-10 xl:grid-cols-2">
            <section className="flex h-full flex-col">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2
                    className="text-[17px] font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Recent Uploads
                  </h2>

                  <p
                    className="mt-1 text-[13px]"
                    style={{ color: "var(--muted)" }}
                  >
                    Recently uploaded study materials.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/resources")}
                  className="cursor-pointer text-[14px] font-semibold text-(--primary) transition-opacity hover:opacity-70"
                >
                  View all
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <DashboardRecentUploads
                  uploads={recentUploads}
                  onOpen={(id) => router.push(`/resources/${id}`)}
                />
              </div>
            </section>

            <section className="flex h-full flex-col">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2
                    className="text-[17px] font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    New Users
                  </h2>

                  <p
                    className="mt-1 text-[13px]"
                    style={{ color: "var(--muted)" }}
                  >
                    Recently joined Cloud Campus users.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/users")}
                  className="cursor-pointer text-[14px] font-semibold text-(--primary) transition-opacity hover:opacity-70"
                >
                  View all
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <DashboardNewUsers
                  users={newUsers}
                  onOpen={(id) => router.push(`/profile/${id}`)}
                />
              </div>
            </section>
          </div>

          {/* Pending Reports */}
          <section className="flex flex-col">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Pending Reports
                </h2>

                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  Resources flagged for review.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/reports")}
                className="cursor-pointer text-[14px] font-semibold text-(--primary) transition-opacity hover:opacity-70"
              >
                View all
              </button>
            </div>

            <DashboardPendingReports
              reports={pendingReports}
              onOpen={(id) => router.push(`/reports/${id}`)}
            />
          </section>
        </>
      ) : (
        <>
          {/* Student Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatisticCard
              label="My Courses"
              value={studentCourses.length}
              icon={BookOpen}
              onClick={() => router.push("/courses?filter=my-courses")}
            />

            <DashboardStatisticCard
              label="My Uploads"
              value={
                resources.filter(
                  (resource) => resource.uploadedBy === mockViewer.id,
                ).length
              }
              icon={Upload}
              onClick={() => router.push("/resources?filter=my-uploads")}
            />

            <DashboardStatisticCard
              label="Bookmarked"
              value={
                mockViewer.bookmarkedResourceIds.length
              }
              icon={Bookmark}
              onClick={() => router.push("/resources?filter=bookmarked")}
            />

            <DashboardStatisticCard
              label="Total Resources"
              value={resources.length}
              icon={FileText}
              onClick={() => router.push("/resources")}
            />
          </div>

          {/* My Courses */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  My Courses
                </h2>

                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  Courses you are currently enrolled in.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/courses?filter=my-courses")}
                className="cursor-pointer text-[14px] text-(--primary) font-semibold transition-opacity hover:opacity-70"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {studentCourses.map((course) => {
                const courseData = courses.find(
                  (item) => item.code === course.code,
                );

                return (
                  <DashboardCoursesCard
                    key={course.code}
                    {...course}
                    onOpen={() =>
                      router.push(`/courses/${courseData?.id ?? course.code}`)
                    }
                  />
                );
              })}
            </div>
          </section>

          {/* Popular Resources */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Popular Resources
                </h2>

                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  Resources that are currently popular among students.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/resources?filter=top-rated")}
                className="cursor-pointer text-[14px] font-semibold text-(--primary) transition-opacity hover:opacity-70"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {popularResources.slice(0, 3).map((resource) => (
                <DashboardPopularResourcesCard
                  key={resource.id}
                  title={resource.title}
                  type={resource.type}
                  course={resource.course}
                  uploadedBy={resource.uploadedBy}
                  downloads={resource.downloads}
                  rating={resource.rating}
                  onOpen={() => router.push(`/resources/${resource.id}`)}
                />
              ))}
            </div>
          </section>

          {/* Recent Resources */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  className="text-[17px] font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Recent Resources
                </h2>

                <p
                  className="mt-1 text-[13px]"
                  style={{ color: "var(--muted)" }}
                >
                  Recently uploaded study materials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push("/resources")}
                className="cursor-pointer text-[14px] font-semibold text-(--primary) transition-opacity hover:opacity-70"
              >
                View all
              </button>
            </div>

            <DashboardRecentResources
              resources={recentResources}
              onOpen={(id) => router.push(`/resources/${id}`)}
            />
          </section>
        </>
      )}
    </main>
  );
}
