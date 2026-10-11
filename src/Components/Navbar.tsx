import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Home,
  Code2,
  Cpu,
  Mail,
  Briefcase,
} from "lucide-react";
import logo from "../../public/LOGO.png";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { clearCredentials } from "../Features/Auth/AuthSlice";
import type { RootState } from "../App/store";
import ThemeToggle from "../ThemeToggle";

// The pages in the menu
const menuItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Projects", path: "/projects", icon: Code2 },
  { name: "Tools", path: "/tech", icon: Cpu },
  { name: "Services", path: "/services", icon: Briefcase },
  { name: "Contact", path: "/contact", icon: Mail },
];

// Checks if a menu item is the page you are on
const isPageActive = (path: string, pathname: string) => {
  if (path === "/") return pathname === "/";
  // "/project/123" (one project) also counts as the Projects page
  if (path === "/projects") return pathname.startsWith("/project");
  return pathname.startsWith(path);
};

// Gets the first letters of a name, like "GN" for "Gakenye Ndiritu"
const getInitials = (name?: string) => {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "AD"
  );
};

export const Navbar: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [pill, setPill] = useState({ left: 0, width: 0, visible: false });

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  const base = theme["base-100"];
  const text = theme["base-content"];
  const primary = theme.primary;

  const activeIndex = menuItems.findIndex((item) => isPageActive(item.path, location.pathname));
  const pillTarget = hovered ?? activeIndex;

  // Scroll: make the bar float, and fill the thin line at the bottom
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPercent(total > 0 ? Math.min((y / total) * 100, 100) : 0);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  // Close the user menu when you go to another page
  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Move the sliding highlight behind the right link
  useLayoutEffect(() => {
    const place = () => {
      const el = linkRefs.current[pillTarget];
      if (el) {
        setPill({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
      } else {
        setPill((p) => ({ ...p, visible: false }));
      }
    };
    place();
    window.addEventListener("resize", place);
    // Fonts can change the link sizes a little after the page loads
    const timer = setTimeout(place, 300);
    return () => {
      window.removeEventListener("resize", place);
      clearTimeout(timer);
    };
  }, [pillTarget, location.pathname]);

  const handleLogout = () => {
    dispatch(clearCredentials());
    setUserMenuOpen(false);
    navigate("/");
  };

  const borderSoft = `${text}14`;

  return (
    <>
      <style>{`
        @keyframes nb-drop {
          from { opacity: 0; transform: translateY(-100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nb-item {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nb-up {
          from { opacity: 0; transform: translateY(140%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nb-logo {
          from { opacity: 0; transform: rotate(-180deg) scale(0.4); }
          to   { opacity: 1; transform: rotate(0) scale(1); }
        }
        @keyframes nb-pop {
          0%   { transform: scale(0.7) translateY(4px); }
          55%  { transform: scale(1.2) translateY(-3px); }
          100% { transform: scale(1) translateY(0); }
        }
        .nb-drop { animation: nb-drop 0.7s cubic-bezier(.2,.7,.2,1) both; }
        .nb-item { opacity: 0; animation: nb-item 0.6s cubic-bezier(.2,.7,.2,1) forwards; }
        .nb-up   { animation: nb-up 0.8s cubic-bezier(.2,.7,.2,1) 0.3s both; }
        .nb-logo { animation: nb-logo 0.9s cubic-bezier(.2,.7,.2,1) 0.1s both; }
        .nb-pop  { animation: nb-pop 0.45s cubic-bezier(.3,.8,.3,1); }

        /* On phones, add space at the bottom so the bottom bar does not cover the page */
        @media (max-width: 1023px) {
          body { padding-bottom: calc(5.75rem + env(safe-area-inset-bottom)); }
        }

        @media (prefers-reduced-motion: reduce) {
          .nb-drop, .nb-item, .nb-up, .nb-logo, .nb-pop {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
        }
      `}</style>

      {/* ---------- TOP BAR ---------- */}
      <nav
        className="nb-drop fixed top-0 left-0 right-0 z-[120] pointer-events-none transition-all duration-500"
        style={{ color: text, padding: isScrolled ? "0.75rem 0.75rem 0" : "0" }}
        aria-label="Main"
      >
        <div
          className={`pointer-events-auto relative mx-auto w-full flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(.3,.8,.3,1)] ${
            isScrolled
              ? "max-w-5xl h-16 px-4 sm:px-6 rounded-full border shadow-2xl backdrop-blur-xl"
              : "max-w-7xl h-20 px-6 rounded-none border border-transparent"
          }`}
          style={{
            backgroundColor: isScrolled ? `${base}e6` : "transparent",
            borderColor: isScrolled ? `${primary}30` : "transparent",
            boxShadow: isScrolled ? `0 20px 50px -20px ${primary}55` : "none",
          }}
        >
          {/* Logo and name */}
          <Link to="/" className="flex items-center gap-3 group min-w-0" aria-label="Go to home page">
            <img
              src={logo}
              alt=""
              className="nb-logo w-9 h-9 md:w-10 md:h-10 object-contain shrink-0 transition-transform duration-500 group-hover:rotate-[20deg] group-hover:scale-110"
            />
            <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight truncate">
              Gakenye <span style={{ color: primary }}>Ndiritu</span>
            </span>
          </Link>

          {/* Links (big screens) */}
          <div className="hidden lg:flex items-center gap-3">
            <div
              className="relative flex items-center gap-1"
              onMouseLeave={() => setHovered(null)}
            >
              {/* The highlight that slides behind the links */}
              <span
                className="absolute top-1/2 -translate-y-1/2 h-10 rounded-full pointer-events-none transition-all duration-300 ease-[cubic-bezier(.3,.8,.3,1)]"
                style={{
                  left: pill.left,
                  width: pill.width,
                  opacity: pill.visible ? 1 : 0,
                  backgroundColor: hovered !== null && hovered !== activeIndex ? `${text}12` : `${primary}1f`,
                }}
              />

              {menuItems.map((item, i) => {
                const active = i === activeIndex;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    ref={(el) => {
                      linkRefs.current[i] = el;
                    }}
                    onMouseEnter={() => setHovered(i)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    aria-current={active ? "page" : undefined}
                    className="nb-item group relative z-10 flex items-center gap-2 px-4 h-10 rounded-full text-sm font-semibold transition-colors duration-300"
                    style={{
                      animationDelay: `${0.25 + i * 0.07}s`,
                      color: active ? primary : text,
                    }}
                  >
                    <Icon
                      size={16}
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-[-8deg]"
                      style={{ opacity: active ? 1 : 0.6 }}
                    />
                    <span style={{ opacity: active ? 1 : 0.75 }}>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="h-6 w-px mx-1" style={{ backgroundColor: borderSoft }} />
            <ThemeToggle />

            {/* User menu (big screens) */}
            {isAuthenticated && (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full border transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                  style={{
                    borderColor: userMenuOpen ? primary : borderSoft,
                    backgroundColor: `${text}08`,
                  }}
                >
                  <span className="text-sm font-semibold hidden xl:block opacity-80">
                    {user?.fullName?.split(" ")[0] || "Admin"}
                  </span>
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2"
                    style={{
                      backgroundColor: `${primary}20`,
                      borderColor: primary,
                      color: primary,
                    }}
                  >
                    {getInitials(user?.fullName)}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`mr-1 transition-transform duration-300 ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Drop-down box */}
                <div
                  role="menu"
                  className={`absolute right-0 mt-4 w-72 rounded-3xl border p-2 shadow-2xl backdrop-blur-2xl origin-top-right transition-all duration-300 ease-[cubic-bezier(.3,.8,.3,1)] ${
                    userMenuOpen
                      ? "opacity-100 scale-100 translate-y-0"
                      : "opacity-0 scale-90 -translate-y-3 pointer-events-none"
                  }`}
                  style={{ backgroundColor: `${base}f5`, borderColor: borderSoft }}
                >
                  <div className="flex items-center gap-3 px-3 py-3 mb-2 border-b" style={{ borderColor: borderSoft }}>
                    <span
                      className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-sm font-bold border-2"
                      style={{ backgroundColor: `${primary}20`, borderColor: primary, color: primary }}
                    >
                      {getInitials(user?.fullName)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{user?.fullName || "Admin"}</p>
                      <p className="text-xs truncate opacity-60">{user?.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/admin-dashboard"
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                    className="group flex items-center gap-3 w-full p-3 rounded-2xl transition-all duration-300 hover:bg-[color:var(--hov)]"
                    style={
                      {
                        "--hov": `${text}0d`,
                        transitionDelay: userMenuOpen ? "80ms" : "0ms",
                        transform: userMenuOpen ? "translateX(0)" : "translateX(12px)",
                        opacity: userMenuOpen ? 1 : 0,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className="p-2 rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: `${primary}1a` }}
                    >
                      <LayoutDashboard size={16} style={{ color: primary }} />
                    </span>
                    <span className="text-sm font-semibold">Dashboard</span>
                  </Link>

                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="group flex items-center gap-3 w-full p-3 rounded-2xl text-red-500 transition-all duration-300 hover:bg-red-500/10"
                    style={{
                      transitionDelay: userMenuOpen ? "140ms" : "0ms",
                      transform: userMenuOpen ? "translateX(0)" : "translateX(12px)",
                      opacity: userMenuOpen ? 1 : 0,
                    }}
                  >
                    <span className="p-2 rounded-xl bg-red-500/10 transition-transform duration-300 group-hover:scale-110">
                      <LogOut size={16} />
                    </span>
                    <span className="text-sm font-semibold">Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Buttons on the top bar (phones) */}
          <div className="lg:hidden flex items-center gap-3 shrink-0">
            <ThemeToggle />
            {isAuthenticated && (
              <Link
                to="/admin-dashboard"
                aria-label="Open dashboard"
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-transform active:scale-90"
                style={{ backgroundColor: `${primary}20`, borderColor: primary, color: primary }}
              >
                {getInitials(user?.fullName)}
              </Link>
            )}
          </div>

          {/* Thin line that fills as you scroll down the page */}
          <span
            className="absolute left-6 right-6 -bottom-px h-[2px] rounded-full overflow-hidden pointer-events-none transition-opacity duration-500"
            style={{ opacity: isScrolled ? 1 : 0 }}
          >
            <span
              className="block h-full origin-left"
              style={{
                width: "100%",
                transform: `scaleX(${scrollPercent / 100})`,
                backgroundColor: primary,
                transition: "transform 0.15s linear",
              }}
            />
          </span>
        </div>
      </nav>

      {/* ---------- BOTTOM BAR (phones) ---------- */}
      <div
        className="nb-up lg:hidden fixed inset-x-3 z-[120] h-[4.5rem] rounded-3xl border backdrop-blur-xl shadow-2xl"
        style={{
          bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          backgroundColor: `${base}ee`,
          borderColor: `${primary}30`,
          boxShadow: `0 20px 40px -20px ${primary}66`,
          color: text,
        }}
        aria-label="Main"
      >
        <div className="relative grid grid-cols-5 h-full items-center px-1.5">
          {/* The round highlight that slides to the page you are on */}
          {activeIndex >= 0 && (
            <span
              className="absolute top-2 bottom-2 left-1.5 w-[calc((100%-0.75rem)/5)] px-1 pointer-events-none transition-transform duration-500 ease-[cubic-bezier(.3,.8,.3,1)]"
              style={{ transform: `translateX(${activeIndex * 100}%)` }}
            >
              <span
                className="block w-full h-full rounded-2xl"
                style={{ backgroundColor: `${primary}1f` }}
              />
            </span>
          )}

          {menuItems.map((item, i) => {
            const active = i === activeIndex;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center justify-center gap-1 h-full transition-transform duration-200 active:scale-90"
              >
                {/* The key makes the icon jump again each time the page changes */}
                <span
                  key={active ? "on" : "off"}
                  className={active ? "nb-pop" : ""}
                  style={{
                    color: active ? primary : text,
                    opacity: active ? 1 : 0.5,
                  }}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                </span>
                <span
                  className="text-[11px] leading-none truncate max-w-full px-1 transition-all duration-300"
                  style={{
                    color: active ? primary : text,
                    opacity: active ? 1 : 0.5,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};