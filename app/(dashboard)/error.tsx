"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-(--foreground)">
          We could not load this page
        </h1>
        <p className="mt-2 text-sm text-(--muted)">
          Check your connection and try the request again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 cursor-pointer rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-medium text-background hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
