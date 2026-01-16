import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { SideNav } from "./Sidenav";
export const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (_jsxs("div", { className: "flex h-screen bg-base-100 text-base-content", children: [_jsx("button", { onClick: () => setSidebarOpen(true), className: "md:hidden fixed top-4 left-4 z-50 p-2 bg-base-200 rounded shadow", "aria-label": "Open Sidebar", children: _jsx(Menu, { size: 24 }) }), _jsx("aside", { className: "hidden md:block w-64 h-full bg-base-200 border-r border-base-300 fixed top-0 left-0 z-30", children: _jsx(SideNav, {}) }), sidebarOpen && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-40 bg-black bg-opacity-40 backdrop-blur-sm", onClick: () => setSidebarOpen(false) }), _jsx("aside", { className: "fixed top-0 left-0 z-50 w-64 h-full bg-base-200 border-r border-base-300 transform transition-transform duration-300 md:hidden translate-x-0", children: _jsx(SideNav, { onNavItemClick: () => setSidebarOpen(false) }) })] })), _jsx("main", { className: "flex-1 overflow-y-auto p-4 md:ml-64", children: _jsx(Outlet, {}) })] }));
};
