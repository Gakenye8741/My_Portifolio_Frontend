// src/Components/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  LogOut, LayoutDashboard, Home, Code2, Cpu, Mail,
  Briefcase, BookOpen, HelpCircle, MoreHorizontal, X, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../public/main.jpg";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { clearCredentials } from "../Features/Auth/AuthSlice";
import type { RootState } from "../App/store";
import ThemeToggle from "../ThemeToggle";

const primaryItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Projects", path: "/projects", icon: Code2 },
  { name: "Blog", path: "/blog", icon: BookOpen },
  { name: "FAQs", path: "/faqs", icon: HelpCircle },
  { name: "Contact", path: "/contact", icon: Mail },
];

const moreItems = [
  { name: "Tools", path: "/tech", icon: Cpu },
  { name: "Services", path: "/services", icon: Briefcase },
];

const allItems = [...primaryItems, ...moreItems];

const isPageActive = (path: string, pathname: string) => {
  if (path === "/") return pathname === "/";
  if (path === "/projects") return pathname.startsWith("/project");
  if (path === "/blog") return pathname.startsWith("/blog");
  if (path === "/faqs") return pathname.startsWith("/faq");
  return pathname.startsWith(path);
};

const getInitials = (name?: string) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

export const Navbar: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const base = theme["base-100"];
  const text = theme["base-content"];
  const primary = theme.primary;
  const borderSoft = `${text}12`;
  const secondary = theme.secondary || primary;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenuOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap');
        
        .nb-root { font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif; letter-spacing: -0.01em; }
        
        @media (max-width: 1023px) {
          body { padding-bottom: calc(6rem + env(safe-area-inset-bottom)); }
        }
        
        @keyframes nb-slide-down {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nb-slide-up {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nb-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes nb-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes nb-pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.5); opacity: 0.6; }
        }
        @keyframes nb-shine {
          0%   { transform: translateX(-130%) skewX(-20deg); }
          60%, 100% { transform: translateX(280%) skewX(-20deg); }
        }
        @keyframes nb-ring-pulse {
          0%   { box-shadow: 0 0 0 0 ${primary}55; }
          70%  { box-shadow: 0 0 0 10px ${primary}00; }
          100% { box-shadow: 0 0 0 0 ${primary}00; }
        }
        @keyframes nb-bar-in {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes nb-icon-wiggle {
          0%   { transform: rotate(0) scale(1); }
          25%  { transform: rotate(-10deg) scale(1.15); }
          50%  { transform: rotate(8deg) scale(1.1); }
          75%  { transform: rotate(-4deg) scale(1.05); }
          100% { transform: rotate(0) scale(1); }
        }
        @keyframes nb-active-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.9; transform: scale(1.08); }
        }
        @keyframes nb-top-shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        /* New: rotating conic gradient behind the logo */
        @keyframes nb-logo-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        /* New: diagonal sheen sweeping across the logo */
        @keyframes nb-logo-sheen {
          0%, 55% { transform: translateX(-150%) skewX(-20deg); }
          100%    { transform: translateX(260%) skewX(-20deg); }
        }
        
        .nb-slide-down { animation: nb-slide-down 0.22s cubic-bezier(.2,.7,.2,1) both; }
        .nb-slide-up   { animation: nb-slide-up 0.32s cubic-bezier(.2,.7,.2,1) both; }
        .nb-fade-in    { animation: nb-fade-in 0.2s ease-out both; }
        .nb-pop        { animation: nb-pop 0.32s cubic-bezier(.3,.8,.3,1) both; }
        .nb-bar-in     { animation: nb-bar-in 0.45s cubic-bezier(.2,.7,.2,1) 0.15s both; }
        .nb-icon-wiggle { animation: nb-icon-wiggle 0.5s cubic-bezier(.3,.8,.3,1); }
        
        /* ── Logo frame ── */
        .nb-logo-glow {
          filter: blur(10px);
          opacity: 0.75;
          animation: nb-logo-spin 12s linear infinite;
          will-change: transform;
        }
        .nb-logo-sheen-wrap::after {
          content: "";
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 60%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
          animation: nb-logo-sheen 4.5s ease-in-out infinite;
          pointer-events: none;
        }
        
        .nb-brand-dot { animation: nb-pulse-dot 2.4s ease-in-out infinite; }
        
        .nb-link { transition: all 0.25s cubic-bezier(.2,.7,.2,1); }
        .nb-link:not([data-active="true"]):hover { background-color: ${text}0a; color: ${text}; }
        .nb-link .nb-icon { transition: transform 0.3s cubic-bezier(.3,.8,.3,1); }
        .nb-link:hover .nb-icon { transform: translateY(-1px) scale(1.1); }
        
        .nb-hire { position: relative; overflow: hidden; transition: transform 0.25s cubic-bezier(.2,.7,.2,1), box-shadow 0.25s; }
        .nb-hire::after {
          content: ""; position: absolute; inset: 0; width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: nb-shine 3.5s ease-in-out infinite;
          pointer-events: none;
        }
        .nb-hire:hover { transform: translateY(-1px); box-shadow: 0 8px 24px -8px ${primary}80; }
        .nb-hire:active { transform: scale(0.97); }
        
        .nb-avatar { transition: transform 0.3s cubic-bezier(.3,.8,.3,1); }
        .nb-avatar:hover { transform: scale(1.06); animation: nb-ring-pulse 1.4s ease-out infinite; }
        
        .nb-bottom-link {
          transition: transform 0.18s ease;
          -webkit-tap-highlight-color: transparent;
          isolation: isolate;
        }
        .nb-bottom-link:active { transform: scale(0.86); }
        .nb-bottom-link:active > * { transition-duration: 0.05s; }
        
        .nb-active-glow { animation: nb-active-glow 2.4s ease-in-out infinite; }
        
        .nb-bar-shimmer::before {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 40%; height: 1px;
          background: linear-gradient(90deg, transparent, ${primary}aa, transparent);
          animation: nb-top-shimmer 4.5s ease-in-out infinite;
          pointer-events: none;
        }
        
        .nb-sheet-handle {
          width: 44px; height: 4px; border-radius: 999px;
          background-color: ${text}22; margin: 10px auto 0;
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation: none !important;
            transition-duration: 0ms !important;
          }
        }
      `}</style>

      {/* ============================== Desktop header ============================== */}
      <header
        className={`nb-root hidden lg:block fixed top-0 left-0 right-0 z-[120] transition-all duration-300 ${scrolled ? "backdrop-blur-xl" : ""}`}
        style={{
          backgroundColor: scrolled ? `${base}e8` : base,
          borderBottom: `1px solid ${scrolled ? borderSoft : "transparent"}`,
          color: text,
          boxShadow: scrolled ? `0 4px 24px -8px rgba(0,0,0,0.08)` : "none",
        }}
      >
        <div className="mx-auto max-w-7xl h-16 px-6 flex items-center justify-between gap-6">
          {/* ============ DESKTOP LOGO — bigger, framed, animated ============ */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group" aria-label="Home">
            <motion.div
              className="relative shrink-0"
              initial={{ opacity: 0, rotate: -20, scale: 0.75 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              whileHover={{ scale: 1.08, rotate: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            >
              {/* Rotating conic-gradient halo */}
              <span
                className="nb-logo-glow absolute -inset-1.5 rounded-[18px] -z-10"
                style={{
                  background: `conic-gradient(from 0deg, transparent, ${primary}, ${secondary}, transparent)`,
                }}
                aria-hidden
              />
              {/* Glass backing + ring */}
              <span
                className="absolute inset-0 rounded-2xl"
                style={{
                  backgroundColor: `${text}08`,
                  border: `1px solid ${primary}45`,
                  boxShadow: `inset 0 1px 0 ${text}12`,
                }}
                aria-hidden
              />
              {/* Logo */}
              <img
                src={logo}
                alt=""
                className="relative w-12 h-12 object-contain rounded-2xl p-1"
                draggable={false}
              />
              {/* Sheen sweep */}
              <span
                className="nb-logo-sheen-wrap absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"
                aria-hidden
              />
            </motion.div>
            <span className="text-base font-bold tracking-tight">
              Gakenye <span style={{ color: primary }}>Ndiritu</span>
              <span
                className="nb-brand-dot inline-block ml-1 w-1.5 h-1.5 rounded-full align-middle"
                style={{ backgroundColor: primary }}
              />
            </span>
          </Link>

          <nav
            className="flex items-center gap-0.5 p-1 rounded-full"
            style={{ backgroundColor: `${text}06`, border: `1px solid ${text}0c` }}
            aria-label="Page navigation"
          >
            {allItems.map((item) => {
              const active = isPageActive(item.path, location.pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  data-active={active}
                  className="nb-link flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-semibold"
                  style={{
                    color: active ? theme["base-100"] : `${text}bb`,
                    backgroundColor: active ? primary : "transparent",
                    boxShadow: active ? `0 4px 12px -4px ${primary}66` : "none",
                  }}
                >
                  <Icon size={13} className="nb-icon" strokeWidth={active ? 2.5 : 2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="nb-avatar flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full border"
                  style={{
                    borderColor: userMenuOpen ? primary : borderSoft,
                    backgroundColor: `${text}06`,
                  }}
                >
                  <span className="text-xs font-semibold opacity-80 hidden xl:block">
                    {user?.fullName?.split(" ")[0] || "Admin"}
                  </span>
                  <span
                    className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold border-2"
                    style={{ backgroundColor: `${primary}20`, borderColor: primary, color: primary }}
                  >
                    {getInitials(user?.fullName)}
                  </span>
                </button>
                {userMenuOpen && (
                  <div
                    role="menu"
                    className="nb-slide-down absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl overflow-hidden origin-top-right"
                    style={{
                      backgroundColor: base,
                      borderColor: borderSoft,
                      boxShadow: `0 20px 40px -12px rgba(0,0,0,0.18)`,
                    }}
                  >
                    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
                    <div className="p-1.5">
                      <div className="flex items-center gap-3 px-3 py-2.5 mb-1 border-b" style={{ borderColor: borderSoft }}>
                        <span
                          className="w-9 h-9 rounded-full grid place-items-center text-[11px] font-bold border-2 shrink-0"
                          style={{ backgroundColor: `${primary}20`, borderColor: primary, color: primary }}
                        >
                          {getInitials(user?.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{user?.fullName || "Admin"}</p>
                          <p className="text-[11px] truncate opacity-60">{user?.email}</p>
                        </div>
                      </div>
                      <Link
                        to="/admin-dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full p-2.5 rounded-xl transition-colors"
                        style={{ color: text }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${text}0d`)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <LayoutDashboard size={15} style={{ color: primary }} />
                        <span className="text-sm font-semibold">Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full p-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={15} />
                        <span className="text-sm font-semibold">Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/contact"
                className="nb-hire inline-flex items-center rounded-full px-4 py-2 text-xs font-bold"
                style={{ backgroundColor: primary, color: theme["base-100"] }}
              >
                <span className="relative z-10">Hire me</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ============================== Mobile top bar ============================== */}
      <header
        className="nb-root lg:hidden fixed top-0 left-0 right-0 z-[120] h-14 border-b backdrop-blur-xl flex items-center justify-between px-4"
        style={{ backgroundColor: `${base}e6`, borderColor: borderSoft, color: text }}
      >
        {/* ============ MOBILE LOGO — bigger, framed, animated ============ */}
        <Link to="/" className="flex items-center gap-2.5 min-w-0" aria-label="Home">
          <motion.div
            className="relative shrink-0"
            initial={{ opacity: 0, rotate: -20, scale: 0.75 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
          >
            <span
              className="nb-logo-glow absolute -inset-1 rounded-[14px] -z-10"
              style={{
                background: `conic-gradient(from 0deg, transparent, ${primary}, ${secondary}, transparent)`,
              }}
              aria-hidden
            />
            <span
              className="absolute inset-0 rounded-xl"
              style={{
                backgroundColor: `${text}08`,
                border: `1px solid ${primary}45`,
                boxShadow: `inset 0 1px 0 ${text}12`,
              }}
              aria-hidden
            />
            <img
              src={logo}
              alt=""
              className="relative w-10 h-10 object-contain rounded-xl p-1"
              draggable={false}
            />
            <span
              className="nb-logo-sheen-wrap absolute inset-0 rounded-xl overflow-hidden pointer-events-none"
              aria-hidden
            />
          </motion.div>
          <span className="text-[15px] font-bold tracking-tight truncate">
            Gakenye <span style={{ color: primary }}>Ndiritu</span>
            <span
              className="nb-brand-dot inline-block ml-1 w-1 h-1 rounded-full align-middle"
              style={{ backgroundColor: primary }}
            />
          </span>
        </Link>

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />
          {isAuthenticated && (
            <Link
              to="/admin-dashboard"
              className="nb-avatar w-8 h-8 rounded-full grid place-items-center text-[10px] font-bold border-2"
              style={{ backgroundColor: `${primary}20`, borderColor: primary, color: primary }}
              aria-label="Dashboard"
            >
              {getInitials(user?.fullName)}
            </Link>
          )}
        </div>
      </header>

      {/* ============================== Mobile floating bottom bar ============================== */}
      <nav
        className="nb-root lg:hidden fixed inset-x-0 bottom-0 z-[120]"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        aria-label="Page navigation"
      >
        <div
          className="nb-bar-in nb-bar-shimmer relative mx-3 rounded-[22px] border backdrop-blur-2xl overflow-hidden"
          style={{
            backgroundColor: `${base}f2`,
            borderColor: `${text}15`,
            color: text,
            boxShadow: `0 12px 40px -8px rgba(0,0,0,0.3), inset 0 1px 0 ${text}10`,
          }}
        >
          <div className="grid grid-cols-6 h-[60px]">
            {primaryItems.map((item, idx) => {
              const active = isPageActive(item.path, location.pathname);
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.04, duration: 0.3, ease: "easeOut" }}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    aria-current={active ? "page" : undefined}
                    aria-label={item.name}
                    className="nb-bottom-link relative isolate flex flex-col items-center justify-center gap-0.5 h-full w-full"
                  >
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-glow"
                        className="nb-active-glow absolute inset-x-2 top-1.5 bottom-1.5 rounded-2xl -z-20 blur-md"
                        style={{ backgroundColor: `${primary}40` }}
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        aria-hidden
                      />
                    )}
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-active-pill"
                        className="absolute inset-x-1 top-1 bottom-1 rounded-2xl -z-10"
                        style={{ backgroundColor: `${primary}1f` }}
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        aria-hidden
                      />
                    )}
                    <motion.span
                      key={active ? "on" : "off"}
                      className={active ? "nb-icon-wiggle inline-flex" : "inline-flex"}
                      animate={active ? { y: [0, -2, 0] } : { y: 0 }}
                      transition={active ? { duration: 0.5, ease: "easeOut" } : { duration: 0.2 }}
                    >
                      <Icon size={19} strokeWidth={active ? 2.4 : 1.8} style={{ color: active ? primary : `${text}70` }} />
                    </motion.span>
                    <motion.span
                      className="text-[9.5px] leading-none tracking-tight"
                      animate={active ? { color: primary, fontWeight: 700, scale: 1.05 } : { color: `${text}70`, fontWeight: 500, scale: 1 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      {item.name}
                    </motion.span>
                    <motion.span
                      aria-hidden
                      className="absolute inset-2 rounded-full pointer-events-none"
                      style={{ backgroundColor: `${primary}30` }}
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1.6, opacity: [0.6, 0] }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </Link>
                </motion.div>
              );
            })}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + primaryItems.length * 0.04, duration: 0.3, ease: "easeOut" }}
              className="relative"
            >
              <button
                onClick={() => setMoreOpen(true)}
                aria-label="More"
                className="nb-bottom-link relative flex flex-col items-center justify-center gap-0.5 h-full w-full"
              >
                <motion.span
                  animate={{ rotate: moreOpen ? 90 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="inline-flex"
                >
                  <MoreHorizontal size={19} strokeWidth={2} style={{ color: `${text}70` }} />
                </motion.span>
                <span className="text-[9.5px] leading-none tracking-tight" style={{ color: `${text}70` }}>
                  More
                </span>
                <motion.span
                  aria-hidden
                  className="absolute inset-2 rounded-full pointer-events-none"
                  style={{ backgroundColor: `${primary}30` }}
                  initial={{ scale: 0, opacity: 0 }}
                  whileTap={{ scale: 1.6, opacity: [0.6, 0] }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* ============================== More sheet (mobile) ============================== */}
      <AnimatePresence>
        {moreOpen && (
          <div
            className="nb-root lg:hidden fixed inset-0 z-[130]"
            role="dialog"
            aria-modal="true"
            aria-label="More options"
          >
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-x shadow-2xl overflow-hidden"
              style={{
                backgroundColor: base,
                borderColor: borderSoft,
                paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                color: text,
              }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="nb-sheet-handle" aria-hidden="true" />
              <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: borderSoft }}>
                <p className="text-base font-bold">More</p>
                <motion.button
                  onClick={() => setMoreOpen(false)}
                  aria-label="Close"
                  className="grid place-items-center w-8 h-8 rounded-full"
                  style={{ backgroundColor: `${text}08` }}
                  whileHover={{ rotate: 90, scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <X size={15} />
                </motion.button>
              </div>
              <div className="p-3 space-y-1">
                {moreItems.map((item, i) => {
                  const active = isPageActive(item.path, location.pathname);
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05, duration: 0.25, ease: "easeOut" }}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                        style={{
                          backgroundColor: active ? `${primary}12` : "transparent",
                          color: active ? primary : text,
                        }}
                      >
                        <span
                          className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
                          style={{
                            backgroundColor: active ? `${primary}1f` : `${text}08`,
                            color: active ? primary : text,
                          }}
                        >
                          <Icon size={16} />
                        </span>
                        <span className="text-sm font-semibold flex-1">{item.name}</span>
                        <ChevronRight size={14} className="opacity-40" />
                      </Link>
                    </motion.div>
                  );
                })}
                {isAuthenticated && (
                  <>
                    <div className="my-2 h-px" style={{ backgroundColor: borderSoft }} />
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + moreItems.length * 0.05, duration: 0.25 }}
                    >
                      <Link
                        to="/admin-dashboard"
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ color: text }}
                      >
                        <span
                          className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
                          style={{ backgroundColor: `${primary}1f`, color: primary }}
                        >
                          <LayoutDashboard size={16} />
                        </span>
                        <span className="text-sm font-semibold flex-1">Dashboard</span>
                        <ChevronRight size={14} className="opacity-40" />
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + (moreItems.length + 1) * 0.05, duration: 0.25 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <span className="grid place-items-center w-10 h-10 rounded-xl shrink-0 bg-red-500/10">
                          <LogOut size={16} />
                        </span>
                        <span className="text-sm font-semibold flex-1 text-left">Log out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};