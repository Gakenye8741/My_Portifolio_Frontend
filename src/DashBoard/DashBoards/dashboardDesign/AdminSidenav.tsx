import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Layout,
  Database,
  LogOut,
  FolderCode,
  Settings,
  ShieldCheck,
  CameraIcon,
  Link2,
  SectionIcon,
  Code,
  TimerIcon,
  TrendingUp,
} from "lucide-react";
import { useTheme } from "../../../ThemeContext";
import { clearCredentials } from "../../../Features/Auth/AuthSlice";
import { SiPhonepe } from "react-icons/si";
import { RiBloggerFill } from "react-icons/ri";

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

const groupPrimary: NavItem[] = [
  { name: "Analytics", path: "analytics", icon: <TrendingUp size={16} /> },
];

const groupContent: NavItem[] = [
  { name: "Projects", path: "manage-projects", icon: <FolderCode size={16} /> },
  { name: "Media", path: "media-manager", icon: <CameraIcon size={16} /> },
  { name: "Tech", path: "manage-tech", icon: <Link2 size={16} /> },
  { name: "Contact", path: "contact-manager", icon: <SiPhonepe size={16} /> },
  { name: "Blogs", path: "blog-manager", icon: <RiBloggerFill size={16} /> },
  { name: "Skills", path: "skills-manager", icon: <Code size={16} /> },
  { name: "Testimony-manager", path: "Testimony-managers", icon: <TimerIcon size={16} /> },
  { name: "FAQ-manager", path: "FAQ-manager", icon: <TimerIcon size={16} /> },
];

const groupSystem: NavItem[] = [
  { name: "Settings", path: "settings", icon: <Settings size={16} /> },
];

export const AdminSideNav = ({
  onNavItemClick,
}: {
  onNavItemClick?: () => void;
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const primary = theme.primary;
  const base = theme["base-100"];
  const text = theme["base-content"];

  /* Track collapsed state from parent's data-collapsed attribute */
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const parent = document.querySelector('[data-collapsed]');
    if (!parent) return;

    const sync = () => {
      setCollapsed(parent.getAttribute("data-collapsed") === "true");
    };
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(parent, {
      attributes: true,
      attributeFilter: ["data-collapsed"],
    });
    return () => observer.disconnect();
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    onNavItemClick?.();
  };

  /* Reusable renderer */
  const renderLink = (item: NavItem, index = 0) => (
    <NavLink
      key={item.path}
      to={item.path}
      end={item.path === "/admin-dashboard"}
      onClick={onNavItemClick}
      title={collapsed ? item.name : undefined}
      aria-label={collapsed ? item.name : undefined}
      className={({ isActive }) =>
        `sn-link group relative flex items-center rounded-lg px-2.5 py-2 text-[13px] font-medium overflow-hidden ${
          collapsed ? "justify-center gap-0" : "gap-2.5"
        } ${isActive ? "sn-active shadow-sm" : "opacity-75 hover:opacity-100"}`
      }
      style={({ isActive }) => ({
        backgroundColor: isActive ? primary : "transparent",
        color: isActive ? base : text,
        animationDelay: `${index * 40}ms`,
      })}
    >
      {({ isActive }) => (
        <>
          <span
            className="sn-bar absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full"
            style={{ backgroundColor: isActive ? base : primary }}
          />

          <span
            className="sn-icon grid h-7 w-7 shrink-0 place-items-center rounded-md"
            style={{
              backgroundColor: isActive ? `${base}26` : `${text}08`,
              color: isActive ? base : text,
            }}
          >
            {item.icon}
          </span>

          {!collapsed && (
            <>
              <span className="sn-label truncate">{item.name}</span>

              {isActive && (
                <span
                  className="sn-dot ml-auto h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: `${base}cc` }}
                />
              )}
            </>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    /* ✅ w-full + h-full — no longer fixed, no longer w-64 */
    <aside
      className="sn-root relative w-full h-full flex flex-col overflow-hidden backdrop-blur-xl"
      style={{
        backgroundColor: `${base}ee`,
      }}
    >
      <style>{`
        @keyframes sn-fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sn-softPulse {
          0%, 100% { transform: scale(1); opacity: .6; }
          50%      { transform: scale(1.6); opacity: 0; }
        }
        .sn-link { animation: sn-fadeUp 400ms cubic-bezier(.2,.7,.2,1) both; }

        .sn-link:hover .sn-icon {
          transform: scale(1.08) rotate(-6deg);
        }
        .sn-link:hover .sn-label {
          transform: translateX(1px);
        }

        .sn-bar {
          height: 0;
          transition: height 250ms cubic-bezier(.2,.7,.2,1);
        }
        .sn-link:hover .sn-bar,
        .sn-link.sn-active .sn-bar {
          height: 60%;
        }

        .sn-icon {
          transition: transform 260ms cubic-bezier(.2,.7,.2,1),
                      background-color 200ms ease,
                      color 200ms ease;
        }
        .sn-label { transition: transform 220ms cubic-bezier(.2,.7,.2,1); }

        @keyframes sn-dotIn {
          0%   { transform: scale(0); opacity: 0; }
          60%  { transform: scale(1.4); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .sn-dot { animation: sn-dotIn 400ms cubic-bezier(.2,.7,.2,1); }

        .sn-ring {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: 0 0 0 2px ${primary}55;
          animation: sn-softPulse 3s ease-in-out infinite;
          pointer-events: none;
        }
        .sn-brand:hover .sn-brand-icon {
          transform: rotate(-6deg) scale(1.06);
        }
        .sn-brand-icon { transition: transform 300ms cubic-bezier(.2,.7,.2,1); }

        .sn-signout:hover .sn-signout-icon {
          transform: translateX(-2px) rotate(-6deg);
        }
        .sn-signout-icon { transition: transform 260ms cubic-bezier(.2,.7,.2,1); }

        .sn-chip { transition: transform 220ms cubic-bezier(.2,.7,.2,1); }
        .sn-chip:hover { transform: translateY(-1px); }

        .sn-scroll::-webkit-scrollbar { width: 3px; }
        .sn-scroll::-webkit-scrollbar-track { background: transparent; }
        .sn-scroll::-webkit-scrollbar-thumb {
          background: ${text}18;
          border-radius: 10px;
        }
        .sn-scroll:hover::-webkit-scrollbar-thumb {
          background: ${text}32;
        }

        .sn-section-label {
          display: flex;
          align-items: center;
          gap: 6px;
          transition: opacity 250ms ease;
        }
        .sn-section-label::before {
          content: "";
          width: 4px;
          height: 4px;
          border-radius: 999px;
          background: ${primary}88;
          opacity: 0;
          transition: opacity 250ms ease, transform 250ms cubic-bezier(.2,.7,.2,1);
          transform: scale(.5);
        }
        .sn-scroll:hover .sn-section-label::before {
          opacity: 1;
          transform: scale(1);
        }

        @media (prefers-reduced-motion: reduce) {
          .sn-link,
          .sn-bar,
          .sn-icon,
          .sn-label,
          .sn-dot,
          .sn-brand-icon,
          .sn-signout-icon,
          .sn-chip,
          .sn-ring,
          .sn-section-label::before {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
          .sn-bar { height: 60% !important; opacity: 0.5 !important; }
        }
      `}</style>

      {/* ================= BRAND ROW ================= */}
      <div className={`pt-3 pb-2 ${collapsed ? "px-2" : "px-3"}`}>
        <div
          className={`sn-brand group flex items-center rounded-lg py-1.5 ${
            collapsed ? "justify-center gap-0 px-0" : "gap-2.5 px-2"
          }`}
        >
          <div className="relative shrink-0">
            <span
              className="sn-brand-icon grid h-8 w-8 place-items-center rounded-lg"
              style={{
                backgroundColor: `${primary}1f`,
                color: primary,
                position: "relative",
                zIndex: 1,
              }}
            >
              <ShieldCheck size={17} />
            </span>
            <span className="sn-ring" />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-tight">Admin</p>
              <p className="text-[10px] uppercase tracking-wider opacity-50 leading-tight">
                Signed in
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= NAV ================= */}
      <nav className="sn-scroll flex-1 overflow-y-auto px-2 pb-2">
        <div className="pt-1">{groupPrimary.map((i, idx) => renderLink(i, idx))}</div>

        {!collapsed ? (
          <p className="sn-section-label px-2 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] opacity-40">
            Content
          </p>
        ) : (
          <div className="my-2 mx-2 h-px" style={{ backgroundColor: `${text}10` }} />
        )}
        <div className="space-y-0.5">
          {groupContent.map((i, idx) => renderLink(i, idx + 1))}
        </div>

        {!collapsed ? (
          <p className="sn-section-label px-2 pt-4 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] opacity-40">
            System
          </p>
        ) : (
          <div className="my-2 mx-2 h-px" style={{ backgroundColor: `${text}10` }} />
        )}
        <div className="space-y-0.5">
          {groupSystem.map((i, idx) => renderLink(i, idx + groupContent.length + 1))}
        </div>
      </nav>

      {/* ================= FOOTER ================= */}
      <div
        className="border-t px-2 py-2"
        style={{ borderColor: `${text}10` }}
      >
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          aria-label={collapsed ? "Sign out" : undefined}
          className={`sn-signout group flex w-full items-center rounded-lg py-2 text-[13px] font-medium text-rose-500/80 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-500 ${
            collapsed ? "justify-center gap-0 px-0" : "gap-2.5 px-2.5"
          }`}
        >
          <span className="sn-signout-icon grid h-7 w-7 shrink-0 place-items-center rounded-md bg-rose-500/10">
            <LogOut size={15} />
          </span>
          {!collapsed && <span>Sign out</span>}
        </button>

        {!collapsed && (
          <div className="mt-2 flex items-center justify-between gap-2 px-1 pb-1">
            <span
              className="sn-chip flex-1 rounded-md px-2 py-1 text-center text-[10px] font-semibold tabular-nums"
              style={{ backgroundColor: `${text}06`, color: text, opacity: 0.6 }}
            >
              AZ-26
            </span>
            <span
              className="sn-chip flex-1 rounded-md px-2 py-1 text-center text-[10px] font-semibold tabular-nums"
              style={{ backgroundColor: `${primary}10`, color: primary, opacity: 0.9 }}
            >
              v2.06
            </span>
          </div>
        )}
      </div>
    </aside>
  );
};