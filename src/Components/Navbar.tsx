// src/Components/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  LogOut,
  LayoutDashboard,
  Home,
  Code2,
  Cpu,
  Mail,
  Briefcase,
  BookOpen,
  HelpCircle,
  MoreHorizontal,
  X,
  ChevronRight,
} from "lucide-react";
import logo from "../../public/LOGO.png";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { clearCredentials } from "../Features/Auth/AuthSlice";
import type { RootState } from "../App/store";
import ThemeToggle from "../ThemeToggle";

/* ---------- Menu ---------- */
const primaryItems = [
  { name: "Home",     path: "/",         icon: Home },
  { name: "Projects", path: "/projects", icon: Code2 },
  { name: "Blog",     path: "/blog",     icon: BookOpen },
  { name: "FAQs",     path: "/faqs",     icon: HelpCircle },
  { name: "Contact",  path: "/contact",  icon: Mail },
];

const moreItems = [
  { name: "Tools",    path: "/tech",     icon: Cpu },
  { name: "Services", path: "/services", icon: Briefcase },
];

const allItems = [...primaryItems, ...moreItems];

const isPageActive = (path: string, pathname: string) => {
  if (path === "/") return pathname === "/";
  if (path === "/projects") return pathname.startsWith("/project");
  if (path === "/blog")     return pathname.startsWith("/blog");
  if (path === "/faqs")     return pathname.startsWith("/faq");
  return pathname.startsWith(path);
};

const getInitials = (name?: string) =>
  name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "AD";

/* ============================================================ */
export const Navbar: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen]         = useState(false);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const base    = theme["base-100"];
  const text    = theme["base-content"];
  const primary = theme.primary;
  const borderSoft = `${text}12`;

  /* ---------- Close menus on route change ---------- */
  useEffect(() => {
    setUserMenuOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  /* ---------- Close on outside / Esc ---------- */
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
        /* Reserve space so the mobile bottom bar never covers content */
        @media (max-width: 1023px) {
          body { padding-bottom: calc(5.25rem + env(safe-area-inset-bottom)); }
        }

        /* ---------- Animations ---------- */
        @keyframes nb-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
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
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes nb-logo-in {
          0%   { opacity: 0; transform: rotate(-25deg) scale(0.7); }
          100% { opacity: 1; transform: rotate(0) scale(1); }
        }
        @keyframes nb-pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.6); opacity: 0.7; }
        }
        @keyframes nb-shine {
          0%   { transform: translateX(-120%) skewX(-20deg); }
          60%, 100% { transform: translateX(260%) skewX(-20deg); }
        }
        @keyframes nb-ring-pulse {
          0%   { box-shadow: 0 0 0 0 ${primary}66; }
          70%  { box-shadow: 0 0 0 8px ${primary}00; }
          100% { box-shadow: 0 0 0 0 ${primary}00; }
        }

        .nb-slide-down { animation: nb-slide-down 0.25s cubic-bezier(.2,.7,.2,1) both; }
        .nb-slide-up   { animation: nb-slide-up 0.35s cubic-bezier(.2,.7,.2,1) both; }
        .nb-fade-in    { animation: nb-fade-in 0.2s ease-out both; }
        .nb-pop        { animation: nb-pop 0.35s cubic-bezier(.3,.8,.3,1) both; }
        .nb-logo-in    { animation: nb-logo-in 0.7s cubic-bezier(.2,.7,.2,1) 0.05s both; }

        /* Logo hover */
        .nb-logo:hover { transform: rotate(-8deg) scale(1.05); }
        .nb-logo { transition: transform 0.4s cubic-bezier(.2,.7,.2,1); }

        /* Brand dot pulses */
        .nb-brand-dot { animation: nb-pulse-dot 2.4s ease-in-out infinite; }

        /* Desktop link hover */
        .nb-link { position: relative; transition: color 0.2s ease, background-color 0.2s ease; }
        .nb-link .nb-underline {
          position: absolute; bottom: 2px; left: 50%;
          width: 0; height: 2px;
          background-color: ${primary};
          border-radius: 2px;
          transform: translateX(-50%);
          transition: width 0.3s cubic-bezier(.2,.7,.2,1);
        }
        .nb-link:hover .nb-underline { width: 60%; }
        .nb-link[data-active="true"] .nb-underline { width: 60%; }
        .nb-link .nb-link-icon { transition: transform 0.3s cubic-bezier(.3,.8,.3,1); }
        .nb-link:hover .nb-link-icon { transform: translateY(-1px) rotate(-6deg) scale(1.1); }

        /* Hire me shine */
        .nb-hire { position: relative; overflow: hidden; }
        .nb-hire::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent);
          animation: nb-shine 3.2s ease-in-out infinite;
          pointer-events: none;
        }
        .nb-hire:hover { transform: translateY(-2px) scale(1.03); }
        .nb-hire:active { transform: scale(0.97); }
        .nb-hire { transition: transform 0.25s cubic-bezier(.2,.7,.2,1); }

        /* Avatar ring pulse */
        .nb-avatar { transition: transform 0.3s cubic-bezier(.3,.8,.3,1); }
        .nb-avatar:hover { transform: scale(1.08); animation: nb-ring-pulse 1.4s ease-out infinite; }

        /* Mobile bottom nav active indicator */
        .nb-bottom-link { transition: transform 0.2s ease; }
        .nb-bottom-link:active { transform: scale(0.9); }

        /* More sheet handle */
        .nb-sheet-handle {
          width: 40px; height: 4px; border-radius: 999px;
          background-color: ${text}22; margin: 8px auto 0;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition-duration: 0ms !important;
          }
        }
      `}</style>

      {/* ============================================================
          TOP BAR (desktop only — hidden on mobile)
          ============================================================ */}
      <header
        className="hidden lg:block fixed top-0 left-0 right-0 z-[120] border-b"
        style={{
          backgroundColor: base,
          borderColor: borderSoft,
          color: text,
        }}
      >
        <div className="mx-auto max-w-7xl h-16 px-6 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="Home"
          >
            <img
              src={logo}
              alt=""
              className="nb-logo nb-logo-in w-8 h-8 object-contain"
            />
            <span className="text-base font-bold tracking-tight">
              Gakenye{" "}
              <span className="inline-block" style={{ color: primary }}>
                Ndiritu
              </span>
              <span
                className="nb-brand-dot inline-block ml-1 w-1.5 h-1.5 rounded-full align-middle"
                style={{ backgroundColor: primary }}
              />
            </span>
          </Link>

          {/* Center nav */}
          <nav className="flex items-center gap-1" aria-label="Page navigation">
            {allItems.map((item) => {
              const active = isPageActive(item.path, location.pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  aria-current={active ? "page" : undefined}
                  data-active={active}
                  className="nb-link flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium"
                  style={{
                    color: active ? primary : `${text}cc`,
                    backgroundColor: active ? `${primary}10` : "transparent",
                  }}
                >
                  <Icon
                    size={14}
                    className="nb-link-icon"
                    style={{ opacity: active ? 1 : 0.6 }}
                  />
                  <span>{item.name}</span>
                  <span className="nb-underline" />
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
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
                    style={{
                      backgroundColor: `${primary}20`,
                      borderColor: primary,
                      color: primary,
                    }}
                  >
                    {getInitials(user?.fullName)}
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    role="menu"
                    className="nb-slide-down absolute right-0 mt-2 w-64 rounded-2xl border p-1.5 shadow-2xl origin-top-right"
                    style={{ backgroundColor: base, borderColor: borderSoft }}
                  >
                    <div
                      className="flex items-center gap-3 px-3 py-2.5 mb-1 border-b"
                      style={{ borderColor: borderSoft }}
                    >
                      <span
                        className="w-9 h-9 rounded-full grid place-items-center text-[11px] font-bold border-2 shrink-0"
                        style={{
                          backgroundColor: `${primary}20`,
                          borderColor: primary,
                          color: primary,
                        }}
                      >
                        {getInitials(user?.fullName)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          {user?.fullName || "Admin"}
                        </p>
                        <p className="text-[11px] truncate opacity-60">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/admin-dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 w-full p-2.5 rounded-xl hover:bg-[color:var(--hov)] transition-colors"
                      style={{ ["--hov" as any]: `${text}0d` }}
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
                )}
              </div>
            ) : (
              <Link
                to="/contact"
                className="nb-hire inline-flex items-center rounded-full px-4 py-2 text-xs font-bold"
                style={{ backgroundColor: primary, color: base }}
              >
                <span className="relative z-10">Hire me</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MOBILE TOP BAR — full name shown
          ============================================================ */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-[120] h-14 border-b backdrop-blur-xl flex items-center justify-between px-4"
        style={{
          backgroundColor: `${base}e6`,
          borderColor: borderSoft,
          color: text,
        }}
      >
        <Link to="/" className="flex items-center gap-2 min-w-0" aria-label="Home">
          <img
            src={logo}
            alt=""
            className="nb-logo nb-logo-in w-7 h-7 object-contain shrink-0"
          />
          <span className="text-sm font-bold tracking-tight truncate">
            Gakenye{" "}
            <span className="inline-block" style={{ color: primary }}>
              Ndiritu
            </span>
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
              className="nb-avatar w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold border-2"
              style={{
                backgroundColor: `${primary}20`,
                borderColor: primary,
                color: primary,
              }}
              aria-label="Dashboard"
            >
              {getInitials(user?.fullName)}
            </Link>
          )}
        </div>
      </header>

      {/* ============================================================
          MOBILE BOTTOM NAV
          ============================================================ */}
      <nav
        className="lg:hidden fixed inset-x-0 bottom-0 z-[120] border-t backdrop-blur-xl"
        style={{
          backgroundColor: `${base}f0`,
          borderColor: borderSoft,
          paddingBottom: "env(safe-area-inset-bottom)",
          color: text,
        }}
        aria-label="Page navigation"
      >
        <div className="grid grid-cols-6 h-16">
          {primaryItems.map((item) => {
            const active = isPageActive(item.path, location.pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                aria-current={active ? "page" : undefined}
                aria-label={item.name}
                className="nb-bottom-link relative flex flex-col items-center justify-center gap-0.5"
              >
                <Icon
                  key={active ? "on" : "off"}
                  className={active ? "nb-pop" : ""}
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? primary : `${text}88` }}
                />
                <span
                  className="text-[10px] leading-none"
                  style={{
                    color: active ? primary : `${text}88`,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {item.name}
                </span>
                {active && (
                  <span
                    className="nb-slide-down absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full"
                    style={{ backgroundColor: primary }}
                  />
                )}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            aria-label="More"
            className="nb-bottom-link relative flex flex-col items-center justify-center gap-0.5"
          >
            <MoreHorizontal
              size={20}
              strokeWidth={2}
              style={{ color: `${text}88` }}
            />
            <span
              className="text-[10px] leading-none"
              style={{ color: `${text}88` }}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ============================================================
          MORE SHEET (mobile)
          ============================================================ */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[130]"
          role="dialog"
          aria-modal="true"
          aria-label="More options"
        >
          <div
            className="nb-fade-in absolute inset-0 bg-black/50"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="nb-slide-up absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-x shadow-2xl"
            style={{
              backgroundColor: base,
              borderColor: borderSoft,
              paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
              color: text,
            }}
          >
            {/* Drag handle */}
            <div className="nb-sheet-handle" aria-hidden="true" />

            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: borderSoft }}
            >
              <p className="text-sm font-bold">More</p>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="grid place-items-center w-8 h-8 rounded-full transition-transform hover:rotate-90"
                style={{ backgroundColor: `${text}08` }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Items */}
            <div className="p-3 space-y-1">
              {moreItems.map((item) => {
                const active = isPageActive(item.path, location.pathname);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                    style={{
                      backgroundColor: active ? `${primary}12` : "transparent",
                      color: active ? primary : text,
                    }}
                  >
                    <span
                      className="grid place-items-center w-9 h-9 rounded-lg shrink-0"
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
                );
              })}

              {isAuthenticated && (
                <>
                  <div
                    className="my-2 h-px"
                    style={{ backgroundColor: borderSoft }}
                  />
                  <Link
                    to="/admin-dashboard"
                    onClick={() => setMoreOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ color: text }}
                  >
                    <span
                      className="grid place-items-center w-9 h-9 rounded-lg shrink-0"
                      style={{ backgroundColor: `${primary}1f`, color: primary }}
                    >
                      <LayoutDashboard size={16} />
                    </span>
                    <span className="text-sm font-semibold flex-1">Dashboard</span>
                    <ChevronRight size={14} className="opacity-40" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <span className="grid place-items-center w-9 h-9 rounded-lg shrink-0 bg-red-500/10">
                      <LogOut size={16} />
                    </span>
                    <span className="text-sm font-semibold flex-1 text-left">
                      Log out
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};