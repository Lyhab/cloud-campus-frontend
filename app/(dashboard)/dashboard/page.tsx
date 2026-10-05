"use client";

import { useEffect, useState } from "react";
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

import { useAuth } from "@/app/context/AuthContext";

import {
  getDashboardStats,
  getUploadStats,
  getRecentResources,
  getNewUsers,
  getPendingReports,
  getMyCourses,
  getDashboardResources,
  type DashboardStats,
  type DashboardAdminStats,
  type DashboardStudentStats,
  type UploadStatsItem,
  type RecentResource,
  type NewUser,
  type PendingReport,
  type MyCourse,
  type DashboardResource,
} from "@/app/lib/api/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [uploadStats, setUploadStats] = useState<UploadStatsItem[]>([]);
  const [recentResources, setRecentResources] = useState<RecentResource[]>([]);
  const [newUsers, setNewUsers] = useState<NewUser[]>([]);
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [popularResources, setPopularResources] = useState<DashboardResource[]>(
    [],
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/resources");
      return;
    }

    async function loadDashboard() {
      try {
        setIsLoading(true);

        if (user?.role === "admin") {
          const [
            dashboardStats,
            resourceUploads,
            recentResourceData,
            newUserData,
            pendingReportData,
          ] = await Promise.all([
            getDashboardStats(),
            getUploadStats({
              period: "6months",
            }),
            getRecentResources({
              limit: 5,
              sort: "newest",
            }),
            getNewUsers({
              limit: 5,
              sort: "newest",
            }),
            getPendingReports({
              limit: 5,
              sort: "oldest",
              status: "pending",
            }),
          ]);

          setStats(dashboardStats);
          setUploadStats(resourceUploads);
          setRecentResources(recentResourceData);
          setNewUsers(newUserData);
          setPendingReports(pendingReportData);
        } else {
          const [
            dashboardStats,
            courses,
            popularResourceData,
            recentResourceData,
          ] = await Promise.all([
            getDashboardStats(),
            getMyCourses(),
            getDashboardResources({
              limit: 3,
              minRatingCount: 5,
              sort: "rating",
            }),
            getRecentResources({
              limit: 5,
              sort: "newest",
            }),
          ]);

          setStats(dashboardStats);
          setMyCourses(courses);
          setPopularResources(popularResourceData);
          setRecentResources(recentResourceData);
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, [authLoading, user, router]);

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

  if (authLoading || isLoading) {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-[14px]" style={{ color: "var(--muted)" }}>
          Loading dashboard...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (!stats) {
    return (
      <main className="flex min-h-full items-center justify-center">
        <p className="text-[14px]" style={{ color: "var(--muted)" }}>
          Unable to load dashboard.
        </p>
      </main>
    );
  }

  const isAdmin = user.role === "admin";

  const adminStats = isAdmin ? (stats as DashboardAdminStats) : null;

  const studentStats = !isAdmin ? (stats as DashboardStudentStats) : null;

  return (
    <main className="space-y-8 overflow-y-auto p-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ color: "var(--foreground)" }}
        >
          {getGreeting()}, {user.firstName}
        </h1>

        <p className="mt-1 text-[14px]" style={{ color: "var(--muted)" }}>
          {isAdmin
            ? "Overview of Cloud Campus activity and moderation."
            : "Welcome back. Here is what is happening on your campus today."}
        </p>
      </div>

      {isAdmin && adminStats ? (
        <>
          {/* Admin Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatisticCard
              label="Total Users"
              value={adminStats.totalUsers}
              icon={Users}
              onClick={() => router.push("/users")}
            />

            <DashboardStatisticCard
              label="Total Courses"
              value={adminStats.totalCourses}
              icon={BookOpen}
              onClick={() => router.push("/courses")}
            />

            <DashboardStatisticCard
              label="Total Resources"
              value={adminStats.totalResources}
              icon={FileText}
              onClick={() => router.push("/resources")}
            />

            <DashboardStatisticCard
              label="Pending Reports"
              value={adminStats.pendingReports}
              icon={Flag}
              onClick={() => router.push("/reports")}
            />
          </div>

          {/* Upload Chart */}
          <DashboardBarGraph
            title="Resource Uploads"
            description="Number of resources uploaded over time."
            data={uploadStats}
          />

          {/* Recent Uploads + New Users */}
          <div className="grid grid-cols-1 items-stretch gap-10 xl:grid-cols-2">
            {/* Recent Uploads */}
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
                  uploads={recentResources.map((resource) => ({
                    id: resource.id,
                    title: resource.title,
                    course: `${resource.course.code} · ${resource.course.name}`,
                    type: resource.fileType.toUpperCase(),
                    uploadedBy: [
                      resource.uploadedBy.firstName,
                      resource.uploadedBy.middleName,
                      resource.uploadedBy.lastName,
                    ]
                      .filter(Boolean)
                      .join(" "),
                    date: resource.uploadedAt,
                  }))}
                  onOpen={(id) => router.push(`/resources/${id}`)}
                />
              </div>
            </section>

            {/* New Users */}
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
                  users={newUsers.map((newUser) => ({
                    id: newUser.id,
                    name: [
                      newUser.firstName,
                      newUser.middleName,
                      newUser.lastName,
                    ]
                      .filter(Boolean)
                      .join(" "),
                    email: newUser.email,
                    joinedAt: newUser.joinedAt,
                  }))}
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
              reports={pendingReports.map((report) => ({
                id: report.id,
                resourceTitle: report.resource.title,
                reporter: [
                  report.reporter.firstName,
                  report.reporter.middleName,
                  report.reporter.lastName,
                ]
                  .filter(Boolean)
                  .join(" "),
                reason: report.reason,
                date: report.date,
              }))}
              onOpen={(id) => router.push(`/reports/${id}`)}
            />
          </section>
        </>
      ) : studentStats ? (
        <>
          {/* Student Statistics */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardStatisticCard
              label="My Courses"
              value={studentStats.myCourses}
              icon={BookOpen}
              onClick={() => router.push("/courses?filter=my-courses")}
            />

            <DashboardStatisticCard
              label="My Uploads"
              value={studentStats.myUploads}
              icon={Upload}
              onClick={() => router.push("/resources?filter=my-uploads")}
            />

            <DashboardStatisticCard
              label="Bookmarked"
              value={studentStats.bookmarked}
              icon={Bookmark}
              onClick={() => router.push("/resources?filter=bookmarked")}
            />

            <DashboardStatisticCard
              label="Total Resources"
              value={studentStats.totalResources}
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
                className="cursor-pointer text-[14px] font-semibold text-(--primary) transition-opacity hover:opacity-70"
              >
                View all
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {myCourses.map((course) => (
                <DashboardCoursesCard
                  key={course.id}
                  code={course.code}
                  name={course.name}
                  description={course.description}
                  resourceCount={course.resourceCount}
                  onOpen={() => router.push(`/courses/${course.id}`)}
                />
              ))}
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
              {popularResources.map((resource) => (
                <DashboardPopularResourcesCard
                  key={resource.id}
                  title={resource.title}
                  type={resource.fileType.toUpperCase()}
                  course={`${resource.course.code} · ${resource.course.name}`}
                  uploadedBy={[
                    resource.uploadedBy.firstName,
                    resource.uploadedBy.middleName,
                    resource.uploadedBy.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  downloads={resource.downloads}
                  rating={resource.rating}
                  ratingCount={resource.ratingCount}
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
              resources={recentResources.map((resource) => ({
                id: resource.id,
                title: resource.title,
                course: `${resource.course.code} · ${resource.course.name}`,
                type: resource.fileType.toUpperCase(),
                uploadedBy: [
                  resource.uploadedBy.firstName,
                  resource.uploadedBy.middleName,
                  resource.uploadedBy.lastName,
                ]
                  .filter(Boolean)
                  .join(" "),
                date: resource.uploadedAt,
              }))}
              onOpen={(id) => router.push(`/resources/${id}`)}
            />
          </section>
        </>
      ) : null}
    </main>
  );
}
