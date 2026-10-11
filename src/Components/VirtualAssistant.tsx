
import React, { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bot,
  Clock3,
  Code2,
  ExternalLink,
  MessageCircle,
  Minimize2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../ThemeContext";

const WHATSAPP_URL = "https://wa.link/f3ajog";
const PROJECTS_URL = "/projects";
const API_BASE_URL =
  "https://my-portifolio-backend-fb0a.onrender.com/api";

type Action = "projects" | "whatsapp" | "services" | "contact";

type Message = {
  id: string;
  sender: "bot" | "user";
  text: string;
  actions?: Action[];
};

type Intent =
  | "greeting"
  | "about"
  | "education"
  | "certificates"
  | "availability"
  | "services"
  | "web"
  | "mobile"
  | "backend"
  | "database"
  | "blockchain"
  | "ai"
  | "projects"
  | "skills"
  | "hire"
  | "pricing"
  | "timeline"
  | "process"
  | "student"
  | "location"
  | "contact"
  | "thanks"
  | "goodbye"
  | "fallback";

const QUICK_ACTIONS = [
  "Who is Gakenye?",
  "What services do you offer?",
  "Show me your projects",
  "What technologies do you use?",
  "What certificates do you have?",
  "Are you open for new projects?",
  "How much does a project cost?",
  "Talk to Gakenye on WhatsApp",
];

const PROFILE = {
  name: "Gakenye Ndiritu",
  brand: "Code with Gakenye",
  role: "Certified Full-Stack Software Developer",
  education: "Final-year BSc Computer Science student",
  university: "Laikipia University",
  location: "Nyahururu, Kenya",
  email: "codewithgakenye@gmail.com",
  availability: "Open to new projects and collaborations",
  certificates: [
    "Teach2Give — Software Development Program",
    "SoloLearn — Web Development Basics",
  ],
  technologies: [
    "React",
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Express",
    "React Native",
    "Expo",
    "PostgreSQL",
    "Drizzle ORM",
    "Tailwind CSS",
    "REST APIs",
    "Blockchain",
    "AI integrations",
    "Docker",
  ],
};

const RESPONSES: Record<Intent, string> = {
  greeting:
    "Hi there! 👋 Welcome to Code with Gakenye!\n\nI'm your portfolio assistant. I can introduce Gakenye, explain his services, explore his real projects and technologies, and help you discuss a project with him.\n\nWhat would you like to know?",

  about:
    `Hi! I'm ${PROFILE.name}, a certified software developer and final-year Computer Science student at ${PROFILE.university} in Kenya.\n\nI build web and mobile applications from start to finish, including user interfaces, backend APIs, databases, and integrations. I'm interested in blockchain, AI integrations, and cloud tools that help make applications secure, reliable, and useful.\n\nI work from ${PROFILE.location} and I'm ${PROFILE.availability.toLowerCase()}.\n\nAsk me about my education, certificates, technical skills, or projects!`,

  education:
    `Gakenye is a final-year Bachelor of Science in Computer Science student at ${PROFILE.university} in Kenya.\n\nHe combines university studies with practical software development projects, working on frontend interfaces, backend systems, databases, authentication, and application integrations.\n\nHis goal is to build useful, secure, and user-friendly software that solves real-world problems.`,

  certificates:
    `Gakenye's professional training and certificates include:\n\n${PROFILE.certificates.map((item) => `• ${item}`).join("\n")}\n\nHe also develops his skills through university studies and hands-on software projects.`,

  availability:
    `Gakenye is ${PROFILE.availability.toLowerCase()}.\n\nHe can discuss web applications, mobile apps, backend APIs, database solutions, blockchain-related systems, and AI integrations.\n\nTo get started, share your idea, the main features you need, and your preferred launch date. You can contact him directly on WhatsApp.`,

  services:
    "Gakenye can help plan and develop digital products, depending on the requirements:\n\n• Web development — business websites, portfolios, online stores, and web applications.\n• Mobile development — Android and iOS app development using React Native and Expo.\n• Backend development — REST APIs, authentication, authorization, and business logic.\n• Database solutions — PostgreSQL, data modelling, and Drizzle ORM.\n• Blockchain — exploring verifiable records and decentralized applications.\n• AI integrations — adding useful AI-powered features to applications.\n• Full-stack development — connecting frontend, backend, and database systems.\n\nWhat would you like to build?",

  web:
    "Gakenye builds websites and web applications, from responsive interfaces to API integrations and backend functionality.\n\nProjects may include business websites, portfolios, e-commerce stores, booking platforms, dashboards, and custom web apps.\n\nWhat kind of website do you need?",

  mobile:
    "Gakenye works with React Native and Expo to build mobile application experiences.\n\nA project may include app screens, navigation, authentication, API integration, data storage, and other features depending on your requirements.\n\nAre you planning an Android app, an iOS app, or both?",

  backend:
    "Backend development powers the features behind an application.\n\nGakenye works with Node.js, Express, TypeScript, REST APIs, JWT-based authentication, validation, role-based access, and business logic.\n\nTell me what your application needs to do, and we can outline a suitable backend.",

  database:
    "Gakenye works with PostgreSQL and Drizzle ORM to design and connect application databases.\n\nThis can include data modelling, relationships, migrations, and connecting stored data to backend APIs.\n\nWhat information will your application need to store?",

  blockchain:
    "Gakenye has explored blockchain technology through an Ethereum Sepolia testnet voting-system prototype.\n\nBlockchain can be useful when a project needs verifiable transactions or tamper-evident records, although it isn't necessary for every application.\n\nWhat problem would you like blockchain to solve?",

  ai:
    "Gakenye is interested in integrating AI into applications where it provides practical value.\n\nPossible use cases include chat assistants, task automation, recommendations, and document processing. The right approach depends on your requirements and data.\n\nAre you looking to add an AI feature to an existing application or build something new?",

  projects:
    "You can explore Gakenye's published portfolio projects. I can retrieve available project titles, descriptions, technologies, and links directly from the portfolio API.\n\nHere are some projects you may recognize from the portfolio:\n\n• Anma Perfumes & Jewellery — full-stack e-commerce.\n• CISLU Web Voting App — a digital voting platform.\n• UniHaven Hostel Finder — a student and tenant housing discovery concept.\n\nI'll check the live portfolio API for the latest published project details.",

  skills:
    `Gakenye's technology toolkit includes:\n\n${PROFILE.technologies.join(", ")}.\n\nThe best technology stack depends on the project's requirements. I'll check the live portfolio API for the skills currently listed on the website.`,

  hire:
    "Here's how to start working with Gakenye:\n\n1. Explain the problem you want to solve.\n2. List the most important features.\n3. Share your preferred launch date and budget range, if available.\n4. Contact Gakenye on WhatsApp to discuss the scope and next steps.\n\nYou don't need a perfect technical specification to start.",

  pricing:
    "Project pricing depends on the features, design, number of screens, integrations, user roles, deadlines, hosting, and support requirements.\n\nI won't invent a price without understanding your project. Tell Gakenye what you want to build and your approximate budget, if you have one, to discuss an appropriate scope and quote.",

  timeline:
    "Project timelines depend on the size of the application, feature complexity, integrations, feedback, and testing.\n\nA landing page is very different from an application with accounts, payments, dashboards, and notifications.\n\nTell me your project type, essential features, and target launch date so we can prepare a useful project brief.",

  process:
    "A typical development workflow looks like this:\n\n1. Discovery — understand the problem and users.\n2. Planning — agree on essential features and project scope.\n3. Design — plan the screens, user journeys, and data.\n4. Development — build the frontend, backend, and integrations.\n5. Testing — check functionality, responsiveness, and errors.\n6. Deployment and handover — prepare the application for use and discuss maintenance.\n\nThe process can be adjusted to suit your project.",

  student:
    "If you're learning software development, start with programming fundamentals, Git and GitHub, and small practical projects. Then learn frontend or backend development before combining them into full-stack applications.\n\nGakenye combines his Computer Science studies at Laikipia University with hands-on software development.\n\nTell me your current level and learning goals for a practical roadmap.",

  location:
    `Gakenye works from ${PROFILE.location} and can discuss collaborations and projects with clients in other locations.\n\nFor meetings or project discussions, contact him to coordinate a suitable time.`,

  contact:
    `You can contact ${PROFILE.name} directly through WhatsApp or email.\n\nEmail: ${PROFILE.email}\nLocation: ${PROFILE.location}\nAvailability: ${PROFILE.availability}\n\nUse the WhatsApp button below to discuss your idea.`,

  thanks:
    "You're welcome! 😊 Ask me anything else about Gakenye, his work, or the technologies he uses. I can also help you prepare a project brief.",

  goodbye:
    "Thanks for visiting Code with Gakenye! 👋 Come back whenever you're ready to explore an idea. You can also contact Gakenye directly on WhatsApp.",

  fallback:
    "I didn't quite understand that question, and I don't want to make up information.\n\nI can help you learn about Gakenye, his education, certificates, services, projects, technologies, pricing, and availability.\n\nCould you rephrase your question or tell me a little more?",
};

const initialMessage: Message = {
  id: "welcome",
  sender: "bot",
  text: RESPONSES.greeting,
  actions: ["services", "projects", "whatsapp"],
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(value: string, words: string[]): boolean {
  return words.some((word) => value.includes(word));
}

type PortfolioProject = {
  id?: string | number;
  title?: string;
  slug?: string;
  mainDescription?: string;
  description?: string;
  shortDescription?: string;
  status?: string;
  techs?: unknown;
  technologies?: unknown;
  links?: unknown;
};

type PortfolioSkill = {
  name?: string;
  title?: string;
  category?: string;
  description?: string;
};

async function fetchApiData(path: string): Promise<unknown> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }

  return response.json();
}

function getArrayFromResponse<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (!payload || typeof payload !== "object") return [];

  const object = payload as Record<string, unknown>;

  for (const key of [
    "data",
    "projects",
    "skills",
    "items",
    "results",
    "media",
  ]) {
    const value = object[key];

    if (Array.isArray(value)) return value as T[];

    if (value && typeof value === "object") {
      const nested = value as Record<string, unknown>;

      for (const nestedKey of [
        "data",
        "projects",
        "skills",
        "items",
        "results",
      ]) {
        if (Array.isArray(nested[nestedKey])) {
          return nested[nestedKey] as T[];
        }
      }
    }
  }

  return [];
}

function toDisplayText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return String(item);
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return String(
            record.name ??
              record.title ??
              record.label ??
              record.url ??
              "",
          );
        }

        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    return String(
      record.name ??
        record.title ??
        record.label ??
        record.url ??
        "",
    );
  }

  return "";
}

function formatProject(
  project: PortfolioProject,
  index: number,
): string {
  const title = project.title?.trim() || `Project ${index + 1}`;

  const description =
    project.mainDescription?.trim() ||
    project.description?.trim() ||
    project.shortDescription?.trim() ||
    "No description has been published for this project yet.";

  const technologies = toDisplayText(
    project.techs ?? project.technologies,
  );

  const links = toDisplayText(project.links);
  const slug = project.slug?.trim();

  return [
    `${index + 1}. ${title}`,
    description,
    technologies ? `Technologies: ${technologies}` : "",
    links ? `Links: ${links}` : "",
    slug ? `Portfolio page: ${PROJECTS_URL}/${slug}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function isPublished(project: PortfolioProject): boolean {
  return (
    !project.status ||
    project.status.toLowerCase() === "published"
  );
}

async function getProjectsReply(question: string): Promise<string> {
  const payload = await fetchApiData("/projects");

  const projects = getArrayFromResponse<PortfolioProject>(payload)
    .filter(isPublished);

  if (!projects.length) {
    return "I couldn't find published projects in the portfolio API right now. Please visit the Projects page to check the portfolio.";
  }

  const normalizedQuestion = normalize(question);

  const specificProject = projects.find((project) => {
    const title = normalize(project.title ?? "");
    const slug = normalize(
      (project.slug ?? "").replace(/-/g, " "),
    );

    return (
      (title.length > 1 && normalizedQuestion.includes(title)) ||
      (slug.length > 1 && normalizedQuestion.includes(slug))
    );
  });

  if (specificProject) {
    return `Here are the project details from the portfolio API:\n\n${formatProject(specificProject, 0)}\n\nVisit the Projects page to explore more.`;
  }

  const list = projects
    .slice(0, 6)
    .map((project, index) => formatProject(project, index))
    .join("\n\n");

  const remaining = Math.max(0, projects.length - 6);

  return `Here are Gakenye's published projects from the portfolio API:\n\n${list}${
    remaining
      ? `\n\nAnd ${remaining} more project(s) are available on the Projects page.`
      : ""
  }`;
}

async function getSkillsReply(): Promise<string> {
  const payload = await fetchApiData("/tech-skills");

  const skills = getArrayFromResponse<PortfolioSkill>(payload);

  if (!skills.length) {
    return "I couldn't find any skills in the portfolio API right now. Please try again later.";
  }

  const grouped = new Map<string, string[]>();

  for (const skill of skills) {
    const name = skill.name?.trim() || skill.title?.trim();

    if (!name) continue;

    const category = skill.category?.trim() || "Other";

    grouped.set(category, [
      ...(grouped.get(category) ?? []),
      name,
    ]);
  }

  if (!grouped.size) {
    return "The skills endpoint responded, but it didn't include readable skill names.";
  }

  return `Here are the technologies listed in Gakenye's portfolio API:\n\n${Array.from(
    grouped.entries(),
  )
    .map(([category, names]) => `${category}: ${names.join(", ")}`)
    .join("\n\n")}`;
}

async function getContentReply(
  pageName: string,
): Promise<string | null> {
  try {
    const payload = await fetchApiData(
      `/content/page/${encodeURIComponent(pageName)}`,
    );

    if (!payload || typeof payload !== "object") return null;

    const record = payload as Record<string, unknown>;
    const content = record.data ?? record.content ?? payload;

    if (typeof content === "string") return content;

    if (content && typeof content === "object") {
      const entries = Object.entries(
        content as Record<string, unknown>,
      )
        .map(([key, value]) => {
          const readable = toDisplayText(value);

          return readable
            ? `${key.replace(/([A-Z])/g, " $1")}: ${readable}`
            : "";
        })
        .filter(Boolean)
        .slice(0, 8);

      if (entries.length) return entries.join("\n");
    }

    return null;
  } catch {
    return null;
  }
}

function detectIntent(
  question: string,
  previousBotText = "",
): Intent {
  const value = normalize(question);
  const previous = normalize(previousBotText);

  if (!value) return "fallback";

  if (
    /^(hi|hey|hello|howdy|habari|niaje|good morning|good afternoon|good evening)\b/.test(
      value,
    )
  ) {
    return "greeting";
  }

  if (
    hasAny(value, [
      "thank you",
      "thanks",
      "thx",
      "appreciate it",
    ])
  ) {
    return "thanks";
  }

  if (
    hasAny(value, [
      "bye",
      "goodbye",
      "see you",
      "that is all",
      "thats all",
    ])
  ) {
    return "goodbye";
  }

  // Check personal questions before generic contact or service keywords.
  if (
    hasAny(value, [
      "who are you",
      "who is gakenye",
      "who is gakenye ndiritu",
      "about gakenye",
      "tell me about gakenye",
      "about me",
      "your story",
      "your background",
      "introduce yourself",
      "who built this portfolio",
      "who created this website",
      "your profession",
      "are you a software engineer",
      "are you a developer",
    ])
  ) {
    return "about";
  }

  if (
    hasAny(value, [
      "where did you study",
      "which university",
      "your education",
      "your degree",
      "what are you studying",
      "laikipia university",
      "are you a student",
      "computer science student",
      "what school",
    ])
  ) {
    return "education";
  }

  if (
    hasAny(value, [
      "certificate",
      "certification",
      "certified",
      "teach2give",
      "sololearn",
      "training program",
      "professional qualification",
    ])
  ) {
    return "certificates";
  }

  if (
    hasAny(value, [
      "are you available",
      "available for work",
      "open for projects",
      "accepting projects",
      "freelance availability",
      "open to collaborations",
      "available for projects",
      "are you hiring",
    ])
  ) {
    return "availability";
  }

  // Specific project and skill queries use the existing API.
  if (
    hasAny(value, [
      "project",
      "portfolio",
      "your work",
      "examples",
      "case study",
      "built before",
      "show me your work",
      "what have you built",
    ])
  ) {
    return "projects";
  }

  if (
    hasAny(value, [
      "technology",
      "technologies",
      "tech stack",
      "framework",
      "programming language",
      "tools",
      "skills",
      "typescript",
      "react",
      "node.js",
      "postgresql",
      "what can you code",
    ])
  ) {
    return "skills";
  }

  if (
    hasAny(value, [
      "whatsapp",
      "contact",
      "email address",
      "phone number",
      "talk to gakenye",
      "speak to gakenye",
      "human",
      "reach you",
      "email me",
    ])
  ) {
    return "contact";
  }

  if (
    hasAny(value, [
      "how much",
      "price",
      "pricing",
      "cost",
      "budget",
      "quote",
      "afford",
    ])
  ) {
    return "pricing";
  }

  if (
    hasAny(value, [
      "how long",
      "timeline",
      "deadline",
      "deliver",
      "delivery",
      "when can",
      "launch date",
    ])
  ) {
    return "timeline";
  }

  if (
    hasAny(value, [
      "hire",
      "work with",
      "collaborate",
      "get started",
      "book you",
      "freelance",
    ])
  ) {
    return "hire";
  }

  if (
    hasAny(value, [
      "process",
      "steps",
      "workflow",
      "how do you work",
      "how does it work",
    ])
  ) {
    return "process";
  }

  if (
    hasAny(value, [
      "service",
      "what do you do",
      "offer",
      "what can you build",
      "help me build",
    ])
  ) {
    return "services";
  }

  if (
    hasAny(value, [
      "website",
      "web app",
      "web application",
      "landing page",
      "online store",
      "ecommerce",
      "e-commerce",
      "business site",
    ])
  ) {
    return "web";
  }

  if (
    hasAny(value, [
      "mobile app",
      "mobile application",
      "android app",
      "ios app",
      "react native",
      "expo",
    ])
  ) {
    return "mobile";
  }

  if (
    hasAny(value, [
      "backend",
      "back end",
      "api",
      "authentication",
      "login system",
      "rest api",
      "server",
    ])
  ) {
    return "backend";
  }

  if (
    hasAny(value, [
      "database",
      "postgres",
      "postgresql",
      "drizzle",
      "data model",
      "store data",
    ])
  ) {
    return "database";
  }

  if (
    hasAny(value, [
      "blockchain",
      "ethereum",
      "smart contract",
      "on-chain",
      "on chain",
      "crypto",
    ])
  ) {
    return "blockchain";
  }

  if (
    hasAny(value, [
      "artificial intelligence",
      "chatbot",
      "chat bot",
      "machine learning",
      "automation",
      "recommendation engine",
      "ai tools",
      " ai ",
    ])
  ) {
    return "ai";
  }

  if (
    hasAny(value, [
      "student",
      "beginner",
      "learn coding",
      "learn programming",
      "roadmap",
      "how do i become",
      "software developer",
    ])
  ) {
    return "student";
  }

  if (
    hasAny(value, [
      "where are you",
      "where are you based",
      "location",
      "meet in person",
      "meeting",
      "which country",
    ])
  ) {
    return "location";
  }

  // Short follow-ups refer to the previous answer.
  if (
    /^(yes|yeah|yep|sure|okay|ok|please|tell me more|more details)\b/.test(
      value,
    )
  ) {
    if (previous.includes("certificate")) return "certificates";
    if (previous.includes("university") || previous.includes("education")) {
      return "education";
    }
    if (previous.includes("available") || previous.includes("project")) {
      return previous.includes("available") ? "availability" : "projects";
    }
    if (
      previous.includes("price") ||
      previous.includes("budget") ||
      previous.includes("quote")
    ) {
      return "pricing";
    }
    if (previous.includes("timeline") || previous.includes("target date")) {
      return "timeline";
    }
    if (previous.includes("website") || previous.includes("web application")) {
      return "web";
    }
    if (previous.includes("mobile app")) return "mobile";
    if (previous.includes("backend")) return "backend";
    if (previous.includes("technolog") || previous.includes("skill")) {
      return "skills";
    }
    if (previous.includes("project")) return "projects";

    return "services";
  }

  return "fallback";
}

const VirtualAssistant: React.FC = () => {
  const { theme } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    initialMessage,
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const base = theme["base-100"];
  const text = theme["base-content"];
  const primary = theme.primary;
  const border = `${text}20`;
  const muted = `${text}a0`;
  const whatsappGreen = "#25D366";

  useEffect(() => {
    if (isOpen && !isMinimized) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages, isOpen, isMinimized, isTyping]);

  useEffect(() => {
    if (!isOpen || isMinimized) return;

    const timer = window.setTimeout(
      () => inputRef.current?.focus(),
      180,
    );

    return () => window.clearTimeout(timer);
  }, [isOpen, isMinimized]);

  const addMessage = (
    sender: Message["sender"],
    messageText: string,
    actions?: Action[],
  ) => {
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sender,
        text: messageText,
        actions,
      },
    ]);
  };

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
  };

  const getLastBotText = () => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].sender === "bot") {
        return messages[index].text;
      }
    }

    return "";
  };

  const sendMessage = async (rawQuestion: string = input) => {
    const question = rawQuestion.trim();

    if (!question || isTyping) return;

    addMessage("user", question);
    setInput("");
    setIsTyping(true);

    const intent = detectIntent(question, getLastBotText());

    const actions: Action[] =
      intent === "projects"
        ? ["projects", "whatsapp"]
        : ["pricing", "hire", "contact", "availability"].includes(intent)
          ? ["whatsapp", "services"]
          : ["services", "skills", "about"].includes(intent)
            ? ["projects", "whatsapp"]
            : intent === "fallback"
              ? ["services", "projects", "whatsapp"]
              : ["whatsapp"];

    try {
      let responseText = RESPONSES[intent];

      if (intent === "projects") {
        responseText = await getProjectsReply(question);
      } else if (intent === "skills") {
        responseText = await getSkillsReply();
      } else if (intent === "services") {
        const content = await getContentReply("home");

        if (content) {
          responseText =
            `${RESPONSES.services}\n\n` +
            `Additional information from the portfolio homepage:\n${content}`;
        }
      } else if (
        ["web", "mobile", "backend", "database", "blockchain"].includes(intent)
      ) {
        try {
          const payload = await fetchApiData("/projects");

          const projects = getArrayFromResponse<PortfolioProject>(
            payload,
          ).filter(isPublished);

          const keywordMap: Partial<Record<Intent, string[]>> = {
            web: ["web", "website", "react", "frontend", "ecommerce"],
            mobile: ["mobile", "react native", "expo", "android", "ios"],
            backend: ["backend", "api", "node", "express", "server"],
            database: ["database", "postgres", "sql", "drizzle"],
            blockchain: ["blockchain", "ethereum", "smart contract", "voting"],
          };

          const keywords = keywordMap[intent] ?? [];

          const matches = projects.filter((project) => {
            const haystack = normalize(
              [
                project.title,
                project.mainDescription,
                project.description,
                toDisplayText(project.techs ?? project.technologies),
              ]
                .filter(Boolean)
                .join(" "),
            );

            return keywords.some((keyword) =>
              haystack.includes(normalize(keyword)),
            );
          });

          if (matches.length) {
            responseText +=
              "\n\nRelevant published projects:\n\n" +
              matches
                .slice(0, 3)
                .map((project, index) => formatProject(project, index))
                .join("\n\n");
          }
        } catch (error) {
          console.warn(
            "Could not load related portfolio projects:",
            error,
          );
        }
      }

      addMessage("bot", responseText, actions);
    } catch (error) {
      console.error("Portfolio assistant API request failed:", error);

      const fallback =
        intent === "projects"
          ? "I couldn't retrieve published projects from the portfolio API right now. Please try again shortly or visit the Projects page."
          : intent === "skills"
            ? "I couldn't retrieve the technologies from the portfolio API right now. Please try again shortly."
            : "I couldn't load that portfolio information right now. Please try again shortly or contact Gakenye on WhatsApp.";

      addMessage(
        "bot",
        fallback,
        intent === "projects"
          ? ["projects", "whatsapp"]
          : ["whatsapp", "projects"],
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage();
  };

  const handleQuickAction = (action: string) => {
    if (action === "Talk to Gakenye on WhatsApp") {
      addMessage("user", action);

      addMessage(
        "bot",
        "Absolutely! Tap the WhatsApp button below to start a conversation with Gakenye. Include your idea, essential features, and target date to get started.",
        ["whatsapp"],
      );

      return;
    }

    void sendMessage(action);
  };

  const handleAction = (action: Action) => {
    if (action === "whatsapp" || action === "contact") {
      openWhatsApp();
      return;
    }

    if (action === "projects") {
      window.location.assign(PROJECTS_URL);
      return;
    }

    if (action === "services") {
      void sendMessage("What services do you offer?");
    }
  };

  const renderMessageText = (value: string) =>
    value.split("\n").map((line, index) => (
      <React.Fragment key={`${index}-${line.slice(0, 12)}`}>
        {index > 0 && <br />}
        {line}
      </React.Fragment>
    ));

  return (
    <div
      className="fixed bottom-5 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
      style={{ fontFamily: "inherit" }}
    >
      {isOpen && (
        <section
          role="dialog"
          aria-label="Gakenye virtual assistant"
          aria-modal="false"
          className="w-[min(390px,calc(100vw-2rem))] overflow-hidden rounded-3xl border shadow-2xl"
          style={{
            backgroundColor: base,
            color: text,
            borderColor: border,
            boxShadow: `0 20px 70px ${text}20`,
          }}
        >
          <div
            className="relative overflow-hidden p-4 sm:p-5"
            style={{
              background: `linear-gradient(135deg, ${primary}, ${primary}dd)`,
              color: base,
            }}
          >
            <div
              className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full border opacity-20"
              style={{ borderColor: base }}
            />

            <div className="relative flex items-center gap-3">
              <div
                className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border"
                style={{
                  backgroundColor: `${base}20`,
                  borderColor: `${base}40`,
                }}
              >
                <Bot size={26} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="font-bold">Gakenye Assistant</h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs opacity-90">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Your portfolio guide · here to help
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMinimized((value) => !value)}
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
                className="rounded-xl p-2 transition hover:bg-white/15"
              >
                <Minimize2 size={17} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                className="rounded-xl p-2 transition hover:bg-white/15"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div
                className="max-h-[min(390px,43vh)] min-h-48 space-y-4 overflow-y-auto p-4"
                aria-live="polite"
                aria-relevant="additions text"
              >
                <div className="text-center text-[10px] uppercase tracking-widest opacity-40">
                  Your digital project assistant
                </div>

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.sender === "bot" && (
                      <div
                        className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg"
                        style={{
                          backgroundColor: `${primary}15`,
                          color: primary,
                        }}
                      >
                        <Sparkles size={15} />
                      </div>
                    )}

                    <div
                      className="max-w-[86%] rounded-2xl px-3.5 py-3 text-sm leading-relaxed"
                      style={
                        message.sender === "user"
                          ? {
                              backgroundColor: primary,
                              color: base,
                              borderBottomRightRadius: "5px",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }
                          : {
                              backgroundColor: `${text}08`,
                              border: `1px solid ${border}`,
                              borderBottomLeftRadius: "5px",
                              whiteSpace: "pre-wrap",
                              overflowWrap: "anywhere",
                            }
                      }
                    >
                      {renderMessageText(message.text)}

                      {message.sender === "bot" &&
                        message.actions &&
                        message.actions.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.actions.map((action) => {
                              const label =
                                action === "projects"
                                  ? "Explore projects"
                                  : action === "services"
                                    ? "View services"
                                    : "Chat on WhatsApp";

                              const isWhatsApp =
                                action === "whatsapp" ||
                                action === "contact";

                              if (action === "projects") {
                                return (
                                  <Link
                                    key={action}
                                    to={PROJECTS_URL}
                                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:brightness-110"
                                    style={{
                                      backgroundColor: primary,
                                      color: base,
                                    }}
                                  >
                                    {label}
                                    <ArrowUpRight size={14} />
                                  </Link>
                                );
                              }

                              return (
                                <button
                                  key={action}
                                  type="button"
                                  onClick={() => handleAction(action)}
                                  className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition hover:brightness-95"
                                  style={
                                    isWhatsApp
                                      ? {
                                          backgroundColor: whatsappGreen,
                                          color: "#fff",
                                        }
                                      : {
                                          backgroundColor: primary,
                                          color: base,
                                        }
                                  }
                                >
                                  {isWhatsApp ? (
                                    <MessageCircle size={14} />
                                  ) : (
                                    <Code2 size={14} />
                                  )}
                                  {label}
                                  {isWhatsApp && (
                                    <ExternalLink size={12} />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2">
                    <div
                      className="grid h-7 w-7 place-items-center rounded-lg"
                      style={{
                        backgroundColor: `${primary}15`,
                        color: primary,
                      }}
                    >
                      <Bot size={15} />
                    </div>

                    <div
                      className="flex items-center gap-1 rounded-2xl border px-4 py-3"
                      style={{
                        borderColor: border,
                        backgroundColor: `${text}08`,
                      }}
                      aria-label="Assistant is typing"
                    >
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full"
                        style={{ backgroundColor: muted }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:120ms]"
                        style={{ backgroundColor: muted }}
                      />
                      <span
                        className="h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:240ms]"
                        style={{ backgroundColor: muted }}
                      />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <div
                className="border-t px-4 py-3"
                style={{ borderColor: border }}
              >
                <p
                  className="mb-2 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ color: muted }}
                >
                  Try asking
                </p>

                <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => handleQuickAction(action)}
                      disabled={isTyping}
                      className="rounded-full border px-3 py-2 text-left text-xs transition hover:-translate-y-0.5 disabled:opacity-50"
                      style={{
                        borderColor: border,
                        backgroundColor: `${text}04`,
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 border-t p-3"
                style={{ borderColor: border }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about Gakenye or a project..."
                  aria-label="Type your question"
                  maxLength={500}
                  className="min-w-0 flex-1 rounded-xl border px-3 py-3 text-sm outline-none transition focus:ring-2"
                  style={{
                    backgroundColor: `${text}05`,
                    color: text,
                    borderColor: border,
                    outlineColor: primary,
                  }}
                />

                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    backgroundColor: primary,
                    color: base,
                  }}
                >
                  <Send size={17} />
                </button>
              </form>

              <div
                className="flex flex-wrap items-center justify-center gap-1.5 px-3 pb-3 text-center text-[10px]"
                style={{ color: muted }}
              >
                <Clock3 size={11} />
                Portfolio assistant · live portfolio data
                <span className="mx-1">·</span>
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="font-semibold underline underline-offset-2"
                  style={{ color: whatsappGreen }}
                >
                  Talk to Gakenye
                </button>
              </div>
            </>
          )}
        </section>
      )}

      <button
        type="button"
        onClick={() => {
          setIsOpen((value) => !value);
          setIsMinimized(false);
        }}
        aria-label={
          isOpen ? "Close virtual assistant" : "Open virtual assistant"
        }
        aria-expanded={isOpen}
        className="group relative grid h-14 w-14 place-items-center rounded-full border-2 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 sm:h-16 sm:w-16"
        style={{
          backgroundColor: whatsappGreen,
          color: "#ffffff",
          borderColor: `${base}80`,
          boxShadow: `0 10px 35px ${whatsappGreen}45`,
        }}
      >
        {isOpen ? (
          <X size={25} />
        ) : (
          <MessageCircle
            size={27}
            className="transition-transform duration-300 group-hover:rotate-[-8deg]"
          />
        )}

        {!isOpen && (
          <span
            className="absolute bottom-full right-0 mb-3 w-max rounded-xl px-3 py-2 text-xs font-semibold opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
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
