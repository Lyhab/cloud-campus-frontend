export default function DashboardLoading() {
  return (
    <div className="animate-pulse p-4 sm:p-8" aria-label="Loading page">
      <div className="h-8 w-56 rounded bg-(--border-light)" />
      <div className="mt-3 h-4 w-80 max-w-full rounded bg-(--border-light)" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-36 rounded-xl border bg-background"
            style={{ borderColor: "var(--border)" }}
          />
        ))}
      </div>
      <div
        className="mt-6 h-80 rounded-xl border bg-background"
        style={{ borderColor: "var(--border)" }}
      />
    </div>
  );
}
