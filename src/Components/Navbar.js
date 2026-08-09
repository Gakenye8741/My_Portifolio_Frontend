import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from "react";
import { LogOut, LayoutDashboard, ChevronDown, Home, Code2, Cpu, Mail, Briefcase } from "lucide-react";
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
        navigate('/');
    };
    const menuItems = [
        { name: "Home", path: "/", icon: _jsx(Home, { size: 22 }) },
        { name: "Projects", path: "/projects", icon: _jsx(Code2, { size: 22 }) },
        { name: "Stack", path: "/tech", icon: _jsx(Cpu, { size: 22 }) },
        { name: "Services", path: "/services", icon: _jsx(Briefcase, { size: 22 }) },
        { name: "Contact", path: "/contact", icon: _jsx(Mail, { size: 22 }) },
    ];
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: "fixed top-0 left-0 right-0 z-[120] transition-all duration-500 w-full", style: {
                    backgroundColor: isScrolled ? theme["base-100"] : "transparent",
                    borderBottom: isScrolled ? `2px solid ${theme.primary}20` : "1px solid rgba(255,255,255,0.05)",
                    backdropFilter: isScrolled ? "blur(16px)" : "none"
                }, children: _jsxs("div", { className: "max-w-7xl mx-auto px-6 h-20 flex items-center justify-between", children: [_jsxs(Link, { to: "/", className: "flex items-center gap-3 group", children: [_jsx("img", { src: logo, alt: "Logo", className: "w-9 h-9 md:w-10 md:h-10 object-contain transition-transform group-hover:rotate-12 duration-500" }), _jsxs("span", { className: "text-lg md:text-xl font-black uppercase italic tracking-tighter", children: ["GAKENYE ", _jsx("span", { style: { color: theme.primary }, children: "NDIRITU" })] })] }), _jsxs("div", { className: "hidden lg:flex items-center gap-2", children: [menuItems.map((item) => (_jsxs(Link, { to: item.path, className: "relative px-4 py-2 flex items-center gap-2 group transition-all rounded-lg hover:bg-white/5", children: [_jsx("span", { className: "transition-transform group-hover:-translate-y-0.5", style: { color: location.pathname === item.path ? theme.primary : 'inherit', opacity: location.pathname === item.path ? 1 : 0.4 }, children: React.cloneElement(item.icon, { size: 14 }) }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.2em] transition-colors", style: { color: location.pathname === item.path ? theme.primary : theme["base-content"] }, children: item.name }), location.pathname === item.path && (_jsx("div", { className: "absolute bottom-0 left-4 right-4 h-[2px] rounded-full", style: { backgroundColor: theme.primary } }))] }, item.name))), _jsx("div", { className: "h-6 w-px bg-white/10 mx-4" }), _jsx(ThemeToggle, {}), isAuthenticated && (_jsxs("div", { className: "relative ml-2", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setUserMenuOpen(!userMenuOpen), className: "flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-95", children: [_jsx("span", { className: "text-[9px] font-black uppercase tracking-widest hidden xl:block ml-2 opacity-70", children: user?.fullName?.split(" ")[0] || "Admin" }), _jsx("div", { className: "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2", style: { backgroundColor: `${theme.primary}20`, borderColor: theme.primary, color: theme.primary }, children: getInitials(user?.fullName) }), _jsx(ChevronDown, { size: 14, className: `transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}` })] }), _jsxs("div", { className: `absolute right-0 mt-4 w-64 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-2xl p-2 shadow-2xl transition-all duration-300 origin-top-right ${userMenuOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`, children: [_jsxs("div", { className: "px-4 py-3 border-b border-white/5 mb-2", children: [_jsx("p", { className: "text-[10px] font-black uppercase tracking-tighter opacity-40", children: "Role: Admin" }), _jsx("p", { className: "text-xs font-bold truncate opacity-80", children: user?.email })] }), _jsxs(Link, { to: "/admin-dashboard", onClick: () => setUserMenuOpen(false), className: "flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/5 transition-colors group", children: [_jsx("div", { className: "p-2 rounded-lg", style: { backgroundColor: `${theme.primary}15` }, children: _jsx(LayoutDashboard, { size: 16, style: { color: theme.primary } }) }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-widest", children: "Dashboard" })] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center gap-3 w-full p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 group", children: [_jsx("div", { className: "p-2 rounded-lg bg-red-500/10", children: _jsx(LogOut, { size: 16 }) }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-widest", children: "Logout" })] })] })] }))] }), _jsxs("div", { className: "lg:hidden flex items-center gap-4", children: [_jsx(ThemeToggle, {}), isAuthenticated && (_jsx(Link, { to: "/admin-dashboard", className: "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2", style: { backgroundColor: `${theme.primary}20`, borderColor: theme.primary, color: theme.primary }, children: getInitials(user?.fullName) }))] })] }) }), _jsx("div", { className: "lg:hidden fixed bottom-0 left-0 right-0 z-[120] h-16 border-t backdrop-blur-xl", style: {
                    backgroundColor: `${theme["base-100"]}F2`, // Transparent translucent base matching current theme
                    borderColor: `${theme["base-content"]}10`
                }, children: _jsx("div", { className: "grid grid-cols-5 h-full max-w-lg mx-auto items-center px-1", children: menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (_jsxs(Link, { to: item.path, className: "flex flex-col items-center justify-center w-full h-full relative transition-transform active:scale-95", children: [_jsx("div", { className: `flex items-center justify-center py-1 px-3 rounded-full transition-all duration-200 ${isActive ? 'scale-105' : 'scale-100'}`, style: {
                                        backgroundColor: isActive ? `${theme.primary}18` : 'transparent'
                                    }, children: _jsx("div", { className: "transition-colors duration-200", style: {
                                            color: isActive ? theme.primary : theme["base-content"],
                                            opacity: isActive ? 1 : 0.4
                                        }, children: item.icon }) }), _jsx("span", { className: "text-[8px] font-bold uppercase tracking-wider mt-0.5 transition-colors duration-200 truncate max-w-full px-1", style: {
                                        color: isActive ? theme.primary : theme["base-content"],
                                        opacity: isActive ? 1 : 0.4
                                    }, children: item.name })] }, item.name));
                    }) }) }), _jsx("div", { className: "lg:hidden h-16 w-full pointer-events-none" })] }));
};
