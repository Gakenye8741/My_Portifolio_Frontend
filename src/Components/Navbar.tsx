import React, { useState, useEffect, useRef } from "react";
import { 
  LogOut, LayoutDashboard, ChevronDown, 
  Home, Code2, Cpu, Mail 
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
    navigate('/');
  };

  const menuItems = [
    { name: "Home", path: "/", icon: <Home size={22} /> },
    { name: "Projects", path: "/projects", icon: <Code2 size={22} /> },
    { name: "Stack", path: "/tech", icon: <Cpu size={22} /> },
    { name: "Contact", path: "/contact", icon: <Mail size={22} /> },
  ];

  return (
    <>
      {/* --- TOP HEADER NAVBAR --- */}
      <nav 
        className="fixed top-0 left-0 right-0 z-[120] transition-all duration-500 w-full"
        style={{ 
            backgroundColor: isScrolled ? theme["base-100"] : "transparent",
            borderBottom: isScrolled ? `2px solid ${theme.primary}20` : "1px solid rgba(255,255,255,0.05)",
            backdropFilter: isScrolled ? "blur(16px)" : "none"
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="w-9 h-9 md:w-10 md:h-10 object-contain transition-transform group-hover:rotate-12 duration-500" />
            <span className="text-lg md:text-xl font-black uppercase italic tracking-tighter">
              GAKENYE <span style={{ color: theme.primary }}>NDIRITU</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-2">
            {menuItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path} 
                className="relative px-4 py-2 flex items-center gap-2 group transition-all rounded-lg hover:bg-white/5"
              >
                <span className="transition-transform group-hover:-translate-y-0.5" style={{ color: location.pathname === item.path ? theme.primary : 'inherit', opacity: location.pathname === item.path ? 1 : 0.4 }}>
                  {React.cloneElement(item.icon, { size: 14 })}
                </span>
                <span 
                  className="text-[10px] font-black uppercase tracking-[0.2em] transition-colors"
                  style={{ color: location.pathname === item.path ? theme.primary : theme["base-content"] }}
                >
                  {item.name}
                </span>
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full" style={{ backgroundColor: theme.primary }} />
                )}
              </Link>
            ))}

            <div className="h-6 w-px bg-white/10 mx-4" />
            <ThemeToggle />

            {/* User Profile Menu (Desktop) */}
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

                {/* Dropdown Menu */}
                <div 
                  className={`absolute right-0 mt-4 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-2xl transition-all duration-300 origin-top-right ${
                    userMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="px-4 py-3 border-b border-white/5 mb-2">
                    <p className="text-[10px] font-black uppercase tracking-tighter opacity-40">Role: Admin</p>
                    <p className="text-xs font-bold truncate opacity-80">{user?.email}</p>
                  </div>
                  
                  <Link to="/admin-dashboard" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.primary}15` }}>
                        <LayoutDashboard size={16} style={{ color: theme.primary }} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                  </Link>

                  <button onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 group">
                    <div className="p-2 rounded-lg bg-red-500/10">
                        <LogOut size={16} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Controls For Mobile Top Bar */}
          <div className="lg:hidden flex items-center gap-4">
            <ThemeToggle />
            {isAuthenticated && (
              <Link 
                to="/admin-dashboard"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2"
                style={{ backgroundColor: `${theme.primary}20`, borderColor: theme.primary, color: theme.primary }}
              >
                {getInitials(user?.fullName)}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* --- TELEGRAM-STYLE MOBILE BOTTOM NAVIGATION BAR --- */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-[120] h-16 border-t backdrop-blur-xl"
        style={{ 
          backgroundColor: `${theme["base-100"]}F2`, // Transparent translucent base matching current theme
          borderColor: `${theme["base-content"]}10`
        }}
      >
        <div className="grid grid-cols-4 h-full max-w-md mx-auto items-center px-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className="flex flex-col items-center justify-center w-full h-full relative transition-transform active:scale-95"
              >
                {/* Telegram-style Capsule Backdrop Shape */}
                <div 
                  className={`flex items-center justify-center py-1 px-5 rounded-full transition-all duration-200 ${
                    isActive ? 'scale-105' : 'scale-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? `${theme.primary}18` : 'transparent'
                  }}
                >
                  <div 
                    className="transition-colors duration-200"
                    style={{ 
                      color: isActive ? theme.primary : theme["base-content"],
                      opacity: isActive ? 1 : 0.4
                    }}
                  >
                    {item.icon}
                  </div>
                </div>
                
                {/* Clean Navigation Label */}
                <span 
                  className="text-[9px] font-bold uppercase tracking-wider mt-0.5 transition-colors duration-200"
                  style={{ 
                    color: isActive ? theme.primary : theme["base-content"],
                    opacity: isActive ? 1 : 0.4
                  }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Bottom spacer to prevent fixed body elements from hiding under navigation zone */}
      <div className="lg:hidden h-16 w-full pointer-events-none" />
    </>
  );
};