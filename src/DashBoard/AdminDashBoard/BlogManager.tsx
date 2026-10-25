// src/Features/Pages/BlogManager.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  useGetPostsQuery,
  useGetPostStatsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useTogglePostFeaturedMutation,
  useTogglePostPublishMutation,
  useDeletePostMutation,
  useRestorePostMutation,
  useHardDeletePostMutation,
  useGetPostRevisionsQuery,
  getPostErrorMessage,
  type TPost,
  type TPostFilters,
  type TCreatePostInput,
  type TUpdatePostInput,
} from '../../Features/Apis/PostApi';

import {
  Plus, Trash2, Edit3, Search, RefreshCw, X,
  FileText, CheckCircle2, Loader2, AlertCircle, ChevronRight,
  ChevronLeft, Eye, Heart, Flame, Star, Clock, Calendar,
  Sparkles, Send, ArrowUpDown, ChevronDown,
  SlidersHorizontal, Undo2, History, Save, Lock, Unlock,
  Newspaper, Layers, Link2, Hash, Wand2, FileCode2,
  Filter, RotateCcw, Tag as TagIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../ThemeContext';

/* ---------- Helpers ---------- */
const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

const SORT_FIELDS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'updatedAt', label: 'Updated' },
  { value: 'viewCount', label: 'Views' },
] as const;
type SortField = typeof SORT_FIELDS[number]['value'];

const STATUS_TABS = [
  { key: 'all',       label: 'All',       color: '#64748b' },
  { key: 'published', label: 'Published', color: '#10b981' },
  { key: 'draft',     label: 'Drafts',    color: '#f59e0b' },
  { key: 'archived',  label: 'Archived',  color: '#94a3b8' },
] as const;
type StatusKey = typeof STATUS_TABS[number]['key'];

const FEATURED_OPTIONS = [
  { key: 'all',    label: 'Any' },
  { key: 'true',   label: 'Featured only' },
  { key: 'false',  label: 'Not featured' },
] as const;
type FeaturedKey = typeof FEATURED_OPTIONS[number]['key'];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

/* ✅ Slug generator */
const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const BlogManager = () => {
  const { theme } = useTheme();

  /* ---------- List / filter state ---------- */
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusKey>('all');
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedKey>('all');
  const [tagInput, setTagInput] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  /* ---------- Drawer / modal state ---------- */
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<TPost | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);

  const drawerRef = useRef<HTMLDivElement>(null);

  /* ---------- Debounce search + tag ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => {
      setTagFilter(tagInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [tagInput]);

  useEffect(() => { setPage(1); }, [statusFilter, featuredFilter, sortBy, sortOrder, pageSize]);

  /* ---------- API: list + stats ---------- */
  const filters: TPostFilters = useMemo(() => {
    const f: TPostFilters = {
      sortBy,
      sortOrder,
      page,
      limit: pageSize,
    };
    if (statusFilter !== 'all') f.status = statusFilter;
    if (featuredFilter !== 'all') f.featured = featuredFilter === 'true';
    if (searchTerm.trim()) f.search = searchTerm.trim();
    if (tagFilter) f.tagSlug = tagFilter;
    return f;
  }, [statusFilter, featuredFilter, searchTerm, tagFilter, sortBy, sortOrder, page, pageSize]);

  const {
    data: postsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPostsQuery(filters);

  const { data: statsResponse } = useGetPostStatsQuery();

  const {
    data: selectedResponse,
    isFetching: isFetchingDetail,
  } = useGetPostByIdQuery(selectedId ?? '', { skip: !selectedId });

  const {
    data: revisionsResponse,
    isFetching: isFetchingRevisions,
  } = useGetPostRevisionsQuery(selectedId ?? '', {
    skip: !selectedId || !showRevisions,
  });

  /* ---------- Mutations ---------- */
  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();
  const [toggleFeatured, { isLoading: isTogglingFeatured }] = useTogglePostFeaturedMutation();
  const [togglePublish, { isLoading: isTogglingPublish }] = useTogglePostPublishMutation();
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const [restorePost, { isLoading: isRestoring }] = useRestorePostMutation();
  const [hardDeletePost, { isLoading: isHardDeleting }] = useHardDeletePostMutation();

  const posts: TPost[] = postsResponse?.data ?? [];
  const stats = statsResponse?.data ?? {
    total: 0, published: 0, drafts: 0, featured: 0, totalViews: 0,
  };
  const selected = selectedResponse?.data ?? null;
  const revisions = revisionsResponse?.data ?? [];

  const isBusy =
    isCreating || isUpdating || isTogglingFeatured || isTogglingPublish ||
    isDeleting || isRestoring || isHardDeleting;

  /* ---------- Pagination ---------- */
  const pagination = (postsResponse as any)?.pagination ?? null;
  const totalPages = pagination?.totalPages ??
    Math.max(1, Math.ceil((pagination?.total ?? stats.total ?? posts.length) / pageSize));
  const currentPage = pagination?.page ?? page;
  const totalItems = pagination?.total ?? stats.total ?? posts.length;

  /* ---------- Active filter count ---------- */
  const activeFilterCount = [
    statusFilter !== 'all',
    featuredFilter !== 'all',
    !!searchTerm,
    !!tagFilter,
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setStatusFilter('all');
    setFeaturedFilter('all');
    setTagInput('');
    setTagFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => setPendingDelete(null), 4000);
    return () => clearTimeout(id);
  }, [pendingDelete]);

  useEffect(() => {
    const open = !!selectedId || showEditor;
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showEditor) setShowEditor(false);
      else setSelectedId(null);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedId, showEditor]);

  useEffect(() => { setShowRevisions(false); }, [selectedId]);

  /* ---------- Handlers ---------- */
  const openCreate = () => { setEditingPost(null); setShowEditor(true); };
  const openEdit = (post: TPost) => { setEditingPost(post); setShowEditor(true); };

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id).unwrap();
      toast.success('Post moved to trash');
      if (selectedId === id) setSelectedId(null);
      setPendingDelete(null);
    } catch (err) {
      toast.error(getPostErrorMessage(err as any) || 'Could not delete');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restorePost(id).unwrap();
      toast.success('Post restored');
    } catch (err) {
      toast.error(getPostErrorMessage(err as any) || 'Could not restore');
    }
  };

  const handleHardDelete = async (id: string) => {
    try {
      await hardDeletePost(id).unwrap();
      toast.success('Post permanently deleted');
      if (selectedId === id) setSelectedId(null);
      setPendingDelete(null);
    } catch (err) {
      toast.error(getPostErrorMessage(err as any) || 'Could not delete');
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await togglePublish(id).unwrap();
      toast.success(res.data.isPublished ? 'Published' : 'Moved to drafts');
    } catch (err) {
      toast.error(getPostErrorMessage(err as any) || 'Could not update');
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const res = await toggleFeatured(id).unwrap();
      toast.success(res.data.isFeatured ? 'Featured' : 'Unfeatured');
    } catch (err) {
      toast.error(getPostErrorMessage(err as any) || 'Could not update');
    }
  };

  /* ---------- Styling ---------- */
  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  const statusTabs = STATUS_TABS.map((s) => ({
    ...s,
    count:
      s.key === 'all'
        ? stats.total
        : s.key === 'published'
        ? stats.published
        : s.key === 'draft'
        ? stats.drafts
        : Math.max(0, stats.total - stats.published - stats.drafts),
  }));

  /* ---------- Row ---------- */
  const renderRow = (post: TPost) => {
    const isActive = selectedId === post.id;
    const isDraft = !post.isPublished && !post.deletedAt;
    const isDeleted = !!post.deletedAt;

    return (
      <button
        key={post.id}
        onClick={() => setSelectedId(post.id)}
        className="group relative w-full text-left flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.995]"
        style={{
          borderColor: isActive
            ? theme.primary
            : isDeleted
            ? '#f43f5e55'
            : `${theme['base-content']}10`,
          backgroundColor: isActive
            ? `${theme.primary}10`
            : isDeleted
            ? '#f43f5e08'
            : `${theme['base-content']}03`,
          opacity: isDeleted ? 0.75 : 1,
        }}
      >
        <div
          className="grid shrink-0 place-items-center h-11 w-11 sm:h-12 sm:w-12 rounded-xl"
          style={{
            backgroundColor: `${theme.primary}1a`,
            color: theme.primary,
            border: `1px solid ${theme.primary}33`,
          }}
        >
          <FileText size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm sm:text-base truncate ${isDraft ? 'font-semibold opacity-80' : 'font-bold'}`}>
              {post.title}
            </p>
            {post.isPublished ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-500">
                <Send size={9} /> Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/15 text-amber-500">
                <Lock size={9} /> Draft
              </span>
            )}
            {post.isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-500/15 text-purple-500">
                <Sparkles size={9} /> Featured
              </span>
            )}
            {isDeleted && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-rose-500/15 text-rose-500">
                <Trash2 size={9} /> Deleted
              </span>
            )}
          </div>

          {post.excerpt && (
            <p className="text-xs sm:text-sm opacity-70 mt-1 line-clamp-2">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] opacity-60">
            <span className="inline-flex items-center gap-1">
              <Calendar size={10} /> {formatDate(post.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={10} /> {post.viewCount}
            </span>
            {post.readingTime != null && (
              <span className="inline-flex items-center gap-1">
                <Clock size={10} /> {post.readingTime}min
              </span>
            )}
            {post.reactions?.like != null && (
              <span className="inline-flex items-center gap-1 text-pink-500">
                <Heart size={10} /> {post.reactions.like}
              </span>
            )}
            {post.reactions?.fire != null && (
              <span className="inline-flex items-center gap-1 text-orange-500">
                <Flame size={10} /> {post.reactions.fire}
              </span>
            )}
            {post.ratings?.avg != null && post.ratings.count > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-500">
                <Star size={10} /> {post.ratings.avg.toFixed(1)} ({post.ratings.count})
              </span>
            )}
            {post.tags && post.tags.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <Layers size={10} /> {post.tags.length} tags
              </span>
            )}
          </div>
        </div>
      </button>
    );
  };

  /* ---------- Pagination ---------- */
  const renderPagination = () => {
    if (totalPages <= 1 && totalItems <= pageSize) return null;
    const pages: (number | '…')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('…');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }
    const goto = (n: number) => {
      if (n < 1 || n > totalPages || n === currentPage) return;
      setPage(n);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 rounded-2xl border px-4 py-3"
        style={{
          borderColor: `${theme['base-content']}10`,
          backgroundColor: `${theme['base-content']}03`,
        }}
      >
        <div className="flex items-center gap-3 flex-wrap text-xs opacity-70">
          <span>
            Showing <span className="font-semibold">{start}–{end}</span> of{' '}
            <span className="font-semibold">{totalItems}</span>
          </span>
          <span className="hidden sm:inline opacity-40">•</span>
          <label className="inline-flex items-center gap-1.5">
            <span className="opacity-70">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="appearance-none rounded-lg px-2 py-1 text-xs font-semibold outline-none cursor-pointer focus:ring-2 transition"
              style={inputStyle}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goto(currentPage - 1)}
            disabled={currentPage <= 1 || isFetching}
            className="grid place-items-center h-9 w-9 rounded-xl border transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ borderColor: `${theme['base-content']}15`, color: theme['base-content'], backgroundColor: `${theme['base-content']}03` }}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </button>
          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-2 text-xs opacity-40">…</span>
            ) : (
              <button
                key={p}
                onClick={() => goto(p)}
                disabled={isFetching}
                aria-current={p === currentPage ? 'page' : undefined}
                className="grid place-items-center h-9 min-w-9 px-2 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  borderColor: p === currentPage ? theme.primary : `${theme['base-content']}15`,
                  color: p === currentPage ? theme['base-100'] : theme['base-content'],
                  backgroundColor: p === currentPage ? theme.primary : `${theme['base-content']}03`,
                }}
              >
                {p}
              </button>
            )
          )}
          <button
            onClick={() => goto(currentPage + 1)}
            disabled={currentPage >= totalPages || isFetching}
            className="grid place-items-center h-9 w-9 rounded-xl border transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ borderColor: `${theme['base-content']}15`, color: theme['base-content'], backgroundColor: `${theme['base-content']}03` }}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  /* ---------- Loading skeleton ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-8" style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}>
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}10` }} />
          <div className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}08` }} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4 animate-pulse" style={{ borderColor: `${theme['base-content']}10`, backgroundColor: `${theme['base-content']}03` }}>
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-xl" style={{ backgroundColor: `${theme['base-content']}08` }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/2 rounded" style={{ backgroundColor: `${theme['base-content']}08` }} />
                  <div className="h-2 w-2/3 rounded" style={{ backgroundColor: `${theme['base-content']}06` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (isError) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: `${theme.primary}1f` }}>
          <AlertCircle size={28} style={{ color: theme.primary }} />
        </div>
        <h2 className="text-lg font-bold">Could not load posts</h2>
        <p className="max-w-md text-sm opacity-60">{getPostErrorMessage(error) || 'Please try again.'}</p>
        <button
          onClick={() => refetch()}
          className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
        >
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-8" style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}>
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
            <Link to="/admin-dashboard" className="hover:opacity-100 transition-opacity">Admin</Link>
            <ChevronRight size={11} className="opacity-50" />
            <span style={{ color: theme.primary }}>Blog</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-6">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Blog posts</h1>
                {stats.drafts > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold bg-amber-500/15 text-amber-500">
                    <Lock size={11} /> {stats.drafts} drafts
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm opacity-60 max-w-xl">
                Create, edit, publish, and manage every post on your blog.
                Stats, revisions, reactions, and ratings are all in one place.
              </p>

              <div className="flex gap-2 pt-3 overflow-x-auto pb-1 -mx-1 px-1">
                {statusTabs.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                    style={{
                      borderColor: statusFilter === f.key ? f.color : `${theme['base-content']}15`,
                      color: statusFilter === f.key ? f.color : theme['base-content'],
                      backgroundColor: statusFilter === f.key ? `${f.color}14` : 'transparent',
                    }}
                  >
                    {f.label} <span className="opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'], backgroundColor: `${theme['base-content']}03` }}
              >
                {isFetching ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Refresh
              </button>
              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
                style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
              >
                <Plus size={18} /> New post
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER TOGGLE + SORT */}
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search title or content…"
                className="w-full rounded-xl py-3 pl-10 sm:pl-11 pr-10 text-sm outline-none focus:ring-2 transition"
                style={inputStyle}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  aria-label="Clear"
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full transition-transform hover:rotate-90"
                  style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filter toggle (mobile + desktop) */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              aria-label="Toggle filters"
              aria-expanded={showFilters}
              className="relative grid place-items-center h-11 px-3 rounded-xl border transition-all shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{
                borderColor: showFilters || activeFilterCount > 0 ? theme.primary : `${theme['base-content']}15`,
                color: showFilters || activeFilterCount > 0 ? theme.primary : theme['base-content'],
                backgroundColor: showFilters || activeFilterCount > 0 ? `${theme.primary}10` : 'transparent',
              }}
            >
              <Filter size={15} />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span
                  className="grid place-items-center h-4 min-w-4 px-1 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort (desktop only — mobile shows in filter panel) */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortField)}
                  className="appearance-none rounded-xl py-3 pl-9 pr-8 text-xs font-semibold outline-none cursor-pointer focus:ring-2 transition"
                  style={inputStyle}
                  aria-label="Sort by"
                >
                  {SORT_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <ArrowUpDown size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                <ChevronDown size={13} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="rounded-xl px-3 h-11 text-xs font-semibold border transition-all hover:-translate-y-0.5"
                style={{ borderColor: `${theme['base-content']}15`, color: theme['base-content'], backgroundColor: `${theme['base-content']}03` }}
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div
            className="mb-4 sm:mb-6 rounded-2xl border p-3 sm:p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              borderColor: `${theme['base-content']}15`,
              backgroundColor: `${theme['base-content']}03`,
            }}
          >
            {/* Row 1: Featured + Tag */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 inline-flex items-center gap-1">
                  <Sparkles size={10} /> Featured
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {FEATURED_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setFeaturedFilter(o.key)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: featuredFilter === o.key ? theme.primary : `${theme['base-content']}20`,
                        color: featuredFilter === o.key ? theme.primary : theme['base-content'],
                        backgroundColor: featuredFilter === o.key ? `${theme.primary}14` : 'transparent',
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 inline-flex items-center gap-1">
                  <TagIcon size={10} /> Tag slug
                </p>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. react, nodejs"
                  className="w-full rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-2 transition"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Row 2: Sort + Order + Page size (mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 inline-flex items-center gap-1">
                  <ArrowUpDown size={10} /> Sort by
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_FIELDS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setSortBy(f.value)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: sortBy === f.value ? theme.primary : `${theme['base-content']}20`,
                        color: sortBy === f.value ? theme.primary : theme['base-content'],
                        backgroundColor: sortBy === f.value ? `${theme.primary}14` : 'transparent',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5">Order</p>
                <div className="flex gap-1.5">
                  {(['asc', 'desc'] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => setSortOrder(o)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: sortOrder === o ? theme.primary : `${theme['base-content']}20`,
                        color: sortOrder === o ? theme.primary : theme['base-content'],
                        backgroundColor: sortOrder === o ? `${theme.primary}14` : 'transparent',
                      }}
                    >
                      {o === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5">Per page</p>
                <div className="flex flex-wrap gap-1.5">
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <button
                      key={n}
                      onClick={() => { setPageSize(n); setPage(1); }}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: pageSize === n ? theme.primary : `${theme['base-content']}20`,
                        color: pageSize === n ? theme.primary : theme['base-content'],
                        backgroundColor: pageSize === n ? `${theme.primary}14` : 'transparent',
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer: reset */}
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: `${theme['base-content']}10` }}>
                <p className="text-[11px] opacity-60">
                  {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
                </p>
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all hover:-translate-y-0.5"
                  style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'] }}
                >
                  <RotateCcw size={11} /> Reset all
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active filter chips (when panel is closed) */}
        {!showFilters && activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
            {statusFilter !== 'all' && (
              <FilterChip label={`Status: ${statusFilter}`} onClear={() => setStatusFilter('all')} theme={theme} />
            )}
            {featuredFilter !== 'all' && (
              <FilterChip label={featuredFilter === 'true' ? 'Featured only' : 'Not featured'} onClear={() => setFeaturedFilter('all')} theme={theme} />
            )}
            {searchTerm && (
              <FilterChip label={`"${searchTerm}"`} onClear={() => { setSearchInput(''); setSearchTerm(''); }} theme={theme} />
            )}
            {tagFilter && (
              <FilterChip label={`#${tagFilter}`} onClear={() => { setTagInput(''); setTagFilter(''); }} theme={theme} />
            )}
            <button
              onClick={resetAllFilters}
              className="text-[11px] font-semibold opacity-60 hover:opacity-100 transition-opacity underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* LIST */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center" style={{ borderColor: `${theme.primary}33` }}>
            <div className="grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: `${theme.primary}1f` }}>
              <Newspaper size={28} style={{ color: theme.primary }} />
            </div>
            {activeFilterCount > 0 ? (
              <>
                <h3 className="text-lg font-bold">Nothing matches</h3>
                <p className="max-w-sm text-sm opacity-60">
                  Try adjusting your filters or search.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  <RotateCcw size={15} /> Clear filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">No posts yet</h3>
                <p className="max-w-sm text-sm opacity-60">Click "New post" to write your first one.</p>
                <button
                  onClick={openCreate}
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  <Plus size={16} /> New post
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">{posts.map(renderRow)}</div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* ============ DETAIL DRAWER — centered ============ */}
      {selectedId &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            style={{ zIndex: 9999, isolation: 'isolate' }}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 animate-in fade-in duration-200"
              style={{
                backgroundColor: 'rgba(0,0,0,0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              onClick={() => setSelectedId(null)}
            />

            <div
              ref={drawerRef}
              className="relative w-full sm:max-w-xl md:max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
              style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
            >
              {/* Header */}
              <div className="shrink-0 px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b relative overflow-hidden" style={{ borderColor: `${theme['base-content']}10`, background: `linear-gradient(135deg, ${theme.primary}14, transparent 65%)` }}>
                <div aria-hidden className="absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: `${theme.primary}33` }} />
                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
                      <Link to="/admin-dashboard" onClick={() => setSelectedId(null)} className="hover:opacity-100 transition-opacity">Admin</Link>
                      <ChevronRight size={11} className="opacity-50" />
                      <span className="opacity-80">Blog</span>
                      <ChevronRight size={11} className="opacity-50" />
                      <span style={{ color: theme.primary }}>Post</span>
                    </div>

                    {isFetchingDetail && !selected ? (
                      <div className="space-y-2">
                        <div className="h-6 w-48 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}08` }} />
                        <div className="h-3 w-64 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}06` }} />
                      </div>
                    ) : selected ? (
                      <>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight line-clamp-2">{selected.title}</h2>
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          {selected.isPublished ? (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-500">
                              <Send size={9} /> Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-amber-500/15 text-amber-500">
                              <Lock size={9} /> Draft
                            </span>
                          )}
                          {selected.isFeatured && (
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-purple-500/15 text-purple-500">
                              <Sparkles size={9} /> Featured
                            </span>
                          )}
                          <span className="text-[11px] opacity-50 inline-flex items-center gap-1">
                            <Calendar size={10} /> {formatFullDate(selected.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] opacity-50 mt-1 font-mono truncate">/{selected.slug}</p>
                      </>
                    ) : null}
                  </div>

                  <button
                    onClick={() => setSelectedId(null)}
                    aria-label="Close"
                    className="shrink-0 p-2.5 rounded-xl transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:rotate-90"
                    style={{ backgroundColor: `${theme['base-content']}06`, color: theme['base-content'] }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Stats row */}
                {selected && (
                  <div className="relative flex flex-wrap gap-2 mt-4">
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border" style={{ borderColor: `${theme['base-content']}15`, color: theme['base-content'] }}>
                      <Eye size={11} /> {selected.viewCount} views
                    </span>
                    {selected.reactions?.like != null && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border bg-pink-500/10 text-pink-500" style={{ borderColor: '#ec489944' }}>
                        <Heart size={11} /> {selected.reactions.like}
                      </span>
                    )}
                    {selected.reactions?.fire != null && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border bg-orange-500/10 text-orange-500" style={{ borderColor: '#f9731644' }}>
                        <Flame size={11} /> {selected.reactions.fire}
                      </span>
                    )}
                    {selected.ratings?.count ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border bg-amber-500/10 text-amber-500" style={{ borderColor: '#f59e0b44' }}>
                        <Star size={11} /> {selected.ratings.avg.toFixed(1)} ({selected.ratings.count})
                      </span>
                    ) : null}
                    {selected.readingTime != null && (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold border" style={{ borderColor: `${theme['base-content']}15`, color: theme['base-content'] }}>
                        <Clock size={11} /> {selected.readingTime}min
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-5">
                {isFetchingDetail && !selected ? (
                  <div className="space-y-3">
                    {[3, 2, 4, 2, 3].map((w, i) => (
                      <div key={i} className="h-4 rounded animate-pulse" style={{ width: `${w * 20}%`, backgroundColor: `${theme['base-content']}06` }} />
                    ))}
                  </div>
                ) : selected ? (
                  <>
                    {selected.excerpt && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Excerpt</p>
                        <p className="text-sm opacity-80 italic">{selected.excerpt}</p>
                      </div>
                    )}

                    {selected.tags && selected.tags.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5">Tags</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.tags.map((t) => (
                            <span
                              key={t.id}
                              className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                              style={{ backgroundColor: `${theme.primary}14`, color: theme.primary }}
                            >
                              #{t.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Content</p>
                      <div
                        className="rounded-xl p-4 text-sm leading-relaxed prose prose-sm max-w-none"
                        style={{ backgroundColor: `${theme['base-content']}04`, border: `1px solid ${theme['base-content']}10` }}
                        dangerouslySetInnerHTML={{ __html: selected.content }}
                      />
                    </div>

                    {selected.author && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">Author</p>
                        <p className="text-sm font-semibold">{selected.author.fullName}</p>
                        <p className="text-xs opacity-60">{selected.author.email}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm opacity-60">Post not found.</p>
                )}

                {/* Revisions */}
                {selected && (
                  <div>
                    <button
                      onClick={() => setShowRevisions((v) => !v)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <History size={12} /> {showRevisions ? 'Hide' : 'Show'} revisions
                    </button>
                    {showRevisions && (
                      <div className="mt-2 space-y-1.5">
                        {isFetchingRevisions ? (
                          <p className="text-xs opacity-50 inline-flex items-center gap-1"><Loader2 size={11} className="animate-spin" /> Loading…</p>
                        ) : revisions.length === 0 ? (
                          <p className="text-xs opacity-50">No revisions yet.</p>
                        ) : (
                          revisions.map((rev, i) => (
                            <div
                              key={rev.id}
                              className="rounded-lg border px-3 py-2 text-xs"
                              style={{ borderColor: `${theme['base-content']}10`, backgroundColor: `${theme['base-content']}03` }}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold truncate">#{i + 1} · {rev.title}</span>
                                <span className="opacity-50 shrink-0">{formatDate(rev.createdAt)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer actions */}
              {selected && (
                <div className="shrink-0 px-4 sm:px-6 py-4 border-t flex flex-wrap gap-2 justify-end" style={{ borderColor: `${theme['base-content']}10`, backgroundColor: `${theme['base-content']}02` }}>
                  <button
                    onClick={() => openEdit(selected)}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 flex-1 sm:flex-none"
                    style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => handleTogglePublish(selected.id)}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{
                      borderColor: selected.isPublished ? '#f59e0b55' : '#10b98155',
                      color: selected.isPublished ? '#f59e0b' : '#10b981',
                      backgroundColor: selected.isPublished ? '#f59e0b10' : '#10b98110',
                    }}
                  >
                    {isTogglingPublish ? <Loader2 size={14} className="animate-spin" /> : selected.isPublished ? <Lock size={14} /> : <Unlock size={14} />}
                    {selected.isPublished ? 'Unpublish' : 'Publish'}
                  </button>

                  <button
                    onClick={() => handleToggleFeatured(selected.id)}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{
                      borderColor: selected.isFeatured ? '#a855f755' : `${theme['base-content']}20`,
                      color: selected.isFeatured ? '#a855f7' : theme['base-content'],
                      backgroundColor: selected.isFeatured ? '#a855f710' : 'transparent',
                    }}
                  >
                    {isTogglingFeatured ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {selected.isFeatured ? 'Unfeature' : 'Feature'}
                  </button>

                  {selected.deletedAt ? (
                    <button
                      onClick={() => handleRestore(selected.id)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{ borderColor: '#10b98155', color: '#10b981', backgroundColor: '#10b98110' }}
                    >
                      {isRestoring ? <Loader2 size={14} className="animate-spin" /> : <Undo2 size={14} />}
                      Restore
                    </button>
                  ) : null}

                  {pendingDelete === selected.id ? (
                    <div className="flex gap-1 flex-1 sm:flex-none">
                      <button
                        onClick={() => (selected.deletedAt ? handleHardDelete(selected.id) : handleDelete(selected.id))}
                        disabled={isDeleting || isHardDeleting}
                        className="inline-flex items-center justify-center gap-1 rounded-xl px-3 py-2.5 text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-60 flex-1"
                      >
                        {(isDeleting || isHardDeleting) ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        {selected.deletedAt ? 'Delete forever' : 'Confirm'}
                      </button>
                      <button
                        onClick={() => setPendingDelete(null)}
                        className="rounded-xl px-3 py-2 text-xs font-bold border transition-all"
                        style={{ borderColor: `${theme['base-content']}20` }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPendingDelete(selected.id)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-60"
                    >
                      <Trash2 size={14} /> {selected.deletedAt ? 'Hard delete' : 'Delete'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* ============ EDITOR MODAL — centered ============ */}
      {showEditor &&
        createPortal(
          <PostEditor
            theme={theme}
            initial={editingPost}
            isSaving={isCreating || isUpdating}
            onClose={() => setShowEditor(false)}
            onSave={async (payload) => {
              try {
                if (editingPost) {
                  await updatePost({ id: editingPost.id, updates: payload as TUpdatePostInput }).unwrap();
                  toast.success('Post updated');
                } else {
                  await createPost(payload as TCreatePostInput).unwrap();
                  toast.success('Post created');
                }
                setShowEditor(false);
                setEditingPost(null);
              } catch (err) {
                toast.error(getPostErrorMessage(err as any) || 'Could not save');
              }
            }}
          />,
          document.body
        )}
    </div>
  );
};

/* ---------- Filter chip ---------- */
function FilterChip({
  label,
  onClear,
  theme,
}: {
  label: string;
  onClear: () => void;
  theme: any;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
      style={{
        borderColor: `${theme.primary}44`,
        color: theme.primary,
        backgroundColor: `${theme.primary}10`,
      }}
    >
      {label}
      <button
        onClick={onClear}
        aria-label={`Clear ${label}`}
        className="grid place-items-center h-4 w-4 rounded-full transition-transform hover:rotate-90"
        style={{ backgroundColor: `${theme.primary}22` }}
      >
        <X size={9} />
      </button>
    </span>
  );
}

/* ============================================================
   EDITOR MODAL — always centered
   ============================================================ */
function PostEditor({
  theme,
  initial,
  isSaving,
  onClose,
  onSave,
}: {
  theme: any;
  initial: TPost | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: TCreatePostInput | TUpdatePostInput) => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    content: initial?.content ?? '',
    excerpt: initial?.excerpt ?? '',
    readingTime: initial?.readingTime != null ? String(initial.readingTime) : '',
    isPublished: initial?.isPublished ?? false,
    isFeatured: initial?.isFeatured ?? false,
    tagSlugs: initial?.tags?.map((t) => t.slug).join(', ') ?? '',
  });

  const [slugTouched, setSlugTouched] = useState<boolean>(!!initial?.slug);

  useEffect(() => {
    if (slugTouched) return;
    setForm((f) => ({ ...f, slug: toSlug(f.title) }));
  }, [form.title, slugTouched]);

  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {
      title: form.title.trim(),
      content: form.content,
      excerpt: form.excerpt.trim() || undefined,
      isPublished: form.isPublished,
      isFeatured: form.isFeatured,
      tagSlugs: form.tagSlugs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const rt = parseInt(form.readingTime, 10);
    if (!isNaN(rt) && rt > 0) payload.readingTime = rt;
    onSave(payload);
  };

  const slugPreview = form.slug || toSlug(form.title) || 'your-post-slug';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      style={{ zIndex: 9999, isolation: 'isolate' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 animate-in fade-in duration-200"
        style={{
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
        onClick={onClose}
      />

      <div
        className="relative w-full sm:max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        <div
          className="shrink-0 px-4 sm:px-8 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b relative overflow-hidden"
          style={{
            borderColor: `${theme['base-content']}10`,
            background: `linear-gradient(135deg, ${theme.primary}14, transparent 65%)`,
          }}
        >
          <div
            aria-hidden
            className="absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: `${theme.primary}33` }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="grid place-items-center h-8 w-8 rounded-lg shrink-0"
                  style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
                >
                  {initial ? <Edit3 size={16} /> : <Plus size={16} />}
                </span>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                  {initial ? 'Edit post' : 'New post'}
                </h2>
              </div>
              <p className="text-xs sm:text-sm opacity-55 mt-1">
                {initial ? 'Update the post below.' : 'Write your new post below.'}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 p-2.5 rounded-xl transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:rotate-90"
              style={{
                backgroundColor: `${theme['base-content']}06`,
                color: theme['base-content'],
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form
          id="post-form"
          onSubmit={submit}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-5 sm:py-7 space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
              Title <span style={{ color: theme.primary }}>*</span>
            </label>
            <input
              required
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Post title…"
              className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
              style={inputStyle}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-60 inline-flex items-center gap-1.5">
                <Link2 size={11} /> Slug
              </label>
              {slugTouched && (
                <button
                  type="button"
                  onClick={() => {
                    setSlugTouched(false);
                    setForm((f) => ({ ...f, slug: toSlug(f.title) }));
                  }}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Wand2 size={10} /> Auto-generate
                </button>
              )}
            </div>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-mono opacity-40 pointer-events-none"
                style={{ color: theme['base-content'] }}
              >
                /
              </span>
              <input
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: toSlug(e.target.value) });
                }}
                placeholder="auto-generated from title"
                className="w-full rounded-xl py-3 pl-7 pr-4 text-sm font-mono outline-none focus:ring-2 transition"
                style={inputStyle}
              />
            </div>
            <p className="text-[11px] mt-1.5 opacity-50 inline-flex items-center gap-1.5 flex-wrap">
              <Hash size={10} />
              Preview:
              <code
                className="font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: `${theme.primary}14`, color: theme.primary }}
              >
                /{slugPreview}
              </code>
              {!slugTouched && form.title && (
                <span className="text-emerald-500 inline-flex items-center gap-1">
                  <CheckCircle2 size={10} /> auto-synced
                </span>
              )}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
              Excerpt (optional)
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Short summary shown in lists…"
              rows={2}
              className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition resize-none"
              style={inputStyle}
            />
            <p className="text-[11px] mt-1 opacity-40 text-right">
              {form.excerpt.length} chars
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider opacity-60 inline-flex items-center gap-1.5">
                <FileCode2 size={11} /> Content <span style={{ color: theme.primary }}>*</span>
              </label>
              <span className="text-[10px] opacity-40 font-mono">{form.content.length} chars</span>
            </div>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your post content (HTML allowed)…"
              rows={10}
              className="w-full rounded-xl py-3 px-4 text-sm font-mono outline-none focus:ring-2 transition"
              style={inputStyle}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                Reading time (min)
              </label>
              <input
                type="number"
                min={0}
                value={form.readingTime}
                onChange={(e) => setForm({ ...form, readingTime: e.target.value })}
                placeholder="e.g. 8"
                className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                Tags (comma separated)
              </label>
              <input
                value={form.tagSlugs}
                onChange={(e) => setForm({ ...form, tagSlugs: e.target.value })}
                placeholder="react, nodejs, drizzle"
                className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <label
              className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer rounded-xl px-3 py-2 border transition-all"
              style={{
                borderColor: form.isPublished ? '#10b98155' : `${theme['base-content']}15`,
                backgroundColor: form.isPublished ? '#10b98110' : 'transparent',
                color: form.isPublished ? '#10b981' : theme['base-content'],
              }}
            >
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="h-4 w-4 rounded"
                style={{ accentColor: theme.primary }}
              />
              {form.isPublished ? <Unlock size={13} /> : <Lock size={13} />}
              Publish immediately
            </label>
            <label
              className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer rounded-xl px-3 py-2 border transition-all"
              style={{
                borderColor: form.isFeatured ? '#a855f755' : `${theme['base-content']}15`,
                backgroundColor: form.isFeatured ? '#a855f710' : 'transparent',
                color: form.isFeatured ? '#a855f7' : theme['base-content'],
              }}
            >
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded"
                style={{ accentColor: theme.primary }}
              />
              <Sparkles size={13} />
              Feature on homepage
            </label>
          </div>
        </form>

        <div
          className="shrink-0 flex flex-col-reverse sm:flex-row gap-2 justify-end px-4 sm:px-8 py-4 border-t"
          style={{
            borderColor: `${theme['base-content']}10`,
            backgroundColor: `${theme['base-content']}02`,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5"
            style={{
              borderColor: `${theme['base-content']}20`,
              color: theme['base-content'],
            }}
          >
            Cancel
          </button>
          <button
            form="post-form"
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {initial ? 'Save changes' : 'Create post'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlogManager;