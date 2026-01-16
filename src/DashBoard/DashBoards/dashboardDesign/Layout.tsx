import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { SideNav } from "./Sidenav";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-base-100 text-base-content">
      {/* Hamburger Menu for Mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-base-200 rounded shadow"
        aria-label="Open Sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-full bg-base-200 border-r border-base-300 fixed top-0 left-0 z-30">
        <SideNav />
      </aside>

      {/* Mobile Sidebar Drawer + Overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="fixed top-0 left-0 z-50 w-64 h-full bg-base-200 border-r border-base-300 transform transition-transform duration-300 md:hidden translate-x-0">
            <SideNav onNavItemClick={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:ml-64">
        <Outlet />
      </main>
    </div>
  );
};
