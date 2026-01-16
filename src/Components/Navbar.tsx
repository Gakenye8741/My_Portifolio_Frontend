import React, { useState, useEffect, useRef } from "react";
import { 
  LogOut, Menu, X, Globe, ChevronRight, LayoutDashboard, 
  ChevronDown, Shield, Home, Code2, Cpu, Mail 
} from "lucide-react";
import logo from "../../public/LOGO.png";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { clearCredentials } from "../Features/Auth/AuthSlice";
import type { RootState } from "../App/store";
import ThemeToggle from "../ThemeToggle";

export const Navbar: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD";
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  // Added icons to menuItems
  const menuItems = [
    { name: "Home", path: "/", id: "01", icon: <Home size={14} /> },
    { name: "Projects", path: "/projects", id: "02", icon: <Code2 size={14} /> },
    { name: "Stack", path: "/tech", id: "03", icon: <Cpu size={14} /> },
    { name: "Contact", path: "/contact", id: "04", icon: <Mail size={14} /> },
  ];

  return (
    <>
      <nav 
        className="fixed top-0 left-0 right-0 z-[120] transition-all duration-500 w-full"
        style={{ 
            backgroundColor: isScrolled || mobileMenuOpen ? theme["base-100"] : "transparent",
            borderBottom: isScrolled || mobileMenuOpen ? `2px solid ${theme.primary}20` : "1px solid rgba(255,255,255,0.05)",
            backdropFilter: isScrolled ? "blur(16px)" : "none"
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Branding */}
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="relative z-[130] flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="w-9 h-9 md:w-10 md:h-10 object-contain transition-transform group-hover:rotate-12 duration-500" />
            <span className="text-lg md:text-xl font-black uppercase italic tracking-tighter">
              GAKENYE <span style={{ color: theme.primary }}>NDIRITU</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden lg:flex items-center gap-2 relative z-[130]">
            {menuItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className="relative px-4 py-2 flex items-center gap-2 group transition-all rounded-lg hover:bg-white/5"
              >
                <span className="transition-transform group-hover:-translate-y-0.5" style={{ color: location.pathname === item.path ? theme.primary : 'inherit', opacity: location.pathname === item.path ? 1 : 0.4 }}>
                  {item.icon}
                </span>
                <span 
                  className="text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                  style={{ color: location.pathname === item.path ? theme.primary : theme["base-content"] }}
                >
                  {item.name}
                </span>
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" style={{ backgroundColor: theme.primary }} />
                )}
              </Link>
            ))}

            <div className="h-6 w-px bg-white/10 mx-4" />
            <ThemeToggle />

            {/* --- USER PROFILE SECTION --- */}
            {isAuthenticated && (
              <div className="relative ml-2" ref={dropdownRef}>
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest hidden xl:block ml-2 opacity-70">
                    {user?.fullName?.split(" ")[0] || "Admin"}
                  </span>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2"
                    style={{ backgroundColor: `${theme.primary}20`, borderColor: theme.primary, color: theme.primary }}
                  >
                    {getInitials(user?.fullName)}
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU */}
                <div 
                  className={`absolute right-0 mt-4 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-2xl transition-all duration-300 origin-top-right ${
                    userMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-40">Access_Level: Admin</p>
                    <p className="text-xs font-bold truncate opacity-80">{user?.email}</p>
                  </div>
                  
                  <Link to="/admin-dashboard" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20" style={{ backgroundColor: `${theme.primary}15` }}>
                        <LayoutDashboard size={16} style={{ color: theme.primary }} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Admin Dashboard</span>
                  </Link>

                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 group">
                    <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20">
                        <LogOut size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MOBILE TOGGLE */}
          <div className="lg:hidden flex items-center gap-4 relative z-[150]">
            <ThemeToggle />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 transition-transform active:scale-90"
              style={{ color: mobileMenuOpen ? theme.error : theme.primary }}
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE OVERLAY --- */}
     {/* --- MOBILE OVERLAY --- */}
<div 
  className={`fixed inset-0 z-[110] transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${
    mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
  }`}
  style={{ backgroundColor: theme["base-100"] }}
>
  <div className="h-full flex flex-col p-8 pt-32 max-w-lg mx-auto">
    
    {/* SYSTEM USER NODE CARD */}
    {isAuthenticated && (
      <div 
        className="flex items-center gap-5 p-6 rounded-[2rem] border transition-all duration-500 mb-10"
        style={{ 
          backgroundColor: `${theme["base-content"]}05`, 
          borderColor: `${theme["base-content"]}10` 
        }}
      >
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-lg font-black border-2 shadow-lg"
          style={{ 
            backgroundColor: `${theme.primary}15`, 
            borderColor: theme.primary, 
            color: theme.primary,
            boxShadow: `0 0 20px ${theme.primary}20`
          }}
        >
          {getInitials(user?.fullName)}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Active_Operator</span>
          <span className="text-lg font-black uppercase italic tracking-tighter leading-none">
            {user?.fullName?.split(" ")[0]} <span style={{ color: theme.primary }}>{user?.fullName?.split(" ")[1] || "NODE"}</span>
          </span>
          <span className="text-[9px] font-mono opacity-30 uppercase tracking-[0.3em]">
            Access_Level: {user?.role || 'Root'}
          </span>
        </div>
      </div>
    )}

    {/* NAVIGATION MODULES */}
    <div className="flex flex-col gap-1">
      {menuItems.map((item) => (
        <Link 
          key={item.name} 
          to={item.path} 
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center justify-between py-6 border-b border-opacity-5 transition-all"
          style={{ borderColor: theme["base-content"] }}
        >
          <div className="flex items-center gap-6">
            <span 
              className="transition-transform duration-500 group-hover:scale-110"
              style={{ color: location.pathname === item.path ? theme.primary : 'inherit', opacity: location.pathname === item.path ? 1 : 0.3 }}
            >
              {item.icon}
            </span>
            <span 
              className="text-3xl font-black uppercase italic tracking-tighter transition-all"
              style={{ 
                color: location.pathname === item.path ? theme.primary : theme["base-content"],
                opacity: location.pathname === item.path ? 1 : 0.8
              }}
            >
              {item.name}
            </span>
          </div>
          <ChevronRight 
            size={20} 
            style={{ color: theme.primary }} 
            className={`transition-transform duration-500 ${location.pathname === item.path ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`} 
          />
        </Link>
      ))}
      
      {/* ADMIN CONSOLE LINK */}
      {isAuthenticated && (
        <Link 
          to="/admin-dashboard" 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-6 py-8 mt-2 transition-all group" 
          style={{ color: theme.primary }}
        >
          <div className="p-3 rounded-2xl" style={{ backgroundColor: `${theme.primary}10` }}>
            <Shield size={24} />
          </div>
          <span className="text-3xl font-black uppercase italic tracking-tighter">Admin_Console</span>
        </Link>
      )}
    </div>

    {/* SYSTEM DIAGNOSTICS FOOTER */}
    <div className="mt-auto space-y-8 pb-6">
      <div className="flex items-end justify-between border-t border-dashed border-opacity-10 pt-8" style={{ borderColor: theme["base-content"] }}>
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.3em]">System_Clock</span>
          <span className="text-xl font-mono font-bold tracking-widest tabular-nums">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[8px] font-bold opacity-30 uppercase tracking-[0.3em]">Core_Uptime</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
            <span className="text-xs font-black uppercase">99.9% Stable</span>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <button 
          onClick={handleLogout}
          className="w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] border transition-all active:scale-95 flex items-center justify-center gap-3"
          style={{ 
            borderColor: `${theme.error}40`, 
            color: theme.error, 
            backgroundColor: `${theme.error}05` 
          }}
        >
          <LogOut size={16} />
          Terminate_Session
        </button>
      )}
    </div>
  </div>
</div>
    </>
  );
};