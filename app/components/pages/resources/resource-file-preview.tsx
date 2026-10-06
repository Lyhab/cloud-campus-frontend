"use client";

import { Download, FileText } from "lucide-react";

interface ResourceFilePreviewProps {
  fileType: string;
  fileTypeClass: string;
  fileUrl: string;
  onDownload?: () => void;
}

const IMAGE_TYPES = ["PNG", "JPG", "JPEG", "GIF", "WEBP", "SVG"];

export default function ResourceFilePreview({
  fileType,
  fileTypeClass,
  fileUrl,
  onDownload,
}: ResourceFilePreviewProps) {
  const type = fileType.toUpperCase();
  const isPdf = type === "PDF";
  const isImage = IMAGE_TYPES.includes(type);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <FileText
          size={17}
          strokeWidth={1.7}
          style={{ color: "var(--muted)" }}
        />

        <h2
          className="text-[15px] font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          File Preview
        </h2>
      </div>

      <div
        className="flex min-h-162.5 items-center justify-center overflow-hidden rounded-xl border"
        style={{
          borderColor: "var(--border)",
          backgroundColor: "var(--smoke-light)",
        }}
      >
        {isPdf ? (
          <iframe
            src={fileUrl}
            title="PDF preview"
            className="h-162.5 w-full"
          />
        ) : isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={fileUrl}
            alt="File preview"
            className="max-h-162.5 max-w-full object-contain"
          />
        ) : (
          <div className="text-center">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-xl text-[14px] font-bold ${fileTypeClass}`}
            >
              {fileType}
            </div>

            <h3
              className="mt-4 text-[15px] font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Preview unavailable
            </h3>

            <p
              className="mt-1 max-w-md text-[13px]"
              style={{ color: "var(--muted)" }}
            >
              This file type can&apos;t be previewed in the browser. Download it
              to view.
            </p>

            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="mx-auto mt-5 flex cursor-pointer items-center gap-2 rounded-lg bg-(--primary) px-4 py-2.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              >
                <Download size={15} strokeWidth={1.8} />
                Download File
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
