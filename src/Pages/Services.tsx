import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Smartphone,
  Boxes,
  Lightbulb,
  Network,
  Server,
  MessageCircle,
  PenTool,
  Hammer,
  Rocket,
  ArrowRight,
  Sparkles,
  GraduationCap,
  ShoppingCart,
  Bike,
  Ticket,
  School,
  CalendarCheck,
  CreditCard,
  Home,
  Stethoscope,
  Users,
  ArrowUpRight,
} from "lucide-react";

import heroImage from "../assets/computer-laptop-macbook-coding.jpg";
import logo from "../../public/LOGO.png";
import Footer from "../Components/Footer";
import { Navbar } from "../Components/Navbar";
import { useTheme } from "../ThemeContext";
import PageTitle from "../Components/PageTitle";
import SEO from "../Components/SEO";
import VirtualAssistant from "../Components/VirtualAssistant";

/* ---------- Page information (simple English) ---------- */

const photo = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=70`;

const techServices = [
  {
    title: "Full-Stack Web Development",
    desc: "I build websites and web apps from start to finish. They are fast, safe and ready to grow with you.",
    tags: ["PostgreSQL", "Express", "React", "Node.js", "TypeScript"],
    icon: Globe,
    image: photo("photo-1555952494-efd681c7e3f9"),
    alt: "Colourful web code on a computer screen",
  },
  {
    title: "Mobile App Development",
    desc: "I make phone apps for iPhone and Android from one codebase. They feel smooth and are easy to use.",
    tags: ["React Native", "Expo", "iOS", "Android"],
    icon: Smartphone,
    image: photo("photo-1515879218367-8466d910aaa4"),
    alt: "App code on a computer screen",
  },
  {
    title: "Blockchain & Smart Contracts",
    desc: "I write smart contracts. These are small programs on a blockchain that run by themselves. I test them on the Ethereum Sepolia network.",
    tags: ["Solidity", "Smart contracts", "Ethereum Sepolia"],
    icon: Boxes,
    image: photo("photo-1641352109623-f7b1eff605fd"),
    alt: "A gold bitcoin shining on dark stones",
  },
  {
    title: "Technical Consultancy",
    desc: "I help you pick the right tools, plan your system and make your database faster, so your project starts on the right foot.",
    tags: ["Software design", "Database tuning", "Tech choices"],
    icon: Lightbulb,
    image: photo("photo-1681164315014-06bf36b2597a"),
    alt: "A man working in front of two computer monitors",
  },
  {
    title: "Network Infrastructure",
    desc: "I do hands-on network work: hanging ADSS aerial cable, preparing fibre, writing maintenance reports and finding where the signal is lost.",
    tags: ["ADSS cable", "Fibre", "Troubleshooting"],
    icon: Network,
    image: photo("photo-1744868562210-fffb7fa882d9"),
    alt: "Yellow and green fibre optic cables neatly connected",
  },
  {
    title: "API & Backend Systems",
    desc: "I build safe and quick APIs, login systems and server code that your app can depend on every day.",
    tags: ["REST APIs", "Login security", "Server logic"],
    icon: Server,
    image: photo("photo-1504164996022-09080787b6b3"),
    alt: "Server code on a computer screen",
  },
  {
    title: "Programming Tutoring",
    desc: "I teach programming in small, easy steps. You learn a language by building real things, at your own speed, with help from me when you get stuck.",
    tags: ["JavaScript", "TypeScript", "React", "Solidity"],
    icon: GraduationCap,
    image: photo("photo-1461749280684-dccba630e2f6"),
    alt: "A monitor showing programming code",
  },
];

/* ---------- Types of apps I can build ---------- */

const appTypes = [
  {
    title: "E-commerce Stores",
    tagline: "Sell online, easily",
    desc: "Product catalogues, carts, checkout, M-Pesa/Stripe payments, order tracking, and an admin dashboard for you to manage everything.",
    icon: ShoppingCart,
    stack: ["React", "Node.js", "PostgreSQL", "Stripe", "M-Pesa"],
    accentFrom: "#10b981",
    accentTo: "#059669",
    image: photo("photo-1556742049-0cfed4f6a45d"),
  },
  {
    title: "Delivery & Logistics",
    tagline: "Move things from A to B",
    desc: "Live rider tracking, route assignment, delivery time estimates, customer notifications, and a dispatcher dashboard.",
    icon: Bike,
    stack: ["React Native", "Socket.IO", "Google Maps", "Node.js"],
    accentFrom: "#f59e0b",
    accentTo: "#d97706",
    image: photo("photo-1615824143262-ba78b2f6a6ea"),
  },
  {
    title: "Ticketing & Events",
    tagline: "Sell tickets, scan at the door",
    desc: "Event listings, seat/tier selection, QR-code tickets, on-site scanner, and a real-time sales dashboard for organisers.",
    icon: Ticket,
    stack: ["Next.js", "QR Codes", "PostgreSQL", "Stripe"],
    accentFrom: "#8b5cf6",
    accentTo: "#7c3aed",
    image: photo("photo-1492684223066-81342ee5ff30"),
  },
  {
    title: "School Management",
    tagline: "Run a school without paperwork",
    desc: "Student records, timetables, attendance, fees, exam scores, report cards, and parent logins — one system for the whole school.",
    icon: School,
    stack: ["React", "Express", "PostgreSQL", "Drizzle", "PDF"],
    accentFrom: "#0ea5e9",
    accentTo: "#0284c7",
    image: photo("photo-1580582932707-520aed937b7b"),
  },
  {
    title: "Bookings & Reservations",
    tagline: "Let clients book themselves",
    desc: "Calendar-based booking, availability rules, automatic confirmations via email/SMS, and a simple dashboard to manage appointments.",
    icon: CalendarCheck,
    stack: ["React", "Node.js", "Redis", "Twilio", "Stripe"],
    accentFrom: "#ec4899",
    accentTo: "#db2777",
    image: photo("photo-1517245386807-bb43f82c33c4"),
  },
  {
    title: "Fintech & Payments",
    tagline: "Move money, safely",
    desc: "Wallets, ledgers, transaction history, payment reconciliation, admin controls, and integration with mobile money or card processors.",
    icon: CreditCard,
    stack: ["Node.js", "PostgreSQL", "M-Pesa API", "Stripe", "JWT"],
    accentFrom: "#6366f1",
    accentTo: "#4f46e5",
    image: photo("photo-1563013544-824ae1b704d3"),
  },
  {
    title: "Property & Rentals",
    tagline: "List, rent, manage",
    desc: "Property listings with photos, landlord & tenant logins, rent collection, maintenance requests, and a simple admin dashboard to track everything.",
    icon: Home,
    stack: ["React", "Node.js", "PostgreSQL", "Cloudinary", "M-Pesa"],
    accentFrom: "#0891b2",
    accentTo: "#0e7490",
    image: photo("photo-1560518883-ce09059eeffa"),
  },
  {
    title: "Healthcare & Clinics",
    tagline: "Patients first",
    desc: "Patient records, appointments, doctor schedules, prescription history, and secure dashboards for clinic staff — fully role-based.",
    icon: Stethoscope,
    stack: ["React", "Express", "PostgreSQL", "JWT", "Twilio"],
    accentFrom: "#ef4444",
    accentTo: "#dc2626",
    image: photo("photo-1631815588090-d4bfec5b1ccb"),
  },
  {
    title: "Community & Social",
    tagline: "Connect your people",
    desc: "User profiles, follow/feed, comments, likes, notifications, and content moderation — great for communities, churches, alumni groups, and networks.",
    icon: Users,
    stack: ["React", "Node.js", "PostgreSQL", "Redis", "Socket.IO"],
    accentFrom: "#a855f7",
    accentTo: "#9333ea",
    image: photo("photo-1511367461989-f85a21fda167"),
  },
];

/* ---------- Rest unchanged ---------- */

const AUTO_MS = 4500;
const heroSlides = [
  {
    title: "Software Engineering",
    note: "Websites, apps and smart systems",
    image: heroImage,
    alt: "Laptop with code",
    icon: Sparkles,
  },
  {
    title: "Web Development",
    note: "Fast, safe web apps that grow with you",
    image: techServices[0].image,
    alt: techServices[0].alt,
    icon: Globe,
  },
  {
    title: "Blockchain",
    note: "Smart contracts that run by themselves",
    image: techServices[2].image,
    alt: techServices[2].alt,
    icon: Boxes,
  },
  {
    title: "Network Engineering",
    note: "Fibre, ADSS cable and signal checks",
    image: techServices[4].image,
    alt: techServices[4].alt,
    icon: Network,
  },
  {
    title: "Programming Tutoring",
    note: "Learn to code by building real things",
    image: techServices[6].image,
    alt: techServices[6].alt,
    icon: GraduationCap,
  },
];

const steps = [
  { title: "We talk", desc: "You tell me your idea and your goals.", icon: MessageCircle },
  { title: "I plan", desc: "I choose the tools and make a clear roadmap.", icon: PenTool },
  { title: "I build", desc: "I make it step by step and show you progress.", icon: Hammer },
  { title: "We launch", desc: "I put it online and stay to support you.", icon: Rocket },
];

const faqs = [
  {
    question: "How long does a project take?",
    answer:
      "It depends on the size of the work. A normal web or mobile app takes about 2 to 4 weeks from the first idea to going live. Small tasks, like adding one feature, can be done much faster.",
  },
  {
    question: "Do you help after the project is live?",
    answer:
      "Yes. I stay with you after launch. I watch how the app performs, fix bugs and add new features, so your product stays safe, fast and working well.",
  },
  {
    question: "Can you teach me to code?",
    answer:
      "Yes. I tutor beginners and people who already code. We start from where you are, pick a language together, and learn by building small real projects. You can set the speed.",
  },
  {
    question: "How do I start a project with you?",
    answer:
      "It is easy. Go to the contact page and fill in the form with your idea or needs. Then we will talk, and I will plan the tools and the steps with you.",
  },
];

/* ---------- Small helper parts ---------- */

const followMouse = (e: React.MouseEvent<HTMLElement>) => {
  const box = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - box.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - box.top}px`);
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] },
  },
};

const WordTitle = ({
  text,
  className = "",
  color,
}: {
  text: string;
  className?: string;
  color?: string;
}) => (
  <motion.h2
    className={className}
    style={{ color }}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.6 }}
    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    aria-label={text}
  >
    {text.split(" ").map((word, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.1em] mr-[0.25em]">
        <motion.span
          className="inline-block"
          variants={{
            hidden: { y: "110%" },
            show: { y: 0, transition: { duration: 0.7, ease: [0.2, 0.7, 0.2, 1] } },
          }}
        >
          {word}
        </motion.span>
      </span>
    ))}
  </motion.h2>
);

/* ---------- Hero picture carousel (unchanged) ---------- */

const HeroCarousel = ({
  primary,
  base,
  text,
  reduce,
}: {
  primary: string;
  base: string;
  text: string;
  reduce: boolean | null;
}) => {
  const n = heroSlides.length;
  const half = Math.floor(n / 2);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 14 });
  const sy = useSpring(my, { stiffness: 80, damping: 14 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);

  const go = (direction: number) => setActive((a) => (a + direction + n) % n);

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

  const current = heroSlides[active];

  return (
    <div
      className="flex-1 w-full max-w-xl lg:max-w-none"
      role="region"
      aria-roledescription="carousel"
      aria-label="Pictures of my work"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-x-10 inset-y-6 rounded-full blur-[90px] pointer-events-none"
          style={{ backgroundColor: primary }}
          animate={reduce ? { opacity: 0.25 } : { opacity: [0.18, 0.4, 0.18], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className="sv-spin absolute inset-2 sm:inset-0 rounded-full border-2 border-dashed opacity-25 pointer-events-none"
          style={{ borderColor: primary }}
        />
        <div
          className="sv-spin-rev absolute inset-10 rounded-full border opacity-20 pointer-events-none"
          style={{ borderColor: text }}
        />

        <motion.div
          className="relative h-[22rem] sm:h-[29rem] select-none"
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
            {heroSlides.map((slide, i) => {
              const offset = ((i - active + n + half) % n) - half;
              const abs = Math.abs(offset);
              const isActive = offset === 0;
              const Icon = slide.icon;
              return (
                <motion.div
                  key={slide.title}
                  className="absolute inset-0 m-auto w-[64%] h-[86%] rounded-3xl overflow-hidden shadow-2xl"
                  style={{
                    zIndex: n - abs,
                    transformStyle: "preserve-3d",
                    border: `1px solid ${text}30`,
                    cursor: isActive ? "grab" : "pointer",
                    pointerEvents: abs > 1 ? "none" : "auto",
                    backgroundColor: `${primary}22`,
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
                  <motion.img
                    src={slide.image}
                    alt={slide.alt}
                    draggable={false}
                    loading={i === 0 ? "eager" : "lazy"}
                    onError={(e) => (e.currentTarget.style.opacity = "0")}
                    className="absolute inset-0 w-full h-full object-cover"
                    animate={isActive && !reduce ? { scale: [1, 1.18], x: ["0%", "-3%"] } : { scale: 1, x: "0%" }}
                    transition={isActive ? { duration: 7, ease: "easeOut" } : { duration: 0.6 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${base}f0 0%, ${base}55 35%, transparent 65%)` }}
                  />

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

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end gap-3">
                    <motion.span
                      className="grid place-items-center shrink-0 w-11 h-11 rounded-2xl shadow-lg"
                      style={{ backgroundColor: primary, color: base }}
                      initial={false}
                      animate={isActive ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -90, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 14, delay: isActive ? 0.3 : 0 }}
                    >
                      <Icon size={20} />
                    </motion.span>
                    <motion.div
                      className="min-w-0"
                      initial={false}
                      animate={isActive ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }}
                      transition={{ duration: 0.5, delay: isActive ? 0.4 : 0 }}
                    >
                      <p className="font-bold text-lg sm:text-xl leading-tight text-white drop-shadow">{slide.title}</p>
                      <p className="text-xs sm:text-sm text-white/80 leading-snug">{slide.note}</p>
                    </motion.div>
                  </div>

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

        {[
          { label: "Web", pos: "top-2 left-0", delay: 0 },
          { label: "Mobile", pos: "top-[45%] -right-2", delay: 1.2 },
          { label: "Blockchain", pos: "bottom-6 left-2", delay: 2.4 },
        ].map((chip) => (
          <motion.span
            key={chip.label}
            className={`absolute z-20 ${chip.pos} rounded-full px-4 py-1.5 text-sm font-semibold shadow-lg backdrop-blur-md`}
            style={{ backgroundColor: primary, color: base }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{
              opacity: { delay: 1 + chip.delay * 0.2, duration: 0.5 },
              scale: { delay: 1 + chip.delay * 0.2, type: "spring" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: chip.delay },
              rotate: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: chip.delay },
            }}
          >
            {chip.label}
          </motion.span>
        ))}

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

      <div className="mt-6 flex items-center justify-center gap-4">
        <motion.button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous picture"
          whileHover={{ scale: 1.12, x: -3 }}
          whileTap={{ scale: 0.88 }}
          className="grid place-items-center w-11 h-11 rounded-full border"
          style={{ borderColor: `${text}30` }}
        >
          <ChevronLeft size={20} />
        </motion.button>

        <div className="flex items-center gap-2">
          {heroSlides.map((slide, i) => (
            <motion.button
              key={slide.title}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${slide.title}`}
              aria-current={i === active}
              className="h-2.5 rounded-full"
              animate={{ width: i === active ? 36 : 10, backgroundColor: i === active ? primary : `${text}33` }}
              whileHover={{ scale: 1.25 }}
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
          className="grid place-items-center w-11 h-11 rounded-full border"
          style={{ borderColor: `${text}30` }}
        >
          <ChevronRight size={20} />
        </motion.button>
      </div>

      <div className="mt-4 h-7 overflow-hidden text-center" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={current.title}
            initial={{ y: 28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -28, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-sm font-semibold"
            style={{ color: primary }}
          >
            {active + 1} / {n} &middot; {current.title}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ---------- Page ---------- */

const ServicesPage: React.FC = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const primary = theme.primary;
  const secondary = theme.secondary || theme.primary;
  const base = theme["base-100"];
  const text = theme["base-content"];
  const soft = `${text}18`;

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  const marqueeItems = techServices.map((s) => s.title);
  const heroWords = ["I", "build", "software", "and", "connect", "networks."];

  /* ---------- Mobile carousel for app-types ---------- */
  const [appIndex, setAppIndex] = useState(0);
  const [appPaused, setAppPaused] = useState(false);
  const appTrackRef = useRef<HTMLDivElement>(null);
  const preferReduced = useRef(false);

  useEffect(() => {
    preferReduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const scrollAppTo = useCallback((idx: number) => {
    const track = appTrackRef.current;
    if (!track) return;
    const children = track.querySelectorAll<HTMLElement>("[data-app-slide]");
    const target = children[idx];
    if (!target) return;
    track.scrollTo({
      left: target.offsetLeft - track.offsetLeft,
      behavior: preferReduced.current ? "auto" : "smooth",
    });
  }, []);

  const onAppScroll = () => {
    const track = appTrackRef.current;
    if (!track) return;
    const children = track.querySelectorAll<HTMLElement>("[data-app-slide]");
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let min = Infinity;
    children.forEach((el, i) => {
      const elCenter = el.offsetLeft - track.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(center - elCenter);
      if (dist < min) {
        min = dist;
        closest = i;
      }
    });
    setAppIndex(closest);
  };

  const goApp = (dir: -1 | 1) => {
    if (appTypes.length === 0) return;
    const next = (appIndex + dir + appTypes.length) % appTypes.length;
    setAppIndex(next);
    scrollAppTo(next);
  };

  /* ---------- Auto-scroll the mobile carousel ---------- */
  useEffect(() => {
    if (reduce) return;
    if (appPaused) return;
    if (appTypes.length < 2) return;

    const id = window.setInterval(() => {
      setAppIndex((prev) => {
        const next = (prev + 1) % appTypes.length;
        scrollAppTo(next);
        return next;
      });
    }, 4500);

    return () => window.clearInterval(id);
  }, [appPaused, reduce, scrollAppTo]);

  /* Pause when the browser tab is hidden */
  useEffect(() => {
    const onVis = () => setAppPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  /* ---------- Single app-type card (reused) ---------- */
  const renderAppCard = (
    app: (typeof appTypes)[number],
    index: number,
    showImage = false
  ) => {
    const Icon = app.icon;
    return (
      <motion.article
        key={app.title}
        variants={rise}
        onMouseMove={followMouse}
        whileHover={{ y: -8 }}
        className="sv-app-card group relative flex flex-col rounded-3xl border overflow-hidden text-left h-full"
        style={
          {
            borderColor: soft,
            backgroundColor: `${text}05`,
            "--mx": "50%",
            "--my": "50%",
            ["--sv-accent" as any]: app.accentFrom,
          } as React.CSSProperties
        }
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
          style={{
            background: `radial-gradient(320px circle at var(--mx) var(--my), ${app.accentFrom}22, transparent 45%)`,
          }}
        />

        <div
          className="relative h-2 w-full"
          style={{ background: `linear-gradient(90deg, ${app.accentFrom}, ${app.accentTo})` }}
        />

        {/* Optional thumbnail band — only on mobile carousel */}
        {showImage && (
          <div
            className="relative w-full aspect-[16/9] overflow-hidden"
            style={{ backgroundColor: `${app.accentFrom}22` }}
          >
            <img
              src={app.image}
              alt={app.title}
              loading="lazy"
              onError={(e) => (e.currentTarget.style.opacity = "0")}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to top, ${base}ee 0%, ${base}66 45%, transparent 90%)`,
              }}
            />
            <span
              className="absolute left-4 bottom-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg backdrop-blur-md"
              style={{
                backgroundColor: app.accentFrom,
                color: "#ffffff",
              }}
            >
              <Icon size={11} />
              {app.tagline}
            </span>
          </div>
        )}

        <div className="relative z-[2] flex flex-col p-6 sm:p-7 flex-1">
          <div className="mb-5 flex items-start justify-between">
            <motion.div
              whileHover={{ rotate: -6, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              className="grid place-items-center w-14 h-14 rounded-2xl shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${app.accentFrom}, ${app.accentTo})`,
                color: "#ffffff",
              }}
            >
              <Icon size={26} />
            </motion.div>

            <span
              className="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{
                borderColor: `${app.accentFrom}55`,
                color: app.accentFrom,
                backgroundColor: `${app.accentFrom}12`,
              }}
            >
              {app.tagline}
            </span>
          </div>

          <h3 className="text-xl font-bold leading-snug mb-2">{app.title}</h3>
          <p className="text-sm leading-relaxed opacity-70 mb-5 flex-1">{app.desc}</p>

          <div className="mt-auto flex flex-wrap gap-1.5">
            {app.stack.map((s) => (
              <span
                key={s}
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold transition-transform duration-300 group-hover:-translate-y-0.5"
                style={{
                  backgroundColor: `${app.accentFrom}18`,
                  color: app.accentFrom,
                }}
              >
                {s}
              </span>
            ))}
          </div>

          <div
            className="mt-5 flex items-center justify-between pt-4 border-t"
            style={{ borderColor: `${text}18` }}
          >
            <span className="text-[11px] font-semibold opacity-50 uppercase tracking-wider">
              Want one?
            </span>
            <Link
              to="/contact"
              className="group/cta inline-flex items-center gap-1.5 text-xs font-bold transition-all"
              style={{ color: app.accentFrom }}
            >
              Let&apos;s talk
              <ArrowUpRight
                size={13}
                className="transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
              />
            </Link>
          </div>
        </div>
      </motion.article>
    );
  };

  return (
    <>
      <SEO
        title="Gakenye Ndiritu | Services & Technical Consultancy"
        description="Explore professional full-stack engineering, React Native mobile apps, blockchain solutions, API architecture, and network infrastructure services offered by Gakenye Ndiritu."
        path="/services"
      />

      <style>{`
        @keyframes sv-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes sv-blob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-30px) scale(1.15); } }
        @keyframes sv-spin { to { transform: rotate(360deg); } }
        @keyframes sv-shine { 0% { transform: translateX(-120%) skewX(-20deg); } 60%,100% { transform: translateX(260%) skewX(-20deg); } }
        @keyframes sv-orbit { to { transform: rotate(360deg); } }
        .sv-marquee { animation: sv-marquee 38s linear infinite; }
        .sv-marquee-wrap:hover .sv-marquee { animation-play-state: paused; }
        .sv-blob { animation: sv-blob 12s ease-in-out infinite; }
        .sv-spin { animation: sv-spin 26s linear infinite; }
        .sv-spin-rev { animation: sv-spin 34s linear infinite reverse; }
        .sv-shine::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent);
          animation: sv-shine 3.2s ease-in-out infinite;
        }
        .sv-app-card { position: relative; overflow: hidden; }
        .sv-app-card::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.08) 45%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 1s cubic-bezier(.2,.7,.2,1);
          pointer-events: none; z-index: 1;
        }
        .sv-app-card:hover::before { transform: translateX(120%); }
        .sv-app-card::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px;
          transform: scaleX(0); transform-origin: left; transition: transform .6s ease;
        }
        .sv-app-card:hover::after { transform: scaleX(1); }
        .sv-orbit { animation: sv-orbit 40s linear infinite; }

        /* Mobile-only carousel for the app-types grid */
        .sv-app-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          scroll-padding-left: 0.5rem;
          scroll-padding-right: 0.5rem;
        }
        .sv-app-track::-webkit-scrollbar { display: none; }
        .sv-app-slide { scroll-snap-align: center; flex: 0 0 auto; }
        .sv-app-dot { transition: width .3s, background-color .3s, opacity .3s; }

        @media (prefers-reduced-motion: reduce) {
          .sv-marquee, .sv-blob, .sv-spin, .sv-spin-rev, .sv-shine::after, .sv-orbit { animation: none !important; }
          .sv-app-card::before { transition: none; }
          .sv-app-track { scroll-behavior: auto; }
        }
      `}</style>

      <PageTitle title="Services & Technical Consultancy" />
      <Navbar />

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[60]"
        style={{ scaleX: progress, backgroundColor: primary }}
      />

      <div
        className="relative font-sans pt-[4.5rem] lg:pt-[5rem] pb-[4.5rem] lg:pb-0 min-h-screen flex flex-col justify-between"
        style={{ backgroundColor: base, color: text, overflowX: "clip" }}
      >
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className="w-[70vw] md:w-[45vw] lg:w-[35vw] object-contain opacity-[0.03] select-none"
          />
        </div>

        <div
          className="absolute inset-x-0 top-0 h-[38rem] pointer-events-none opacity-60"
          style={{
            backgroundImage: `radial-gradient(${text}26 1px, transparent 1px)`,
            backgroundSize: "26px 26px",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)",
          }}
        />
        <div
          className="sv-blob absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full blur-[130px] opacity-25 pointer-events-none"
          style={{ backgroundColor: primary }}
        />
        <div
          className="sv-blob absolute top-[48rem] -left-24 w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-15 pointer-events-none"
          style={{ backgroundColor: secondary, animationDelay: "-5s" }}
        />

        <div className="relative z-10">
          {/* ---------- HERO ---------- */}
          <section className="py-12 px-4 sm:py-16 sm:px-6 lg:px-20 flex flex-col-reverse lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left space-y-6">
              

              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]"
                aria-label="I build software and connect networks."
              >
                {heroWords.map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.12em] mr-[0.25em]">
                    <motion.span
                      className="inline-block"
                      initial={{ y: "110%" }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                      style={{ color: i >= 4 ? primary : undefined }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.7 }}
                className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg lg:text-xl leading-relaxed opacity-75"
              >
                Software engineering, expert advice and reliable network work, all from one person you can trust.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.7 }}
                className="flex flex-wrap justify-center lg:justify-start gap-3"
              >
                <motion.div whileHover={{ y: -3, scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    to="/contact"
                    className="group relative overflow-hidden inline-flex items-center gap-2 rounded-full px-6 py-3 text-base sm:text-lg font-semibold shadow-lg sv-shine"
                    style={{ backgroundColor: primary, color: base }}
                  >
                    Get in Touch
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
                <motion.a
                  href="#offer"
                  whileHover={{ y: -3, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="inline-flex items-center rounded-full border px-6 py-3 text-base sm:text-lg font-semibold"
                  style={{ borderColor: `${text}30` }}
                >
                  See what I offer
                </motion.a>
              </motion.div>
            </div>

            <HeroCarousel primary={primary} base={base} text={text} reduce={reduce} />
          </section>

          {/* ---------- MOVING LINE ---------- */}
          <div
            className="sv-marquee-wrap overflow-hidden border-y py-5"
            style={{
              borderColor: `${text}15`,
              WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
            aria-hidden="true"
          >
            <div className="sv-marquee flex w-max gap-12 whitespace-nowrap">
              {[...marqueeItems, ...marqueeItems].map((item, i) => (
                <span key={i} className="flex items-center gap-12 text-xl font-semibold opacity-45">
                  {item}
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                </span>
              ))}
            </div>
          </div>

          {/* ---------- WHAT I OFFER ---------- */}
          <section id="offer" className="py-16 px-4 sm:px-6 lg:px-20 max-w-7xl mx-auto scroll-mt-24">
            <div className="text-center mb-12 space-y-3">
              <WordTitle
                text="What I Offer"
                className="text-3xl sm:text-5xl font-extrabold tracking-tight"
                color={primary}
              />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.65 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="max-w-xl mx-auto"
              >
                Seven ways I can help you build, fix, grow and learn.
              </motion.p>
            </div>

            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {techServices.map((service, idx) => {
                const Icon = service.icon;
                const isWide = idx === techServices.length - 1;
                return (
                  <motion.article
                    key={service.title}
                    variants={rise}
                    onMouseMove={followMouse}
                    whileHover={{ y: -8 }}
                    className={`group relative overflow-hidden rounded-3xl border flex flex-col text-left ${
                      isWide ? "lg:col-span-3 lg:flex-row" : ""
                    }`}
                    style={
                      {
                        borderColor: soft,
                        backgroundColor: `${text}05`,
                        "--mx": "50%",
                        "--my": "50%",
                      } as React.CSSProperties
                    }
                  >
                    <div
                      className={`relative overflow-hidden shrink-0 aspect-[16/10] ${
                        isWide ? "lg:aspect-auto lg:w-1/2 lg:min-h-[20rem]" : ""
                      }`}
                      style={{ backgroundColor: `${primary}22` }}
                    >
                      <img
                        src={service.image}
                        alt={service.alt}
                        loading="lazy"
                        onError={(e) => (e.currentTarget.style.opacity = "0")}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(to top, ${base}cc, transparent 55%)` }}
                      />
                      <span
                        className="absolute left-5 bottom-4 grid place-items-center w-12 h-12 rounded-2xl shadow-lg transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                        style={{ backgroundColor: primary, color: base }}
                      >
                        <Icon size={22} />
                      </span>
                    </div>

                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(340px circle at var(--mx) var(--my), ${primary}22, transparent 45%)`,
                      }}
                    />
                    <span
                      className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out"
                      style={{ backgroundColor: primary }}
                    />

                    <div
                      className={`relative flex flex-col flex-1 p-6 sm:p-8 ${isWide ? "lg:justify-center lg:p-12" : ""}`}
                    >
                      <h3 className={`font-bold mb-3 leading-snug ${isWide ? "text-2xl sm:text-3xl" : "text-xl"}`}>
                        {service.title}
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed opacity-70 mb-6">{service.desc}</p>

                      <div className="mt-auto flex flex-wrap gap-2">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full px-3 py-1 text-xs font-semibold transition-transform duration-300 group-hover:-translate-y-0.5"
                            style={{ backgroundColor: `${primary}18`, color: primary }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </section>

          {/* ---------- TYPES OF APPS I BUILD ---------- */}
          <section
            id="app-types"
            className="relative py-16 px-4 sm:px-6 lg:px-20 max-w-7xl mx-auto scroll-mt-24"
          >
            <div
              className="sv-orbit pointer-events-none absolute -right-40 top-20 w-[28rem] h-[28rem] rounded-full border-2 border-dashed opacity-[0.08]"
              style={{ borderColor: primary }}
              aria-hidden="true"
            />

            <div className="relative text-center mb-12 space-y-3">
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em]"
                style={{ borderColor: `${primary}55`, backgroundColor: `${primary}12`, color: primary }}
              >
                <Sparkles size={12} />
                Apps I Build
              </motion.div>
              <WordTitle
                text="Types of Apps I Can Build"
                className="text-3xl sm:text-5xl font-extrabold tracking-tight"
                color={primary}
              />
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.65 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="max-w-2xl mx-auto"
              >
                Different businesses need different apps. Here are the kinds I've built or can build
                for you — from stores to schools to delivery fleets.
              </motion.p>
            </div>

            {/* ========== DESKTOP + TABLET: grid ========== */}
            <motion.div
              className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
            >
              {appTypes.map((app) => renderAppCard(app, 0))}
            </motion.div>

            {/* ========== MOBILE: carousel with auto-scroll ========== */}
            <div className="sm:hidden">
              {appTypes.length > 1 && (
                <div className="mb-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                  <ChevronLeft size={11} />
                  Swipe · auto-advances
                  <ChevronRight size={11} />
                </div>
              )}

              <div
                ref={appTrackRef}
                className="sv-app-track flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3"
                onScroll={onAppScroll}
                onMouseEnter={() => setAppPaused(true)}
                onMouseLeave={() => setAppPaused(false)}
                onTouchStart={() => setAppPaused(true)}
                onTouchEnd={() => setAppPaused(false)}
                onFocus={() => setAppPaused(true)}
                onBlur={() => setAppPaused(false)}
                role="region"
                aria-label="Types of apps carousel. Auto-advances every few seconds."
              >
                {appTypes.map((app, i) => (
                  <div
                    key={app.title}
                    data-app-slide
                    className="sv-app-slide w-[85%] min-w-0"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.15 }}
                      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                      className="h-full"
                    >
                      {renderAppCard(app, i, true)}
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* Arrows */}
              {appTypes.length > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => goApp(-1)}
                    aria-label="Previous app type"
                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
                    style={{ borderColor: `${text}30`, color: text }}
                  >
                    <ChevronLeft size={14} />
                    Prev
                  </button>
                  <button
                    onClick={() => goApp(1)}
                    aria-label="Next app type"
                    className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
                    style={{ borderColor: `${text}30`, color: text }}
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}

              {/* Dots */}
              {appTypes.length > 1 && (
                <div className="mt-4 flex items-center justify-center gap-1.5">
                  {appTypes.map((_, i) => {
                    const active = i === appIndex;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setAppIndex(i);
                          scrollAppTo(i);
                        }}
                        aria-label={`Show app type ${i + 1}`}
                        aria-current={active}
                        className="sv-app-dot h-2.5 rounded-full"
                        style={{
                          width: active ? 28 : 10,
                          backgroundColor: active ? primary : `${text}44`,
                          opacity: active ? 1 : 0.6,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Closing note */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.6 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-10 text-center text-sm"
            >
              Don't see yours?{" "}
              <Link to="/contact" className="font-semibold underline underline-offset-4" style={{ color: primary }}>
                Tell me the idea
              </Link>{" "}
              — I build custom too.
            </motion.p>
          </section>

          {/* ---------- HOW I WORK ---------- */}
          <section className="py-16 px-4 sm:px-6 lg:px-20 max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <WordTitle
                text="How We Work Together"
                className="text-3xl sm:text-5xl font-extrabold tracking-tight"
                color={primary}
              />
            </div>

            <div className="relative">
              <motion.div
                className="hidden lg:block absolute top-7 left-[12%] right-[12%] h-0.5 origin-left"
                style={{ backgroundColor: `${primary}55` }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <motion.div key={step.title} variants={rise} className="relative text-center space-y-3">
                      <motion.span
                        whileHover={{ rotate: 10, scale: 1.12 }}
                        className="relative z-10 mx-auto grid place-items-center w-14 h-14 rounded-full shadow-lg"
                        style={{ backgroundColor: primary, color: base }}
                      >
                        <Icon size={24} />
                      </motion.span>
                      <h3 className="text-lg font-bold">{step.title}</h3>
                      <p className="text-sm opacity-65 leading-relaxed max-w-[15rem] mx-auto">{step.desc}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </section>

          {/* ---------- FAQ ---------- */}
          <section className="py-16 px-4 sm:px-6 lg:px-20 max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <WordTitle
                text="Common Questions"
                className="text-3xl sm:text-5xl font-extrabold tracking-tight"
                color={primary}
              />
            </div>

            <motion.div
              className="space-y-4"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    variants={rise}
                    className="rounded-2xl border overflow-hidden backdrop-blur-sm transition-colors duration-300"
                    style={{
                      borderColor: isOpen ? `${primary}77` : soft,
                      backgroundColor: isOpen ? `${primary}0d` : `${text}05`,
                    }}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-semibold text-base sm:text-lg focus:outline-none focus-visible:ring-2"
                      style={{ "--tw-ring-color": primary } as React.CSSProperties}
                    >
                      <span>{faq.question}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid place-items-center shrink-0 w-9 h-9 rounded-full"
                        style={{ backgroundColor: `${primary}1a`, color: primary }}
                      >
                        <ChevronDown size={18} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <motion.p
                            initial={{ y: -8 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.35 }}
                            className="px-5 sm:px-6 pb-6 text-sm sm:text-base leading-relaxed opacity-75"
                          >
                            {faq.answer}
                          </motion.p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* ---------- CALL TO ACTION ---------- */}
          <section className="py-16 px-4 sm:px-6 lg:px-20 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
              className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border-2 border-dashed p-8 sm:p-12 md:p-16 text-center"
              style={{ borderColor: `${text}30` }}
            >
              <div
                className="sv-spin absolute -right-20 -top-20 w-64 h-64 rounded-full border-2 border-dashed opacity-20 pointer-events-none"
                style={{ borderColor: primary }}
              />
              <div
                className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full blur-[110px] opacity-20 pointer-events-none"
                style={{ backgroundColor: primary }}
              />

              <div className="relative space-y-6">
                <motion.span
                  animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-grid place-items-center w-14 h-14 rounded-2xl"
                  style={{ backgroundColor: `${primary}1a`, color: primary }}
                >
                  <Rocket size={26} />
                </motion.span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Let's Build Something Together</h2>
                <p className="max-w-2xl mx-auto text-base sm:text-lg opacity-70 leading-relaxed">
                  Do you have a software idea, a network problem, or need good technical advice? Tell me about it and
                  we will find the best way forward.
                </p>
                <motion.div className="inline-block" whileHover={{ y: -3, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/contact"
                    className="group relative overflow-hidden inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base sm:text-lg font-semibold shadow-lg sv-shine"
                    style={{ backgroundColor: primary, color: base }}
                  >
                    Contact Me
                    <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </section>
        </div>

        <Footer />
        <div
          className="
            pointer-events-none fixed inset-x-0 top-[94%] -translate-y-1/2 z-[100]
            flex justify-end
            px-3
            sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-6 sm:translate-y-0
            sm:px-0
          "
        >
          <div className="pointer-events-auto">
            <VirtualAssistant />
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;