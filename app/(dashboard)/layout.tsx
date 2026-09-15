import Sidebar from "../components/sidebar";
import Header from "../components/header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col">
        <Header name="Lyhab Rithyny" initials="LR" />

        <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
