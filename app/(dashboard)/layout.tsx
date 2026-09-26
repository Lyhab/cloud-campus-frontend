import Sidebar from "../components/sidebar";
import Header from "../components/header";
import { mockViewer } from "../lib/data/mock-viewer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={mockViewer.role} />

      <div className="flex min-h-0 flex-1 flex-col">
        <Header name={mockViewer.name} initials={mockViewer.initials} />

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
