import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
  useCreateProjectMutation,
  getProjectErrorMessage,
  type TProject as Project,
  type TProjectLinkInput,
  type TProjectSectionInput,
  type TProjectTimelineInput,
  type TLinkType,
} from "../../Features/Apis/Projects.Api";
import { useGetMediaAssetsQuery } from "../../Features/Apis/Media.Api";
import { useTheme } from '../../ThemeContext';
import {
  Plus, Trash2, Edit3, Search, RefreshCw,
  X, Layers, ExternalLink,
  CheckCircle2, Loader2,
  AlertCircle, ImageIcon, Star, FolderOpen,
  Link as LinkIcon, FileText, Clock,
  ChevronRight, Copy, List, LayoutGrid,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ---------- Link type options ---------- */
const LINK_TYPES: { value: TLinkType; label: string }[] = [
  { value: 'github_frontend', label: 'GitHub – Frontend' },
  { value: 'github_backend', label: 'GitHub – Backend' },
  { value: 'github_fullstack', label: 'GitHub – Full stack' },
  { value: 'live_demo', label: 'Live demo' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'design', label: 'Design' },
];

/* ---------- Slug generator ---------- */
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

type StatusFilter = 'all' | 'published' | 'draft' | 'archived';
type ViewMode = 'list' | 'grid';

const ProjectManager = () => {
  const { theme } = useTheme();

  /* ---------- API ---------- */
  const {
    data: projectsResponse,
    isLoading: projectsLoading,
    isError,
    error,
    refetch,
  } = useGetProjectsQuery();

  /* ✅ FIX: unwrap the array from the paginated media envelope */
  const { data: mediaAssetsResponse } = useGetMediaAssetsQuery();
  const mediaAssets = mediaAssetsResponse?.data ?? [];

  const [deleteProject] = useDeleteProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();

  const projects: Project[] = projectsResponse?.data ?? [];

  /* ---------- UI STATE ---------- */
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') ?? '');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  /* Debounce search into URL */
  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm.trim()) params.set('q', searchTerm.trim());
      else params.delete('q');
      setSearchParams(params, { replace: true });
    }, 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  /* Auto-cancel pending delete */
  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => setPendingDelete(null), 4000);
    return () => clearTimeout(id);
  }, [pendingDelete]);

  /* Esc closes modal + body scroll lock */
  const modalRef = useRef<HTMLDivElement>(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  /* ---------- FORM ---------- */
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    mainDescription: "",
    status: "published" as 'published' | 'draft' | 'archived',
    isFeatured: false,
    mainThumbnailId: "",
    links: [] as TProjectLinkInput[],
    sections: [] as TProjectSectionInput[],
    timeline: [] as TProjectTimelineInput[],
  });

  /* ---------- FILTERED + COUNTS ---------- */
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesSearch = !term || p.title.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const counts = useMemo(
    () => ({
      total: projects.length,
      published: projects.filter((p) => p.status === "published").length,
      drafts: projects.filter((p) => p.status === "draft").length,
      archived: projects.filter((p) => p.status === "archived").length,
      featured: projects.filter((p) => p.isFeatured).length,
    }),
    [projects]
  );

  /* ---------- HANDLERS ---------- */
  const openModal = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setSlugManuallyEdited(true);
      setFormData({
        title: project.title,
        slug: project.slug,
        mainDescription: project.mainDescription,
        status: project.status,
        isFeatured: project.isFeatured,
        mainThumbnailId: project.mainThumbnailId || "",
        links:
          project.links?.map((l) => ({ label: l.label, url: l.url, type: l.type })) ?? [],
        sections:
          project.sections?.map((s) => ({
            sectionTitle: s.sectionTitle,
            explanation: s.explanation,
            mediaId: s.mediaId,
            order: s.order,
          })) ?? [],
        timeline:
          project.timeline?.map((t) => ({
            title: t.title,
            description: t.description,
            date: t.date,
          })) ?? [],
      });
    } else {
      setEditingId(null);
      setSlugManuallyEdited(false);
      setFormData({
        title: "",
        slug: "",
        mainDescription: "",
        status: "published",
        isFeatured: false,
        mainThumbnailId: "",
        links: [],
        sections: [],
        timeline: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSlugManuallyEdited(false);
  };

  const handleTitleChange = (title: string) => {
    setFormData((f) => ({
      ...f,
      title,
      slug: slugManuallyEdited ? f.slug : slugify(title),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    setFormData((f) => ({ ...f, slug }));
  };

  const addLink = () =>
    setFormData((f) => ({
      ...f,
      links: [...f.links, { label: "", url: "", type: "live_demo" }],
    }));

  const updateLink = (i: number, patch: Partial<TProjectLinkInput>) =>
    setFormData((f) => ({
      ...f,
      links: f.links.map((l, idx) => (idx === i ? { ...l, ...patch } : l)),
    }));

  const removeLink = (i: number) =>
    setFormData((f) => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));

  const addSection = () =>
    setFormData((f) => ({
      ...f,
      sections: [
        ...f.sections,
        { sectionTitle: "", explanation: "", order: f.sections.length, mediaId: null },
      ],
    }));

  const updateSection = (i: number, patch: Partial<TProjectSectionInput>) =>
    setFormData((f) => ({
      ...f,
      sections: f.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s)),
    }));

  const removeSection = (i: number) =>
    setFormData((f) => ({
      ...f,
      sections: f.sections.filter((_, idx) => idx !== i),
    }));

  const addTimeline = () =>
    setFormData((f) => ({
      ...f,
      timeline: [...f.timeline, { title: "", description: "", date: "" }],
    }));

  const updateTimeline = (i: number, patch: Partial<TProjectTimelineInput>) =>
    setFormData((f) => ({
      ...f,
      timeline: f.timeline.map((t, idx) => (idx === i ? { ...t, ...patch } : t)),
    }));

  const removeTimeline = (i: number) =>
    setFormData((f) => ({
      ...f,
      timeline: f.timeline.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      slug: formData.slug || undefined,
      mainDescription: formData.mainDescription,
      status: formData.status,
      isFeatured: formData.isFeatured,
      mainThumbnailId: formData.mainThumbnailId || undefined,
      links: formData.links.filter((l) => l.label && l.url),
      sections: formData.sections.filter(
        (s) => (s.sectionTitle ?? '').trim() || (s.explanation ?? '').trim()
      ),
      timeline: formData.timeline.filter((t) => (t.title ?? '').trim()),
    };

    const promise = editingId
      ? updateProject({ id: editingId, updates: payload }).unwrap()
      : createProject(payload).unwrap();

    toast.promise(promise, {
      loading: editingId ? "Saving changes…" : "Creating project…",
      success: editingId ? "Project updated" : "Project created",
      error: (err) => getProjectErrorMessage(err as any) || "Something went wrong",
    });

    try {
      await promise;
      closeModal();
    } catch {
      /* toast already showed the error */
    }
  };

  const doDelete = async (id: string) => {
    try {
      await deleteProject(id).unwrap();
      toast.success("Project deleted");
    } catch (err) {
      toast.error(getProjectErrorMessage(err as any) || "Could not delete project");
    }
  };

  const copySlug = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(slug);
      toast.success("Slug copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  /* ---------- Loading skeleton ---------- */
  if (projectsLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-8" style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 space-y-3">
            <div className="h-3 w-24 rounded animate-pulse" style={{ backgroundColor: `${theme["base-content"]}10` }} />
            <div className="h-8 w-64 rounded animate-pulse" style={{ backgroundColor: `${theme["base-content"]}08` }} />
            <div className="h-3 w-96 max-w-full rounded animate-pulse" style={{ backgroundColor: `${theme["base-content"]}06` }} />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border p-4 animate-pulse"
                style={{
                  borderColor: `${theme["base-content"]}10`,
                  backgroundColor: `${theme["base-content"]}03`,
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div className="w-14 h-14 rounded-xl" style={{ backgroundColor: `${theme["base-content"]}08` }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 rounded" style={{ backgroundColor: `${theme["base-content"]}08` }} />
                  <div className="h-2 w-1/4 rounded" style={{ backgroundColor: `${theme["base-content"]}06` }} />
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
        <h2 className="text-lg font-bold">Could not load projects</h2>
        <p className="max-w-md text-sm opacity-60">
          {getProjectErrorMessage(error) || "Please try again."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
        >
          <RefreshCw size={16} /> Try again
        </button>
      </div>
    );
  }

  const inputStyle = {
    backgroundColor: `${theme["base-content"]}06`,
    color: theme["base-content"],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  } as React.CSSProperties;

  const sectionLabelStyle: React.CSSProperties = { color: theme.primary };

  const filterTabs: { key: StatusFilter; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All', count: counts.total, color: theme.primary },
    { key: 'published', label: 'Published', count: counts.published, color: '#10b981' },
    { key: 'draft', label: 'Drafts', count: counts.drafts, color: '#f59e0b' },
    { key: 'archived', label: 'Archived', count: counts.archived, color: '#94a3b8' },
  ];

  /* ---------- Row renderer ---------- */
  const renderProject = (project: Project) => {
    const thumb = project.thumbnail?.fileUrl ?? null;
    const isGrid = viewMode === 'grid';

    return (
      <div
        key={project.id}
        className={`group relative flex ${
          isGrid ? 'flex-col items-start gap-3 p-4' : 'items-center gap-4 p-4'
        } rounded-2xl border transition-all hover:shadow-md`}
        style={{
          borderColor: `${theme["base-content"]}10`,
          backgroundColor: `${theme["base-content"]}03`,
        }}
      >
        <div
          className={`${isGrid ? 'w-full aspect-[16/9]' : 'w-14 h-14'} rounded-xl overflow-hidden flex items-center justify-center shrink-0`}
          style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}22` }}
        >
          {thumb ? (
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          ) : (
            <Layers size={isGrid ? 32 : 22} style={{ color: theme.primary }} />
          )}
        </div>

        <div className={`${isGrid ? 'w-full' : 'min-w-0 flex-1'}`}>
          <p className="text-sm font-bold truncate">{project.title}</p>
          <p className="text-xs opacity-50 flex items-center gap-1 mt-0.5 truncate">
            <ExternalLink size={10} /> {project.slug}
          </p>
        </div>

        <div className={`${isGrid ? 'flex w-full items-center justify-between' : 'hidden sm:flex flex-col items-end'} gap-1 shrink-0`}>
          <span
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{ backgroundColor: `${theme["base-content"]}08`, color: theme["base-content"] }}
          >
            {project.status}
          </span>
          {project.isFeatured && (
            <span className="text-[10px] font-bold inline-flex items-center gap-1" style={{ color: theme.primary }}>
              <Star size={10} /> Featured
            </span>
          )}
        </div>

        <div className={`flex gap-2 shrink-0 ${isGrid ? 'w-full' : ''}`}>
          <button
            onClick={() => copySlug(project.slug)}
            aria-label="Copy slug"
            className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${isGrid ? '' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ backgroundColor: `${theme["base-content"]}06`, color: theme["base-content"] }}
          >
            <Copy size={16} />
          </button>
          <a
            href={`/project/${project.slug}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Open live page"
            className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${isGrid ? '' : 'opacity-0 group-hover:opacity-100'}`}
            style={{ backgroundColor: `${theme["base-content"]}06`, color: theme["base-content"] }}
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={() => openModal(project)}
            aria-label="Edit"
            className="p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{ backgroundColor: `${theme["base-content"]}06`, color: theme["base-content"] }}
          >
            <Edit3 size={16} />
          </button>

          {pendingDelete === project.id ? (
            <div className="flex gap-1">
              <button
                onClick={() => { doDelete(project.id); setPendingDelete(null); }}
                className="rounded-xl px-3 py-2 text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all"
              >
                Confirm
              </button>
              <button
                onClick={() => setPendingDelete(null)}
                className="rounded-xl px-3 py-2 text-xs font-bold border transition-all"
                style={{ borderColor: `${theme["base-content"]}20` }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setPendingDelete(project.id)}
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
    <div className="min-h-screen p-4 lg:p-8" style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
            <Link to="/admin-dashboard" className="hover:opacity-100 transition-opacity">Admin</Link>
            <ChevronRight size={11} className="opacity-50" />
            <span style={{ color: theme.primary }}>Projects</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Manage your projects</h1>
              <p className="text-sm opacity-60 max-w-xl">
                Add, edit and delete the projects that appear on your public portfolio.
                Everything here updates the live site.
              </p>

              <div className="flex flex-wrap gap-2 pt-3">
                {filterTabs.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    aria-pressed={statusFilter === f.key}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: statusFilter === f.key ? f.color : `${theme["base-content"]}15`,
                      color: statusFilter === f.key ? f.color : theme["base-content"],
                      backgroundColor: statusFilter === f.key ? `${f.color}14` : 'transparent',
                    }}
                  >
                    {f.label} <span className="opacity-60">{f.count}</span>
                  </button>
                ))}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
                  style={{ borderColor: "#f59e0b55", color: "#f59e0b" }}
                >
                  <Star size={12} /> {counts.featured} featured
                </span>
              </div>
            </div>

            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
              style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
            >
              <Plus size={18} /> New project
            </button>
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
              placeholder="Search by project title…"
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
                  borderColor: viewMode === m ? theme.primary : `${theme["base-content"]}15`,
                  color: viewMode === m ? theme.primary : theme["base-content"],
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

            {searchTerm || statusFilter !== 'all' ? (
              <>
                <h3 className="text-lg font-bold">Nothing matches</h3>
                <p className="max-w-sm text-sm opacity-60">
                  {searchTerm ? `No projects found for "${searchTerm}".` : 'No projects match this filter.'}
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1 text-xs">
                  <span className="opacity-50 mr-1">Try:</span>
                  {['portfolio', 'api', 'react', 'fullstack'].map((t) => (
                    <button
                      key={t}
                      onClick={() => { setSearchTerm(t); setStatusFilter('all'); }}
                      className="rounded-full border px-2.5 py-1 transition-all hover:-translate-y-0.5"
                      style={{ borderColor: `${theme["base-content"]}20`, color: theme.primary }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                  className="mt-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">No projects yet</h3>
                <p className="max-w-sm text-sm opacity-60">Click "New project" to add your first one.</p>
                <button
                  onClick={() => openModal()}
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
                >
                  <Plus size={16} /> New project
                </button>
              </>
            )}
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-2">{filtered.map(renderProject)}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(renderProject)}
          </div>
        )}
      </div>

      {/* ================= MODAL (portal to body) ================= */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            style={{ zIndex: 9999, isolation: 'isolate' }}
            role="dialog"
            aria-modal="true"
            aria-label={editingId ? "Edit project" : "New project"}
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
              className="relative w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300"
              style={{
                backgroundColor: theme["base-100"],
                color: theme["base-content"],
                maxHeight: "92vh",
                height: "auto",
              }}
            >
              {/* HEADER */}
              <div
                className="shrink-0 px-6 sm:px-8 pt-6 pb-5 border-b relative overflow-hidden"
                style={{
                  borderColor: `${theme["base-content"]}10`,
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
                      <Link
                        to="/admin-dashboard"
                        onClick={closeModal}
                        className="hover:opacity-100 transition-opacity"
                      >
                        Admin
                      </Link>
                      <ChevronRight size={11} className="opacity-50" />
                      <span className="opacity-80">Projects</span>
                      <ChevronRight size={11} className="opacity-50" />
                      <span style={{ color: theme.primary }}>
                        {editingId ? 'Edit' : 'New'}
                      </span>
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
                          {editingId ? "Edit project" : "New project"}
                        </h2>
                        <p className="text-xs sm:text-sm opacity-55 mt-1">
                          {editingId
                            ? "Update the details and save when ready."
                            : "Fill in the details to publish a new project."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    aria-label="Close"
                    className="shrink-0 p-2.5 rounded-xl transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:rotate-90"
                    style={{ backgroundColor: `${theme["base-content"]}06`, color: theme["base-content"] }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* BODY */}
              <form
                id="project-form"
                onSubmit={handleSubmit}
                className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-7 space-y-8"
              >
                {/* BASIC INFO */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={sectionLabelStyle}>Basic info</h3>
                    <span className="flex-1 h-px" style={{ backgroundColor: `${theme["base-content"]}10` }} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                      Title <span style={{ color: theme.primary }}>*</span>
                    </label>
                    <input
                      required
                      autoFocus
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Portfolio Backend API"
                      className="w-full rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 transition"
                      style={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                        URL slug <span style={{ color: theme.primary }}>*</span>
                      </label>
                      <input
                        required
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="portfolio-backend-api"
                        className="w-full rounded-xl py-3 px-4 text-sm font-mono outline-none focus:ring-2 transition"
                        style={inputStyle}
                      />
                      <p className="text-[11px] opacity-40 mt-1">
                        {slugManuallyEdited ? <>Manually edited · </> : <>Auto-generated from title · </>}
                        Appears at <code>/project/your-slug</code>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                        Status <span style={{ color: theme.primary }}>*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full rounded-xl py-3 px-4 text-sm outline-none cursor-pointer focus:ring-2 transition"
                        style={inputStyle}
                      >
                        <option value="published">Published — visible on the site</option>
                        <option value="draft">Draft — only you can see it</option>
                        <option value="archived">Archived — hidden, kept for later</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                      Short description <span style={{ color: theme.primary }}>*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.mainDescription}
                      onChange={(e) => setFormData({ ...formData, mainDescription: e.target.value })}
                      placeholder="A few sentences about what the project does, the stack, and the problem it solves."
                      className="w-full rounded-xl py-3 px-4 text-sm outline-none resize-none focus:ring-2 transition"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-1.5">
                      Thumbnail image
                    </label>

                    {/* ✅ mediaAssets is now an array again */}
                    {!mediaAssets || mediaAssets.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center"
                        style={{ borderColor: `${theme["base-content"]}15` }}
                      >
                        <ImageIcon size={26} className="opacity-30" />
                        <p className="text-xs opacity-50">No images uploaded yet. Upload some first.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {mediaAssets?.map(
                          (asset: { id: string; fileUrl: string; fileName?: string }) => {
                            const selected = formData.mainThumbnailId === asset.id;
                            return (
                              <button
                                type="button"
                                key={asset.id}
                                onClick={() => setFormData({ ...formData, mainThumbnailId: asset.id })}
                                className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                  selected
                                    ? 'shadow-lg scale-[0.97]'
                                    : 'opacity-50 grayscale border-transparent hover:opacity-100 hover:grayscale-0'
                                }`}
                                style={{ borderColor: selected ? theme.primary : 'transparent' }}
                              >
                                <img src={asset.fileUrl} alt={asset.fileName ?? 'image'} className="w-full h-full object-cover" />
                                {selected && (
                                  <span
                                    className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full shadow"
                                    style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
                                  >
                                    <CheckCircle2 size={12} />
                                  </span>
                                )}
                              </button>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                    className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 transition-all ${
                      formData.isFeatured ? '' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      borderColor: formData.isFeatured ? theme.primary : `${theme["base-content"]}15`,
                      backgroundColor: formData.isFeatured ? `${theme.primary}10` : 'transparent',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Star
                        size={16}
                        style={{
                          color: formData.isFeatured ? theme.primary : theme["base-content"],
                          fill: formData.isFeatured ? theme.primary : 'transparent',
                        }}
                      />
                      <span className="text-sm font-semibold">Featured project</span>
                    </div>
                    <span
                      className={`inline-flex h-5 w-9 items-center rounded-full transition-all ${
                        formData.isFeatured ? 'justify-end' : 'justify-start'
                      }`}
                      style={{ backgroundColor: formData.isFeatured ? theme.primary : `${theme["base-content"]}30` }}
                    >
                      <span className="h-4 w-4 rounded-full mx-0.5 transition-all" style={{ backgroundColor: theme["base-100"] }} />
                    </span>
                  </button>
                </section>

                {/* LINKS */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <LinkIcon size={14} style={{ color: theme.primary }} />
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={sectionLabelStyle}>Links</h3>
                    <span className="flex-1 h-px" style={{ backgroundColor: `${theme["base-content"]}10` }} />
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${theme.primary}1a`, color: theme.primary }}
                    >
                      {formData.links.length}
                    </span>
                  </div>

                  {formData.links.length === 0 ? (
                    <p className="text-xs opacity-50 rounded-xl border border-dashed p-4 text-center" style={{ borderColor: `${theme["base-content"]}15` }}>
                      Add GitHub, demo, docs, or design links.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.links.map((link, i) => (
                        <div
                          key={i}
                          className="rounded-xl border p-3 space-y-2"
                          style={{ borderColor: `${theme["base-content"]}10`, backgroundColor: `${theme["base-content"]}02` }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold opacity-60">Link {i + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeLink(i)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                              aria-label="Remove link"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              value={link.label}
                              onChange={(e) => updateLink(i, { label: e.target.value })}
                              placeholder="Label (e.g. GitHub)"
                              className="w-full rounded-lg py-2 px-3 text-xs outline-none focus:ring-1 transition"
                              style={inputStyle}
                            />
                            <select
                              value={link.type ?? 'live_demo'}
                              onChange={(e) => updateLink(i, { type: e.target.value as TLinkType })}
                              className="w-full rounded-lg py-2 px-3 text-xs outline-none cursor-pointer focus:ring-1 transition"
                              style={inputStyle}
                            >
                              {LINK_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <input
                            value={link.url}
                            onChange={(e) => updateLink(i, { url: e.target.value })}
                            placeholder="https://…"
                            className="w-full rounded-lg py-2 px-3 text-xs font-mono outline-none focus:ring-1 transition"
                            style={inputStyle}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addLink}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all hover:-translate-y-0.5"
                    style={{ borderColor: `${theme.primary}55`, color: theme.primary }}
                  >
                    <Plus size={13} /> Add link
                  </button>
                </section>

                {/* SECTIONS */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <FileText size={14} style={{ color: theme.primary }} />
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={sectionLabelStyle}>Sections</h3>
                    <span className="flex-1 h-px" style={{ backgroundColor: `${theme["base-content"]}10` }} />
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${theme.primary}1a`, color: theme.primary }}
                    >
                      {formData.sections.length}
                    </span>
                  </div>

                  {formData.sections.length === 0 ? (
                    <p className="text-xs opacity-50 rounded-xl border border-dashed p-4 text-center" style={{ borderColor: `${theme["base-content"]}15` }}>
                      Add sections to tell the story — overview, tech stack, etc.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.sections.map((section, i) => (
                        <div
                          key={i}
                          className="rounded-xl border p-3 space-y-2"
                          style={{ borderColor: `${theme["base-content"]}10`, backgroundColor: `${theme["base-content"]}02` }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold opacity-60">Section {i + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeSection(i)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                              aria-label="Remove section"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <input
                            value={section.sectionTitle ?? ''}
                            onChange={(e) => updateSection(i, { sectionTitle: e.target.value })}
                            placeholder="Section title (e.g. Overview)"
                            className="w-full rounded-lg py-2 px-3 text-xs outline-none focus:ring-1 transition"
                            style={inputStyle}
                          />
                          <textarea
                            rows={3}
                            value={section.explanation ?? ''}
                            onChange={(e) => updateSection(i, { explanation: e.target.value })}
                            placeholder="Explain what this section is about…"
                            className="w-full rounded-lg py-2 px-3 text-xs outline-none resize-none focus:ring-1 transition"
                            style={inputStyle}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addSection}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all hover:-translate-y-0.5"
                    style={{ borderColor: `${theme.primary}55`, color: theme.primary }}
                  >
                    <Plus size={13} /> Add section
                  </button>
                </section>

                {/* TIMELINE */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} style={{ color: theme.primary }} />
                    <h3 className="text-xs font-bold uppercase tracking-wider" style={sectionLabelStyle}>Timeline</h3>
                    <span className="flex-1 h-px" style={{ backgroundColor: `${theme["base-content"]}10` }} />
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${theme.primary}1a`, color: theme.primary }}
                    >
                      {formData.timeline.length}
                    </span>
                  </div>

                  {formData.timeline.length === 0 ? (
                    <p className="text-xs opacity-50 rounded-xl border border-dashed p-4 text-center" style={{ borderColor: `${theme["base-content"]}15` }}>
                      Add key milestones — kick-off, launch, etc.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {formData.timeline.map((item, i) => (
                        <div
                          key={i}
                          className="rounded-xl border p-3 space-y-2"
                          style={{ borderColor: `${theme["base-content"]}10`, backgroundColor: `${theme["base-content"]}02` }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold opacity-60">Milestone {i + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeTimeline(i)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                              aria-label="Remove milestone"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              value={item.title}
                              onChange={(e) => updateTimeline(i, { title: e.target.value })}
                              placeholder="Title (e.g. Auth complete)"
                              className="w-full rounded-lg py-2 px-3 text-xs outline-none focus:ring-1 transition"
                              style={inputStyle}
                            />
                            <input
                              type="date"
                              value={item.date ?? ''}
                              onChange={(e) => updateTimeline(i, { date: e.target.value })}
                              className="w-full rounded-lg py-2 px-3 text-xs outline-none focus:ring-1 transition"
                              style={inputStyle}
                            />
                          </div>
                          <input
                            value={item.description ?? ''}
                            onChange={(e) => updateTimeline(i, { description: e.target.value })}
                            placeholder="Description"
                            className="w-full rounded-lg py-2 px-3 text-xs outline-none focus:ring-1 transition"
                            style={inputStyle}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addTimeline}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all hover:-translate-y-0.5"
                    style={{ borderColor: `${theme.primary}55`, color: theme.primary }}
                  >
                    <Plus size={13} /> Add milestone
                  </button>
                </section>
              </form>

              {/* FOOTER */}
              <div
                className="shrink-0 flex flex-col-reverse sm:flex-row gap-2 justify-end px-6 sm:px-8 py-4 border-t"
                style={{
                  borderColor: `${theme["base-content"]}10`,
                  backgroundColor: `${theme["base-content"]}02`,
                }}
              >
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5"
                  style={{ borderColor: `${theme["base-content"]}20`, color: theme["base-content"] }}
                >
                  Cancel
                </button>
                <button
                  form="project-form"
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
                >
                  {isCreating || isUpdating ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {editingId ? "Save changes" : "Create project"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default ProjectManager;