import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import {
  Search,
  X,
  Clock,
  Eye,
  Tag,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  RefreshCw,
  Loader2,
  BookOpen,
  SearchX,
  ChevronDown,
  Bookmark,
  Flame,
} from "lucide-react";

import logo from "../../public/LOGO.png";
import { Navbar } from "../Components/Navbar";
import Footer from "../Components/Footer";
import PageTitle from "../Components/PageTitle";
import SEO from "../Components/SEO";
import VirtualAssistant from "../Components/VirtualAssistant";
import { useTheme } from "../ThemeContext";
import {
  getPostErrorMessage,
  type TPost,
  useGetPostsQuery,
} from "../Features/Apis/PostApi";

/* ---------- helpers ---------- */

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: [0.2, 0.7, 0.2, 1] },
  },
};

const followMouse = (e: React.MouseEvent<HTMLElement>) => {
  const box = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - box.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - box.top}px`);
};

type SortKey = "newest" | "oldest" | "views" | "title";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "views", label: "Most viewed" },
  { value: "title", label: "Title A–Z" },
];

/* ---------- page ---------- */

const BlogPage = () => {
  const { theme } = useTheme();
  const reduce = useReducedMotion();

  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") ?? "");
  const [activeTag, setActiveTag] = useState<string | null>(
    searchParams.get("tag")
  );
  const [sort, setSort] = useState<SortKey>("newest");

  const base = theme["base-100"];
  const text = theme["base-content"];
  const primary = theme.primary;
  const secondary = theme.secondary || primary;
  const soft = `${text}18`;
  const muted = `${text}b0`;

  /* Sync URL when search/filter change */
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (activeTag) params.set("tag", activeTag);
    setSearchParams(params, { replace: true });
  }, [searchTerm, activeTag, setSearchParams]);

  /* Fetch — only published posts */
  const {
    data: postsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPostsQuery({ status: "published" });

  const posts: TPost[] = postsResponse?.data ?? [];

  /* Featured post */
  const featured: TPost | null = useMemo(() => {
    if (posts.length === 0) return null;
    return posts.find((p) => p.isFeatured) ?? posts[0];
  }, [posts]);

  /* All tags */
  const allTags = useMemo(() => {
    const map = new Map<string, string>();
    posts.forEach((p) =>
      p.tags?.forEach((t) => map.set(t.slug, t.name))
    );
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [posts]);

  /* Client-side filter + sort */
  const visible = useMemo(() => {
    let list = posts.filter((p) => p.id !== featured?.id);

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.excerpt ?? "").toLowerCase().includes(term) ||
          p.content.toLowerCase().includes(term) ||
          p.tags?.some((t) => t.name.toLowerCase().includes(term))
      );
    }

    if (activeTag) {
      list = list.filter((p) => p.tags?.some((t) => t.slug === activeTag));
    }

    switch (sort) {
      case "oldest":
        list = [...list].sort(
          (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)
        );
        break;
      case "views":
        list = [...list].sort((a, b) => b.viewCount - a.viewCount);
        break;
      case "title":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "newest":
      default:
        list = [...list].sort(
          (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
        );
        break;
    }

    return list;
  }, [posts, featured, searchTerm, activeTag, sort]);

  /* Stat strip (posts + reading time sum) */
  const totalReadingMinutes = useMemo(
    () => posts.reduce((sum, p) => sum + (p.readingTime ?? 0), 0),
    [posts]
  );

  /* Scroll progress */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <PageShell base={base} text={text}>
        <div className="flex flex-col items-center justify-center gap-4 py-40">
          <Loader2 size={40} className="animate-spin" style={{ color: primary }} />
          <p className="text-sm opacity-55">Loading posts…</p>
        </div>
      </PageShell>
    );
  }

  /* ---------- Error ---------- */
  if (isError) {
    return (
      <PageShell base={base} text={text}>
        <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
          <div
            className="grid h-16 w-16 place-items-center rounded-full"
            style={{ backgroundColor: `${primary}1f` }}
          >
            <AlertCircle size={28} style={{ color: primary }} />
          </div>
          <h2 className="text-xl font-bold">Posts could not load</h2>
          <p className="max-w-md text-sm opacity-60">
            {getPostErrorMessage(error) ||
              "Please refresh the page and try again."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ backgroundColor: primary, color: base }}
          >
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      </PageShell>
    );
  }

  /* ---------- Empty ---------- */
  if (posts.length === 0) {
    return (
      <PageShell base={base} text={text}>
        <div className="flex flex-col items-center justify-center gap-5 py-32 text-center px-6">
          <div
            className="grid h-20 w-20 place-items-center rounded-3xl"
            style={{ backgroundColor: `${primary}1f` }}
          >
            <BookOpen size={36} style={{ color: primary }} />
          </div>
          <h2 className="text-2xl font-bold">No posts yet</h2>
          <p className="max-w-md text-sm opacity-60">
            I haven't published anything here yet. Check back soon — I write
            about building things, engineering decisions, and lessons learned.
          </p>
          <Link
            to="/"
            className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ backgroundColor: primary, color: base }}
          >
            Back home <ArrowRight size={16} />
          </Link>
        </div>
      </PageShell>
    );
  }

  /* ---------- Main ---------- */
  return (
    <main
      className="min-h-screen relative"
      style={{ backgroundColor: base, color: text, overflowX: "clip" }}
    >
      <SEO
        title="Gakenye Ndiritu | Blog"
        description="Notes on engineering, building products, and lessons from real projects — written by Gakenye Ndiritu."
        path="/blog"
      />

      <style>{`
        @keyframes blg-blob { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-30px) scale(1.15); } }
        @keyframes blg-spin { to { transform: rotate(360deg); } }
        @keyframes blg-ping { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(2.4); opacity: 0; } }
        .blg-blob { animation: blg-blob 12s ease-in-out infinite; }
        .blg-spin { animation: blg-spin 26s linear infinite; }
        .blg-ping { animation: blg-ping 2s ease-out infinite; }
        .blg-card::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.06) 45%, transparent 60%);
          transform: translateX(-120%);
          transition: transform 1s cubic-bezier(.2,.7,.2,1);
          pointer-events: none; z-index: 1;
        }
        .blg-card:hover::before { transform: translateX(120%); }
        .blg-card::after {
          content: ""; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          transform: scaleX(0); transform-origin: left; transition: transform .6s ease;
        }
        .blg-card:hover::after { transform: scaleX(1); }
        .blg-cover::before {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(120% 120% at 20% 20%, rgba(255,255,255,.18), transparent 60%);
          pointer-events: none;
        }
        .blg-title-underline { background-image: linear-gradient(var(--blg-accent), var(--blg-accent)); background-size: 0% 3px; background-position: 0 100%; background-repeat: no-repeat; transition: background-size .5s ease; }
        .blg-card:hover .blg-title-underline { background-size: 100% 3px; }
        @media (prefers-reduced-motion: reduce) {
          .blg-blob, .blg-spin, .blg-ping { animation: none !important; }
          .blg-card::before, .blg-card::after { transition: none; }
        }
      `}</style>

      <PageTitle title="Blog" />
      <Navbar />

      {/* Scroll progress */}
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
          className="w-[90vw] h-[90vw] sm:w-[60vw] sm:h-[60vw] object-contain opacity-[0.03] select-none"
        />
      </div>

      {/* Dots + ambient blobs */}
      <div
        className="absolute inset-x-0 top-0 h-[38rem] pointer-events-none opacity-60"
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
        className="blg-blob absolute -top-24 -right-24 w-[26rem] h-[26rem] rounded-full blur-[130px] opacity-25 pointer-events-none"
        style={{ backgroundColor: primary }}
      />
      <div
        className="blg-blob absolute top-[44rem] -left-24 w-[22rem] h-[22rem] rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{
          backgroundColor: secondary,
          animationDelay: "-5s",
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 md:pt-32 pb-24 space-y-12 md:space-y-16">
        {/* ================= HEADER ================= */}
        <header className="grid gap-8 lg:grid-cols-12 items-end">
          <div className="lg:col-span-8 space-y-5">
            

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05]">
              {["The", "Blog."].map((w, i) => (
                <span
                  key={w}
                  className="inline-block overflow-hidden align-bottom pb-[0.12em] mr-[0.25em]"
                >
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      delay: 0.1 + i * 0.12,
                      duration: 0.9,
                      ease: [0.2, 0.7, 0.2, 1],
                    }}
                    style={{ color: i === 1 ? primary : undefined }}
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Animated accent underline */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              className="h-[3px] w-24 rounded-full origin-left"
              style={{
                background: `linear-gradient(90deg, ${primary}, ${secondary})`,
              }}
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="max-w-2xl text-base md:text-lg leading-relaxed"
              style={{ color: muted }}
            >
              Notes about what I'm building, the decisions behind it, and the
              lessons I'm learning — one post at a time.
            </motion.p>
          </div>

          {/* Stat card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="lg:col-span-4"
          >
            <div
              className="grid grid-cols-2 gap-3 rounded-3xl border p-4"
              style={{
                borderColor: soft,
                backgroundColor: `${text}05`,
              }}
            >
              <div className="rounded-2xl p-4" style={{ backgroundColor: `${primary}12` }}>
                <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">
                  Posts
                </p>
                <p className="text-2xl font-extrabold mt-1">
                  {String(posts.length).padStart(2, "0")}
                </p>
              </div>
              <div
                className="rounded-2xl p-4"
                style={{ backgroundColor: `${text}05` }}
              >
                <p className="text-[10px] uppercase tracking-wider opacity-60 font-bold">
                  Minutes
                </p>
                <p className="text-2xl font-extrabold mt-1">
                  {totalReadingMinutes}
                </p>
              </div>
            </div>
          </motion.div>
        </header>

        {/* ================= FEATURED ================= */}
        {featured && (
          <motion.article
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.2, 0.7, 0.2, 1] }}
            onMouseMove={followMouse}
            className="blg-card group relative overflow-hidden rounded-[2rem] border"
            style={{
              borderColor: soft,
              backgroundColor: `${text}05`,
              "--mx": "50%",
              "--my": "50%",
              "--blg-accent": primary,
            } as React.CSSProperties}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
              style={{
                background: `radial-gradient(400px circle at var(--mx) var(--my), ${primary}22, transparent 45%)`,
              }}
            />

            <div className="relative z-[2] grid lg:grid-cols-12">
              {/* Accent panel */}
              <div
                className="blg-cover relative overflow-hidden lg:col-span-5 lg:min-h-[22rem] flex items-center justify-center p-8"
                style={{
                  background: `linear-gradient(135deg, ${primary}, ${secondary})`,
                }}
              >
                <div className="relative text-center">
                  <Bookmark size={56} color="#ffffff" strokeWidth={1.25} className="mx-auto opacity-90" />
                  <p className="mt-4 text-3xl font-extrabold text-white leading-tight max-w-[16rem] mx-auto">
                    {featured.title.length > 42
                      ? `${featured.title.slice(0, 42)}…`
                      : featured.title}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-7 p-6 sm:p-10">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: `${primary}1f`, color: primary }}
                  >
                    <Sparkles size={11} /> Featured
                  </span>
                  {featured.readingTime && (
                    <span className="inline-flex items-center gap-1 text-xs opacity-60">
                      <Clock size={12} /> {featured.readingTime} min read
                    </span>
                  )}
                  {featured.createdAt && (
                    <span className="inline-flex items-center gap-1 text-xs opacity-60">
                      <Calendar size={12} /> {formatDate(featured.createdAt)}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight max-w-2xl">
                  <span className="blg-title-underline">{featured.title}</span>
                </h2>

                {featured.excerpt && (
                  <p
                    className="mt-4 text-base leading-relaxed max-w-xl"
                    style={{ color: muted }}
                  >
                    {featured.excerpt}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {featured.tags?.slice(0, 4).map((t) => (
                    <span
                      key={t.slug}
                      className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                      style={{
                        backgroundColor: `${primary}18`,
                        color: primary,
                      }}
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/blog/${featured.slug}`}
                    className="group/cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ backgroundColor: primary, color: base }}
                  >
                    Read the post
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover/cta:translate-x-1"
                    />
                  </Link>
                  <span className="inline-flex items-center gap-1 text-xs opacity-55">
                    <Eye size={13} /> {featured.viewCount} views
                  </span>
                </div>
              </div>
            </div>
          </motion.article>
        )}

        {/* ================= TOOLBAR ================= */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border p-4 sm:p-5 space-y-4 backdrop-blur-sm"
          style={{
            borderColor: soft,
            backgroundColor: `${text}05`,
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search */}
            <div
              className="flex flex-1 items-center gap-2 rounded-full border px-4"
              style={{ borderColor: soft, backgroundColor: `${text}05` }}
            >
              <Search size={16} className="opacity-50 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search posts by title, tag or content…"
                className="w-full bg-transparent py-3 text-sm outline-none"
                style={{ color: text }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform hover:rotate-90"
                  style={{
                    backgroundColor: `${primary}1f`,
                    color: primary,
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-full border px-4 py-3 pr-10 text-sm font-medium outline-none cursor-pointer"
                style={{
                  borderColor: soft,
                  backgroundColor: `${text}05`,
                  color: text,
                }}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
              />
            </div>
          </div>

          {/* Tag pills */}
          {allTags.length > 0 && (
            <div className="flex items-start gap-3 flex-wrap pt-3 border-t" style={{ borderColor: soft }}>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 pt-1.5 shrink-0">
                Filter:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag(null)}
                  className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all"
                  style={{
                    borderColor: !activeTag ? primary : soft,
                    backgroundColor: !activeTag ? primary : "transparent",
                    color: !activeTag ? base : text,
                  }}
                >
                  All
                </button>
                {allTags.map((t) => {
                  const active = activeTag === t.slug;
                  return (
                    <button
                      key={t.slug}
                      onClick={() => setActiveTag(active ? null : t.slug)}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: active ? primary : soft,
                        backgroundColor: active ? primary : "transparent",
                        color: active ? base : text,
                      }}
                    >
                      <Tag size={11} />
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* ================= GRID ================= */}
        {visible.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            <AnimatePresence mode="popLayout">
              {visible.map((post) => (
                <motion.article
                  key={post.id}
                  layout
                  variants={rise}
                  onMouseMove={followMouse}
                  whileHover={{ y: -6 }}
                  className="blg-card group relative overflow-hidden rounded-3xl border flex flex-col h-full"
                  style={{
                    borderColor: soft,
                    backgroundColor: `${text}05`,
                    "--mx": "50%",
                    "--my": "50%",
                    "--blg-accent": primary,
                  } as React.CSSProperties}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
                    style={{
                      background: `radial-gradient(320px circle at var(--mx) var(--my), ${primary}22, transparent 45%)`,
                    }}
                  />

                  {/* Soft cover band */}
                  <div
                    className="blg-cover relative h-24 overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${primary}30, ${secondary}10)`,
                    }}
                  >
                    <div
                      className="absolute -right-4 -bottom-4 grid place-items-center w-24 h-24 rounded-full text-3xl font-black select-none"
                      style={{
                        backgroundColor: `${primary}18`,
                        color: `${primary}55`,
                      }}
                      aria-hidden="true"
                    >
                      {post.title.charAt(0).toUpperCase()}
                    </div>
                    <div
                      className="absolute left-4 bottom-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor: `${base}cc`,
                        color: primary,
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      {post.tags?.[0]?.name ?? "Post"}
                    </div>
                  </div>

                  <div className="relative z-[2] p-6 flex flex-col flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px]">
                      {post.readingTime && (
                        <span className="inline-flex items-center gap-1 opacity-60">
                          <Clock size={11} /> {post.readingTime} min
                        </span>
                      )}
                      {post.createdAt && (
                        <span className="inline-flex items-center gap-1 opacity-60">
                          <Calendar size={11} />
                          {formatDate(post.createdAt)}
                        </span>
                      )}
                      {post.isFeatured && (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${primary}1f`,
                            color: primary,
                          }}
                        >
                          <Sparkles size={9} /> Featured
                        </span>
                      )}
                    </div>

                    <Link to={`/blog/${post.slug}`}>
                      <h3 className="text-lg font-bold leading-snug mb-2 line-clamp-2">
                        <span className="blg-title-underline">{post.title}</span>
                      </h3>
                    </Link>

                    {post.excerpt && (
                      <p
                        className="text-sm leading-relaxed mb-4 flex-1 line-clamp-3"
                        style={{ color: muted }}
                      >
                        {post.excerpt}
                      </p>
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5 mb-4">
                        {post.tags.slice(0, 3).map((t) => (
                          <span
                            key={t.slug}
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              backgroundColor: `${primary}18`,
                              color: primary,
                            }}
                          >
                            #{t.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className="flex items-center justify-between pt-4 border-t"
                      style={{ borderColor: soft }}
                    >
                      <span className="inline-flex items-center gap-1 text-[11px] opacity-55">
                        <Eye size={12} /> {post.viewCount}
                      </span>
                      <Link
                        to={`/blog/${post.slug}`}
                        className="group/cta inline-flex items-center gap-1 text-xs font-bold"
                        style={{ color: primary }}
                      >
                        Read
                        <ArrowUpRight
                          size={13}
                          className="transition-transform group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5"
                        />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Nothing matches */
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed px-6 py-20 text-center"
            style={{ borderColor: `${primary}33` }}
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ backgroundColor: `${primary}1f` }}
            >
              <SearchX size={28} style={{ color: primary }} />
            </div>
            <h3 className="text-xl font-bold">Nothing matches that search</h3>
            <p className="max-w-sm text-sm opacity-60">
              {searchTerm
                ? `No posts found for "${searchTerm}".`
                : "No posts match the selected tag."}{" "}
              Try a different word or clear the filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setActiveTag(null);
              }}
              className="mt-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg"
              style={{ backgroundColor: primary, color: base }}
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </div>

      <Footer />
      <div
        className="pointer-events-none fixed inset-x-0 top-[94%] -translate-y-1/2 z-[100] flex justify-end px-3 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-6 sm:translate-y-0 sm:px-0"
      >
        <div className="pointer-events-auto">
          <VirtualAssistant />
        </div>
      </div>
    </main>
  );
};

/* ---------- small wrapper for loading/error/empty ---------- */
const PageShell = ({
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

export default BlogPage;