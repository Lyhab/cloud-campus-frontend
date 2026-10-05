import Link from "next/link";
import AnimatedStats from "./components/animated-stats";
import CloudCampusBrand from "./components/cloud-campus-brand";
import { getHomepageStats } from "./lib/api/homepage";
import styles from "./home.module.css";

// Fetch fresh stats on every request (prevents build-time caching of fallback zeros)
export const dynamic = "force-dynamic";

const features = [
  {
    title: "Study by course",
    description:
      "Find focused resources organised around the courses you take.",
    icon: "book",
  },
  {
    title: "Share resources",
    description:
      "Upload notes, guides, and useful materials for your classmates.",
    icon: "file",
  },
  {
    title: "Learn together",
    description:
      "Join a growing community of students helping one another succeed.",
    icon: "users",
  },
  {
    title: "Save favourites",
    description:
      "Bookmark the resources you need and return to them at any time.",
    icon: "bookmark",
  },
];

function FeatureIcon({ icon }: { icon: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
    >
      {icon === "book" && (
        <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Zm0 13a2 2 0 0 1 2-2h12" />
      )}

      {icon === "file" && <path d="M6 3h8l4 4v14H6V3Zm8 0v5h4" />}

      {icon === "users" && (
        <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-2a3 3 0 0 1 0 6m2 1a4 4 0 0 1 4 4v1" />
      )}

      {icon === "bookmark" && <path d="M6 3h12v18l-6-4-6 4V3Z" />}
    </svg>
  );
}

// NOTE: no "use client" at the top of this file. This is a server component.
export default async function Home() {
  let homepageStats = {
    totalStudents: 0,
    totalCourses: 0,
    totalResources: 0,
    totalDownloads: 0,
  };

  try {
    homepageStats = await getHomepageStats();
  } catch (error) {
    // Shows in the terminal running `npm run dev`, NOT the browser console.
    console.error("Homepage stats failed:", error);
  }

  const stats = [
    {
      value: homepageStats.totalStudents,
      label: "Students",
      suffix: "+",
    },
    {
      value: homepageStats.totalCourses,
      label: "Courses",
      suffix: "+",
    },
    {
      value: homepageStats.totalResources,
      label: "Resources",
      suffix: "+",
    },
    {
      value: homepageStats.totalDownloads,
      label: "Downloads",
      suffix: "+",
      compact: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-[#0f172a]">
      <header className="border-b border-[#e2e8f0] bg-white">
        <div className="flex h-20 w-full items-center justify-between px-5 sm:px-8 lg:px-12">
          <CloudCampusBrand compact />

          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-10 text-[15px] text-[#475569] md:flex"
          >
            <Link href="/" className="transition hover:text-[#2563eb]">
              Home
            </Link>

            <Link href="/resources" className="transition hover:text-[#2563eb]">
              Explore Resources
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-5">
            <Link
              href="/sign-in"
              className="hidden rounded-lg px-2 py-2 text-sm font-medium text-[#334155] outline-none hover:text-[#2563eb] focus-visible:ring-2 focus-visible:ring-[#2563eb] sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/sign-up"
              className="rounded-lg bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2 sm:px-5"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="px-5 pb-20 pt-20 text-center sm:px-8 sm:pb-24 sm:pt-28 lg:pb-28 lg:pt-32">
          <div className={`mx-auto max-w-4xl ${styles.heroContent}`}>
            <h1 className="mt-10 text-5xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-6xl lg:text-[76px]">
              Share knowledge.
              <span className="mt-1 block text-[#2563eb]">Learn together.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#64748b] sm:text-xl">
              Cloud Campus is a study-resource platform where students join
              courses, upload materials, and collaborate — all in one place.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center rounded-lg bg-[#2563eb] px-7 text-base font-medium text-white shadow-sm transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
              >
                Get Started
              </Link>

              <Link
                href="/resources"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white px-7 text-base font-medium text-[#334155] transition hover:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
              >
                Explore Resources
              </Link>
            </div>

            <AnimatedStats
              stats={stats}
              statClassName={styles.stat}
              valueClassName={styles.statValue}
            />
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-8 bg-[#f8fafc] px-5 py-20 sm:px-8 sm:py-24"
        >
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to study smarter
            </h2>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className={`rounded-2xl border border-[#e2e8f0] bg-white p-7 shadow-[0_2px_5px_rgba(15,23,42,0.06)] ${styles.featureCard}`}
                >
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb] ${styles.featureIcon}`}
                  >
                    <FeatureIcon icon={feature.icon} />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#64748b]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e2e8f0] bg-white px-5 py-7 sm:px-8 lg:px-12">
        <div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
          <CloudCampusBrand footer />

          <p className="text-center text-sm text-[#94a3b8] sm:text-right">
            © 2026 Cloud Campus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
