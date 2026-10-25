// src/Features/Pages/TestimonialsManager.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  useGetTestimonialsAdminQuery,
  useGetTestimonialStatsQuery,
  useCreateTestimonialMutation,
  useUpdateTestimonialMutation,
  useToggleTestimonialPublishMutation,
  useDeleteTestimonialMutation,
  getTestimonialErrorMessage,
  type TTestimonial,
  type TTestimonialAdminFilters,
} from '../../Features/Apis/Testimonials.Api';

import {
  Plus, Trash2, Edit3, Search, RefreshCw, X,
  Loader2, AlertCircle, ChevronRight, Save,
  Star, MessageSquareQuote, Quote, Building2, User,
  Eye, EyeOff, Link2, Send, Lock, Unlock, Filter,
  RotateCcw, ArrowUpDown, ChevronDown, Award, TrendingUp,
  SlidersHorizontal, Sparkles, ExternalLink,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../ThemeContext';

/* ---------- Helpers ---------- */
const SORT_FIELDS = [
  { value: 'createdAt',  label: 'Newest' },
  { value: 'updatedAt',  label: 'Updated' },
  { value: 'rating',     label: 'Rating' },
  { value: 'authorName', label: 'Author' },
] as const;
type SortField = typeof SORT_FIELDS[number]['value'];

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

const initials = (name: string) =>
  name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? '').join('') || '?';

/* Star renderer */
function Stars({ rating, size = 12 }: { rating: number | null; size?: number }) {
  if (rating == null) return <span className="text-[11px] opacity-40">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          style={{
            color: i < rating ? '#f59e0b' : 'currentColor',
            opacity: i < rating ? 1 : 0.2,
            fill: i < rating ? '#f59e0b' : 'none',
          }}
        />
      ))}
    </span>
  );
}

/* ============================================================
   MAIN
   ============================================================ */
const TestimonialsManager = () => {
  const { theme } = useTheme();

  /* Filters */
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [minRating, setMinRating] = useState<number | ''>('');
  const [minRatingInput, setMinRatingInput] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  /* Modal state */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<TTestimonial | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  /* Debounce search + rating */
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => {
      const n = parseInt(minRatingInput, 10);
      setMinRating(!isNaN(n) && n >= 1 && n <= 5 ? n : '');
    }, 350);
    return () => clearTimeout(t);
  }, [minRatingInput]);

  /* ---------- API ---------- */
  const filters: TTestimonialAdminFilters = useMemo(() => {
    const f: TTestimonialAdminFilters = { sortBy, sortOrder };
    if (publishedFilter === 'published') f.isPublished = true;
    if (publishedFilter === 'draft') f.isPublished = false;
    if (searchTerm.trim()) f.search = searchTerm.trim();
    if (minRating !== '') f.minRating = minRating;
    return f;
  }, [publishedFilter, searchTerm, minRating, sortBy, sortOrder]);

  const {
    data: listResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetTestimonialsAdminQuery(filters);

  const { data: statsResponse } = useGetTestimonialStatsQuery();

  const [createTestimonial, { isLoading: isCreating }] = useCreateTestimonialMutation();
  const [updateTestimonial, { isLoading: isUpdating }] = useUpdateTestimonialMutation();
  const [togglePublish, { isLoading: isToggling }] = useToggleTestimonialPublishMutation();
  const [deleteTestimonial, { isLoading: isDeleting }] = useDeleteTestimonialMutation();

  const testimonials: TTestimonial[] = listResponse?.data ?? [];
  const stats = statsResponse?.data ?? { total: 0, published: 0, unpublished: 0, avgRating: null };
  const isBusy = isCreating || isUpdating || isToggling || isDeleting;

  /* Active filter count */
  const activeFilterCount = [
    publishedFilter !== 'all',
    !!searchTerm,
    minRating !== '',
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setPublishedFilter('all');
    setMinRatingInput('');
    setMinRating('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  /* Auto-cancel pending delete */
  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => setPendingDelete(null), 4000);
    return () => clearTimeout(id);
  }, [pendingDelete]);

  /* Esc + body lock */
  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isModalOpen]);

  /* ---------- Handlers ---------- */
  const openCreate = () => { setEditing(null); setIsModalOpen(true); };
  const openEdit = (t: TTestimonial) => { setEditing(t); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditing(null); };

  const handleTogglePublish = async (id: string) => {
    try {
      const res = await togglePublish(id).unwrap();
      toast.success(res.data.isPublished ? 'Published' : 'Moved to draft');
    } catch (err) {
      toast.error(getTestimonialErrorMessage(err as any) || 'Could not update');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id).unwrap();
      toast.success('Testimonial deleted');
      setPendingDelete(null);
    } catch (err) {
      toast.error(getTestimonialErrorMessage(err as any) || 'Could not delete');
    }
  };

  /* ---------- Styling ---------- */
  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  /* ---------- Card ---------- */
  const renderCard = (t: TTestimonial) => {
    return (
      <div
        key={t.id}
        className="group relative flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-lg"
        style={{
          borderColor: `${theme['base-content']}10`,
          backgroundColor: `${theme['base-content']}03`,
          opacity: t.isPublished ? 1 : 0.85,
        }}
      >
        {/* Top accent */}
        <div
          className="h-1"
          style={{ backgroundColor: t.isPublished ? '#10b981' : '#94a3b8' }}
        />

        {/* Hover actions */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => openEdit(t)}
            disabled={isBusy}
            aria-label="Edit"
            className="grid place-items-center h-8 w-8 rounded-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95 disabled:opacity-60"
            style={{
              backgroundColor: `${theme['base-100']}cc`,
              border: `1px solid ${theme['base-content']}15`,
              color: theme['base-content'],
            }}
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={() => setPendingDelete(t.id)}
            disabled={isBusy}
            aria-label="Delete"
            className="grid place-items-center h-8 w-8 rounded-lg backdrop-blur-md transition-all hover:scale-110 active:scale-95 disabled:opacity-60"
            style={{
              backgroundColor: `${theme['base-100']}cc`,
              border: `1px solid ${theme['base-content']}15`,
              color: '#f43f5e',
            }}
          >
            <Trash2 size={14} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3 flex-1">
          {/* Quote mark */}
          <Quote size={22} style={{ color: `${theme.primary}55` }} />

          {/* Content */}
          <p className="text-sm leading-relaxed line-clamp-4 flex-1">
            {t.content}
          </p>

          {/* Rating */}
          {t.rating != null && (
            <div className="flex items-center gap-2">
              <Stars rating={t.rating} size={13} />
              <span className="text-xs font-bold opacity-70">{t.rating}.0</span>
            </div>
          )}

          {/* Author row */}
          <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: `${theme['base-content']}10` }}>
            <div
              className="grid shrink-0 place-items-center h-10 w-10 rounded-full text-xs font-bold overflow-hidden"
              style={{
                backgroundColor: `${theme.primary}1f`,
                color: theme.primary,
                border: `1px solid ${theme.primary}33`,
              }}
            >
              {t.authorAvatar?.fileUrl ? (
                <img
                  src={t.authorAvatar.fileUrl}
                  alt={t.authorName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials(t.authorName)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{t.authorName}</p>
              {(t.authorRole || t.company) && (
                <p className="text-[11px] opacity-60 truncate">
                  {[t.authorRole, t.company].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shrink-0"
              style={{
                backgroundColor: t.isPublished ? '#10b9811a' : '#94a3b81a',
                color: t.isPublished ? '#10b981' : '#94a3b8',
              }}
            >
              {t.isPublished ? <Eye size={9} /> : <EyeOff size={9} />}
              {t.isPublished ? 'Live' : 'Draft'}
            </span>
          </div>

          {/* Source + date */}
          <div className="flex items-center justify-between gap-2 text-[11px] opacity-50">
            <span>{formatDate(t.createdAt)}</span>
            {t.sourceUrl && (
              <a
                href={t.sourceUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 hover:opacity-100 transition-opacity"
              >
                <ExternalLink size={10} /> Source
              </a>
            )}
          </div>

          {/* Actions row */}
          <div className="flex gap-1.5 pt-1">
            <button
              onClick={() => handleTogglePublish(t.id)}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-60 flex-1"
              style={{
                borderColor: t.isPublished ? '#f59e0b55' : '#10b98155',
                color: t.isPublished ? '#f59e0b' : '#10b981',
                backgroundColor: t.isPublished ? '#f59e0b10' : '#10b98110',
              }}
            >
              {isToggling ? (
                <Loader2 size={11} className="animate-spin" />
              ) : t.isPublished ? (
                <Lock size={11} />
              ) : (
                <Unlock size={11} />
              )}
              {t.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>

          {/* Delete confirmation */}
          {pendingDelete === t.id && (
            <div
              className="rounded-lg p-2 flex items-center justify-between gap-2 animate-in fade-in duration-200"
              style={{ backgroundColor: '#f43f5e10', border: '1px solid #f43f5e33' }}
            >
              <span className="text-[11px] font-semibold text-rose-500">Delete?</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={isDeleting}
                  className="rounded-md px-2 py-1 text-[10px] font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 size={10} className="animate-spin" /> : 'Yes'}
                </button>
                <button
                  onClick={() => setPendingDelete(null)}
                  className="rounded-md px-2 py-1 text-[10px] font-bold border transition-all"
                  style={{ borderColor: `${theme['base-content']}20` }}
                >
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-8" style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}>
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}10` }} />
          <div className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}08` }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border p-5 animate-pulse"
                style={{ borderColor: `${theme['base-content']}10`, backgroundColor: `${theme['base-content']}03` }}
              >
                <div className="h-4 w-4 rounded" style={{ backgroundColor: `${theme['base-content']}08` }} />
                <div className="h-3 w-full rounded mt-4" style={{ backgroundColor: `${theme['base-content']}08` }} />
                <div className="h-3 w-5/6 rounded mt-2" style={{ backgroundColor: `${theme['base-content']}06` }} />
                <div className="flex gap-2 items-center mt-4">
                  <div className="h-10 w-10 rounded-full" style={{ backgroundColor: `${theme['base-content']}08` }} />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-1/2 rounded" style={{ backgroundColor: `${theme['base-content']}08` }} />
                    <div className="h-2 w-1/3 rounded" style={{ backgroundColor: `${theme['base-content']}06` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
        <h2 className="text-lg font-bold">Could not load testimonials</h2>
        <p className="max-w-md text-sm opacity-60">{getTestimonialErrorMessage(error) || 'Please try again.'}</p>
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
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
            <Link to="/admin-dashboard" className="hover:opacity-100 transition-opacity">Admin</Link>
            <ChevronRight size={11} className="opacity-50" />
            <span style={{ color: theme.primary }}>Testimonials</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Testimonials</h1>
              <p className="text-xs sm:text-sm opacity-60 max-w-xl mt-1">
                What people say about working with you. Publish the best ones and keep drafts private.
              </p>
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
                <Plus size={18} /> New testimonial
              </button>
            </div>
          </div>
        </div>

        {/* STATS STRIP */}
        {testimonials.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5">
            <StatCard
              icon={<MessageSquareQuote size={16} />}
              label="Total"
              value={String(stats.total)}
              color={theme.primary}
              theme={theme}
            />
            <StatCard
              icon={<Eye size={16} />}
              label="Published"
              value={String(stats.published)}
              color="#10b981"
              theme={theme}
            />
            <StatCard
              icon={<EyeOff size={16} />}
              label="Drafts"
              value={String(stats.unpublished)}
              color="#94a3b8"
              theme={theme}
            />
            <StatCard
              icon={<Award size={16} />}
              label="Avg rating"
              value={stats.avgRating != null ? `${stats.avgRating.toFixed(1)}` : '—'}
              color="#f59e0b"
              theme={theme}
            />
          </div>
        )}

        {/* TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search author, company, or content…"
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

          <button
            onClick={() => setShowFilters((v) => !v)}
            aria-label="Toggle filters"
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
        </div>

        {/* FILTER PANEL */}
        {showFilters && (
          <div
            className="mb-4 rounded-2xl border p-3 sm:p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ borderColor: `${theme['base-content']}15`, backgroundColor: `${theme['base-content']}03` }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 inline-flex items-center gap-1">
                  <Eye size={10} /> Status
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { key: 'all', label: 'All', color: theme.primary },
                    { key: 'published', label: 'Published', color: '#10b981' },
                    { key: 'draft', label: 'Drafts', color: '#94a3b8' },
                  ] as const).map((o) => (
                    <button
                      key={o.key}
                      onClick={() => setPublishedFilter(o.key)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: publishedFilter === o.key ? o.color : `${theme['base-content']}20`,
                        color: publishedFilter === o.key ? o.color : theme['base-content'],
                        backgroundColor: publishedFilter === o.key ? `${o.color}14` : 'transparent',
                      }}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 inline-flex items-center gap-1">
                  <Star size={10} /> Min rating
                </p>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={minRatingInput}
                  onChange={(e) => setMinRatingInput(e.target.value)}
                  placeholder="1–5"
                  className="w-full rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-2 transition"
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      {o === 'asc' ? 'Asc ↑' : 'Desc ↓'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

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

        {/* BODY */}
        {testimonials.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center"
            style={{ borderColor: `${theme.primary}33` }}
          >
            <div className="grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: `${theme.primary}1f` }}>
              <MessageSquareQuote size={28} style={{ color: theme.primary }} />
            </div>
            {activeFilterCount > 0 ? (
              <>
                <h3 className="text-lg font-bold">Nothing matches</h3>
                <p className="max-w-sm text-sm opacity-60">Try adjusting your filters or search.</p>
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
                <h3 className="text-lg font-bold">No testimonials yet</h3>
                <p className="max-w-sm text-sm opacity-60">Add your first testimonial to showcase social proof.</p>
                <button
                  onClick={openCreate}
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  <Plus size={16} /> New testimonial
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {testimonials.map(renderCard)}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen &&
        createPortal(
          <TestimonialEditor
            theme={theme}
            initial={editing}
            isSaving={isCreating || isUpdating}
            onClose={closeModal}
            onSave={async (payload) => {
              try {
                if (editing) {
                  await updateTestimonial({ id: editing.id, updates: payload }).unwrap();
                  toast.success('Testimonial updated');
                } else {
                  await createTestimonial(payload).unwrap();
                  toast.success('Testimonial created');
                }
                closeModal();
              } catch (err) {
                toast.error(getTestimonialErrorMessage(err as any) || 'Could not save');
              }
            }}
          />,
          document.body
        )}
    </div>
  );
};

/* ---------- Stat card ---------- */
function StatCard({
  icon, label, value, color, theme,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  theme: any;
}) {
  return (
    <div
      className="rounded-xl border p-3 sm:p-4 flex items-center gap-3"
      style={{
        borderColor: `${theme['base-content']}10`,
        backgroundColor: `${theme['base-content']}03`,
      }}
    >
      <div
        className="grid place-items-center h-10 w-10 rounded-lg shrink-0"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-50 truncate">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-bold leading-tight" style={{ color }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   TESTIMONIAL EDITOR
   ============================================================ */
function TestimonialEditor({
  theme,
  initial,
  isSaving,
  onClose,
  onSave,
}: {
  theme: any;
  initial: TTestimonial | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: any) => void | Promise<void>;
}) {
  const [form, setForm] = useState({
    authorName: initial?.authorName ?? '',
    authorRole: initial?.authorRole ?? '',
    company: initial?.company ?? '',
    content: initial?.content ?? '',
    rating: initial?.rating != null ? String(initial.rating) : '',
    sourceUrl: initial?.sourceUrl ?? '',
    isPublished: initial?.isPublished ?? false,
  });

  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedRating = parseInt(form.rating, 10);
    const payload: any = {
      authorName: form.authorName.trim(),
      content: form.content.trim(),
      authorRole: form.authorRole.trim() || null,
      company: form.company.trim() || null,
      sourceUrl: form.sourceUrl.trim() || null,
      isPublished: form.isPublished,
      rating: !isNaN(parsedRating) && parsedRating >= 1 && parsedRating <= 5 ? parsedRating : null,
    };
    onSave(payload);
  };

  const ratingNum = parseInt(form.rating, 10);

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
        className="relative w-full sm:max-w-2xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        {/* Header */}
        <div
          className="shrink-0 px-4 sm:px-8 pt-5 pb-4 border-b relative overflow-hidden"
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
                  {initial ? <Edit3 size={16} /> : <MessageSquareQuote size={16} />}
                </span>
                <h2 className="text-base sm:text-lg font-bold truncate">
                  {initial ? 'Edit testimonial' : 'New testimonial'}
                </h2>
              </div>
              <p className="text-[11px] opacity-55">
                {initial ? 'Update the testimonial details.' : 'Add a new quote from a client or colleague.'}
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="shrink-0 p-2 rounded-lg transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:rotate-90"
              style={{ backgroundColor: `${theme['base-content']}06`, color: theme['base-content'] }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <form
          id="testimonial-form"
          onSubmit={submit}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-5 space-y-4"
        >
          {/* Author + role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                Author name <span style={{ color: theme.primary }}>*</span>
              </label>
              <input
                required
                autoFocus
                value={form.authorName}
                onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                placeholder="e.g. John Smith"
                className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                Role (optional)
              </label>
              <input
                value={form.authorRole}
                onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                placeholder="e.g. CTO"
                className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Company + source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                Company (optional)
              </label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="e.g. Acme Corp"
                className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                Source URL (optional)
              </label>
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                placeholder="https://…"
                className="w-full rounded-xl py-3 px-4 text-sm font-mono outline-none focus:ring-2 transition"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60">
                Content <span style={{ color: theme.primary }}>*</span>
              </label>
              <span className="text-[10px] opacity-40 font-mono">{form.content.length} chars</span>
            </div>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="What did they say about you?"
              rows={5}
              className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition resize-none"
              style={inputStyle}
            />
          </div>

          {/* Rating */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 inline-flex items-center gap-1.5">
                <Star size={11} /> Rating (optional)
              </label>
              {form.rating && !isNaN(ratingNum) && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: '#f59e0b' }}>
                  {ratingNum} / 5
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => {
                const active = ratingNum >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: String(n) })}
                    className="grid place-items-center h-10 w-10 rounded-lg border transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: active ? '#f59e0b' : `${theme['base-content']}20`,
                      backgroundColor: active ? '#f59e0b14' : 'transparent',
                      color: active ? '#f59e0b' : theme['base-content'],
                    }}
                    aria-label={`Rate ${n}`}
                  >
                    <Star size={16} style={{ fill: active ? '#f59e0b' : 'none' }} />
                  </button>
                );
              })}
              {form.rating && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, rating: '' })}
                  className="ml-1 rounded-lg px-2 py-1 text-[10px] font-semibold opacity-60 hover:opacity-100 transition-opacity"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Publish toggle */}
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
            style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'] }}
          >
            Cancel
          </button>
          <button
            form="testimonial-form"
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {initial ? 'Save changes' : 'Create testimonial'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsManager;