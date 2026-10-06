"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { formatDate } from "@/app/lib/format-date";
import { getUser, updateUser } from "@/app/lib/api/users";

import DashboardIcon from "../../_components/dashboard-icon";

type ViewedUser = Awaited<ReturnType<typeof getUser>>;

const buttonClass =
  "rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-medium text-[#334155] shadow-sm outline-none transition hover:bg-[#f8fafc] focus-visible:ring-2 focus-visible:ring-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

const primaryButtonClass =
  "rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white shadow-sm outline-none transition hover:bg-[#1d4ed8] focus-visible:ring-2 focus-visible:ring-[#2563eb] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

const inputClass =
  "w-full rounded-lg border border-[#e2e8f0] bg-white px-3 py-2.5 text-sm text-[#0f172a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:ring-2 focus:ring-[#dbeafe]";

const modalErrorClass =
  "mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700";

const closeButtonClass =
  "rounded-md p-1 text-[#64748b] outline-none transition hover:bg-[#f1f5f9] hover:text-[#0f172a] focus-visible:ring-2 focus-visible:ring-[#2563eb] cursor-pointer";

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const {
    user: currentUser,
    isLoading: isAuthLoading,
    refreshUser,
  } = useAuth();

  const isAdmin = currentUser?.role === "admin";

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<ViewedUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  // Page-level messages (photo upload + success banners)
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal-level error
  const [editError, setEditError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const loadUser = useCallback(async () => {
    try {
      const data = await getUser(id);
      setUser(data);
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Failed to load user.");
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    getUser(id)
      .then((data) => {
        if (cancelled) return;
        setUser(data);
        setLoadError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load user.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingUser(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isAuthLoading || isLoadingUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-[#64748b]">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold">User not found</h1>

          {loadError && (
            <p className="mt-1 text-sm text-[#64748b]">{loadError}</p>
          )}

          <Link
            href="/users"
            className="mt-3 inline-flex text-sm text-[#2563eb] hover:underline"
          >
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const viewedUser = user;

  const fullName = [user.firstName, user.middleName, user.lastName]
    .filter(Boolean)
    .join(" ");

  const initials = [user.firstName, user.lastName]
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleLabel = user.role === "admin" ? "Admin" : "Student";

  const statusLabel =
    user.status === "active"
      ? "Active"
      : user.status === "pending"
        ? "Pending"
        : "Disabled";

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  function openEditModal() {
    if (!isAdmin) {
      return;
    }

    clearMessages();
    setEditError(null);

    setFirstName(viewedUser.firstName);
    setMiddleName(viewedUser.middleName ?? "");
    setLastName(viewedUser.lastName);

    setIsEditOpen(true);
  }

  function closeEditModal() {
    setEditError(null);
    setIsEditOpen(false);
  }

  function handlePhotoButtonClick() {
    if (!isAdmin) {
      return;
    }

    clearMessages();
    fileInputRef.current?.click();
  }

  async function refreshAfterUpdate() {
    await loadUser();

    // If an admin edited their own profile, keep the header/avatar in sync
    if (currentUser?.id === viewedUser.id) {
      await refreshUser();
    }
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file || !isAdmin) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile photo must be smaller than 5 MB.");
      return;
    }

    try {
      clearMessages();
      setIsPhotoUploading(true);

      await updateUser(viewedUser.id, {}, file);

      await refreshAfterUpdate();

      setSuccess("Profile photo updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update profile photo.",
      );
    } finally {
      setIsPhotoUploading(false);
    }
  }

  async function handleSaveInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAdmin) {
      return;
    }

    if (!firstName.trim()) {
      setEditError("First name is required.");
      return;
    }

    if (!lastName.trim()) {
      setEditError("Last name is required.");
      return;
    }

    try {
      clearMessages();
      setEditError(null);
      setIsSavingInfo(true);

      await updateUser(viewedUser.id, {
        firstName: firstName.trim(),
        middleName: middleName.trim() || null,
        lastName: lastName.trim(),
      });

      await refreshAfterUpdate();

      setIsEditOpen(false);
      setSuccess("Account information updated successfully.");
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : "Failed to update account information.",
      );
    } finally {
      setIsSavingInfo(false);
    }
  }

  const stats = [
    {
      value: user.stats?.coursesJoined ?? "-",
      label: "Courses Joined",
      icon: "book" as const,
    },
    {
      value: user.stats?.resourcesUploaded ?? "-",
      label: "Resources Uploaded",
      icon: "file" as const,
    },
    {
      value: user.stats?.totalDownloads ?? "-",
      label: "Total Downloads",
      icon: "download" as const,
    },
  ];

  return (
    <>
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <Link
          href="/users"
          className="inline-flex items-center gap-2 text-sm text-[#64748b] transition-opacity hover:opacity-70"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to Users
        </Link>

        <header className="mt-6">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            User Profile
          </h1>

          <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
            View user account and activity information.
          </p>
        </header>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Profile Header */}
        <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-5">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#3b82f6] text-2xl font-bold text-white sm:size-24 sm:text-3xl">
              {user.profilePhotoUrl ? (
                <Image
                  src={user.profilePhotoUrl}
                  alt={fullName}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold sm:text-2xl">{fullName}</h2>

              <p className="mt-1 text-sm text-[#64748b] sm:text-base">
                {user.email}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex rounded-md bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#2563eb] sm:text-sm">
                  {roleLabel}
                </span>

                <span
                  className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium sm:text-sm ${
                    user.status === "active"
                      ? "bg-green-50 text-green-700"
                      : user.status === "pending"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                  }`}
                >
                  {statusLabel}
                </span>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />

              <button
                type="button"
                className={buttonClass}
                onClick={handlePhotoButtonClick}
                disabled={isPhotoUploading}
              >
                {isPhotoUploading ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          )}
        </section>

        {/* Statistics */}
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

        {/* Account Information */}
        <section className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold sm:text-xl">
              Account Information
            </h2>

            {isAdmin && (
              <button
                type="button"
                className={buttonClass}
                onClick={openEditModal}
              >
                Edit
              </button>
            )}
          </div>

          <dl className="mt-6 divide-y divide-[#f1f5f9]">
            {[
              ["Full Name", fullName],
              ["Email Address", user.email],
              ["Role", roleLabel],
              ["Status", statusLabel],
              ["Member Since", formatDate(user.joinedAt)],
            ].map(([label, value]) => (
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
      </div>

      {/* Edit Information Modal (admin only) */}
      {isAdmin && isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Edit Account Information
                </h2>

                <p className="mt-1 text-sm text-[#64748b]">
                  Update this user&apos;s name information.
                </p>
              </div>

              <button
                type="button"
                className={closeButtonClass}
                onClick={closeEditModal}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {editError && (
              <div role="alert" className={modalErrorClass}>
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveInfo} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  First Name
                </label>

                <input
                  className={inputClass}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  disabled={isSavingInfo}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Middle Name
                </label>

                <input
                  className={inputClass}
                  value={middleName}
                  onChange={(event) => setMiddleName(event.target.value)}
                  disabled={isSavingInfo}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Last Name
                </label>

                <input
                  className={inputClass}
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  disabled={isSavingInfo}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={closeEditModal}
                  disabled={isSavingInfo}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={isSavingInfo}
                >
                  {isSavingInfo ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
