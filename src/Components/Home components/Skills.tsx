import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../ThemeContext';
import {
  Database, Layout, Settings, Infinity as ToolsIcon, Cpu,
  HardDrive, ChevronDown, ChevronUp, Sparkles,
  GraduationCap, MapPin, Briefcase, RefreshCw
} from 'lucide-react';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  useGetSkillsGroupedQuery,
  getSkillErrorMessage,
  type TSkill,
  type TSkillsGrouped,
} from '../../Features/Apis/Skills.Api';

/* ---------- Reveal ---------- */
type RevealProps = {
  children: React.ReactNode;
  from?: "up" | "left" | "right" | "zoom" | "blur";
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

/* ---------- Level label ---------- */
const levelLabel = (value: number) => {
  if (value >= 80) return "Very strong";
  if (value >= 60) return "Good";
  if (value >= 40) return "Growing";
  return "Learning";
};

/* ---------- Dynamic Lucide icon ---------- */
const DynamicIcon = ({ name, ...props }: { name: string } & Icons.LucideProps) => {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[name];
  return Icon ? <Icon {...props} /> : <Cpu {...props} />;
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
  const {
    data: grouped,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetSkillsGroupedQuery();

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

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-40"
        style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
      >
        <style>{`
          @keyframes skSpin { to { transform: rotate(360deg); } }
          @keyframes skSpinSlow { to { transform: rotate(-360deg); } }
          @keyframes skDotPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: .4; } }
        `}</style>
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed opacity-25"
            style={{ borderColor: theme.primary, animation: 'skSpin 5s linear infinite' }}
          />
          <div
            className="absolute inset-1.5 rounded-full border-2 border-t-transparent border-r-transparent"
            style={{
              borderColor: theme.primary,
              borderTopColor: "transparent",
              borderRightColor: "transparent",
              animation: 'skSpinSlow 1.6s linear infinite',
            }}
          />
          <div
            className="absolute inset-0 m-auto h-2 w-2 rounded-full"
            style={{ backgroundColor: theme.primary, animation: 'skDotPulse 1.4s ease-in-out infinite' }}
          />
        </div>
        <p className="text-sm opacity-50">Loading skills...</p>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-40 text-center"
        style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
      >
        <p className="text-lg font-semibold">Sorry, the skills could not load.</p>
        <p className="max-w-md text-sm opacity-60">
          {getSkillErrorMessage(error) || "Please refresh the page and try again."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
        >
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    );
  }

  /* ---------- Data ---------- */
  const groupMap: TSkillsGrouped = grouped?.data ?? {
    frontend: [], backend: [], database: [], devops: [], mobile: [], ai: [],
  };

  const all: TSkill[] = Object.values(groupMap).flat();

  const countFor = (id: string) =>
    id === 'all'
      ? all.length
      : (groupMap[id as keyof TSkillsGrouped]?.length ?? 0);

  const filtered: TSkill[] =
    activeCat === 'all'
      ? all
      : groupMap[activeCat as keyof TSkillsGrouped] ?? [];

  const visible: TSkill[] = showAll ? filtered : filtered.slice(0, FIRST_BATCH);
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
        /* ============ Reveal ============ */
        .sk-reveal { opacity: 0; transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1), filter .8s; will-change: transform, opacity, filter; }
        .sk-up    { transform: translateY(36px); }
        .sk-left  { transform: translateX(-50px); }
        .sk-right { transform: translateX(50px); }
        .sk-zoom  { transform: scale(.9) translateY(20px); }
        .sk-blur  { transform: translateY(20px); filter: blur(8px); }
        .sk-show  { opacity: 1; transform: none; filter: none; }

        /* ============ Headline flip ============ */
        @keyframes skWord { from { opacity: 0; transform: translateY(70%) rotate(3deg); } to { opacity: 1; transform: none; } }
        @keyframes skFlip { 0% { opacity: 0; transform: rotateX(-80deg) translateY(30%); } 100% { opacity: 1; transform: rotateX(0) translateY(0); } }
        .sk-mask { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; perspective: 800px; }
        .sk-word { display: inline-block; opacity: 0; animation: skWord .9s cubic-bezier(.2,.7,.2,1) forwards; }
        .sk-word-flip { display: inline-block; opacity: 0; transform-origin: 50% 100%; animation: skFlip .95s cubic-bezier(.2,.7,.2,1) forwards; }

        /* ============ Progress bar ============ */
        @keyframes skBarShine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes skTipPulse {
          0%,100% { transform: translate(50%, -50%) scale(1); box-shadow: 0 0 0 0 var(--accent-soft); }
          50% { transform: translate(50%, -50%) scale(1.25); box-shadow: 0 0 0 6px var(--accent-soft); }
        }
        .sk-bar { width: 0; transition: width 1.4s cubic-bezier(.2,.7,.2,1) .3s; position: relative; overflow: hidden; background: linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, white)); }
        .sk-show .sk-bar { width: var(--w); }
        .sk-bar::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          animation: skBarShine 2.4s linear infinite;
        }
        .sk-bar-tip {
          position: absolute; right: 0; top: 50%;
          width: 8px; height: 8px; border-radius: 999px;
          background: var(--accent);
          opacity: 0;
          transition: opacity .3s .6s;
          animation: skTipPulse 1.8s ease-in-out infinite;
        }
        .sk-show .sk-bar-tip { opacity: 1; }

        /* ============ Card ============ */
        .sk-card { border-color: var(--text-line); background-color: var(--text-soft); position: relative; overflow: hidden; transition: transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .5s, border-color .3s; }
        .sk-card:hover { border-color: var(--accent); transform: translateY(-6px); box-shadow: 0 24px 48px -22px var(--accent-soft), 0 10px 20px -12px rgba(0,0,0,.15); }
        .sk-card::after {
          content: ""; position: absolute; inset: auto 0 0 0; height: 3px;
          background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .5s ease;
        }
        .sk-card:hover::after { transform: scaleX(1); }
        .sk-card::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.08) 45%, transparent 60%);
          transform: translateX(-120%);
          transition: transform .9s cubic-bezier(.2,.7,.2,1);
          pointer-events: none;
        }
        .sk-card:hover::before { transform: translateX(120%); }

        .sk-icon-wrap { position: relative; transition: transform .5s cubic-bezier(.3,1.6,.5,1); }
        .sk-card:hover .sk-icon-wrap { transform: scale(1.06) rotate(-6deg); }
        .sk-icon-wrap::after {
          content: ""; position: absolute; inset: -6px; border-radius: inherit;
          background: radial-gradient(circle at center, var(--accent-soft), transparent 70%);
          opacity: 0; transform: scale(.7);
          transition: opacity .4s, transform .5s cubic-bezier(.3,1.6,.5,1);
          z-index: -1;
        }
        .sk-card:hover .sk-icon-wrap::after { opacity: 1; transform: scale(1.05); }

        .sk-card .sk-logo { transition: transform .5s cubic-bezier(.3,1.6,.5,1), filter .4s; filter: grayscale(1); }
        .sk-card:hover .sk-logo { transform: scale(1.25) rotate(-8deg); filter: grayscale(0); }

        /* ============ Pills ============ */
        @keyframes skPillShine {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
        .sk-pill { position: relative; overflow: hidden; transition: transform .3s, background-color .3s, color .3s, border-color .3s, box-shadow .3s; }
        .sk-pill:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -10px var(--accent-soft); }
        .sk-pill::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 40%, rgba(255,255,255,.18) 50%, transparent 60%);
          transform: translateX(-120%);
          opacity: 0; pointer-events: none;
        }
        .sk-pill:hover::before { opacity: 1; animation: skPillShine .9s ease; }
        @keyframes skPop { from { transform: scale(.85); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .sk-pill-active { animation: skPop .35s cubic-bezier(.3,1.5,.5,1); }

        /* ============ Ambient ============ */
        @keyframes skOrbit { to { transform: rotate(360deg); } }
        .sk-orbit { animation: skOrbit 45s linear infinite; }
        @keyframes skOrbitDot { to { transform: rotate(360deg); } }
        .sk-orbit-dot { animation: skOrbitDot 18s linear infinite; transform-origin: center; }

        @keyframes skDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px,30px); } }
        .sk-drift { animation: skDrift 12s ease-in-out infinite; }

        @keyframes skFloat1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-18px); } }
        @keyframes skFloat2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-16px,22px); } }
        @keyframes skFloat3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(12px,16px); } }
        .sk-float-1 { animation: skFloat1 11s ease-in-out infinite; }
        .sk-float-2 { animation: skFloat2 14s ease-in-out infinite; }
        .sk-float-3 { animation: skFloat3 9s ease-in-out infinite; }

        @keyframes skPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); } 50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } }
        .sk-pulse { animation: skPulse 2.2s ease-out infinite; }

        /* ============ Bottom info strip icons ============ */
        @keyframes skBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .sk-bob-hover { transition: transform .4s cubic-bezier(.3,1.6,.5,1); }
        .sk-info-item:hover .sk-bob-hover { animation: skBob 1.4s ease-in-out infinite; }

        /* ============ Reduce motion ============ */
        @media (prefers-reduced-motion: reduce) {
          .sk-reveal { opacity: 1; transform: none; filter: none; transition: none; }
          .sk-word, .sk-word-flip { opacity: 1; animation: none; transform: none; }
          .sk-bar { width: var(--w); transition: none; }
          .sk-bar::before, .sk-bar-tip { animation: none; opacity: 1; }
          .sk-orbit, .sk-orbit-dot, .sk-drift, .sk-pulse, .sk-pill-active,
          .sk-float-1, .sk-float-2, .sk-float-3, .sk-bob-hover { animation: none; }
          .sk-card, .sk-card:hover, .sk-card::before, .sk-card::after { transition: none; transform: none; }
          .sk-card .sk-logo, .sk-card:hover .sk-logo, .sk-icon-wrap { transition: none; transform: none; }
        }
      `}</style>

      {/* Ambient background — original orbit + drift */}
      <div
        className="sk-orbit pointer-events-none absolute -left-52 top-0 h-[34rem] w-[34rem] rounded-full border-2 border-dashed opacity-[0.1]"
        style={{ borderColor: theme.primary }}
      >
        <div
          className="sk-orbit-dot absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: theme.primary, transformOrigin: '0 17rem' }}
        />
      </div>
      <div
        className="sk-drift pointer-events-none absolute -right-32 bottom-20 h-80 w-80 rounded-full opacity-10 blur-[120px]"
        style={{ backgroundColor: theme.primary }}
      />

      {/* Floating ambient dots */}
      <div
        className="sk-float-1 pointer-events-none absolute left-[8%] top-[30%] h-2 w-2 rounded-full opacity-40"
        style={{ backgroundColor: theme.primary }}
      />
      <div
        className="sk-float-2 pointer-events-none absolute right-[12%] top-[20%] h-1.5 w-1.5 rounded-full opacity-30"
        style={{ backgroundColor: theme.primary }}
      />
      <div
        className="sk-float-3 pointer-events-none absolute left-[20%] bottom-[15%] h-2.5 w-2.5 rounded-full opacity-20"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-16">
        {/* HEADER */}
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

        {/* FILTER PILLS */}
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
                    style={{ backgroundColor: active ? `${theme["base-100"]}33` : "var(--accent-soft)" }}
                  >
                    {countFor(cat.id)}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* SKILL CARDS */}
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
              const level = Number(item.proficiency) || 0;
              const techName = item.technology?.name ?? 'Unknown';
              const iconName = item.technology?.iconName;
              return (
                <Reveal key={item.id} from={i === 0 ? "zoom" : "blur"} delay={(i % 8) * 70}>
                  <div className="sk-card relative h-full overflow-hidden rounded-3xl border p-6">
                    <div className="mb-5 flex items-center gap-4">
                      <div
                        className="sk-icon-wrap grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                        style={{ backgroundColor: "var(--accent-soft)", color: theme.primary }}
                      >
                        {iconName ? (
                          <DynamicIcon name={iconName} size={24} className="sk-logo" />
                        ) : (
                          <Cpu size={22} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-bold">{techName}</p>
                        <p className="text-xs opacity-55">{levelLabel(level)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative h-2 flex-1 rounded-full" style={{ backgroundColor: "var(--text-line)" }}>
                        <div
                          className="sk-bar h-full rounded-full"
                          style={{ "--w": `${level}%` } as React.CSSProperties}
                        >
                          <span className="sk-bar-tip" />
                        </div>
                      </div>
                      <span className="w-10 text-right text-sm font-semibold tabular-nums" style={{ color: theme.primary }}>
                        {level}%
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}

        {/* SHOW MORE */}
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

        {/* BOTTOM INFO */}
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
                <div key={x.label} className="sk-info-item flex items-center gap-3">
                  <span
                    className="sk-bob-hover grid h-10 w-10 place-items-center rounded-xl"
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