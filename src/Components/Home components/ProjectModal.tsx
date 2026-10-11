import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import { useGetProjectDetailsQuery } from '../../Features/Apis/Projects.Api';
import { Navbar } from '../Navbar';
import {
  Github,
  Globe,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowUpRight,
  AlertCircle,
  Link2,
  Check,
  Layers,
  Clock,
} from 'lucide-react';

/* ---------- Types ---------- */

interface ProjectLink { id: string; label: string; url: string; type: string; }
interface ProjectSection {
  id: string;
  sectionTitle: string;
  explanation: string;
  order: number;
  media?: { fileUrl: string };
}
interface ProjectTimeline { id: string; title: string; description: string; date: string; }

interface DetailedProject {
  id: string;
  title: string;
  slug: string;
  mainDescription: string;
  status: string;
  viewCount: number;
  createdAt: string;
  thumbnail?: { fileUrl: string };
  links: ProjectLink[];
  techs: { technology: { name: string } }[];
  sections: ProjectSection[];
  timeline: ProjectTimeline[];
}

/* ---------- Small helpers ---------- */

// Turns a date string into "12 Mar 2025". Returns empty text if the date is bad.
const formatDate = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Fades and slides content in when it comes into view.
const Reveal = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // only animate once
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

/* ---------- Page ---------- */

const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  const { data, isLoading, error } = useGetProjectDetailsQuery(id || '');
  const project = data as DetailedProject | undefined;

  // Go to the top when the project changes
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveSlide(0);
  }, [id]);

  // Reading progress bar at the top of the page
  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPercent(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sections sorted by their order
  const sections = useMemo(
    () => [...(project?.sections ?? [])].sort((a, b) => a.order - b.order),
    [project]
  );

  // Pictures for the slider
  const slides = useMemo(() => {
    const fromSections = sections
      .filter((s) => s.media?.fileUrl)
      .map((s) => ({ url: s.media!.fileUrl, caption: s.sectionTitle }));
    if (fromSections.length > 0) return fromSections;
    if (project?.thumbnail?.fileUrl) {
      return [{ url: project.thumbnail.fileUrl, caption: project.title }];
    }
    return [];
  }, [sections, project]);

  const total = Math.max(slides.length, 1);
  const nextSlide = () => setActiveSlide((p) => (p + 1) % total);
  const prevSlide = () => setActiveSlide((p) => (p - 1 + total) % total);

  // Move to the next picture every 5 seconds (stops while the mouse is over it)
  useEffect(() => {
    if (slides.length < 2 || paused) return;
    const timer = setInterval(() => {
      setActiveSlide((p) => (p + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is not available. Do nothing.
    }
  };

  // Theme colours
  const base = theme['base-100'];
  const text = theme['base-content'];
  const primary = theme.primary;
  const line = `${text}1a`; // soft border
  const soft = `${text}0a`; // soft background

  /* ----- Loading screen (Gakenye logo) ----- */
  if (isLoading) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-8"
        style={{ backgroundColor: base, color: text }}
      >
        <div className="relative">
          <div
            className="w-24 h-24 border-2 border-dashed rounded-full animate-[spin_4s_linear_infinite] opacity-20"
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
          <h2 className="text-xl font-black uppercase tracking-[0.5em] animate-pulse">
            Gakenye
          </h2>
          <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  /* ----- Not found screen ----- */
  if (error || !project) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center text-center px-6"
        style={{ backgroundColor: base, color: text }}
      >
        <AlertCircle size={44} className="mb-5 text-red-500 animate-bounce" />
        <h2 className="text-2xl md:text-3xl font-semibold">We could not find this project</h2>
        <p className="mt-2 text-sm opacity-60 max-w-sm">
          It may have been moved or removed. Go back to see all projects.
        </p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-8 px-7 py-3 rounded-full text-sm font-medium transition-transform hover:-translate-y-0.5 active:scale-95"
          style={{ backgroundColor: primary, color: base }}
        >
          Back to projects
        </button>
      </div>
    );
  }

  const links = project.links ?? [];
  const techs = project.techs ?? [];
  const timeline = project.timeline ?? [];
  const heroImage = project.thumbnail?.fileUrl || slides[0]?.url;

  return (
    <main className="min-h-screen pt-[64px]" style={{ backgroundColor: base, color: text }}>
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] z-[100] pointer-events-none">
        <div
          className="h-full"
          style={{
            width: `${scrollPercent}%`,
            backgroundColor: primary,
            transition: 'width 0.1s linear',
          }}
        />
      </div>

      <Navbar />

      {/* ---------- Hero ---------- */}
      <header className="relative w-full overflow-hidden h-[55vh] md:h-[68vh] min-h-[380px]">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="hero-image absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Fade the picture into the page colour */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top, ${base} 2%, ${base}cc 30%, ${base}33 70%, ${base}80 100%)`,
          }}
        />

        <div className="relative z-10 h-full max-w-6xl mx-auto px-5 md:px-10 flex flex-col justify-between py-6">
          {/* Top row */}
          <div className="rise flex items-center justify-between" style={{ animationDelay: '100ms' }}>
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full backdrop-blur-md border transition-colors"
              style={{ backgroundColor: `${base}99`, borderColor: line }}
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              All projects
            </Link>

            <button
              onClick={copyLink}
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full backdrop-blur-md border transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ backgroundColor: `${base}99`, borderColor: line }}
            >
              {copied ? <Check size={14} /> : <Link2 size={14} />}
              {copied ? 'Link copied' : 'Copy link'}
            </button>
          </div>

          {/* Title */}
          <div className="max-w-4xl">
            {project.status && (
              <span
                className="rise inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full border mb-5"
                style={{ borderColor: line, backgroundColor: `${base}99` }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: primary }}
                />
                {project.status}
              </span>
            )}
            <h1
              className="rise text-4xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
              style={{ animationDelay: '250ms' }}
            >
              {project.title}
            </h1>
          </div>
        </div>
      </header>

      {/* ---------- Content ---------- */}
      <div className="max-w-6xl mx-auto px-5 md:px-10 pb-28">
        {/* Description and quick facts */}
        <Reveal className="max-w-3xl pt-6 pb-14">
          <p className="text-xl md:text-2xl leading-relaxed opacity-80">
            {project.mainDescription}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm opacity-60">
            {project.createdAt && <span>Added {formatDate(project.createdAt)}</span>}
            {typeof project.viewCount === 'number' && <span>{project.viewCount} views</span>}
          </div>

          {techs.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {techs.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 text-sm rounded-full border transition-colors"
                  style={{ borderColor: line, backgroundColor: soft }}
                >
                  {tech.technology?.name}
                </span>
              ))}
            </div>
          )}
        </Reveal>

        {/* Slider */}
        {slides.length > 0 && (
          <Reveal className="mb-20">
            <div
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div
                className="relative overflow-hidden rounded-3xl aspect-video border shadow-2xl"
                style={{ borderColor: line, backgroundColor: soft }}
              >
                <div
                  className="flex h-full transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateX(-${activeSlide * 100}%)` }}
                >
                  {slides.map((slide, idx) => (
                    <img
                      key={idx}
                      src={slide.url}
                      alt={slide.caption}
                      className="w-full h-full object-cover shrink-0"
                    />
                  ))}
                </div>

                {/* Caption */}
                <div
                  className="absolute bottom-0 left-0 w-full px-6 py-5 text-sm text-white"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)' }}
                >
                  <span key={activeSlide} className="rise inline-block">
                    {slides[activeSlide]?.caption}
                  </span>
                </div>

                {slides.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      aria-label="Previous picture"
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/70 active:scale-95"
                    >
                      <ChevronLeft size={22} />
                    </button>
                    <button
                      onClick={nextSlide}
                      aria-label="Next picture"
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-black/70 active:scale-95"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </>
                )}
              </div>

              {/* Small pictures under the slider */}
              {slides.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {slides.map((slide, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Show picture ${idx + 1}`}
                      className="relative shrink-0 w-24 md:w-32 aspect-video rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                      style={{
                        outline: activeSlide === idx ? `2px solid ${primary}` : `1px solid ${line}`,
                        outlineOffset: 2,
                        opacity: activeSlide === idx ? 1 : 0.55,
                      }}
                    >
                      <img src={slide.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
          {/* Main column: what the project is about */}
          <div className="lg:col-span-8 space-y-16">
            {sections.map((section) => (
              <Reveal key={section.id}>
                <div
                  className="group pl-6 border-l-2 transition-colors duration-500"
                  style={{ borderColor: line }}
                >
                  <h2 className="text-2xl md:text-4xl font-semibold tracking-tight transition-colors duration-500 group-hover:opacity-100">
                    <span
                      className="bg-no-repeat bg-left-bottom transition-[background-size] duration-500 [background-size:0%_2px] group-hover:[background-size:100%_2px]"
                      style={{
                        backgroundImage: `linear-gradient(${primary}, ${primary})`,
                      }}
                    >
                      {section.sectionTitle}
                    </span>
                  </h2>
                  <p className="mt-5 text-base md:text-lg leading-relaxed opacity-70 max-w-2xl">
                    {section.explanation}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-[96px] space-y-6">
              {/* Links */}
              {links.length > 0 && (
                <Reveal>
                  <div className="space-y-3">
                    {links.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group/link flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-medium shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95"
                        style={{ backgroundColor: primary, color: base }}
                      >
                        <span className="flex items-center gap-3">
                          {link.label.toLowerCase().includes('github') ? (
                            <Github size={18} />
                          ) : (
                            <Globe size={18} />
                          )}
                          {link.label}
                        </span>
                        <ArrowUpRight
                          size={18}
                          className="transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1"
                        />
                      </a>
                    ))}
                  </div>
                </Reveal>
              )}

              {/* Quick facts */}
              <Reveal delay={100}>
                <div
                  className="p-6 rounded-3xl border"
                  style={{ borderColor: line, backgroundColor: soft }}
                >
                  <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                    <Layers size={16} style={{ color: primary }} />
                    Project info
                  </h3>
                  <dl className="space-y-3 text-sm">
                    {project.status && (
                      <div className="flex justify-between gap-4">
                        <dt className="opacity-50">Status</dt>
                        <dd className="font-medium">{project.status}</dd>
                      </div>
                    )}
                    {project.createdAt && (
                      <div className="flex justify-between gap-4">
                        <dt className="opacity-50">Added</dt>
                        <dd className="font-medium">{formatDate(project.createdAt)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="opacity-50">Views</dt>
                      <dd className="font-medium">{project.viewCount ?? 0}</dd>
                    </div>
                  </dl>
                </div>
              </Reveal>

              {/* Timeline */}
              {timeline.length > 0 && (
                <Reveal delay={200}>
                  <div
                    className="p-6 rounded-3xl border"
                    style={{ borderColor: line, backgroundColor: soft }}
                  >
                    <h3 className="text-base font-semibold mb-6 flex items-center gap-2">
                      <Clock size={16} style={{ color: primary }} />
                      How it went
                    </h3>
                    <ol
                      className="relative space-y-7 border-l pl-6"
                      style={{ borderColor: line }}
                    >
                      {timeline.map((event) => (
                        <li key={event.id} className="group/item relative">
                          <span
                            className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover/item:scale-150"
                            style={{ backgroundColor: primary }}
                          />
                          <p className="text-xs opacity-50">{formatDate(event.date)}</p>
                          <h4 className="mt-0.5 text-sm font-medium">{event.title}</h4>
                          <p className="mt-1 text-sm opacity-60 leading-relaxed">
                            {event.description}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </Reveal>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        /* Hero picture zooms out slowly one time */
        @keyframes hero-zoom { from { transform: scale(1.12); } to { transform: scale(1); } }
        .hero-image { animation: hero-zoom 2.4s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* Text rises into place when the page opens */
        @keyframes rise {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }

        /* Respect people who turn animations off */
        @media (prefers-reduced-motion: reduce) {
          .hero-image, .rise { animation: none !important; }
          .reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  );
};

export default ProjectDetailsPage;