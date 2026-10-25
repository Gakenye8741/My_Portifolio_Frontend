// src/Features/Pages/AdminLayout.tsx
import { useState, useEffect } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AdminSideNav } from "../dashboardDesign/AdminSidenav";
import {
  X,
  ShieldCheck,
  ChevronRight,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../../../ThemeContext";

const SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 768px)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    if (sidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sidebarOpen]);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const lastSeg = pathSegments[pathSegments.length - 1] ?? "console";
  const pageTitle =
    lastSeg === "admin-dashboard"
      ? "Console"
      : lastSeg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  useEffect(() => {
    const prev = document.title;
    document.title = `${pageTitle} · Admin · Gakenye Ndiritu`;
    return () => {
      document.title = prev;
    };
  }, [pageTitle]);

  const primary = theme.primary;
  const base = theme["base-100"];
  const text = theme["base-content"];

  const expandedW = 256;
  const collapsedW = 80;
  const currentW = collapsed ? collapsedW : expandedW;

  const isConsoleRoot = location.pathname === "/admin-dashboard";

  const mainMarginLeft = isDesktop ? currentW : 0;

  return (
    <div
      className="flex h-screen relative font-sans transition-colors duration-500 overflow-hidden"
      style={{ backgroundColor: base, color: text }}
    >
      <style>{`
        @keyframes al-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes al-sheet-in {
          from { opacity: 0; transform: translateX(-16px) scale(0.98); }
          to   { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes al-trigger-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .al-fade-in { animation: al-fade-in 0.2s ease-out both; }
        .al-sheet-in { animation: al-sheet-in 0.28s cubic-bezier(.2,.7,.2,1) both; }
        .al-trigger-in { animation: al-trigger-in 0.25s cubic-bezier(.2,.7,.2,1) both; }

        @media (prefers-reduced-motion: reduce) {
          .al-fade-in, .al-sheet-in, .al-trigger-in {
            animation: none !important;
          }
        }
      `}</style>

      {/* GLOBAL BACKGROUND */}
      <div
        className="fixed inset-x-0 top-0 h-[40rem] pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: `radial-gradient(${text}1a 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)",
        }}
      />
      <div
        className="fixed -top-32 -left-32 w-[28rem] h-[28rem] rounded-full blur-[140px] opacity-[0.08] pointer-events-none z-0"
        style={{ backgroundColor: primary }}
      />
      <div
        className="fixed bottom-0 right-0 w-[24rem] h-[24rem] rounded-full blur-[130px] opacity-[0.06] pointer-events-none z-0"
        style={{ backgroundColor: theme.secondary || primary }}
      />

      {/* ============================================================
          MOBILE TRIGGER — pill with icon + label
          ============================================================ */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="al-trigger-in md:hidden fixed top-[4.5rem] left-3 z-[130] inline-flex items-center gap-2 h-11 pl-2.5 pr-4 rounded-full border shadow-lg active:scale-95 transition-all"
          style={{
            backgroundColor: `${base}f0`,
            borderColor: `${primary}55`,
            color: text,
            boxShadow: `0 8px 24px -12px ${primary}88`,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          aria-label="Open admin menu"
          aria-expanded={sidebarOpen}
          aria-controls="mobile-sidebar"
        >
          <span
            className="grid place-items-center h-7 w-7 rounded-full"
            style={{ backgroundColor: primary, color: base }}
          >
            {/* Custom 3-line icon */}
            <span className="flex flex-col items-center justify-center gap-[3px] w-3.5">
              <span className="h-[2px] w-full rounded-full bg-current" />
              <span className="h-[2px] w-full rounded-full bg-current" />
              <span className="h-[2px] w-full rounded-full bg-current" />
            </span>
          </span>
          <span className="text-xs font-bold tracking-wide">Menu</span>
        </button>
      )}

      {/* ============================================================
          DESKTOP SIDEBAR
          ============================================================ */}
      <aside
        className="hidden md:flex md:flex-col fixed left-0 z-[90] border-r backdrop-blur-xl transition-[width] duration-300 ease-[cubic-bezier(.2,.7,.2,1)] overflow-hidden"
        style={{
          top: "5rem",
          height: "calc(100vh - 5rem)",
          width: currentW,
          backgroundColor: `${base}ee`,
          borderColor: `${text}10`,
        }}
        data-collapsed={collapsed ? "true" : "false"}
        aria-label="Sidebar"
      >
        <div className="flex-1 min-h-0 w-full h-full">
          <AdminSideNav onNavItemClick={() => {}} />
        </div>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute top-4 -right-3 z-[5] grid place-items-center h-7 w-7 rounded-full border shadow-lg transition-all hover:scale-110 active:scale-95"
          style={{
            backgroundColor: base,
            borderColor: `${text}20`,
            color: primary,
          }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
        </button>
      </aside>

      {/* ============================================================
          MOBILE DRAWER — floating sheet design
          ============================================================ */}
      <div
        id="mobile-sidebar"
        className={`fixed inset-0 z-[140] md:hidden transition-opacity duration-200 ${
          sidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Dark backdrop with fade */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${
            sidebarOpen ? "al-fade-in" : ""
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Floating card panel — detached from edges */}
        <aside
          className={`absolute top-3 left-3 bottom-3 w-[85vw] max-w-[19rem] rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
            sidebarOpen ? "al-sheet-in" : ""
          }`}
          style={{
            backgroundColor: `${base}f8`,
            borderColor: `${primary}33`,
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: `0 24px 60px -20px ${primary}55, 0 8px 20px -8px rgba(0,0,0,0.25)`,
          }}
        >
          {/* Accent top strip */}
          <div
            className="h-1 shrink-0"
            style={{
              backgroundImage: `linear-gradient(90deg, ${primary}, ${
                theme.secondary || primary
              })`,
            }}
          />

          {/* Header */}
          <div
            className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b"
            style={{ borderColor: `${text}10` }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className="grid place-items-center h-9 w-9 rounded-xl shrink-0"
                style={{ backgroundColor: `${primary}1f`, color: primary }}
              >
                <LayoutDashboard size={16} />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-50 flex items-center gap-1">
                  <Sparkles size={9} /> Admin
                </p>
                <p className="text-sm font-bold truncate">Navigation</p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="grid place-items-center h-9 w-9 rounded-xl transition-all active:scale-90 hover:rotate-90"
              style={{ color: text, backgroundColor: `${text}0a` }}
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav (scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <AdminSideNav onNavItemClick={() => setSidebarOpen(false)} />
          </div>

          {/* Footer */}
          <div
            className="shrink-0 px-4 py-3 border-t flex items-center justify-between gap-2"
            style={{ borderColor: `${text}10` }}
          >
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold opacity-60">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: "#10b981" }}
              />
              Session active
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold rounded-md px-2 py-1"
              style={{ backgroundColor: `${primary}15`, color: primary }}
            >
              v2.06
            </span>
          </div>
        </aside>
      </div>

      {/* MAIN CONTENT */}
      <main
        className="flex-1 min-h-screen overflow-y-auto relative z-10 transition-[margin] duration-300 ease-[cubic-bezier(.2,.7,.2,1)]"
        style={{
          scrollBehavior: "smooth",
          marginLeft: mainMarginLeft,
        }}
      >
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 pt-16 md:pt-6 pb-16">
          <header className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] font-medium opacity-60 flex-wrap">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1 hover:opacity-100 transition-opacity shrink-0"
                >
                  <Home size={11} />
                  Home
                </Link>
                <ChevronRight size={11} className="opacity-50 shrink-0" />

                <Link
                  to="/admin-dashboard"
                  className="hover:opacity-100 transition-opacity shrink-0"
                  aria-current={isConsoleRoot ? "page" : undefined}
                >
                  Admin
                </Link>

                {!isConsoleRoot && (
                  <>
                    <ChevronRight size={11} className="opacity-50 shrink-0" />
                    <span
                      className="truncate max-w-[45vw] sm:max-w-none"
                      style={{ color: primary }}
                      aria-current="page"
                    >
                      {pageTitle}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold"
                style={{
                  borderColor: "#10b98155",
                  color: "#10b981",
                  backgroundColor: "#10b98110",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                Session active
              </span>

              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 py-1 text-[10px] sm:text-[11px] font-semibold"
                style={{
                  borderColor: `${primary}44`,
                  color: primary,
                  backgroundColor: `${primary}10`,
                }}
              >
                <ShieldCheck size={11} />
                Protected
              </span>

              <button
                onClick={() => setCollapsed((c) => !c)}
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: `${text}20`,
                  color: text,
                  backgroundColor: `${text}06`,
                }}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeftOpen size={11} /> : <PanelLeftClose size={11} />}
                {collapsed ? "Expand" : "Collapse"}
              </button>
            </div>
          </header>

          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};