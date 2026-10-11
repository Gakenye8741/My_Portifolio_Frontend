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
// Only needs `projectsApi` and the `Project` type, both already exported.
import { projectsApi, type Project } from "../Features/Apis/Projects.Api";
// ⚠️ Adjust this path to wherever your SkillsApi file lives.
import { SkillsApi, type TechSkill } from "../Features/Apis/Skills.Api";

const WHATSAPP_URL = "https://wa.link/f3ajog";
const PROJECTS_URL = "/projects"; // list page
const PROJECT_PAGE_URL = "/project"; // single project page: /project/:id

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type Action = "projects" | "whatsapp" | "services";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  actions?: Action[];
  projects?: Project[]; // rendered as cards
  moreProjects?: number; // "+N more" link
  skills?: TechSkill[]; // rendered as grouped chips
  contact?: boolean; // rendered as a contact card
};

type Intent =
  | "greeting" | "about" | "education" | "certificates" | "availability"
  | "services" | "web" | "mobile" | "backend" | "database" | "blockchain"
  | "ai" | "projects" | "skills" | "hire" | "pricing" | "timeline"
  | "process" | "student" | "location" | "contact" | "thanks" | "goodbye"
  | "fallback";

/* -------------------------------------------------------------------------- */
/*  Static content (personal info only — projects come from the API)         */
/* -------------------------------------------------------------------------- */

const QUICK_ACTIONS = [
  "Show me your projects",
  "What services do you offer?",
  "Who is Gakenye?",
  "Technologies you use",
  "Certificates",
  "Are you available?",
  "Project pricing",
  "Talk on WhatsApp",
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

const RESPONSES: Record<Intent, string> = {
  greeting:
    "Hi there! 👋 I'm Gakenye's portfolio assistant.\n\nAsk me anything about this portfolio website: his projects, services, skills, certificates, availability or how to get in touch.",

  about: `${PROFILE.name} is a certified full-stack developer and final-year Computer Science student at ${PROFILE.university}.\n\nHe builds web and mobile apps end to end: interfaces, backend APIs, databases and integrations, with an interest in blockchain and AI.\n\nBased in ${PROFILE.location}. ${PROFILE.availability}.`,

  education: `Gakenye is a final-year BSc Computer Science student at ${PROFILE.university}, combining his studies with hands-on software projects.`,

  certificates: `Gakenye's training and certificates:\n\n${PROFILE.certificates
    .map((c) => `• ${c}`)
    .join("\n")}`,

  availability: `${PROFILE.availability}.\n\nHe can discuss web apps, mobile apps, backend APIs, databases, blockchain systems and AI integrations. Share your idea, key features and launch date on WhatsApp to get started.`,

  services:
    "Gakenye offers seven ways to help you build, fix, grow and learn:\n\n• Full-Stack Web Development: websites and web apps from start to finish. Fast, safe and ready to grow.\n\n• Mobile App Development: iPhone and Android apps from one codebase, with smooth, easy-to-use screens.\n\n• Blockchain & Smart Contracts: smart contracts written and tested on the Ethereum Sepolia network.\n\n• Technical Consultancy: choosing the right tools, planning your system and speeding up your database.\n\n• Network Infrastructure: hands-on network work, including ADSS aerial cable, fibre preparation, maintenance reports and finding where signal is lost.\n\n• API & Backend Systems: safe, quick APIs, login systems and server code your app can depend on.\n\n• Programming Tutoring: learn programming in small steps by building real things, at your own speed.\n\nWhich of these do you need?",

  web: "Gakenye builds responsive websites and web apps: business sites, portfolios, online stores, booking platforms and dashboards.\n\nWhat kind of website do you need?",

  mobile:
    "Gakenye builds mobile apps with React Native and Expo, including navigation, authentication and API integration.\n\nAndroid, iOS or both?",

  backend:
    "Gakenye works with Node.js, Express, TypeScript and REST APIs, including JWT authentication, validation and role-based access.\n\nWhat does your app need to do?",

  database:
    "Gakenye designs databases with PostgreSQL and Drizzle ORM: data models, relationships, migrations and API connections.\n\nWhat will your app need to store?",

  blockchain:
    "Gakenye has explored blockchain through an Ethereum Sepolia voting-system prototype. It suits projects that need verifiable or tamper-evident records.\n\nWhat problem would you like it to solve?",

  ai: "Gakenye integrates AI where it adds real value: chat assistants, automation, recommendations and document processing.\n\nIs this for an existing app or a new one?",

  projects: "",
  skills: "",

  hire: "To start a project with Gakenye:\n\n1. Describe the problem you want to solve\n2. List the key features\n3. Share your launch date and budget, if you have them\n4. Message him on WhatsApp\n\nYou don't need a full specification.",

  pricing:
    "Pricing depends on features, design, integrations, user roles, deadlines and support. I won't guess a number.\n\nShare what you want to build and your budget range on WhatsApp for a quote.",

  timeline:
    "Timelines depend on size and complexity. A landing page and an app with accounts, payments and dashboards are very different jobs.\n\nShare your project type, key features and target date for an estimate.",

  process:
    "Gakenye's workflow:\n\n1. Discovery: understand the problem and users\n2. Planning: agree on scope\n3. Design: screens, flows and data\n4. Development: frontend, backend, integrations\n5. Testing: functionality and responsiveness\n6. Deployment and handover",

  student:
    "To learn software development: start with programming fundamentals, Git and small projects, then pick frontend or backend and combine them into full-stack apps.\n\nTell me your level and goals for a tailored roadmap.",

  location: `Gakenye works from ${PROFILE.location} and collaborates with clients anywhere. Contact him to arrange a time to talk.`,

  contact: "Here's how to reach Gakenye. WhatsApp is the fastest way:",

  thanks: "You're welcome! 😊 Ask me anything else about Gakenye's work.",

  goodbye:
    "Thanks for visiting! 👋 Message Gakenye on WhatsApp whenever you're ready to start.",

  fallback:
    "I didn't quite get that, and I don't want to make anything up.\n\nTry asking about projects, services, skills, certificates, pricing or availability.",
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

const hasAny = (value: string, words: string[]) =>
  words.some((w) => value.includes(w));

/** Ordered rules: first match wins. */
const INTENT_RULES: [Intent, string[]][] = [
  ["thanks", ["thank you", "thanks", "thx", "appreciate it"]],
  ["goodbye", ["bye", "goodbye", "see you", "that is all", "thats all"]],
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
  ["web", ["website", "web app", "web application", "landing page", "online store", "ecommerce", "e-commerce", "business site"]],
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

  if (/^(hi|hey|hello|howdy|habari|niaje|good morning|good afternoon|good evening)\b/.test(value)) {
    return "greeting";
  }

  for (const [intent, words] of INTENT_RULES) {
    if (hasAny(value, words)) return intent;
  }

  // Short follow-ups refer to the previous bot message.
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
    return "services";
  }

  return "fallback";
}

/* ---- project helpers ---- */

const isPublished = (p: Project) => !p.status || p.status === "published";

const getTechNames = (p: Project): string[] =>
  (p.techs ?? [])
    .map((t) => t.technology?.name)
    .filter((n): n is string => Boolean(n));

const projectHaystack = (p: Project) =>
  normalize(
    [p.title, p.mainDescription, ...getTechNames(p)].filter(Boolean).join(" "),
  );

/** Keywords used to find relevant projects for each topic. */
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

/* ---- animations ---- */

const ANIMATION_CSS = `
@keyframes va-panel-in {
  from { opacity: 0; transform: translateY(16px) scale(.96); }
  to   { opacity: 1; transform: none; }
}
@keyframes va-msg-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
@keyframes va-pop-in {
  from { opacity: 0; transform: translateY(6px) scale(.97); }
  to   { opacity: 1; transform: none; }
}
@keyframes va-icon-in {
  from { opacity: 0; transform: rotate(-90deg) scale(.5); }
  to   { opacity: 1; transform: none; }
}
.va-panel { transform-origin: bottom right; animation: va-panel-in .28s cubic-bezier(.2,.8,.2,1) both; }
.va-msg   { animation: va-msg-in .26s ease-out both; }
.va-pop   { animation: va-pop-in .32s cubic-bezier(.2,.8,.2,1) both; }
.va-icon  { animation: va-icon-in .22s ease-out both; }
@keyframes va-blink {
  0%, 90%, 100% { transform: scaleY(1); }
  94% { transform: scaleY(.1); }
}
@keyframes va-antenna {
  0%, 100% { opacity: 1; }
  50% { opacity: .3; }
}
@keyframes va-shimmer {
  from { background-position: 200% 0; }
  to   { background-position: -200% 0; }
}
.va-shimmer { background-size: 200% 100%; animation: va-shimmer 1.4s linear infinite; }
@keyframes va-dart {
  0%, 100% { transform: translate(-1.6px, -.9px); }
  50%      { transform: translate(1.6px, -.9px); }
}
@keyframes va-wave {
  0%   { opacity: 0; transform: scale(.2) rotate(0deg); }
  15%  { opacity: 1; transform: scale(1) rotate(0deg); }
  30%  { transform: rotate(24deg); }
  45%  { transform: rotate(-14deg); }
  60%  { transform: rotate(24deg); }
  75%  { transform: rotate(-10deg); }
  88%  { opacity: 1; transform: scale(1) rotate(0deg); }
  100% { opacity: 0; transform: scale(.4) rotate(0deg); }
}
@keyframes va-peek {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  15% { transform: translateY(-9px) rotate(-9deg); }
  30% { transform: translateY(0) rotate(7deg); }
  45% { transform: translateY(-5px) rotate(-5deg); }
  60% { transform: translateY(0) rotate(3deg); }
}
@keyframes va-spring-in {
  from { opacity: 0; transform: translateY(-14px) scale(.55); }
  to   { opacity: 1; transform: none; }
}
@keyframes va-caret {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
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

/* ---- robot face ---- */

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
  /** Eyes follow the cursor. */
  track?: boolean;
  /** Screen point to look at instead of the cursor (e.g. the input box). */
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
      setLook({
        x: clamp((point.x - (r.left + r.width / 2)) / 180),
        y: clamp((point.y - (r.top + r.height / 2)) / 180),
      });
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
    mood === "thinking"
      ? undefined
      : { transform: `translate(${look.x * 1.6}px, ${look.y * 1.2}px)` };

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      {/* antenna */}
      <line x1="16" y1="4.5" x2="16" y2="8" stroke={face} strokeWidth="1.6" strokeLinecap="round" />
      <circle className="va-antenna" cx="16" cy="3.4" r="1.9" fill={face} />
      {/* ears */}
      <rect x="3" y="13.5" width="2.6" height="6" rx="1.3" fill={face} />
      <rect x="26.4" y="13.5" width="2.6" height="6" rx="1.3" fill={face} />
      {/* head */}
      <rect x="6" y="8" width="20" height="17" rx="6" fill={face} />

      {/* eyes: follow the cursor, dart when thinking, curve when happy */}
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

      {/* mouth */}
      {mood === "surprised" ? (
        <circle cx="16" cy="21.8" r="1.7" stroke={eye} strokeWidth="1.4" />
      ) : (
        <path d={MOUTHS[mood]} stroke={eye} strokeWidth="1.5" strokeLinecap="round" />
      )}
    </svg>
  );
};

/* ---- skill helpers ---- */

const SKILL_CATEGORIES: { key: TechSkill["category"]; label: string }[] = [
  { key: "frontend", label: "Frontend" },
  { key: "backend", label: "Backend" },
  { key: "language", label: "Languages" },
  { key: "database", label: "Databases" },
  { key: "tools", label: "Tools" },
];

const getSkillIcon = (s: TechSkill) => s.iconUrl || s.icon?.fileUrl;

/* -------------------------------------------------------------------------- */
/*  Project card                                                              */
/* -------------------------------------------------------------------------- */

type Palette = {
  base: string;
  text: string;
  primary: string;
  border: string;
  muted: string;
};

/** 3D tilt + moving glare on hover. Animation lives on the outer wrapper. */
const TiltCard: React.FC<{
  c: Palette;
  delay: number;
  children: React.ReactNode;
}> = ({ c, delay, children }) => {
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
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative"
        style={{ transition: "transform .18s ease-out", willChange: "transform" }}
      >
        {children}
        <span
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{ opacity: 0, transition: "opacity .2s ease-out" }}
        />
      </div>
    </div>
  );
};

const ProjectCard: React.FC<{
  project: Project;
  c: Palette;
  index: number;
  onOpen: (project: Project) => Promise<void>;
}> = ({ project, c, index, onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);
  const techs = getTechNames(project);

  const handleOpen = async (e: React.MouseEvent) => {
    // Let ctrl/cmd/middle-click open in a new tab as normal.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (isOpening) return;
    setIsOpening(true);
    try {
      await onOpen(project);
    } finally {
      setIsOpening(false);
    }
  };
  const liveLink = project.links?.find((l) => l.url);

  return (
    <TiltCard c={c} delay={index * 90}>
    <div
      className="overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
      style={{ borderColor: c.border, backgroundColor: c.base }}
    >
      {project.thumbnail?.fileUrl && (
        <img
          src={project.thumbnail.fileUrl}
          alt={project.thumbnail.fileName || project.title}
          loading="lazy"
          className="h-28 w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      )}

      <div className="space-y-2 p-3">
        <h3 className="text-sm font-semibold leading-snug">{project.title}</h3>

        {project.mainDescription && (
          <p
            className="text-xs leading-relaxed"
            style={{
              color: c.muted,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {project.mainDescription}
          </p>
        )}

        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {techs.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: `${c.primary}18`, color: c.primary }}
              >
                {t}
              </span>
            ))}
            {techs.length > 4 && (
              <span className="px-1 py-0.5 text-[10px]" style={{ color: c.muted }}>
                +{techs.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-1 text-xs font-semibold">
          <Link
            to={`${PROJECT_PAGE_URL}/${project.id}`}
            onClick={handleOpen}
            aria-busy={isOpening}
            className="inline-flex items-center gap-1 hover:underline"
            style={{ color: c.primary }}
          >
            {isOpening ? "Opening…" : "View project"}
            {isOpening ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <ArrowUpRight size={13} />
            )}
          </Link>

          {liveLink && (
            <a
              href={liveLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
              style={{ color: c.muted }}
            >
              {liveLink.label || "Live"} <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
    </TiltCard>
  );
};

/** Types text out character by character with a blinking caret. */
const TypewriterText: React.FC<{
  text: string;
  onTick?: () => void;
  onDone: () => void;
}> = ({ text, onTick, onDone }) => {
  const reduceMotion =
    typeof window !== "undefined" &&
    Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

  const [count, setCount] = useState(reduceMotion ? text.length : 0);
  const onTickRef = useRef(onTick);
  const onDoneRef = useRef(onDone);
  onTickRef.current = onTick;
  onDoneRef.current = onDone;

  useEffect(() => {
    if (reduceMotion) return;
    // ~20ms per tick; long replies type several characters per tick (about 2.6s max).
    const step = Math.max(1, Math.ceil(text.length / 130));
    const id = window.setInterval(() => {
      setCount((c) => Math.min(text.length, c + step));
      onTickRef.current?.();
    }, 20);
    return () => window.clearInterval(id);
  }, [text, reduceMotion]);

  useEffect(() => {
    if (count >= text.length) onDoneRef.current();
  }, [count, text.length]);

  return (
    <>
      {/* Screen readers get the full text at once, not letter by letter. */}
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        <span
          className="va-caret ml-0.5 inline-block h-[1em] w-[2px] align-text-bottom"
          style={{ backgroundColor: "currentColor" }}
        />
      </span>
    </>
  );
};

/** Counts from 0 up to `to` when it mounts. */
const CountUp: React.FC<{ to: number; suffix?: string; duration?: number }> = ({
  to,
  suffix = "",
  duration = 700,
}) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setValue(to);
      return;
    }
    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      setValue(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return (
    <>
      {Number.isInteger(to) ? Math.round(value) : value.toFixed(1)}
      {suffix}
    </>
  );
};

/** Skill chip: springs in, shows a proficiency ring that fills on hover. */
const SkillChip: React.FC<{ skill: TechSkill; index: number; c: Palette }> = ({
  skill,
  index,
  c,
}) => {
  const [hover, setHover] = useState(false);
  const icon = getSkillIcon(skill);
  const proficiency = skill.skill?.proficiency;
  const years = skill.skill?.yearsExperience;
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
      style={{
        borderColor: c.border,
        animationDelay: `${120 + Math.min(index, 12) * 45}ms`,
      }}
    >
      {(icon || proficiency != null) && (
        <span className="relative grid h-5 w-5 shrink-0 place-items-center">
          {proficiency != null && (
            <svg
              className="absolute inset-0 -rotate-90"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r={RADIUS} stroke={`${c.text}1a`} strokeWidth="1.8" />
              <circle
                cx="10"
                cy="10"
                r={RADIUS}
                stroke={c.primary}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={hover ? CIRC * (1 - pct / 100) : CIRC}
                style={{ transition: "stroke-dashoffset .8s cubic-bezier(.2,.8,.2,1)" }}
              />
            </svg>
          )}
          {icon && (
            <img
              src={icon}
              alt=""
              loading="lazy"
              className="h-3.5 w-3.5 object-contain"
            />
          )}
        </span>
      )}

      {skill.name}

      {hover && hasStats && (
        <span
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-0 right-0 z-10 mb-1.5 flex justify-center"
        >
          <span
            className="va-pop whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold shadow-lg"
            style={{ backgroundColor: c.text, color: c.base }}
          >
            {proficiency != null && (
              <>
                <CountUp to={proficiency} suffix="%" /> proficiency
              </>
            )}
            {proficiency != null && years != null && " · "}
            {years != null && (
              <>
                <CountUp to={years} /> yr{years === 1 ? "" : "s"}
              </>
            )}
          </span>
        </span>
      )}
    </span>
  );
};

const SkillGroups: React.FC<{ skills: TechSkill[]; c: Palette }> = ({
  skills,
  c,
}) => {
  const groups = SKILL_CATEGORIES.map(({ key, label }) => ({
    label,
    items: skills.filter((s) => s.category === key),
  }));

  // Anything with an unexpected category still shows up.
  const known = new Set(SKILL_CATEGORIES.map((x) => x.key));
  const other = skills.filter((s) => !known.has(s.category));
  if (other.length) groups.push({ label: "Other", items: other });

  return (
    <div
      className="va-pop w-full space-y-3 rounded-xl border p-3"
      style={{ borderColor: c.border, backgroundColor: c.base }}
    >
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <div key={g.label}>
            <p className="mb-1.5 text-xs font-semibold" style={{ color: c.muted }}>
              {g.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((s, i) => (
                <SkillChip key={s.id} skill={s} index={i} c={c} />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

const ContactCard: React.FC<{ c: Palette }> = ({ c }) => (
  <div
    className="va-pop w-full overflow-hidden rounded-xl border"
    style={{ borderColor: c.border, backgroundColor: c.base }}
  >
    {CONTACT_ROWS.map((row, i) => {
      const Icon = row.icon;
      const tint = row.brand ?? c.primary;
      const external = row.href.startsWith("http");
      return (
        <a
          key={row.key}
          href={row.href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="va-pop group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-black/5"
          style={{
            animationDelay: `${100 + i * 60}ms`,
            borderTop: i === 0 ? "none" : `1px solid ${c.border}`,
          }}
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${tint}1f`, color: tint }}
          >
            <Icon size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold leading-tight">
              {row.label}
            </span>
            <span
              className="block truncate text-xs"
              style={{ color: c.muted }}
            >
              {row.note}
            </span>
          </span>
          <ArrowUpRight
            size={14}
            className="shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
          />
        </a>
      );
    })}
  </div>
);

const LoadingSkeleton: React.FC<{ kind: "projects" | "skills"; c: Palette }> = ({
  kind,
  c,
}) => {
  const shimmer: React.CSSProperties = {
    backgroundImage: `linear-gradient(90deg, ${c.text}0a, ${c.text}1a, ${c.text}0a)`,
  };

  if (kind === "skills") {
    return (
      <div
        className="va-pop w-full space-y-2 rounded-xl border p-3"
        style={{ borderColor: c.border }}
        aria-hidden="true"
      >
        {[0, 1].map((row) => (
          <div key={row} className="flex flex-wrap gap-1.5">
            {[64, 80, 56, 72].map((w, i) => (
              <span
                key={i}
                className="va-shimmer h-6 rounded-full"
                style={{ ...shimmer, width: w }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="va-pop w-full overflow-hidden rounded-xl border"
      style={{ borderColor: c.border }}
      aria-hidden="true"
    >
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

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingKind, setLoadingKind] = useState<"projects" | "skills" | null>(null);
  const [welcomed, setWelcomed] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  // Bot messages that have finished typing (so they never retype when the panel reopens).
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
  const c: Palette = {
    base,
    text,
    primary,
    border: `${text}1f`,
    muted: `${text}99`,
  };
  const whatsappGreen = "#25D366";

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

  // First open: show the typing dots briefly, then the welcome message.
  useEffect(() => {
    if (!isOpen || welcomed) return;
    setIsTyping(true);
    const t = window.setTimeout(() => {
      setMessages((cur) => (cur.length ? cur : [initialMessage]));
      setWelcomed(true);
      setIsTyping(false);
    }, 800);
    return () => {
      window.clearTimeout(t);
      setIsTyping(false);
    };
  }, [isOpen, welcomed]);

  // Opening the chat: robot looks surprised and waves.
  useEffect(() => {
    if (!isOpen) return;
    setHasOpened(true);
    setSurprised(true);
    setWaving(true);
    const t1 = window.setTimeout(() => setSurprised(false), 1100);
    const t2 = window.setTimeout(() => setWaving(false), 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [isOpen]);

  // Peek-a-boo: until the chat has been opened, the launcher bounces now and then.
  useEffect(() => {
    if (isOpen || hasOpened) return;
    let t = 0;
    const id = window.setInterval(() => {
      setPeek(true);
      t = window.setTimeout(() => setPeek(false), 1300);
    }, 8000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(t);
    };
  }, [isOpen, hasOpened]);

  // Happy face for a moment after a result (projects, skills, contact).
  useEffect(() => {
    const last = messages[messages.length - 1];
    const isResult =
      last?.sender === "bot" &&
      Boolean(last.projects?.length || last.skills?.length || last.contact);
    if (!isResult) {
      setHappy(false);
      return;
    }
    setHappy(true);
    const t = window.setTimeout(() => setHappy(false), 2400);
    return () => window.clearTimeout(t);
  }, [messages]);

  const markDone = (id: string) =>
    setDoneIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

  const addMessage = (msg: Omit<Message, "id">) =>
    setMessages((cur) => [
      ...cur,
      { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
    ]);

  const openWhatsApp = () =>
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");

  const lastBotText = () =>
    [...messages].reverse().find((m) => m.sender === "bot")?.text ?? "";

  /** Fetched on demand, using RTK Query's cache when available. */
  const loadPublishedProjects = async (): Promise<Project[]> => {
    // initiate() fetches only when called and reuses RTK Query's cache.
    const request = dispatch(projectsApi.endpoints.getProjects.initiate());
    try {
      const all: Project[] = await request.unwrap();
      return all.filter(isPublished);
    } finally {
      request.unsubscribe();
    }
  };

  /** Fetch the full project by id, then open its page (passing the data along). */
  const openProject = async (project: Project) => {
    let target: Project = project;
    try {
      const request = dispatch(
        projectsApi.endpoints.getProjectDetails.initiate(project.id),
      );
      try {
        target = await request.unwrap();
      } finally {
        request.unsubscribe();
      }
    } catch (err) {
      console.warn("Could not load project details, using list data:", err);
    }

    setIsMinimized(true);
    navigate(`${PROJECT_PAGE_URL}/${target.id || project.id}`, {
      state: { project: target },
    });
  };

  const loadSkills = async (): Promise<TechSkill[]> => {
    const request = dispatch(SkillsApi.endpoints.getTechSkills.initiate());
    try {
      return await request.unwrap();
    } finally {
      request.unsubscribe();
    }
  };

  const buildProjectsMessage = async (
    question: string,
  ): Promise<Omit<Message, "id">> => {
    const projects = await loadPublishedProjects();

    if (!projects.length) {
      return {
        sender: "bot",
        text: "There are no published projects yet. Check back soon.",
        actions: ["whatsapp"],
      };
    }

    const specific = findSpecificProject(projects, question);
    if (specific) {
      return {
        sender: "bot",
        text: "Here's that project:",
        projects: [specific],
        actions: ["whatsapp"],
      };
    }

    return {
      sender: "bot",
      text: `Gakenye has ${projects.length} published project${projects.length === 1 ? "" : "s"}. Here are the latest:`,
      projects: projects.slice(0, 3),
      moreProjects: Math.max(0, projects.length - 3),
      actions: ["whatsapp"],
    };
  };

  const sendMessage = async (raw: string = input) => {
    const question = raw.trim();
    if (!question || isTyping) return;

    addMessage({ sender: "user", text: question });
    setInput("");
    setIsTyping(true);

    const intent = detectIntent(question, lastBotText());
    if (intent === "projects" || intent === "skills") setLoadingKind(intent);

    const defaultActions: Action[] =
      ["pricing", "hire", "contact", "availability", "timeline"].includes(intent)
        ? ["whatsapp"]
        : intent === "fallback"
          ? ["services", "projects"]
          : ["projects", "whatsapp"];

    try {
      if (intent === "projects") {
        addMessage(await buildProjectsMessage(question));
      } else if (intent === "skills") {
        const skills = await loadSkills();
        addMessage(
          skills.length
            ? {
                sender: "bot",
                text: "Here's Gakenye's tech stack:",
                skills,
                actions: defaultActions,
              }
            : {
                sender: "bot",
                text: `Gakenye's toolkit includes:\n\n${PROFILE.technologies.join(", ")}.`,
                actions: defaultActions,
              },
        );
      } else if (intent === "contact") {
        addMessage({ sender: "bot", text: RESPONSES.contact, contact: true });
      } else if (TOPIC_KEYWORDS[intent]) {
        // Topic answers (web, mobile, backend...) + matching real projects.
        let matches: Project[] = [];
        try {
          const keywords = TOPIC_KEYWORDS[intent]!.map(normalize);
          matches = (await loadPublishedProjects())
            .filter((p) => keywords.some((k) => projectHaystack(p).includes(k)))
            .slice(0, 2);
        } catch (err) {
          console.warn("Could not load related projects:", err);
        }

        addMessage({
          sender: "bot",
          text: matches.length
            ? `${RESPONSES[intent]}\n\nRelated work:`
            : RESPONSES[intent],
          projects: matches.length ? matches : undefined,
          actions: ["whatsapp"],
        });
      } else {
        addMessage({
          sender: "bot",
          text: RESPONSES[intent],
          actions: defaultActions,
        });
      }
    } catch (err) {
      console.error("Assistant request failed:", err);
      addMessage({
        sender: "bot",
        text:
          intent === "projects"
            ? "I couldn't load the projects right now. The server may be waking up, so try again in a few seconds."
            : intent === "skills"
              ? "I couldn't load the skills right now. The server may be waking up, so try again in a few seconds."
              : "I couldn't load that right now. Please try again shortly or message Gakenye on WhatsApp.",
        actions: ["whatsapp"],
      });
    } finally {
      setLoadingKind(null);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendMessage();
  };

  const handleQuickAction = (label: string) => {
    if (label === "Talk on WhatsApp") {
      addMessage({ sender: "user", text: label });
      addMessage({
        sender: "bot",
        text: "Tap below to chat with Gakenye. Include your idea, key features and target date.",
        actions: ["whatsapp"],
      });
      return;
    }
    void sendMessage(label);
  };

  const handleAction = (action: Action) => {
    if (action === "whatsapp") openWhatsApp();
    if (action === "services") void sendMessage("What services do you offer?");
  };

  const mood: Mood = surprised
    ? "surprised"
    : isTyping
      ? "thinking"
      : happy
        ? "happy"
        : "neutral";

  // While typing, the robot's eyes snap to the input box.
  const pointAtInput = () => {
    const r = inputRef.current?.getBoundingClientRect();
    if (r) {
      setLookTarget((cur) => cur ?? { x: r.left + r.width / 2, y: r.top + r.height / 2 });
    }
    window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => setLookTarget(null), 1800);
  };

  const hasUserMessages = messages.some((m) => m.sender === "user");

  /* ------------------------------------------------------------------------ */
  /*  Render                                                                  */
  /* ------------------------------------------------------------------------ */

  return (
    <div
      className="fixed bottom-5 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      style={{ fontFamily: "inherit" }}
    >
      <style>{ANIMATION_CSS}</style>

      {isOpen && (
        <section
          role="dialog"
          aria-label="Gakenye virtual assistant"
          aria-modal="false"
          className={`va-panel flex w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border shadow-2xl ${
            isMinimized ? "" : "h-[min(600px,calc(100dvh-7.5rem))]"
          }`}
          style={{
            backgroundColor: base,
            color: text,
            borderColor: c.border,
            boxShadow: `0 24px 60px ${text}26`,
          }}
        >
          {/* Header */}
          <header
            className="flex shrink-0 items-center gap-3 px-4 py-3"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${primary}d9)`,
              color: base,
            }}
          >
            <div
              className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: `${base}26` }}
            >
              <RobotFace
                size={26}
                face={base}
                eye={primary}
                mood={mood}
                track
                target={lookTarget}
              />
              {waving && (
                <span
                  className="va-wave pointer-events-none absolute -right-2 -top-2 text-base"
                  aria-hidden="true"
                >
                  👋
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold leading-tight">
                Gakenye Assistant
              </h2>
              <p className="flex items-center gap-1.5 text-xs opacity-80">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Online
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsMinimized((v) => !v)}
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              className="rounded-lg p-1.5 transition hover:bg-white/15"
            >
              <Minus size={18} />
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-lg p-1.5 transition hover:bg-white/15"
            >
              <X size={18} />
            </button>
          </header>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
                aria-live="polite"
                aria-relevant="additions text"
              >
                {messages.map((m) => {
                  const isUser = m.sender === "user";
                  const typing = !isUser && !doneIds.has(m.id);
                  const ready = !typing; // cards and buttons appear after the text
                  return (
                    <div
                      key={m.id}
                      className={`va-msg flex flex-col gap-2 ${
                        isUser ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className="max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
                        style={{
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                          ...(isUser
                            ? {
                                backgroundColor: primary,
                                color: base,
                                borderBottomRightRadius: 4,
                              }
                            : {
                                backgroundColor: `${text}0d`,
                                borderBottomLeftRadius: 4,
                              }),
                        }}
                      >
                        {typing ? (
                          <TypewriterText
                            text={m.text}
                            onTick={() =>
                              bottomRef.current?.scrollIntoView({ block: "end" })
                            }
                            onDone={() => markDone(m.id)}
                          />
                        ) : (
                          m.text
                        )}
                      </div>

                      {/* Project cards */}
                      {ready && m.projects && m.projects.length > 0 && (
                        <div className="w-full space-y-2">
                          {m.projects.map((p, i) => (
                            <ProjectCard
                              key={p.id}
                              project={p}
                              c={c}
                              index={i}
                              onOpen={openProject}
                            />
                          ))}
                          {!!m.moreProjects && (
                            <Link
                              to={PROJECTS_URL}
                              className="block text-center text-xs font-semibold hover:underline"
                              style={{ color: primary }}
                            >
                              See {m.moreProjects} more on the projects page
                            </Link>
                          )}
                        </div>
                      )}

                      {/* Skills */}
                      {ready && m.skills && m.skills.length > 0 && (
                        <SkillGroups skills={m.skills} c={c} />
                      )}

                      {/* Contact */}
                      {ready && m.contact && <ContactCard c={c} />}

                      {/* Action buttons */}
                      {ready && m.actions && m.actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {m.actions.map((action) => {
                            if (action === "projects") {
                              return (
                                <Link
                                  key={action}
                                  to={PROJECTS_URL}
                                  className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
                                  style={{ borderColor: primary, color: primary }}
                                >
                                  All projects <ArrowUpRight size={13} />
                                </Link>
                              );
                            }
                            if (action === "whatsapp") {
                              return (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => handleAction(action)}
                                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-95"
                                  style={{ backgroundColor: whatsappGreen }}
                                >
                                  <MessageCircle size={13} />
                                  Chat on WhatsApp
                                </button>
                              );
                            }
                            return (
                              <button
                                key={action}
                                type="button"
                                onClick={() => handleAction(action)}
                                className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-80"
                                style={{ borderColor: primary, color: primary }}
                              >
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
                  <div
                    className="va-msg inline-flex items-center gap-1 rounded-2xl px-4 py-3"
                    style={{ backgroundColor: `${text}0d` }}
                    aria-label="Assistant is typing"
                  >
                    {[0, 120, 240].map((d) => (
                      <span
                        key={d}
                        className="h-1.5 w-1.5 animate-bounce rounded-full"
                        style={{
                          backgroundColor: c.muted,
                          animationDelay: `${d}ms`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {isTyping && loadingKind && (
                  <LoadingSkeleton kind={loadingKind} c={c} />
                )}

                <div ref={bottomRef} />
              </div>

              {/* Suggestions: one scrollable row, not a wall of buttons */}
              <div
                className="flex shrink-0 gap-2 overflow-x-auto px-4 pb-2 pt-2"
                style={{ scrollbarWidth: "none" }}
              >
                {(hasUserMessages ? QUICK_ACTIONS.slice(0, 5) : QUICK_ACTIONS).map(
                  (label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleQuickAction(label)}
                      disabled={isTyping}
                      className="va-pop shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition hover:opacity-70 disabled:opacity-40"
                      style={{ borderColor: c.border, animationDelay: `${150 + i * 40}ms` }}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSubmit}
                className="flex shrink-0 items-center gap-2 border-t px-3 py-3"
                style={{ borderColor: c.border }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    pointAtInput();
                  }}
                  onBlur={() => {
                    window.clearTimeout(typingTimer.current);
                    setLookTarget(null);
                  }}
                  placeholder="Ask me anything about this portfolio…"
                  aria-label="Type your question"
                  maxLength={500}
                  className="min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: `${text}05`,
                    color: text,
                    borderColor: c.border,
                    outlineColor: primary,
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ backgroundColor: primary, color: base }}
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </section>
      )}

      {/* Launcher */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((v) => !v);
          setIsMinimized(false);
        }}
        aria-label={isOpen ? "Close virtual assistant" : "Open virtual assistant"}
        aria-expanded={isOpen}
        className="group relative grid h-14 w-14 place-items-center rounded-full shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 sm:h-16 sm:w-16"
        style={{
          backgroundColor: primary,
          color: base,
          boxShadow: `0 10px 30px ${primary}55`,
        }}
      >
        <span key={isOpen ? "x" : "chat"} className="va-icon grid place-items-center">
          {isOpen ? (
            <X size={24} />
          ) : (
            <span className={`inline-grid ${peek ? "va-peek" : ""}`}>
              <RobotFace size={36} face={base} eye={primary} track />
            </span>
          )}
        </span>

        {!isOpen && (
          <span
            className="pointer-events-none absolute bottom-full right-0 mb-3 w-max rounded-xl px-3 py-2 text-xs font-semibold opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            style={{ backgroundColor: base, color: text }}
          >
            Need help planning a project?
          </span>
        )}
      </button>
    </div>
  );
};

export default VirtualAssistant;