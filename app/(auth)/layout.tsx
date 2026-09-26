import type { Metadata } from "next";
import CloudCampusBrand from "../components/cloud-campus-brand";

export const metadata: Metadata = {
  title: "Cloud Campus",
  description: "Share resources and learn together with Cloud Campus.",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-screen flex-1 bg-[#f8fafc] px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center justify-center">
        <div className="mb-8 sm:mb-10">
          <CloudCampusBrand />
        </div>
        {children}
      </div>
    </main>
  );
}
