import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import { useGetProjectsQuery } from '../../Features/Apis/Projects.Api';
import {
  ArrowUpRight, ArrowRight, Clock, Search, Layers,
  AlertCircle, X, Sparkles
} from 'lucide-react';

/* ---------- Types (taken from your API, so they always match) ---------- */
type Project = NonNullable<ReturnType<typeof useGetProjectsQuery>['data']>[number];

/* ---------- Helper: plays an animation when scrolled into view ---------- */
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

/* ---------- One project card ---------- */
type CardProps = {
  project: Project;
  featured?: boolean;
  onOpen: () => void;
  primary: string;
};

const ProjectCard = ({ project, featured = false, onOpen, primary }: CardProps) => {
  const techs: any[] = project.techs || [];
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
      className={`pc-card group relative h-full cursor-pointer overflow-hidden rounded-[2rem] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl focus:outline-none ${
        featured ? 'lg:grid lg:grid-cols-12' : 'flex flex-col'
      }`}
    >
      {/* Picture */}
      <div
        className={`relative overflow-hidden bg-black/20 ${
          featured ? 'aspect-[16/10] lg:col-span-7 lg:aspect-auto lg:min-h-[380px]' : 'aspect-[16/10]'
        }`}
      >
        {project.thumbnail?.fileUrl ? (
          <img
            src={project.thumbnail.fileUrl}
            alt={project.title}
            className="pc-img h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center" style={{ backgroundColor: 'var(--accent-soft)' }}>
            <Layers size={48} style={{ color: primary }} className="opacity-40" />
          </div>
        )}

        {/* Soft shade so the badge is easy to read */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Status badge */}
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3.5 py-1.5 backdrop-blur-md">
          <span className="h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: primary }} />
          <span className="text-xs font-semibold capitalize text-white">{project.status}</span>
        </div>

        {featured && (
          <div
            className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold"
            style={{ backgroundColor: primary, color: 'var(--on-accent)' }}
          >
            <Sparkles size={13} /> Latest work
          </div>
        )}
      </div>

      {/* Text */}
      <div className={`flex flex-col p-7 md:p-8 ${featured ? 'lg:col-span-5 lg:justify-center lg:p-10' : 'flex-1'}`}>
        <div className="mb-3 flex items-center gap-2 text-sm opacity-55">
          <Clock size={14} /> {year}
        </div>

        <h3 className={`font-extrabold leading-tight tracking-tight transition-colors duration-300 ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
          <span className="pc-title">{project.title}</span>
        </h3>

        <p className={`mt-4 leading-relaxed opacity-65 ${featured ? 'line-clamp-4 text-base' : 'line-clamp-3 text-sm'}`}>
          {project.mainDescription}
        </p>

        {/* Tech tags */}
        <div className="mt-5 flex flex-wrap gap-2">
          {techs.slice(0, 4).map((tech, index) => (
            <span
              key={index}
              className="rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ color: primary, borderColor: 'var(--accent-line)' }}
            >
              {tech.technology?.name}
            </span>
          ))}
          {techs.length > 4 && (
            <span className="self-center text-xs font-medium opacity-50">+{techs.length - 4} more</span>
          )}
        </div>

        {/* Open link */}
        <div className="mt-auto flex items-center justify-between pt-7">
          <span className="pc-more text-sm font-bold" style={{ color: primary }}>
            View project
          </span>
          <span
            className="pc-arrow grid h-11 w-11 place-items-center rounded-full border"
            style={{ borderColor: 'var(--accent-line)' }}
          >
            <ArrowUpRight size={18} />
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
  const { data: projects, isLoading, isError } = useGetProjectsQuery();
  const [searchTerm, setSearchTerm] = useState('');

  const rootStyle = {
    backgroundColor: theme['base-100'],
    color: theme['base-content'],
    '--accent': theme.primary,
    '--accent-soft': `${theme.primary}1f`,
    '--accent-line': `${theme.primary}40`,
    '--on-accent': theme['base-100'],
    '--text-soft': `${theme['base-content']}06`,
    '--text-line': `${theme['base-content']}1a`,
  } as React.CSSProperties;

  /* Search by name, link name or technology */
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return projects;
    return projects.filter(
      (project) =>
        project.title?.toLowerCase().includes(term) ||
        project.slug?.toLowerCase().includes(term) ||
        project.techs?.some((t: any) => t.technology?.name?.toLowerCase().includes(term))
    );
  }, [searchTerm, projects]);

  // Show the best 3 projects on this page
  const displayProjects = filteredProjects.slice(0, 3);

  const sharedStyles = `
    /* Scroll reveal */
    .pc-reveal { opacity: 0; transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); will-change: transform, opacity; }
    .pc-up    { transform: translateY(44px); }
    .pc-left  { transform: translateX(-56px); }
    .pc-right { transform: translateX(56px); }
    .pc-zoom  { transform: scale(.93) translateY(24px); }
    .pc-show  { opacity: 1; transform: none; }

    /* Headline words rise on load */
    @keyframes pcWord { from { opacity: 0; transform: translateY(70%) rotate(3deg); } to { opacity: 1; transform: none; } }
    .pc-mask { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; }
    .pc-word { display: inline-block; opacity: 0; animation: pcWord .9s cubic-bezier(.2,.7,.2,1) forwards; }

    /* Project cards */
    .pc-card { border-color: var(--text-line); background-color: var(--text-soft); }
    .pc-card:hover, .pc-card:focus-visible { border-color: var(--accent); }
    .pc-card:focus-visible { box-shadow: 0 0 0 3px var(--accent-line); }
    .pc-img { transition: transform 1.2s cubic-bezier(.2,.7,.2,1), filter .6s; filter: saturate(.85); }
    .pc-card:hover .pc-img { transform: scale(1.08); filter: saturate(1.1); }
    .pc-title { background-image: linear-gradient(var(--accent), var(--accent)); background-size: 0% 3px; background-position: 0 100%; background-repeat: no-repeat; transition: background-size .6s ease; }
    .pc-card:hover .pc-title { background-size: 100% 3px; }
    .pc-more { transition: transform .4s ease; }
    .pc-card:hover .pc-more { transform: translateX(6px); }
    .pc-arrow { transition: transform .5s cubic-bezier(.3,1.5,.5,1), background-color .3s, color .3s, border-color .3s; }
    .pc-card:hover .pc-arrow { transform: rotate(45deg) scale(1.1); background-color: var(--accent); color: var(--on-accent); border-color: var(--accent); }

    /* Search box */
    .pc-search { transition: border-color .3s, box-shadow .3s; border-color: var(--text-line); }
    .pc-search:focus-within { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }

    /* Background */
    @keyframes pcOrbit { to { transform: rotate(360deg); } }
    .pc-orbit { animation: pcOrbit 45s linear infinite; }
    @keyframes pcDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
    .pc-drift { animation: pcDrift 12s ease-in-out infinite; }

    @media (prefers-reduced-motion: reduce) {
      .pc-reveal { opacity: 1; transform: none; transition: none; }
      .pc-word { opacity: 1; animation: none; }
      .pc-orbit, .pc-drift { animation: none; }
      .pc-img, .pc-card:hover .pc-img { transition: none; transform: none; }
    }
  `;

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-8"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        <style>{`@keyframes pcSpin { to { transform: rotate(360deg); } }`}</style>
        <div className="relative h-24 w-24">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed opacity-25"
            style={{ borderColor: theme.primary, animation: 'pcSpin 4s linear infinite' }}
          />
          <div
            className="absolute inset-2 rounded-full border-2 border-t-transparent"
            style={{ borderColor: theme.primary, borderTopColor: 'transparent', animation: 'pcSpin 1s linear infinite' }}
          />
          <div className="absolute inset-0 m-auto h-2.5 w-2.5 animate-pulse rounded-full" style={{ backgroundColor: theme.primary }} />
        </div>
        <p className="animate-pulse text-sm opacity-55">Loading projects...</p>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (isError) {
    return (
      <div
        className="py-40 text-center"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        <p className="text-lg font-semibold">Sorry, the projects could not load.</p>
        <p className="mt-2 text-sm opacity-60">Please refresh the page and try again.</p>
      </div>
    );
  }

  const [featured, ...others] = displayProjects;

  return (
    <section
      className="relative overflow-hidden py-24 transition-colors duration-500 md:py-32"
      style={rootStyle}
    >
      <style>{sharedStyles}</style>

      {/* Background shapes */}
      <div
        className="pc-orbit pointer-events-none absolute -right-48 -top-24 h-[36rem] w-[36rem] rounded-full border-2 border-dashed opacity-[0.1]"
        style={{ borderColor: theme.primary }}
      />
      <div
        className="pc-drift pointer-events-none absolute -left-32 bottom-20 h-80 w-80 rounded-full opacity-10 blur-[120px]"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-16">
        {/* ---------- HEADER ---------- */}
        <div className="mb-14 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
              {['Things', 'I', 'have'].map((w, i) => (
                <span key={w} className="pc-mask mr-[0.25em]">
                  <span className="pc-word" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>{w}</span>
                </span>
              ))}
              <br />
              <span className="pc-mask">
                <span className="pc-word" style={{ animationDelay: '0.5s', color: theme.primary }}>built.</span>
              </span>
            </h2>
            <Reveal delay={500}>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed opacity-65 lg:mx-0">
                Here are some of my best projects. Click any one to see more about it.
              </p>
            </Reveal>
          </div>

          {/* Search box */}
          <Reveal from="right" delay={300} className="w-full lg:max-w-md">
            <div className="mb-2 flex h-5 items-center justify-between px-1 text-sm">
              <label htmlFor="project-search" className="opacity-55">Search projects</label>
              {searchTerm && (
                <span className="font-semibold" style={{ color: theme.primary }}>
                  {filteredProjects.length} found
                </span>
              )}
            </div>
            <div className="pc-search flex items-center gap-3 rounded-full border-2 px-5">
              <Search size={18} className="shrink-0 opacity-40" />
              <input
                id="project-search"
                type="text"
                placeholder="Type a name or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent py-4 text-sm focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Clear search"
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full transition-transform hover:rotate-90"
                  style={{ backgroundColor: 'var(--accent-soft)', color: theme.primary }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </Reveal>
        </div>

        {/* ---------- PROJECTS ---------- */}
        {filteredProjects.length > 0 ? (
          <div key={searchTerm} className="grid gap-8 md:grid-cols-2">
            {featured && (
              <Reveal from="zoom" className="md:col-span-2">
                <ProjectCard
                  project={featured}
                  featured
                  primary={theme.primary}
                  onOpen={() => navigate(`/project/${featured.id}`)}
                />
              </Reveal>
            )}
            {others.map((project, i) => (
              <Reveal key={project.id} from="zoom" delay={i * 150}>
                <ProjectCard
                  project={project}
                  primary={theme.primary}
                  onOpen={() => navigate(`/project/${project.id}`)}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          /* ---------- Nothing found ---------- */
          <Reveal from="zoom">
            <div
              className="flex flex-col items-center justify-center gap-5 rounded-[2rem] border-2 border-dashed px-6 py-20 text-center"
              style={{ borderColor: 'var(--accent-line)' }}
            >
              <div className="grid h-20 w-20 place-items-center rounded-full" style={{ backgroundColor: 'var(--accent-soft)' }}>
                <AlertCircle size={40} style={{ color: theme.primary }} />
              </div>
              <h3 className="text-2xl font-bold">No projects found</h3>
              <p className="max-w-sm text-sm leading-relaxed opacity-60">
                I could not find a project for{' '}
                <span className="font-semibold" style={{ color: theme.primary }}>"{searchTerm}"</span>.
                Try a different word.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="rounded-full border px-6 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                Clear search
              </button>
            </div>
          </Reveal>
        )}

        {/* ---------- SEE ALL ---------- */}
        {filteredProjects.length > 0 && (
          <Reveal delay={100}>
            <div className="mt-16 flex justify-center">
              <button
                onClick={() => navigate('/projects')}
                className="group inline-flex items-center gap-3 rounded-full px-9 py-4 font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl active:scale-95"
                style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
              >
                See all projects
                <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </button>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
};

export default ProjectCenter;