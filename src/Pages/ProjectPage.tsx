import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { useGetProjectsQuery } from '../Features/Apis/Projects.Api';
import { Navbar } from '../Components/Navbar';
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  Linkedin,
  Instagram,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  Cpu,
  Archive,
  Search,
  LayoutGrid,
  List,
  X,
  SearchX,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { RiWhatsappFill } from 'react-icons/ri';

// Logo and page parts
import logoMain from '../../public/LOGO.png';
import Footer from '../Components/Footer';
import PageTitle from '../Components/PageTitle';
import SEO from '../Components/SEO';
import VirtualAssistant from '../Components/VirtualAssistant';

/* ---------- Settings ---------- */

type StatusFilter = 'all' | 'published' | 'archived';
type ViewMode = 'grid' | 'list';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const socials = [
  { icon: <Github size={20} />, link: 'https://github.com/Gakenye8741', label: 'GitHub' },
  { icon: <Linkedin size={20} />, link: 'https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/', label: 'LinkedIn' },
  { icon: <RiWhatsappFill size={20} />, link: 'https://wa.link/f3ajog', label: 'WhatsApp' },
  { icon: <Instagram size={20} />, link: 'https://www.instagram.com/_code.d_by_gakenye_/', label: 'Instagram' },
];

const roles = ['websites', 'mobile apps', 'smart systems', 'AI tools'];

const getYear = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime()) ? '' : String(d.getFullYear());
};

const EASE = [0.2, 0.7, 0.2, 1] as const;

const statsContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.7 } },
};

const statCard: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.9, rotate: -4 },
  show: { opacity: 1, y: 0, scale: 1, rotate: 0, transition: { duration: 0.7, ease: EASE } },
};

/* ---------- Small helper parts ---------- */

const Reveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8, delay: delay / 1000, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

const WordTitle = ({ text, className = '' }: { text: string; className?: string }) => (
  <motion.h2
    className={className}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true, amount: 0.6 }}
    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
    aria-label={text}
  >
    {text.split(' ').map((word, i) => (
      <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.1em] mr-[0.25em]">
        <motion.span
          className="inline-block"
          variants={{
            hidden: { y: '110%' },
            show: { y: 0, transition: { duration: 0.8, ease: EASE } },
          }}
        >
          {word}
        </motion.span>
      </span>
    ))}
  </motion.h2>
);

const Tilt = ({
  children,
  className = '',
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) => {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 150, damping: 16 });
  const sy = useSpring(my, { stiffness: 150, damping: 16 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);

  return (
    <div className={className} style={{ perspective: 900 }}>
      <motion.div
        className="h-full"
        style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformStyle: 'preserve-3d' }}
        onMouseMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - box.left) / box.width - 0.5);
          my.set((e.clientY - box.top) / box.height - 0.5);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

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

const followMouse = (e: React.MouseEvent<HTMLElement>) => {
  const box = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - box.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - box.top}px`);
};

/* ---------- Picture carousel (3D stack) ---------- */

const AUTO_MS = 4000;

type Slide = { id: string; slug: string; title: string; note: string; image: string };

const HeroCarousel = ({
  slides,
  chips,
  onOpen,
  primary,
  base,
  text,
  reduce,
}: {
  slides: Slide[];
  chips: string[];
  onOpen: (slug: string) => void;
  primary: string;
  base: string;
  text: string;
  reduce: boolean | null;
}) => {
  const n = slides.length;
  const half = Math.floor(n / 2);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slidesKey = slides.map((s) => s.id).join(',');

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 14 });
  const sy = useSpring(my, { stiffness: 80, damping: 14 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-12, 12]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10]);

  const go = (direction: number) => setActive((a) => (n ? (a + direction + n) % n : 0));

  useEffect(() => {
    setActive(0);
  }, [slidesKey]);

  useEffect(() => {
    if (paused || reduce || n < 2) return;
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

  const current = slides[active];
  const spots = ['top-2 left-0', 'top-[45%] -right-2', 'bottom-6 left-2'];

  return (
    <div
      className="flex-1 w-full max-w-xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Pictures of my projects"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={onLeave}
      onMouseMove={onMove}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-x-10 inset-y-6 rounded-full blur-[90px] pointer-events-none"
          style={{ backgroundColor: primary }}
          animate={reduce ? { opacity: 0.25 } : { opacity: [0.18, 0.4, 0.18], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div
          className="pg-spin absolute inset-2 sm:inset-0 rounded-full border-2 border-dashed opacity-25 pointer-events-none"
          style={{ borderColor: primary }}
        />
        <div
          className="pg-spin-rev absolute inset-10 rounded-full border opacity-20 pointer-events-none"
          style={{ borderColor: text }}
        />

        <motion.div
          className="relative h-[22rem] sm:h-[29rem] select-none"
          style={{ perspective: 1400, touchAction: 'pan-y' }}
          onPanEnd={(_, info) => {
            if (info.offset.x < -50) go(1);
            else if (info.offset.x > 50) go(-1);
          }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformStyle: 'preserve-3d' }}
          >
            {n === 0 && (
              <div className="absolute inset-0 m-auto w-[64%] h-[86%] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/20 flex items-center justify-center">
                <img src={logoMain} alt="" className="w-1/3 opacity-30" />
              </div>
            )}

            {slides.map((slide, i) => {
              const offset = ((i - active + n + half) % n) - half;
              const abs = Math.abs(offset);
              const isActive = offset === 0;
              return (
                <motion.div
                  key={slide.id}
                  role="button"
                  tabIndex={isActive ? 0 : -1}
                  aria-label={isActive ? `Open project: ${slide.title}` : `Show ${slide.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      isActive ? onOpen(slide.slug) : setActive(i);
                    }
                  }}
                  className="absolute inset-0 m-auto w-[64%] h-[86%] rounded-3xl overflow-hidden shadow-2xl focus:outline-none"
                  style={{
                    zIndex: n - abs,
                    transformStyle: 'preserve-3d',
                    border: `1px solid ${text}30`,
                    cursor: 'pointer',
                    pointerEvents: abs > 1 ? 'none' : 'auto',
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
                  transition={{ type: 'spring', stiffness: 110, damping: 15, mass: 0.9 }}
                  onClick={() => (isActive ? onOpen(slide.slug) : setActive(i))}
                  aria-hidden={!isActive}
                >
                  <motion.img
                    src={slide.image}
                    alt={slide.title}
                    draggable={false}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    className="absolute inset-0 w-full h-full object-cover"
                    animate={isActive && !reduce ? { scale: [1, 1.18], x: ['0%', '-3%'] } : { scale: 1, x: '0%' }}
                    transition={isActive ? { duration: 7, ease: 'easeOut' } : { duration: 0.6 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${base}f0 0%, ${base}55 35%, transparent 65%)` }}
                  />

                  <motion.div
                    className="absolute inset-y-0 w-1/3 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)',
                      skewX: -20,
                    }}
                    initial={false}
                    animate={isActive && !reduce ? { x: ['-150%', '420%'] } : { x: '-150%' }}
                    transition={{ duration: 1.1, delay: 0.25, ease: 'easeInOut' }}
                  />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex items-end gap-3">
                    <motion.span
                      className="grid place-items-center shrink-0 w-11 h-11 rounded-2xl shadow-lg"
                      style={{ backgroundColor: primary, color: base }}
                      initial={false}
                      animate={isActive ? { scale: 1, rotate: 0, opacity: 1 } : { scale: 0, rotate: -90, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 14, delay: isActive ? 0.3 : 0 }}
                    >
                      <ArrowUpRight size={20} />
                    </motion.span>
                    <motion.div
                      className="min-w-0"
                      initial={false}
                      animate={isActive ? { y: 0, opacity: 1 } : { y: 24, opacity: 0 }}
                      transition={{ duration: 0.5, delay: isActive ? 0.4 : 0 }}
                    >
                      <p className="font-bold text-lg sm:text-xl leading-tight text-white drop-shadow truncate">
                        {slide.title}
                      </p>
                      <p className="text-xs sm:text-sm text-white/80 leading-snug line-clamp-1">{slide.note}</p>
                    </motion.div>
                  </div>

                  {isActive && n > 1 && (
                    <motion.span
                      key={`${active}-${paused}`}
                      className="absolute left-0 bottom-0 h-1 w-full origin-left"
                      style={{ backgroundColor: primary }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: paused || reduce ? 0 : 1 }}
                      transition={{ duration: paused ? 0.3 : AUTO_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {chips.slice(0, 3).map((label, i) => (
          <motion.span
            key={label}
            className={`absolute z-20 ${spots[i]} rounded-full px-4 py-1.5 text-sm font-semibold shadow-lg backdrop-blur-md`}
            style={{ backgroundColor: primary, color: base }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -10, 0], rotate: [-3, 3, -3] }}
            transition={{
              opacity: { delay: 1 + i * 0.25, duration: 0.5 },
              scale: { delay: 1 + i * 0.25, type: 'spring' },
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 },
              rotate: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 },
            }}
          >
            {label}
          </motion.span>
        ))}

        {!reduce &&
          [12, 30, 52, 74, 90].map((left, i) => (
            <motion.span
              key={left}
              className="absolute bottom-4 w-1.5 h-1.5 rounded-full pointer-events-none"
              style={{ left: `${left}%`, backgroundColor: primary }}
              animate={{ y: [0, -240 - i * 20], opacity: [0, 0.9, 0], scale: [0.6, 1.3, 0.4] }}
              transition={{ duration: 4 + i * 0.6, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
            />
          ))}
      </div>

      {n > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <motion.button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous project"
            whileHover={{ scale: 1.12, x: -3 }}
            whileTap={{ scale: 0.88 }}
            className="grid place-items-center w-11 h-11 rounded-full border"
            style={{ borderColor: `${text}30` }}
          >
            <ChevronLeft size={20} />
          </motion.button>

          <div className="flex items-center gap-2">
            {slides.map((slide, i) => (
              <motion.button
                key={slide.id}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show ${slide.title}`}
                aria-current={i === active}
                className="h-2.5 rounded-full"
                animate={{ width: i === active ? 36 : 10, backgroundColor: i === active ? primary : `${text}33` }}
                whileHover={{ scale: 1.25 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              />
            ))}
          </div>

          <motion.button
            type="button"
            onClick={() => go(1)}
            aria-label="Next project"
            whileHover={{ scale: 1.12, x: 3 }}
            whileTap={{ scale: 0.88 }}
            className="grid place-items-center w-11 h-11 rounded-full border"
            style={{ borderColor: `${text}30` }}
          >
            <ChevronRight size={20} />
          </motion.button>
        </div>
      )}

      {current && (
        <div className="mt-4 h-7 overflow-hidden text-center" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.p
              key={current.id}
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -28, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="text-sm font-semibold truncate px-4"
              style={{ color: primary }}
            >
              {active + 1} / {n} &middot; {current.title}
            </motion.p>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

/* ---------- Page ---------- */

const ProjectsRegistry = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const { data: projectsResponse, isLoading, refetch } = useGetProjectsQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('all');

  const [roleIndex, setRoleIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [deleting, setDeleting] = useState(false);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  const cursorX = useMotionValue(-600);
  const cursorY = useMotionValue(-600);
  const glowX = useSpring(cursorX, { stiffness: 60, damping: 20 });
  const glowY = useSpring(cursorY, { stiffness: 60, damping: 20 });

  const base = theme['base-100'];
  const text = theme['base-content'];
  const primary = theme.primary;

  const projects = projectsResponse?.data ?? [];

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const term = searchTerm.toLowerCase();
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(term) ||
        p.mainDescription.toLowerCase().includes(term) ||
        p.techs?.some((t) => t.technology?.name.toLowerCase().includes(term));
      const matchesStatus = activeStatus === 'all' || p.status === activeStatus;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, activeStatus, projects]);

  const counts = useMemo(() => {
    const list = projects ?? [];
    return {
      all: list.length,
      published: list.filter((p) => p.status === 'published').length,
      archived: list.filter((p) => p.status === 'archived').length,
    } as Record<StatusFilter, number>;
  }, [projects]);

  const toolNames = useMemo(() => {
    const set = new Set<string>();
    (projects ?? []).forEach((p) =>
      p.techs?.forEach((t) => t.technology?.name && set.add(t.technology.name))
    );
    return Array.from(set);
  }, [projects]);

  const stackProjects = useMemo(() => filteredProjects.slice(0, 5), [filteredProjects]);

  useEffect(() => {
    const word = roles[roleIndex];
    let delay = deleting ? 45 : 90;
    if (!deleting && typed === word) delay = 1400;
    const t = setTimeout(() => {
      if (!deleting && typed === word) {
        setDeleting(true);
      } else if (deleting && typed === '') {
        setDeleting(false);
        setRoleIndex((i) => (i + 1) % roles.length);
      } else {
        setTyped(deleting ? word.slice(0, typed.length - 1) : word.slice(0, typed.length + 1));
      }
    }, delay);
    return () => clearTimeout(t);
  }, [typed, deleting, roleIndex]);

  useEffect(() => {
    if (reduce) return;
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [reduce, cursorX, cursorY]);

  const borderSoft = `${text}18`;
  const borderMid = `${text}30`;

  const open = (slug: string) => navigate(`/project/${slug}`);
  const goToList = () =>
    document.getElementById('all-projects')?.scrollIntoView({ behavior: 'smooth' });

  const cardVars = {
    '--bd': borderSoft,
    '--hv': `${primary}77`,
    '--glow': `${primary}55`,
    '--mx': '50%',
    '--my': '50%',
  } as React.CSSProperties;

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-8"
        style={{ backgroundColor: base, color: text }}
      >
        <div className="relative">
          <div
            className="w-24 h-24 border-2 border-dashed rounded-full animate-[spin_6s_linear_infinite] opacity-10"
            style={{ borderColor: primary }}
          />
          <div
            className="absolute inset-2 border-t-2 rounded-full animate-spin"
            style={{ borderColor: primary }}
          />
          <div
            className="absolute inset-0 m-auto w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: primary }}
          />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black uppercase tracking-[0.6em] animate-pulse">Gakenye</h2>
          <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.4em]">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  /* ---------- ✅ Not found / no data at all ---------- */
  const noDataAtAll = !isLoading && counts.all === 0;
  if (noDataAtAll) {
    return (
      <main
        className="relative min-h-screen"
        style={{ backgroundColor: base, color: text, overflowX: 'clip' }}
      >
        <SEO
          title="Gakenye Ndiritu | Projects"
          description="Projects by Gakenye Ndiritu."
          path="/projects"
        />
        <PageTitle title="Projects" />
        <div className="relative z-10">
          <Navbar />
          <section className="pt-32 pb-24 px-6 lg:px-16">
            <div className="max-w-3xl mx-auto text-center">
              <div
                className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl"
                style={{ backgroundColor: `${primary}1f` }}
              >
                <Layers size={44} style={{ color: primary }} />
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                No projects <span style={{ color: primary }}>yet.</span>
              </h1>
              <p className="mt-4 text-base opacity-70 max-w-lg mx-auto leading-relaxed">
                I haven't published anything here yet. This page will fill up soon —
                check back later, or reach out if you'd like to work together.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                  style={{ backgroundColor: primary, color: base }}
                >
                  <RefreshCw size={15} /> Try again
                </button>
                <a
                  href="https://wa.link/f3ajog"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                  style={{ borderColor: borderMid, color: text }}
                >
                  <RiWhatsappFill size={16} /> Say hi
                </a>
              </div>
            </div>
          </section>
        </div>
        <Footer />
        <div className="pointer-events-none fixed inset-x-0 top-[94%] -translate-y-1/2 z-[100] flex justify-end px-3 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-6 sm:translate-y-0 sm:px-0">
          <div className="pointer-events-auto">
            <VirtualAssistant />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="relative min-h-screen transition-colors duration-500"
      style={{ backgroundColor: base, color: text, overflowX: 'clip' }}
    >
      <SEO
        title="Gakenye Ndiritu | Projects Archive & Portfolio"
        description="Explore production-ready full-stack applications, e-voting blockchain systems, and web solutions built by Gakenye Ndiritu using React, React Native, Node.js, and TypeScript."
        path="/projects"
      />

      <PageTitle title="Projects" />

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
        @keyframes pg-spin { to { transform: rotate(360deg); } }
        @keyframes pg-ping { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(2.4); opacity: 0; } }
        @keyframes pg-shine { 0% { transform: translateX(-120%) skewX(-20deg); } 60%,100% { transform: translateX(260%) skewX(-20deg); } }
        .hero-rise { opacity: 0; animation: rise 0.8s cubic-bezier(.2,.7,.2,1) forwards; }
        .hero-float { animation: floaty 6s ease-in-out infinite; }
        .hero-marquee { animation: marquee 28s linear infinite; }
        .hero-blob { animation: blob 12s ease-in-out infinite; }
        .hero-caret { animation: blink 1s step-end infinite; }
        .hero-marquee-wrap:hover .hero-marquee { animation-play-state: paused; }
        .pg-spin { animation: pg-spin 26s linear infinite; }
        .pg-spin-rev { animation: pg-spin 34s linear infinite reverse; }
        .pg-ping { animation: pg-ping 2s ease-out infinite; }
        .pg-shine { position: relative; overflow: hidden; }
        .pg-shine::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          animation: pg-shine 3.4s ease-in-out infinite; pointer-events: none;
        }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) {
          .hero-rise, .hero-float, .hero-marquee, .hero-blob, .hero-caret, .pg-spin, .pg-spin-rev, .pg-ping, .pg-shine::after {
            animation: none !important; opacity: 1 !important;
          }
        }
      `}</style>

      <motion.div
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[60]"
        style={{ scaleX: progress, backgroundColor: primary }}
      />

      {!reduce && (
        <motion.div
          className="fixed top-0 left-0 w-[30rem] h-[30rem] -ml-[15rem] -mt-[15rem] rounded-full blur-[110px] opacity-[0.18] pointer-events-none z-0 hidden md:block"
          style={{ x: glowX, y: glowY, backgroundColor: primary }}
        />
      )}

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <img
          src={logoMain}
          alt=""
          aria-hidden="true"
          className="w-[120vw] h-[120vw] sm:w-[80vw] sm:h-[80vw] object-contain opacity-[0.03] select-none"
        />
      </div>

      <div
        className="absolute inset-x-0 top-0 h-[44rem] pointer-events-none opacity-60"
        style={{
          backgroundImage: `radial-gradient(${text}26 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)',
        }}
      />

      <div
        className="hero-blob absolute -top-32 -right-24 w-[26rem] h-[26rem] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{ backgroundColor: primary }}
      />
      <div
        className="hero-blob absolute top-[40rem] -left-24 w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: theme.secondary || primary, animationDelay: '-5s' }}
      />

      <div className="relative z-10">
        <Navbar />

        {/* ---------- TOP / HERO ---------- */}
        <section className="pt-32 lg:pt-28 pb-12">
          <div className="w-full max-w-[1300px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1 text-center lg:text-left">
              

              <h1 className="mt-6 text-5xl md:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.05]">
                {['Here', 'are', 'my'].map((word, i) => (
                  <span key={word} className="inline-block overflow-hidden align-bottom pb-[0.12em] mr-[0.25em]">
                    <motion.span
                      className="inline-block"
                      initial={{ y: '110%' }}
                      animate={{ y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1, duration: 0.9, ease: EASE }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
                <br />
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0, scale: 0.7, x: -30 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.8, type: 'spring', stiffness: 120, damping: 12 }}
                  style={{ color: primary }}
                >
                  {typed}
                  <span className="hero-caret font-light">|</span>
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.7 }}
                className="mt-6 max-w-xl mx-auto lg:mx-0 text-base md:text-lg leading-relaxed opacity-75"
              >
                These are the apps and websites I have made. Search them, sort them, or pick one
                to see how it was built.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                className="mt-8 flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start"
              >
                <motion.button
                  onClick={goToList}
                  whileHover={{ y: -4, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  className="pg-shine group relative inline-flex items-center gap-3 rounded-full px-8 py-4 font-bold shadow-lg"
                  style={{ backgroundColor: primary, color: base, boxShadow: `0 12px 30px -12px ${primary}aa` }}
                >
                  <span className="relative">See all projects</span>
                  <ArrowRight size={18} className="relative transition-transform duration-300 group-hover:translate-x-1.5" />
                </motion.button>

                <div className="flex items-center gap-3">
                  {socials.map((s, i) => (
                    <motion.a
                      key={s.label}
                      href={s.link}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={s.label}
                      initial={{ opacity: 0, scale: 0, rotate: -90 }}
                      animate={{ opacity: 0.8, scale: 1, rotate: 0 }}
                      transition={{ delay: 1 + i * 0.08, type: 'spring', stiffness: 220, damping: 14 }}
                      whileHover={{ y: -7, rotate: 10, scale: 1.15, opacity: 1 }}
                      whileTap={{ scale: 0.85 }}
                      className="grid place-items-center w-11 h-11 rounded-full border"
                      style={{ borderColor: borderMid, color: text }}
                    >
                      {s.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left"
                variants={statsContainer}
                initial="hidden"
                animate="show"
              >
                {[
                  { value: counts.all, label: 'Projects', icon: <Layers size={18} /> },
                  { value: counts.published, label: 'Published', icon: <ShieldCheck size={18} /> },
                  { value: counts.archived, label: 'Archived', icon: <Archive size={18} /> },
                  { value: toolNames.length, label: 'Tools used', icon: <Cpu size={18} /> },
                ].map((s) => (
                  <motion.div
                    key={s.label}
                    variants={statCard}
                    whileHover={{ y: -10, rotate: 2, scale: 1.04 }}
                    className="rounded-2xl border p-4 backdrop-blur-sm hover:shadow-xl"
                    style={{ borderColor: borderSoft, backgroundColor: `${text}06` }}
                  >
                    <motion.span
                      className="grid place-items-center w-9 h-9 rounded-xl"
                      style={{ backgroundColor: `${primary}1f`, color: primary }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      {s.icon}
                    </motion.span>
                    <p className="mt-3 text-3xl font-extrabold leading-none">
                      <CountUp to={s.value} />
                    </p>
                    <p className="mt-1.5 text-xs opacity-60">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
              <HeroCarousel
                slides={stackProjects.map((p: any) => ({
                  id: p.id,
                  slug: p.slug,
                  title: p.title,
                  note: p.mainDescription,
                  image: p.thumbnail?.fileUrl || logoMain,
                }))}
                chips={toolNames}
                onOpen={open}
                primary={primary}
                base={base}
                text={text}
                reduce={reduce}
              />
            </div>
          </div>
        </section>

        {/* ---------- MARQUEE ---------- */}
        {toolNames.length > 0 && (
          <div
            className="hero-marquee-wrap relative z-10 overflow-hidden border-y py-5"
            style={{
              borderColor: `${text}15`,
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            }}
            aria-hidden="true"
          >
            <div className="hero-marquee flex w-max gap-12 whitespace-nowrap">
              {[...toolNames, ...toolNames, ...(toolNames.length < 6 ? [...toolNames, ...toolNames] : [])].map(
                (item, i) => (
                  <span key={i} className="flex items-center gap-12 text-xl font-semibold opacity-50">
                    {item}
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: primary }} />
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* ---------- ALL PROJECTS ---------- */}
        <section id="all-projects" className="px-6 lg:px-16 py-16 md:py-24 scroll-mt-20">
          <div className="max-w-[1300px] mx-auto">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <WordTitle
                  text="All projects"
                  className="text-4xl md:text-6xl font-extrabold tracking-tight"
                />
                <Reveal delay={300}>
                  <p className="mt-3 text-base opacity-60">
                    Showing {filteredProjects.length} of {counts.all}
                  </p>
                </Reveal>
              </div>
            </div>

            {/* Toolbar */}
            <Reveal delay={100}>
              <div
                className="md:sticky md:top-[72px] z-30 rounded-3xl border p-3 sm:p-4 backdrop-blur-xl flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4"
                style={{ borderColor: borderSoft, backgroundColor: `${base}d9` }}
              >
                <motion.div
                  className="flex items-center flex-grow rounded-full border px-5 transition-all duration-300"
                  animate={{ scale: searchFocused ? 1.015 : 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    borderColor: searchFocused ? primary : borderMid,
                    boxShadow: searchFocused ? `0 0 0 4px ${primary}22` : 'none',
                  }}
                >
                  <motion.span
                    animate={searchFocused ? { rotate: [0, -15, 15, 0] } : { rotate: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Search className="opacity-50 shrink-0" size={18} />
                  </motion.span>
                  <input
                    type="text"
                    placeholder="Search by name, tool or idea"
                    aria-label="Search projects"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    className="flex-grow min-w-0 bg-transparent py-3.5 px-3 text-base focus:outline-none placeholder:opacity-50"
                  />
                  <AnimatePresence>
                    {searchTerm && (
                      <motion.button
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                        className="p-1.5 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex gap-2 overflow-x-auto no-scrollbar py-1 -my-1"
                    role="tablist"
                    aria-label="Filter by status"
                  >
                    {STATUS_OPTIONS.map((option) => {
                      const isActive = activeStatus === option.value;
                      return (
                        <button
                          key={option.value}
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => setActiveStatus(option.value)}
                          className="relative shrink-0 rounded-full border px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
                          style={{
                            borderColor: isActive ? primary : borderMid,
                            color: isActive ? base : text,
                          }}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="statusPill"
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: primary }}
                              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                            />
                          )}
                          <span className="relative">
                            {option.label}
                            <span className="ml-2 opacity-60">{counts[option.value]}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {([
                      { mode: 'grid', icon: LayoutGrid, label: 'Grid view' },
                      { mode: 'list', icon: List, label: 'List view' },
                    ] as const).map(({ mode, icon: Icon, label }) => {
                      const isActive = viewMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => setViewMode(mode)}
                          aria-label={label}
                          aria-pressed={isActive}
                          className="relative grid place-items-center w-11 h-11 rounded-full border transition-all duration-300 hover:-translate-y-0.5 active:scale-90"
                          style={{
                            borderColor: isActive ? primary : borderMid,
                            color: isActive ? base : text,
                            opacity: isActive ? 1 : 0.7,
                          }}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="viewPill"
                              className="absolute inset-0 rounded-full"
                              style={{ backgroundColor: primary }}
                              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                            />
                          )}
                          <Icon size={18} className="relative" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ✅ No matches (but data exists) */}
            {filteredProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.7, type: 'spring', stiffness: 120, damping: 14 }}
                className="mt-8 py-16 md:py-24 px-6 flex flex-col items-center justify-center text-center space-y-5 rounded-3xl border-2 border-dashed"
                style={{ borderColor: borderSoft }}
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, -10, 0], rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <SearchX size={56} className="opacity-30" />
                </motion.div>
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Nothing matches that search
                  </h3>
                  <p className="text-sm md:text-base opacity-60 max-w-sm mx-auto">
                    {searchTerm
                      ? `No project found for "${searchTerm}". Try a different word, or clear the filters.`
                      : 'No projects match this filter. Try a different one.'}
                  </p>
                </div>
                <motion.button
                  onClick={() => {
                    setSearchTerm('');
                    setActiveStatus('all');
                  }}
                  whileHover={{ y: -3, scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  className="pg-shine inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-bold shadow-lg"
                  style={{ backgroundColor: primary, color: base }}
                >
                  <Sparkles size={16} /> Clear filters
                </motion.button>
              </motion.div>
            ) : (
              <div
                key={`${activeStatus}-${viewMode}`}
                className={
                  viewMode === 'grid'
                    ? 'mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
                    : 'mt-8 flex flex-col gap-4'
                }
              >
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project, i) => {
                    const techs = project.techs ?? [];
                    const year = getYear(project.createdAt);
                    const delay = viewMode === 'grid' ? (i % 3) * 0.12 : Math.min(i * 0.05, 0.4);

                    return (
                      <motion.div
                        key={project.id}
                        layout
                        className="h-full"
                        initial={
                          reduce
                            ? false
                            : viewMode === 'grid'
                            ? { opacity: 0, y: 60, scale: 0.9, rotate: i % 2 === 0 ? -3 : 3 }
                            : { opacity: 0, x: -60 }
                        }
                        whileInView={{ opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }}
                        viewport={{ once: true, amount: 0.1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{
                          duration: 0.8,
                          delay,
                          ease: EASE,
                          layout: { type: 'spring', stiffness: 220, damping: 26 },
                        }}
                      >
                        {viewMode === 'grid' ? (
                          <Tilt className="h-full">
                            <article
                              onClick={() => open(project.slug)}
                              onMouseMove={followMouse}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  open(project.slug);
                                }
                              }}
                              tabIndex={0}
                              role="link"
                              aria-label={`Open project: ${project.title}`}
                              className="group relative h-full cursor-pointer rounded-3xl border border-[color:var(--bd)] hover:border-[color:var(--hv)] overflow-hidden transition-all duration-500 hover:shadow-[0_28px_50px_-28px_var(--glow)] focus:outline-none focus-visible:ring-2"
                              style={{
                                ...cardVars,
                                backgroundColor: `${text}05`,
                                // @ts-ignore
                                '--tw-ring-color': primary,
                              }}
                            >
                              <div
                                className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                  background: `radial-gradient(340px circle at var(--mx) var(--my), ${primary}22, transparent 45%)`,
                                }}
                              />

                              <span
                                className="absolute bottom-0 left-0 z-20 h-1 w-0 group-hover:w-full transition-all duration-700 ease-out"
                                style={{ backgroundColor: primary }}
                              />

                              <div className="relative aspect-[4/3] overflow-hidden bg-black/20">
                                {project.thumbnail?.fileUrl ? (
                                  <img
                                    src={project.thumbnail.fileUrl}
                                    alt={project.title}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110 group-hover:rotate-1"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <img src={logoMain} alt="" className="w-1/4 opacity-30" />
                                  </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />

                                <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[420%] transition-transform duration-[900ms] ease-in-out" />

                                {project.status && (
                                  <span
                                    className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize backdrop-blur-md"
                                    style={{ backgroundColor: `${base}cc`, color: text }}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${project.status === 'published' ? 'bg-green-500 animate-pulse' : ''}`}
                                      style={project.status === 'published' ? undefined : { backgroundColor: `${text}66` }}
                                    />
                                    {project.status}
                                  </span>
                                )}

                                <span
                                  className="absolute top-4 right-4 grid place-items-center w-10 h-10 rounded-full opacity-0 translate-y-2 scale-50 -rotate-45 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500 ease-[cubic-bezier(.3,.9,.3,1.4)]"
                                  style={{ backgroundColor: primary, color: base }}
                                >
                                  <ArrowUpRight size={18} />
                                </span>
                              </div>

                              <div className="relative p-5 sm:p-6 space-y-3">
                                <h3 className="text-xl sm:text-2xl font-bold leading-snug tracking-tight">
                                  {project.title}
                                </h3>

                                <p className="text-sm sm:text-base opacity-65 leading-relaxed line-clamp-2">
                                  {project.mainDescription}
                                </p>

                                {techs.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-1">
                                    {techs.slice(0, 3).map((tech: any, idx: number) => (
                                      <span
                                        key={idx}
                                        className="rounded-full px-3 py-1 text-xs font-medium transition-transform duration-300 group-hover:-translate-y-1"
                                        style={{
                                          backgroundColor: `${primary}18`,
                                          color: primary,
                                          transitionDelay: `${idx * 70}ms`,
                                        }}
                                      >
                                        {tech.technology?.name}
                                      </span>
                                    ))}
                                    {techs.length > 3 && (
                                      <span className="px-1 py-1 text-xs opacity-50">+{techs.length - 3} more</span>
                                    )}
                                  </div>
                                )}

                                <div
                                  className="flex items-center justify-between pt-4 border-t text-sm"
                                  style={{ borderColor: borderSoft }}
                                >
                                  {year ? (
                                    <span className="inline-flex items-center gap-1.5 opacity-60">
                                      <Clock size={14} /> {year}
                                    </span>
                                  ) : (
                                    <span />
                                  )}
                                  <span
                                    className="inline-flex items-center gap-1.5 font-semibold transition-all duration-300 group-hover:gap-3"
                                    style={{ color: primary }}
                                  >
                                    See project <ArrowRight size={15} />
                                  </span>
                                </div>
                              </div>
                            </article>
                          </Tilt>
                        ) : (
                          <article
                            onClick={() => open(project.slug)}
                            onMouseMove={followMouse}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                open(project.slug);
                              }
                            }}
                            tabIndex={0}
                            role="link"
                            aria-label={`Open project: ${project.title}`}
                            className="group relative overflow-hidden flex items-center gap-4 sm:gap-6 cursor-pointer rounded-2xl border border-[color:var(--bd)] hover:border-[color:var(--hv)] p-3 sm:p-4 transition-all duration-300 hover:translate-x-2 hover:shadow-[0_20px_40px_-24px_var(--glow)] focus:outline-none focus-visible:ring-2"
                            style={{
                              ...cardVars,
                              backgroundColor: `${text}05`,
                              // @ts-ignore
                              '--tw-ring-color': primary,
                            }}
                          >
                            <div
                              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{
                                background: `radial-gradient(420px circle at var(--mx) var(--my), ${primary}1f, transparent 45%)`,
                              }}
                            />
                            <span
                              className="absolute left-0 top-4 bottom-4 w-1 rounded-full origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-300"
                              style={{ backgroundColor: primary }}
                            />

                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-xl overflow-hidden bg-black/20">
                              {project.thumbnail?.fileUrl ? (
                                <img
                                  src={project.thumbnail.fileUrl}
                                  alt=""
                                  loading="lazy"
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <img src={logoMain} alt="" className="w-1/2 opacity-30" />
                                </div>
                              )}
                            </div>

                            <div className="relative flex-grow min-w-0">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg sm:text-2xl font-bold truncate">{project.title}</h3>
                                {project.status && (
                                  <span
                                    className="hidden sm:inline-block rounded-full border px-3 py-0.5 text-xs capitalize opacity-70"
                                    style={{ borderColor: borderMid }}
                                  >
                                    {project.status}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm opacity-60 line-clamp-1 sm:line-clamp-2">
                                {project.mainDescription}
                              </p>
                              {techs.length > 0 && (
                                <p className="mt-1.5 hidden sm:block text-xs truncate" style={{ color: primary }}>
                                  {techs
                                    .slice(0, 5)
                                    .map((t: any) => t.technology?.name)
                                    .filter(Boolean)
                                    .join(', ')}
                                </p>
                              )}
                            </div>

                            {year && <span className="relative hidden md:block text-sm opacity-60">{year}</span>}

                            <span
                              className="relative grid place-items-center shrink-0 w-10 h-10 rounded-full border transition-all duration-500 group-hover:rotate-[405deg] group-hover:scale-110 group-hover:border-transparent"
                              style={{ borderColor: borderMid, color: primary }}
                            >
                              <ArrowUpRight size={18} />
                            </span>
                          </article>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
      <div className="pointer-events-none fixed inset-x-0 top-[94%] -translate-y-1/2 z-[100] flex justify-end px-3 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-6 sm:translate-y-0 sm:px-0">
        <div className="pointer-events-auto">
          <VirtualAssistant />
        </div>
      </div>
    </main>
  );
};

export default ProjectsRegistry;