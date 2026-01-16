import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Layout, Database, LogOut, FolderCode, Settings, ShieldCheck, CameraIcon, Link2, SectionIcon, Code, TimerIcon } from "lucide-react";
import { useTheme } from "../../../ThemeContext";
import { clearCredentials } from "../../../Features/Auth/AuthSlice";
const navItems = [
    { name: "Console", path: "/admin-dashboard", id: "00", icon: _jsx(Layout, { size: 18 }) },
    { name: "Projects Archive", path: "manage-projects", id: "01", icon: _jsx(FolderCode, { size: 18 }) },
    { name: "Media  Manager", path: "media-manager", id: "02", icon: _jsx(CameraIcon, { size: 18 }) },
    { name: "Project Links", path: "manage-links", id: "03", icon: _jsx(Link2, { size: 18 }) },
    { name: "Project Sections", path: "Section-manager", id: "04", icon: _jsx(SectionIcon, { size: 18 }) },
    { name: "Project Tech", path: "ProjectTech-manager", id: "05", icon: _jsx(Database, { size: 18 }) },
    { name: "Skills Manager", path: "skills-manager", id: "06", icon: _jsx(Code, { size: 18 }) },
    { name: "Project Timeline", path: "Project-timeline", id: "07", icon: _jsx(TimerIcon, { size: 18 }) },
    { name: "Config", path: "settings", id: "08", icon: _jsx(Settings, { size: 18 }) },
];
export const AdminSideNav = ({ onNavItemClick }) => {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const handleLogout = () => {
        dispatch(clearCredentials());
        onNavItemClick?.();
    };
    return (_jsxs("aside", { className: "fixed left-0 top-20 w-80 flex flex-col p-4 transition-all duration-500 border-r border-opacity-5 z-[100]", style: {
            backgroundColor: theme["base-100"],
            borderColor: theme["base-content"],
            height: 'calc(100vh - 5rem)'
        }, children: [_jsx("div", { className: "flex items-center justify-between px-4 py-4 mb-2", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative", children: [_jsx(ShieldCheck, { size: 20, style: { color: theme.primary } }), _jsx("span", { className: "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-ping", style: { backgroundColor: theme.primary } })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[9px] font-black uppercase tracking-[0.2em]", children: "Auth_Session" }), _jsx("span", { className: "text-[7px] font-mono opacity-30 uppercase tracking-tighter", children: "Active_Node" })] })] }) }), _jsx("nav", { className: "flex-grow space-y-1 overflow-y-auto pr-2 custom-scrollbar", children: navItems.map((item) => (_jsx(NavLink, { to: item.path, 
                    // "end" ensures Console isn't active when you are in other admin paths
                    end: item.path === "/admin-dashboard", onClick: onNavItemClick, className: ({ isActive }) => `
              group relative flex items-center justify-between p-3.5 rounded-xl transition-all duration-500
              ${isActive ? 'opacity-100' : 'opacity-20 hover:opacity-100'}
            `, style: ({ isActive }) => ({
                        backgroundColor: isActive ? `${theme.primary}08` : 'transparent',
                        color: isActive ? theme.primary : theme["base-content"]
                    }), children: ({ isActive }) => (_jsxs(_Fragment, { children: [_jsx("div", { className: `absolute left-0 w-[3px] h-5 rounded-r-full transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`, style: { backgroundColor: theme.primary } }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: `transition-all duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`, children: item.icon }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.15em]", children: item.name })] }), _jsx("span", { className: `text-[8px] font-mono transition-opacity ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'}`, children: item.id })] })) }, item.id))) }), _jsxs("div", { className: "mt-auto pt-4 border-t border-opacity-5", style: { borderColor: theme["base-content"] }, children: [_jsxs("button", { onClick: handleLogout, className: "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 group", children: [_jsx(LogOut, { size: 18, className: "group-hover:-translate-x-1 transition-transform" }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-widest", children: "Terminate_Session" })] }), _jsxs("div", { className: "mt-4 px-2 pb-2 flex items-center justify-between", children: [_jsxs("div", { className: "flex flex-col gap-0.5", children: [_jsx("span", { className: "text-[6px] font-bold opacity-20 uppercase tracking-tighter", children: "Node" }), _jsx("span", { className: "text-[8px] font-mono font-bold opacity-30 italic", children: "AZ-26" })] }), _jsx("div", { className: "h-4 w-[1px] bg-white/5 mx-2" }), _jsxs("div", { className: "flex flex-col gap-0.5 text-right", children: [_jsx("span", { className: "text-[6px] font-bold opacity-20 uppercase tracking-tighter", children: "Core" }), _jsx("span", { className: "text-[8px] font-mono font-bold opacity-30 italic", children: "v2.06" })] })] })] }), _jsx("style", { children: `
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: ${theme["base-content"]}15; 
          border-radius: 10px; 
        }
      ` })] }));
};
