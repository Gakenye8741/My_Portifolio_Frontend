import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import {
  useGetProjectsQuery,
  getProjectErrorMessage,
  type TProject,
} from '../../Features/Apis/Projects.Api';
import {
  ArrowUpRight,
  ArrowRight,
  Clock,
  Search,
  Layers,
  AlertCircle,
  X,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

/* ---------- Types ---------- */
type Project = TProject;

/* ---------- Reveal on scroll ---------- */
type RevealProps = {
  children: React.ReactNode;
  from?: 'up' | 'left' | 'right' | 'zoom';
  delay?: number;
  className?: string;
};

const Reveal = ({ children, from = 'up', delay = 0, className = '' }: RevealProps) => {
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
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`pc-reveal pc-${from} ${show ? 'pc-show' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ---------- One project card (compact) ---------- */
type CardProps = {
  project: Project;
  featured?: boolean;
  onOpen: () => void;
  primary: string;
};

const ProjectCard = ({ project, featured = false, onOpen, primary }: CardProps) => {
  const techs = project.techs ?? [];
  const year = new Date(project.createdAt).getFullYear();

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`pc-card group relative mx-auto h-full w-full cursor-pointer overflow-hidden rounded-xl border transition-all duration-500 hover:-translate-y-1 hover:shadow-lg focus:outline-none ${
        featured
          ? 'max-w-xl sm:max-w-2xl sm:grid sm:grid-cols-12'
          : 'max-w-full sm:max-w-xs flex flex-col'
      }`}
    >
      <div
        className={`relative overflow-hidden bg-black/20 ${
          featured
            ? 'aspect-[16/9] sm:col-span-6 sm:aspect-auto sm:min-h-[180px]'
            : 'aspect-[16/9]'
        }`}
      >
        {project.thumbnail?.fileUrl ? (
          <img
            src={project.thumbnail.fileUrl}
            alt={project.title}
            className="pc-img h-full w-full object-cover"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center"
            style={{ backgroundColor: 'var(--accent-soft)' }}
          >
            <Layers size={28} style={{ color: primary }} className="opacity-40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-0.5 backdrop-blur-md">
          <span
            className="h-1 w-1 animate-pulse rounded-full"
            style={{ backgroundColor: primary }}
          />
          <span className="text-[9px] font-semibold capitalize text-white">
            {project.status}
          </span>
        </div>

        {featured && (
          <div
            className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold"
            style={{ backgroundColor: primary, color: 'var(--on-accent)' }}
          >
            <Sparkles size={9} /> Latest
          </div>
        )}
      </div>

      <div
        className={`flex flex-col p-3 sm:p-4 ${
          featured ? 'sm:col-span-6 sm:justify-center' : 'flex-1'
        }`}
      >
        <div className="mb-1 flex items-center gap-1 text-[10px] opacity-55">
          <Clock size={10} /> {year}
        </div>

        <h3
          className={`font-extrabold leading-tight tracking-tight transition-colors duration-300 ${
            featured ? 'text-base sm:text-xl' : 'text-sm sm:text-base'
          }`}
        >
          <span className="pc-title">{project.title}</span>
        </h3>

        <p
          className={`mt-1.5 leading-snug opacity-65 ${
            featured ? 'line-clamp-2 text-xs sm:text-sm' : 'line-clamp-2 text-[11px] sm:text-xs'
          }`}
        >
          {project.mainDescription}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
          {techs.slice(0, 2).map((tech) => (
            <span
              key={tech.technologyId}
              className="rounded-full border px-1.5 py-0.5 text-[9px] font-semibold"
              style={{ color: primary, borderColor: 'var(--accent-line)' }}
            >
              {tech.technology?.name}
            </span>
          ))}
          {techs.length > 2 && (
            <span className="self-center text-[9px] font-medium opacity-50">
              +{techs.length - 2}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="pc-more text-[11px] font-bold" style={{ color: primary }}>
            View
          </span>
          <span
            className="pc-arrow grid h-6 w-6 place-items-center rounded-full border"
            style={{ borderColor: 'var(--accent-line)' }}
          >
            <ArrowUpRight size={11} />
          </span>
        </div>
      </div>
    </div>
  );
};

/* ---------- Main section ---------- */
const ProjectCenter = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const {
    data: projectsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProjectsQuery({ status: 'published', page: 1, limit: 9 });

  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const allProjects: Project[] = projectsResponse?.data ?? [];

  const rootStyle = {
    backgroundColor: theme['base-100'],
    color: theme['base-content'],
    '--accent': theme.primary,
    '--accent-soft': `${theme.primary}1f`,
    '--accent-line': `${theme.primary}40`,
    '--on-accent': theme['base-100'],
    '--text-soft': `${theme['base-content']}06`,
    '--text-line': `${theme['base-content']}1a`,
    '--pc-base': theme['base-100'],
  } as React.CSSProperties;

  const filteredProjects = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return allProjects;
    return allProjects.filter(
      (project) =>
        project.title?.toLowerCase().includes(term) ||
        project.slug?.toLowerCase().includes(term) ||
        project.techs?.some((t) => t.technology?.name?.toLowerCase().includes(term))
    );
  }, [searchTerm, allProjects]);

  const displayProjects = useMemo(() => {
    const list = filteredProjects.slice(0, 3);
    if (list.length === 0) return list;
    const featuredIndex = list.findIndex((p) => p.isFeatured);
    const idx = featuredIndex >= 0 ? featuredIndex : 0;
    if (idx === 0) return list;
    const reordered = [...list];
    const [featured] = reordered.splice(idx, 1);
    return [featured, ...reordered];
  }, [filteredProjects]);

  const [featured, ...others] = displayProjects;

  const scrollToIndex = useCallback((idx: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const children = container.querySelectorAll<HTMLElement>('[data-pc-slide]');
    const target = children[idx];
    if (!target) return;
    container.scrollTo({
      left: target.offsetLeft - container.offsetLeft,
      behavior: reduce.current ? 'auto' : 'smooth',
    });
  }, []);

  const onScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const children = container.querySelectorAll<HTMLElement>('[data-pc-slide]');
    const center = container.scrollLeft + container.clientWidth / 2;
    let closest = 0;
    let min = Infinity;
    children.forEach((el, i) => {
      const elCenter = el.offsetLeft - container.offsetLeft + el.clientWidth / 2;
      const dist = Math.abs(center - elCenter);
      if (dist < min) {
        min = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  useEffect(() => {
    setActiveIndex(0);
    scrollToIndex(0);
  }, [searchTerm, scrollToIndex]);

  const goTo = (dir: -1 | 1) => {
    if (others.length === 0) return;
    const next = (activeIndex + dir + others.length) % others.length;
    setActiveIndex(next);
    scrollToIndex(next);
  };

  const onCarouselKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(-1);
    }
  };

  const sharedStyles = `
    .pc-reveal { opacity: 0; transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); will-change: transform, opacity; }
    .pc-up    { transform: translateY(44px); }
    .pc-left  { transform: translateX(-56px); }
    .pc-right { transform: translateX(56px); }
    .pc-zoom  { transform: scale(.93) translateY(24px); }
    .pc-show  { opacity: 1; transform: none; }

    @keyframes pcWord { from { opacity: 0; transform: translateY(70%) rotate(3deg); } to { opacity: 1; transform: none; } }
    .pc-mask { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; }
    .pc-word { display: inline-block; opacity: 0; animation: pcWord .9s cubic-bezier(.2,.7,.2,1) forwards; }

    .pc-card { border-color: var(--text-line); background-color: var(--text-soft); }
    .pc-card:hover, .pc-card:focus-visible { border-color: var(--accent); }
    .pc-card:focus-visible { box-shadow: 0 0 0 2px var(--accent-line); }
    .pc-img { transition: transform 1.2s cubic-bezier(.2,.7,.2,1), filter .6s; filter: saturate(.85); }
    .pc-card:hover .pc-img { transform: scale(1.05); filter: saturate(1.1); }
    .pc-title { background-image: linear-gradient(var(--accent), var(--accent)); background-size: 0% 2px; background-position: 0 100%; background-repeat: no-repeat; transition: background-size .6s ease; }
    .pc-card:hover .pc-title { background-size: 100% 2px; }
    .pc-more { transition: transform .4s ease; }
    .pc-card:hover .pc-more { transform: translateX(3px); }
    .pc-arrow { transition: transform .5s cubic-bezier(.3,1.5,.5,1), background-color .3s, color .3s, border-color .3s; }
    .pc-card:hover .pc-arrow { transform: rotate(45deg) scale(1.06); background-color: var(--accent); color: var(--on-accent); border-color: var(--accent); }

    .pc-search { transition: border-color .3s, box-shadow .3s; border-color: var(--text-line); }
    .pc-search:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }

    /* ---------- Carousel ---------- */
    .pc-track {
      scrollbar-width: none;
      -ms-overflow-style: none;
      scroll-behavior: smooth;
      scroll-padding-left: 0.5rem;
      scroll-padding-right: 0.5rem;
    }
    .pc-track::-webkit-scrollbar { display: none; }
    .pc-slide { scroll-snap-align: center; flex: 0 0 auto; }

    .pc-dot { transition: width .3s, background-color .3s, opacity .3s; }
    .pc-dot:hover { opacity: 1 !important; }

    /* Fade edges — now visible on mobile too */
    .pc-fade-left,
    .pc-fade-right {
      position: absolute;
      top: 0; bottom: 0;
      width: 44px;
      z-index: 5;
      pointer-events: none;
    }
    .pc-fade-left  { left: 0;  background: linear-gradient(to right, var(--pc-base), transparent); }
    .pc-fade-right { right: 0; background: linear-gradient(to left,  var(--pc-base), transparent); }

    @keyframes pcOrbit { to { transform: rotate(360deg); } }
    .pc-orbit { animation: pcOrbit 45s linear infinite; }
    @keyframes pcDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
    .pc-drift { animation: pcDrift 12s ease-in-out infinite; }

    @media (prefers-reduced-motion: reduce) {
      .pc-reveal { opacity: 1; transform: none; transition: none; }
      .pc-word { opacity: 1; animation: none; }
      .pc-orbit, .pc-drift { animation: none; }
      .pc-img, .pc-card:hover .pc-img { transition: none; transform: none; }
      .pc-track { scroll-behavior: auto; }
    }
  `;

  if (isLoading) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-6"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        <style>{`@keyframes pcSpin { to { transform: rotate(360deg); } }`}</style>
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed opacity-25"
            style={{ borderColor: theme.primary, animation: 'pcSpin 4s linear infinite' }}
          />
          <div
            className="absolute inset-1.5 rounded-full border-2 border-t-transparent"
            style={{
              borderColor: theme.primary,
              borderTopColor: 'transparent',
              animation: 'pcSpin 1s linear infinite',
            }}
          />
          <div
            className="absolute inset-0 m-auto h-2 w-2 animate-pulse rounded-full"
            style={{ backgroundColor: theme.primary }}
          />
        </div>
        <p className="animate-pulse text-xs opacity-55">Loading projects...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ backgroundColor: 'var(--accent-soft)' }}
        >
          <AlertCircle size={32} style={{ color: theme.primary }} />
        </div>
        <h2 className="text-lg font-bold">Projects could not load</h2>
        <p className="max-w-sm text-xs opacity-60">
          {getProjectErrorMessage(error) || 'Please refresh the page and try again.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-1 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
          style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
        >
          <RefreshCw size={14} /> Try again
        </button>
      </div>
    );
  }

  return (
    <section
      className="relative overflow-hidden py-16 transition-colors duration-500 md:py-24"
      style={rootStyle}
    >
      <style>{sharedStyles}</style>

      <div
        className="pc-orbit pointer-events-none absolute -right-48 -top-24 h-[28rem] w-[28rem] rounded-full border-2 border-dashed opacity-[0.08]"
        style={{ borderColor: theme.primary }}
      />
      <div
        className="pc-drift pointer-events-none absolute -left-32 bottom-20 h-64 w-64 rounded-full opacity-10 blur-[100px]"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10 mx-auto max-w-[960px] px-4 sm:px-6 lg:px-10">
        {/* HEADER — smaller on mobile */}
        <div className="mb-8 flex flex-col justify-between gap-6 sm:mb-10 lg:flex-row lg:items-end">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-extrabold leading-[1.08] tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              {['Things', 'I', 'have'].map((w, i) => (
                <span key={w} className="pc-mask mr-[0.25em]">
                  <span
                    className="pc-word"
                    style={{ animationDelay: `${0.1 + i * 0.12}s` }}
                  >
                    {w}
                  </span>
                </span>
              ))}
              <br />
              <span className="pc-mask">
                <span
                  className="pc-word"
                  style={{ animationDelay: '0.5s', color: theme.primary }}
                >
                  built.
                </span>
              </span>
            </h2>
            <Reveal delay={500}>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed opacity-65 lg:mx-0">
                Here are some of my best projects. Click any one to see more.
              </p>
            </Reveal>
          </div>

          <Reveal from="right" delay={300} className="w-full lg:max-w-xs">
            <div className="mb-1.5 flex h-4 items-center justify-between px-1 text-xs">
              <label htmlFor="project-search" className="opacity-55">
                Search projects
              </label>
              {searchTerm && (
                <span className="font-semibold" style={{ color: theme.primary }}>
                  {filteredProjects.length} found
                </span>
              )}
            </div>
            <div className="pc-search flex items-center gap-2 rounded-full border px-3">
              <Search size={14} className="shrink-0 opacity-40" />
              <input
                id="project-search"
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent py-2 text-xs focus:outline-none sm:text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full transition-transform hover:rotate-90"
                  style={{ backgroundColor: 'var(--accent-soft)', color: theme.primary }}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          </Reveal>
        </div>

        {filteredProjects.length > 0 ? (
          <div key={searchTerm} className="space-y-6">
            {/* ---------- FEATURED ---------- */}
            {featured && (
              <Reveal from="zoom" className="flex justify-center">
                <ProjectCard
                  project={featured}
                  featured
                  primary={theme.primary}
                  onOpen={() => navigate(`/project/${featured.slug}`)}
                />
              </Reveal>
            )}

            {/* ---------- CAROUSEL OF SMALL CARDS ---------- */}
            {others.length > 0 && (
              <div className="relative pt-2">
                {/* Mobile hint */}
                {others.length > 1 && (
                  <div className="mb-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-40 sm:hidden">
                    <ChevronLeft size={11} />
                    Swipe to see more
                    <ChevronRight size={11} />
                  </div>
                )}

                {/* Edge fades — now on mobile too */}
                <div className="pc-fade-left" />
                <div className="pc-fade-right" />

                <div
                  ref={scrollRef}
                  className="pc-track flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3"
                  onScroll={onScroll}
                  onKeyDown={onCarouselKey}
                  tabIndex={0}
                  role="region"
                  aria-label="More projects carousel. Use arrow keys to navigate."
                >
                  {others.map((project, i) => (
                    <div
                      key={project.id}
                      data-pc-slide
                      className="pc-slide w-[85%] sm:w-[calc(50%-0.375rem)] min-w-0"
                    >
                      <Reveal from="zoom" delay={(i % 3) * 80}>
                        <ProjectCard
                          project={project}
                          primary={theme.primary}
                          onOpen={() => navigate(`/project/${project.slug}`)}
                        />
                      </Reveal>
                    </div>
                  ))}
                </div>

                {/* Prev / Next — now ALWAYS visible, both mobile & desktop */}
                {others.length > 1 && (
                  <>
                    <button
                      onClick={() => goTo(-1)}
                      aria-label="Previous project"
                      className="absolute left-1 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-110 active:scale-95 sm:-left-4 sm:h-10 sm:w-10"
                      style={{
                        borderColor: 'var(--accent-line)',
                        backgroundColor: `${theme['base-100']}dd`,
                        color: theme.primary,
                      }}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => goTo(1)}
                      aria-label="Next project"
                      className="absolute right-1 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-110 active:scale-95 sm:-right-4 sm:h-10 sm:w-10"
                      style={{
                        borderColor: 'var(--accent-line)',
                        backgroundColor: `${theme['base-100']}dd`,
                        color: theme.primary,
                      }}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Dots — bigger, both mobile & desktop */}
                {others.length > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-1.5">
                    {others.map((_, i) => {
                      const active = i === activeIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveIndex(i);
                            scrollToIndex(i);
                          }}
                          aria-label={`Show project ${i + 1}`}
                          aria-current={active}
                          className="pc-dot h-2.5 rounded-full"
                          style={{
                            width: active ? 32 : 10,
                            backgroundColor: active
                              ? theme.primary
                              : `${theme['base-content']}44`,
                            opacity: active ? 1 : 0.7,
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <Reveal from="zoom">
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 text-center"
              style={{ borderColor: 'var(--accent-line)' }}
            >
              <div
                className="grid h-12 w-12 place-items-center rounded-full"
                style={{ backgroundColor: 'var(--accent-soft)' }}
              >
                <AlertCircle size={24} style={{ color: theme.primary }} />
              </div>
              <h3 className="text-base font-bold">No projects found</h3>
              <p className="max-w-xs text-xs leading-relaxed opacity-60">
                {searchTerm ? (
                  <>
                    Nothing for{' '}
                    <span className="font-semibold" style={{ color: theme.primary }}>
                      "{searchTerm}"
                    </span>
                    . Try a different word.
                  </>
                ) : (
                  'No projects have been published yet. Check back soon.'
                )}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="rounded-full border px-4 py-1.5 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow active:scale-95"
                  style={{ borderColor: theme.primary, color: theme.primary }}
                >
                  Clear
                </button>
              )}
            </div>
          </Reveal>
        )}

        {filteredProjects.length > 0 && (
          <Reveal delay={100}>
            <div className="mt-8 flex justify-center sm:mt-10">
              <button
                onClick={() => navigate('/projects')}
                className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:scale-95 sm:text-sm"
                style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
              >
                See all projects
                <ArrowRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default ProjectCenter;