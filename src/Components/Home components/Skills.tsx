import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../ThemeContext';
import {
  Database, Layout, Settings, Infinity as ToolsIcon, Cpu,
  HardDrive, ChevronDown, ChevronUp, Sparkles,
  GraduationCap, MapPin, Briefcase
} from 'lucide-react';
import { useGetTechSkillsQuery } from '../../Features/Apis/Skills.Api';

/* ---------- Helper: plays an animation when scrolled into view ---------- */
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
      className={`sk-reveal sk-${from} ${show ? "sk-show" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ---------- Simple words for the skill level ---------- */
const levelLabel = (value: number) => {
  if (value >= 80) return "Very strong";
  if (value >= 60) return "Good";
  if (value >= 40) return "Growing";
  return "Learning";
};

const categories = [
  { id: 'all', label: 'All skills', icon: <Sparkles size={16} /> },
  { id: 'frontend', label: 'Screens (Frontend)', icon: <Layout size={16} /> },
  { id: 'backend', label: 'Servers (Backend)', icon: <Settings size={16} /> },
  { id: 'database', label: 'Data (Database)', icon: <Database size={16} /> },
  { id: 'devops', label: 'Tools & Hosting', icon: <ToolsIcon size={16} /> },
];

const FIRST_BATCH = 8;

const Skills = () => {
  const { theme } = useTheme();
  const { data: techSkills, isLoading, isError } = useGetTechSkillsQuery();

  const [activeCat, setActiveCat] = useState<string>('all');
  const [showAll, setShowAll] = useState<boolean>(false);

  const rootStyle = {
    backgroundColor: theme["base-100"],
    color: theme["base-content"],
    "--accent": theme.primary,
    "--accent-soft": `${theme.primary}1f`,
    "--accent-line": `${theme.primary}33`,
    "--text-soft": `${theme["base-content"]}0d`,
    "--text-line": `${theme["base-content"]}1a`,
  } as React.CSSProperties;

  /* ---------- Loading and error states ---------- */
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-40"
        style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
      >
        <div
          className="h-14 w-14 animate-spin rounded-full border-2 border-t-transparent"
          style={{ borderColor: theme.primary, borderTopColor: "transparent" }}
        />
        <p className="text-sm opacity-50">Loading skills...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="py-40 text-center"
        style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
      >
        <p className="text-lg font-semibold">Sorry, the skills could not load.</p>
        <p className="mt-2 text-sm opacity-60">Please refresh the page and try again.</p>
      </div>
    );
  }

  const all = techSkills || [];
  const countFor = (id: string) => (id === 'all' ? all.length : all.filter((t) => t.category === id).length);
  const filtered = activeCat === 'all' ? all : all.filter((t) => t.category === activeCat);
  const visible = showAll ? filtered : filtered.slice(0, FIRST_BATCH);
  const hasMore = filtered.length > FIRST_BATCH;

  const pickCategory = (id: string) => {
    setActiveCat(id);
    setShowAll(false);
  };

  return (
    <section
      id="skills"
      className="relative overflow-hidden py-24 transition-colors duration-500"
      style={rootStyle}
    >
      <style>{`
        /* Scroll reveal */
        .sk-reveal { opacity: 0; transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1); will-change: transform, opacity; }
        .sk-up    { transform: translateY(36px); }
        .sk-left  { transform: translateX(-50px); }
        .sk-right { transform: translateX(50px); }
        .sk-zoom  { transform: scale(.9) translateY(20px); }
        .sk-show  { opacity: 1; transform: none; }

        /* Headline words rise on load */
        @keyframes skWord { from { opacity: 0; transform: translateY(70%) rotate(3deg); } to { opacity: 1; transform: none; } }
        .sk-mask { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; }
        .sk-word { display: inline-block; opacity: 0; animation: skWord .9s cubic-bezier(.2,.7,.2,1) forwards; }

        /* Skill bar fills when the card appears */
        .sk-bar { width: 0; transition: width 1.4s cubic-bezier(.2,.7,.2,1) .3s; }
        .sk-show .sk-bar { width: var(--w); }

        /* Skill cards */
        .sk-card { border-color: var(--text-line); background-color: var(--text-soft); }
        .sk-card:hover { border-color: var(--accent); }
        .sk-card .sk-logo { transition: transform .5s cubic-bezier(.3,1.6,.5,1), filter .4s; filter: grayscale(1); }
        .sk-card:hover .sk-logo { transform: scale(1.25) rotate(-8deg); filter: grayscale(0); }
        .sk-card::after {
          content: ""; position: absolute; inset: auto 0 0 0; height: 3px;
          background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .5s ease;
        }
        .sk-card:hover::after { transform: scaleX(1); }

        /* Filter pills */
        .sk-pill { transition: transform .3s, background-color .3s, color .3s, border-color .3s; }
        .sk-pill:hover { transform: translateY(-2px); }
        @keyframes skPop { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .sk-pill-active { animation: skPop .35s cubic-bezier(.3,1.5,.5,1); }

        /* Background */
        @keyframes skOrbit { to { transform: rotate(360deg); } }
        .sk-orbit { animation: skOrbit 45s linear infinite; }
        @keyframes skDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px,30px); } }
        .sk-drift { animation: skDrift 12s ease-in-out infinite; }

        /* Status dot */
        @keyframes skPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); } 50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } }
        .sk-pulse { animation: skPulse 2.2s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .sk-reveal { opacity: 1; transform: none; transition: none; }
          .sk-word { opacity: 1; animation: none; }
          .sk-bar { width: var(--w); transition: none; }
          .sk-orbit, .sk-drift, .sk-pulse, .sk-pill-active { animation: none; }
          .sk-card .sk-logo, .sk-card:hover .sk-logo { transition: none; }
        }
      `}</style>

      {/* Background shapes */}
      <div
        className="sk-orbit pointer-events-none absolute -left-52 top-0 h-[34rem] w-[34rem] rounded-full border-2 border-dashed opacity-[0.1]"
        style={{ borderColor: theme.primary }}
      />
      <div
        className="sk-drift pointer-events-none absolute -right-32 bottom-20 h-80 w-80 rounded-full opacity-10 blur-[120px]"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-16">
        {/* ---------- HEADER ---------- */}
        <div className="mb-12 text-center lg:text-left">
          <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
            {["The", "tools", "I"].map((w, i) => (
              <span key={w} className="sk-mask mr-[0.25em]">
                <span className="sk-word" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>{w}</span>
              </span>
            ))}
            <span className="sk-mask">
              <span className="sk-word" style={{ animationDelay: "0.5s", color: theme.primary }}>use.</span>
            </span>
          </h2>
          <Reveal delay={500}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed opacity-65 lg:mx-0">
              These are the languages and tools I use to build apps. The bar shows how
              strong I am in each one.
            </p>
          </Reveal>
        </div>

        {/* ---------- FILTER PILLS ---------- */}
        <Reveal delay={200}>
          <div className="mb-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            {categories.map((cat) => {
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => pickCategory(cat.id)}
                  className={`sk-pill inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold ${active ? "sk-pill-active" : ""}`}
                  style={{
                    backgroundColor: active ? theme.primary : "transparent",
                    color: active ? theme["base-100"] : theme["base-content"],
                    borderColor: active ? theme.primary : `${theme["base-content"]}26`,
                  }}
                >
                  {cat.icon}
                  {cat.label}
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{
                      backgroundColor: active ? `${theme["base-100"]}33` : "var(--accent-soft)",
                    }}
                  >
                    {countFor(cat.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* ---------- SKILL CARDS ---------- */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 opacity-40">
            <HardDrive size={32} />
            <p className="text-sm font-medium">No skills added here yet.</p>
          </div>
        ) : (
          <div
            key={`${activeCat}-${showAll}`}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {visible.map((item, i) => {
              const level = Number(item.skill?.proficiency) || 0;
              return (
                <Reveal key={item.id} from="zoom" delay={(i % 8) * 70}>
                  <div className="sk-card relative h-full overflow-hidden rounded-3xl border p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl">
                    <div className="mb-5 flex items-center gap-4">
                      <div
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                        style={{ backgroundColor: "var(--accent-soft)", color: theme.primary }}
                      >
                        {item.icon?.fileUrl ? (
                          <img
                            src={item.icon.fileUrl}
                            alt={item.name}
                            className="sk-logo h-6 w-6 object-contain"
                          />
                        ) : (
                          <Cpu size={22} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold">{item.name}</p>
                        <p className="text-xs opacity-55">{levelLabel(level)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className="h-2 flex-1 overflow-hidden rounded-full"
                        style={{ backgroundColor: "var(--text-line)" }}
                      >
                        <div
                          className="sk-bar h-full rounded-full"
                          style={{ "--w": `${level}%`, backgroundColor: theme.primary } as React.CSSProperties}
                        />
                      </div>
                      <span className="w-10 text-right text-sm font-semibold" style={{ color: theme.primary }}>
                        {level}%
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* ---------- SHOW MORE ---------- */}
        {hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="group inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              {showAll ? (
                <>
                  <ChevronUp size={16} className="transition-transform group-hover:-translate-y-0.5" />
                  Show fewer
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                  Show all {filtered.length} skills
                </>
              )}
            </button>
          </div>
        )}

        {/* ---------- BOTTOM INFO ---------- */}
        <Reveal delay={100}>
          <div
            className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-dashed px-8 py-6"
            style={{ borderColor: "var(--accent-line)" }}
          >
            <div className="flex flex-wrap items-center gap-8">
              {[
                { icon: <GraduationCap size={18} />, label: "School", val: "Laikipia University" },
                { icon: <MapPin size={18} />, label: "Place", val: "Nyahururu, Kenya" },
                { icon: <Briefcase size={18} />, label: "Job", val: "Full-Stack Software Engineer" },
              ].map((x) => (
                <div key={x.label} className="flex items-center gap-3">
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl"
                    style={{ backgroundColor: "var(--accent-soft)", color: theme.primary }}
                  >
                    {x.icon}
                  </span>
                  <div>
                    <p className="text-xs opacity-50">{x.label}</p>
                    <p className="text-sm font-semibold">{x.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="sk-pulse h-2.5 w-2.5 rounded-full bg-green-500" />
              Ready to work
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default Skills;