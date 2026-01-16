import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSideNav } from "../dashboardDesign/AdminSidenav";
import { Menu, X, Terminal } from "lucide-react";
import { useTheme } from "../../../ThemeContext";


export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  return (
    <div 
      className="flex h-screen relative font-sans transition-colors duration-500" 
      style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
    >
      {/* --- MOBILE TRIGGER --- */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden fixed top-6 left-6 z-50 p-3 rounded-2xl border backdrop-blur-md transition-all active:scale-95 shadow-2xl"
          style={{ 
            backgroundColor: `${theme["base-100"]}cc`, 
            borderColor: `${theme.primary}33`,
            color: theme.primary 
          }}
          aria-label="Open System Menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* --- DESKTOP SIDEBAR --- */}
      <aside 
        className="hidden md:block w-80 h-full fixed top-0 left-0 z-30 shadow-2xl transition-all"
        style={{ backgroundColor: theme["base-100"] }}
      >
        <AdminSideNav onNavItemClick={() => {}} />
      </aside>

      {/* --- MOBILE SIDEBAR & OVERLAY --- */}
      <div 
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Backdrop blur overlay */}
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Slide-in Menu */}
        <aside 
          className={`absolute top-0 left-0 w-80 h-full shadow-[20px_0_80px_rgba(0,0,0,0.8)] transform transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)] ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ backgroundColor: theme["base-100"] }}
        >
          <button 
            onClick={() => setSidebarOpen(false)}
            className="absolute top-8 right-6 p-2 rounded-xl transition-all opacity-40 hover:opacity-100"
            style={{ color: theme.error }}
          >
            <X size={22} />
          </button>
          
          <AdminSideNav onNavItemClick={() => setSidebarOpen(false)} />
        </aside>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main 
        className="flex-1 overflow-y-auto relative md:ml-80 min-h-screen selection:bg-primary/20"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Subtle Background Glow (Top Left) */}
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[150px] opacity-10 pointer-events-none" 
          style={{ backgroundColor: theme.primary }} 
        />

        {/* Content Container */}
        <div className="max-w-[1600px] mx-auto p-6 md:p-12 relative z-10">
          {/* Section Breadcrumb/Indicator */}
          <header className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-[1px] opacity-20" style={{ backgroundColor: theme["base-content"] }} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                 Admin_Environment // Protected_Node
               </span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md border border-opacity-5 font-mono text-[9px] opacity-30"
                 style={{ borderColor: theme["base-content"] }}>
              <Terminal size={10} />
              <span>UPTIME: 99.9%</span>
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};