import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { LogOut, Menu, X, ChevronRight, LayoutDashboard, ChevronDown, Shield, Home, Code2, Cpu, Mail } from "lucide-react";
import logo from "../../public/LOGO.png";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { clearCredentials } from "../Features/Auth/AuthSlice";
import ThemeToggle from "../ThemeToggle";
export const Navbar = () => {
    const { theme } = useTheme();
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const getInitials = (name) => {
        return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "AD";
    };
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
        { name: "Home", path: "/", id: "01", icon: _jsx(Home, { size: 14 }) },
        { name: "Projects", path: "/projects", id: "02", icon: _jsx(Code2, { size: 14 }) },
        { name: "Stack", path: "/tech", id: "03", icon: _jsx(Cpu, { size: 14 }) },
        { name: "Contact", path: "/contact", id: "04", icon: _jsx(Mail, { size: 14 }) },
    ];
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: "fixed top-0 left-0 right-0 z-[120] transition-all duration-500 w-full", style: {
                    backgroundColor: isScrolled || mobileMenuOpen ? theme["base-100"] : "transparent",
                    borderBottom: isScrolled || mobileMenuOpen ? `2px solid ${theme.primary}20` : "1px solid rgba(255,255,255,0.05)",
                    backdropFilter: isScrolled ? "blur(16px)" : "none"
                }, children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 h-20 flex items-center justify-between", children: [_jsxs(Link, { to: "/", onClick: () => setMobileMenuOpen(false), className: "relative z-[130] flex items-center gap-3 group", children: [_jsx("img", { src: logo, alt: "Logo", className: "w-9 h-9 md:w-10 md:h-10 object-contain transition-transform group-hover:rotate-12 duration-500" }), _jsxs("span", { className: "text-lg md:text-xl font-black uppercase italic tracking-tighter", children: ["GAKENYE ", _jsx("span", { style: { color: theme.primary }, children: "NDIRITU" })] })] }), _jsxs("div", { className: "hidden lg:flex items-center gap-2 relative z-[130]", children: [menuItems.map((item) => (_jsxs(Link, { to: item.path, className: "relative px-4 py-2 flex items-center gap-2 group transition-all rounded-lg hover:bg-white/5", children: [_jsx("span", { className: "transition-transform group-hover:-translate-y-0.5", style: { color: location.pathname === item.path ? theme.primary : 'inherit', opacity: location.pathname === item.path ? 1 : 0.4 }, children: item.icon }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.2em] transition-colors", style: { color: location.pathname === item.path ? theme.primary : theme["base-content"] }, children: item.name }), location.pathname === item.path && (_jsx("div", { className: "absolute bottom-0 left-4 right-4 h-[2px] rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]", style: { backgroundColor: theme.primary } }))] }, item.name))), _jsx("div", { className: "h-6 w-px bg-white/10 mx-4" }), _jsx(ThemeToggle, {}), isAuthenticated && (_jsxs("div", { className: "relative ml-2", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setUserMenuOpen(!userMenuOpen), className: "flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95", children: [_jsx("span", { className: "text-[9px] font-black uppercase tracking-widest hidden xl:block ml-2 opacity-70", children: user?.fullName?.split(" ")[0] || "Admin" }), _jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2", style: { backgroundColor: `${theme.primary}20`, borderColor: theme.primary, color: theme.primary }, children: getInitials(user?.fullName) }), _jsx(ChevronDown, { size: 14, className: `transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}` })] }), _jsxs("div", { className: `absolute right-0 mt-4 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-2xl transition-all duration-300 origin-top-right ${userMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`, children: [_jsxs("div", { className: "px-4 py-3 border-b border-white/5 mb-2", children: [_jsx("p", { className: "text-[10px] font-black uppercase tracking-tighter opacity-40", children: "Access_Level: Admin" }), _jsx("p", { className: "text-xs font-bold truncate opacity-80", children: user?.email })] }), _jsxs(Link, { to: "/admin-dashboard", onClick: () => setUserMenuOpen(false), className: "flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group", children: [_jsx("div", { className: "p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20", style: { backgroundColor: `${theme.primary}15` }, children: _jsx(LayoutDashboard, { size: 16, style: { color: theme.primary } }) }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-widest", children: "Admin Dashboard" })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 group", children: [_jsx("div", { className: "p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20", children: _jsx(LogOut, { size: 16 }) }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-widest", children: "Terminate Session" })] })] })] }))] }), _jsxs("div", { className: "lg:hidden flex items-center gap-4 relative z-[150]", children: [_jsx(ThemeToggle, {}), _jsx("button", { onClick: () => setMobileMenuOpen(!mobileMenuOpen), className: "p-2 transition-transform active:scale-90", style: { color: mobileMenuOpen ? theme.error : theme.primary }, children: mobileMenuOpen ? _jsx(X, { size: 28 }) : _jsx(Menu, { size: 28 }) })] })] }) }), _jsx("div", { className: `fixed inset-0 z-[110] transition-all duration-700 ease-[cubic-bezier(0.85,0,0.15,1)] ${mobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`, style: { backgroundColor: theme["base-100"] }, children: _jsxs("div", { className: "h-full flex flex-col p-8 pt-32 max-w-lg mx-auto", children: [isAuthenticated && (_jsxs("div", { className: "flex items-center gap-5 p-6 rounded-[2rem] border transition-all duration-500 mb-10", style: {
                                backgroundColor: `${theme["base-content"]}05`,
                                borderColor: `${theme["base-content"]}10`
                            }, children: [_jsx("div", { className: "w-16 h-16 rounded-full flex items-center justify-center text-lg font-black border-2 shadow-lg", style: {
                                        backgroundColor: `${theme.primary}15`,
                                        borderColor: theme.primary,
                                        color: theme.primary,
                                        boxShadow: `0 0 20px ${theme.primary}20`
                                    }, children: getInitials(user?.fullName) }), _jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[8px] font-black uppercase tracking-[0.2em] opacity-40", children: "Active_Operator" }), _jsxs("span", { className: "text-lg font-black uppercase italic tracking-tighter leading-none", children: [user?.fullName?.split(" ")[0], " ", _jsx("span", { style: { color: theme.primary }, children: user?.fullName?.split(" ")[1] || "NODE" })] }), _jsxs("span", { className: "text-[9px] font-mono opacity-30 uppercase tracking-[0.3em]", children: ["Access_Level: ", user?.role || 'Root'] })] })] })), _jsxs("div", { className: "flex flex-col gap-1", children: [menuItems.map((item) => (_jsxs(Link, { to: item.path, onClick: () => setMobileMenuOpen(false), className: "group flex items-center justify-between py-6 border-b border-opacity-5 transition-all", style: { borderColor: theme["base-content"] }, children: [_jsxs("div", { className: "flex items-center gap-6", children: [_jsx("span", { className: "transition-transform duration-500 group-hover:scale-110", style: { color: location.pathname === item.path ? theme.primary : 'inherit', opacity: location.pathname === item.path ? 1 : 0.3 }, children: item.icon }), _jsx("span", { className: "text-3xl font-black uppercase italic tracking-tighter transition-all", style: {
                                                        color: location.pathname === item.path ? theme.primary : theme["base-content"],
                                                        opacity: location.pathname === item.path ? 1 : 0.8
                                                    }, children: item.name })] }), _jsx(ChevronRight, { size: 20, style: { color: theme.primary }, className: `transition-transform duration-500 ${location.pathname === item.path ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}` })] }, item.name))), isAuthenticated && (_jsxs(Link, { to: "/admin-dashboard", onClick: () => setMobileMenuOpen(false), className: "flex items-center gap-6 py-8 mt-2 transition-all group", style: { color: theme.primary }, children: [_jsx("div", { className: "p-3 rounded-2xl", style: { backgroundColor: `${theme.primary}10` }, children: _jsx(Shield, { size: 24 }) }), _jsx("span", { className: "text-3xl font-black uppercase italic tracking-tighter", children: "Admin_Console" })] }))] }), _jsxs("div", { className: "mt-auto space-y-8 pb-6", children: [_jsxs("div", { className: "flex items-end justify-between border-t border-dashed border-opacity-10 pt-8", style: { borderColor: theme["base-content"] }, children: [_jsxs("div", { className: "flex flex-col gap-1", children: [_jsx("span", { className: "text-[8px] font-bold opacity-30 uppercase tracking-[0.3em]", children: "System_Clock" }), _jsx("span", { className: "text-xl font-mono font-bold tracking-widest tabular-nums", children: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) })] }), _jsxs("div", { className: "flex flex-col items-end gap-1", children: [_jsx("span", { className: "text-[8px] font-bold opacity-30 uppercase tracking-[0.3em]", children: "Core_Uptime" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-1.5 h-1.5 rounded-full animate-pulse", style: { backgroundColor: theme.primary } }), _jsx("span", { className: "text-xs font-black uppercase", children: "99.9% Stable" })] })] })] }), isAuthenticated && (_jsxs("button", { onClick: handleLogout, className: "w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] border transition-all active:scale-95 flex items-center justify-center gap-3", style: {
                                        borderColor: `${theme.error}40`,
                                        color: theme.error,
                                        backgroundColor: `${theme.error}05`
                                    }, children: [_jsx(LogOut, { size: 16 }), "Terminate_Session"] }))] })] }) })] }));
};
