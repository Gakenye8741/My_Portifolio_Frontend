import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  motion,
  useScroll,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Eye,
  Calendar,
  Tag,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  Share2,
  Star,
  Flame,
  Heart,
  MessageSquare,
  BookOpen,
  ChevronRight,
} from "lucide-react";

import logo from "../../public/LOGO.png";
import { Navbar } from "../Components/Navbar";
import Footer from "../Components/Footer";
import PageTitle from "../Components/PageTitle";
import SEO from "../Components/SEO";
import VirtualAssistant from "../Components/VirtualAssistant";
import { useTheme } from "../ThemeContext";

import {
  useGetPostBySlugQuery,
  useGetPostReactionsQuery,
  useAddPostReactionMutation,
  useGetPostRatingsQuery,
  useRatePostMutation,
  useGetPostsQuery,
  getPostErrorMessage,
  type TPost,
  type TReactionType,
} from "../Features/Apis/PostApi";

/* ---------- helpers ---------- */

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/* Stable visitorId for ratings (stored in localStorage) */
const getVisitorId = () => {
  try {
    const key = "blog-visitor-id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = `visitor-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`;
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `visitor-anon-${Date.now()}`;
  }
};

/* ---------- page ---------- */

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { theme } = useTheme();
  const reduce = useReducedMotion();

  const base = theme["base-100"];
  const text = theme["base-content"];
  const primary = theme.primary;
  const secondary = theme.secondary || primary;
  const soft = `${text}18`;
  const muted = `${text}b0`;

  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [rated, setRated] = useState(false);

  const {
    data: postResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPostBySlugQuery(slug ?? "", { skip: !slug });

  const post: TPost | undefined = postResponse?.data;

  const { data: reactionsResponse } = useGetPostReactionsQuery(
    post?.id ?? "",
    { skip: !post?.id }
  );
  const { data: ratingsResponse } = useGetPostRatingsQuery(
    post?.id ?? "",
    { skip: !post?.id }
  );

  const [addReaction] = useAddPostReactionMutation();
  const [ratePost] = useRatePostMutation();

  const { data: relatedResponse } = useGetPostsQuery(
    { status: "published" },
    { skip: !post?.id }
  );

  const reactions = reactionsResponse?.data ?? {};
  const ratings = ratingsResponse?.data ?? { avg: 0, count: 0 };

  const related: TPost[] = (relatedResponse?.data ?? [])
    .filter((p) => p.id !== post?.id)
    .slice(0, 3);

  /* Reading progress bar */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  /* Scroll to top when slug changes */
  useEffect(() => {
    window.scrollTo(0, 0);
    setRating(0);
    setRated(false);
  }, [slug]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Clipboard not available */
    }
  };

  const onReact = async (reaction: TReactionType) => {
    if (!post?.id) return;
    try {
      await addReaction({ id: post.id, reaction }).unwrap();
    } catch {
      /* Silent */
    }
  };

  const onRate = async (value: number) => {
    if (!post?.id) return;
    try {
      await ratePost({
        id: post.id,
        visitorId: getVisitorId(),
        rating: value,
      }).unwrap();
      setRating(value);
      setRated(true);
    } catch {
      /* Silent */
    }
  };

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <Shell base={base} text={text}>
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <Loader2 size={40} className="animate-spin" style={{ color: primary }} />
          <p className="text-sm opacity-55">Loading post…</p>
        </div>
      </Shell>
    );
  }

  /* ---------- Error / not found ---------- */
  if (isError || !post) {
    return (
      <Shell base={base} text={text}>
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <div
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{ backgroundColor: `${primary}1f` }}
          >
            <AlertCircle size={28} style={{ color: primary }} />
          </div>
          <h2 className="text-xl font-bold">Post not found</h2>
          <p className="max-w-md text-sm opacity-60">
            {getPostErrorMessage(error) ||
              "This post may have been unpublished or deleted."}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg"
              style={{ backgroundColor: primary, color: base }}
            >
              <RefreshCw size={14} /> Try again
            </button>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold"
              style={{ borderColor: `${text}33`, color: text }}
            >
              <ArrowLeft size={14} /> All blogs
            </Link>
          </div>
        </div>
      </Shell>
    );
  }

  const date = formatDate(post.createdAt);

  /* ---------- Full post ---------- */
  return (
    <main
      className="min-h-screen relative"
      style={{ backgroundColor: base, color: text, overflowX: "clip" }}
    >
      <SEO
        title={`${post.title} | Gakenye Ndiritu`}
        description={post.excerpt ?? post.content.slice(0, 160)}
        path={`/blog/${post.slug}`}
      />
      <PageTitle title={post.title} />
      <Navbar />

      <style>{`
        @keyframes pst-blob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-30px) scale(1.15); } }
        @keyframes pst-spin { to { transform: rotate(360deg); } }
        .pst-blob { animation: pst-blob 12s ease-in-out infinite; }
        .pst-spin { animation: pst-spin 26s linear infinite; }

        /* Prose — no external plugin needed */
        .pst-prose { font-size: 1.0625rem; line-height: 1.85; }
        .pst-prose > * + * { margin-top: 1.1em; }
        .pst-prose h2 { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.02em; margin-top: 2.4rem; line-height: 1.25; }
        .pst-prose h3 { font-size: 1.3rem; font-weight: 700; margin-top: 1.9rem; line-height: 1.3; }
        .pst-prose h4 { font-size: 1.1rem; font-weight: 700; margin-top: 1.5rem; }
        .pst-prose p { white-space: pre-line; }
        .pst-prose a { color: var(--pst-accent); text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
        .pst-prose strong { font-weight: 700; }
        .pst-prose em { font-style: italic; }
        .pst-prose ul { padding-left: 1.5rem; list-style: disc; }
        .pst-prose ol { padding-left: 1.5rem; list-style: decimal; }
        .pst-prose li + li { margin-top: 0.4rem; }
        .pst-prose code {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.9em;
          padding: 0.15em 0.4em;
          border-radius: 6px;
          background: color-mix(in srgb, var(--pst-accent) 12%, transparent);
          color: var(--pst-accent);
        }
        .pst-prose pre {
          overflow-x: auto;
          padding: 1rem 1.25rem;
          border-radius: 14px;
          border: 1px solid var(--pst-soft);
          background: color-mix(in srgb, var(--pst-text) 6%, transparent);
          font-size: 0.9rem;
          line-height: 1.55;
        }
        .pst-prose pre code { background: transparent; color: inherit; padding: 0; font-size: inherit; }
        .pst-prose blockquote {
          border-left: 3px solid var(--pst-accent);
          padding-left: 1rem;
          font-style: italic;
          opacity: 0.9;
        }
        .pst-prose img { max-width: 100%; border-radius: 14px; margin: 1.5rem 0; }
        .pst-prose hr {
          margin: 2rem 0;
          border: 0;
          border-top: 1px solid var(--pst-soft);
        }

        @media (prefers-reduced-motion: reduce) {
          .pst-blob, .pst-spin { animation: none !important; }
        }
      `}</style>

      {/* Reading progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[60]"
        style={{ scaleX: progress, backgroundColor: primary }}
      />

      {/* Background logo */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="w-[90vw] h-[90vw] sm:w-[60vw] sm:h-[60vw] object-contain opacity-[0.02] select-none"
        />
      </div>

      {/* Dots pattern */}
      <div
        className="absolute inset-x-0 top-0 h-[34rem] pointer-events-none opacity-50"
        style={{
          backgroundImage: `radial-gradient(${text}26 1px, transparent 1px)`,
          backgroundSize: "26px 26px",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black 20%, transparent 75%)",
        }}
      />
      <div
        className="pst-blob absolute -top-24 -right-24 w-[24rem] h-[24rem] rounded-full blur-[130px] opacity-20 pointer-events-none"
        style={{ backgroundColor: primary }}
      />
      <div
        className="pst-blob absolute top-[40rem] -left-24 w-[20rem] h-[20rem] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ backgroundColor: secondary, animationDelay: "-5s" }}
      />

      <div
        className="relative z-10 max-w-6xl mx-auto px-6 pt-28 md:pt-32 pb-24"
        style={
          {
            "--pst-accent": primary,
            "--pst-text": text,
            "--pst-soft": soft,
          } as React.CSSProperties
        }
      >
        {/* Back row */}
        <div className="mb-10 flex items-center justify-between">
          <Link
            to="/blog"
            className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all hover:-translate-x-0.5"
            style={{ borderColor: soft, color: text }}
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-0.5"
            />
            All posts
          </Link>

          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5"
            style={{ borderColor: soft, color: text }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-12 lg:gap-12 gap-10">
          {/* ================= MAIN ================= */}
          <article className="lg:col-span-8">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-5 text-xs">
              {post.isFeatured && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-bold uppercase tracking-wider text-[10px]"
                  style={{ backgroundColor: `${primary}1f`, color: primary }}
                >
                  <Sparkles size={10} /> Featured
                </span>
              )}
              {post.readingTime && (
                <span className="inline-flex items-center gap-1 opacity-60">
                  <Clock size={12} /> {post.readingTime} min read
                </span>
              )}
              {date && (
                <span className="inline-flex items-center gap-1 opacity-60">
                  <Calendar size={12} /> {date}
                </span>
              )}
              <span className="inline-flex items-center gap-1 opacity-60">
                <Eye size={12} /> {post.viewCount} views
              </span>
            </div>

            {/* Title */}
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]"
            >
              {post.title}
            </motion.h1>

            {/* Animated accent underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
              className="mt-5 h-[3px] w-20 rounded-full origin-left"
              style={{
                background: `linear-gradient(90deg, ${primary}, ${secondary})`,
              }}
            />

            {/* Excerpt */}
            {post.excerpt && (
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="mt-6 text-lg md:text-xl leading-relaxed"
                style={{ color: muted }}
              >
                {post.excerpt}
              </motion.p>
            )}

            {/* Tags (mobile only — sidebar has them on desktop) */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
                {post.tags.map((t) => (
                  <Link
                    key={t.slug}
                    to={`/blog?tag=${t.slug}`}
                    className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5"
                    style={{ borderColor: `${primary}55`, color: primary }}
                  >
                    <Tag size={11} /> {t.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Divider */}
            <div
              className="my-10 h-px w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${soft}, transparent)`,
              }}
            />

            {/* Content */}
            <div className="pst-prose" style={{ color: text }}>
              {post.content}
            </div>

            {/* Divider */}
            <div
              className="my-12 h-px w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${soft}, transparent)`,
              }}
            />

            {/* Reactions + Rating */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Reactions */}
              <div
                className="rounded-3xl border p-6 space-y-4"
                style={{ borderColor: soft, backgroundColor: `${text}05` }}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} style={{ color: primary }} />
                  <p className="text-xs font-bold uppercase tracking-wider opacity-55">
                    Reactions
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onReact("like")}
                    className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow"
                    style={{ borderColor: soft, color: text }}
                  >
                    <Heart
                      size={16}
                      className="transition-transform group-hover:scale-125"
                      style={{ color: primary }}
                    />
                    <span>Like</span>
                    <span
                      className="ml-1 rounded-full px-2 py-0.5 text-xs"
                      style={{ backgroundColor: `${primary}1f`, color: primary }}
                    >
                      {reactions.like ?? 0}
                    </span>
                  </button>
                  <button
                    onClick={() => onReact("fire")}
                    className="group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow"
                    style={{ borderColor: soft, color: text }}
                  >
                    <Flame
                      size={16}
                      className="transition-transform group-hover:scale-125"
                      style={{ color: primary }}
                    />
                    <span>Fire</span>
                    <span
                      className="ml-1 rounded-full px-2 py-0.5 text-xs"
                      style={{ backgroundColor: `${primary}1f`, color: primary }}
                    >
                      {reactions.fire ?? 0}
                    </span>
                  </button>
                </div>
              </div>

              {/* Ratings */}
              <div
                className="rounded-3xl border p-6 space-y-4"
                style={{ borderColor: soft, backgroundColor: `${text}05` }}
              >
                <div className="flex items-center gap-2">
                  <Star size={14} style={{ color: primary }} />
                  <p className="text-xs font-bold uppercase tracking-wider opacity-55">
                    Rate this post
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = (hoverRating || rating) >= n;
                    return (
                      <button
                        key={n}
                        onClick={() => onRate(n)}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                        className="transition-transform hover:scale-125 active:scale-95"
                      >
                        <Star
                          size={24}
                          style={{
                            color: active ? primary : `${text}33`,
                            fill: active ? primary : "transparent",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs opacity-60">
                  {ratings.count > 0
                    ? `${ratings.avg.toFixed(1)} · ${ratings.count} vote${ratings.count === 1 ? "" : "s"}`
                    : "Be the first to rate"}
                </p>
                {rated && (
                  <p className="text-xs font-semibold" style={{ color: primary }}>
                    Thanks for your rating!
                  </p>
                )}
              </div>
            </div>

            {/* Share button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                style={{ backgroundColor: primary, color: base }}
              >
                <Share2 size={15} />
                Share this post
              </button>
            </div>
          </article>

          {/* ================= SIDEBAR ================= */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-5">
              {/* About this post */}
              <div
                className="rounded-3xl border p-6 space-y-5"
                style={{ borderColor: soft, backgroundColor: `${text}05` }}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={14} style={{ color: primary }} />
                  <p className="text-xs font-bold uppercase tracking-wider opacity-55">
                    About this post
                  </p>
                </div>

                <dl className="space-y-3 text-sm">
                  {post.readingTime && (
                    <div className="flex justify-between gap-4">
                      <dt className="opacity-55">Reading time</dt>
                      <dd className="font-semibold">{post.readingTime} min</dd>
                    </div>
                  )}
                  {date && (
                    <div className="flex justify-between gap-4">
                      <dt className="opacity-55">Published</dt>
                      <dd className="font-semibold">{date}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-4">
                    <dt className="opacity-55">Views</dt>
                    <dd className="font-semibold">{post.viewCount}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="opacity-55">Rating</dt>
                    <dd className="font-semibold" style={{ color: primary }}>
                      {ratings.count > 0 ? ratings.avg.toFixed(1) : "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div
                  className="rounded-3xl border p-6 space-y-4 hidden lg:block"
                  style={{ borderColor: soft, backgroundColor: `${text}05` }}
                >
                  <div className="flex items-center gap-2">
                    <Tag size={14} style={{ color: primary }} />
                    <p className="text-xs font-bold uppercase tracking-wider opacity-55">
                      Tags
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <Link
                        key={t.slug}
                        to={`/blog?tag=${t.slug}`}
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5"
                        style={{ borderColor: `${primary}55`, color: primary }}
                      >
                        #{t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Reactions snapshot */}
              <div
                className="rounded-3xl border p-6 space-y-4 hidden lg:block"
                style={{ borderColor: soft, backgroundColor: `${text}05` }}
              >
                <p className="text-xs font-bold uppercase tracking-wider opacity-55">
                  Community
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl p-3" style={{ backgroundColor: `${primary}12` }}>
                    <p className="text-xs opacity-60 mb-1">Likes</p>
                    <p className="text-lg font-extrabold" style={{ color: primary }}>
                      {reactions.like ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl p-3" style={{ backgroundColor: `${primary}12` }}>
                    <p className="text-xs opacity-60 mb-1">Fires</p>
                    <p className="text-lg font-extrabold" style={{ color: primary }}>
                      {reactions.fire ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl p-3" style={{ backgroundColor: `${primary}12` }}>
                    <p className="text-xs opacity-60 mb-1">Votes</p>
                    <p className="text-lg font-extrabold" style={{ color: primary }}>
                      {ratings.count}
                    </p>
                  </div>
                </div>
              </div>

              {/* Share */}
              <button
                onClick={copyLink}
                className="hidden lg:flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ borderColor: soft, color: text }}
              >
                {copied ? <Check size={15} /> : <Share2 size={15} />}
                {copied ? "Link copied" : "Share this post"}
              </button>
            </div>
          </aside>
        </div>

        {/* ================= RELATED ================= */}
        {related.length > 0 && (
          <section className="mt-24 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-55 mb-2">
                  Keep reading
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Read next
                </h2>
              </div>
              <Link
                to="/blog"
                className="group inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color: primary }}
              >
                All blogs
                <ChevronRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/blog/${p.slug}`}
                  className="group relative rounded-3xl border overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col"
                  style={{ borderColor: soft, backgroundColor: `${text}05` }}
                >
                  <div
                    className="h-2 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${primary}, ${secondary})`,
                    }}
                  />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[11px] mb-2">
                      {p.readingTime ? (
                        <span className="inline-flex items-center gap-1 opacity-60">
                          <Clock size={11} /> {p.readingTime} min
                        </span>
                      ) : (
                        <span className="opacity-60">Post</span>
                      )}
                    </div>
                    <h3 className="text-base font-bold leading-snug line-clamp-2 mb-2">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="text-xs opacity-60 line-clamp-2">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-auto pt-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-[11px] opacity-55">
                        <Eye size={11} /> {p.viewCount}
                      </span>
                      <span
                        className="text-xs font-bold inline-flex items-center gap-1"
                        style={{ color: primary }}
                      >
                        Read
                        <ChevronRight
                          size={13}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
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

const Shell = ({
  children,
  base,
  text,
}: {
  children: React.ReactNode;
  base: string;
  text: string;
}) => (
  <main
    className="min-h-screen relative flex flex-col"
    style={{ backgroundColor: base, color: text }}
  >
    <Navbar />
    <div className="flex-1 flex items-center justify-center px-6 pt-32 pb-20">
      {children}
    </div>
    <Footer />
  </main>
);

export default BlogPostPage;