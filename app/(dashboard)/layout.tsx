import { mockViewer } from "../lib/data/mock-viewer";
import DashboardShell from "./_components/dashboard-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      role={mockViewer.role}
      name={mockViewer.name}
      initials={mockViewer.initials}
    >
      {children}
    </DashboardShell>
  );
}
