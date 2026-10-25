import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  useCreateMediaMutation,
  useGetMediaAssetsQuery,
  useDeleteMediaMutation,
  getMediaErrorMessage,
  type TMediaFile,
} from '../../Features/Apis/Media.Api';
import { useTheme } from '../../ThemeContext';
import {
  CloudUpload,
  Trash2,
  ImageIcon,
  Loader2,
  X,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Search,
  Copy,
  List,
  LayoutGrid,
  FolderOpen,
  FileText,
  Film,
  ExternalLink,
  Star,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

/* ---------- Cloudinary config (UNCHANGED) ---------- */
const CLOUD_NAME = 'dwibg4vvf';
const UPLOAD_PRESET = 'tickets';

/* ---------- Filter config ---------- */
type FileKind = 'all' | 'image' | 'pdf' | 'video' | 'other';
type ViewMode = 'grid' | 'list';

const kindOf = (fileType?: string | null): FileKind => {
  if (!fileType) return 'other';
  if (fileType.startsWith('image/')) return 'image';
  if (fileType === 'application/pdf') return 'pdf';
  if (fileType.startsWith('video/')) return 'video';
  return 'other';
};

const formatBytes = (bytes?: number | null) => {
  if (!bytes || bytes <= 0) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const MediaManager = () => {
  const { theme } = useTheme();

  /* ---------- API ---------- */
  const { data: assetsResponse, isLoading: isFetching } = useGetMediaAssetsQuery();
  const assets: TMediaFile[] = assetsResponse?.data ?? [];

  const [createMedia, { isLoading: isCreating }] = useCreateMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();

  /* ---------- UI STATE ---------- */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [kindFilter, setKindFilter] = useState<FileKind>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  /* ---------- Derived ---------- */
  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return assets.filter((a) => {
      const matchesSearch =
        !term ||
        a.fileName.toLowerCase().includes(term) ||
        (a.fileType ?? '').toLowerCase().includes(term);
      const matchesKind = kindFilter === 'all' || kindOf(a.fileType) === kindFilter;
      return matchesSearch && matchesKind;
    });
  }, [assets, searchTerm, kindFilter]);

  const counts = useMemo(
    () => ({
      total: assets.length,
      image: assets.filter((a) => kindOf(a.fileType) === 'image').length,
      pdf: assets.filter((a) => kindOf(a.fileType) === 'pdf').length,
      video: assets.filter((a) => kindOf(a.fileType) === 'video').length,
      other: assets.filter((a) => kindOf(a.fileType) === 'other').length,
    }),
    [assets]
  );

  /* Auto-cancel pending delete */
  useEffect(() => {
    if (!pendingDelete) return;
    const id = setTimeout(() => setPendingDelete(null), 4000);
    return () => clearTimeout(id);
  }, [pendingDelete]);

  /* Esc closes modal + body scroll lock */
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

  /* ---------- HANDLERS ---------- */
  const openModal = () => {
    setFile(null);
    setUploadProgress(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isUploading) return;
    setIsModalOpen(false);
    setFile(null);
    setUploadProgress(0);
  };

  /* Upload flow — Cloudinary payload UNCHANGED */
  const handleUpload = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!file) return toast.error('Please select a file first');

    setIsUploading(true);
    const cloudFormData = new FormData();
    cloudFormData.append('file', file);
    cloudFormData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        cloudFormData,
        {
          onUploadProgress: (p) => {
            setUploadProgress(Math.round((p.loaded * 100) / (p.total || 1)));
          },
        }
      );

      await createMedia({
        fileName: file.name,
        fileUrl: res.data.secure_url,
        fileType: file.type,
        fileSize: file.size,
      }).unwrap();

      toast.success('ASSET_SYNCED_TO_BACKEND');
      closeModal();
    } catch (err: any) {
      toast.error(
        err?.data?.error ||
          err?.data?.message ||
          'UPLOAD_TRANSACTION_FAILED'
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /* Delete — inline confirm, Swal only on constraint error */
  const doDelete = async (id: string) => {
    try {
      await deleteMedia(id).unwrap();
      toast.success('ASSET_REMOVED');
    } catch (err: any) {
      Swal.fire({
        title: 'Could not delete',
        text:
          getMediaErrorMessage(err) ||
          'This file is being used by a project. Remove it from that project first.',
        icon: 'error',
        background: theme['base-100'],
        color: theme['base-content'],
      });
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  /* ---------- Loading skeleton ---------- */
  if (isFetching) {
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
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl animate-pulse"
                style={{
                  backgroundColor: `${theme['base-content']}06`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Shared input style ---------- */
  const inputStyle = {
    backgroundColor: `${theme['base-content']}06`,
    color: theme['base-content'],
    // @ts-ignore
    '--tw-ring-color': `${theme.primary}55`,
  } as React.CSSProperties;

  const filterTabs: { key: FileKind; label: string; count: number; color: string }[] = [
    { key: 'all', label: 'All', count: counts.total, color: theme.primary },
    { key: 'image', label: 'Images', count: counts.image, color: '#10b981' },
    { key: 'pdf', label: 'PDFs', count: counts.pdf, color: '#f59e0b' },
    { key: 'video', label: 'Videos', count: counts.video, color: '#8b5cf6' },
    { key: 'other', label: 'Other', count: counts.other, color: '#94a3b8' },
  ];

  /* ---------- One asset renderer (grid + list) ---------- */
  const renderAsset = (asset: TMediaFile) => {
    const isImage = kindOf(asset.fileType) === 'image';
    const isVideo = kindOf(asset.fileType) === 'video';
    const isPdf = kindOf(asset.fileType) === 'pdf';
    const isGrid = viewMode === 'grid';

    const IconEl = isImage ? ImageIcon : isVideo ? Film : isPdf ? FileText : ImageIcon;

    return (
      <div
        key={asset.id}
        className={`group relative flex ${
          isGrid ? 'flex-col gap-3 p-3' : 'items-center gap-4 p-4'
        } rounded-2xl border transition-all hover:shadow-md`}
        style={{
          borderColor: `${theme['base-content']}10`,
          backgroundColor: `${theme['base-content']}03`,
        }}
      >
        {/* Preview */}
        <div
          className={`relative ${
            isGrid ? 'w-full aspect-square' : 'w-14 h-14'
          } rounded-xl overflow-hidden flex items-center justify-center shrink-0`}
          style={{
            backgroundColor: `${theme.primary}10`,
            border: `1px solid ${theme.primary}22`,
          }}
        >
          {isImage ? (
            <img
              src={asset.fileUrl}
              alt={asset.fileName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <IconEl size={isGrid ? 32 : 22} style={{ color: theme.primary }} />
          )}

          {/* Type chip (grid only) */}
          {isGrid && (
            <span
              className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
              style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#ffffff' }}
            >
              {isImage ? 'Image' : isVideo ? 'Video' : isPdf ? 'PDF' : 'File'}
            </span>
          )}
        </div>

        {/* Meta */}
        <div className={`${isGrid ? 'w-full min-w-0' : 'min-w-0 flex-1'}`}>
          <p className="text-sm font-bold truncate">{asset.fileName}</p>
          <p className="text-xs opacity-50 truncate mt-0.5">
            {formatBytes(asset.fileSize)}
            {asset.fileType && <> · {asset.fileType.replace('image/', '').replace('video/', '').replace('application/', '')}</>}
          </p>
        </div>

        {/* Actions */}
        <div className={`flex gap-2 shrink-0 ${isGrid ? 'w-full' : ''}`}>
          <button
            onClick={() => copyUrl(asset.fileUrl)}
            aria-label="Copy link"
            title="Copy link"
            className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
              isGrid ? '' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ backgroundColor: `${theme['base-content']}06`, color: theme['base-content'] }}
          >
            <Copy size={16} />
          </button>
          <a
            href={asset.fileUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open file"
            title="Open file"
            className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
              isGrid ? '' : 'opacity-0 group-hover:opacity-100'
            }`}
            style={{ backgroundColor: `${theme['base-content']}06`, color: theme['base-content'] }}
          >
            <ExternalLink size={16} />
          </a>

          {pendingDelete === asset.id ? (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  doDelete(asset.id);
                  setPendingDelete(null);
                }}
                className="rounded-xl px-3 py-2 text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all"
              >
                Yes, delete
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
              onClick={() => setPendingDelete(asset.id)}
              aria-label="Delete"
              title="Delete"
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
    <div
      className="min-h-screen p-4 lg:p-8"
      style={{ backgroundColor: theme['base-100'], color: theme['base-content'] }}
    >
      <div className="max-w-6xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="mb-8">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-medium opacity-60">
            <Link to="/admin-dashboard" className="hover:opacity-100 transition-opacity">
              Admin
            </Link>
            <ChevronRight size={11} className="opacity-50" />
            <span style={{ color: theme.primary }}>Media</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                Media library
              </h1>
              <p className="text-sm opacity-60 max-w-xl">
                All the images, PDFs and videos used across your site.
                Upload a file once, then use it anywhere.
              </p>

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 pt-3">
                {filterTabs.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setKindFilter(f.key)}
                    aria-pressed={kindFilter === f.key}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: kindFilter === f.key ? f.color : `${theme['base-content']}15`,
                      color: kindFilter === f.key ? f.color : theme['base-content'],
                      backgroundColor: kindFilter === f.key ? `${f.color}14` : 'transparent',
                    }}
                  >
                    {f.label} <span className="opacity-60">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
              style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
            >
              <Plus size={18} /> Upload file
            </button>
          </div>
        </div>

        {/* ================= SEARCH + VIEW TOGGLE ================= */}
        <div className="flex items-center gap-2 max-w-2xl mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by file name or type…"
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
            {(['grid', 'list'] as const).map((m) => (
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
                {m === 'grid' ? <LayoutGrid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
        </div>

        {/* ================= LIST / GRID ================= */}
        {filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-16 text-center"
            style={{ borderColor: `${theme.primary}33` }}
          >
            <div
              className="grid h-16 w-16 place-items-center rounded-full"
              style={{ backgroundColor: `${theme.primary}1f` }}
            >
              <FolderOpen size={28} style={{ color: theme.primary }} />
            </div>

            {searchTerm || kindFilter !== 'all' ? (
              <>
                <h3 className="text-lg font-bold">No files match</h3>
                <p className="max-w-sm text-sm opacity-60">
                  {searchTerm
                    ? `Nothing found for "${searchTerm}". Try a different name.`
                    : 'Nothing in this category yet.'}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setKindFilter('all');
                  }}
                  className="mt-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold">No files yet</h3>
                <p className="max-w-sm text-sm opacity-60">
                  Upload your first image, PDF or video.
                </p>
                <button
                  onClick={openModal}
                  className="mt-2 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  <Plus size={16} /> Upload file
                </button>
              </>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map(renderAsset)}
          </div>
        ) : (
          <div className="space-y-2">{filtered.map(renderAsset)}</div>
        )}
      </div>

      {/* ================= MODAL (portal) ================= */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
            style={{ zIndex: 9999, isolation: 'isolate' }}
            role="dialog"
            aria-modal="true"
            aria-label="Upload media"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 animate-in fade-in duration-200"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
              onClick={closeModal}
            />

            {/* Panel */}
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
              {/* HEADER */}
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
                      <Link
                        to="/admin-dashboard"
                        onClick={closeModal}
                        className="hover:opacity-100 transition-opacity"
                      >
                        Admin
                      </Link>
                      <ChevronRight size={11} className="opacity-50" />
                      <span className="opacity-80">Media</span>
                      <ChevronRight size={11} className="opacity-50" />
                      <span style={{ color: theme.primary }}>Upload</span>
                    </div>

                    <div className="flex items-start gap-3">
                      <span
                        className="hidden sm:grid shrink-0 place-items-center h-11 w-11 rounded-xl"
                        style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
                      >
                        <CloudUpload size={20} />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold truncate">
                          Upload a file
                        </h2>
                        <p className="text-xs sm:text-sm opacity-55 mt-1">
                          Choose a file, then press Upload when you're ready.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={closeModal}
                    aria-label="Close"
                    disabled={isUploading}
                    className="shrink-0 p-2.5 rounded-xl transition-all hover:bg-rose-500/10 hover:text-rose-500 hover:rotate-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:rotate-0"
                    style={{
                      backgroundColor: `${theme['base-content']}06`,
                      color: theme['base-content'],
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* BODY */}
              <form
                id="media-form"
                onSubmit={handleUpload}
                className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-7 space-y-6"
              >
                {/* CHOOSE A FILE */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
                    Choose a file <span style={{ color: theme.primary }}>*</span>
                  </label>

                  <div className="relative group">
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={isUploading}
                    />
                    <div
                      className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all group-hover:scale-[0.99]"
                      style={{
                        backgroundColor: `${theme['base-content']}03`,
                        borderColor: `${theme['base-content']}15`,
                      }}
                    >
                      <div
                        className="grid h-14 w-14 place-items-center rounded-2xl mb-4"
                        style={{ backgroundColor: `${theme.primary}1f`, color: theme.primary }}
                      >
                        <CloudUpload size={24} />
                      </div>
                      <p className="text-sm font-semibold truncate max-w-full">
                        {file ? file.name : 'Click here to choose a file'}
                      </p>
                      {file ? (
                        <p className="text-[11px] font-mono opacity-50 mt-2">
                          {formatBytes(file.size)} · {file.type || 'unknown'}
                        </p>
                      ) : (
                        <p className="text-xs opacity-50 mt-1">
                          Images, PDFs or videos
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* PROGRESS */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold opacity-60">
                      <span>Uploading…</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ backgroundColor: `${theme['base-content']}08` }}
                    >
                      <div
                        className="h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%`, backgroundColor: theme.primary }}
                      />
                    </div>
                  </div>
                )}

                {/* DELETE NOTE */}
                <div
                  className="flex gap-3 items-start rounded-xl border p-4"
                  style={{
                    backgroundColor: `${theme.primary}08`,
                    borderColor: `${theme.primary}22`,
                  }}
                >
                  <AlertCircle size={18} className="mt-0.5 shrink-0" style={{ color: theme.primary }} />
                  <div>
                    <p className="text-sm font-semibold">Used files can't be deleted</p>
                    <p className="text-xs opacity-60 mt-1 leading-relaxed">
                      If a file is being shown on a project, you'll need to remove it
                      from that project first.
                    </p>
                  </div>
                </div>
              </form>

              {/* FOOTER */}
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
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  style={{
                    borderColor: `${theme['base-content']}20`,
                    color: theme['base-content'],
                  }}
                >
                  Cancel
                </button>
                <button
                  form="media-form"
                  type="submit"
                  disabled={isUploading || isCreating || !file}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: theme.primary, color: theme['base-100'] }}
                >
                  {isUploading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {isUploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default MediaManager;