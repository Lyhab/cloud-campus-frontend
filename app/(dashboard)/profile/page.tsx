"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

import { useAuth } from "@/app/context/AuthContext";
import { formatDate } from "@/app/lib/format-date";
import { changePassword, updateUser } from "@/app/lib/api/users";

import DashboardIcon from "../_components/dashboard-icon";

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

function PasswordInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={`${inputClass} pr-10`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />

      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-[#64748b] outline-none hover:text-[#0f172a] focus-visible:text-[#2563eb]"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Page-level messages (photo upload + success banners)
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal-level errors (shown inside each modal)
  const [editError, setEditError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm text-[#64748b]">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentUser = user;

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
    clearMessages();
    setEditError(null);

    setFirstName(currentUser.firstName);
    setMiddleName(currentUser.middleName ?? "");
    setLastName(currentUser.lastName);

    setIsEditOpen(true);
  }

  function closeEditModal() {
    setEditError(null);
    setIsEditOpen(false);
  }

  function openPasswordModal() {
    clearMessages();
    setPasswordError(null);

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setIsPasswordOpen(true);
  }

  function closePasswordModal() {
    setPasswordError(null);
    setIsPasswordOpen(false);
  }

  function handlePhotoButtonClick() {
    clearMessages();
    fileInputRef.current?.click();
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
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

      await updateUser(currentUser.id, {}, file);

      await refreshUser();

      setSuccess("Profile photo updated successfully.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update profile photo.",
      );
    } finally {
      setIsPhotoUploading(false);
    }
  }

  async function handleSaveInfo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

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

      await updateUser(currentUser.id, {
        firstName: firstName.trim(),
        middleName: middleName.trim() || null,
        lastName: lastName.trim(),
      });

      await refreshUser();

      setIsEditOpen(false);
      setSuccess("Account information updated successfully.");
    } catch (error) {
      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update account information.",
      );
    } finally {
      setIsSavingInfo(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!oldPassword) {
      setPasswordError("Current password is required.");
      return;
    }

    if (!newPassword) {
      setPasswordError("New password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    try {
      clearMessages();
      setPasswordError(null);
      setIsChangingPassword(true);

      await changePassword(currentUser.id, {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      setIsPasswordOpen(false);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setSuccess("Password changed successfully.");
    } catch (error) {
      setPasswordError(
        error instanceof Error ? error.message : "Failed to change password.",
      );
    } finally {
      setIsChangingPassword(false);
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
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Profile
          </h1>

          <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">
            Manage your account information and preferences.
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

              <span className="mt-2 inline-flex rounded-md bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#2563eb] sm:text-sm">
                {roleLabel}
              </span>
            </div>
          </div>

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
        </section>

        {/* Statistics */}
        <section
          aria-label="Profile statistics"
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

            <button
              type="button"
              className={buttonClass}
              onClick={openEditModal}
            >
              Edit
            </button>
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

        {/* Change Password */}
        <section className="mt-6 flex flex-col gap-5 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">
              Change Password
            </h2>

            <p className="mt-1 text-sm text-[#64748b]">
              Update your password to keep your account secure.
            </p>
          </div>

          <button
            type="button"
            className={buttonClass}
            onClick={openPasswordModal}
          >
            Change
          </button>
        </section>
      </div>

      {/* Edit Information Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Edit Account Information
                </h2>

                <p className="mt-1 text-sm text-[#64748b]">
                  Update your name information.
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

      {/* Change Password Modal */}
      {isPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Change Password</h2>

                <p className="mt-1 text-sm text-[#64748b]">
                  Enter your current password and choose a new password.
                </p>
              </div>

              <button
                type="button"
                className={closeButtonClass}
                onClick={closePasswordModal}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            {passwordError && (
              <div role="alert" className={modalErrorClass}>
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Current Password
                </label>

                <PasswordInput
                  value={oldPassword}
                  onChange={setOldPassword}
                  disabled={isChangingPassword}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  New Password
                </label>

                <PasswordInput
                  value={newPassword}
                  onChange={setNewPassword}
                  disabled={isChangingPassword}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Confirm New Password
                </label>

                <PasswordInput
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  disabled={isChangingPassword}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  className={buttonClass}
                  onClick={closePasswordModal}
                  disabled={isChangingPassword}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={primaryButtonClass}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
