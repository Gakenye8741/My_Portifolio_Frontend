import React from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { 
  Layout, Database, Cpu, Globe, 
  LogOut, FolderCode, PlusCircle, 
  Activity, User, Settings, ShieldCheck,
  CameraIcon,
  Link2,
  SectionIcon,
  Code,
  TimerIcon
} from "lucide-react";
import { useTheme } from "../../../ThemeContext";
import { clearCredentials } from "../../../Features/Auth/AuthSlice";


const navItems = [
  { name: "Console", path: "/admin-dashboard", id: "00", icon: <Layout size={18} /> },
  { name: "Projects Archive", path: "manage-projects", id: "01", icon: <FolderCode size={18} /> },
  { name: "Media  Manager", path: "media-manager", id: "02", icon: <CameraIcon size={18} /> },
  { name: "Project Links", path: "manage-links", id: "03", icon: <Link2 size={18} /> },
  { name: "Project Sections", path: "Section-manager", id: "04", icon: <SectionIcon size={18} /> },
  { name: "Project Tech", path: "ProjectTech-manager", id: "05", icon: <Database size={18} /> },
  { name: "Skills Manager", path: "skills-manager", id: "06", icon: <Code size={18} /> },
  { name: "Project Timeline", path: "Project-timeline", id: "07", icon: <TimerIcon size={18} /> },
  { name: "Config", path: "settings", id: "08", icon: <Settings size={18} /> },
];

export const AdminSideNav = ({ onNavItemClick }: { onNavItemClick?: () => void }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearCredentials());
    onNavItemClick?.();
  };

  return (
    <aside 
      className="fixed left-0 top-20 w-80 flex flex-col p-4 transition-all duration-500 border-r border-opacity-5 z-[100]"
      style={{ 
        backgroundColor: theme["base-100"], 
        borderColor: theme["base-content"],
        height: 'calc(100vh - 5rem)' 
      }}
    >
      {/* --- MINIMALIST STATUS INDICATOR --- */}
      <div className="flex items-center justify-between px-4 py-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShieldCheck size={20} style={{ color: theme.primary }} />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Auth_Session</span>
            <span className="text-[7px] font-mono opacity-30 uppercase tracking-tighter">Active_Node</span>
          </div>
        </div>
      </div>

      {/* --- NAVIGATION GRID --- */}
      <nav className="flex-grow space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            // "end" ensures Console isn't active when you are in other admin paths
            end={item.path === "/admin-dashboard"} 
            onClick={onNavItemClick}
            className={({ isActive }) => `
              group relative flex items-center justify-between p-3.5 rounded-xl transition-all duration-500
              ${isActive ? 'opacity-100' : 'opacity-20 hover:opacity-100'}
            `}
            style={({ isActive }) => ({
              backgroundColor: isActive ? `${theme.primary}08` : 'transparent',
              color: isActive ? theme.primary : theme["base-content"]
            })}
          >
            {({ isActive }) => (
              <>
                {/* Active Indicator Bar */}
                <div 
                  className={`absolute left-0 w-[3px] h-5 rounded-r-full transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                  style={{ backgroundColor: theme.primary }}
                />
                
                <div className="flex items-center gap-4">
                  <span className={`transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                    {item.name}
                  </span>
                </div>

                <span className={`text-[8px] font-mono transition-opacity ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}`}>
                  {item.id}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- TERMINATE SESSION BUTTON --- */}
      <div className="mt-auto pt-4 border-t border-opacity-5" style={{ borderColor: theme["base-content"] }}>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest">Terminate_Session</span>
        </button>

        {/* SYSTEM DATA FOOTER */}
        <div className="mt-4 px-2 pb-2 flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
                <span className="text-[6px] font-bold opacity-20 uppercase tracking-tighter">Node</span>
                <span className="text-[8px] font-mono font-bold opacity-30 italic">AZ-26</span>
            </div>
            <div className="h-4 w-[1px] bg-white/5 mx-2" />
            <div className="flex flex-col gap-0.5 text-right">
                <span className="text-[6px] font-bold opacity-20 uppercase tracking-tighter">Core</span>
                <span className="text-[8px] font-mono font-bold opacity-30 italic">v2.06</span>
            </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${theme["base-content"]}15; 
          border-radius: 10px; 
        }
      `}</style>
    </aside>
  );
};