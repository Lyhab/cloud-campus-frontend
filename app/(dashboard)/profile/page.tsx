"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import DashboardIcon from "../_components/dashboard-icon";
import { useToast } from "@/app/components/ui/toast";
import { courses } from "../../lib/data/courses";
import { mockViewer } from "../../lib/data/mock-viewer";
import { getResourcesUploadedByUser } from "../../lib/data/resources";

const uploadedResources = getResourcesUploadedByUser(mockViewer.id);
const coursesJoined = courses.filter((course) =>
  mockViewer.courseIds.includes(course.id),
).length;
const totalDownloads = uploadedResources.reduce(
  (total, resource) => total + resource.downloads,
  0,
);

const stats = [
  { value: coursesJoined, label: "Courses Joined", icon: "book" as const },
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

const roleLabel = mockViewer.role === "admin" ? "Admin" : "Student";
const statusLabel = mockViewer.status === "active" ? "Active" : "Disabled";

const buttonClass = "rounded-lg border border-[#e2e8f0] bg-white px-4 py-2 text-sm font-medium text-[#334155] shadow-sm outline-none transition hover:bg-[#f8fafc] focus-visible:ring-2 focus-visible:ring-[#2563eb]";

export default function ProfilePage() {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
      toast.warning("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Profile photos must be smaller than 5 MB.");
      return;
    }

    const previousPreview = photoPreview;
    const preview = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("Unable to read this image."));
      reader.readAsDataURL(file);
    }).catch((error: Error) => {
      toast.error(error.message);
      return "";
    });
    if (!preview) return;

    setPhotoPreview(preview);
    setIsUploading(true);
    const progressToast = toast.info("Uploading profile photo...", 0);

    try {
      // Mock upload. Replace this delay with the file-storage API request.
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.dismiss(progressToast);
      toast.success("Profile photo updated.");
    } catch {
      setPhotoPreview(previousPreview);
      toast.dismiss(progressToast);
      toast.error("Photo upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      <header>
        <h1 className="text-3xl font-bold tracking-[-0.025em] sm:text-4xl">Profile</h1>
        <p className="mt-1.5 text-sm text-[#64748b] sm:text-base">Manage your account information and preferences.</p>
      </header>

      <section className="mt-8 flex flex-col gap-5 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-5">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#3b82f6] text-2xl font-bold text-white sm:size-24 sm:text-3xl">
            {photoPreview ? (
              <Image
                src={photoPreview}
                alt={`${mockViewer.name}'s profile`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              mockViewer.initials
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{mockViewer.name}</h2>
            <p className="mt-1 text-sm text-[#64748b] sm:text-base">{mockViewer.email}</p>
            <span className="mt-2 inline-flex rounded-md bg-[#eff6ff] px-2.5 py-1 text-xs font-medium text-[#2563eb] sm:text-sm">{roleLabel}</span>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          className="sr-only"
          aria-label="Choose profile photo"
        />
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className={`${buttonClass} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {isUploading ? "Uploading..." : "Change Photo"}
        </button>
      </section>

      <section aria-label="Profile statistics" className="mt-6 grid gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-[#e2e8f0] bg-white p-6 text-center shadow-[0_2px_5px_rgba(15,23,42,0.08)]">
            <span className="flex size-12 items-center justify-center rounded-xl bg-[#eff6ff] text-[#2563eb]"><DashboardIcon name={stat.icon} className="size-6" /></span>
            <strong className="mt-4 text-2xl">{stat.value}</strong>
            <span className="mt-1 text-sm text-[#64748b]">{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold sm:text-xl">Account Information</h2>
          <button type="button" aria-disabled="true" title="Profile editing will be available after backend integration" className={buttonClass}>Edit</button>
        </div>
        <dl className="mt-6 divide-y divide-[#f1f5f9]">
          {[
            ["Full Name", mockViewer.name],
            ["Email Address", mockViewer.email],
            ["Role", roleLabel],
            ["Status", statusLabel],
            ["Member Since", mockViewer.joinedAt],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:text-base">
              <dt className="text-[#64748b]">{label}</dt>
              <dd className="font-medium text-[#0f172a]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 flex flex-col gap-5 rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-[0_2px_5px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-lg font-semibold sm:text-xl">Change Password</h2>
          <p className="mt-1 text-sm text-[#64748b]">Update your password to keep your account secure.</p>
        </div>
        <button type="button" aria-disabled="true" title="Password changes will be available after backend integration" className={buttonClass}>Change</button>
      </section>
    </div>
  );
}
