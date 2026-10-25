// src/Features/Pages/SkillsManager.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  useGetSkillsQuery,
  useGetSkillsGroupedQuery,
  useCreateSkillMutation,
  useUpdateSkillMutation,
  useUpsertSkillByTechMutation,
  useDeleteSkillMutation,
  getSkillErrorMessage,
  type TSkill,
  type TSkillCategory,
  type TSkillFilters,
} from '../../Features/Apis/Skills.Api';
import {
  useGetTechnologiesQuery,
  type TTechnology,
} from '../../Features/Apis/Technologies.Api';

import {
  Plus, Trash2, Edit3, Search, RefreshCw, X,
  Loader2, AlertCircle, ChevronRight, Save,
  Cpu, Layout, Settings, Database, Infinity as ToolsIcon,
  Smartphone, Brain, Zap, Gauge, Clock, ArrowUpDown, ChevronDown,
  ChevronLeft, Filter, RotateCcw, Repeat, Grid3x3, List, TrendingUp,
  Award, Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTheme } from '../../ThemeContext';

/* ---------- Pagination constants ---------- */
const PAGE_SIZE_OPTIONS = [6, 9, 12, 24, 48] as const;
const DEFAULT_PAGE_SIZE = 3;

/* ---------- Category meta ---------- */
const CATEGORIES: {
  value: TSkillCategory;
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  { value: 'frontend', label: 'Frontend', color: '#3b82f6', icon: <Layout size={12} /> },
  { value: 'backend',  label: 'Backend',  color: '#10b981', icon: <Settings size={12} /> },
  { value: 'database', label: 'Database', color: '#f59e0b', icon: <Database size={12} /> },
  { value: 'devops',   label: 'DevOps',   color: '#ec4899', icon: <ToolsIcon size={12} /> },
  { value: 'mobile',   label: 'Mobile',   color: '#8b5cf6', icon: <Smartphone size={12} /> },
  { value: 'ai',       label: 'AI',       color: '#06b6d4', icon: <Brain size={12} /> },
];

const categoryMeta = (cat?: TSkillCategory) =>
  CATEGORIES.find((c) => c.value === cat) ?? {
    color: '#94a3b8',
    label: cat ?? '—',
    icon: null,
  };

const SORT_FIELDS = [
  { value: 'proficiency',     label: 'Proficiency' },
  { value: 'yearsExperience', label: 'Years' },
  { value: 'name',            label: 'Tech name' },
] as const;
type SortField = typeof SORT_FIELDS[number]['value'];

type CategoryKey = 'all' | TSkillCategory;
type ViewMode = 'grid' | 'grouped';

const proficiencyTier = (p: number) => {
  if (p >= 85) return { color: '#10b981', label: 'Expert' };
  if (p >= 70) return { color: '#3b82f6', label: 'Advanced' };
  if (p >= 50) return { color: '#f59e0b', label: 'Intermediate' };
  return { color: '#f43f5e', label: 'Beginner' };
};

/* ============================================================
   Circular proficiency ring
   ============================================================ */
function ProficiencyRing({
  value,
  color,
  size = 64,
  stroke = 6,
  theme,
}: {
  value: number;
  color: string;
  size?: number;
  stroke?: number;
  theme: any;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`${theme['base-content']}12`}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center text-xs font-bold"
        style={{ color }}
      >
        {clamped}%
      </span>
    </div>
  );
}

/* ============================================================
   MAIN
   ============================================================ */
const SkillsManager = () => {
  const { theme } = useTheme();

  /* Filters */
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryKey>('all');
  const [minProficiencyInput, setMinProficiencyInput] = useState('');
  const [minProficiency, setMinProficiency] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<SortField>('proficiency');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  /* Pagination (grid view only) */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  /* Modal state */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<TSkill | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  /* Debounce */
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    const t = setTimeout(() => {
      const n = parseInt(minProficiencyInput, 10);
      setMinProficiency(!isNaN(n) && n >= 0 && n <= 100 ? n : '');
    }, 350);
    return () => clearTimeout(t);
  }, [minProficiencyInput]);

  /* Reset to page 1 when filters change */
  useEffect(() => {
    setPage(1);
  }, [categoryFilter, searchTerm, minProficiency, sortBy, sortOrder, pageSize]);

  /* ---------- API ---------- */
  const filters: TSkillFilters = useMemo(() => {
    const f: TSkillFilters = { sortBy, sortOrder };
    if (categoryFilter !== 'all') f.category = categoryFilter;
    if (searchTerm.trim()) f.search = searchTerm.trim();
    if (minProficiency !== '') f.minProficiency = minProficiency;
    /* ✅ Pass pagination through (backend supports page/limit) */
    (f as any).page = page;
    (f as any).limit = pageSize;
    return f;
  }, [categoryFilter, searchTerm, minProficiency, sortBy, sortOrder, page, pageSize]);

  const {
    data: skillsResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSkillsQuery(filters);

  const {
    data: groupedResponse,
    isLoading: isGroupedLoading,
    isFetching: isGroupedFetching,
    refetch: refetchGrouped,
  } = useGetSkillsGroupedQuery(undefined, { skip: viewMode !== 'grouped' });

  const { data: techResponse } = useGetTechnologiesQuery();

  const [createSkill, { isLoading: isCreating }] = useCreateSkillMutation();
  const [updateSkill, { isLoading: isUpdating }] = useUpdateSkillMutation();
  const [upsertSkill, { isLoading: isUpserting }] = useUpsertSkillByTechMutation();
  const [deleteSkill, { isLoading: isDeleting }] = useDeleteSkillMutation();

  const skills: TSkill[] = skillsResponse?.data ?? [];
  const grouped = groupedResponse?.data ?? {};
  const technologies: TTechnology[] = techResponse?.data ?? [];

  const isBusy = isCreating || isUpdating || isUpserting || isDeleting;

  /* ---------- Pagination derived ---------- */
  const pagination = (skillsResponse as any)?.pagination ?? null;
  const totalPages: number =
    pagination?.totalPages ??
    Math.max(1, Math.ceil((pagination?.total ?? skills.length) / pageSize));
  const currentPage: number = pagination?.page ?? page;
  const totalItems: number = pagination?.total ?? skills.length;

  /* Active filter count */
  const activeFilterCount = [
    categoryFilter !== 'all',
    !!searchTerm,
    minProficiency !== '',
  ].filter(Boolean).length;

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setCategoryFilter('all');
    setMinProficiencyInput('');
    setMinProficiency('');
    setSortBy('proficiency');
    setSortOrder('desc');
    setPage(1);
    setPageSize(DEFAULT_PAGE_SIZE);
  };

  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => setPendingDelete(null), 4000);
    return () => clearTimeout(id);
  }, [pendingDelete]);

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
  const openCreate = () => { setEditingSkill(null); setIsModalOpen(true); };
  const openEdit = (skill: TSkill) => { setEditingSkill(skill); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingSkill(null); };

  const handleDelete = async (id: string) => {
    try {
      await deleteSkill(id).unwrap();
      toast.success('Skill removed');
      setPendingDelete(null);
    } catch (err) {
      toast.error(getSkillErrorMessage(err as any) || 'Could not delete');
    }
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  /* ---------- Stats strip ---------- */
  const stats = useMemo(() => {
    const all = [...skills];
    const avg = all.length
      ? Math.round(all.reduce((a, s) => a + s.proficiency, 0) / all.length)
      : 0;
    const expert = all.filter((s) => s.proficiency >= 85).length;
    const totalYears = all.reduce((a, s) => a + s.yearsExperience, 0);
    return { count: all.length, avg, expert, totalYears };
  }, [skills]);

  /* ---------- Card ---------- */
  const renderCard = (skill: TSkill) => {
    const meta = categoryMeta(skill.technology?.category);
    const tier = proficiencyTier(skill.proficiency);

    return (
      <div
        key={skill.id}
        className="group relative flex flex-col rounded-2xl border overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1"
        style={{
          borderColor: `${theme['base-content']}10`,
          backgroundColor: `${theme['base-content']}03`,
        }}
      >
        <div className="h-1" style={{ backgroundColor: meta.color }} />

        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={() => openEdit(skill)}
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
            onClick={() => setPendingDelete(skill.id)}
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

        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div
                className="grid shrink-0 place-items-center h-11 w-11 rounded-xl"
                style={{
                  backgroundColor: `${meta.color}1f`,
                  color: meta.color,
                  border: `1px solid ${meta.color}33`,
                }}
              >
                <Cpu size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {skill.technology?.name ?? 'Unknown'}
                </p>
                <span
                  className="inline-flex items-center gap-1 mt-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    backgroundColor: `${meta.color}1a`,
                    color: meta.color,
                  }}
                >
                  {meta.icon}
                  {meta.label}
                </span>
              </div>
            </div>

            <ProficiencyRing
              value={skill.proficiency}
              color={tier.color}
              size={56}
              stroke={5}
              theme={theme}
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ backgroundColor: `${tier.color}14`, color: tier.color }}
            >
              <Award size={10} /> {tier.label}
            </span>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{
                backgroundColor: `${theme['base-content']}06`,
                color: theme['base-content'],
              }}
            >
              <Clock size={10} /> {skill.yearsExperience} yr{skill.yearsExperience === 1 ? '' : 's'}
            </span>
          </div>

          {pendingDelete === skill.id && (
            <div
              className="rounded-xl p-2.5 flex items-center justify-between gap-2 animate-in fade-in duration-200"
              style={{ backgroundColor: '#f43f5e10', border: '1px solid #f43f5e33' }}
            >
              <span className="text-[11px] font-semibold text-rose-500">Delete this skill?</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleDelete(skill.id)}
                  disabled={isDeleting}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 size={10} className="animate-spin" /> : 'Yes'}
                </button>
                <button
                  onClick={() => setPendingDelete(null)}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all"
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

  /* ---------- Pagination footer ---------- */
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

  /* ---------- Grouped render (no pagination — grouped endpoint returns all) ---------- */
  const renderGrouped = () => {
    const order: TSkillCategory[] = ['frontend', 'backend', 'database', 'devops', 'mobile', 'ai'];
    const groups = order
      .map((cat) => ({
        cat,
        meta: categoryMeta(cat),
        items: (grouped[cat] ?? []) as TSkill[],
      }))
      .filter((g) => g.items.length > 0);

    if (groups.length === 0) return null;

    return (
      <div className="space-y-6">
        {groups.map((g) => (
          <div key={g.cat}>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="grid place-items-center h-7 w-7 rounded-lg"
                style={{ backgroundColor: `${g.meta.color}1f`, color: g.meta.color }}
              >
                {g.meta.icon}
              </span>
              <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: g.meta.color }}>
                {g.meta.label}
              </h3>
              <span className="text-xs opacity-50">({g.items.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {g.items.map(renderCard)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ---------- Loading ---------- */
  const showLoading = viewMode === 'grid' ? isLoading : isGroupedLoading;
  if (showLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-8" style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}>
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}10` }} />
          <div className="h-8 w-56 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}08` }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border p-5 animate-pulse"
                style={{ borderColor: `${theme['base-content']}10`, backgroundColor: `${theme['base-content']}03` }}
              >
                <div className="flex gap-3 items-start justify-between">
                  <div className="h-11 w-11 rounded-xl" style={{ backgroundColor: `${theme['base-content']}08` }} />
                  <div className="h-14 w-14 rounded-full" style={{ backgroundColor: `${theme['base-content']}06` }} />
                </div>
                <div className="h-3 w-3/4 rounded mt-4" style={{ backgroundColor: `${theme['base-content']}08` }} />
                <div className="h-2 w-1/2 rounded mt-2" style={{ backgroundColor: `${theme['base-content']}06` }} />
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
        <h2 className="text-lg font-bold">Could not load skills</h2>
        <p className="max-w-md text-sm opacity-60">{getSkillErrorMessage(error) || 'Please try again.'}</p>
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
            <span style={{ color: theme.primary }}>Skills</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Skills</h1>
              <p className="text-xs sm:text-sm opacity-60 max-w-xl mt-1">
                Your technical arsenal — proficiency, years, and category at a glance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <button
                onClick={() => (viewMode === 'grid' ? refetch() : refetchGrouped())}
                disabled={isFetching || isGroupedFetching}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
                style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'], backgroundColor: `${theme['base-content']}03` }}
              >
                {(isFetching || isGroupedFetching) ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Refresh
              </button>
              <button
                onClick={openCreate}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
                style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
              >
                <Plus size={18} /> New skill
              </button>
            </div>
          </div>
        </div>

        {/* STATS STRIP */}
        {viewMode === 'grid' && skills.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-5">
            <StatCard
              icon={<Cpu size={16} />}
              label="Skills"
              value={String(totalItems)}
              color={theme.primary}
              theme={theme}
            />
            <StatCard
              icon={<TrendingUp size={16} />}
              label="Avg proficiency"
              value={`${stats.avg}%`}
              color={proficiencyTier(stats.avg).color}
              theme={theme}
            />
            <StatCard
              icon={<Award size={16} />}
              label="Expert (85%+)"
              value={String(stats.expert)}
              color="#10b981"
              theme={theme}
            />
            <StatCard
              icon={<Clock size={16} />}
              label="Years combined"
              value={String(stats.totalYears)}
              color="#8b5cf6"
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
              placeholder="Search by tech name…"
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

          <div
            className="flex rounded-xl border overflow-hidden shrink-0"
            style={{ borderColor: `${theme['base-content']}15` }}
          >
            {([
              { mode: 'grid' as const, icon: <Grid3x3 size={14} />, label: 'Grid' },
              { mode: 'grouped' as const, icon: <List size={14} />, label: 'Grouped' },
            ]).map((v) => (
              <button
                key={v.mode}
                onClick={() => setViewMode(v.mode)}
                aria-pressed={viewMode === v.mode}
                className="inline-flex items-center gap-1.5 px-3 h-11 text-xs font-semibold transition-all"
                style={{
                  color: viewMode === v.mode ? theme.primary : theme['base-content'],
                  backgroundColor: viewMode === v.mode ? `${theme.primary}10` : 'transparent',
                }}
              >
                {v.icon}
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
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
                  <Cpu size={10} /> Category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className="rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: categoryFilter === 'all' ? theme.primary : `${theme['base-content']}20`,
                      color: categoryFilter === 'all' ? theme.primary : theme['base-content'],
                      backgroundColor: categoryFilter === 'all' ? `${theme.primary}14` : 'transparent',
                    }}
                  >
                    All
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategoryFilter(c.value)}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
                      style={{
                        borderColor: categoryFilter === c.value ? c.color : `${theme['base-content']}20`,
                        color: categoryFilter === c.value ? c.color : theme['base-content'],
                        backgroundColor: categoryFilter === c.value ? `${c.color}14` : 'transparent',
                      }}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-1.5 inline-flex items-center gap-1">
                  <Gauge size={10} /> Min proficiency
                </p>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={minProficiencyInput}
                  onChange={(e) => setMinProficiencyInput(e.target.value)}
                  placeholder="e.g. 80"
                  className="w-full rounded-xl py-2.5 px-3 text-xs outline-none focus:ring-2 transition"
                  style={inputStyle}
                />
              </div>
            </div>

            {viewMode === 'grid' && (
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
            )}

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
        {viewMode === 'grid' ? (
          skills.length === 0 ? (
            <EmptyState
              activeFilterCount={activeFilterCount}
              onReset={resetAllFilters}
              onCreate={openCreate}
              theme={theme}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.map(renderCard)}
              </div>
              {renderPagination()}
            </>
          )
        ) : (
          Object.keys(grouped).length === 0 ? (
            <EmptyState
              activeFilterCount={0}
              onReset={resetAllFilters}
              onCreate={openCreate}
              theme={theme}
            />
          ) : (
            renderGrouped()
          )
        )}
      </div>

      {/* MODAL */}
      {isModalOpen &&
        createPortal(
          <SkillEditor
            theme={theme}
            initial={editingSkill}
            technologies={technologies}
            existingSkills={skills}
            isSaving={isCreating || isUpdating || isUpserting}
            onClose={closeModal}
            onSave={async (payload, mode) => {
              try {
                if (editingSkill) {
                  await updateSkill({
                    id: editingSkill.id,
                    updates: {
                      proficiency: payload.proficiency,
                      yearsExperience: payload.yearsExperience,
                    },
                  }).unwrap();
                  toast.success('Skill updated');
                } else if (mode === 'upsert') {
                  await upsertSkill({
                    techId: payload.techId,
                    updates: {
                      proficiency: payload.proficiency,
                      yearsExperience: payload.yearsExperience,
                    },
                  }).unwrap();
                  toast.success('Skill updated');
                } else {
                  await createSkill({
                    techId: payload.techId,
                    proficiency: payload.proficiency,
                    yearsExperience: payload.yearsExperience,
                  }).unwrap();
                  toast.success('Skill created');
                }
                closeModal();
              } catch (err) {
                toast.error(getSkillErrorMessage(err as any) || 'Could not save');
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

/* ---------- Empty state ---------- */
function EmptyState({
  activeFilterCount, onReset, onCreate, theme,
}: {
  activeFilterCount: number;
  onReset: () => void;
  onCreate: () => void;
  theme: any;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center"
      style={{ borderColor: `${theme.primary}33` }}
    >
      <div className="grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: `${theme.primary}1f` }}>
        <Zap size={28} style={{ color: theme.primary }} />
      </div>
      {activeFilterCount > 0 ? (
        <>
          <h3 className="text-lg font-bold">Nothing matches</h3>
          <p className="max-w-sm text-sm opacity-60">Try adjusting your filters or search.</p>
          <button
            onClick={onReset}
            className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
          >
            <RotateCcw size={15} /> Clear filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-bold">No skills yet</h3>
          <p className="max-w-sm text-sm opacity-60">Add your first skill to get started.</p>
          <button
            onClick={onCreate}
            className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
            style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
          >
            <Plus size={16} /> New skill
          </button>
        </>
      )}
    </div>
  );
}

/* ============================================================
   SKILL EDITOR — unchanged
   ============================================================ */
function SkillEditor({
  theme, initial, technologies, existingSkills, isSaving, onClose, onSave,
}: {
  theme: any;
  initial: TSkill | null;
  technologies: TTechnology[];
  existingSkills: TSkill[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (
    payload: { techId: string; proficiency: number; yearsExperience: number },
    mode: 'create' | 'upsert'
  ) => void | Promise<void>;
}) {
  const [techId, setTechId] = useState(initial?.techId ?? '');
  const [proficiency, setProficiency] = useState<number>(initial?.proficiency ?? 75);
  const [years, setYears] = useState<string>(
    initial?.yearsExperience != null ? String(initial.yearsExperience) : '0'
  );

  const existingForTech = useMemo(
    () => existingSkills.find((s) => s.techId === techId && s.id !== initial?.id) ?? null,
    [existingSkills, techId, initial]
  );

  const mode: 'create' | 'upsert' =
    existingForTech && !initial ? 'upsert' : 'create';

  const selectedTech = technologies.find((t) => t.id === techId);
  const selectedMeta = categoryMeta(selectedTech?.category);
  const tier = proficiencyTier(proficiency);

  const inputStyle: React.CSSProperties = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedYears = Math.max(0, parseInt(years, 10) || 0);
    onSave(
      {
        techId,
        proficiency: Math.max(0, Math.min(100, proficiency)),
        yearsExperience: parsedYears,
      },
      mode
    );
  };

  const canSave = (initial ? true : !!techId) && !isSaving;

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
        className="relative w-full sm:max-w-md max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
      >
        <div
          className="shrink-0 px-5 pt-5 pb-4 border-b relative overflow-hidden"
          style={{
            borderColor: `${theme['base-content']}10`,
            background: selectedMeta
              ? `linear-gradient(135deg, ${selectedMeta.color}18, transparent 65%)`
              : `linear-gradient(135deg, ${theme.primary}14, transparent 65%)`,
          }}
        >
          <div
            aria-hidden
            className="absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: selectedMeta ? `${selectedMeta.color}33` : `${theme.primary}33` }}
          />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="grid place-items-center h-8 w-8 rounded-lg shrink-0"
                  style={{
                    backgroundColor: selectedMeta ? `${selectedMeta.color}1f` : `${theme.primary}1f`,
                    color: selectedMeta ? selectedMeta.color : theme.primary,
                  }}
                >
                  {initial ? <Edit3 size={16} /> : <Sparkles size={16} />}
                </span>
                <h2 className="text-base font-bold">
                  {initial ? 'Edit skill' : 'New skill'}
                </h2>
              </div>
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

        <form
          id="skill-form"
          onSubmit={submit}
          className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5"
        >
          {selectedTech && (
            <div
              className="rounded-xl p-3 flex items-center gap-3 border animate-in fade-in duration-200"
              style={{
                borderColor: `${selectedMeta.color}33`,
                backgroundColor: `${selectedMeta.color}0a`,
              }}
            >
              <ProficiencyRing value={proficiency} color={tier.color} size={48} stroke={5} theme={theme} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate">{selectedTech.name}</p>
                <p className="text-[11px] opacity-60">
                  {tier.label} · {years || 0} yr{parseInt(years, 10) === 1 ? '' : 's'}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
              Technology <span style={{ color: theme.primary }}>*</span>
            </label>
            <div className="relative">
              <select
                required
                disabled={!!initial}
                value={techId}
                onChange={(e) => setTechId(e.target.value)}
                className="w-full appearance-none rounded-xl py-3 pl-4 pr-10 text-sm font-semibold outline-none cursor-pointer focus:ring-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
                style={inputStyle}
              >
                <option value="">Select a technology…</option>
                {technologies.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.category}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50" />
            </div>

            {existingForTech && !initial && (
              <div
                className="mt-2 rounded-xl px-3 py-2 text-[11px] inline-flex items-start gap-2"
                style={{
                  backgroundColor: '#f59e0b12',
                  border: '1px solid #f59e0b33',
                  color: '#f59e0b',
                }}
              >
                <Repeat size={12} className="mt-0.5 shrink-0" />
                <span>
                  Skill exists for <strong>{existingForTech.technology?.name}</strong>. Saving will update it.
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 inline-flex items-center gap-1.5">
                <Gauge size={11} /> Proficiency
              </label>
              <span className="text-sm font-bold" style={{ color: tier.color }}>
                {proficiency}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={proficiency}
              onChange={(e) => setProficiency(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: tier.color }}
            />
            <div className="flex justify-between text-[10px] opacity-40 mt-1 font-mono">
              <span>0</span><span>50</span><span>100</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5 inline-flex items-center gap-1.5">
              <Clock size={11} /> Years of experience
            </label>
            <input
              type="number"
              min={0}
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="e.g. 3"
              className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
              style={inputStyle}
            />
          </div>
        </form>

        <div
          className="shrink-0 flex flex-col-reverse sm:flex-row gap-2 justify-end px-5 py-4 border-t"
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
            form="skill-form"
            type="submit"
            disabled={!canSave}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {initial ? 'Save changes' : mode === 'upsert' ? 'Update skill' : 'Create skill'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SkillsManager;