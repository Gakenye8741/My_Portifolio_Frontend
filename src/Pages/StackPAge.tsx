import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { Navbar } from '../Components/Navbar';
import {
  Database,
  Layout,
  Terminal,
  BookOpen,
  Smartphone,
  Zap,
  GitBranch,
  ShieldCheck,
  Quote,
  Layers,
  Wrench,
  GraduationCap,
} from 'lucide-react';

// Import the logo
import logoMain from '../../public/LOGO.png';
import Footer from '../Components/Footer';
import PageTitle from '../Components/PageTitle';
import SEO from '../Components/SEO';

/* ---------- Page information ---------- */

// Each tool has a short note about what the technology does (shown when you click it).
const techStack = [
  {
    title: 'Frontend',
    note: 'What people see and tap',
    icon: Layout,
    techs: [
      { name: 'React.js', note: 'A JavaScript library for building web pages out of small parts you can reuse. When data changes, it updates only what needs to change, so pages stay fast.' },
      { name: 'TypeScript', note: 'JavaScript with types added. It checks your code while you write it and catches many mistakes before the app ever runs.' },
      { name: 'Redux Toolkit (RTK Query)', note: 'Keeps the app\'s data in one place. RTK Query also fetches data from APIs and remembers it, so the app does not ask the server for the same thing twice.' },
      { name: 'Tailwind CSS', note: 'A styling tool that gives you small ready-made classes for spacing, colour and layout, so you can design right inside your markup.' },
      { name: 'HTML5', note: 'The language that gives every web page its structure: headings, text, images, buttons and forms.' },
      { name: 'CSS', note: 'The language that controls how a page looks: colours, fonts, layout and animation.' },
      { name: 'Daisy UI', note: 'A set of ready-made components, like buttons, cards and menus, built on Tailwind, with themes you can switch easily.' },
      { name: 'SCSS', note: 'CSS with extras like variables and nesting. It keeps styles tidy and easy to reuse in bigger projects.' },
    ],
  },
  {
    title: 'Mobile apps',
    note: 'Apps for phones',
    icon: Smartphone,
    techs: [
      { name: 'React Native', note: 'Lets you build real phone apps using React. The screens are native, so they feel smooth like any other app on the phone.' },
      { name: 'Expo', note: 'A toolkit on top of React Native that makes it easy to start, test on a real phone, and publish an app to the app stores.' },
      { name: 'Mobile UI and UX', note: 'Designing screens that are simple to read and tap on a small display, with menus and buttons placed where a thumb can reach.' },
      { name: 'One app for iOS and Android', note: 'One shared codebase that runs on both iPhones and Android phones, so you build once instead of twice.' },
    ],
  },
  {
    title: 'Backend',
    note: 'The server behind the app',
    icon: Terminal,
    techs: [
      { name: 'Node.js', note: 'Runs JavaScript on a server instead of in the browser, so the same language can power both the website and the system behind it.' },
      { name: 'Express.js', note: 'A small framework for Node.js that makes it easy to set up routes and handle requests and responses.' },
      { name: 'REST APIs', note: 'A standard way for an app and a server to talk to each other, using simple addresses and actions like get, create, update and delete.' },
      { name: 'JWT and OAuth security', note: 'JWT is a secure token that proves who a user is after they log in. OAuth lets people sign in with an account they already have, like Google.' },
      { name: 'WebSockets', note: 'Keeps a live connection open between the app and the server, so things like chats and notifications show up instantly.' },
      { name: 'Nodemailer', note: 'A Node.js tool that sends emails from your server, such as welcome messages and password resets.' },
      { name: 'TypeScript', note: 'Typed JavaScript on the server too. It makes backend code safer and easier to understand as it grows.' },
    ],
  },
  {
    title: 'Databases',
    note: 'Where the data is kept',
    icon: Database,
    techs: [
      { name: 'PostgreSQL', note: 'A powerful, trusted database that stores data in organised tables and can handle large, complex apps.' },
      { name: 'Drizzle ORM', note: 'Lets you read and write the database using TypeScript code instead of raw SQL, with types that catch errors early.' },
      { name: 'Database design', note: 'Planning what tables to create and how they connect, so data stays clean, correct and quick to find.' },
      { name: 'Relational data', note: 'Data that is linked together, like users who have orders and orders that have items, so everything can be matched up.' },
    ],
  },
  {
    title: 'Tools and hosting',
    note: 'Teamwork and going live',
    icon: GitBranch,
    techs: [
      { name: 'Git and GitHub', note: 'Git saves every version of your code so you can go back at any time. GitHub stores it online and lets teams work together.' },
      { name: 'Postman', note: 'A tool for sending test requests to an API and checking the answers, so you know it works before anyone uses it.' },
      { name: 'Vercel and Render hosting', note: 'Services that put your website or server on the internet so anyone can visit it, usually with just a few clicks.' },
      { name: 'CI/CD basics', note: 'Automatically tests your code and publishes it every time you make a change, so releases are quicker and safer.' },
      { name: 'Microsoft Azure', note: 'Microsoft\'s cloud platform. It rents you servers, storage and other services over the internet so you do not need your own hardware.' },
    ],
  },
  {
    title: 'Special skills',
    note: 'Extra things I can do',
    icon: ShieldCheck,
    techs: [
      { name: 'Blockchain (Solidity)', note: 'A blockchain is a shared record that nobody can secretly change. Solidity is the language used to write programs that run on it.' },
      { name: 'Smart contracts', note: 'Programs on a blockchain that carry out rules by themselves, such as counting votes or moving money, without a middleman.' },
      { name: 'Biometric login', note: 'Signing in with your fingerprint or face instead of a password, which is faster and harder to steal.' },
    ],
  },
];

// "step" fills the small bar: 1 = just started, 4 = very good
const learningPath = [
  {
    lang: 'Solidity',
    level: 'Intermediate',
    step: 3,
    context: 'I build voting systems and smart contracts on the Sepolia test network.',
  },
  {
    lang: 'Python',
    level: 'Learning now',
    step: 2,
    context: 'I am learning to work with data and to automate tasks with AI.',
  },
  {
    lang: 'Go (Golang)',
    level: 'Exploring',
    step: 1,
    context: 'I am exploring Go to build fast servers that can help many people at the same time.',
  },
];

/* ---------- Small helper parts ---------- */

// Tells us when an element comes into view (only the first time).
const useInView = (threshold = 0.15) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
};

// Fades and slides content in when you scroll to it.
const Reveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const { ref, visible } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`st-reveal ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(34px) scale(0.98)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

// A number that counts up when you can see it.
const CountUp = ({ to }: { to: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const duration = 1200;
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return <span ref={ref}>{value}</span>;
};

// Saves where the mouse is on a card, so the light can follow it.
const followMouse = (e: React.MouseEvent<HTMLElement>) => {
  const box = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - box.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - box.top}px`);
};

interface Colors {
  base: string;
  text: string;
  primary: string;
  borderSoft: string;
  borderMid: string;
}

/* ---------- One skill card ---------- */

const CategoryCard = ({
  category,
  index,
  colors,
}: {
  category: (typeof techStack)[number];
  index: number;
  colors: Colors;
}) => {
  const { ref, visible } = useInView(0.15);
  const [open, setOpen] = useState<number | null>(null);
  const [last, setLast] = useState(0);
  const Icon = category.icon;
  const { primary, text, borderSoft } = colors;

  return (
    <div
      ref={ref}
      className="st-reveal h-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(40px) scale(0.97)',
        transition: `opacity 0.8s ease ${(index % 3) * 120}ms, transform 0.8s cubic-bezier(.2,.7,.2,1) ${(index % 3) * 120}ms`,
      }}
    >
      <article
        onMouseMove={followMouse}
        className="group relative h-full overflow-hidden rounded-3xl border border-[color:var(--bd)] hover:border-[color:var(--hv)] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_50px_-28px_var(--glow)]"
        style={
          {
            '--bd': borderSoft,
            '--hv': `${primary}77`,
            '--glow': `${primary}55`,
            '--mx': '50%',
            '--my': '50%',
            backgroundColor: `${text}05`,
          } as React.CSSProperties
        }
      >
        {/* Light that follows the mouse */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(340px circle at var(--mx) var(--my), ${primary}22, transparent 45%)`,
          }}
        />

        <div className="relative">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-center gap-4 min-w-0">
              <span
                className="grid place-items-center shrink-0 w-12 h-12 rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110"
                style={{ backgroundColor: `${primary}1a`, color: primary }}
              >
                <Icon size={22} />
              </span>
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold leading-tight">{category.title}</h3>
                <p className="text-sm opacity-55 mt-0.5">{category.note}</p>
              </div>
            </div>
            <span
              className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${primary}18`, color: primary }}
            >
              {category.techs.length}
            </span>
          </div>

          <p className="text-xs opacity-50 mb-3">Tap a tool to see what it does</p>

          {/* Clickable tools */}
          <div className="flex flex-wrap gap-2">
            {category.techs.map((tech, i) => {
              const isOpen = open === i;
              return (
                <span
                  key={tech.name + i}
                  className="st-reveal inline-block"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateY(12px) scale(0.85)',
                    transition: `opacity 0.5s ease ${350 + i * 70}ms, transform 0.5s cubic-bezier(.3,.9,.3,1.3) ${350 + i * 70}ms`,
                  }}
                >
                  <button
                    type="button"
                    aria-pressed={isOpen}
                    onClick={() => {
                      if (isOpen) {
                        setOpen(null);
                      } else {
                        setOpen(i);
                        setLast(i);
                      }
                    }}
                    className="inline-block cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2"
                    style={
                      {
                        borderColor: isOpen ? primary : borderSoft,
                        backgroundColor: isOpen ? primary : `${text}08`,
                        color: isOpen ? colors.base : text,
                        '--tw-ring-color': primary,
                      } as React.CSSProperties
                    }
                  >
                    {tech.name}
                  </button>
                </span>
              );
            })}
          </div>

          {/* What the chosen tool does */}
          <div
            className="grid transition-[grid-template-rows,margin] duration-500 ease-out"
            style={{ gridTemplateRows: open !== null ? '1fr' : '0fr', marginTop: open !== null ? '1.25rem' : '0rem' }}
            aria-live="polite"
          >
            <div className="overflow-hidden">
              <div
                key={last}
                className="rounded-2xl border-l-4 p-4"
                style={{
                  borderColor: primary,
                  backgroundColor: `${primary}12`,
                  opacity: open !== null ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                }}
              >
                <p className="text-sm font-bold" style={{ color: primary }}>
                  {category.techs[last].name}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed opacity-80">{category.techs[last].note}</p>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

/* ---------- Page ---------- */

const StackPage = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState<number | 'all'>('all');

  const base = theme['base-100'];
  const text = theme['base-content'];
  const primary = theme.primary;
  const colors: Colors = {
    base,
    text,
    primary,
    borderSoft: `${text}18`,
    borderMid: `${text}30`,
  };

  // All different tool names (for the moving line and the numbers)
  const allTools = useMemo(() => {
    const set = new Set<string>();
    techStack.forEach((c) => c.techs.forEach((t) => set.add(t.name)));
    return Array.from(set);
  }, []);

  const visibleCategories = techStack
    .map((category, index) => ({ category, index }))
    .filter(({ index }) => filter === 'all' || filter === index);

  const stats = [
    { value: techStack.length, label: 'Skill groups', icon: Layers },
    { value: allTools.length, label: 'Tools I use', icon: Wrench },
    { value: learningPath.length, label: 'Learning now', icon: GraduationCap },
  ];

  return (
    <main
      className="min-h-screen pt-32 pb-20 relative"
      style={{ backgroundColor: base, color: text, overflowX: 'clip' }}
    >
      <SEO
        title="Gakenye Ndiritu | Tech Stack & Skills"
        description="Discover the full-stack technologies used by Gakenye Ndiritu, including React, TypeScript, Node.js, PostgreSQL, Drizzle ORM, React Native, and blockchain development."
        path="/tech"
      />

      <style>{`
        @keyframes st-rise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes st-word {
          from { transform: translateY(110%); }
          to   { transform: translateY(0); }
        }
        @keyframes st-blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(30px,-30px) scale(1.15); }
        }
        @keyframes st-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes st-float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-10px) rotate(4deg); }
        }
        @keyframes st-spin {
          to { transform: rotate(360deg); }
        }
        .st-rise { opacity: 0; animation: st-rise 0.8s cubic-bezier(.2,.7,.2,1) forwards; }
        .st-word { display: inline-block; animation: st-word 0.9s cubic-bezier(.2,.7,.2,1) both; }
        .st-blob { animation: st-blob 12s ease-in-out infinite; }
        .st-marquee { animation: st-marquee 40s linear infinite; }
        .st-marquee-wrap:hover .st-marquee { animation-play-state: paused; }
        .st-float { animation: st-float 6s ease-in-out infinite; }
        .st-spin { animation: st-spin 24s linear infinite; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        @media (prefers-reduced-motion: reduce) {
          .st-rise, .st-word, .st-blob, .st-marquee, .st-float, .st-spin {
            animation: none !important; opacity: 1 !important; transform: none !important;
          }
          .st-reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>

      {/* Big logo in the background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <img
          src={logoMain}
          alt=""
          aria-hidden="true"
          className="w-[120vw] h-[120vw] sm:w-[80vw] sm:h-[80vw] object-contain opacity-[0.03] select-none"
        />
      </div>

      {/* Small dots pattern at the top */}
      <div
        className="absolute inset-x-0 top-0 h-[40rem] pointer-events-none opacity-60"
        style={{
          backgroundImage: `radial-gradient(${text}26 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      {/* Background glow */}
      <div
        className="st-blob absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{ backgroundColor: primary }}
      />
      <div
        className="st-blob absolute top-[45rem] -left-24 w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: theme.secondary || primary, animationDelay: '-5s' }}
      />

      <div className="relative z-10">
        <PageTitle title="Tech Stack & Skills" />
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 space-y-20 md:space-y-28">
          {/* ---------- HEADER ---------- */}
          <header className="space-y-6">
            <div
              className="st-rise inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-md"
              style={{
                borderColor: `${primary}55`,
                backgroundColor: `${primary}12`,
                color: primary,
                animationDelay: '0.05s',
              }}
            >
              <Zap size={14} className="animate-pulse" />
              Certified Software Engineer
            </div>

            <h1
              className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.02]"
              aria-label="My tech stack"
            >
              {['My', 'tech', 'stack'].map((word, i) => (
                <span key={word} className="inline-block overflow-hidden align-bottom pb-[0.12em] mr-[0.25em]">
                  <span
                    className="st-word"
                    style={{
                      animationDelay: `${0.15 + i * 0.12}s`,
                      color: i === 2 ? primary : undefined,
                    }}
                  >
                    {word}
                  </span>
                </span>
              ))}
            </h1>

            <p
              className="st-rise max-w-2xl text-lg md:text-xl leading-relaxed opacity-70"
              style={{ animationDelay: '0.6s' }}
            >
              I am a full-stack engineer. I use the PERN stack and React Native to build strong
              apps that can grow, and that work on every device.
            </p>

            {/* Number cards */}
            <div
              className="st-rise grid grid-cols-3 gap-3 sm:gap-4 max-w-xl pt-2"
              style={{ animationDelay: '0.75s' }}
            >
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.label}
                    className="rounded-2xl border p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                    style={{ borderColor: colors.borderSoft, backgroundColor: `${text}06` }}
                  >
                    <span
                      className="grid place-items-center w-9 h-9 rounded-xl"
                      style={{ backgroundColor: `${primary}1f`, color: primary }}
                    >
                      <Icon size={18} />
                    </span>
                    <p className="mt-3 text-3xl font-extrabold leading-none">
                      <CountUp to={s.value} />
                    </p>
                    <p className="mt-1.5 text-xs sm:text-sm opacity-60">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </header>

          {/* ---------- MOVING LINE OF TOOLS ---------- */}
          <div
            className="st-marquee-wrap -mx-6 overflow-hidden border-y py-5"
            style={{
              borderColor: `${text}15`,
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            }}
            aria-hidden="true"
          >
            <div className="st-marquee flex w-max gap-12 whitespace-nowrap">
              {[...allTools, ...allTools].map((item, i) => (
                <span key={i} className="flex items-center gap-12 text-xl font-semibold opacity-45">
                  {item}
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                </span>
              ))}
            </div>
          </div>

          {/* ---------- SKILLS ---------- */}
          <section className="space-y-8">
            <Reveal>
              <div className="space-y-5">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">What I work with</h2>

                {/* Filter buttons */}
                <div
                  className="flex gap-2 overflow-x-auto no-scrollbar py-1 -my-1"
                  role="tablist"
                  aria-label="Choose a skill group"
                >
                  {[{ label: 'All', value: 'all' as const }, ...techStack.map((c, i) => ({ label: c.title, value: i }))].map(
                    (option) => {
                      const isActive = filter === option.value;
                      return (
                        <button
                          key={option.label}
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setFilter(option.value)}
                          className="shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                          style={{
                            borderColor: isActive ? primary : colors.borderMid,
                            backgroundColor: isActive ? primary : 'transparent',
                            color: isActive ? base : text,
                          }}
                        >
                          {option.label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </Reveal>

            <div key={String(filter)} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 items-start">
              {visibleCategories.map(({ category }, i) => (
                <CategoryCard key={category.title} category={category} index={i} colors={colors} />
              ))}
            </div>
          </section>

          {/* ---------- LEARNING ---------- */}
          <section className="space-y-10">
            <Reveal>
              <div className="flex items-center gap-4">
                <span
                  className="grid place-items-center w-12 h-12 rounded-2xl"
                  style={{ backgroundColor: `${primary}1a`, color: primary }}
                >
                  <BookOpen size={22} />
                </span>
                <div>
                  <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">What I am learning</h2>
                  <p className="mt-1 text-sm md:text-base opacity-60">I try to learn something new all the time.</p>
                </div>
              </div>
            </Reveal>

            <div className="grid lg:grid-cols-3 gap-5 md:gap-6">
              {learningPath.map((item, idx) => (
                <LearningCard key={item.lang} item={item} index={idx} colors={colors} />
              ))}
            </div>
          </section>

          {/* ---------- PHILOSOPHY ---------- */}
          <Reveal>
            <section
              className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] border-2 border-dashed p-8 sm:p-12 md:p-16 text-center"
              style={{ borderColor: colors.borderMid }}
            >
              {/* Slow spinning ring */}
              <div
                className="st-spin absolute -right-20 -top-20 w-64 h-64 rounded-full border-2 border-dashed opacity-20 pointer-events-none"
                style={{ borderColor: primary }}
              />
              <div
                className="absolute -left-24 -bottom-24 w-72 h-72 rounded-full blur-[110px] opacity-15 pointer-events-none"
                style={{ backgroundColor: primary }}
              />

              <div className="relative space-y-6 mb-12">
                <span
                  className="st-float inline-grid place-items-center w-14 h-14 rounded-2xl"
                  style={{ backgroundColor: `${primary}1a`, color: primary }}
                >
                  <Quote size={26} />
                </span>
                <h2 className="text-sm font-semibold opacity-50">How I think about my work</h2>
                <p className="text-xl sm:text-2xl md:text-3xl font-medium leading-snug max-w-3xl mx-auto">
                  "I want to keep getting better at what I do. Whether I am improving a website or
                  making a new mobile app, I write code to solve real problems."
                </p>
              </div>
            </section>
          </Reveal>
        </div>
      </div>

      <Footer />
    </main>
  );
};

/* ---------- One learning card ---------- */

const LearningCard = ({
  item,
  index,
  colors,
}: {
  item: (typeof learningPath)[number];
  index: number;
  colors: Colors;
}) => {
  const { ref, visible } = useInView(0.2);
  const { primary, text, borderSoft } = colors;

  return (
    <div
      ref={ref}
      className="st-reveal h-full"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(40px) scale(0.97)',
        transition: `opacity 0.8s ease ${index * 140}ms, transform 0.8s cubic-bezier(.2,.7,.2,1) ${index * 140}ms`,
      }}
    >
      <article
        onMouseMove={followMouse}
        className="group relative h-full overflow-hidden rounded-3xl border border-[color:var(--bd)] hover:border-[color:var(--hv)] p-6 sm:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_50px_-28px_var(--glow)]"
        style={
          {
            '--bd': borderSoft,
            '--hv': `${primary}77`,
            '--glow': `${primary}55`,
            '--mx': '50%',
            '--my': '50%',
            backgroundColor: `${text}05`,
          } as React.CSSProperties
        }
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(340px circle at var(--mx) var(--my), ${primary}22, transparent 45%)`,
          }}
        />

        <div className="relative space-y-4">
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${primary}18`, color: primary }}
          >
            {item.level}
          </span>

          <h3 className="text-2xl font-bold tracking-tight">{item.lang}</h3>

          <p className="text-sm sm:text-base opacity-65 leading-relaxed">{item.context}</p>

          {/* Bar that fills to show how far I have come */}
          <div className="flex gap-1.5 pt-2" aria-label={`Level ${item.step} of 4`}>
            {[0, 1, 2, 3].map((n) => (
              <span
                key={n}
                className="h-1.5 flex-1 rounded-full overflow-hidden"
                style={{ backgroundColor: `${text}14` }}
              >
                <span
                  className="block h-full w-full origin-left rounded-full"
                  style={{
                    backgroundColor: primary,
                    transform: visible && n < item.step ? 'scaleX(1)' : 'scaleX(0)',
                    transition: `transform 0.7s cubic-bezier(.2,.7,.2,1) ${500 + index * 140 + n * 160}ms`,
                  }}
                />
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default StackPage;