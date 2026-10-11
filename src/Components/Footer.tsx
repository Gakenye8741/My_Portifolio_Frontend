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
} from "lucide-react";
import { RiWhatsappFill } from "react-icons/ri";
import { useTheme } from "../ThemeContext";
import logo from "../../public/LOGO.png";

/* ---------- Footer configuration ---------- */

const EMAIL = "codewithgakenye@gmail.com";
const WHATSAPP = "https://wa.link/f3ajog";
const BIG_NAME = "GAKENYE";

const menuItems = [
  { name: "Home", path: "/" },
  { name: "Projects", path: "/projects" },
  { name: "Services", path: "/services" },
  { name: "Tools", path: "/tech" },
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
    icon: <Github size={21} />,
    url: "https://github.com/Gakenye8741",
    label: "GitHub",
  },
  {
    icon: <Linkedin size={21} />,
    url: "https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/",
    label: "LinkedIn",
  },
  {
    icon: <Instagram size={21} />,
    url: "https://www.instagram.com/_code.d_by_gakenye_/",
    label: "Instagram",
  },
  {
    icon: <RiWhatsappFill size={21} />,
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

    // Reveal immediately if IntersectionObserver is unavailable.
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
      className={`ft-reveal ${className}`}
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

/* ---------- Main footer ---------- */

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

  const borderSoft = `${text}18`;
  const borderMid = `${text}30`;
  const muted = `${text}b0`;

  /* Live Kenya clock */

  useEffect(() => {
    const updateTime = () => {
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Africa/Nairobi",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date())
      );
    };

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  /* Page scroll progress */

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const documentHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress =
        documentHeight > 0
          ? Math.min(
              100,
              Math.max(0, (window.scrollY / documentHeight) * 100)
            )
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

      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current);
      }

      copyTimeout.current = setTimeout(() => {
        setCopied(false);
      }, 2200);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeout.current) {
        clearTimeout(copyTimeout.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? "auto"
        : "smooth",
    });
  };

  const ringLength = 2 * Math.PI * 23;

  return (
    <footer
      className="ft-footer relative mt-6 overflow-hidden border-t pt-12 sm:pt-16 md:mt-8 md:pt-20"
      style={{
        backgroundColor: base,
        color: text,
        borderColor: borderSoft,
        "--ft-primary": primary,
        "--ft-secondary": secondary,
        "--ft-text": text,
        "--ft-border": borderSoft,
      } as React.CSSProperties}
    >
      <style>{`
        @keyframes ft-gradient {
          from { background-position: 0% 50%; }
          to { background-position: 200% 50%; }
        }

        @keyframes ft-glow {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(18px, -16px, 0) scale(1.08);
          }
        }

        @keyframes ft-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes ft-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .ft-gradient-line {
          background-size: 200% 100%;
          animation: ft-gradient 7s linear infinite;
        }

        .ft-glow {
          animation: ft-glow 12s ease-in-out infinite;
        }

        .ft-float {
          animation: ft-float 2s ease-in-out infinite;
        }

        .ft-social-card .ft-social-fill {
          transform: translateY(101%);
          transition: transform 450ms cubic-bezier(.2,.7,.2,1);
        }

        .ft-social-card:hover .ft-social-fill,
        .ft-social-card:focus-visible .ft-social-fill {
          transform: translateY(0);
        }

        .ft-social-card:hover .ft-social-icon,
        .ft-social-card:focus-visible .ft-social-icon {
          color: var(--ft-base);
          transform: scale(1.1) rotate(-5deg);
        }

        .ft-social-card:hover .ft-social-label,
        .ft-social-card:focus-visible .ft-social-label {
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
          transition:
            color 300ms ease,
            -webkit-text-stroke-color 300ms ease;
        }

        @media (hover: hover) {
          .ft-watermark:hover .ft-watermark-letter {
            color: var(--ft-primary);
            -webkit-text-stroke-color: var(--ft-primary);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ft-gradient-line,
          .ft-glow,
          .ft-float {
            animation: none !important;
          }

          .ft-reveal,
          .ft-watermark-letter,
          .ft-social-fill,
          .ft-social-icon,
          .ft-social-label,
          .ft-link-arrow {
            animation: none !important;
            transition: none !important;
          }

          .ft-social-fill {
            display: none;
          }
        }
      `}</style>

      {/* Animated top accent */}

      <div
        className="ft-gradient-line absolute left-0 top-0 h-[2px] w-full"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${primary}, ${secondary}, transparent)`,
        }}
        aria-hidden="true"
      />

      {/* Background atmosphere */}

      <div
        className="ft-glow pointer-events-none absolute -left-32 top-10 h-64 w-64 rounded-full blur-[100px]"
        style={{ backgroundColor: primary, opacity: 0.12 }}
        aria-hidden="true"
      />

      <div
        className="ft-glow pointer-events-none absolute right-[-100px] top-[35%] h-72 w-72 rounded-full blur-[110px]"
        style={{
          backgroundColor: secondary,
          opacity: 0.09,
          animationDelay: "-5s",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* Contact call to action */}

        <Reveal>
          <section
            aria-labelledby="footer-cta-heading"
            className="relative overflow-hidden rounded-3xl border p-6 sm:p-9 md:rounded-[2rem] md:p-12 lg:p-14"
            style={{
              backgroundColor: `${text}05`,
              borderColor: borderMid,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                backgroundImage: `radial-gradient(${text}20 1px, transparent 1px)`,
                backgroundSize: "22px 22px",
                maskImage:
                  "radial-gradient(ellipse at 85% 10%, black, transparent 70%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at 85% 10%, black, transparent 70%)",
              }}
              aria-hidden="true"
            />

            <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-7">
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold sm:text-sm"
                  style={{
                    borderColor: `${primary}55`,
                    backgroundColor: `${primary}12`,
                  }}
                >
                  <Sparkles size={15} style={{ color: primary }} />

                  <span>Have a project in mind?</span>

                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: success }}
                  />
                </div>

                <h2
                  id="footer-cta-heading"
                  className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
                >
                  Let&apos;s turn your
                  <br className="hidden sm:block" /> ideas into{" "}
                  <span style={{ color: primary }}>reality.</span>
                </h2>

                <p
                  className="mt-4 max-w-xl text-sm leading-7 sm:text-base"
                  style={{ color: muted }}
                >
                  From modern websites and mobile applications to powerful
                  backend systems, let&apos;s build something useful,
                  beautiful, and impactful.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: success }}
                  />
                  Available for freelance projects and collaborations
                </div>
              </div>

              <div className="flex flex-col gap-3 lg:col-span-5">
                <a
                  href={`mailto:${EMAIL}`}
                  className="group relative inline-flex min-h-14 items-center justify-between gap-3 overflow-hidden rounded-2xl px-5 py-4 font-bold transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98]"
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
                      {copied ? "Email copied!" : "Copy email address"}
                    </span>
                  </span>

                  <span className="hidden truncate text-xs opacity-50 sm:block">
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
                    Let&apos;s chat on WhatsApp
                  </span>

                  <ArrowUpRight size={19} />
                </a>
              </div>
            </div>
          </section>
        </Reveal>

        {/* Main footer columns */}

        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 sm:gap-12 md:py-16 lg:grid-cols-12 lg:gap-8">
          {/* About */}

          <Reveal className="space-y-5 sm:col-span-2 lg:col-span-4" from="left">
            <Link
              to="/"
              aria-label="Gakenye Ndiritu home"
              className="group inline-flex items-center gap-3"
            >
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border p-1.5 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105"
                style={{
                  borderColor: borderSoft,
                  backgroundColor: `${text}05`,
                }}
              >
                <img
                  src={logo}
                  alt="Gakenye Ndiritu logo"
                  className="h-full w-full object-contain"
                />
              </span>

              <span className="text-xl font-extrabold tracking-tight sm:text-2xl">
                Gakenye{" "}
                <span style={{ color: primary }}>Ndiritu</span>
              </span>
            </Link>

            <div
              className="h-1 w-14 rounded-full"
              style={{
                backgroundImage: `linear-gradient(90deg, ${primary}, ${secondary})`,
              }}
            />

            <p
              className="max-w-sm text-sm leading-7 sm:text-base"
              style={{ color: muted }}
            >
              Full-stack developer passionate about building modern,
              reliable, and user-friendly digital experiences that solve
              real-world problems.
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 text-sm">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{
                    backgroundColor: `${primary}15`,
                    color: primary,
                  }}
                >
                  <MapPin size={18} />
                </span>

                <div>
                  <p className="font-semibold">Kenya</p>
                  <p className="text-xs opacity-55">Available worldwide</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{
                    backgroundColor: `${primary}15`,
                    color: primary,
                  }}
                >
                  <Clock size={18} />
                </span>

                <div>
                  <p className="font-semibold">East Africa Time</p>
                  <p className="font-mono text-xs tabular-nums opacity-65">
                    {time || "--:--:--"} EAT
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Navigation */}

          <Reveal className="space-y-5 lg:col-span-2" delay={100}>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] opacity-50">
              Explore
            </h3>

            <nav aria-label="Footer navigation" className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="ft-page-link group flex items-center gap-2 py-2 text-sm font-medium transition-colors duration-200 hover:opacity-100"
                  style={{ color: muted }}
                >
                  <ArrowRight
                    size={14}
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

          <Reveal className="space-y-5 lg:col-span-3" delay={180}>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] opacity-50">
              What I build
            </h3>

            <ul className="space-y-2.5">
              {services.map((service) => (
                <li key={service.title}>
                  <Link
                    to="/services"
                    className="group flex items-center gap-3 rounded-xl border p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    style={{
                      borderColor: borderSoft,
                      backgroundColor: `${text}02`,
                    }}
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: `${primary}15`,
                        color: primary,
                      }}
                    >
                      {service.icon}
                    </span>

                    <span className="text-sm font-medium transition-colors group-hover:opacity-100">
                      {service.title}
                    </span>

                    <ArrowUpRight
                      size={15}
                      className="ml-auto shrink-0 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-70"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Social links */}

          <Reveal className="space-y-5 lg:col-span-3" delay={260} from="right">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] opacity-50">
              Connect with me
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit my ${social.label}`}
                  className="ft-social-card group relative flex min-h-[100px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
                    className="ft-social-label relative text-xs font-semibold opacity-65 transition-all duration-300"
                    style={{ color: text }}
                  >
                    {social.label}
                  </span>
                </a>
              ))}
            </div>

            <a
              href={`mailto:${EMAIL}`}
              className="group flex min-w-0 items-center gap-3 rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{ borderColor: borderSoft }}
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                style={{
                  backgroundColor: `${primary}15`,
                  color: primary,
                }}
              >
                <Mail size={18} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-xs opacity-50">Email me</span>
                <span className="mt-1 block truncate text-sm font-medium">
                  {EMAIL}
                </span>
              </span>

              <ArrowUpRight
                size={17}
                className="shrink-0 opacity-50 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </Reveal>
        </div>

        {/* Bottom bar */}

        <Reveal>
          <div
            className="flex flex-col items-center justify-between gap-6 border-t py-7 sm:flex-row md:py-8"
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

            <button
              type="button"
              onClick={scrollToTop}
              aria-label={`Back to top. Page scroll progress ${Math.round(
                scrollPercent
              )}%`}
              className="group flex items-center gap-3 rounded-full border py-1.5 pl-5 pr-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              style={{ borderColor: borderMid }}
            >
              <span className="text-sm font-semibold opacity-75 transition-opacity group-hover:opacity-100">
                Back to top
              </span>

              <span className="relative grid h-12 w-12 place-items-center">
                <svg
                  className="absolute inset-0 -rotate-90"
                  viewBox="0 0 52 52"
                  aria-hidden="true"
                >
                  <circle
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                    stroke={borderSoft}
                    strokeWidth="2.5"
                  />

                  <circle
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                    stroke={primary}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={ringLength}
                    strokeDashoffset={
                      ringLength * (1 - scrollPercent / 100)
                    }
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
        </Reveal>
      </div>

      {/* Oversized portfolio signature */}

      <div
        ref={watermark.ref}
        className="ft-watermark relative mt-1 select-none overflow-hidden px-1 pt-4 sm:pt-6"
        aria-hidden="true"
      >
        <div className="flex items-end justify-center overflow-hidden leading-[0.78]">
          {BIG_NAME.split("").map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="inline-block overflow-hidden"
            >
              <span
                className="ft-watermark-letter inline-block font-black tracking-[-0.075em] text-[19vw] sm:text-[18vw] md:text-[17vw] lg:text-[15rem]"
                style={{
                  opacity: watermark.visible ? 1 : 0,
                  transform: watermark.visible
                    ? "translateY(0)"
                    : "translateY(100%)",
                  transition: `transform 800ms cubic-bezier(.2,.7,.2,1) ${
                    index * 75
                  }ms, opacity 700ms ease ${index * 75}ms`,
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