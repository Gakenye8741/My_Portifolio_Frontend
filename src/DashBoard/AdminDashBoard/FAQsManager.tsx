// src/Features/Pages/FAQsManager.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  useGetFaqsQuery,
  useGetFaqStatsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useReorderFaqsMutation,
  useDeleteFaqMutation,
  getFaqErrorMessage,
  type TFaq,
  type TFaqFilters,
} from '../../Features/Apis/FAQs.Api';
import { useTheme } from '../../ThemeContext'
import {
  Plus, Trash2, Edit3, Search, RefreshCw, X,
  Loader2, AlertCircle, ChevronRight, ChevronLeft,
  ChevronUp, ChevronDown, Save, HelpCircle, Filter,
  RotateCcw, ListOrdered, Hash, MessageCircleQuestion,
  ArrowUpDown, GripVertical, CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ---------- Pagination ---------- */
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
const DEFAULT_PAGE_SIZE = 10;

/* ============================================================
   MAIN
   ============================================================ */
const FAQsManager = () => {
  const { theme } = useTheme();

  /* Filters */
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);

  /* Modal */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<TFaq | null>(null);

  /* Delete */
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  /* Reorder mode */
  const [reorderMode, setReorderMode] = useState(false);
  const [draftOrder, setDraftOrder] = useState<TFaq[]>([]);

  /* Debounce search */
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(1); }, [pageSize]);

  /* ---------- API ---------- */
  const filters: TFaqFilters = useMemo(() => {
    const f: TFaqFilters = { page, limit: pageSize };
    if (searchTerm.trim()) f.search = searchTerm.trim();
    return f;
  }, [searchTerm, page, pageSize]);

  const {
    data: listResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetFaqsQuery(filters);

  const { data: statsResponse } = useGetFaqStatsQuery();

  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [reorderFaqs, { isLoading: isReordering }] = useReorderFaqsMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const faqs: TFaq[] = listResponse?.data ?? [];
  const stats = statsResponse?.data ?? { total: 0, maxOrder: 0 };
  const isBusy = isCreating || isUpdating || isReordering || isDeleting;

  /* ---------- Pagination derived ---------- */
  const pagination = (listResponse as any)?.pagination ?? null;
  const totalItems = pagination?.total ?? stats.total ?? faqs.length;
  const totalPages =
    pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = pagination?.page ?? page;

  /* Active filters */
  const activeFilterCount = [!!searchTerm].filter(Boolean).length;

  const resetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
  };

  /* ---------- Reorder setup ---------- */
  useEffect(() => {
    if (!reorderMode) return;
    setDraftOrder([...faqs].sort((a, b) => a.order - b.order));
  }, [reorderMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const moveItem = (index: number, dir: -1 | 1) => {
    const next = [...draftOrder];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDraftOrder(next);
  };

  const saveReorder = async () => {
    try {
      const items = draftOrder.map((f, i) => ({ id: f.id, order: i }));
      await reorderFaqs({ items }).unwrap();
      toast.success('Order saved');
      setReorderMode(false);
    } catch (err) {
      toast.error(getFaqErrorMessage(err as any) || 'Could not reorder');
    }
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => setPendingDelete(null), 4000);
    return () => clearTimeout(id);
  }, [pendingDelete]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
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
  const openEdit = (f: TFaq) => { setEditing(f); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditing(null); };

  const handleDelete = async (id: string) => {
    try {
      await deleteFaq(id).unwrap();
      toast.success('FAQ deleted');
      setPendingDelete(null);
    } catch (err) {
      toast.error(getFaqErrorMessage(err as any) || 'Could not delete');
    }
  };

  /* ---------- Styling ---------- */
  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  /* ---------- Row ---------- */
  const renderRow = (faq: TFaq, idx: number) => {
    const isReordering = reorderMode;
    const draftIdx = draftOrder.findIndex((f) => f.id === faq.id);

    if (isReordering) {
      const item = draftOrder[draftIdx];
      if (!item) return null;
      return (
        <div
          key={faq.id}
          className="flex items-center gap-3 p-4 rounded-2xl border"
          style={{
            borderColor: `${theme['base-content']}10`,
            backgroundColor: `${theme['base-content']}03`,
          }}
        >
          <div
            className="grid shrink-0 place-items-center h-9 w-9 rounded-lg text-xs font-bold"
            style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
          >
            #{draftIdx + 1}
          </div>
          <GripVertical size={16} className="opacity-30 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate">{item.question}</p>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => moveItem(draftIdx, -1)}
              disabled={draftIdx === 0}
              aria-label="Move up"
              className="grid place-items-center h-8 w-8 rounded-lg border transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ borderColor: `${theme['base-content']}15`, color: theme['base-content'] }}
            >
              <ChevronUp size={14} />
            </button>
            <button
              onClick={() => moveItem(draftIdx, 1)}
              disabled={draftIdx === draftOrder.length - 1}
              aria-label="Move down"
              className="grid place-items-center h-8 w-8 rounded-lg border transition-all hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ borderColor: `${theme['base-content']}15`, color: theme['base-content'] }}
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={faq.id}
        className="group relative rounded-2xl border transition-all hover:shadow-md"
        style={{
          borderColor: `${theme['base-content']}10`,
          backgroundColor: `${theme['base-content']}03`,
        }}
      >
        <div className="flex items-start gap-3 p-4 sm:p-5">
          {/* Order badge */}
          <div
            className="grid shrink-0 place-items-center h-10 w-10 rounded-xl text-xs font-bold"
            style={{
              backgroundColor: `${theme.primary}1f`,
              color: theme.primary,
              border: `1px solid ${theme.primary}33`,
            }}
            title={`Order: ${faq.order}`}
          >
            <Hash size={12} className="opacity-60" />
            {faq.order}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2">
              <HelpCircle size={14} className="shrink-0 mt-0.5 opacity-50" />
              <p className="text-sm font-bold leading-snug">{faq.question}</p>
            </div>
            <div className="flex items-start gap-2 mt-2">
              <MessageCircleQuestion size={14} className="shrink-0 mt-0.5 opacity-40" />
              <p className="text-xs sm:text-sm opacity-70 leading-relaxed line-clamp-2">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div
          className="flex items-center gap-2 px-4 sm:px-5 pb-4 pt-1"
        >
          <button
            onClick={() => openEdit(faq)}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-60"
            style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'] }}
          >
            <Edit3 size={12} /> Edit
          </button>

          {pendingDelete === faq.id ? (
            <div className="flex gap-1">
              <button
                onClick={() => handleDelete(faq.id)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-60"
              >
                {isDeleting ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                Confirm
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-bold border transition-all"
                style={{ borderColor: `${theme['base-content']}20` }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPendingDelete(faq.id)}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-60"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>
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
        className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 rounded-2xl border px-4 py-3"
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
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
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

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-8" style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}>
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}10` }} />
          <div className="h-8 w-56 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}08` }} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border p-4 animate-pulse" style={{ borderColor: `${theme['base-content']}10`, backgroundColor: `${theme['base-content']}03` }}>
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-xl" style={{ backgroundColor: `${theme['base-content']}08` }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-2/3 rounded" style={{ backgroundColor: `${theme['base-content']}08` }} />
                  <div className="h-2 w-full rounded" style={{ backgroundColor: `${theme['base-content']}06` }} />
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
        <h2 className="text-lg font-bold">Could not load FAQs</h2>
        <p className="max-w-md text-sm opacity-60">{getFaqErrorMessage(error) || 'Please try again.'}</p>
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
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
            <Link to="/admin-dashboard" className="hover:opacity-100 transition-opacity">Admin</Link>
            <ChevronRight size={11} className="opacity-50" />
            <span style={{ color: theme.primary }}>FAQs</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">FAQs</h1>
              <p className="text-xs sm:text-sm opacity-60 max-w-xl mt-1">
                Frequently asked questions — the ones clients ask you over and over.
                Control their order and let the public page sort them automatically.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => refetch()}
                disabled={isFetching || reorderMode}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'], backgroundColor: `${theme['base-content']}03` }}
              >
                {isFetching ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Refresh
              </button>

              {faqs.length > 1 && (
                <button
                  onClick={() => setReorderMode((v) => !v)}
                  disabled={isBusy || !!searchTerm}
                  title={searchTerm ? 'Clear search to reorder' : undefined}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                  style={{
                    borderColor: reorderMode ? theme.primary : `${theme['base-content']}20`,
                    color: reorderMode ? theme.primary : theme['base-content'],
                    backgroundColor: reorderMode ? `${theme.primary}10` : `${theme['base-content']}03`,
                  }}
                >
                  <ListOrdered size={16} />
                  {reorderMode ? 'Cancel reorder' : 'Reorder'}
                </button>
              )}

              <button
                onClick={openCreate}
                disabled={reorderMode}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-60"
                style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
              >
                <Plus size={18} /> New FAQ
              </button>
            </div>
          </div>
        </div>

        {/* STATS + SEARCH */}
        {!reorderMode && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
            <StatCard
              icon={<HelpCircle size={16} />}
              label="Total FAQs"
              value={String(stats.total)}
              color={theme.primary}
              theme={theme}
            />
            <StatCard
              icon={<Hash size={16} />}
              label="Highest order"
              value={String(stats.maxOrder)}
              color="#8b5cf6"
              theme={theme}
            />
          </div>
        )}

        {!reorderMode && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search questions or answers…"
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

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs font-semibold border transition-all hover:-translate-y-0.5"
                style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'], backgroundColor: `${theme['base-content']}03` }}
              >
                <RotateCcw size={13} /> Reset
              </button>
            )}
          </div>
        )}

        {/* REORDER BANNER */}
        {reorderMode && (
          <div
            className="mb-4 rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{ borderColor: `${theme.primary}44`, backgroundColor: `${theme.primary}0d` }}
          >
            <div className="flex items-start gap-2 min-w-0">
              <ArrowUpDown size={16} className="mt-0.5 shrink-0" style={{ color: theme.primary }} />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Reorder mode</p>
                <p className="text-[11px] opacity-70">
                  Use the arrows to move FAQs. Save when done.
                </p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => setReorderMode(false)}
                disabled={isReordering}
                className="flex-1 sm:flex-none rounded-lg px-4 py-2 text-xs font-semibold border transition-all"
                style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'] }}
              >
                Cancel
              </button>
              <button
                onClick={saveReorder}
                disabled={isReordering}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-60"
                style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
              >
                {isReordering ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                Save order
              </button>
            </div>
          </div>
        )}

        {/* LIST */}
        {reorderMode ? (
          <div className="space-y-2">
            {draftOrder.map((f) => renderRow(f, 0))}
          </div>
        ) : faqs.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center"
            style={{ borderColor: `${theme.primary}33` }}
          >
            <div className="grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: `${theme.primary}1f` }}>
              <HelpCircle size={28} style={{ color: theme.primary }} />
            </div>
            {activeFilterCount > 0 ? (
              <>
                <h3 className="text-lg font-bold">Nothing matches</h3>
                <p className="max-w-sm text-sm opacity-60">Try a different search.</p>
                <button
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  <RotateCcw size={15} /> Clear search
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">No FAQs yet</h3>
                <p className="max-w-sm text-sm opacity-60">Add your first FAQ to help visitors find answers.</p>
                <button
                  onClick={openCreate}
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  <Plus size={16} /> New FAQ
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {faqs.map((f, i) => renderRow(f, i))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen &&
        createPortal(
          <FaqEditor
            theme={theme}
            initial={editing}
            nextOrder={stats.maxOrder + 1}
            isSaving={isCreating || isUpdating}
            onClose={closeModal}
            onSave={async (payload) => {
              try {
                if (editing) {
                  await updateFaq({ id: editing.id, updates: payload }).unwrap();
                  toast.success('FAQ updated');
                } else {
                  await createFaq(payload).unwrap();
                  toast.success('FAQ created');
                }
                closeModal();
              } catch (err) {
                toast.error(getFaqErrorMessage(err as any) || 'Could not save');
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
   FAQ EDITOR
   ============================================================ */
function FaqEditor({
  theme, initial, nextOrder, isSaving, onClose, onSave,
}: {
  theme: any;
  initial: TFaq | null;
  nextOrder: number;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: any) => void | Promise<void>;
}) {
  const [question, setQuestion] = useState(initial?.question ?? '');
  const [answer, setAnswer] = useState(initial?.answer ?? '');
  const [order, setOrder] = useState<string>(
    initial?.order != null ? String(initial.order) : String(nextOrder)
  );

  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedOrder = parseInt(order, 10);
    const payload: any = {
      question: question.trim(),
      answer: answer.trim(),
    };
    if (!isNaN(parsedOrder) && parsedOrder >= 0) payload.order = parsedOrder;
    onSave(payload);
  };

  const canSave = question.trim().length > 0 && answer.trim().length > 0 && !isSaving;

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
        className="relative w-full sm:max-w-lg max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        {/* Header */}
        <div
          className="shrink-0 px-4 sm:px-6 pt-5 pb-4 border-b relative overflow-hidden"
          style={{
            borderColor: `${theme['base-content']}10`,
            background: `linear-gradient(135deg, ${theme.primary}14, transparent 65%)`,
          }}
        >
          <div
            aria-hidden
            className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: `${theme.primary}33` }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="grid place-items-center h-8 w-8 rounded-lg shrink-0"
                  style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
                >
                  {initial ? <Edit3 size={16} /> : <HelpCircle size={16} />}
                </span>
                <h2 className="text-base sm:text-lg font-bold truncate">
                  {initial ? 'Edit FAQ' : 'New FAQ'}
                </h2>
              </div>
              <p className="text-[11px] opacity-55">
                {initial ? 'Update the question or answer.' : 'Add a new frequently asked question.'}
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
          id="faq-form"
          onSubmit={submit}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5 inline-flex items-center gap-1.5">
              <HelpCircle size={11} /> Question <span style={{ color: theme.primary }}>*</span>
            </label>
            <input
              required
              autoFocus
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What's your typical project timeline?"
              className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
              style={inputStyle}
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 inline-flex items-center gap-1.5">
                <MessageCircleQuestion size={11} /> Answer <span style={{ color: theme.primary }}>*</span>
              </label>
              <span className="text-[10px] opacity-40 font-mono">{answer.length} chars</span>
            </div>
            <textarea
              required
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write a clear, friendly answer…"
              rows={6}
              className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition resize-none"
              style={inputStyle}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5 inline-flex items-center gap-1.5">
              <Hash size={11} /> Order
            </label>
            <input
              type="number"
              min={0}
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl py-3 px-4 text-sm font-mono outline-none focus:ring-2 transition"
              style={inputStyle}
            />
            <p className="text-[11px] opacity-50 mt-1.5">
              Lower numbers appear first. Leave it as-is to keep the current position.
            </p>
          </div>
        </form>

        <div
          className="shrink-0 flex flex-col-reverse sm:flex-row gap-2 justify-end px-4 sm:px-6 py-4 border-t"
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
            form="faq-form"
            type="submit"
            disabled={!canSave}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {initial ? 'Save changes' : 'Create FAQ'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default FAQsManager;