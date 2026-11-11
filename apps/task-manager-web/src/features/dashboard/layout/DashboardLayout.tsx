import AppSidebar from "../components/AppSidebar";
import AppHeader from "../components/AppHeader";
import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="flex flex-col lg:flex-row h-dvh w-full bg-muted">
      <AppSidebar />

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
        <AppHeader />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
