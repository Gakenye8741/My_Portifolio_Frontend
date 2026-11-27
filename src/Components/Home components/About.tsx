import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import {
  Target, ShieldCheck, Cpu, Cloud,
  GraduationCap, MapPin, Briefcase,
  User2Icon, Sparkles,
} from 'lucide-react';

/* ---------- Types ---------- */
interface StoryItem {
  icon: React.ReactNode;
  text: string;
  n: string;
}

interface SkillItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

type TimelineItem =
  | { kind: 'story'; side: 'left' | 'right'; data: StoryItem }
  | { kind: 'skill'; side: 'left' | 'right'; data: SkillItem };

interface CardProps {
  children: React.ReactNode;
}

interface NodeProps {
  item: TimelineItem;
}

/* ---------- Content ---------- */
const story: StoryItem[] = [
  {
    icon: <GraduationCap size={16} />,
    text: "A recent Computer Science graduate of Laikipia University, I channel that foundation into applications that feel intuitive, perform reliably, and address problems that genuinely matter.",
    n: "01",
  },
  {
    icon: <MapPin size={16} />,
    text: "Based in Nyahururu, Kenya, I bridge academic insight with hands-on craftsmanship — ensuring every product I deliver is secure by design, swift in execution, and poised to scale.",
    n: "02",
  },
  {
    icon: <Briefcase size={16} />,
    text: "My current focus converges on three pillars: blockchain for tamper-proof integrity, artificial intelligence for systems that reason and adapt, and cloud architecture that sustains performance under real-world demand.",
    n: "03",
  },
];

const chips: string[] = ["Blockchain", "AI", "Cloud", "Web apps", "Mobile apps"];

const skills: SkillItem[] = [
  {
    icon: <Target size={20} />,
    title: "People first",
    desc: "Interfaces thoughtfully composed — every interaction feels inevitable, every click carries purpose.",
  },
  {
    icon: <ShieldCheck size={20} />,
    title: "Safe with blockchain",
    desc: "Smart contracts and immutable ledgers preserve data integrity with cryptographic certainty.",
  },
  {
    icon: <Cpu size={20} />,
    title: "Smart with AI",
    desc: "Intelligent features that observe patterns, learn from behavior, and quietly automate the mundane.",
  },
  {
    icon: <Cloud size={20} />,
    title: "Ready to grow",
    desc: "Cloud foundations engineered for resilience — steady under load, graceful as demand multiplies.",
  },
];

/* ---------- Card ---------- */
const Card: React.FC<CardProps> = ({ children }) => {
  const onMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div
      onMouseMove={onMove}
      className="ab-card group relative h-full w-full overflow-hidden rounded-2xl border p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};

/* ---------- Content renderers ---------- */
const StoryContent: React.FC<{ item: StoryItem }> = ({ item }) => (
  <div>
    <div className="mb-2 flex items-center justify-between gap-3">
      <span
        className="text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: 'var(--accent)' }}
      >
        Chapter {item.n}
      </span>
      <span className="text-3xl font-black leading-none opacity-[0.08]">{item.n}</span>
    </div>
    <p className="text-sm leading-relaxed opacity-85">{item.text}</p>
    {item.n === "03" && (
      <div className="mt-4">
        <p className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] opacity-55">
          <Sparkles size={11} style={{ color: 'var(--accent)' }} />
          Focus areas
        </p>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span
              key={c}
              className="cursor-default rounded-full border px-2.5 py-1 text-xs font-medium transition-transform duration-300 hover:-translate-y-0.5"
              style={{ borderColor: 'var(--accent-line)' }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

const SkillContent: React.FC<{ item: SkillItem }> = ({ item }) => (
  <div>
    <div
      className="ab-icon mb-3 inline-grid h-9 w-9 place-items-center rounded-xl"
      style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
    >
      {item.icon}
    </div>
    <p className="text-sm font-bold">{item.title}</p>
    <p className="mt-1 text-xs leading-relaxed opacity-65">{item.desc}</p>
  </div>
);

/* ---------- Node ---------- */
const Node: React.FC<NodeProps> = ({ item }) => {
  if (item.kind === 'story') {
    return (
      <span
        className="ab-pulse grid h-10 w-10 place-items-center rounded-full"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'var(--bg)',
          boxShadow: `0 0 0 5px var(--accent-soft), 0 0 20px var(--accent-line)`,
        }}
      >
        {item.data.icon}
      </span>
    );
  }
  return (
    <span
      className="block h-2.5 w-2.5 rounded-full"
      style={{
        backgroundColor: 'var(--accent)',
        boxShadow: `0 0 0 3px var(--accent-soft)`,
      }}
    />
  );
};

/* ---------- Main ---------- */
const About: React.FC = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();
  const timelineRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 0.85', 'end 0.15'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const headTop = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);
  const headOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  const rootStyle: React.CSSProperties & Record<string, string> = {
    backgroundColor: theme['base-100'],
    color: theme['base-content'],
    '--accent': theme.primary,
    '--accent-soft': `${theme.primary}1a`,
    '--accent-line': `${theme.primary}33`,
    '--bg': theme['base-100'],
  };

  const items: TimelineItem[] = [
    { kind: 'story', side: 'left', data: story[0] },
    { kind: 'story', side: 'right', data: story[1] },
    { kind: 'story', side: 'left', data: story[2] },
    ...skills.map((s, i): TimelineItem => ({
      kind: 'skill',
      side: i % 2 === 0 ? 'right' : 'left',
      data: s,
    })),
  ];

  const renderCard = (item: TimelineItem): React.ReactNode => {
    switch (item.kind) {
      case 'story':
        return <StoryContent item={item.data} />;
      case 'skill':
        return <SkillContent item={item.data} />;
    }
  };

  const cardMotion = (enterFrom: 'left' | 'right') => {
    if (reduce) return {};
    return {
      initial: { opacity: 0, x: enterFrom === 'left' ? 24 : -24 },
      whileInView: { opacity: 1, x: 0 },
      viewport: { once: true, amount: 0.15 },
      transition: { duration: 0.6, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] },
    };
  };

  return (
    <section
      id="about"
      className="relative overflow-hidden py-20 transition-colors duration-500"
      style={rootStyle}
    >
      <style>{`
        .ab-card { border-color: var(--accent-line); background-color: var(--accent-soft); }
        .ab-card::before {
          content: ""; position: absolute; inset: 0; opacity: 0; transition: opacity .4s;
          background: radial-gradient(240px circle at var(--mx, 50%) var(--my, 50%), var(--accent-soft), transparent 70%);
        }
        .ab-card:hover::before { opacity: 1; }
        .ab-card::after {
          content: ""; position: absolute; left: 0; bottom: 0; height: 2px; width: 0;
          background: var(--accent); transition: width .6s ease;
        }
        .ab-card:hover::after { width: 100%; }
        @keyframes abBob { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-4px) rotate(-6deg); } }
        .ab-card:hover .ab-icon { animation: abBob 1.1s ease-in-out infinite; }
        .ab-row { transition: background-color .3s, transform .3s; }
        .ab-row:hover { background-color: var(--accent-soft); transform: translateX(3px); }
        @keyframes abOrbit { to { transform: rotate(360deg); } }
        .ab-orbit { animation: abOrbit 40s linear infinite; }
        @keyframes abBlob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-30px) scale(1.15); } }
        .ab-blob { animation: abBlob 12s ease-in-out infinite; }
        @keyframes abPulse {
          0%,100% { box-shadow: 0 0 0 0 var(--accent-line), 0 0 20px var(--accent-line); }
          50% { box-shadow: 0 0 0 8px transparent, 0 0 24px var(--accent-line); }
        }
        .ab-pulse { animation: abPulse 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .ab-blob, .ab-orbit, .ab-pulse, .ab-card:hover .ab-icon { animation: none; }
        }
      `}</style>

      {/* Background */}
      <div
        className="ab-blob pointer-events-none absolute -top-32 -right-24 h-[26rem] w-[26rem] rounded-full opacity-20 blur-[130px]"
        style={{ backgroundColor: theme.primary }}
      />
      <div
        className="ab-blob pointer-events-none absolute -bottom-40 -left-24 h-[22rem] w-[22rem] rounded-full opacity-10 blur-[120px]"
        style={{ backgroundColor: theme.secondary || theme.primary, animationDelay: '-5s' }}
      />
      <div
        className="ab-orbit pointer-events-none absolute -right-48 -top-20 h-[36rem] w-[36rem] rounded-full border-2 border-dashed opacity-[0.12]"
        style={{ borderColor: theme.primary }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 lg:px-16">
        {/* HEADER */}
        <div className="mb-12 text-center lg:text-left">
          <div className="mb-5 inline-flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold"
              style={{
                borderColor: `${theme.primary}44`,
                backgroundColor: `${theme.primary}12`,
                color: theme.primary,
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Available for work
            </span>
            <p
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: theme.primary }}
            >
              <User2Icon size={16} /> About me
            </p>
          </div>

          <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
            <motion.span
              className="inline-block mr-[0.25em]"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
            >
              I
            </motion.span>
            <motion.span
              className="inline-block mr-[0.25em]"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.17 }}
            >
              build
            </motion.span>
            <motion.span
              className="inline-block"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.29 }}
            >
              software
            </motion.span>
            <br />
            <motion.span
              className="inline-block mr-[0.25em]"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.41 }}
            >
              people
            </motion.span>
            <motion.span
              className="inline-block mr-[0.25em]"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.53 }}
            >
              can
            </motion.span>
            <span className="relative inline-block">
              <motion.span
                className="inline-block"
                style={{ color: theme.primary }}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.65 }}
              >
                trust.
              </motion.span>
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <motion.path
                  d="M2 8 C 50 2, 100 12, 198 4"
                  stroke={theme.primary}
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={reduce ? undefined : { pathLength: 1 }}
                  transition={{ duration: 1.2, delay: 1.0, ease: 'easeOut' }}
                />
              </svg>
            </span>
          </h2>

          <motion.p
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed opacity-65 md:text-lg lg:mx-0"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 0.65, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            I orchestrate blockchain, AI, and cloud technologies to craft applications
            that are secure, intelligent, and built to endure.
          </motion.p>
        </div>

        {/* TIMELINE */}
        <div ref={timelineRef} className="relative mt-10">
          {/* Track + progress line */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 left-5 z-0 w-[2px] -translate-x-1/2 rounded-full lg:left-1/2"
            style={{ backgroundColor: 'var(--accent-line)' }}
          >
            <motion.div
              className="absolute top-0 left-0 w-full rounded-full"
              style={{
                height: lineHeight,
                backgroundColor: theme.primary,
                boxShadow: `0 0 10px ${theme.primary}88`,
              }}
            />
            <motion.div
              className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                top: headTop,
                opacity: headOpacity,
                backgroundColor: theme.primary,
                boxShadow: `0 0 0 5px ${theme.primary}33, 0 0 16px ${theme.primary}`,
              }}
            />
          </div>

          {/* Rows */}
          <div className="relative z-10 space-y-6 lg:space-y-8">
            {items.map((item, i) => {
              const isLeft = item.side === 'left';
              return (
                <div
                  key={i}
                  className="grid grid-cols-[40px_1fr] items-start gap-x-4 lg:grid-cols-[1fr_40px_1fr] lg:gap-x-6"
                >
                  {/* LEFT slot (desktop only) */}
                  {isLeft ? (
                    <motion.div
                      className="hidden lg:flex lg:justify-end"
                      {...cardMotion('right')}
                    >
                      <div className="w-full max-w-[400px]">
                        <Card>{renderCard(item)}</Card>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="hidden lg:block" />
                  )}

                  {/* NODE column */}
                  <div className="flex justify-center pt-3">
                    <Node item={item} />
                  </div>

                  {/* RIGHT slot (mobile always, desktop only when isRight) */}
                  <motion.div
                    className={`min-w-0 ${isLeft ? 'lg:hidden' : ''}`}
                    {...cardMotion('left')}
                  >
                    <div className="w-full max-w-[400px] lg:max-w-none">
                      <Card>{renderCard(item)}</Card>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;