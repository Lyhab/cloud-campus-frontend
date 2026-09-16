import type { Report } from "../types";

export const reports: Report[] = [
  {
    id: "1",
    resourceId: "r1",
    reporterId: "u1", // James Liu
    reason:
      "Possible copyright infringement — content appears to be copied from a textbook.",
    date: "2024-11-26",
    status: "pending",
  },
  {
    id: "2",
    resourceId: "r2",
    reporterId: "u2", // Mia Patel
    reason: "Incorrect or misleading information in the TF-IDF section.",
    date: "2024-11-20",
    status: "dismissed",
  },
  {
    id: "3",
    resourceId: "r3",
    reporterId: "u3", // Omar Hassan
    reason: "Duplicate of an existing resource already uploaded.",
    date: "2024-11-10",
    status: "resolved",
  },
];
