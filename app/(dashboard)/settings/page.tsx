"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/toast";

const sectionClass =
  "rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:p-8";

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [preferences, setPreferences] = useState({
    resourceUpdates: true,
    moderationUpdates: true,
    courseActivity: false,
    defaultResourceView: "cards",
  });

  function togglePreference(
    key: "resourceUpdates" | "moderationUpdates" | "courseActivity",
  ) {
    setPreferences((current) => ({ ...current, [key]: !current[key] }));
  }

  function savePreferences() {
    localStorage.setItem(
      "cloud-campus-preferences",
      JSON.stringify(preferences),
    );
    toast.success("Settings saved.");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <h1 className="text-2xl font-bold tracking-[-0.025em] sm:text-4xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
          Manage notifications, display preferences, and your session.
        </p>
      </header>

      <div className="mt-6 space-y-6 sm:mt-8">
        <section className={sectionClass}>
          <h2 className="text-lg font-semibold sm:text-xl">Notifications</h2>
          <p className="mt-1 text-sm text-(--muted)">
            These preferences are stored on this device until the settings API
            is available.
          </p>
          <div className="mt-5 divide-y divide-(--border-light)">
            {[
              {
                key: "resourceUpdates" as const,
                title: "Resource updates",
                description: "Approval, rejection, and upload status changes.",
              },
              {
                key: "moderationUpdates" as const,
                title: "Moderation updates",
                description: "Report resolutions and administrative actions.",
              },
              {
                key: "courseActivity" as const,
                title: "Course activity",
                description: "New resources in courses you have joined.",
              },
            ].map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between gap-5 py-4"
              >
                <span>
                  <span className="block text-sm font-medium">{item.title}</span>
                  <span className="mt-1 block text-xs leading-5 text-(--muted) sm:text-sm">
                    {item.description}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={preferences[item.key]}
                  onChange={() => togglePreference(item.key)}
                  className="size-5 shrink-0 accent-(--primary)"
                />
              </label>
            ))}
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-lg font-semibold sm:text-xl">Display</h2>
          <label className="mt-5 block max-w-sm text-sm font-medium">
            Default resource view
            <select
              value={preferences.defaultResourceView}
              onChange={(event) =>
                setPreferences((current) => ({
                  ...current,
                  defaultResourceView: event.target.value,
                }))
              }
              className="mt-2 h-11 w-full rounded-lg border border-(--border) bg-white px-3 outline-none focus:border-(--primary)"
            >
              <option value="cards">Cards</option>
              <option value="table">Table</option>
            </select>
          </label>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={savePreferences}
            className="h-11 w-full cursor-pointer rounded-lg bg-(--primary) px-5 text-sm font-medium text-white hover:opacity-90 sm:w-auto"
          >
            Save Settings
          </button>
        </div>

        <section className={sectionClass}>
          <h2 className="text-lg font-semibold sm:text-xl">Session</h2>
          <p className="mt-1 text-sm text-(--muted)">
            Sign out of Cloud Campus on this device.
          </p>
          <button
            type="button"
            onClick={() => {
              toast.info("You have been signed out.");
              router.replace("/sign-in");
            }}
            className="mt-5 h-11 w-full cursor-pointer rounded-lg border border-red-200 px-5 text-sm font-medium text-(--danger) hover:bg-(--danger-light) sm:w-auto"
          >
            Log out
          </button>
        </section>
      </div>
    </div>
  );
}
