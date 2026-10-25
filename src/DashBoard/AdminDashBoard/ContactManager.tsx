// src/Features/Pages/ContactManager.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  useGetMessagesQuery,
  useGetMessageStatsQuery,
  useGetMessageByIdQuery,
  useMarkMessageReadMutation,
  useMarkMessageRepliedMutation,
  useUpdateMessageStatusMutation,
  useDeleteMessageMutation,
  getContactErrorMessage,
  type TMessage,
  type TMessageStatus,
  type TMessageFilters,
} from '../../Features/Apis/Contact.Api';

import {
  Mail, MailOpen, MailCheck, Archive, Trash2, Search, RefreshCw, X,
  CheckCircle2, Loader2, AlertCircle, ChevronRight, ChevronLeft,
  Inbox, Clock, User, AtSign, ArrowUpDown, Reply, Eye,
  ChevronDown, Sparkles, SlidersHorizontal, MailWarning,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../ThemeContext';

/* ---------- Status meta ---------- */
const STATUS_META: Record<
  TMessageStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  new:      { label: 'New',      color: '#3b82f6', icon: <Mail size={12} /> },
  read:     { label: 'Read',     color: '#f59e0b', icon: <MailOpen size={12} /> },
  replied:  { label: 'Replied',  color: '#10b981', icon: <MailCheck size={12} /> },
  archived: { label: 'Archived', color: '#94a3b8', icon: <Archive size={12} /> },
};

const STATUSES: TMessageStatus[] = ['new', 'read', 'replied', 'archived'];

/* ✅ Only values the backend accepts */
const SORT_FIELDS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'name',      label: 'Name' },
  { value: 'email',     label: 'Email' },
] as const;
type SortField = typeof SORT_FIELDS[number]['value'];

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
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
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('') || '?';

const PAGE_SIZE = 10;

const ContactManager = () => {
  const { theme } = useTheme();

  /* ---------- UI STATE ---------- */
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TMessageStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const detailRef = useRef<HTMLDivElement>(null);

  /* Debounce search input → searchTerm */
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* Reset page when filters change */
  useEffect(() => {
    setPage(1);
  }, [statusFilter, sortBy, sortOrder]);

  /* ---------- API ---------- */
  const filters: TMessageFilters = useMemo(() => {
    const f: TMessageFilters = {
      sortBy,
      sortOrder,
      page,
      limit: PAGE_SIZE,
    };
    if (statusFilter !== 'all') f.status = statusFilter;
    if (searchTerm.trim()) f.search = searchTerm.trim();
    return f;
  }, [statusFilter, searchTerm, sortBy, sortOrder, page]);

  const {
    data: messagesResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetMessagesQuery(filters);

  const { data: statsResponse } = useGetMessageStatsQuery();

  const {
    data: selectedResponse,
    isFetching: isFetchingDetail,
  } = useGetMessageByIdQuery(selectedId ?? '', { skip: !selectedId });

  const [markRead, { isLoading: isMarkingRead }] = useMarkMessageReadMutation();
  const [markReplied, { isLoading: isMarkingReplied }] = useMarkMessageRepliedMutation();
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateMessageStatusMutation();
  const [deleteMessage, { isLoading: isDeleting }] = useDeleteMessageMutation();

  const messages: TMessage[] = messagesResponse?.data ?? [];
  const stats = statsResponse?.data ?? { total: 0, new: 0, read: 0, replied: 0, archived: 0 };
  const selected = selectedResponse?.data ?? null;

  const isBusy = isMarkingRead || isMarkingReplied || isUpdatingStatus || isDeleting;

  /* ✅ Pagination derived from backend response (with safe fallback) */
  const pagination = (messagesResponse as any)?.pagination ?? null;
  const totalPages: number =
    pagination?.totalPages ??
    Math.max(1, Math.ceil((pagination?.total ?? stats.total ?? messages.length) / PAGE_SIZE));
  const currentPage: number = pagination?.page ?? page;
  const totalItems: number = pagination?.total ?? stats.total ?? messages.length;

  /* ---------- Auto-cancel pending delete ---------- */
  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => setPendingDelete(null), 4000);
    return () => clearTimeout(id);
  }, [pendingDelete]);

  /* ---------- Esc closes detail panel + body scroll ---------- */
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [selectedId]);

  /* ---------- Handlers ---------- */
  const openMessage = async (msg: TMessage) => {
    setSelectedId(msg.id);
    if (msg.status === 'new') {
      try {
        await markRead(msg.id).unwrap();
      } catch {
        /* silent */
      }
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
      toast.success('Marked as read');
    } catch (err) {
      toast.error(getContactErrorMessage(err as any) || 'Could not update');
    }
  };

  const handleMarkReplied = async (id: string) => {
    try {
      await markReplied(id).unwrap();
      toast.success('Marked as replied');
    } catch (err) {
      toast.error(getContactErrorMessage(err as any) || 'Could not update');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await updateStatus({ id, status: 'archived' }).unwrap();
      toast.success('Archived');
    } catch (err) {
      toast.error(getContactErrorMessage(err as any) || 'Could not archive');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage(id).unwrap();
      toast.success('Message deleted');
      if (selectedId === id) setSelectedId(null);
      setPendingDelete(null);
    } catch (err) {
      toast.error(getContactErrorMessage(err as any) || 'Could not delete');
    }
  };

  /* ---------- Styling ---------- */
  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  const statusTabs: { key: TMessageStatus | 'all'; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All', count: stats.total, color: theme.primary },
    ...STATUSES.map((s) => ({
      key: s,
      label: STATUS_META[s].label,
      count: stats[s] ?? 0,
      color: STATUS_META[s].color,
    })),
  ];

  /* ---------- Row renderer ---------- */
  const renderRow = (msg: TMessage) => {
    const meta = STATUS_META[msg.status];
    const isActive = selectedId === msg.id;
    const isNew = msg.status === 'new';

    return (
      <button
        key={msg.id}
        onClick={() => openMessage(msg)}
        className="group relative w-full text-left flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.995]"
        style={{
          borderColor: isActive ? meta.color : `${theme['base-content']}10`,
          backgroundColor: isActive
            ? `${meta.color}10`
            : isNew
            ? `${meta.color}08`
            : `${theme['base-content']}03`,
        }}
      >
        {/* Unread stripe */}
        {isNew && (
          <span
            aria-hidden
            className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
            style={{ backgroundColor: meta.color }}
          />
        )}

        {/* Avatar */}
        <div
          className="grid shrink-0 place-items-center h-11 w-11 sm:h-12 sm:w-12 rounded-xl text-sm font-bold"
          style={{
            backgroundColor: `${meta.color}1f`,
            color: meta.color,
            border: `1px solid ${meta.color}33`,
          }}
        >
          {initials(msg.name)}
        </div>

        <div className="min-w-0 flex-1">
          {/* Row 1: name + status + time */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm sm:text-base truncate ${isNew ? 'font-bold' : 'font-semibold'}`}>
              {msg.name}
            </p>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shrink-0"
              style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
            >
              {meta.icon}
              {meta.label}
            </span>
            <span className="ml-auto text-[11px] opacity-50 shrink-0 hidden sm:inline-flex items-center gap-1">
              <Clock size={10} /> {formatDate(msg.createdAt)}
            </span>
          </div>

          {/* Row 2: email */}
          <p className="text-xs opacity-60 mt-0.5 truncate inline-flex items-center gap-1">
            <AtSign size={10} className="opacity-60" /> {msg.email}
          </p>

          {/* Row 3: subject */}
          {msg.subject && (
            <p className="text-xs sm:text-sm font-semibold mt-1.5 truncate">
              {msg.subject}
            </p>
          )}

          {/* Row 4: message preview */}
          <p className="text-xs sm:text-sm opacity-70 mt-1 line-clamp-2 leading-relaxed">
            {msg.message}
          </p>

          {/* Row 5: mobile time + hover hint */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-[11px] opacity-50 inline-flex items-center gap-1 sm:hidden">
              <Clock size={10} /> {formatDate(msg.createdAt)}
            </span>
            <span
              className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ color: meta.color }}
            >
              <Eye size={11} /> Open
            </span>
          </div>
        </div>
      </button>
    );
  };

  /* ---------- Pagination renderer ---------- */
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages: (number | '…')[] = [];
    const push = (n: number | '…') => pages.push(n);

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) push(i);
    } else {
      push(1);
      if (currentPage > 3) push('…');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) push(i);
      if (currentPage < totalPages - 2) push('…');
      push(totalPages);
    }

    const goto = (n: number) => {
      if (n < 1 || n > totalPages || n === currentPage) return;
      setPage(n);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
        <p className="text-xs opacity-60">
          Showing <span className="font-semibold">{messages.length}</span> of{' '}
          <span className="font-semibold">{totalItems}</span> messages
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => goto(currentPage - 1)}
            disabled={currentPage <= 1 || isFetching}
            aria-label="Previous page"
            className="grid place-items-center h-9 w-9 rounded-xl border transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              borderColor: `${theme['base-content']}15`,
              color: theme['base-content'],
              backgroundColor: `${theme['base-content']}03`,
            }}
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-2 text-xs opacity-40">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goto(p)}
                disabled={isFetching}
                aria-current={p === currentPage ? 'page' : undefined}
                className="grid place-items-center h-9 min-w-9 px-2 rounded-xl text-xs font-bold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  borderColor:
                    p === currentPage ? theme.primary : `${theme['base-content']}15`,
                  color: p === currentPage ? theme['base-100'] : theme['base-content'],
                  backgroundColor:
                    p === currentPage ? theme.primary : `${theme['base-content']}03`,
                }}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => goto(currentPage + 1)}
            disabled={currentPage >= totalPages || isFetching}
            aria-label="Next page"
            className="grid place-items-center h-9 w-9 rounded-xl border transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              borderColor: `${theme['base-content']}15`,
              color: theme['base-content'],
              backgroundColor: `${theme['base-content']}03`,
            }}
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
      <div
        className="min-h-screen p-4 lg:p-8"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 space-y-3">
            <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}10` }} />
            <div className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}08` }} />
            <div className="h-3 w-96 max-w-full rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}06` }} />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border p-4 sm:p-5 animate-pulse"
                style={{
                  borderColor: `${theme['base-content']}10`,
                  backgroundColor: `${theme['base-content']}03`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="flex gap-3 sm:gap-4">
                  <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl shrink-0" style={{ backgroundColor: `${theme['base-content']}08` }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 rounded" style={{ backgroundColor: `${theme['base-content']}08` }} />
                    <div className="h-2 w-1/2 rounded" style={{ backgroundColor: `${theme['base-content']}06` }} />
                    <div className="h-2 w-2/3 rounded" style={{ backgroundColor: `${theme['base-content']}06` }} />
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
        <div
          className="grid h-16 w-16 place-items-center rounded-full"
          style={{ backgroundColor: `${theme.primary}1f` }}
        >
          <AlertCircle size={28} style={{ color: theme.primary }} />
        </div>
        <h2 className="text-lg font-bold">Could not load messages</h2>
        <p className="max-w-md text-sm opacity-60">
          {getContactErrorMessage(error) || 'Please try again.'}
        </p>
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
    <div
      className="min-h-screen p-3 sm:p-4 lg:p-8"
      style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
            <Link to="/admin-dashboard" className="hover:opacity-100 transition-opacity">
              Admin
            </Link>
            <ChevronRight size={11} className="opacity-50" />
            <span style={{ color: theme.primary }}>Messages</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 sm:gap-6">
            <div className="space-y-2 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                  Contact inbox
                </h1>
                {stats.new > 0 && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold"
                    style={{
                      backgroundColor: `${STATUS_META.new.color}1a`,
                      color: STATUS_META.new.color,
                    }}
                  >
                    <Sparkles size={11} />
                    {stats.new} new
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm opacity-60 max-w-xl">
                Every message submitted through your portfolio contact form. Mark as read,
                reply, archive, or delete.
              </p>

              {/* Status pills — scrollable on mobile */}
              <div className="flex gap-2 pt-3 overflow-x-auto pb-1 -mx-1 px-1">
                {statusTabs.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    aria-pressed={statusFilter === f.key}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                    style={{
                      borderColor:
                        statusFilter === f.key ? f.color : `${theme['base-content']}15`,
                      color: statusFilter === f.key ? f.color : theme['base-content'],
                      backgroundColor:
                        statusFilter === f.key ? `${f.color}14` : 'transparent',
                    }}
                  >
                    {f.label} <span className="opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60 w-full sm:w-auto justify-center"
              style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
            >
              {isFetching ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>
          </div>
        </div>

        {/* SEARCH + SORT */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 opacity-40"
                size={16}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search name, email, message…"
                className="w-full rounded-xl py-3 pl-10 sm:pl-11 pr-10 text-sm outline-none focus:ring-2 transition"
                style={inputStyle}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
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
              aria-expanded={showFilters}
              className="sm:hidden grid place-items-center h-11 w-11 rounded-xl border transition-all shrink-0"
              style={{
                borderColor: showFilters ? theme.primary : `${theme['base-content']}15`,
                color: showFilters ? theme.primary : theme['base-content'],
                backgroundColor: showFilters ? `${theme.primary}10` : 'transparent',
              }}
            >
              <SlidersHorizontal size={16} />
            </button>

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
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown
                  size={13}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
                />
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
                />
              </div>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                className="rounded-xl px-3 h-11 text-xs font-semibold border transition-all hover:-translate-y-0.5"
                style={{
                  borderColor: `${theme['base-content']}15`,
                  color: theme['base-content'],
                  backgroundColor: `${theme['base-content']}03`,
                }}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>

          {/* Mobile filters panel */}
          {showFilters && (
            <div
              className="sm:hidden mt-2 rounded-xl border p-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
              style={{
                borderColor: `${theme['base-content']}15`,
                backgroundColor: `${theme['base-content']}03`,
              }}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5">
                  Sort by
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SORT_FIELDS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setSortBy(f.value)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        borderColor:
                          sortBy === f.value ? theme.primary : `${theme['base-content']}20`,
                        color:
                          sortBy === f.value ? theme.primary : theme['base-content'],
                        backgroundColor:
                          sortBy === f.value ? `${theme.primary}14` : 'transparent',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5">
                  Order
                </p>
                <div className="flex gap-1.5">
                  {(['asc', 'desc'] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => setSortOrder(o)}
                      className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        borderColor:
                          sortOrder === o ? theme.primary : `${theme['base-content']}20`,
                        color:
                          sortOrder === o ? theme.primary : theme['base-content'],
                        backgroundColor:
                          sortOrder === o ? `${theme.primary}14` : 'transparent',
                      }}
                    >
                      {o === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LIST */}
        {messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center"
            style={{ borderColor: `${theme.primary}33` }}
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ backgroundColor: `${theme.primary}1f` }}
            >
              <Inbox size={28} style={{ color: theme.primary }} />
            </div>

            {searchTerm || statusFilter !== 'all' ? (
              <>
                <h3 className="text-lg font-bold">Nothing matches</h3>
                <p className="max-w-sm text-sm opacity-60">
                  {searchTerm
                    ? `No messages match "${searchTerm}".`
                    : `No messages with status "${statusFilter}".`}
                </p>
                <button
                  onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">No messages yet</h3>
                <p className="max-w-sm text-sm opacity-60">
                  When someone submits your contact form, it will land here.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-2 sm:gap-3">
              {messages.map(renderRow)}
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* ============ MESSAGE DETAIL (portal) ============ */}
      {selectedId &&
        createPortal(
          <div
            className="fixed inset-0 flex items-stretch sm:items-center justify-end p-0 sm:p-4 md:p-6 animate-in fade-in duration-200"
            style={{ zIndex: 9999, isolation: 'isolate' }}
            role="dialog"
            aria-modal="true"
            aria-label="Message detail"
          >
            <div
              className="absolute inset-0 animate-in fade-in duration-200"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              onClick={() => setSelectedId(null)}
            />

            <div
              ref={detailRef}
              className="relative w-full sm:max-w-lg md:max-w-xl h-full sm:h-auto sm:max-h-[92vh] rounded-none sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-4 sm:zoom-in-95 duration-300"
              style={{
                backgroundColor: theme['base-100'],
                color: theme['base-content'],
              }}
            >
              {/* Header */}
              <div
                className="shrink-0 px-4 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5 border-b relative overflow-hidden"
                style={{
                  borderColor: `${theme['base-content']}10`,
                  background: selected
                    ? `linear-gradient(135deg, ${STATUS_META[selected.status].color}18, transparent 65%)`
                    : `linear-gradient(135deg, ${theme.primary}14, transparent 65%)`,
                }}
              >
                <div
                  aria-hidden
                  className="absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl pointer-events-none"
                  style={{
                    backgroundColor: selected
                      ? `${STATUS_META[selected.status].color}33`
                      : `${theme.primary}33`,
                  }}
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
                      <Link
                        to="/admin-dashboard"
                        onClick={() => setSelectedId(null)}
                        className="hover:opacity-100 transition-opacity"
                      >
                        Admin
                      </Link>
                      <ChevronRight size={11} className="opacity-50" />
                      <span className="opacity-80">Messages</span>
                      <ChevronRight size={11} className="opacity-50" />
                      <span style={{ color: theme.primary }}>Detail</span>
                    </div>

                    {isFetchingDetail && !selected ? (
                      <div className="space-y-2">
                        <div
                          className="h-6 w-40 rounded animate-pulse"
                          style={{ backgroundColor: `${theme['base-content']}08` }}
                        />
                        <div
                          className="h-3 w-56 max-w-full rounded animate-pulse"
                          style={{ backgroundColor: `${theme['base-content']}06` }}
                        />
                      </div>
                    ) : selected ? (
                      <>
                        <div className="flex items-start gap-3">
                          <div
                            className="grid shrink-0 place-items-center h-11 w-11 sm:h-12 sm:w-12 rounded-xl text-sm font-bold"
                            style={{
                              backgroundColor: `${STATUS_META[selected.status].color}1f`,
                              color: STATUS_META[selected.status].color,
                              border: `1px solid ${STATUS_META[selected.status].color}33`,
                            }}
                          >
                            {initials(selected.name)}
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold truncate">
                              {selected.name}
                            </h2>
                            <p className="text-xs opacity-60 truncate inline-flex items-center gap-1 mt-0.5">
                              <AtSign size={11} /> {selected.email}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap mt-3">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                            style={{
                              backgroundColor: `${STATUS_META[selected.status].color}1a`,
                              color: STATUS_META[selected.status].color,
                            }}
                          >
                            {STATUS_META[selected.status].icon}
                            {STATUS_META[selected.status].label}
                          </span>
                          <span className="text-[11px] opacity-50 inline-flex items-center gap-1">
                            <Clock size={10} /> {formatFullDate(selected.createdAt)}
                          </span>
                        </div>
                      </>
                    ) : null}
                  </div>

                  <button
                    onClick={() => setSelectedId(null)}
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

              {/* Body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 space-y-4 sm:space-y-5">
                {isFetchingDetail && !selected ? (
                  <div className="space-y-3">
                    {[2, 1, 3, 2, 1].map((w, i) => (
                      <div
                        key={i}
                        className="h-4 rounded animate-pulse"
                        style={{
                          width: `${w * 25}%`,
                          backgroundColor: `${theme['base-content']}06`,
                        }}
                      />
                    ))}
                  </div>
                ) : selected ? (
                  <>
                    {selected.subject && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">
                          Subject
                        </p>
                        <p className="text-sm font-semibold">{selected.subject}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1">
                        Message
                      </p>
                      <div
                        className="rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
                        style={{
                          backgroundColor: `${theme['base-content']}04`,
                          border: `1px solid ${theme['base-content']}10`,
                        }}
                      >
                        {selected.message}
                      </div>
                    </div>

                    {selected.repliedAt && (
                      <div
                        className="rounded-xl px-4 py-3 text-xs"
                        style={{
                          backgroundColor: `${STATUS_META.replied.color}12`,
                          border: `1px solid ${STATUS_META.replied.color}33`,
                          color: STATUS_META.replied.color,
                        }}
                      >
                        <span className="inline-flex items-center gap-1.5 font-semibold">
                          <CheckCircle2 size={12} />
                          Replied on {formatFullDate(selected.repliedAt)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <MailWarning size={28} style={{ color: theme.primary }} className="opacity-50" />
                    <p className="text-sm opacity-60">Message not found.</p>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              {selected && (
                <div
                  className="shrink-0 px-4 sm:px-6 py-4 border-t flex flex-wrap gap-2 justify-end"
                  style={{
                    borderColor: `${theme['base-content']}10`,
                    backgroundColor: `${theme['base-content']}02`,
                  }}
                >
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent(
                      `Re: ${selected.subject ?? 'Your message'}`
                    )}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 flex-1 sm:flex-none"
                    style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                  >
                    <Reply size={14} /> Reply
                  </a>

                  {selected.status === 'new' && (
                    <button
                      onClick={() => handleMarkRead(selected.id)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{
                        borderColor: `${STATUS_META.read.color}55`,
                        color: STATUS_META.read.color,
                        backgroundColor: `${STATUS_META.read.color}0f`,
                      }}
                    >
                      {isMarkingRead ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <MailOpen size={14} />
                      )}
                      Read
                    </button>
                  )}

                  {selected.status !== 'replied' && selected.status !== 'archived' && (
                    <button
                      onClick={() => handleMarkReplied(selected.id)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{
                        borderColor: `${STATUS_META.replied.color}55`,
                        color: STATUS_META.replied.color,
                        backgroundColor: `${STATUS_META.replied.color}0f`,
                      }}
                    >
                      {isMarkingReplied ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <MailCheck size={14} />
                      )}
                      Replied
                    </button>
                  )}

                  {selected.status !== 'archived' && (
                    <button
                      onClick={() => handleArchive(selected.id)}
                      disabled={isBusy}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
                      style={{
                        borderColor: `${theme['base-content']}20`,
                        color: theme['base-content'],
                      }}
                    >
                      {isUpdatingStatus ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Archive size={14} />
                      )}
                      Archive
                    </button>
                  )}

                  {pendingDelete === selected.id ? (
                    <div className="flex gap-1 flex-1 sm:flex-none">
                      <button
                        onClick={() => handleDelete(selected.id)}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center gap-1 rounded-xl px-4 py-2.5 text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-60 flex-1"
                      >
                        {isDeleting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                        Confirm
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
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ContactManager;