// src/Components/VirtualAssistant.tsx
import React, { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Mail,
  MessageCircle,
  Minus,
  Phone,
  Send,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useDispatch } from "react-redux";

import { projectsApi, type Project } from "../Features/Apis/Projects.Api";
import {
  skillsApi,
  useGetSkillsQuery,
  useGetSkillsGroupedQuery,
  type TSkill as TechSkill,
} from "../Features/Apis/Skills.Api";

const WHATSAPP_URL = "https://wa.link/f3ajog";
const PROJECTS_URL = "/projects";
const PROJECT_PAGE_URL = "/project";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type Action = "projects" | "whatsapp" | "services" | "apps";

type AppCategory = {
  emoji: string;
  title: string;
  tagline: string;
  desc: string;
  tech: string[];
};

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  actions?: Action[];
  projects?: Project[];
  moreProjects?: number;
  skills?: TechSkill[];
  contact?: boolean;
  info?: { label: string; value: string; hint?: string }[];
  apps?: AppCategory[];
};

type Intent =
  | "greeting" | "about" | "education" | "certificates" | "availability"
  | "services" | "web" | "mobile" | "backend" | "database" | "blockchain"
  | "ai" | "projects" | "skills" | "hire" | "pricing" | "timeline"
  | "process" | "student" | "location" | "contact" | "thanks" | "goodbye"
  | "appointment" | "app_types" | "fallback";

/* -------------------------------------------------------------------------- */
/*  Quick actions                                                             */
/* -------------------------------------------------------------------------- */

const QUICK_ACTIONS = [
  "Show me your projects",
  "What services do you offer?",
  "Types of apps you build",
  "Who is Gakenye?",
  "Technologies you use",
  "Are you available?",
  "Project pricing",
  "Book an appointment",
];

const PROFILE = {
  name: "Gakenye Ndiritu",
  university: "Laikipia University",
  location: "Nyahururu, Kenya",
  email: "codewithgakenye@gmail.com",
  availability: "Open to new projects and collaborations",
  certificates: [
    "Teach2Give — Software Development Program",
    "SoloLearn — Web Development Basics",
  ],
  technologies: [
    "React", "TypeScript", "JavaScript", "Node.js", "Express", "React Native",
    "Expo", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "REST APIs",
    "Blockchain", "AI integrations", "Docker",
  ],
};

const CONTACT = {
  phone: "+254 789 757 457",
  phoneLink: "tel:+254789757457",
  email: PROFILE.email,
};

const CONTACT_ROWS = [
  { key: "whatsapp", icon: MessageCircle, label: "WhatsApp", note: "Fastest way to reach me", href: WHATSAPP_URL, brand: "#25D366" },
  { key: "phone", icon: Phone, label: "Call", note: CONTACT.phone, href: CONTACT.phoneLink },
  { key: "email", icon: Mail, label: "Email", note: CONTACT.email, href: `mailto:${CONTACT.email}` },
  { key: "github", icon: Github, label: "GitHub", note: "See my code", href: "https://github.com/Gakenye8741" },
  { key: "linkedin", icon: Linkedin, label: "LinkedIn", note: "Work and experience", href: "https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/" },
  { key: "instagram", icon: Instagram, label: "Instagram", note: "Follow my journey", href: "https://www.instagram.com/_code.d_by_gakenye_/" },
];

/* -------------------------------------------------------------------------- */
/*  App types — exactly what's on the services page                            */
/* -------------------------------------------------------------------------- */

const APP_TYPES: AppCategory[] = [
  {
    emoji: "🛒",
    title: "E-commerce Stores",
    tagline: "Sell online, easily",
    desc: "Product catalogues, carts, checkout, M-Pesa/Stripe payments, order tracking, and an admin dashboard for you to manage everything.",
    tech: ["React", "Node.js", "PostgreSQL", "Stripe", "M-Pesa"],
  },
  {
    emoji: "🚚",
    title: "Delivery & Logistics",
    tagline: "Move things from A to B",
    desc: "Live rider tracking, route assignment, delivery time estimates, customer notifications, and a dispatcher dashboard.",
    tech: ["React Native", "Socket.IO", "Google Maps", "Node.js"],
  },
  {
    emoji: "🎟️",
    title: "Ticketing & Events",
    tagline: "Sell tickets, scan at the door",
    desc: "Event listings, seat/tier selection, QR-code tickets, on-site scanner, and a real-time sales dashboard for organisers.",
    tech: ["Next.js", "QR Codes", "PostgreSQL", "Stripe"],
  },
  {
    emoji: "🏫",
    title: "School Management",
    tagline: "Run a school without paperwork",
    desc: "Student records, timetables, attendance, fees, exam scores, report cards, and parent logins — one system for the whole school.",
    tech: ["React", "Express", "PostgreSQL", "Drizzle", "PDF"],
  },
  {
    emoji: "📅",
    title: "Bookings & Reservations",
    tagline: "Let clients book themselves",
    desc: "Calendar-based booking, availability rules, automatic confirmations via email/SMS, and a simple dashboard to manage appointments.",
    tech: ["React", "Node.js", "Redis", "Twilio", "Stripe"],
  },
  {
    emoji: "💳",
    title: "Fintech & Payments",
    tagline: "Move money, safely",
    desc: "Wallets, ledgers, transaction history, payment reconciliation, admin controls, and integration with mobile money or card processors.",
    tech: ["Node.js", "PostgreSQL", "M-Pesa API", "Stripe", "JWT"],
  },
  {
    emoji: "🏠",
    title: "Property & Rentals",
    tagline: "List, rent, manage",
    desc: "Property listings with photos, landlord & tenant logins, rent collection, maintenance requests, and a simple admin dashboard to track everything.",
    tech: ["React", "Node.js", "PostgreSQL", "Cloudinary", "M-Pesa"],
  },
  {
    emoji: "🏥",
    title: "Healthcare & Clinics",
    tagline: "Patients first",
    desc: "Patient records, appointments, doctor schedules, prescription history, and secure dashboards for clinic staff — fully role-based.",
    tech: ["React", "Express", "PostgreSQL", "JWT", "Twilio"],
  },
  {
    emoji: "👥",
    title: "Community & Social",
    tagline: "Connect your people",
    desc: "User profiles, follow/feed, comments, likes, notifications, and content moderation — great for communities, churches, alumni groups, and networks.",
    tech: ["React", "Node.js", "PostgreSQL", "Redis", "Socket.IO"],
  },
];

/* -------------------------------------------------------------------------- */
/*  Static responses                                                          */
/* -------------------------------------------------------------------------- */

const RESPONSES: Record<Exclude<Intent, "projects" | "skills" | "app_types">, string> = {
  greeting:
    "Hi there! 👋 I'm Gakenye's portfolio assistant.\n\nI can tell you about his projects, services, skills, certificates, pricing or availability — and help you book a discovery call.",

  about: `${PROFILE.name} is a certified full-stack developer and final-year Computer Science student at ${PROFILE.university}.\n\nHe builds web and mobile apps end to end: interfaces, backend APIs, databases and integrations, with an interest in blockchain and AI.\n\nBased in ${PROFILE.location}. ${PROFILE.availability}.`,

  education: `Gakenye is a final-year BSc Computer Science student at ${PROFILE.university}, combining his studies with hands-on software projects.`,

  certificates: `Gakenye's training and certificates:\n\n${PROFILE.certificates.map((c) => `• ${c}`).join("\n")}`,

  availability: `${PROFILE.availability}.\n\nHe can discuss web apps, mobile apps, backend APIs, databases, blockchain systems and AI integrations. Share your idea, key features and launch date on WhatsApp to get started.`,

  services:
    "Gakenye offers seven ways to help you build, fix, grow and learn:\n\n• Full-Stack Web Development\n• Mobile App Development\n• Blockchain & Smart Contracts\n• Technical Consultancy\n• Network Infrastructure\n• API & Backend Systems\n• Programming Tutoring\n\nWhich one do you need?",

  web: "Gakenye builds responsive websites and web apps: business sites, portfolios, online stores, booking platforms and dashboards.\n\nWhat kind of website do you need?",

  mobile: "Gakenye builds mobile apps with React Native and Expo, including navigation, authentication and API integration.\n\nAndroid, iOS or both?",

  backend: "Gakenye works with Node.js, Express, TypeScript and REST APIs, including JWT authentication, validation and role-based access.\n\nWhat does your app need to do?",

  database: "Gakenye designs databases with PostgreSQL and Drizzle ORM: data models, relationships, migrations and API connections.\n\nWhat will your app need to store?",

  blockchain: "Gakenye has explored blockchain through an Ethereum Sepolia voting-system prototype. It suits projects that need verifiable or tamper-evident records.\n\nWhat problem would you like it to solve?",

  ai: "Gakenye integrates AI where it adds real value: chat assistants, automation, recommendations and document processing.\n\nIs this for an existing app or a new one?",

  hire: "To start a project with Gakenye:\n\n1. Describe the problem you want to solve\n2. List the key features\n3. Share your launch date and budget, if you have them\n4. Message him on WhatsApp\n\nYou don't need a full specification.",

  pricing: "Pricing depends on features, design, integrations, user roles, deadlines and support. I won't guess a number.\n\nShare what you want to build and your budget range on WhatsApp for a quote.",

  timeline: "Timelines depend on size and complexity. A landing page and an app with accounts, payments and dashboards are very different jobs.\n\nShare your project type, key features and target date for an estimate.",

  process: "Gakenye's workflow:\n\n1. Discovery\n2. Planning\n3. Design\n4. Development\n5. Testing\n6. Deployment & handover",

  student: "To learn software development: start with programming fundamentals, Git and small projects, then pick frontend or backend and combine them into full-stack apps.\n\nTell me your level and goals for a tailored roadmap.",

  location: `Gakenye works from ${PROFILE.location} and collaborates with clients anywhere. Contact him to arrange a time to talk.`,

  contact: "Here's how to reach Gakenye. WhatsApp is the fastest way:",

  thanks: "You're welcome! 😊 Ask me anything else about Gakenye's work.",

  goodbye: "Thanks for visiting! 👋 Message Gakenye on WhatsApp whenever you're ready to start.",

  appointment:
    "Great — I'd love to hear about your project.\n\nTo book a call, tap WhatsApp below and send:\n\n1. Your name\n2. What you want to build\n3. Your ideal date and time\n4. Any links or references you have\n\nI reply within 24 hours. Open to new projects and collaborations.",
};

const initialMessage: Message = {
  id: "welcome",
  sender: "bot",
  text: RESPONSES.greeting,
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const hasAny = (value: string, words: string[]) => words.some((w) => value.includes(w));

const INTENT_RULES: [Intent, string[]][] = [
  ["thanks", ["thank you", "thanks", "thx", "appreciate it"]],
  ["goodbye", ["bye", "goodbye", "see you", "that is all", "thats all"]],
  ["app_types", ["types of apps", "kind of apps", "kinds of apps", "what apps can you build", "apps you build", "apps i can build", "e-commerce", "ecommerce", "online store", "delivery app", "logistics", "ticketing", "events app", "school system", "school management", "booking app", "reservations", "fintech", "payments app", "property app", "rentals", "healthcare app", "clinic app", "social app", "community app"]],
  ["appointment", ["appointment", "book a call", "book a meeting", "schedule a call", "schedule a meeting", "set up a call", "set up a meeting", "meet with gakenye", "book gakenye", "call with gakenye", "discovery call", "consultation", "schedule"]],
  ["about", ["who are you", "who is gakenye", "about gakenye", "tell me about gakenye", "about me", "your story", "your background", "introduce yourself", "your profession", "are you a developer", "are you a software engineer"]],
  ["education", ["where did you study", "which university", "your education", "your degree", "what are you studying", "laikipia", "are you a student", "what school"]],
  ["certificates", ["certificate", "certification", "certified", "teach2give", "sololearn", "training program"]],
  ["availability", ["are you available", "available for", "open for projects", "accepting projects", "open to collaborations", "are you hiring"]],
  ["projects", ["project", "portfolio", "your work", "examples", "case study", "built before", "what have you built"]],
  ["skills", ["technology", "technologies", "tech stack", "framework", "programming language", "tools", "skills", "typescript", "react", "node.js", "postgresql", "what can you code"]],
  ["contact", ["whatsapp", "contact", "email address", "phone number", "talk to gakenye", "speak to gakenye", "human", "reach you", "email me"]],
  ["pricing", ["how much", "price", "pricing", "cost", "budget", "quote", "afford"]],
  ["timeline", ["how long", "timeline", "deadline", "deliver", "delivery", "when can", "launch date"]],
  ["hire", ["hire", "work with", "collaborate", "get started", "book you", "freelance"]],
  ["process", ["process", "steps", "workflow", "how do you work", "how does it work"]],
  ["services", ["service", "what do you do", "offer", "what can you build", "help me build"]],
  ["web", ["website", "web app", "web application", "landing page", "business site"]],
  ["mobile", ["mobile app", "mobile application", "android app", "ios app", "react native", "expo"]],
  ["backend", ["backend", "back end", "api", "authentication", "login system", "rest api", "server"]],
  ["database", ["database", "postgres", "drizzle", "data model", "store data"]],
  ["blockchain", ["blockchain", "ethereum", "smart contract", "on-chain", "on chain", "crypto"]],
  ["ai", ["artificial intelligence", "chatbot", "chat bot", "machine learning", "automation", "recommendation engine", "ai tools", " ai "]],
  ["student", ["student", "beginner", "learn coding", "learn programming", "roadmap", "how do i become", "software developer"]],
  ["location", ["where are you", "where are you based", "location", "meet in person", "meeting", "which country"]],
];

function detectIntent(question: string, previousBotText = ""): Intent {
  const value = normalize(question);
  const previous = normalize(previousBotText);
  if (!value) return "fallback";
  if (/^(hi|hey|hello|howdy|habari|niaje|good morning|good afternoon|good evening)\b/.test(value)) return "greeting";
  for (const [intent, words] of INTENT_RULES) {
    if (hasAny(value, words)) return intent;
  }
  if (/^(yes|yeah|yep|sure|okay|ok|please|tell me more|more details)\b/.test(value)) {
    if (previous.includes("certificate")) return "certificates";
    if (previous.includes("university")) return "education";
    if (previous.includes("available")) return "availability";
    if (previous.includes("budget") || previous.includes("quote")) return "pricing";
    if (previous.includes("target date")) return "timeline";
    if (previous.includes("website")) return "web";
    if (previous.includes("mobile app")) return "mobile";
    if (previous.includes("backend")) return "backend";
    if (previous.includes("technolog") || previous.includes("skill")) return "skills";
    if (previous.includes("project")) return "projects";
    if (previous.includes("app")) return "app_types";
    return "services";
  }
  return "fallback";
}

const isPublished = (p: Project) => !p.status || p.status === "published";
const getTechNames = (p: Project): string[] =>
  (p.techs ?? []).map((t) => t.technology?.name).filter((n): n is string => Boolean(n));
const projectHaystack = (p: Project) =>
  normalize([p.title, p.mainDescription, ...getTechNames(p)].filter(Boolean).join(" "));

const TOPIC_KEYWORDS: Partial<Record<Intent, string[]>> = {
  web: ["web", "website", "react", "frontend", "ecommerce", "store"],
  mobile: ["mobile", "react native", "expo", "android", "ios"],
  backend: ["backend", "api", "node", "express", "server"],
  database: ["database", "postgres", "sql", "drizzle"],
  blockchain: ["blockchain", "ethereum", "smart contract", "voting"],
};

function findSpecificProject(projects: Project[], question: string) {
  const q = normalize(question);
  return projects.find((p) => {
    const title = normalize(p.title ?? "");
    return title.length > 1 && q.includes(title);
  });
}

/* -------------------------------------------------------------------------- */
/*  Animations                                                                */
/* -------------------------------------------------------------------------- */

const ANIMATION_CSS = `
@keyframes va-panel-in { from { opacity: 0; transform: translateY(16px) scale(.96); } to { opacity: 1; transform: none; } }
@keyframes va-msg-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes va-pop-in { from { opacity: 0; transform: translateY(6px) scale(.97); } to { opacity: 1; transform: none; } }
@keyframes va-icon-in { from { opacity: 0; transform: rotate(-90deg) scale(.5); } to { opacity: 1; transform: none; } }
.va-panel { transform-origin: bottom right; animation: va-panel-in .28s cubic-bezier(.2,.8,.2,1) both; }
.va-msg { animation: va-msg-in .26s ease-out both; }
.va-pop { animation: va-pop-in .32s cubic-bezier(.2,.8,.2,1) both; }
.va-icon { animation: va-icon-in .22s ease-out both; }
@keyframes va-blink { 0%,90%,100% { transform: scaleY(1); } 94% { transform: scaleY(.1); } }
@keyframes va-antenna { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
@keyframes va-shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.va-shimmer { background-size: 200% 100%; animation: va-shimmer 1.4s linear infinite; }
@keyframes va-dart { 0%,100% { transform: translate(-1.6px,-.9px); } 50% { transform: translate(1.6px,-.9px); } }
@keyframes va-wave { 0% { opacity: 0; transform: scale(.2) rotate(0deg); } 15% { opacity: 1; transform: scale(1) rotate(0deg); } 30% { transform: rotate(24deg); } 45% { transform: rotate(-14deg); } 60% { transform: rotate(24deg); } 75% { transform: rotate(-10deg); } 88% { opacity: 1; transform: scale(1) rotate(0deg); } 100% { opacity: 0; transform: scale(.4) rotate(0deg); } }
@keyframes va-peek { 0%,100% { transform: translateY(0) rotate(0deg); } 15% { transform: translateY(-9px) rotate(-9deg); } 30% { transform: translateY(0) rotate(7deg); } 45% { transform: translateY(-5px) rotate(-5deg); } 60% { transform: translateY(0) rotate(3deg); } }
@keyframes va-spring-in { from { opacity: 0; transform: translateY(-14px) scale(.55); } to { opacity: 1; transform: none; } }
@keyframes va-caret { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
.va-caret { animation: va-caret .9s steps(1) infinite; }
.va-look { transition: transform .14s ease-out; }
.va-dart { animation: va-dart 1.1s ease-in-out infinite; }
.va-wave { transform-origin: 70% 75%; animation: va-wave 1.5s ease-in-out both; }
.va-peek { animation: va-peek 1.2s ease-in-out both; }
.va-spring { animation: va-spring-in .5s cubic-bezier(.34,1.56,.64,1) both; }
.va-eye { transform-box: fill-box; transform-origin: center; animation: va-blink 4.5s infinite; }
.va-antenna { animation: va-antenna 1.8s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .va-panel, .va-msg, .va-pop, .va-icon, .va-eye, .va-antenna, .va-shimmer, .va-dart, .va-wave, .va-peek, .va-spring, .va-caret { animation: none !important; }
  .va-look { transition: none !important; }
}
`;

/* -------------------------------------------------------------------------- */
/*  Robot face                                                                */
/* -------------------------------------------------------------------------- */

type Mood = "neutral" | "thinking" | "happy" | "surprised";

const MOUTHS: Record<Exclude<Mood, "surprised">, string> = {
  neutral: "M12.5 21.4c2.2 1.7 4.8 1.7 7 0",
  happy: "M11.4 20.4c2.8 3.2 6.4 3.2 9.2 0",
  thinking: "M13 22h6",
};

const RobotFace: React.FC<{
  size?: number;
  face: string;
  eye: string;
  mood?: Mood;
  track?: boolean;
  target?: { x: number; y: number } | null;
}> = ({ size = 32, face, eye, mood = "neutral", track = false, target = null }) => {
  const ref = useRef<SVGSVGElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!track) return;
    const update = () => {
      frame.current = 0;
      const el = ref.current;
      const point = target ?? pointer.current;
      if (!el || !point) return;
      const r = el.getBoundingClientRect();
      const clamp = (v: number) => Math.max(-1, Math.min(1, v));
      setLook({ x: clamp((point.x - (r.left + r.width / 2)) / 180), y: clamp((point.y - (r.top + r.height / 2)) / 180) });
    };
    const onMove = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (!frame.current) frame.current = requestAnimationFrame(update);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    update();
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [track, target]);

  const eyesStyle: React.CSSProperties | undefined =
    mood === "thinking" ? undefined : { transform: `translate(${look.x * 1.6}px, ${look.y * 1.2}px)` };

  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <line x1="16" y1="4.5" x2="16" y2="8" stroke={face} strokeWidth="1.6" strokeLinecap="round" />
      <circle className="va-antenna" cx="16" cy="3.4" r="1.9" fill={face} />
      <rect x="3" y="13.5" width="2.6" height="6" rx="1.3" fill={face} />
      <rect x="26.4" y="13.5" width="2.6" height="6" rx="1.3" fill={face} />
      <rect x="6" y="8" width="20" height="17" rx="6" fill={face} />
      <g className={`va-look ${mood === "thinking" ? "va-dart" : ""}`} style={eyesStyle}>
        {mood === "happy" ? (
          <>
            <path d="M10.4 17.6c.5-3.4 3.5-3.4 4.1 0" stroke={eye} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M17.5 17.6c.5-3.4 3.5-3.4 4.1 0" stroke={eye} strokeWidth="1.8" strokeLinecap="round" />
          </>
        ) : mood === "surprised" ? (
          <>
            <ellipse cx="12.5" cy="15.6" rx="2.3" ry="3.3" fill={eye} />
            <ellipse cx="19.5" cy="15.6" rx="2.3" ry="3.3" fill={eye} />
          </>
        ) : (
          <>
            <rect className="va-eye" x="10.5" y="13" width="4" height="5.5" rx="2" fill={eye} />
            <rect className="va-eye" x="17.5" y="13" width="4" height="5.5" rx="2" fill={eye} />
          </>
        )}
      </g>
      {mood === "surprised" ? (
        <circle cx="16" cy="21.8" r="1.7" stroke={eye} strokeWidth="1.4" />
      ) : (
        <path d={MOUTHS[mood]} stroke={eye} strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
};

/* -------------------------------------------------------------------------- */
/*  Skill helpers                                                             */
/* -------------------------------------------------------------------------- */

const SKILL_CATEGORIES: { key: "frontend" | "backend" | "database" | "devops" | "mobile" | "ai"; label: string }[] = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "database", label: "Databases" },
  { key: "devops", label: "DevOps" },
  { key: "mobile", label: "Mobile" },
  { key: "ai", label: "AI & ML" },
];

const getSkillName = (s: TechSkill) => s.technology?.name ?? "Unknown";
const getSkillCategory = (s: TechSkill) => s.technology?.category ?? "frontend";
const getSkillProficiency = (s: TechSkill) => s.proficiency;
const getSkillYears = (s: TechSkill) => s.yearsExperience;

/* -------------------------------------------------------------------------- */
/*  Components                                                                */
/* -------------------------------------------------------------------------- */

type Palette = { base: string; text: string; primary: string; border: string; muted: string };

const TiltCard: React.FC<{ c: Palette; delay: number; children: React.ReactNode }> = ({ c, delay, children }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLSpanElement>(null);
  const handleMove = (e: React.MouseEvent) => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const el = cardRef.current;
    const glare = glareRef.current;
    if (!el || !glare) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(700px) rotateX(${(0.5 - py) * 9}deg) rotateY(${(px - 0.5) * 11}deg) scale(1.02)`;
    glare.style.opacity = "1";
    glare.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,.32), ${c.primary}14 38%, transparent 65%)`;
  };
  const handleLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = "";
    if (glareRef.current) glareRef.current.style.opacity = "0";
  };
  return (
    <div className="va-pop" style={{ animationDelay: `${delay}ms` }}>
      <div ref={cardRef} onMouseMove={handleMove} onMouseLeave={handleLeave} className="relative" style={{ transition: "transform .18s ease-out", willChange: "transform" }}>
        {children}
        <span ref={glareRef} aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-xl" style={{ opacity: 0, transition: "opacity .2s ease-out" }} />
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{ project: Project; c: Palette; index: number; onOpen: (project: Project) => Promise<void> }> = ({ project, c, index, onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);
  const techs = getTechNames(project);
  const handleOpen = async (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (isOpening) return;
    setIsOpening(true);
    try { await onOpen(project); } finally { setIsOpening(false); }
  };
  const liveLink = project.links?.find((l) => l.url);
  return (
    <TiltCard c={c} delay={index * 90}>
      <div className="overflow-hidden rounded-xl border transition-shadow hover:shadow-md" style={{ borderColor: c.border, backgroundColor: c.base }}>
        {project.thumbnail?.fileUrl && (
          <img src={project.thumbnail.fileUrl} alt={project.thumbnail.fileName || project.title} loading="lazy" className="h-28 w-full object-cover transition-transform duration-500 hover:scale-105" />
        )}
        <div className="space-y-2 p-3">
          <h3 className="text-sm font-semibold leading-snug">{project.title}</h3>
          {project.mainDescription && (
            <p className="text-xs leading-relaxed" style={{ color: c.muted, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{project.mainDescription}</p>
          )}
          {techs.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {techs.slice(0, 4).map((t) => (
                <span key={t} className="rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `${c.primary}18`, color: c.primary }}>{t}</span>
              ))}
              {techs.length > 4 && <span className="px-1 py-0.5 text-[10px]" style={{ color: c.muted }}>+{techs.length - 4}</span>}
            </div>
          )}
          <div className="flex items-center gap-3 pt-1 text-xs font-semibold">
            <Link to={`${PROJECT_PAGE_URL}/${project.id}`} onClick={handleOpen} aria-busy={isOpening} className="inline-flex items-center gap-1 hover:underline" style={{ color: c.primary }}>
              {isOpening ? "Opening…" : "View project"}
              {isOpening ? <Loader2 size={13} className="animate-spin" /> : <ArrowUpRight size={13} />}
            </Link>
            {liveLink && (
              <a href={liveLink.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:underline" style={{ color: c.muted }}>
                {liveLink.label || "Live"} <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </TiltCard>
  );
};

/**
 * Typewriter text with improved layout:
 * - Keeps paragraphs, bullets and headings nicely spaced
 * - Renders the final visible text through a pre-wrap container so line breaks look good
 */
const TypewriterText: React.FC<{ text: string; onTick?: () => void; onDone: () => void }> = ({ text, onTick, onDone }) => {
  const reduceMotion = typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const [count, setCount] = useState(reduceMotion ? text.length : 0);
  const onTickRef = useRef(onTick);
  const onDoneRef = useRef(onDone);
  onTickRef.current = onTick;
  onDoneRef.current = onDone;
  useEffect(() => {
    if (reduceMotion) return;
    const step = Math.max(1, Math.ceil(text.length / 130));
    const id = window.setInterval(() => {
      setCount((c) => Math.min(text.length, c + step));
      onTickRef.current?.();
    }, 20);
    return () => window.clearInterval(id);
  }, [text, reduceMotion]);
  useEffect(() => { if (count >= text.length) onDoneRef.current(); }, [count, text.length]);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="va-prose">
        {text.slice(0, count)}
        <span className="va-caret ml-0.5 inline-block h-[1em] w-[2px] align-text-bottom" style={{ backgroundColor: "currentColor" }} />
      </span>
    </>
  );
};

const SkillChip: React.FC<{ skill: TechSkill; index: number; c: Palette }> = ({ skill, index, c }) => {
  const [hover, setHover] = useState(false);
  const proficiency = getSkillProficiency(skill);
  const years = getSkillYears(skill);
  const hasStats = proficiency != null || years != null;
  const RADIUS = 8.5;
  const CIRC = 2 * Math.PI * RADIUS;
  const pct = Math.max(0, Math.min(100, proficiency ?? 0));
  return (
    <span
      tabIndex={hasStats ? 0 : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="va-spring relative inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs outline-none"
      style={{ borderColor: c.border, animationDelay: `${120 + Math.min(index, 12) * 45}ms` }}
    >
      {proficiency != null && (
        <span className="relative grid h-5 w-5 shrink-0 place-items-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="10" cy="10" r={RADIUS} stroke={`${c.text}1a`} strokeWidth="1.8" />
            <circle cx="10" cy="10" r={RADIUS} stroke={c.primary} strokeWidth="1.8" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={hover ? CIRC * (1 - pct / 100) : CIRC}
              style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)" }} />
          </svg>
        </span>
      )}
      {getSkillName(skill)}
      {hover && hasStats && (
        <span role="tooltip" className="pointer-events-none absolute bottom-full left-0 right-0 z-10 mb-1.5 flex justify-center">
          <span className="va-pop whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold shadow-lg" style={{ backgroundColor: c.text, color: c.base }}>
            {proficiency != null && <>{proficiency}% proficiency</>}
            {proficiency != null && years != null && " · "}
            {years != null && <>{years} yr{years === 1 ? "" : "s"}</>}
          </span>
        </span>
      )}
    </span>
  );
};

const SkillGroups: React.FC<{ skills: TechSkill[]; c: Palette }> = ({ skills, c }) => {
  const groups = SKILL_CATEGORIES.map(({ key, label }) => ({ label, items: skills.filter((s) => getSkillCategory(s) === key) }));
  const known = new Set(SKILL_CATEGORIES.map((x) => x.key));
  const other = skills.filter((s) => !known.has(getSkillCategory(s)));
  if (other.length) groups.push({ label: "Other", items: other });
  return (
    <div className="va-pop w-full space-y-3 rounded-xl border p-3" style={{ borderColor: c.border, backgroundColor: c.base }}>
      {groups.filter((g) => g.items.length > 0).map((g) => (
        <div key={g.label}>
          <p className="mb-1.5 text-xs font-semibold" style={{ color: c.muted }}>{g.label}</p>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((s, i) => <SkillChip key={s.id} skill={s} index={i} c={c} />)}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * NEW: grid of app-type cards
 */
const AppTypeGrid: React.FC<{ apps: AppCategory[]; c: Palette; onPick: (title: string) => void }> = ({ apps, c, onPick }) => (
  <div className="va-pop w-full space-y-2">
    {apps.map((app, i) => (
      <button
        key={app.title}
        onClick={() => onPick(app.title)}
        className="va-pop group w-full text-left rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
        style={{ borderColor: c.border, backgroundColor: c.base, animationDelay: `${120 + i * 55}ms` }}
      >
        <div className="flex items-start gap-2.5">
          <span className="text-xl leading-none shrink-0">{app.emoji}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-bold leading-tight">{app.title}</p>
              <ArrowUpRight size={12} className="shrink-0 opacity-30 transition group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: c.primary }} />
            </div>
            <p className="text-[11px] mt-0.5 italic" style={{ color: c.muted }}>{app.tagline}</p>
            <p className="text-[11px] leading-relaxed mt-1" style={{ color: c.text, opacity: 0.75 }}>{app.desc}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {app.tech.map((t) => (
                <span key={t} className="rounded-md px-1.5 py-0.5 text-[9px] font-medium" style={{ backgroundColor: `${c.primary}18`, color: c.primary }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      </button>
    ))}
  </div>
);

const InfoBlock: React.FC<{ info: { label: string; value: string; hint?: string }[]; c: Palette }> = ({ info, c }) => (
  <div className="va-pop w-full grid grid-cols-2 gap-2 rounded-xl border p-3" style={{ borderColor: c.border, backgroundColor: c.base }}>
    {info.map((s) => (
      <div key={s.label} className="rounded-lg p-2" style={{ backgroundColor: `${c.text}05` }}>
        <p className="text-lg font-extrabold leading-none tabular-nums" style={{ color: c.primary }}>{s.value}</p>
        <p className="text-[11px] font-semibold opacity-80 mt-1 leading-tight">{s.label}</p>
        {s.hint && <p className="text-[10px] opacity-50 mt-0.5">{s.hint}</p>}
      </div>
    ))}
  </div>
);

const ContactCard: React.FC<{ c: Palette }> = ({ c }) => (
  <div className="va-pop w-full overflow-hidden rounded-xl border" style={{ borderColor: c.border, backgroundColor: c.base }}>
    {CONTACT_ROWS.map((row, i) => {
      const Icon = row.icon;
      const tint = row.brand ?? c.primary;
      const external = row.href.startsWith("http");
      return (
        <a key={row.key} href={row.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="va-pop group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-black/5"
          style={{ animationDelay: `${100 + i * 60}ms`, borderTop: i === 0 ? "none" : `1px solid ${c.border}` }}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-110" style={{ backgroundColor: `${tint}1f`, color: tint }}>
            <Icon size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold leading-tight">{row.label}</span>
            <span className="block truncate text-xs" style={{ color: c.muted }}>{row.note}</span>
          </span>
          <ArrowUpRight size={14} className="shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
        </a>
      );
    })}
  </div>
);

const LoadingSkeleton: React.FC<{ kind: "projects" | "skills"; c: Palette }> = ({ kind, c }) => {
  const shimmer: React.CSSProperties = { backgroundImage: `linear-gradient(90deg, ${c.text}0a, ${c.text}1a, ${c.text}0a)` };
  if (kind === "skills") {
    return (
      <div className="va-pop w-full space-y-2 rounded-xl border p-3" style={{ borderColor: c.border }} aria-hidden="true">
        {[0, 1].map((row) => (
          <div key={row} className="flex flex-wrap gap-1.5">
            {[64, 80, 56, 72].map((w, i) => (
              <span key={i} className="va-shimmer h-6 rounded-full" style={{ ...shimmer, width: w }} />
            ))}
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="va-pop w-full overflow-hidden rounded-xl border" style={{ borderColor: c.border }} aria-hidden="true">
      <div className="va-shimmer h-24 w-full" style={shimmer} />
      <div className="space-y-2 p-3">
        <div className="va-shimmer h-3 w-2/3 rounded" style={shimmer} />
        <div className="va-shimmer h-2.5 w-full rounded" style={shimmer} />
        <div className="va-shimmer h-2.5 w-4/5 rounded" style={shimmer} />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

const VirtualAssistant: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const { data: skillList } = useGetSkillsQuery();
  const { data: skillGroups } = useGetSkillsGroupedQuery();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingKind, setLoadingKind] = useState<"projects" | "skills" | null>(null);
  const [welcomed, setWelcomed] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [doneIds, setDoneIds] = useState<Set<string>>(() => new Set());
  const [surprised, setSurprised] = useState(false);
  const [waving, setWaving] = useState(false);
  const [peek, setPeek] = useState(false);
  const [happy, setHappy] = useState(false);
  const [lookTarget, setLookTarget] = useState<{ x: number; y: number } | null>(null);
  const typingTimer = useRef<number | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const base = theme["base-100"];
  const text = theme["base-content"];
  const primary = theme.primary;
  const c: Palette = { base, text, primary, border: `${text}1f`, muted: `${text}99` };
  const whatsappGreen = "#25D366";

  const skillsFlat: TechSkill[] = skillList?.data ?? [];

  useEffect(() => {
    if (isOpen && !isMinimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isOpen, isMinimized, isTyping, doneIds]);

  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(t);
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen || welcomed) return;
    setIsTyping(true);
    const t = window.setTimeout(() => {
      setMessages((cur) => (cur.length ? cur : [initialMessage]));
      setWelcomed(true);
      setIsTyping(false);
    }, 800);
    return () => { window.clearTimeout(t); setIsTyping(false); };
  }, [isOpen, welcomed]);

  useEffect(() => {
    if (!isOpen) return;
    setHasOpened(true);
    setSurprised(true);
    setWaving(true);
    const t1 = window.setTimeout(() => setSurprised(false), 1100);
    const t2 = window.setTimeout(() => setWaving(false), 1500);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen || hasOpened) return;
    let t = 0;
    const id = window.setInterval(() => {
      setPeek(true);
      t = window.setTimeout(() => setPeek(false), 1300);
    }, 8000);
    return () => { window.clearInterval(id); window.clearTimeout(t); };
  }, [isOpen, hasOpened]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    const isResult = last?.sender === "bot" && Boolean(last.projects?.length || last.skills?.length || last.contact || last.info?.length || last.apps?.length);
    if (!isResult) { setHappy(false); return; }
    setHappy(true);
    const t = window.setTimeout(() => setHappy(false), 2400);
    return () => window.clearTimeout(t);
  }, [messages]);

  const markDone = (id: string) => setDoneIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const addMessage = (msg: Omit<Message, "id">) =>
    setMessages((cur) => [...cur, { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }]);

  const openWhatsApp = () => window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  const lastBotText = () => [...messages].reverse().find((m) => m.sender === "bot")?.text ?? "";

  const loadPublishedProjects = async (): Promise<Project[]> => {
    const request = dispatch(projectsApi.endpoints.getProjects.initiate({ status: "published", limit: 100 }));
    try {
      const res = await request.unwrap();
      const all: Project[] = Array.isArray(res) ? res : (res as any)?.data ?? [];
      return all.filter(isPublished);
    } finally { request.unsubscribe(); }
  };

  const openProject = async (project: Project) => {
    let target: Project = project;
    try {
      const request = dispatch(projectsApi.endpoints.getProjectDetails.initiate(project.id));
      try {
        const res = await request.unwrap();
        target = (res as any)?.data ?? res;
      } finally { request.unsubscribe(); }
    } catch (err) { console.warn("Could not load project details, using list data:", err); }
    setIsMinimized(true);
    navigate(`${PROJECT_PAGE_URL}/${target.id || project.id}`, { state: { project: target } });
  };

  const loadSkills = async (): Promise<TechSkill[]> => {
    if (skillsFlat.length) return skillsFlat;
    const request = dispatch(skillsApi.endpoints.getSkillsGrouped.initiate());
    try {
      const res = await request.unwrap();
      const grouped = (res as any)?.data ?? {};
      return Object.values(grouped).flat() as TechSkill[];
    } finally { request.unsubscribe(); }
  };

  const buildProjectsMessage = async (question: string): Promise<Omit<Message, "id">> => {
    const projects = await loadPublishedProjects();
    if (!projects.length) {
      return { sender: "bot", text: "There are no published projects yet. Check back soon.", actions: ["whatsapp"] };
    }
    const specific = findSpecificProject(projects, question);
    if (specific) return { sender: "bot", text: "Here's that project:", projects: [specific], actions: ["whatsapp"] };
    return {
      sender: "bot",
      text: `Here are some of Gakenye's projects:`,
      projects: projects.slice(0, 3),
      moreProjects: Math.max(0, projects.length - 3),
      actions: ["whatsapp"],
    };
  };

  const buildAppTypesMessage = (): Omit<Message, "id"> => ({
    sender: "bot",
    text: "Different businesses need different apps. Here's the full range Gakenye has built or can build for you — tap any card to see details on WhatsApp:",
    apps: APP_TYPES,
    actions: ["whatsapp", "projects"],
  });

  const buildAppointmentMessage = (): Omit<Message, "id"> => ({
    sender: "bot",
    text: `Great — I'd love to hear about your project.\n\nTo book a call, tap WhatsApp below and send:\n\n1. Your name\n2. What you want to build\n3. Your ideal date and time\n4. Any links or references you have\n\nI reply within 24 hours. ${PROFILE.availability}.`,
    info: [
      { label: "Reply time", value: "≤ 24h", hint: "Usually same day" },
      { label: "Best channel", value: "WhatsApp", hint: "Fastest way" },
      { label: "Call length", value: "30 min", hint: "Free discovery call" },
      { label: "Timezone", value: "EAT", hint: "Nairobi, Kenya" },
    ],
    actions: ["whatsapp", "services"],
  });

  const sendMessage = async (raw: string = input) => {
    const question = raw.trim();
    if (!question || isTyping) return;
    addMessage({ sender: "user", text: question });
    setInput("");
    setIsTyping(true);

    const intent = detectIntent(question, lastBotText());
    if (intent === "projects" || intent === "skills") setLoadingKind(intent);

    const defaultActions: Action[] =
      ["pricing", "hire", "contact", "availability", "timeline"].includes(intent) ? ["whatsapp"]
        : intent === "fallback" ? ["services", "projects"]
          : ["projects", "whatsapp"];

    try {
      if (intent === "projects") {
        addMessage(await buildProjectsMessage(question));
      } else if (intent === "skills") {
        const skills = await loadSkills();
        addMessage(
          skills.length
            ? { sender: "bot", text: "Here's Gakenye's tech stack:", skills, actions: defaultActions }
            : { sender: "bot", text: `Gakenye's toolkit includes:\n\n${PROFILE.technologies.join(", ")}.`, actions: defaultActions }
        );
      } else if (intent === "contact") {
        addMessage({ sender: "bot", text: RESPONSES.contact, contact: true });
      } else if (intent === "app_types") {
        addMessage(buildAppTypesMessage());
      } else if (intent === "appointment") {
        addMessage(buildAppointmentMessage());
      } else if (TOPIC_KEYWORDS[intent]) {
        let matches: Project[] = [];
        try {
          const keywords = TOPIC_KEYWORDS[intent]!.map(normalize);
          matches = (await loadPublishedProjects()).filter((p) => keywords.some((k) => projectHaystack(p).includes(k))).slice(0, 2);
        } catch (err) { console.warn("Could not load related projects:", err); }
        addMessage({
          sender: "bot",
          text: matches.length ? `${RESPONSES[intent as keyof typeof RESPONSES]}\n\nRelated work:` : RESPONSES[intent as keyof typeof RESPONSES],
          projects: matches.length ? matches : undefined,
          actions: ["whatsapp"],
        });
      } else if (intent in RESPONSES) {
        addMessage({ sender: "bot", text: RESPONSES[intent as keyof typeof RESPONSES], actions: defaultActions });
      } else {
        addMessage({
          sender: "bot",
          text: "I didn't quite get that. Try asking about projects, services, types of apps, skills, certificates, pricing, availability or booking a call.",
          actions: ["services", "projects"],
        });
      }
    } catch (err) {
      console.error("Assistant request failed:", err);
      addMessage({
        sender: "bot",
        text: "I couldn't load that right now. Please try again shortly or message Gakenye on WhatsApp.",
        actions: ["whatsapp"],
      });
    } finally {
      setLoadingKind(null);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); void sendMessage(); };

  const handleQuickAction = (label: string) => {
    if (label === "Talk on WhatsApp") {
      addMessage({ sender: "user", text: label });
      addMessage({ sender: "bot", text: "Tap below to chat with Gakenye. Include your idea, key features and target date.", actions: ["whatsapp"] });
      return;
    }
    void sendMessage(label);
  };

  const handleAction = (action: Action) => {
    if (action === "whatsapp") openWhatsApp();
    if (action === "services") void sendMessage("What services do you offer?");
    if (action === "apps") void sendMessage("Types of apps you build");
  };

  const handlePickApp = (title: string) => {
    void sendMessage(`${title} — tell me more`);
  };

  const mood: Mood = surprised ? "surprised" : isTyping ? "thinking" : happy ? "happy" : "neutral";

  const pointAtInput = () => {
    const r = inputRef.current?.getBoundingClientRect();
    if (r) setLookTarget((cur) => cur ?? { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setLookTarget(null), 1800);
  };

  const hasUserMessages = messages.some((m) => m.sender === "user");

  return (
    <div className="fixed bottom-5 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6" style={{ fontFamily: "inherit" }}>
      <style>{ANIMATION_CSS}{`
        /* Improved text layout inside messages */
        .va-prose {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          line-height: 1.6;
        }
        .va-prose:has(br) { line-height: 1.7; }
      `}</style>

      {isOpen && (
        <section
          role="dialog"
          aria-label="Gakenye virtual assistant"
          aria-modal="false"
          className={`va-panel flex w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border shadow-2xl ${isMinimized ? "" : "h-[min(640px,calc(100dvh-7.5rem))]"}`}
          style={{ backgroundColor: base, color: text, borderColor: c.border, boxShadow: `0 24px 60px ${text}26` }}
        >
          <header className="flex shrink-0 items-center gap-3 px-4 py-3" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}d9)`, color: base }}>
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${base}26` }}>
              <RobotFace size={26} face={base} eye={primary} mood={mood} track target={lookTarget} />
              {waving && <span className="va-wave pointer-events-none absolute -right-2 -top-2 text-base" aria-hidden="true">👋</span>}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold leading-tight">Gakenye Assistant</h2>
              <p className="flex items-center gap-1.5 text-xs opacity-80">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Online · replies fast
              </p>
            </div>
            <button type="button" onClick={() => setIsMinimized((v) => !v)} aria-label={isMinimized ? "Expand chat" : "Minimize chat"} className="rounded-lg p-1.5 transition hover:bg-white/15">
              <Minus size={18} />
            </button>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" className="rounded-lg p-1.5 transition hover:bg-white/15">
              <X size={18} />
            </button>
          </header>

          {!isMinimized && (
            <>
              <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4" aria-live="polite" aria-relevant="additions text">
                {messages.map((m) => {
                  const isUser = m.sender === "user";
                  const typing = !isUser && !doneIds.has(m.id);
                  const ready = !typing;
                  return (
                    <div key={m.id} className={`va-msg flex flex-col gap-2.5 ${isUser ? "items-end" : "items-start"}`}>
                      <div
                        className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm"
                        style={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                          lineHeight: 1.6,
                          ...(isUser
                            ? { backgroundColor: primary, color: base, borderBottomRightRadius: 4 }
                            : { backgroundColor: `${text}0d`, borderBottomLeftRadius: 4 }),
                        }}
                      >
                        {typing ? (
                          <TypewriterText text={m.text} onTick={() => bottomRef.current?.scrollIntoView({ block: "end" })} onDone={() => markDone(m.id)} />
                        ) : (
                          m.text
                        )}
                      </div>

                      {ready && m.projects && m.projects.length > 0 && (
                        <div className="w-full space-y-2">
                          {m.projects.map((p, i) => <ProjectCard key={p.id} project={p} c={c} index={i} onOpen={openProject} />)}
                          {!!m.moreProjects && (
                            <Link to={PROJECTS_URL} className="block text-center text-xs font-semibold hover:underline" style={{ color: primary }}>
                              See {m.moreProjects} more on the projects page
                            </Link>
                          )}
                        </div>
                      )}

                      {ready && m.apps && m.apps.length > 0 && (
                        <AppTypeGrid apps={m.apps} c={c} onPick={handlePickApp} />
                      )}

                      {ready && m.info && m.info.length > 0 && <InfoBlock info={m.info} c={c} />}
                      {ready && m.skills && m.skills.length > 0 && <SkillGroups skills={m.skills} c={c} />}
                      {ready && m.contact && <ContactCard c={c} />}

                      {ready && m.actions && m.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {m.actions.map((action) => {
                            if (action === "projects") {
                              return (
                                <Link key={action} to={PROJECTS_URL} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: primary, color: primary }}>
                                  All projects <ArrowUpRight size={13} />
                                </Link>
                              );
                            }
                            if (action === "whatsapp") {
                              return (
                                <button key={action} type="button" onClick={() => handleAction(action)} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95" style={{ backgroundColor: whatsappGreen }}>
                                  <MessageCircle size={13} /> Chat on WhatsApp
                                </button>
                              );
                            }
                            if (action === "apps") {
                              return (
                                <button key={action} type="button" onClick={() => handleAction(action)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: primary, color: primary }}>
                                  Types of apps
                                </button>
                              );
                            }
                            return (
                              <button key={action} type="button" onClick={() => handleAction(action)} className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80" style={{ borderColor: primary, color: primary }}>
                                View services
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="va-msg inline-flex items-center gap-1 rounded-2xl px-4 py-3" style={{ backgroundColor: `${text}0d` }} aria-label="Assistant is typing">
                    {[0, 120, 240].map((d) => (
                      <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full" style={{ backgroundColor: c.muted, animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}

                {isTyping && loadingKind && <LoadingSkeleton kind={loadingKind} c={c} />}

                <div ref={bottomRef} />
              </div>

              <div className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 pt-2" style={{ scrollbarWidth: "none" }}>
                {(hasUserMessages ? QUICK_ACTIONS.slice(0, 5) : QUICK_ACTIONS).map((label, i) => (
                  <button key={label} type="button" onClick={() => handleQuickAction(label)} disabled={isTyping}
                    className="va-pop shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition hover:opacity-70 disabled:opacity-40"
                    style={{ borderColor: c.border, animationDelay: `${150 + i * 40}ms` }}>
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex shrink-0 items-center gap-2 border-t px-3 py-3" style={{ borderColor: c.border }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => { setInput(e.target.value); pointAtInput(); }}
                  onBlur={() => { window.clearTimeout(typingTimer.current); setLookTarget(null); }}
                  placeholder="Ask me anything about this portfolio…"
                  aria-label="Type your question"
                  maxLength={500}
                  className="min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  style={{ backgroundColor: `${text}05`, color: text, borderColor: c.border, outlineColor: primary }}
                />
                <button type="submit" disabled={!input.trim() || isTyping} aria-label="Send message"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ backgroundColor: primary, color: base }}>
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => { setIsOpen((v) => !v); setIsMinimized(false); }}
        aria-label={isOpen ? "Close virtual assistant" : "Open virtual assistant"}
        aria-expanded={isOpen}
        className="group relative grid h-14 w-14 place-items-center rounded-full shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 sm:h-16 sm:w-16"
        style={{ backgroundColor: primary, color: base, boxShadow: `0 10px 30px ${primary}55` }}
      >
        <span key={isOpen ? "x" : "chat"} className="va-icon grid place-items-center">
          {isOpen ? <X size={24} /> : <span className={`inline-grid ${peek ? "va-peek" : ""}`}><RobotFace size={36} face={base} eye={primary} track /></span>}
        </span>
        {!isOpen && (
          <span className="pointer-events-none absolute bottom-full right-0 mb-3 w-max rounded-xl px-3 py-2 text-xs font-semibold opacity-0 shadow-lg transition-opacity group-hover:opacity-100" style={{ backgroundColor: base, color: text }}>
            Ask me about the portfolio
          </span>
        )}
      </button>
    </div>
  );
};

export default VirtualAssistant;