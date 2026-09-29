import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#2563eb]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#0f172a]">
          Page not found
        </h1>
        <p className="mt-3 text-[#64748b]">
          The page may have moved, or the address may be incorrect.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex h-11 items-center justify-center rounded-lg bg-[#2563eb] px-5 text-sm font-medium text-white hover:bg-[#1d4ed8]"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
