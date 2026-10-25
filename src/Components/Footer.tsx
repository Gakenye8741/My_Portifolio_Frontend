// src/Components/Footer.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Github,
  Linkedin,
  Instagram,
  ChevronUp,
  ArrowRight,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  MapPin,
  Layers,
  Cpu,
  Terminal,
  Database,
  MessageCircle,
  Sparkles,
  BookOpen,
  Wrench,
  Code2,
} from "lucide-react";
import { RiWhatsappFill } from "react-icons/ri";
import { useTheme } from "../ThemeContext";
import logo from "../../public/LOGO.png";

/* ---------- Configuration ---------- */
const EMAIL = "codewithgakenye@gmail.com";
const WHATSAPP = "https://wa.link/f3ajog";
const BIG_NAME = "GAKENYE";

const menuItems = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Services", path: "/services" },
  { name: "Tools", path: "/tech" },
  { name: "Blog", path: "/blog" },
  { name: "FAQs", path: "/faqs" },
  { name: "Contact", path: "/contact" },
];

const services = [
  { title: "Web & mobile apps", icon: <Layers size={17} /> },
  { title: "Blockchain systems", icon: <Cpu size={17} /> },
  { title: "AI-powered tools", icon: <Terminal size={17} /> },
  { title: "Database solutions", icon: <Database size={17} /> },
];

const socials = [
  {
    icon: <Github size={20} />,
    url: "https://github.com/Gakenye8741",
    label: "GitHub",
  },
  {
    icon: <Linkedin size={20} />,
    url: "https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/",
    label: "LinkedIn",
  },
  {
    icon: <Instagram size={20} />,
    url: "https://www.instagram.com/_code.d_by_gakenye_/",
    label: "Instagram",
  },
  {
    icon: <RiWhatsappFill size={20} />,
    url: WHATSAPP,
    label: "WhatsApp",
  },
];

/* ---------- Reveal on scroll ---------- */
const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
};

type RevealProps = {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  from?: "up" | "left" | "right";
};

const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  className = "",
  from = "up",
}) => {
  const { ref, visible } = useInView();
  const initialTransform =
    from === "left"
      ? "translateX(-24px)"
      : from === "right"
      ? "translateX(24px)"
      : "translateY(24px)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0, 0)" : initialTransform,
        transition: `opacity 700ms ease ${delay}ms, transform 700ms cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ============================================================
   MAIN FOOTER
   ============================================================ */
const Footer: React.FC = () => {
  const { theme } = useTheme();

  const [copied, setCopied] = useState(false);
  const [time, setTime] = useState("");
  const [scrollPercent, setScrollPercent] = useState(0);

  const watermark = useInView(0.15);
  const copyTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const base = theme["base-100"];
  const text = theme["base-content"];
  const primary = theme.primary;
  const secondary = theme.secondary || primary;
  const success = theme.success || "#22c55e";

  const borderSoft = `${text}14`;
  const borderMid = `${text}28`;
  const muted = `${text}a8`;

  /* Live Kenya clock */
  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Africa/Nairobi",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  /* Scroll progress */
  useEffect(() => {
    let ticking = false;
    const updateProgress = () => {
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        documentHeight > 0
          ? Math.min(100, Math.max(0, (window.scrollY / documentHeight) * 100))
          : 0;
      setScrollPercent(progress);
      ticking = false;
    };
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    };
    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  /* Copy email */
  const copyEmail = async () => {
    try {
      if (!navigator.clipboard?.writeText) {
        window.location.href = `mailto:${EMAIL}`;
        return;
      }
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
      copyTimeout.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeout.current) clearTimeout(copyTimeout.current);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const ringLength = 2 * Math.PI * 23;

  return (
    <footer
      className="relative overflow-hidden pt-16 sm:pt-20"
      style={{
        backgroundColor: base,
        color: text,
        "--ft-primary": primary,
        "--ft-secondary": secondary,
        "--ft-text": text,
        "--ft-border": borderSoft,
      } as React.CSSProperties}
    >
      <style>{`
        @keyframes ft-glow {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50%      { transform: translate3d(16px,-14px,0) scale(1.08); }
        }
        @keyframes ft-float {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-3px); }
        }
        .ft-glow  { animation: ft-glow 12s ease-in-out infinite; }
        .ft-float { animation: ft-float 2s ease-in-out infinite; }

        .ft-social-tile .ft-social-fill {
          transform: translateY(101%);
          transition: transform 450ms cubic-bezier(.2,.7,.2,1);
        }
        .ft-social-tile:hover .ft-social-fill,
        .ft-social-tile:focus-visible .ft-social-fill {
          transform: translateY(0);
        }
        .ft-social-tile:hover .ft-social-icon,
        .ft-social-tile:focus-visible .ft-social-icon {
          color: var(--ft-base);
          transform: scale(1.1) rotate(-5deg);
        }
        .ft-social-tile:hover .ft-social-label,
        .ft-social-tile:focus-visible .ft-social-label {
          color: var(--ft-base);
          opacity: 1;
        }

        .ft-link-arrow {
          opacity: 0;
          transform: translateX(-5px);
          transition: all 250ms ease;
        }
        .ft-page-link:hover .ft-link-arrow,
        .ft-page-link:focus-visible .ft-link-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .ft-watermark-letter {
          color: transparent;
          -webkit-text-stroke: 1.5px var(--ft-border);
          transition: color 300ms ease, -webkit-text-stroke-color 300ms ease;
        }
        @media (hover: hover) {
          .ft-watermark:hover .ft-watermark-letter {
            color: var(--ft-primary);
            -webkit-text-stroke-color: var(--ft-primary);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ft-glow, .ft-float { animation: none !important; }
          .ft-social-fill { display: none; }
          * { transition-duration: 0ms !important; }
        }
      `}</style>

      {/* Atmosphere */}
      <div
        className="ft-glow pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full blur-[120px]"
        style={{ backgroundColor: primary, opacity: 0.1 }}
        aria-hidden="true"
      />
      <div
        className="ft-glow pointer-events-none absolute right-[-120px] top-[40%] h-96 w-96 rounded-full blur-[130px]"
        style={{ backgroundColor: secondary, opacity: 0.08, animationDelay: "-5s" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* ============================================================
           HERO CTA
           ============================================================ */}
        <Reveal>
          <section
            aria-labelledby="footer-cta-heading"
            className="relative overflow-hidden rounded-[1.75rem] border sm:rounded-[2rem]"
            style={{
              borderColor: borderMid,
              backgroundColor: `${text}04`,
            }}
          >
            {/* Diagonal accent bar */}
            <div
              className="absolute inset-x-0 top-0 h-1"
              style={{
                backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})`,
              }}
              aria-hidden="true"
            />

            <div className="relative grid grid-cols-1 lg:grid-cols-12">
              {/* LEFT — big headline */}
              <div className="lg:col-span-7 p-6 sm:p-9 md:p-12 lg:p-14">
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: `${primary}55`,
                    backgroundColor: `${primary}12`,
                    color: primary,
                  }}
                >
                  <Sparkles size={13} />
                  Available for work
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: success }}
                  />
                </div>

                <h2
                  id="footer-cta-heading"
                  className="mt-5 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl"
                >
                  Let&apos;s turn
                  <br />
                  your ideas into{" "}
                  <span style={{ color: primary }}>reality.</span>
                </h2>

                <p
                  className="mt-5 max-w-md text-sm leading-7 sm:text-base"
                  style={{ color: muted }}
                >
                  Modern websites, mobile apps, and rock-solid backends —
                  built with care, shipped on time.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3 text-xs">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium"
                    style={{ borderColor: borderSoft, color: muted }}
                  >
                    <MapPin size={12} style={{ color: primary }} /> Nairobi, Kenya
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium"
                    style={{ borderColor: borderSoft, color: muted }}
                  >
                    <Clock size={12} style={{ color: primary }} /> {time || "--:--"} EAT
                  </span>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-medium"
                    style={{ borderColor: borderSoft, color: muted }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: success }}
                    />
                    Replies in 24h
                  </span>
                </div>
              </div>

              {/* RIGHT — actions */}
              <div
                className="lg:col-span-5 p-6 sm:p-9 md:p-12 lg:p-14 flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l"
                style={{ borderColor: borderSoft }}
              >
                <a
                  href={`mailto:${EMAIL}`}
                  className="group relative inline-flex min-h-14 items-center justify-between gap-3 overflow-hidden rounded-2xl px-5 py-4 font-bold transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{
                    backgroundColor: primary,
                    color: base,
                    boxShadow: `0 12px 35px -15px ${primary}`,
                  }}
                >
                  <span
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                    aria-hidden="true"
                  />
                  <span className="relative flex items-center gap-3">
                    <Mail size={19} />
                    Start a conversation
                  </span>
                  <ArrowRight
                    size={19}
                    className="relative transition-transform duration-300 group-hover:translate-x-1"
                  />
                </a>

                <button
                  type="button"
                  onClick={copyEmail}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    borderColor: copied ? success : borderMid,
                    backgroundColor: `${text}03`,
                  }}
                  aria-live="polite"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    {copied ? (
                      <Check size={19} style={{ color: success }} />
                    ) : (
                      <Copy size={19} style={{ color: primary }} />
                    )}
                    <span className="truncate text-sm font-semibold">
                      {copied ? "Email copied!" : "Copy email"}
                    </span>
                  </span>
                  <span className="hidden truncate text-[11px] opacity-50 sm:block">
                    {EMAIL}
                  </span>
                </button>

                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border px-5 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{ borderColor: borderMid }}
                >
                  <span className="flex items-center gap-3 text-sm">
                    <MessageCircle size={19} style={{ color: primary }} />
                    Chat on WhatsApp
                  </span>
                  <ArrowUpRight size={19} />
                </a>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ============================================================
           BRAND + SITEMAP
           ============================================================ */}
        <div className="grid grid-cols-2 gap-8 py-14 sm:grid-cols-4 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <Reveal className="col-span-2 lg:col-span-4 space-y-5" from="left">
            <Link to="/" aria-label="Gakenye Ndiritu home" className="group inline-flex items-center gap-3">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border p-1.5 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105"
                style={{ borderColor: borderSoft, backgroundColor: `${text}05` }}
              >
                <img src={logo} alt="" className="h-full w-full object-contain" />
              </span>
              <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Gakenye <span style={{ color: primary }}>Ndiritu</span>
              </span>
            </Link>

            <div
              className="h-1 w-14 rounded-full"
              style={{ backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})` }}
            />

            <p className="max-w-sm text-sm leading-7" style={{ color: muted }}>
              Full-stack engineer building fast, reliable products for
              founders and teams — from database to interface.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: <Code2 size={12} />, label: "React" },
                { icon: <Database size={12} />, label: "PostgreSQL" },
                { icon: <Terminal size={12} />, label: "Node.js" },
                { icon: <Wrench size={12} />, label: "TypeScript" },
              ].map((t) => (
                <span
                  key={t.label}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                  style={{ borderColor: borderSoft, color: muted }}
                >
                  <span style={{ color: primary }}>{t.icon}</span>
                  {t.label}
                </span>
              ))}
            </div>
          </Reveal>

          {/* Explore */}
          <Reveal className="lg:col-span-2 space-y-4" delay={100}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">
              Explore
            </h3>
            <nav aria-label="Footer navigation" className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="ft-page-link group flex items-center gap-2 py-1.5 text-sm font-medium transition-colors hover:opacity-100"
                  style={{ color: muted }}
                >
                  <ArrowRight
                    size={13}
                    className="ft-link-arrow shrink-0"
                    style={{ color: primary }}
                  />
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    {item.name}
                  </span>
                </Link>
              ))}
            </nav>
          </Reveal>

          {/* Services */}
          <Reveal className="col-span-2 lg:col-span-3 space-y-4" delay={180}>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">
              What I build
            </h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.title}>
                  <Link
                    to="/services"
                    className="group flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ borderColor: borderSoft, backgroundColor: `${text}02` }}
                  >
                    <span
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-transform duration-300 group-hover:scale-105"
                      style={{ backgroundColor: `${primary}15`, color: primary }}
                    >
                      {service.icon}
                    </span>
                    <span className="text-sm font-medium">{service.title}</span>
                    <ArrowUpRight
                      size={14}
                      className="ml-auto shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-70"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Socials */}
          <Reveal className="col-span-2 lg:col-span-3 space-y-4" delay={260} from="right">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">
              Connect
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit my ${social.label}`}
                  className="ft-social-tile group relative flex aspect-square min-h-[88px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  style={{
                    borderColor: borderSoft,
                    outlineColor: primary,
                    "--ft-base": base,
                  } as React.CSSProperties}
                >
                  <span
                    className="ft-social-fill absolute inset-0"
                    style={{ backgroundColor: primary }}
                    aria-hidden="true"
                  />
                  <span
                    className="ft-social-icon relative transition-all duration-300"
                    style={{ color: primary }}
                  >
                    {social.icon}
                  </span>
                  <span
                    className="ft-social-label relative text-[11px] font-semibold opacity-70 transition-all duration-300"
                    style={{ color: text }}
                  >
                    {social.label}
                  </span>
                </a>
              ))}
            </div>

            <a
              href={`mailto:${EMAIL}`}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ borderColor: borderSoft }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ backgroundColor: `${primary}15`, color: primary }}
              >
                <Mail size={16} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] uppercase tracking-wider opacity-50">
                  Email
                </span>
                <span className="mt-0.5 block truncate text-xs font-medium">
                  {EMAIL}
                </span>
              </span>
              <ArrowUpRight
                size={15}
                className="shrink-0 opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </Reveal>
        </div>

        {/* ============================================================
           BOTTOM BAR
           ============================================================ */}
        <Reveal>
          <div
            className="flex flex-col items-center justify-between gap-5 border-t py-6 sm:flex-row"
            style={{ borderColor: borderSoft }}
          >
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-medium">
                © {new Date().getFullYear()} Gakenye Ndiritu.
                <span className="opacity-55"> All rights reserved.</span>
              </p>
              <p className="text-xs opacity-45">
                Designed & built with care in Kenya.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[11px] font-semibold transition-all hover:-translate-y-0.5"
                style={{ borderColor: borderMid, color: muted }}
              >
                <BookOpen size={12} style={{ color: primary }} /> Read the blog
              </Link>

              <button
                type="button"
                onClick={scrollToTop}
                aria-label={`Back to top. Page scroll progress ${Math.round(scrollPercent)}%`}
                className="group flex items-center gap-3 rounded-full border py-1.5 pl-5 pr-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                style={{ borderColor: borderMid }}
              >
                <span className="text-sm font-semibold opacity-75 transition-opacity group-hover:opacity-100">
                  Back to top
                </span>
                <span className="relative grid h-12 w-12 place-items-center">
                  <svg className="absolute inset-0 -rotate-90" viewBox="0 0 52 52" aria-hidden="true">
                    <circle cx="26" cy="26" r="23" fill="none" stroke={borderSoft} strokeWidth="2.5" />
                    <circle
                      cx="26"
                      cy="26"
                      r="23"
                      fill="none"
                      stroke={primary}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={ringLength}
                      strokeDashoffset={ringLength * (1 - scrollPercent / 100)}
                      style={{ transition: "stroke-dashoffset 180ms linear" }}
                    />
                  </svg>
                  <ChevronUp
                    size={20}
                    style={{ color: primary }}
                    className="ft-float transition-transform duration-300 group-hover:scale-125"
                  />
                </span>
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      {/* ============================================================
         OVERSIZED WATERMARK
         ============================================================ */}
      <div
        ref={watermark.ref}
        className="ft-watermark relative mt-2 select-none overflow-hidden px-1 pt-4"
        aria-hidden="true"
      >
        <div className="flex items-end justify-center overflow-hidden leading-[0.75]">
          {BIG_NAME.split("").map((letter, index) => (
            <span key={`${letter}-${index}`} className="inline-block overflow-hidden">
              <span
                className="ft-watermark-letter inline-block font-black tracking-[-0.08em] text-[20vw] sm:text-[19vw] md:text-[18vw] lg:text-[16rem]"
                style={{
                  opacity: watermark.visible ? 1 : 0,
                  transform: watermark.visible ? "translateY(0)" : "translateY(100%)",
                  transition: `transform 800ms cubic-bezier(.2,.7,.2,1) ${index * 75}ms, opacity 700ms ease ${index * 75}ms`,
                }}
              >
                {letter}
              </span>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;