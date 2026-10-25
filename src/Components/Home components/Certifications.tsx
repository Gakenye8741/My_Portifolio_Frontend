import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../../ThemeContext';
import {
  BadgeCheck, Award, Building2,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RefreshCw,
  AlertCircle, ShieldCheck, ExternalLink, X
} from 'lucide-react';
import {
  useGetCertificationsQuery,
  getCertificationErrorMessage,
  type TCertification,
} from '../../Features/Apis/Certifications.Api';

/* ---------- Reveal on scroll ---------- */
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
      className={`ce-reveal ce-${from} ${show ? "ce-show" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ---------- Modal ---------- */
const CertificationModal = ({
  cert,
  onClose,
  primary,
  base,
  text,
}: {
  cert: TCertification;
  onClose: () => void;
  primary: string;
  base: string;
  text: string;
}) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const badgeUrl = cert.badge?.fileUrl ?? null;

  return (
    <div
      className="ce-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Certification: ${cert.name}`}
    >
      <div
        className="ce-modal-panel relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: base,
          color: text,
          borderColor: `${primary}44`,
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close certification"
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border transition hover:rotate-90"
          style={{ borderColor: `${text}30`, color: text }}
        >
          <X size={16} />
        </button>

        {/* Header: big badge + verified */}
        <div className="flex items-start gap-5">
          <div
            className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl"
            style={{ backgroundColor: `${primary}1f`, color: primary }}
          >
            {badgeUrl ? (
              <img src={badgeUrl} alt={cert.name} className="h-full w-full object-cover" />
            ) : (
              <BadgeCheck size={38} />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <div
              className="mb-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1"
              style={{ backgroundColor: `${primary}1f`, color: primary }}
            >
              <ShieldCheck size={11} />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Verified
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold leading-snug">
              {cert.name}
            </h3>
          </div>
        </div>

        {/* Issuer */}
        <div
          className="mt-6 rounded-2xl border p-4 sm:p-5"
          style={{ borderColor: `${text}18`, backgroundColor: `${text}05` }}
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest opacity-50">
            <Building2 size={12} /> Issued by
          </div>
          <p className="mt-1.5 text-base font-semibold">{cert.issuer}</p>
        </div>

        {/* Badge preview */}
        {badgeUrl && (
          <div
            className="mt-4 overflow-hidden rounded-2xl border"
            style={{ borderColor: `${text}18` }}
          >
            <img
              src={badgeUrl}
              alt={`${cert.name} badge`}
              className="w-full max-h-72 object-contain bg-black/5"
            />
          </div>
        )}

        {/* Footer */}
        <div
          className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5"
          style={{ borderColor: `${text}18` }}
        >
          {/* <div className="flex items-center gap-1.5 text-xs opacity-60">
            <ShieldCheck size={13} />
            Verified credential
          </div> */}

          {badgeUrl && (
            <a
              href={badgeUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5"
              style={{ borderColor: `${primary}55`, color: primary }}
            >
              <ExternalLink size={13} /> View badge
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------- Cert card (reusable) ---------- */
const CertCard = ({
  cert,
  primary,
  onOpen,
}: {
  cert: TCertification;
  primary: string;
  onOpen: () => void;
}) => {
  const badgeUrl = cert.badge?.fileUrl ?? null;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      aria-label={`Open certification: ${cert.name}`}
      className="ce-card relative h-full flex flex-col overflow-hidden rounded-3xl border p-6 cursor-pointer focus:outline-none focus-visible:ring-2"
      style={{
        // @ts-ignore
        '--tw-ring-color': primary,
      }}
    >
      {/* Top row */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="ce-badge grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl">
          {badgeUrl ? (
            <img src={badgeUrl} alt={cert.name} className="h-full w-full object-cover" />
          ) : (
            <BadgeCheck size={26} />
          )}
        </div>
        <div className="ce-verified inline-flex items-center gap-1 rounded-full px-2.5 py-1">
          <ShieldCheck size={11} />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Verified
          </span>
        </div>
      </div>

      {/* Name */}
      <h3 className="text-base font-bold leading-snug">{cert.name}</h3>

      {/* Issuer */}
      <div className="mt-3">
        <div className="ce-issuer-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
          <Building2 size={11} />
          {cert.issuer}
        </div>
      </div>

      {/* Footer */}
      <div
        className="mt-auto flex items-center justify-between gap-3 border-t pt-4 mt-5"
        style={{ borderColor: 'var(--ce-text-line)' }}
      >
        <div className="flex items-center gap-1.5 text-[11px] opacity-60">
          <ShieldCheck size={11} />
          Credential
        </div>
        <span
          className="inline-flex items-center gap-1 text-[11px] font-bold"
          style={{ color: primary }}
        >
          View <ChevronRight size={11} />
        </span>
      </div>
    </div>
  );
};

const FIRST_BATCH = 6;

const Certifications = () => {
  const { theme } = useTheme();
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCertificationsQuery();

  const [showAll, setShowAll] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<TCertification | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const rootStyle = {
    backgroundColor: theme["base-100"],
    color: theme["base-content"],
    "--ce-accent": theme.primary,
    "--ce-accent-soft": `${theme.primary}1f`,
    "--ce-accent-line": `${theme.primary}33`,
    "--ce-text-soft": `${theme["base-content"]}0d`,
    "--ce-text-line": `${theme["base-content"]}1a`,
    "--ce-on-accent": theme["base-100"],
    "--ce-base": theme["base-100"],
  } as React.CSSProperties;

  const all: TCertification[] = response?.data ?? [];
  const visible: TCertification[] = showAll ? all : all.slice(0, FIRST_BATCH);
  const hasMore = all.length > FIRST_BATCH;

  const scrollToIndex = useCallback((idx: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const children = container.querySelectorAll<HTMLElement>('[data-ce-slide]');
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
    const children = container.querySelectorAll<HTMLElement>('[data-ce-slide]');
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
    if (!showAll) {
      const id = setTimeout(() => scrollToIndex(0), 60);
      return () => clearTimeout(id);
    }
  }, [showAll, scrollToIndex]);

  const goTo = (dir: -1 | 1) => {
    if (visible.length === 0 || selected) return;
    const next = (activeIndex + dir + visible.length) % visible.length;
    setActiveIndex(next);
    scrollToIndex(next);
  };

  const onCarouselKey = (e: React.KeyboardEvent) => {
    if (selected) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(-1);
    }
  };

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-40"
        style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
      >
        <style>{`
          @keyframes ceSpin { to { transform: rotate(360deg); } }
          @keyframes ceSpinSlow { to { transform: rotate(-360deg); } }
          @keyframes ceDotPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: .4; } }
        `}</style>
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed opacity-25"
            style={{ borderColor: theme.primary, animation: 'ceSpin 5s linear infinite' }}
          />
          <div
            className="absolute inset-1.5 rounded-full border-2 border-t-transparent border-r-transparent"
            style={{
              borderColor: theme.primary,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              animation: 'ceSpinSlow 1.6s linear infinite',
            }}
          />
          <div
            className="absolute inset-0 m-auto h-2 w-2 rounded-full"
            style={{ backgroundColor: theme.primary, animation: 'ceDotPulse 1.4s ease-in-out infinite' }}
          />
        </div>
        <p className="text-sm opacity-50">Loading certifications...</p>
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
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ backgroundColor: 'var(--ce-accent-soft)' }}
        >
          <AlertCircle size={28} style={{ color: theme.primary }} />
        </div>
        <p className="text-lg font-semibold">Sorry, the certifications could not load.</p>
        <p className="max-w-md text-sm opacity-60">
          {getCertificationErrorMessage(error) || "Please refresh the page and try again."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
          style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
        >
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    );
  }

  return (
    <section
      id="certifications"
      className="relative overflow-hidden py-24 transition-colors duration-500"
      style={rootStyle}
    >
      <style>{`
        /* Reveal */
        .ce-reveal { opacity: 0; transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1), filter .8s; will-change: transform, opacity, filter; }
        .ce-up    { transform: translateY(36px); }
        .ce-left  { transform: translateX(-50px); }
        .ce-right { transform: translateX(50px); }
        .ce-zoom  { transform: scale(.9) translateY(20px); }
        .ce-blur  { transform: translateY(20px); filter: blur(8px); }
        .ce-show  { opacity: 1; transform: none; filter: none; }

        /* Headline */
        @keyframes ceWord { from { opacity: 0; transform: translateY(70%) rotate(3deg); } to { opacity: 1; transform: none; } }
        .ce-mask { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; }
        .ce-word { display: inline-block; opacity: 0; animation: ceWord .9s cubic-bezier(.2,.7,.2,1) forwards; }

        /* Card */
        .ce-card {
          border-color: var(--ce-text-line);
          background-color: var(--ce-text-soft);
          position: relative; overflow: hidden;
          transition: transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .5s, border-color .3s;
        }
        .ce-card:hover, .ce-card:focus-visible {
          border-color: var(--ce-accent);
          transform: translateY(-6px);
          box-shadow: 0 24px 48px -22px var(--ce-accent-soft), 0 10px 20px -12px rgba(0,0,0,.15);
        }
        .ce-card::after {
          content: ""; position: absolute; inset: auto 0 0 0; height: 3px;
          background: var(--ce-accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform .5s ease;
        }
        .ce-card:hover::after { transform: scaleX(1); }
        .ce-card::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.08) 45%, transparent 60%);
          transform: translateX(-120%);
          transition: transform .9s cubic-bezier(.2,.7,.2,1);
          pointer-events: none;
        }
        .ce-card:hover::before { transform: translateX(120%); }

        /* Badge icon */
        .ce-badge {
          background: var(--ce-accent-soft);
          color: var(--ce-accent);
          transition: transform .5s cubic-bezier(.3,1.6,.5,1);
          position: relative;
        }
        .ce-card:hover .ce-badge { transform: scale(1.06) rotate(-6deg); }
        .ce-badge::after {
          content: ""; position: absolute; inset: -6px; border-radius: inherit;
          background: radial-gradient(circle at center, var(--ce-accent-soft), transparent 70%);
          opacity: 0; transform: scale(.7);
          transition: opacity .4s, transform .5s cubic-bezier(.3,1.6,.5,1);
          z-index: -1;
        }
        .ce-card:hover .ce-badge::after { opacity: 1; transform: scale(1.05); }

        /* Verified chip */
        @keyframes ceVerifiedPulse {
          0%, 100% { box-shadow: 0 0 0 0 var(--ce-accent-soft); }
          50% { box-shadow: 0 0 0 5px transparent; }
        }
        .ce-verified {
          background: var(--ce-accent-soft);
          color: var(--ce-accent);
          animation: ceVerifiedPulse 2.4s ease-out infinite;
        }

        /* Issuer row */
        .ce-issuer-badge {
          background: var(--ce-text-soft);
          border: 1px solid var(--ce-text-line);
          transition: border-color .3s, color .3s;
        }
        .ce-card:hover .ce-issuer-badge {
          border-color: var(--ce-accent-line);
          color: var(--ce-accent);
        }

        /* ---------- Carousel ---------- */
        .ce-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-behavior: smooth;
          scroll-padding-left: 0.5rem;
          scroll-padding-right: 0.5rem;
        }
        .ce-track::-webkit-scrollbar { display: none; }
        .ce-slide { scroll-snap-align: center; flex: 0 0 auto; }

        .ce-dot { transition: width .3s, background-color .3s, opacity .3s; }
        .ce-dot:hover { opacity: 1 !important; }

        /* Fade edges */
        .ce-fade-left,
        .ce-fade-right {
          position: absolute;
          top: 0; bottom: 0;
          width: 44px;
          z-index: 5;
          pointer-events: none;
        }
        .ce-fade-left  { left: 0;  background: linear-gradient(to right, var(--ce-base), transparent); }
        .ce-fade-right { right: 0; background: linear-gradient(to left,  var(--ce-base), transparent); }

        /* Ambient */
        @keyframes ceOrbit { to { transform: rotate(360deg); } }
        .ce-orbit { animation: ceOrbit 45s linear infinite; }
        @keyframes ceOrbitDot { to { transform: rotate(360deg); } }
        .ce-orbit-dot { animation: ceOrbitDot 18s linear infinite; transform-origin: center; }

        @keyframes ceDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-30px); } }
        .ce-drift { animation: ceDrift 12s ease-in-out infinite; }

        @keyframes ceFloat1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-18px); } }
        @keyframes ceFloat2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-16px,22px); } }
        @keyframes ceFloat3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(12px,16px); } }
        .ce-float-1 { animation: ceFloat1 11s ease-in-out infinite; }
        .ce-float-2 { animation: ceFloat2 14s ease-in-out infinite; }
        .ce-float-3 { animation: ceFloat3 9s ease-in-out infinite; }

        @keyframes cePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); } 50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } }
        .ce-pulse { animation: cePulse 2.2s ease-out infinite; }

        /* Modal */
        @keyframes ceModalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ceOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .ce-modal-overlay {
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          animation: ceOverlayIn .25s ease-out;
        }
        .ce-modal-panel {
          animation: ceModalIn .35s cubic-bezier(.2,.7,.2,1);
        }

        @media (prefers-reduced-motion: reduce) {
          .ce-reveal { opacity: 1; transform: none; filter: none; transition: none; }
          .ce-word { opacity: 1; animation: none; transform: none; }
          .ce-orbit, .ce-orbit-dot, .ce-drift, .ce-pulse,
          .ce-float-1, .ce-float-2, .ce-float-3, .ce-verified,
          .ce-modal-overlay, .ce-modal-panel { animation: none; }
          .ce-card, .ce-card:hover, .ce-card::before, .ce-card::after { transition: none; transform: none; }
          .ce-badge, .ce-card:hover .ce-badge { transition: none; transform: none; }
          .ce-track { scroll-behavior: auto; }
        }
      `}</style>

      {/* Ambient background */}
      <div
        className="ce-orbit pointer-events-none absolute -left-52 top-0 h-[34rem] w-[34rem] rounded-full border-2 border-dashed opacity-[0.1]"
        style={{ borderColor: theme.primary }}
      >
        <div
          className="ce-orbit-dot absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: theme.primary, transformOrigin: '0 17rem' }}
        />
      </div>
      <div
        className="ce-drift pointer-events-none absolute -right-32 bottom-20 h-80 w-80 rounded-full opacity-10 blur-[120px]"
        style={{ backgroundColor: theme.primary }}
      />

      {/* Floating ambient dots */}
      <div
        className="ce-float-1 pointer-events-none absolute left-[8%] top-[30%] h-2 w-2 rounded-full opacity-40"
        style={{ backgroundColor: theme.primary }}
      />
      <div
        className="ce-float-2 pointer-events-none absolute right-[12%] top-[22%] h-1.5 w-1.5 rounded-full opacity-30"
        style={{ backgroundColor: theme.primary }}
      />
      <div
        className="ce-float-3 pointer-events-none absolute left-[20%] bottom-[15%] h-2.5 w-2.5 rounded-full opacity-20"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-16">
        {/* HEADER */}
        <div className="mb-12 text-center lg:text-left">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
            style={{ borderColor: 'var(--ce-accent-line)', backgroundColor: 'var(--ce-accent-soft)' }}
          >
            <Award size={14} style={{ color: theme.primary }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: theme.primary }}>
              Verified credentials
            </span>
          </div>
          <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
            {["My"].map((w, i) => (
              <span key={w} className="ce-mask mr-[0.25em]">
                <span className="ce-word" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>{w}</span>
              </span>
            ))}
            <br className="hidden sm:block" />
            <span className="ce-mask">
              <span className="ce-word" style={{ animationDelay: "0.22s" }}>certifi</span>
            </span>
            <span className="ce-mask">
              <span className="ce-word" style={{ animationDelay: "0.5s", color: theme.primary }}>cations.</span>
            </span>
          </h2>
          <Reveal delay={500}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed opacity-65 lg:mx-0">
              A few credentials I've earned — proof of time spent learning the craft.
              Click any card to see the full details.
            </p>
          </Reveal>
        </div>

        {/* CERTIFICATIONS */}
        {all.length === 0 ? (
          <Reveal from="zoom">
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center"
              style={{ borderColor: 'var(--ce-accent-line)' }}
            >
              <div
                className="grid h-16 w-16 place-items-center rounded-full"
                style={{ backgroundColor: 'var(--ce-accent-soft)' }}
              >
                <BadgeCheck size={28} style={{ color: theme.primary }} />
              </div>
              <h3 className="text-xl font-bold">No certifications yet</h3>
              <p className="max-w-sm text-sm opacity-60">
                Certifications will appear here as I earn them.
              </p>
            </div>
          </Reveal>
        ) : showAll ? (
          /* ---------- GRID VIEW ---------- */
          <div
            key="ce-grid"
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {visible.map((cert, i) => (
              <Reveal key={cert.id} from={i === 0 ? "zoom" : "blur"} delay={(i % 6) * 80}>
                <CertCard
                  cert={cert}
                  primary={theme.primary}
                  onOpen={() => setSelected(cert)}
                />
              </Reveal>
            ))}
          </div>
        ) : (
          /* ---------- CAROUSEL VIEW ---------- */
          <div className="relative pt-2">
            {all.length > 1 && (
              <div className="mb-3 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest opacity-40 sm:hidden">
                <ChevronLeft size={11} />
                Swipe to see more
                <ChevronRight size={11} />
              </div>
            )}

            <div className="ce-fade-left" />
            <div className="ce-fade-right" />

            <div
              ref={scrollRef}
              className="ce-track flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3"
              onScroll={onScroll}
              onKeyDown={onCarouselKey}
              tabIndex={0}
              role="region"
              aria-label="Certifications carousel. Use arrow keys to navigate."
            >
              {visible.map((cert, i) => (
                <div
                  key={cert.id}
                  data-ce-slide
                  className="ce-slide w-[85%] sm:w-[calc(50%-0.375rem)] lg:w-[calc(33.333%-0.5rem)] min-w-0"
                >
                  <Reveal from={i === 0 ? 'zoom' : 'blur'} delay={(i % 3) * 80}>
                    <CertCard
                      cert={cert}
                      primary={theme.primary}
                      onOpen={() => setSelected(cert)}
                    />
                  </Reveal>
                </div>
              ))}
            </div>

            {visible.length > 1 && (
              <>
                <button
                  onClick={() => goTo(-1)}
                  aria-label="Previous certification"
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-110 active:scale-95 sm:-left-4 sm:h-10 sm:w-10"
                  style={{
                    borderColor: 'var(--ce-accent-line)',
                    backgroundColor: `${theme['base-100']}dd`,
                    color: theme.primary,
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={() => goTo(1)}
                  aria-label="Next certification"
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-20 grid h-9 w-9 place-items-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-110 active:scale-95 sm:-right-4 sm:h-10 sm:w-10"
                  style={{
                    borderColor: 'var(--ce-accent-line)',
                    backgroundColor: `${theme['base-100']}dd`,
                    color: theme.primary,
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {visible.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-1.5">
                {visible.map((_, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveIndex(i);
                        scrollToIndex(i);
                      }}
                      aria-label={`Show certification ${i + 1}`}
                      aria-current={active}
                      className="ce-dot h-2.5 rounded-full"
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
                  Show all {all.length} certifications
                </>
              )}
            </button>
          </div>
        )}

        {/* BOTTOM INFO */}
        <Reveal delay={100}>
          <div
            className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-dashed px-8 py-6"
            style={{ borderColor: 'var(--ce-accent-line)' }}
          >
            <p className="text-sm opacity-60">
              Learning never stops — more certifications on the way.
            </p>
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="ce-pulse h-2.5 w-2.5 rounded-full bg-green-500" />
              Always upskilling
            </div>
          </div>
        </Reveal>
      </div>

      {/* MODAL */}
      {selected && (
        <CertificationModal
          cert={selected}
          onClose={() => setSelected(null)}
          primary={theme.primary}
          base={theme['base-100']}
          text={theme['base-content']}
        />
      )}
    </section>
  );
};

export default Certifications;