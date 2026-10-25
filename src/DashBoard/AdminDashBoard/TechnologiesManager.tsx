import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  useGetTechnologiesQuery,
  useCreateTechnologyMutation,
  useUpdateTechnologyMutation,
  useDeleteTechnologyMutation,
  getTechnologyErrorMessage,
  type TTechnology,
  type TTechnologyCategory,
} from '../../Features/Apis/Technologies.Api';
import {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  getProjectErrorMessage,
} from '../../Features/Apis/Projects.Api';
import { useTheme } from '../../ThemeContext';
import {
  Plus, Trash2, Edit3, Search, RefreshCw, X,
  Cpu, CheckCircle2, Loader2, AlertCircle, FolderOpen,
  ChevronRight, List, LayoutGrid, Layout, Settings, Database,
  Infinity as ToolsIcon, Smartphone, Brain, Layers, ChevronDown,
  AlertTriangle, HelpCircle,
} from 'lucide-react';
import { DynamicIcon, iconNames } from 'lucide-react/dynamic';
import * as SiIcons from 'react-icons/si';
import * as DiIcons from 'react-icons/di';
import { toast } from 'react-hot-toast';

/* ---------- Categories ---------- */
const CATEGORIES: { value: TTechnologyCategory; label: string; color: string; icon: React.ReactNode }[] = [
  { value: 'frontend', label: 'Frontend', color: '#3b82f6', icon: <Layout size={12} /> },
  { value: 'backend',  label: 'Backend',  color: '#10b981', icon: <Settings size={12} /> },
  { value: 'database', label: 'Database', color: '#f59e0b', icon: <Database size={12} /> },
  { value: 'devops',   label: 'DevOps',   color: '#ec4899', icon: <ToolsIcon size={12} /> },
  { value: 'mobile',   label: 'Mobile',   color: '#8b5cf6', icon: <Smartphone size={12} /> },
  { value: 'ai',       label: 'AI',       color: '#06b6d4', icon: <Brain size={12} /> },
];

type CategoryFilter = 'all' | TTechnologyCategory;
type ViewMode = 'list' | 'grid';

const categoryMeta = (cat: TTechnologyCategory) =>
  CATEGORIES.find((c) => c.value === cat) ?? { color: '#94a3b8', label: cat, icon: null };

/* ✅ Cast Lucide icon names once */
const LUCIDE_ICON_NAMES = iconNames as readonly string[];
const LUCIDE_ICON_SET = new Set(LUCIDE_ICON_NAMES);

/* ✅ Normalize: "Camera", "camera", "CameraIcon" → "camera" */
const normalizeIconName = (raw: string): string => {
  let name = raw.trim();
  if (!name) return '';
  name = name.replace(/Icon$/i, '').replace(/Lucide/i, '');
  name = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
  name = name.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return name;
};

/* ✅ PascalCase converter for react-icons lookup */
const toPascalCase = (kebab: string): string =>
  kebab
    .split('-')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

/* ✅ Resolve which library provides the icon */
type IconResolution =
  | { kind: 'lucide'; name: string }
  | { kind: 'si'; name: string }
  | { kind: 'di'; name: string }
  | { kind: 'none' };

const resolveIcon = (raw: string): IconResolution => {
  const normalized = normalizeIconName(raw);
  if (!normalized) return { kind: 'none' };

  if (LUCIDE_ICON_SET.has(normalized)) return { kind: 'lucide', name: normalized };

  const pascal = toPascalCase(normalized);
  if ((SiIcons as Record<string, unknown>)[`Si${pascal}`]) return { kind: 'si', name: pascal };
  if ((DiIcons as Record<string, unknown>)[`Di${pascal}`]) return { kind: 'di', name: pascal };

  return { kind: 'none' };
};

/* ✅ Unified icon renderer (Lucide → Si → Di → fallback) */
const TechIcon = ({
  name,
  size = 22,
  color,
}: {
  name?: string | null;
  size?: number;
  color?: string;
}) => {
  if (!name) return <Cpu size={size} color={color} />;

  const resolved = resolveIcon(name);

  if (resolved.kind === 'lucide') {
    return <DynamicIcon name={resolved.name as any} size={size} color={color} />;
  }
  if (resolved.kind === 'si') {
    const Icon = (SiIcons as any)[`Si${resolved.name}`];
    return <Icon size={size} color={color} />;
  }
  if (resolved.kind === 'di') {
    const Icon = (DiIcons as any)[`Di${resolved.name}`];
    return <Icon size={size} color={color} />;
  }
  return <HelpCircle size={size} color={color} />;
};

/* ✅ Suggestions (Lucide fuzzy + popular react-icons fallback) */
const getIconSuggestions = (input: string, limit = 6): string[] => {
  const normalized = normalizeIconName(input);
  if (!normalized) return [];

  const matches: string[] = [];

  for (const name of LUCIDE_ICON_NAMES) {
    if (name === normalized) return [name];
    if (name.startsWith(normalized)) matches.push(name);
    if (matches.length >= limit) break;
  }

  if (matches.length < limit) {
    for (const name of LUCIDE_ICON_NAMES) {
      if (matches.includes(name)) continue;
      if (name.includes(normalized)) {
        matches.push(name);
        if (matches.length >= limit) break;
      }
    }
  }

  if (matches.length === 0) {
    const parts = normalized.split('-').filter(Boolean);
    for (const name of LUCIDE_ICON_NAMES) {
      if (parts.some((p) => name.includes(p))) {
        matches.push(name);
        if (matches.length >= limit) break;
      }
    }
  }

  /* ✅ Fallback: still nothing → suggest popular icons */
  if (matches.length === 0) {
    const fallbacks = [
      'atom', 'cpu', 'code', 'terminal', 'boxes', 'component',
      'layers', 'zap', 'flame', 'brain', 'database', 'server',
      'cloud', 'smartphone', 'monitor', 'git-branch',
    ];
    for (const name of fallbacks) {
      if (LUCIDE_ICON_SET.has(name)) {
        matches.push(name);
        if (matches.length >= limit) break;
      }
    }
  }

  return matches.slice(0, limit);
};

const TechnologiesManager = () => {
  const { theme } = useTheme();

  /* ---------- API ---------- */
  const {
    data: techResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetTechnologiesQuery();

  const { data: projectsResponse } = useGetProjectsQuery();

  const [createTech, { isLoading: isCreating }] = useCreateTechnologyMutation();
  const [updateTech, { isLoading: isUpdating }] = useUpdateTechnologyMutation();
  const [deleteTech] = useDeleteTechnologyMutation();

  const [updateProject, { isLoading: isLinking }] = useUpdateProjectMutation();

  const technologies: TTechnology[] = techResponse?.data ?? [];
  const projects = projectsResponse?.data ?? [];

  /* ---------- UI STATE ---------- */
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkProjectId, setLinkProjectId] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);
  const linkModalRef = useRef<HTMLDivElement>(null);

  /* ---------- FORM ---------- */
  const [formData, setFormData] = useState<{
    name: string;
    category: TTechnologyCategory;
    iconName: string;
  }>({
    name: '',
    category: 'frontend',
    iconName: '',
  });

  /* ✅ Icon validation state (Lucide + Si + Di) */
  const [iconSuggestions, setIconSuggestions] = useState<string[]>([]);
  const [showIconSuggestions, setShowIconSuggestions] = useState(false);
  const [iconValidation, setIconValidation] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    const raw = formData.iconName.trim();
    if (!raw) {
      setIconValidation('idle');
      setIconSuggestions([]);
      return;
    }

    const resolved = resolveIcon(raw);

    if (resolved.kind !== 'none') {
      setIconValidation('valid');
      setIconSuggestions([]);
    } else {
      setIconValidation('invalid');
      setIconSuggestions(getIconSuggestions(raw));
    }
  }, [formData.iconName]);

  /* ---------- Derived ---------- */
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return technologies.filter((t) => {
      const matchesSearch = !term || t.name.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [technologies, searchTerm, categoryFilter]);

  const counts = useMemo(() => {
    const base = { total: technologies.length };
    CATEGORIES.forEach((c) => {
      // @ts-ignore
      base[c.value] = technologies.filter((t) => t.category === c.value).length;
    });
    return base as { total: number } & Record<TTechnologyCategory, number>;
  }, [technologies]);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === linkProjectId) ?? null,
    [projects, linkProjectId]
  );

  const selectedTechIds: string[] = useMemo(
    () => selectedProject?.techs?.map((t) => t.technologyId) ?? [],
    [selectedProject]
  );

  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => setPendingDelete(null), 4000);
    return () => clearTimeout(id);
  }, [pendingDelete]);

  const anyModalOpen = isModalOpen || isLinkModalOpen;
  useEffect(() => {
    if (!anyModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isLinkModalOpen) {
        setIsLinkModalOpen(false);
      } else {
        closeModal();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyModalOpen, isLinkModalOpen]);

  /* ---------- Handlers ---------- */
  const openModal = (tech?: TTechnology) => {
    if (tech) {
      setEditingId(tech.id);
      setFormData({
        name: tech.name,
        category: tech.category,
        iconName: tech.iconName ?? '',
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', category: 'frontend', iconName: '' });
    }
    setIconValidation('idle');
    setIconSuggestions([]);
    setShowIconSuggestions(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setShowIconSuggestions(false);
  };

  const openLinkModal = () => {
    setLinkProjectId(projects[0]?.id ?? '');
    setIsLinkModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      iconName: formData.iconName.trim() || null,
    };

    const promise = editingId
      ? updateTech({ id: editingId, updates: payload }).unwrap()
      : createTech(payload).unwrap();

    toast.promise(promise, {
      loading: editingId ? 'Saving…' : 'Creating…',
      success: editingId ? 'Technology updated' : 'Technology created',
      error: (err) => getTechnologyErrorMessage(err as any) || 'Something went wrong',
    });

    try {
      await promise;
      closeModal();
    } catch {
      /* toast already showed it */
    }
  };

  const doDelete = async (id: string) => {
    try {
      await deleteTech(id).unwrap();
      toast.success('Technology deleted');
    } catch (err) {
      toast.error(getTechnologyErrorMessage(err as any) || 'Could not delete');
    }
  };

  const copyName = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast.success('Name copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  const toggleTechOnProject = async (techId: string) => {
    if (!selectedProject) return;
    const hasTech = selectedTechIds.includes(techId);
    const nextIds = hasTech
      ? selectedTechIds.filter((id) => id !== techId)
      : [...selectedTechIds, techId];

    try {
      await updateProject({
        id: selectedProject.id,
        updates: { techIds: nextIds },
      }).unwrap();
      toast.success(hasTech ? 'Removed from project' : 'Added to project');
    } catch (err) {
      toast.error(getProjectErrorMessage(err as any) || 'Could not update project');
    }
  };

  /* ---------- Loading skeleton ---------- */
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-8" style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 space-y-3">
            <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}10` }} />
            <div className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}08` }} />
            <div className="h-3 w-96 max-w-full rounded animate-pulse" style={{ backgroundColor: `${theme['base-content']}06` }} />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border p-4 animate-pulse"
                style={{
                  borderColor: `${theme['base-content']}10`,
                  backgroundColor: `${theme['base-content']}03`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: `${theme['base-content']}08` }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded" style={{ backgroundColor: `${theme['base-content']}08` }} />
                  <div className="h-2 w-1/4 rounded" style={{ backgroundColor: `${theme['base-content']}06` }} />
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
        <h2 className="text-lg font-bold">Could not load technologies</h2>
        <p className="max-w-md text-sm opacity-60">
          {getTechnologyErrorMessage(error) || 'Please try again.'}
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

  const inputStyle = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  } as React.CSSProperties;

  const filterTabs: { key: CategoryFilter; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All', count: counts.total, color: theme.primary },
    ...CATEGORIES.map((c) => ({
      key: c.value,
      label: c.label,
      count: counts[c.value] ?? 0,
      color: c.color,
    })),
  ];

  const techsByCategory: Record<TTechnologyCategory, TTechnology[]> = CATEGORIES.reduce(
    (acc, c) => {
      acc[c.value] = technologies.filter((t) => t.category === c.value);
      return acc;
    },
    {} as Record<TTechnologyCategory, TTechnology[]>
  );

  /* ---------- Row renderer ---------- */
  const renderTech = (tech: TTechnology) => {
    const meta = categoryMeta(tech.category);
    const isGrid = viewMode === 'grid';

    return (
      <div
        key={tech.id}
        className={`group relative flex ${
          isGrid ? 'flex-col gap-3 p-4' : 'items-center gap-4 p-4'
        } rounded-2xl border transition-all hover:shadow-md`}
        style={{
          borderColor: `${theme['base-content']}10`,
          backgroundColor: `${theme['base-content']}03`,
        }}
      >
        <div
          className={`${isGrid ? 'w-full h-20' : 'w-14 h-14'} rounded-xl flex items-center justify-center shrink-0`}
          style={{
            backgroundColor: `${meta.color}1f`,
            border: `1px solid ${meta.color}33`,
            color: meta.color,
          }}
        >
          <TechIcon name={tech.iconName} size={isGrid ? 32 : 22} color={meta.color} />
        </div>

        <div className={`${isGrid ? 'w-full min-w-0' : 'min-w-0 flex-1'}`}>
          <p className="text-sm font-bold truncate">{tech.name}</p>
          <p className="text-xs opacity-55 mt-0.5 inline-flex items-center gap-1.5">
            {meta.icon}
            {meta.label}
          </p>
        </div>

        <div className={`flex gap-2 shrink-0 ${isGrid ? 'w-full' : ''}`}>
          <button
            onClick={() => copyName(tech.name)}
            aria-label="Copy name"
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
              isGrid ? '' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ backgroundColor: `${theme['base-content']}06`, color: theme['base-content'] }}
          >
            Copy
          </button>
          <button
            onClick={() => openModal(tech)}
            aria-label="Edit"
            className="p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: `${theme['base-content']}06`, color: theme['base-content'] }}
          >
            <Edit3 size={16} />
          </button>

          {pendingDelete === tech.id ? (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  doDelete(tech.id);
                  setPendingDelete(null);
                }}
                className="rounded-xl px-3 py-2 text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all"
              >
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
              onClick={() => setPendingDelete(tech.id)}
              aria-label="Delete"
              className="p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 lg:p-8" style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}>
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
            <Link to="/admin-dashboard" className="hover:opacity-100 transition-opacity">Admin</Link>
            <ChevronRight size={11} className="opacity-50" />
            <span style={{ color: theme.primary }}>Technologies</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Technologies</h1>
              <p className="text-sm opacity-60 max-w-xl">
                The tools, frameworks and languages you use. Add a technology once
                and reuse it in projects, services and skills.
              </p>

              <div className="flex flex-wrap gap-2 pt-3">
                {filterTabs.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setCategoryFilter(f.key)}
                    aria-pressed={categoryFilter === f.key}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: categoryFilter === f.key ? f.color : `${theme['base-content']}15`,
                      color: categoryFilter === f.key ? f.color : theme['base-content'],
                      backgroundColor: categoryFilter === f.key ? `${f.color}14` : 'transparent',
                    }}
                  >
                    {f.label} <span className="opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={openLinkModal}
                disabled={projects.length === 0}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                style={{
                  backgroundColor: `${theme.primary}14`,
                  color: theme.primary,
                  border: `1px solid ${theme.primary}44`,
                }}
              >
                <Layers size={16} /> Link techs to a project
              </button>
              <button
                onClick={() => openModal()}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
                style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
              >
                <Plus size={18} /> New technology
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH + VIEW TOGGLE */}
        <div className="flex items-center gap-2 max-w-2xl mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name…"
              className="w-full rounded-xl py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 transition"
              style={inputStyle}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full transition-transform hover:rotate-90"
                style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex gap-1">
            {(['list', 'grid'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                aria-pressed={viewMode === m}
                aria-label={`${m} view`}
                className="p-2.5 rounded-xl border transition-all"
                style={{
                  borderColor: viewMode === m ? theme.primary : `${theme['base-content']}15`,
                  color: viewMode === m ? theme.primary : theme['base-content'],
                  backgroundColor: viewMode === m ? `${theme.primary}10` : 'transparent',
                }}
              >
                {m === 'list' ? <List size={16} /> : <LayoutGrid size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* LIST / GRID */}
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center"
            style={{ borderColor: `${theme.primary}33` }}
          >
            <div className="grid h-16 w-16 place-items-center rounded-full" style={{ backgroundColor: `${theme.primary}1f` }}>
              <FolderOpen size={28} style={{ color: theme.primary }} />
            </div>

            {searchTerm || categoryFilter !== 'all' ? (
              <>
                <h3 className="text-lg font-bold">Nothing matches</h3>
                <p className="max-w-sm text-sm opacity-60">
                  {searchTerm ? `No results for "${searchTerm}".` : 'No technologies in this category.'}
                </p>
                <button
                  onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
                  className="mt-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">No technologies yet</h3>
                <p className="max-w-sm text-sm opacity-60">Click "New technology" to add your first one.</p>
                <button
                  onClick={() => openModal()}
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  <Plus size={16} /> New technology
                </button>
              </>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">{filtered.map(renderTech)}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(renderTech)}
          </div>
        )}
      </div>

      {/* ============ CREATE / EDIT MODAL ============ */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            style={{ zIndex: 9999, isolation: 'isolate' }}
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? 'Edit technology' : 'New technology'}
          >
            <div
              className="absolute inset-0 animate-in fade-in duration-200"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              onClick={closeModal}
            />

            <div
              ref={modalRef}
              className="relative w-full max-w-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
              style={{
                backgroundColor: theme['base-100'],
                color: theme['base-content'],
                maxHeight: '92vh',
                height: 'auto',
              }}
            >
              <div
                className="shrink-0 px-6 sm:px-8 pt-6 pb-5 border-b relative overflow-hidden"
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

                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
                      <Link to="/admin-dashboard" onClick={closeModal} className="hover:opacity-100 transition-opacity">
                        Admin
                      </Link>
                      <ChevronRight size={11} className="opacity-50" />
                      <span className="opacity-80">Technologies</span>
                      <ChevronRight size={11} className="opacity-50" />
                      <span style={{ color: theme.primary }}>{editingId ? 'Edit' : 'New'}</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <span
                        className="hidden sm:grid shrink-0 place-items-center h-11 w-11 rounded-xl"
                        style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
                      >
                        {editingId ? <Edit3 size={20} /> : <Plus size={20} />}
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold truncate">
                          {editingId ? 'Edit technology' : 'New technology'}
                        </h2>
                        <p className="text-xs sm:text-sm opacity-55 mt-1">
                          {editingId
                            ? 'Update the name, category or icon.'
                            : 'Fill in the details to add a new technology.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    aria-label="Close"
                    className="shrink-0 p-2.5 rounded-xl transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:rotate-90"
                    style={{ backgroundColor: `${theme['base-content']}06`, color: theme['base-content'] }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <form
                id="tech-form"
                onSubmit={handleSubmit}
                className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-7 space-y-6"
              >
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                    Name <span style={{ color: theme.primary }}>*</span>
                  </label>
                  <input
                    required
                    autoFocus
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. React, PostgreSQL, Svelte"
                    className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                    Category <span style={{ color: theme.primary }}>*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as TTechnologyCategory })}
                    className="w-full rounded-xl py-3 px-4 text-sm outline-none cursor-pointer focus:ring-2 transition"
                    style={inputStyle}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* ✅ Icon name with Lucide + react-icons validation */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                    Icon name (optional)
                  </label>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        value={formData.iconName}
                        onChange={(e) => {
                          setFormData({ ...formData, iconName: e.target.value });
                          setShowIconSuggestions(true);
                        }}
                        onFocus={() => setShowIconSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => setShowIconSuggestions(false), 200);
                        }}
                        placeholder="e.g. react, docker, atom, flame"
                        className="w-full rounded-xl py-3 px-4 pr-10 text-sm font-mono outline-none focus:ring-2 transition"
                        style={{
                          ...inputStyle,
                          borderColor:
                            iconValidation === 'invalid'
                              ? '#f43f5e'
                              : iconValidation === 'valid'
                              ? '#10b981'
                              : undefined,
                          borderWidth: iconValidation !== 'idle' ? '1px' : undefined,
                        }}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {iconValidation === 'valid' && (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        )}
                        {iconValidation === 'invalid' && (
                          <AlertTriangle size={16} className="text-rose-500" />
                        )}
                      </span>

                      {showIconSuggestions && iconSuggestions.length > 0 && (
                        <div
                          className="absolute z-10 left-0 right-0 mt-1 rounded-xl border shadow-lg overflow-hidden"
                          style={{
                            backgroundColor: theme['base-100'],
                            borderColor: `${theme['base-content']}15`,
                          }}
                        >
                          <div
                            className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider opacity-50 border-b"
                            style={{ borderColor: `${theme['base-content']}10` }}
                          >
                            Did you mean?
                          </div>
                          {iconSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setFormData({ ...formData, iconName: suggestion });
                                setShowIconSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm font-mono hover:opacity-80 transition-opacity"
                              style={{ color: theme['base-content'] }}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ✅ Live preview */}
                    <div
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border"
                      style={{
                        backgroundColor: `${theme.primary}0d`,
                        borderColor: `${theme['base-content']}15`,
                        color: theme.primary,
                      }}
                      title="Icon preview"
                    >
                      <TechIcon name={formData.iconName} size={22} color={theme.primary} />
                    </div>
                  </div>

                  <p className="text-[11px] mt-1.5">
                    {iconValidation === 'invalid' ? (
                      <span className="inline-flex items-center gap-1 text-rose-500 flex-wrap">
                        <AlertTriangle size={11} />
                        Icon not found in Lucide or react-icons.
                        {iconSuggestions.length > 0 ? ' Try a suggestion above or ' : ' '}
                        <a
                          href="https://lucide.dev/icons"
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                          style={{ color: theme.primary }}
                        >
                          browse icons
                        </a>
                      </span>
                    ) : iconValidation === 'valid' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 size={11} />
                        Valid icon (Lucide / Simple Icons / Devicons)
                      </span>
                    ) : (
                      <span className="opacity-40">
                        Searches Lucide, Simple Icons and Devicons. Try{' '}
                        <a
                          href="https://lucide.dev/icons"
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                          style={{ color: theme.primary }}
                        >
                          lucide.dev/icons
                        </a>{' '}
                        or{' '}
                        <a
                          href="https://simpleicons.org"
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                          style={{ color: theme.primary }}
                        >
                          simpleicons.org
                        </a>
                      </span>
                    )}
                  </p>
                </div>
              </form>

              <div
                className="shrink-0 flex flex-col-reverse sm:flex-row gap-2 justify-end px-6 sm:px-8 py-4 border-t"
                style={{
                  borderColor: `${theme['base-content']}10`,
                  backgroundColor: `${theme['base-content']}02`,
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: `${theme['base-content']}20`, color: theme['base-content'] }}
                >
                  Cancel
                </button>
                <button
                  form="tech-form"
                  type="submit"
                  disabled={isCreating || isUpdating || iconValidation === 'invalid'}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                  title={iconValidation === 'invalid' ? 'Fix the icon name or clear it before saving' : undefined}
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {editingId ? 'Save changes' : 'Create technology'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ============ LINK TECHS TO A PROJECT MODAL ============ */}
      {isLinkModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            style={{ zIndex: 9999, isolation: 'isolate' }}
            role="dialog"
            aria-modal="true"
            aria-label="Link technologies to a project"
          >
            <div
              className="absolute inset-0 animate-in fade-in duration-200"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              onClick={() => setIsLinkModalOpen(false)}
            />

            <div
              ref={linkModalRef}
              className="relative w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
              style={{
                backgroundColor: theme['base-100'],
                color: theme['base-content'],
                maxHeight: '92vh',
                height: 'auto',
              }}
            >
              <div
                className="shrink-0 px-6 sm:px-8 pt-6 pb-5 border-b relative overflow-hidden"
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

                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
                      <Link to="/admin-dashboard" onClick={() => setIsLinkModalOpen(false)} className="hover:opacity-100 transition-opacity">
                        Admin
                      </Link>
                      <ChevronRight size={11} className="opacity-50" />
                      <span className="opacity-80">Technologies</span>
                      <ChevronRight size={11} className="opacity-50" />
                      <span style={{ color: theme.primary }}>Link projects</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <span
                        className="hidden sm:grid shrink-0 place-items-center h-11 w-11 rounded-xl"
                        style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
                      >
                        <Layers size={20} />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold truncate">
                          Link techs to a project
                        </h2>
                        <p className="text-xs sm:text-sm opacity-55 mt-1">
                          Pick a project, then tick the technologies it uses.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLinkModalOpen(false)}
                    aria-label="Close"
                    className="shrink-0 p-2.5 rounded-xl transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:rotate-90"
                    style={{ backgroundColor: `${theme['base-content']}06`, color: theme['base-content'] }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                    Project
                  </label>
                  <div className="relative">
                    <select
                      value={linkProjectId}
                      onChange={(e) => setLinkProjectId(e.target.value)}
                      className="w-full appearance-none rounded-xl py-3 pl-4 pr-10 text-sm font-semibold outline-none cursor-pointer focus:ring-2 transition"
                      style={inputStyle}
                    >
                      {projects.length === 0 && <option value="">No projects yet</option>}
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title} — {p.slug}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
                    />
                  </div>
                </div>

                {!selectedProject ? (
                  <div
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center"
                    style={{ borderColor: `${theme['base-content']}15` }}
                  >
                    <FolderOpen size={28} style={{ color: theme.primary }} className="opacity-40" />
                    <p className="text-sm opacity-60">Pick a project to see the tech picker.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="opacity-60">
                        {selectedTechIds.length} selected for {selectedProject.title}
                      </span>
                      {isLinking && (
                        <span className="inline-flex items-center gap-1" style={{ color: theme.primary }}>
                          <Loader2 size={12} className="animate-spin" /> Saving…
                        </span>
                      )}
                    </div>

                    {CATEGORIES.map((cat) => {
                      const list = techsByCategory[cat.value] ?? [];
                      if (list.length === 0) return null;
                      return (
                        <div key={cat.value}>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1.5"
                            style={{ color: cat.color }}
                          >
                            {cat.icon} {cat.label}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {list.map((tech) => {
                              const active = selectedTechIds.includes(tech.id);
                              return (
                                <button
                                  key={tech.id}
                                  type="button"
                                  onClick={() => toggleTechOnProject(tech.id)}
                                  disabled={isLinking}
                                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                                  style={{
                                    borderColor: active ? cat.color : `${theme['base-content']}20`,
                                    color: active ? cat.color : theme['base-content'],
                                    backgroundColor: active ? `${cat.color}1a` : 'transparent',
                                  }}
                                >
                                  {active && <CheckCircle2 size={12} />}
                                  {tech.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className="shrink-0 flex justify-end px-6 sm:px-8 py-4 border-t"
                style={{
                  borderColor: `${theme['base-content']}10`,
                  backgroundColor: `${theme['base-content']}02`,
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  Done
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TechnologiesManager;