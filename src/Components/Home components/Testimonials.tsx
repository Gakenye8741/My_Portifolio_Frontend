// src/Features/Pages/Testimonials.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../../ThemeContext';
import {
  MessageSquareQuote, Star, Quote, ExternalLink,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Loader2, RefreshCw, AlertCircle, MessageSquareOff,
  X, Sparkles, Send, User, Building2, Link2, CheckCircle2,
} from 'lucide-react';
import {
  useGetTestimonialsQuery,
  useCreateTestimonialMutation,
  getTestimonialErrorMessage,
  type TTestimonial,
} from '../../Features/Apis/Testimonials.Api';
import { toast } from 'react-hot-toast';

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
      className={`tm-reveal tm-${from} ${show ? "tm-show" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

/* ---------- Star rating ---------- */
const Stars = ({
  rating,
  primary,
  size = 13,
}: {
  rating: number | null;
  primary: string;
  size?: number;
}) => {
  const value = Math.max(0, Math.min(5, Number(rating) || 0));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < value;
        return (
          <Star
            key={i}
            size={size}
            strokeWidth={2}
            style={{
              color: filled ? primary : 'var(--tm-star-off)',
              fill: filled ? primary : 'transparent',
            }}
            className={filled ? 'tm-star-on' : ''}
          />
        );
      })}
      {value > 0 && (
        <span className="ml-1.5 text-[11px] font-bold tabular-nums opacity-70">
          {value}.0
        </span>
      )}
    </div>
  );
};

/* ---------- Initials ---------- */
const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

/* ---------- Avatar ---------- */
const Avatar = ({ t }: { t: TTestimonial }) => {
  const avatarUrl = t.authorAvatar?.fileUrl ?? null;
  return (
    <div className="tm-avatar grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full">
      {avatarUrl ? (
        <img src={avatarUrl} alt={t.authorName} className="h-full w-full object-cover" />
      ) : (
        <span className="text-sm font-black">{initialsOf(t.authorName) || '?'}</span>
      )}
    </div>
  );
};

/* ---------- One carousel card ---------- */
const TestimonialCard = ({
  t,
  primary,
  onOpen,
}: {
  t: TTestimonial;
  primary: string;
  onOpen: () => void;
}) => {
  const preview = t.content.length > 180 ? `${t.content.slice(0, 180).trim()}…` : t.content;
  return (
    <article
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open testimonial from ${t.authorName}`}
      className="tm-card group relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 cursor-pointer focus:outline-none focus-visible:ring-2"
      style={{ ['--tw-ring-color' as any]: primary }}
    >
      <div className="tm-quote-mark" aria-hidden="true">"</div>

      <div className="mb-4 flex items-center justify-between">
        <Stars rating={t.rating} primary={primary} />
        <Quote size={16} style={{ color: primary, opacity: 0.4 }} />
      </div>

      <p className="relative z-10 flex-1 text-sm leading-relaxed opacity-80 line-clamp-6">
        "{preview}"
      </p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
        className="mt-4 inline-flex items-center gap-1.5 self-start text-[11px] font-bold uppercase tracking-wider transition-transform group-hover:translate-x-0.5"
        style={{ color: primary }}
      >
        Read full <Sparkles size={11} />
      </button>

      <div
        className="mt-5 flex items-center gap-3 border-t pt-4"
        style={{ borderColor: 'var(--tm-text-line)' }}
      >
        <Avatar t={t} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{t.authorName}</p>
          {(t.authorRole || t.company) && (
            <p className="truncate text-[11px] opacity-55">
              {[t.authorRole, t.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {t.sourceUrl && (
          <a
            href={t.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={(e) => e.stopPropagation()}
            className="tm-source inline-flex items-center gap-1 text-[11px] font-bold"
            title="View source"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </article>
  );
};

/* ---------- Full testimonial modal ---------- */
const TestimonialModal = ({
  t,
  onClose,
  primary,
  base,
  text,
}: {
  t: TTestimonial;
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

  const avatarUrl = t.authorAvatar?.fileUrl ?? null;

  return (
    <div
      className="tm-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Testimonial from ${t.authorName}`}
    >
      <div
        className="tm-modal-panel relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: base,
          color: text,
          borderColor: `${primary}44`,
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close testimonial"
          className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full border transition hover:rotate-90"
          style={{ borderColor: `${text}30`, color: text }}
        >
          <X size={16} />
        </button>

        <div
          className="pointer-events-none absolute -top-2 -left-1 text-[8rem] leading-none font-serif font-black select-none"
          style={{ color: primary, opacity: 0.08 }}
          aria-hidden="true"
        >
          "
        </div>

        <div className="relative flex items-center justify-between">
          <Stars rating={t.rating} primary={primary} size={16} />
          <Quote size={20} style={{ color: primary, opacity: 0.5 }} />
        </div>

        <p
          className="relative mt-6 text-base sm:text-lg leading-relaxed whitespace-pre-line"
          style={{ color: text }}
        >
          "{t.content}"
        </p>

        <div
          className="mt-8 flex items-center gap-4 border-t pt-6"
          style={{ borderColor: `${text}18` }}
        >
          <div
            className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full"
            style={{ backgroundColor: `${primary}1f`, color: primary }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={t.authorName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-base font-black">{initialsOf(t.authorName) || '?'}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-base font-bold">{t.authorName}</p>
            {(t.authorRole || t.company) && (
              <p className="text-sm opacity-60">
                {[t.authorRole, t.company].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>

          {t.sourceUrl && (
            <a
              href={t.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition hover:-translate-y-0.5"
              style={{ borderColor: `${primary}55`, color: primary }}
            >
              <ExternalLink size={13} /> View source
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   WRITE A TESTIMONIAL MODAL
   ============================================================ */
const WriteTestimonialModal = ({
  onClose,
  primary,
  base,
  text,
}: {
  onClose: () => void;
  primary: string;
  base: string;
  text: string;
}) => {
  const [createTestimonial, { isLoading }] = useCreateTestimonialMutation();

  const [form, setForm] = useState({
    authorName: '',
    authorRole: '',
    company: '',
    content: '',
    rating: 0,
    sourceUrl: '',
  });

  const [submitted, setSubmitted] = useState(false);

  /* Body lock + Esc */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, isLoading]);

  const inputStyle: React.CSSProperties = {
    backgroundColor: `${text}06`,
    color: text,
    borderColor: `${text}20`,
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.authorName.trim() || !form.content.trim()) return;

    try {
      await createTestimonial({
        authorName: form.authorName.trim(),
        content: form.content.trim(),
        authorRole: form.authorRole.trim() || null,
        company: form.company.trim() || null,
        sourceUrl: form.sourceUrl.trim() || null,
        rating: form.rating > 0 ? form.rating : null,
        // ✅ Default to draft — admin reviews before publishing
        isPublished: false,
      }).unwrap();

      setSubmitted(true);
      toast.success('Thank you! Your testimonial was submitted for review.');
    } catch (err) {
      toast.error(getTestimonialErrorMessage(err as any) || 'Could not submit');
    }
  };

  return (
    <div
      className="tm-modal-overlay fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      onClick={() => !isLoading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Write a testimonial"
    >
      <div
        className="tm-modal-panel relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ backgroundColor: base, color: text, borderColor: `${primary}44` }}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-6 sm:px-8 pt-6 pb-4 border-b backdrop-blur-md"
          style={{
            borderColor: `${text}12`,
            backgroundColor: `${base}ee`,
            backgroundImage: `linear-gradient(135deg, ${primary}12, transparent 65%)`,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="grid place-items-center h-9 w-9 rounded-xl shrink-0"
                  style={{ backgroundColor: `${primary}1f`, color: primary }}
                >
                  <MessageSquareQuote size={18} />
                </span>
                <h2 className="text-lg sm:text-xl font-bold">Share your experience</h2>
              </div>
              <p className="text-xs sm:text-sm opacity-60">
                Did we work together? I'd love to hear what you thought.
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close"
              className="shrink-0 grid h-9 w-9 place-items-center rounded-full border transition hover:rotate-90 disabled:opacity-50"
              style={{ borderColor: `${text}30`, color: text }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="px-6 sm:px-8 py-12 flex flex-col items-center text-center gap-4">
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ backgroundColor: '#10b9811f', color: '#10b981' }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold">Thank you!</h3>
            <p className="max-w-sm text-sm opacity-60">
              Your testimonial was submitted and is pending review. Once approved, it'll
              appear on this page.
            </p>
            <button
              onClick={onClose}
              className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
              style={{ backgroundColor: primary, color: base }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 sm:px-8 py-6 space-y-4">
            {/* Name + role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                  Your name <span style={{ color: primary }}>*</span>
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    required
                    autoFocus
                    value={form.authorName}
                    onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full rounded-xl border py-3 pl-9 pr-4 text-sm outline-none focus:ring-2 transition"
                    style={{ ...inputStyle, ['--tw-ring-color' as any]: `${primary}55` }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                  Role (optional)
                </label>
                <input
                  value={form.authorRole}
                  onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                  placeholder="e.g. CTO"
                  className="w-full rounded-xl border py-3 px-4 text-sm outline-none focus:ring-2 transition"
                  style={{ ...inputStyle, ['--tw-ring-color' as any]: `${primary}55` }}
                />
              </div>
            </div>

            {/* Company + source */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                  Company (optional)
                </label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Acme Corp"
                    className="w-full rounded-xl border py-3 pl-9 pr-4 text-sm outline-none focus:ring-2 transition"
                    style={{ ...inputStyle, ['--tw-ring-color' as any]: `${primary}55` }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                  Profile / source URL (optional)
                </label>
                <div className="relative">
                  <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
                  <input
                    type="url"
                    value={form.sourceUrl}
                    onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/…"
                    className="w-full rounded-xl border py-3 pl-9 pr-4 text-sm font-mono outline-none focus:ring-2 transition"
                    style={{ ...inputStyle, ['--tw-ring-color' as any]: `${primary}55` }}
                  />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                Rating (optional)
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = form.rating >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, rating: active && form.rating === n ? 0 : n })}
                      aria-label={`Rate ${n} out of 5`}
                      className="grid place-items-center h-10 w-10 rounded-lg border transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: active ? primary : `${text}20`,
                        backgroundColor: active ? `${primary}14` : 'transparent',
                        color: active ? primary : text,
                      }}
                    >
                      <Star size={16} style={{ fill: active ? primary : 'none' }} />
                    </button>
                  );
                })}
                {form.rating > 0 && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, rating: 0 })}
                    className="ml-1 rounded-lg px-2 py-1 text-[10px] font-semibold opacity-60 hover:opacity-100 transition-opacity"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider opacity-60">
                  Your testimonial <span style={{ color: primary }}>*</span>
                </label>
                <span className="text-[10px] opacity-40 font-mono">{form.content.length} chars</span>
              </div>
              <textarea
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="What was it like working with me? What did we build together?"
                rows={5}
                className="w-full rounded-xl border py-3 px-4 text-sm outline-none focus:ring-2 transition resize-none"
                style={{ ...inputStyle, ['--tw-ring-color' as any]: `${primary}55` }}
              />
            </div>

            {/* Note */}
            <div
              className="rounded-xl px-3 py-2 text-[11px] inline-flex items-start gap-2"
              style={{
                backgroundColor: `${primary}0d`,
                border: `1px solid ${primary}33`,
                color: primary,
              }}
            >
              <Sparkles size={12} className="mt-0.5 shrink-0" />
              <span>
                Your testimonial will be reviewed before appearing on the site.
              </span>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-50"
                style={{ borderColor: `${text}20`, color: text }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !form.authorName.trim() || !form.content.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: primary, color: base }}
              >
                {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                Submit testimonial
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ---------- Main section ---------- */
const Testimonials = () => {
  const { theme } = useTheme();
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTestimonialsQuery();

  const [showAll, setShowAll] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<TTestimonial | null>(null);
  const [writeOpen, setWriteOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const reduce = useRef(false);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const all: TTestimonial[] = response?.data ?? [];
  const total = all.length;

  const scrollToIndex = useCallback((idx: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const children = container.querySelectorAll<HTMLElement>('[data-tm-card]');
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
    const children = container.querySelectorAll<HTMLElement>('[data-tm-card]');
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
    if (showAll || total < 2) return;
    if (paused || selected || writeOpen) return;
    if (reduce.current) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % total;
        scrollToIndex(next);
        return next;
      });
    }, 6000);
    return () => clearInterval(id);
  }, [paused, selected, writeOpen, showAll, total, scrollToIndex]);

  const goTo = (dir: -1 | 1) => {
    if (total === 0) return;
    const next = (activeIndex + dir + total) % total;
    setActiveIndex(next);
    scrollToIndex(next);
  };

  const onCarouselKey = (e: React.KeyboardEvent) => {
    if (showAll) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(-1);
    }
  };

  const rootStyle = {
    backgroundColor: theme["base-100"],
    color: theme["base-content"],
    "--tm-accent": theme.primary,
    "--tm-accent-soft": `${theme.primary}1f`,
    "--tm-accent-line": `${theme.primary}33`,
    "--tm-text-soft": `${theme["base-content"]}0d`,
    "--tm-text-line": `${theme["base-content"]}1a`,
    "--tm-star-off": `${theme["base-content"]}33`,
    "--tm-on-accent": theme["base-100"],
  } as React.CSSProperties;

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-40"
        style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
      >
        <style>{`
          @keyframes tmSpin { to { transform: rotate(360deg); } }
          @keyframes tmSpinSlow { to { transform: rotate(-360deg); } }
          @keyframes tmDotPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.6); opacity: .4; } }
        `}</style>
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 rounded-full border-2 border-dashed opacity-25"
            style={{ borderColor: theme.primary, animation: 'tmSpin 5s linear infinite' }}
          />
          <div
            className="absolute inset-1.5 rounded-full border-2"
            style={{
              borderColor: theme.primary,
              borderTopColor: 'transparent',
              borderRightColor: 'transparent',
              animation: 'tmSpinSlow 1.6s linear infinite',
            }}
          />
          <div
            className="absolute inset-0 m-auto h-2 w-2 rounded-full"
            style={{ backgroundColor: theme.primary, animation: 'tmDotPulse 1.4s ease-in-out infinite' }}
          />
        </div>
        <p className="text-sm opacity-50">Loading testimonials...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 py-40 text-center"
        style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
      >
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ backgroundColor: 'var(--tm-accent-soft)' }}
        >
          <AlertCircle size={28} style={{ color: theme.primary }} />
        </div>
        <p className="text-lg font-semibold">Sorry, the testimonials could not load.</p>
        <p className="max-w-md text-sm opacity-60">
          {getTestimonialErrorMessage(error) || "Please refresh the page and try again."}
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
      id="testimonials"
      className="relative overflow-hidden py-24 transition-colors duration-500"
      style={rootStyle}
    >
      <style>{`
        .tm-reveal { opacity: 0; transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1), filter .8s; will-change: transform, opacity, filter; }
        .tm-up    { transform: translateY(36px); }
        .tm-left  { transform: translateX(-50px); }
        .tm-right { transform: translateX(50px); }
        .tm-zoom  { transform: scale(.9) translateY(20px); }
        .tm-blur  { transform: translateY(20px); filter: blur(8px); }
        .tm-show  { opacity: 1; transform: none; filter: none; }

        @keyframes tmWord { from { opacity: 0; transform: translateY(70%) rotate(3deg); } to { opacity: 1; transform: none; } }
        .tm-mask { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: .08em; }
        .tm-word { display: inline-block; opacity: 0; animation: tmWord .9s cubic-bezier(.2,.7,.2,1) forwards; }

        .tm-card {
          border-color: var(--tm-text-line);
          background-color: var(--tm-text-soft);
          position: relative; overflow: hidden;
          transition: transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .5s, border-color .3s;
        }
        .tm-card:hover {
          border-color: var(--tm-accent);
          transform: translateY(-6px);
          box-shadow: 0 24px 48px -22px var(--tm-accent-soft), 0 10px 20px -12px rgba(0,0,0,.15);
        }
        .tm-card::after {
          content: ""; position: absolute; inset: auto 0 0 0; height: 3px;
          background: var(--tm-accent);
          transform: scaleX(0); transform-origin: left;
          transition: transform .5s ease;
        }
        .tm-card:hover::after { transform: scaleX(1); }
        .tm-card::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.08) 45%, transparent 60%);
          transform: translateX(-120%);
          transition: transform .9s cubic-bezier(.2,.7,.2,1);
          pointer-events: none;
        }
        .tm-card:hover::before { transform: translateX(120%); }

        .tm-quote-mark {
          position: absolute; top: -8px; right: -4px;
          font-size: 6rem; line-height: 1;
          color: var(--tm-accent); opacity: .06;
          font-family: Georgia, serif; font-weight: 900;
          pointer-events: none;
          transition: opacity .5s, transform .7s cubic-bezier(.2,.7,.2,1);
        }
        .tm-card:hover .tm-quote-mark { opacity: .12; transform: rotate(-8deg) scale(1.05); }

        .tm-avatar {
          background: var(--tm-accent-soft);
          color: var(--tm-accent);
          transition: transform .5s cubic-bezier(.3,1.6,.5,1);
        }
        .tm-card:hover .tm-avatar { transform: scale(1.05) rotate(-4deg); }

        @keyframes tmStarPop { 0% { transform: scale(.6) rotate(-15deg); opacity: 0; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        .tm-star-on { animation: tmStarPop .4s cubic-bezier(.3,1.6,.5,1) both; }

        .tm-source { transition: color .3s, transform .3s; color: var(--tm-accent); }
        .tm-source:hover { transform: translateX(2px); }

        .tm-track { scrollbar-width: none; -ms-overflow-style: none; scroll-behavior: smooth; }
        .tm-track::-webkit-scrollbar { display: none; }
        .tm-slide { scroll-snap-align: center; flex: 0 0 auto; }

        .tm-fade-left, .tm-fade-right {
          position: absolute; top: 0; bottom: 0; width: 60px; z-index: 5; pointer-events: none;
        }
        .tm-fade-left { left: 0; background: linear-gradient(to right, var(--tm-base), transparent); }
        .tm-fade-right { right: 0; background: linear-gradient(to left, var(--tm-base), transparent); }

        .tm-dot { transition: width .3s, background-color .3s, opacity .3s; }
        .tm-dot:hover { opacity: 1 !important; }

        @keyframes tmModalIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tmOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .tm-modal-overlay {
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(6px);
          animation: tmOverlayIn .25s ease-out;
        }
        .tm-modal-panel { animation: tmModalIn .35s cubic-bezier(.2,.7,.2,1); }

        @keyframes tmOrbit { to { transform: rotate(360deg); } }
        .tm-orbit { animation: tmOrbit 45s linear infinite; }
        @keyframes tmOrbitDot { to { transform: rotate(360deg); } }
        .tm-orbit-dot { animation: tmOrbitDot 18s linear infinite; transform-origin: center; }

        @keyframes tmDrift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-30px,30px); } }
        .tm-drift { animation: tmDrift 12s ease-in-out infinite; }

        @keyframes tmFloat1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(20px,-18px); } }
        @keyframes tmFloat2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-16px,22px); } }
        @keyframes tmFloat3 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(12px,16px); } }
        .tm-float-1 { animation: tmFloat1 11s ease-in-out infinite; }
        .tm-float-2 { animation: tmFloat2 14s ease-in-out infinite; }
        .tm-float-3 { animation: tmFloat3 9s ease-in-out infinite; }

        @keyframes tmPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); } 50% { box-shadow: 0 0 0 8px rgba(34,197,94,0); } }
        .tm-pulse { animation: tmPulse 2.2s ease-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .tm-reveal { opacity: 1; transform: none; filter: none; transition: none; }
          .tm-word { opacity: 1; animation: none; transform: none; }
          .tm-orbit, .tm-orbit-dot, .tm-drift, .tm-pulse,
          .tm-float-1, .tm-float-2, .tm-float-3, .tm-star-on,
          .tm-modal-overlay, .tm-modal-panel { animation: none; }
          .tm-card, .tm-card:hover, .tm-card::before, .tm-card::after { transition: none; transform: none; }
          .tm-avatar, .tm-card:hover .tm-avatar, .tm-quote-mark { transition: none; transform: none; }
          .tm-track { scroll-behavior: auto; }
        }
      `}</style>

      <div
        className="tm-orbit pointer-events-none absolute -right-52 top-0 h-[34rem] w-[34rem] rounded-full border-2 border-dashed opacity-[0.1]"
        style={{ borderColor: theme.primary }}
      >
        <div
          className="tm-orbit-dot absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: theme.primary, transformOrigin: '0 17rem' }}
        />
      </div>
      <div
        className="tm-drift pointer-events-none absolute -left-32 bottom-20 h-80 w-80 rounded-full opacity-10 blur-[120px]"
        style={{ backgroundColor: theme.primary }}
      />
      <div className="tm-float-1 pointer-events-none absolute right-[8%] top-[30%] h-2 w-2 rounded-full opacity-40" style={{ backgroundColor: theme.primary }} />
      <div className="tm-float-2 pointer-events-none absolute left-[12%] top-[22%] h-1.5 w-1.5 rounded-full opacity-30" style={{ backgroundColor: theme.primary }} />
      <div className="tm-float-3 pointer-events-none absolute right-[20%] bottom-[15%] h-2.5 w-2.5 rounded-full opacity-20" style={{ backgroundColor: theme.primary }} />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-16">
        {/* HEADER */}
        <div className="mb-12 text-center lg:text-left">
          <h2 className="text-4xl font-extrabold leading-[1.08] tracking-tight md:text-6xl xl:text-7xl">
            {["What", "people"].map((w, i) => (
              <span key={w} className="tm-mask mr-[0.25em]">
                <span className="tm-word" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>{w}</span>
              </span>
            ))}
            <br className="hidden sm:block" />
            <span className="tm-mask">
              <span className="tm-word" style={{ animationDelay: "0.34s" }}>say </span>
            </span>
            <span className="tm-mask">
              <span className="tm-word" style={{ animationDelay: "0.5s", color: theme.primary }}>about me.</span>
            </span>
          </h2>
          <Reveal delay={500}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed opacity-65 lg:mx-0">
              A few words from the people I've had the pleasure of building with.
              Click any card to read the full story.
            </p>
          </Reveal>

          {/* ✅ Write a testimonial CTA */}
          <Reveal delay={600}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <button
                onClick={() => setWriteOpen(true)}
                className="group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
              >
                <MessageSquareQuote
                  size={16}
                  className="transition-transform group-hover:rotate-[-8deg]"
                />
                Write a testimonial
              </button>
            </div>
          </Reveal>
        </div>

        {/* EMPTY */}
        {all.length === 0 ? (
          <Reveal from="zoom">
            <div
              className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center"
              style={{ borderColor: 'var(--tm-accent-line)' }}
            >
              <div
                className="grid h-16 w-16 place-items-center rounded-full"
                style={{ backgroundColor: 'var(--tm-accent-soft)' }}
              >
                <MessageSquareOff size={28} style={{ color: theme.primary }} />
              </div>
              <h3 className="text-xl font-bold">No testimonials yet</h3>
              <p className="max-w-sm text-sm opacity-60">
                Kind words from clients and collaborators will appear here soon.
                Worked with me? Be the first to share your experience.
              </p>
              <button
                onClick={() => setWriteOpen(true)}
                className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
              >
                <MessageSquareQuote size={15} /> Write the first testimonial
              </button>
            </div>
          </Reveal>
        ) : showAll ? (
          <div
            key="list"
            className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {all.map((t, i) => (
              <Reveal key={t.id} from={i === 0 ? 'zoom' : 'blur'} delay={(i % 6) * 80}>
                <TestimonialCard t={t} primary={theme.primary} onOpen={() => setSelected(t)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="tm-fade-left hidden sm:block" style={{ ['--tm-base' as any]: theme['base-100'] }} />
            <div className="tm-fade-right hidden sm:block" style={{ ['--tm-base' as any]: theme['base-100'] }} />

            <div
              ref={scrollRef}
              className="tm-track flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 px-1"
              style={{ scrollPaddingLeft: '1rem', scrollPaddingRight: '1rem' }}
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocus={() => setPaused(true)}
              onBlur={() => setPaused(false)}
              onScroll={onScroll}
              onKeyDown={onCarouselKey}
              tabIndex={0}
              role="region"
              aria-label="Testimonials carousel. Use arrow keys to navigate."
            >
              {all.map((t, i) => (
                <div
                  key={t.id}
                  data-tm-card
                  className="tm-slide w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.834rem)] min-w-0"
                >
                  <Reveal from={i === 0 ? 'zoom' : 'blur'} delay={(i % 3) * 80}>
                    <TestimonialCard
                      t={t}
                      primary={theme.primary}
                      onOpen={() => setSelected(t)}
                    />
                  </Reveal>
                </div>
              ))}
            </div>

            {total > 1 && (
              <>
                <button
                  onClick={() => goTo(-1)}
                  aria-label="Previous testimonial"
                  className="hidden md:grid absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 h-12 w-12 place-items-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-110 active:scale-95"
                  style={{
                    borderColor: 'var(--tm-accent-line)',
                    backgroundColor: `${theme['base-100']}cc`,
                    color: theme.primary,
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => goTo(1)}
                  aria-label="Next testimonial"
                  className="hidden md:grid absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 h-12 w-12 place-items-center rounded-full border shadow-lg backdrop-blur-md transition hover:scale-110 active:scale-95"
                  style={{
                    borderColor: 'var(--tm-accent-line)',
                    backgroundColor: `${theme['base-100']}cc`,
                    color: theme.primary,
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {total > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {all.map((_, i) => {
                  const active = i === activeIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveIndex(i);
                        scrollToIndex(i);
                      }}
                      aria-label={`Show testimonial ${i + 1}`}
                      aria-current={active}
                      className="tm-dot h-2.5 rounded-full"
                      style={{
                        width: active ? 36 : 10,
                        backgroundColor: active ? theme.primary : `${theme['base-content']}33`,
                        opacity: active ? 1 : 0.6,
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SHOW ALL / BACK TO CAROUSEL */}
        {all.length > 0 && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="group inline-flex items-center gap-2 rounded-full border px-7 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
              style={{ borderColor: theme.primary, color: theme.primary }}
            >
              {showAll ? (
                <>
                  <ChevronUp size={16} className="transition-transform group-hover:-translate-y-0.5" />
                  Back to carousel
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="transition-transform group-hover:translate-y-0.5" />
                  Show all {all.length} in a list
                </>
              )}
            </button>
          </div>
        )}

        {/* BOTTOM INFO */}
        <Reveal delay={100}>
          <div
            className="mt-20 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-dashed px-8 py-6"
            style={{ borderColor: 'var(--tm-accent-line)' }}
          >
            <p className="text-sm opacity-60">
              Have we worked together? I'd love to hear from you.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setWriteOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ borderColor: theme.primary, color: theme.primary }}
              >
                <Send size={14} /> Leave a testimonial
              </button>
              <span className="tm-pulse h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Open to new opportunities</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* READ MODAL */}
      {selected && (
        <TestimonialModal
          t={selected}
          onClose={() => setSelected(null)}
          primary={theme.primary}
          base={theme['base-100']}
          text={theme['base-content']}
        />
      )}

      {/* ✅ WRITE MODAL */}
      {writeOpen && (
        <WriteTestimonialModal
          onClose={() => setWriteOpen(false)}
          primary={theme.primary}
          base={theme['base-100']}
          text={theme['base-content']}
        />
      )}
    </section>
  );
};

export default Testimonials;