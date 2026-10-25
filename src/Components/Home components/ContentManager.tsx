import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import {
  ArrowRight, Github, Linkedin, Instagram,
  Activity, ShieldCheck, Zap, ChevronLeft, ChevronRight,
  Layers, Cpu, Terminal, Database
} from 'lucide-react';
import { RiWhatsappFill } from 'react-icons/ri';

// Your images
import logoMain from "../../../public/LOGO.png";
import logo1 from "../../../public/logo1.jpg";
import logo2 from "../../../public/logo2.jpg";
import logo3 from "../../../public/logo3.jpg";
import logo4 from "../../../public/logo4.jpg";

const images = [logoMain, logo1, logo2, logo3, logo4];

const socials = [
  { icon: <Github size={20} />, link: "https://github.com/Gakenye8741", label: "GitHub" },
  { icon: <Linkedin size={20} />, link: "https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/", label: "LinkedIn" },
  { icon: <RiWhatsappFill size={20} />, link: "https://wa.link/f3ajog", label: "WhatsApp" },
  { icon: <Instagram size={20} />, link: "https://www.instagram.com/_code.d_by_gakenye_/", label: "Instagram" },
];

const stats = [
  { label: "Uptime", value: "99.9%", icon: <Activity size={14} /> },
  { label: "Data", value: "Encrypted", icon: <ShieldCheck size={14} /> },
  { label: "Response", value: "< 100ms", icon: <Zap size={14} /> },
];

const skills = [
  { title: "Web & Mobile Apps", text: "Built start to finish", icon: <Layers size={18} /> },
  { title: "Blockchain", text: "Safe, decentralized systems", icon: <Cpu size={18} /> },
  { title: "AI Tools", text: "Automate slow, boring work", icon: <Terminal size={18} /> },
  { title: "PostgreSQL", text: "Databases that keep data safe", icon: <Database size={18} /> },
];

const roles = ["websites", "mobile apps", "smart systems", "AI tools"];

const marqueeItems = [
  "React", "Node.js", "TypeScript", "PostgreSQL", "React Native",
  "Blockchain", "AI Integrations", "REST APIs", "Tailwind CSS", "Docker",
];

/* ---------- Picture carousel (3D stack) ---------- */

const AUTO_MS = 4000;

const PictureCarousel = ({
  slides,
  primary,
  text,
  reduce,
}: {
  slides: string[];
  primary: string;
  text: string;
  reduce: boolean | null;
}) => {
  const n = slides.length;
  const half = Math.floor(n / 2);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Whole stage tilts with the mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 14 });
  const sy = useSpring(my, { stiffness: 80, damping: 14 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);

  const go = (direction: number) => setActive((a) => (a + direction + n) % n);

  // Moves to the next picture by itself (stops while the mouse is over the pictures)
  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), AUTO_MS);
    return () => clearInterval(id);
  }, [paused, reduce, n]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return;
    const box = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - box.left) / box.width - 0.5);
    my.set((e.clientY - box.top) / box.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    setPaused(false);
  };

  return (
    <div
      className="w-full max-w-[360px] sm:max-w-[500px]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Portfolio pictures"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
    >
      <div className="hero-float">
        <div className="relative">
          {/* Glow that breathes behind the pictures */}
          <motion.div
            className="absolute inset-x-10 inset-y-6 rounded-full blur-[90px] pointer-events-none"
            style={{ backgroundColor: primary }}
            animate={reduce ? { opacity: 0.25 } : { opacity: [0.18, 0.4, 0.18], scale: [0.9, 1.15, 0.9] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Two rings that spin in opposite ways */}
          <div
            className="hero-spin absolute inset-2 sm:inset-0 rounded-full border-2 border-dashed opacity-25 pointer-events-none"
            style={{ borderColor: primary }}
          />
          <div
            className="hero-spin-rev absolute inset-10 rounded-full border opacity-20 pointer-events-none"
            style={{ borderColor: text }}
          />

          {/* Stage */}
          <motion.div
            className="relative h-[22rem] sm:h-[28rem] select-none"
            style={{ perspective: 1400, touchAction: "pan-y" }}
            onPanEnd={(_, info) => {
              if (info.offset.x < -50) go(1);
              else if (info.offset.x > 50) go(-1);
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformStyle: "preserve-3d" }}
            >
              {slides.map((src, i) => {
                const offset = ((i - active + n + half) % n) - half;
                const abs = Math.abs(offset);
                const isActive = offset === 0;
                return (
                  <motion.div
                    key={i}
                    role="button"
                    tabIndex={isActive ? -1 : 0}
                    aria-label={isActive ? `Picture ${i + 1}` : `Show picture ${i + 1}`}
                    onKeyDown={(e) => {
                      if (!isActive && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        setActive(i);
                      }
                    }}
                    className="absolute inset-0 m-auto w-[64%] h-[86%] rounded-3xl overflow-hidden shadow-2xl bg-black/20 focus:outline-none"
                    style={{
                      zIndex: n - abs,
                      transformStyle: "preserve-3d",
                      border: `1px solid ${text}30`,
                      cursor: isActive ? "default" : "pointer",
                      pointerEvents: abs > 1 ? "none" : "auto",
                    }}
                    initial={false}
                    animate={{
                      x: `${offset * 62}%`,
                      scale: 1 - abs * 0.2,
                      rotateY: reduce ? 0 : -offset * 38,
                      z: -abs * 160,
                      opacity: abs > 1 ? 0 : abs === 1 ? 0.8 : 1,
                      filter: `blur(${abs * 1.5}px) brightness(${1 - abs * 0.25})`,
                    }}
                    transition={{ type: "spring", stiffness: 110, damping: 15, mass: 0.9 }}
                    onClick={() => !isActive && setActive(i)}
                    aria-hidden={!isActive}
                  >
                    {/* Picture slowly zooms while it is on show */}
                    <motion.img
                      src={src}
                      alt={`Portfolio showcase ${i + 1}`}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-cover"
                      animate={isActive && !reduce ? { scale: [1, 1.18], x: ["0%", "-3%"] } : { scale: 1, x: "0%" }}
                      transition={isActive ? { duration: 7, ease: "easeOut" } : { duration: 0.6 }}
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,.35), transparent 45%)" }}
                    />

                    {/* Shine that sweeps across when the picture arrives */}
                    <motion.div
                      className="absolute inset-y-0 w-1/3 pointer-events-none"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)",
                        skewX: -20,
                      }}
                      initial={false}
                      animate={isActive && !reduce ? { x: ["-150%", "420%"] } : { x: "-150%" }}
                      transition={{ duration: 1.1, delay: 0.25, ease: "easeInOut" }}
                    />

                    {/* Time bar that fills before the next picture */}
                    {isActive && (
                      <motion.span
                        key={`${active}-${paused}`}
                        className="absolute left-0 bottom-0 h-1 w-full origin-left"
                        style={{ backgroundColor: primary }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: paused || reduce ? 0 : 1 }}
                        transition={{ duration: paused ? 0.3 : AUTO_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Little sparks that drift up */}
          {!reduce &&
            [12, 30, 52, 74, 90].map((left, i) => (
              <motion.span
                key={left}
                className="absolute bottom-4 w-1.5 h-1.5 rounded-full pointer-events-none"
                style={{ left: `${left}%`, backgroundColor: primary }}
                animate={{ y: [0, -240 - i * 20], opacity: [0, 0.9, 0], scale: [0.6, 1.3, 0.4] }}
                transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
              />
            ))}
        </div>

        {/* Controls */}
        <div className="relative z-40 mt-6 flex items-center justify-center gap-4">
          <motion.button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous picture"
            whileHover={{ scale: 1.12, x: -3 }}
            whileTap={{ scale: 0.88 }}
            className="grid place-items-center w-10 h-10 rounded-full border"
            style={{ borderColor: `${text}30` }}
          >
            <ChevronLeft size={18} />
          </motion.button>

          <div className="flex gap-2">
            {slides.map((_, i) => (
              <motion.button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show picture ${i + 1}`}
                aria-current={i === active}
                className="h-2 rounded-full"
                animate={{ width: i === active ? 28 : 8, backgroundColor: i === active ? primary : `${text}35` }}
                whileHover={{ scale: 1.3 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              />
            ))}
          </div>

          <motion.button
            type="button"
            onClick={() => go(1)}
            aria-label="Next picture"
            whileHover={{ scale: 1.12, x: 3 }}
            whileTap={{ scale: 0.88 }}
            className="grid place-items-center w-10 h-10 rounded-full border"
            style={{ borderColor: `${text}30` }}
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* Number of the picture that is showing */}
        <div className="mt-3 h-6 overflow-hidden text-center" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-semibold"
              style={{ color: primary }}
            >
              {active + 1} / {n}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Hero = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();

  // Typing effect state
  const [roleIndex, setRoleIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Typing effect
  useEffect(() => {
    const word = roles[roleIndex];
    let delay = deleting ? 45 : 90;
    if (!deleting && typed === word) delay = 1400;
    const t = setTimeout(() => {
      if (!deleting && typed === word) {
        setDeleting(true);
      } else if (deleting && typed === "") {
        setDeleting(false);
        setRoleIndex((i) => (i + 1) % roles.length);
      } else {
        setTyped(deleting ? word.slice(0, typed.length - 1) : word.slice(0, typed.length + 1));
      }
    }, delay);
    return () => clearTimeout(t);
  }, [typed, deleting, roleIndex]);

  return (
    <section
      className="relative min-h-screen overflow-hidden pt-32 lg:pt-28 pb-10 flex flex-col justify-between transition-colors duration-500"
      style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
    >
      <style>{`
        @keyframes rise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,-30px) scale(1.15); }
        }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes hero-spin { to { transform: rotate(360deg); } }
        .hero-rise { opacity: 0; animation: rise 0.8s cubic-bezier(.2,.7,.2,1) forwards; }
        .hero-float { animation: floaty 6s ease-in-out infinite; }
        .hero-marquee { animation: marquee 28s linear infinite; }
        .hero-blob { animation: blob 12s ease-in-out infinite; }
        .hero-caret { animation: blink 1s step-end infinite; }
        .hero-spin { animation: hero-spin 26s linear infinite; }
        .hero-spin-rev { animation: hero-spin 34s linear infinite reverse; }
        .hero-marquee-wrap:hover .hero-marquee { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .hero-rise, .hero-float, .hero-marquee, .hero-blob, .hero-caret, .hero-spin, .hero-spin-rev {
            animation: none !important; opacity: 1 !important;
          }
        }
      `}</style>

      {/* Background glow */}
      <div
        className="hero-blob absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full blur-[130px] opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.primary }}
      />
      <div
        className="hero-blob absolute -bottom-40 -left-24 w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: theme.secondary || theme.primary, animationDelay: "-5s" }}
      />

      <main className="relative z-10 w-full max-w-[1300px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
        {/* TEXT */}
        <div className="lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
        
          <h1
            className="hero-rise mt-6 text-4xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05]"
            style={{ animationDelay: "0.15s" }}
          >
            I build{" "}
            <span style={{ color: theme.primary }}>
              {typed}
              <span className="hero-caret font-light">|</span>
            </span>
            <br />
            that work well.
          </h1>

          <p
            className="hero-rise mt-6 max-w-xl mx-auto lg:mx-0 text-base md:text-lg leading-relaxed opacity-75"
            style={{ animationDelay: "0.3s" }}
          >
            Hi, I'm Gakenye, a certified software engineer in Kenya. I build web and mobile
            apps from start to finish: the screens people see, and the servers and databases
            that keep their data safe. I also add blockchain and AI tools to make your
            system secure, fast and easy to use on any device.
          </p>

          <div
            className="hero-rise mt-8 flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start"
            style={{ animationDelay: "0.45s" }}
          >
            <a
              href="/projects"
              className="group inline-flex items-center gap-3 rounded-full px-8 py-4 font-bold shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95"
              style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
            >
              See my projects
              <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>

            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.link}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid place-items-center w-11 h-11 rounded-full border opacity-70 transition-all duration-300 hover:opacity-100 hover:-translate-y-1 hover:rotate-6"
                  style={{ borderColor: `${theme["base-content"]}30`, color: theme["base-content"] }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* What I do */}
          <div
            className="hero-rise mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left"
            style={{ animationDelay: "0.6s" }}
          >
            {skills.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                style={{ borderColor: `${theme["base-content"]}18` }}
              >
                <span style={{ color: theme.primary }}>{s.icon}</span>
                <p className="mt-2 text-sm font-bold">{s.title}</p>
                <p className="mt-0.5 text-xs opacity-60 leading-snug">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PICTURES */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
          <div className="hero-rise w-full flex justify-center" style={{ animationDelay: "0.3s" }}>
            <PictureCarousel
              slides={images}
              primary={theme.primary}
              text={theme["base-content"]}
              reduce={reduce}
            />
          </div>
        </div>
      </main>

      {/* Moving list of skills */}
      <div
        className="hero-marquee-wrap relative z-10 mt-16 overflow-hidden border-y py-4"
        style={{ borderColor: `${theme["base-content"]}15` }}
      >
        <div className="hero-marquee flex w-max gap-12 whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-12 text-lg font-semibold opacity-50">
              {item}
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;