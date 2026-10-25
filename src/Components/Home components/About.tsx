import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../ThemeContext';
import {
  Target, Award, ShieldCheck, Cpu, Cloud,
  GraduationCap, MapPin, Briefcase, BookOpen,
  User2Icon, Sparkles,
} from 'lucide-react';

/* ---------- Small helper: plays an animation when scrolled into view ---------- */
type RevealProps = {
  children: React.ReactNode;
  from?: "up" | "left" | "right" | "zoom";
  delay?: number;
  className?: string;
};

const Reveal = ({ children, from = "up", delay = 0, className = "" }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`ab-reveal ab-${from} ${show ? "ab-show" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ---------- Card with a soft light that follows the mouse ---------- */
type CardProps = { children: React.ReactNode; className?: string };

const Card = ({ children, className = "" }: CardProps) => {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      onMouseMove={onMove}
      className={`ab-card group relative h-full overflow-hidden rounded-[1.75rem] border p-7 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl backdrop-blur-sm ${className}`}
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

/* ---------- Content (simple English) ---------- */
const story = [
  {
    icon: <GraduationCap size={18} />,
    text: "I am a final-year Computer Science student at Laikipia University. I want to build apps that are easy to use, work well, and solve real problems.",
  },
  {
    icon: <MapPin size={18} />,
    text: "I work from Nyahururu, Kenya. I mix what I learn in class with real projects, so what I build is safe, fast and ready to grow.",
  },
  {
    icon: <Briefcase size={18} />,
    text: "Right now I focus on three things: blockchain to keep data safe, AI to help systems make smart choices, and cloud tools so apps stay fast when many people use them.",
  },
];

const chips = ["Blockchain", "AI", "Cloud", "Web apps", "Mobile apps"];

const skills = [
  {
    icon: <Target size={26} />,
    title: "People first",
    desc: "I make screens that are clear and simple, so every click makes sense.",
  },
  {
    icon: <ShieldCheck size={26} />,
    title: "Safe with blockchain",
    desc: "Smart contracts and secure records keep data honest and hard to change.",
  },
  {
    icon: <Cpu size={26} />,
    title: "Smart with AI",
    desc: "AI features that learn from users and do slow, boring tasks for you.",
  },
  {
    icon: <Cloud size={26} />,
    title: "Ready to grow",
    desc: "Cloud setups that stay online and stay fast as more people join.",
  },
];

const facts = [
  { label: "Job", val: "Software Engineer" },
  { label: "School", val: "Laikipia University" },
  { label: "Place", val: "Nyahururu, Kenya" },
  { label: "Skills", val: "AI, Cloud, Blockchain" },
  { label: "How I work", val: "Clear code, steady effort" },
];

const certs = [
  { title: "Teach2Give", sub: "Software Development Program" },
  { title: "SoloLearn", sub: "Web Development Basics" },
];

/* ---------- Main section ---------- */
const About = () => {
  const { theme } = useTheme();

  const rootStyle = {
    backgroundColor: theme["base-100"],
    color: theme["base-content"],
    "--accent": theme.primary,
    "--accent-soft": `${theme.primary}1f`,
    "--accent-line": `${theme.primary}33`,
    "--text-line": `${theme["base-content"]}14`,
  } as React.CSSProperties;

  return (
    <section
      id="about"
      className="relative overflow-hidden py-24 transition-colors duration-500"
      style={rootStyle}
    >
      <style>{`
        /* Scroll reveal */
        .ab-reveal { opacity: 0; transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); will-change: transform, opacity; }
        .ab-up    { transform: translateY(44px); }
        .ab-left  { transform: translateX(-56px); }
        .ab-right { transform: translateX(56px); }
        .ab-zoom  { transform: scale(.92) translateY(24px); }
        .ab-show  { opacity: 1; transform: none; }

        /* Headline words rise one after another on page load */
        @keyframes abWord {
          from { opacity: 0; transform: translateY(70%) rotate(3deg); }
          to   { opacity: 1; transform: none; }
        }
        .ab-mask { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; }
        .ab-word { display: inline-block; opacity: 0; animation: abWord .9s cubic-bezier(.2,.7,.2,1) forwards; }

        /* Underline under the headline draws itself */
        @keyframes abDraw { to { stroke-dashoffset: 0; } }
        .ab-underline path { stroke-dasharray: 400; stroke-dashoffset: 400; animation: abDraw 1.2s ease-out 1.1s forwards; }

        /* Cards */
        .ab-card { border-color: var(--accent-line); background-color: var(--accent-soft); background-blend-mode: normal; }
        .ab-card::before {
          content: ""; position: absolute; inset: 0; opacity: 0; transition: opacity .4s;
          background: radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), var(--accent-soft), transparent 70%);
        }
        .ab-card:hover::before { opacity: 1; }
        .ab-card::after {
          content: ""; position: absolute; left: 0; bottom: 0; height: 3px; width: 0;
          background: var(--accent); transition: width .6s ease;
        }
        .ab-card:hover::after { width: 100%; }

        /* Icons wiggle on card hover */
        @keyframes abBob { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-5px) rotate(-6deg); } }
        .ab-card:hover .ab-icon { animation: abBob 1.1s ease-in-out infinite; }

        /* Chips pop in */
        @keyframes abPop { from { opacity: 0; transform: scale(.6); } to { opacity: 1; transform: scale(1); } }
        .ab-chip { opacity: 0; animation: abPop .5s cubic-bezier(.3,1.5,.5,1) forwards; }
        .ab-chip:hover { transform: translateY(-3px); }

        /* Fact rows */
        .ab-row { transition: background-color .3s, transform .3s; }
        .ab-row:hover { background-color: var(--accent-soft); transform: translateX(4px); }

        /* Story guide line */
        .ab-story { position: relative; }
        .ab-story::before {
          content: ""; position: absolute; left: 15px; top: 6px; bottom: 6px;
          width: 2px; background: linear-gradient(to bottom, var(--accent-soft), transparent);
          border-radius: 2px;
        }

        /* Background */
        @keyframes abOrbit { to { transform: rotate(360deg); } }
        .ab-orbit { animation: abOrbit 40s linear infinite; }
        @keyframes abDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
        .ab-drift { animation: abDrift 12s ease-in-out infinite; }

        /* Live dot */
        @keyframes abPulse { 0%,100% { box-shadow: 0 0 0 0 var(--accent-line); } 50% { box-shadow: 0 0 0 8px transparent; } }
        .ab-pulse { animation: abPulse 2.2s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .ab-reveal { opacity: 1; transform: none; transition: none; }
          .ab-word, .ab-chip { opacity: 1; animation: none; }
          .ab-underline path { stroke-dashoffset: 0; animation: none; }
          .ab-orbit, .ab-drift, .ab-pulse, .ab-card:hover .ab-icon { animation: none; }
        }
      `}</style>

      {/* Background shapes */}
      <div
        className="ab-orbit pointer-events-none absolute -right-48 -top-20 h-[36rem] w-[36rem] rounded-full border-2 border-dashed opacity-[0.12]"
        style={{ borderColor: theme.primary }}
      />
      <div
        className="ab-drift pointer-events-none absolute -left-32 bottom-10 h-80 w-80 rounded-full opacity-10 blur-[120px]"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-16">
        {/* ---------- HEADER ---------- */}
        <div className="mb-14 text-center lg:text-left">
          {/* Status chip */}
          <div className="mb-5 inline-flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={{ borderColor: `${theme.primary}44`, backgroundColor: `${theme.primary}12`, color: theme.primary }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Available for work
            </span>
            <p className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: theme.primary }}>
              <User2Icon size={16} /> About me
            </p>
          </div>

          <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
            {["I", "build", "software"].map((w, i) => (
              <span key={w} className="ab-mask mr-[0.25em]">
                <span className="ab-word" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>{w}</span>
              </span>
            ))}
            <br />
            {["people", "can"].map((w, i) => (
              <span key={w} className="ab-mask mr-[0.25em]">
                <span className="ab-word" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>{w}</span>
              </span>
            ))}
            <span className="relative inline-block">
              <span className="ab-mask">
                <span className="ab-word" style={{ animationDelay: "0.75s", color: theme.primary }}>trust.</span>
              </span>
              <svg
                className="ab-underline absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M2 8 C 50 2, 100 12, 198 4" stroke={theme.primary} strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h2>

          <Reveal delay={600}>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed opacity-65 md:text-xl lg:mx-0">
              I use blockchain, AI and the cloud to build apps that are safe, smart and fast.
            </p>
          </Reveal>
        </div>

        {/* ---------- BENTO GRID ---------- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
          {/* My story */}
          <Reveal from="left" className="md:col-span-2 lg:col-span-8 lg:row-span-2">
            <Card>
              <div className="mb-8 flex items-center gap-3">
                <span
                  className="ab-icon grid h-11 w-11 place-items-center rounded-2xl"
                  style={{ backgroundColor: "var(--accent-soft)", color: theme.primary }}
                >
                  <BookOpen size={22} />
                </span>
                <h3 className="text-2xl font-bold">My story</h3>
              </div>

              <div className="ab-story space-y-6 pl-10">
                {story.map((s, i) => (
                  <div key={i} className="relative flex gap-4">
                    <span
                      className="ab-pulse absolute -left-10 top-0 grid h-8 w-8 shrink-0 place-items-center rounded-full"
                      style={{
                        backgroundColor: theme.primary,
                        color: theme["base-100"],
                        animationDelay: `${i * 0.6}s`,
                      }}
                    >
                      {s.icon}
                    </span>
                    <p className="max-w-2xl text-base leading-relaxed opacity-80 md:text-lg">
                      {s.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Focus chips */}
              <div className="mt-10">
                <p
                  className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] opacity-55"
                >
                  <Sparkles size={12} style={{ color: theme.primary }} />
                  Focus areas
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {chips.map((c, i) => (
                    <span
                      key={c}
                      className="ab-chip cursor-default rounded-full border px-4 py-1.5 text-sm font-medium transition-transform duration-300"
                      style={{ borderColor: "var(--accent-line)", animationDelay: `${0.4 + i * 0.1}s` }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </Reveal>

          {/* Quick facts */}
          <Reveal from="right" className="lg:col-span-4">
            <Card>
              <h3 className="mb-5 text-xl font-bold">Quick facts</h3>
              <dl className="space-y-1">
                {facts.map((f) => (
                  <div
                    key={f.label}
                    className="ab-row flex items-center justify-between gap-4 rounded-xl px-3 py-2.5"
                  >
                    <dt className="text-sm opacity-55">{f.label}</dt>
                    <dd className="text-right text-sm font-semibold">{f.val}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Reveal>

          {/* Certificates */}
          <Reveal from="right" delay={120} className="lg:col-span-4">
            <Card>
              <h3 className="mb-5 text-xl font-bold">Certificates</h3>
              <div className="space-y-4">
                {certs.map((c) => (
                  <div key={c.title} className="group/cert flex items-center gap-4">
                    <div
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-transform duration-700 group-hover/cert:rotate-[360deg]"
                      style={{ backgroundColor: "var(--accent-soft)", color: theme.primary }}
                    >
                      <Award size={22} />
                    </div>
                    <div>
                      <p className="font-bold">{c.title}</p>
                      <p className="text-sm opacity-60">{c.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          {/* Four skill cards */}
          {skills.map((s, i) => (
            <Reveal key={s.title} from="zoom" delay={i * 120} className="lg:col-span-3">
              <Card>
                <div
                  className="ab-icon mb-4 inline-grid h-12 w-12 place-items-center rounded-2xl"
                  style={{ backgroundColor: "var(--accent-soft)", color: theme.primary }}
                >
                  {s.icon}
                </div>
                <p className="text-lg font-bold">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed opacity-65">{s.desc}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;