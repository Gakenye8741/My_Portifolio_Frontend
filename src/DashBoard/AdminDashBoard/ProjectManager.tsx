import React, { useState } from 'react';
import { 
  useGetProjectsQuery, 
  useDeleteProjectMutation, 
  useUpdateProjectMutation,
  useCreateProjectMutation,
  Project 
} from "../../Features/Apis/Projects.Api";
import { useGetMediaAssetsQuery } from "../../Features/Apis/Media.Api"; 
import { useTheme } from '../../ThemeContext';
import { 
  Plus, Trash2, Edit3, Search, RefreshCw,
  X, Save, Layers, Terminal, Image as ImageIcon, Check,
  Zap, FileText, Info, ShieldQuestion, CheckCircle2, Loader2,
  LayoutGrid, Activity, ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProjectManager = () => {
  const { theme } = useTheme();
  
  // --- API HOOKS ---
  const { data: projects, isLoading: projectsLoading } = useGetProjectsQuery();
  const { data: mediaAssets } = useGetMediaAssetsQuery(); 
  
  const [deleteProject] = useDeleteProjectMutation();
  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  
  // --- UI STATE ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    title: "", 
    slug: "", 
    mainDescription: "",
    status: "published" as 'published' | 'draft' | 'archived',
    isFeatured: false, 
    mainThumbnailId: ""
  });

  // --- HANDLERS ---
  const handleOpenPanel = (project?: Project) => {
    if (project) {
      setEditingId(project.id);
      setFormData({
        title: project.title, 
        slug: project.slug,
        mainDescription: project.mainDescription,
        status: project.status, 
        isFeatured: project.isFeatured,
        mainThumbnailId: project.mainThumbnailId || ""
      });
    } else {
      setEditingId(null);
      setFormData({ 
        title: "", slug: "", mainDescription: "", 
        status: "published", isFeatured: false, mainThumbnailId: "" 
      });
    }
    setIsPanelOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.mainThumbnailId) return toast.error("Please select a thumbnail asset");

    const promise = editingId 
      ? updateProject({ id: editingId, updates: formData }).unwrap()
      : createProject(formData).unwrap();

    toast.promise(promise, {
      loading: 'Syncing with Registry...',
      success: editingId ? 'Node Updated' : 'Deployment Initialized',
      error: 'Transaction Failed',
    });

    try { 
      await promise; 
      setIsPanelOpen(false); 
    } catch (err) {}
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Permanent Archive Removal? This action cannot be undone.")) {
      try {
        await deleteProject(id).unwrap();
        toast.success("Deployment Purged");
      } catch (err) {
        toast.error("Purge Failed");
      }
    }
  };

  if (projectsLoading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
       <RefreshCw className="animate-spin opacity-20" size={40} style={{ color: theme.primary }} />
       <span className="text-[10px] font-mono tracking-[0.5em] opacity-40 uppercase">Initialising_Registry</span>
    </div>
  );

  return (
    <div className="min-h-screen p-4 lg:p-8 selection:bg-indigo-500/30 transition-all duration-500" style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
      
      {/* --- GREETING & HEADER --- */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b pb-8" style={{ borderColor: `${theme.primary}10` }}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: theme.primary }}>Protocol_Control / Registry</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-none" style={{ color: theme["base-content"] }}>
              Project<span className="font-light not-italic" style={{ color: theme.primary }}>Archive</span>
            </h1>
            <p className="text-xs max-w-2xl leading-relaxed mt-4 opacity-40">
              Welcome to the central deployment hub. This interface provides <span className="font-bold opacity-100 italic">administrative oversight</span> for the project portfolio. Audit metadata, manage URI paths, and <span style={{ color: theme.primary }}>verify featured status</span> across the public layer.
            </p>
          </div>
          <button 
            onClick={() => handleOpenPanel()}
            className="group px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl active:scale-95"
            style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
          >
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300" /> Register Deployment
          </button>
        </div>

        {/* --- SYSTEM OVERVIEW CARDS (Minimalist) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {[
            { icon: <Activity size={18} />, title: "Audit Control", desc: "Metadata & technical manifests.", color: theme.primary },
            { icon: <LayoutGrid size={18} />, title: "Asset Bind", desc: "Link media assets to registry.", color: "#10b981" },
            { icon: <Terminal size={18} />, title: "Visibility Sync", desc: "Toggle public & priority status.", color: "#ec4899" }
          ].map((card, idx) => (
            <div key={idx} className="p-6 rounded-3xl border border-transparent hover:border-opacity-20 transition-all hover:translate-y-[-2px]" style={{ backgroundColor: `${theme["base-content"]}05`, borderColor: theme.primary }}>
              <div className="mb-4" style={{ color: card.color }}>{card.icon}</div>
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-1">{card.title}</h3>
              <p className="text-[10px] opacity-40">{card.desc}</p>
            </div>
          ))}
        </div>

        {/* --- FILTERS BAR --- */}
        <div className="mt-12 relative max-w-xl">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={14} />
           <input 
             type="text"
             placeholder="Search registry by title..."
             className="w-full border-none rounded-2xl py-4 pl-14 pr-4 text-[11px] font-bold uppercase tracking-widest outline-none transition-all focus:ring-1"
             style={{ 
                backgroundColor: `${theme["base-content"]}08`, 
                color: theme["base-content"],
                boxShadow: `inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)`
             }}
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {/* --- REGISTRY TABLE (CLEAN DESIGN) --- */}
      <div className="max-w-7xl mx-auto overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-opacity-40" style={{ color: theme["base-content"] }}>
                <th className="px-8 py-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-30">Deployment Identity</th>
                <th className="px-8 py-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-30 text-center">Core Status</th>
                <th className="px-8 py-2 text-[9px] font-black uppercase tracking-[0.3em] opacity-30 text-right">System Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects?.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((project) => (
                <tr key={project.id} className="group transition-all duration-300">
                  <td className="px-8 py-6 rounded-l-3xl border-y border-l transition-all group-hover:pl-10" style={{ backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}05` }}>
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110" style={{ backgroundColor: `${theme.primary}10` }}>
                        <Layers size={20} style={{ color: theme.primary }} />
                      </div>
                      <div>
                        <p className="text-sm font-black italic uppercase tracking-tight">{project.title}</p>
                        <p className="text-[9px] font-mono opacity-30 uppercase flex items-center gap-1.5 mt-1">
                          <ExternalLink size={10} style={{ color: theme.primary }} /> {project.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 border-y text-center" style={{ backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}05` }}>
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] transition-all group-hover:bg-opacity-20" style={{ backgroundColor: `${theme["base-content"]}08`, color: theme["base-content"] }}>
                        {project.status}
                      </span>
                      {project.isFeatured && (
                         <span className="text-[8px] font-black uppercase tracking-widest animate-pulse" style={{ color: theme.primary }}>★ Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 rounded-r-3xl border-y border-r text-right" style={{ backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}05` }}>
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleOpenPanel(project)} className="p-3 rounded-2xl transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] }}>
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDelete(project.id)} className="p-3 rounded-2xl transition-all hover:scale-110 active:scale-95 bg-rose-500 bg-opacity-10 text-rose-500 hover:bg-rose-500 hover:text-white">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- SLIDING SIDE PANEL --- */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPanelOpen(false)} />
          
          <div className="relative w-full max-w-xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l" style={{ backgroundColor: theme["base-100"], borderColor: `${theme.primary}10` }}>
            
            {/* Panel Header */}
            <div className="p-10 border-b relative overflow-hidden" style={{ borderColor: `${theme["base-content"]}05` }}>
               <Layers size={150} className="absolute -right-10 -bottom-10 opacity-[0.03] -rotate-12 pointer-events-none" style={{ color: theme.primary }} />
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 rounded-md" style={{ color: theme.primary, backgroundColor: `${theme.primary}15` }}><Zap size={14} /></span>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: theme.primary }}>Registry_Sync</span>
                  </div>
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
                    {editingId ? 'Edit_Node' : 'New_Node'}
                  </h2>
                </div>
                <button onClick={() => setIsPanelOpen(false)} className="p-4 rounded-3xl transition-all hover:bg-rose-500/20 hover:text-rose-500" style={{ backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] }}>
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Panel Form Body */}
            <form id="side-form" onSubmit={handleSubmit} className="p-10 flex-1 overflow-y-auto space-y-10 no-scrollbar">
              
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-[2px] w-8" style={{ backgroundColor: theme.primary }} />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Core Identity</h3>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-1">Title</label>
                    <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full border-none rounded-2xl py-4 px-6 text-xs outline-none focus:ring-1" style={{ backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"], boxShadow: `inset 0 0 0 1px ${theme.primary}` }} />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-1">Slug</label>
                      <input required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full border-none rounded-2xl py-4 px-6 text-xs font-mono outline-none" style={{ backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase opacity-30 tracking-widest ml-1">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} className="w-full border-none rounded-2xl py-4 px-6 text-xs outline-none cursor-pointer" style={{ backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] }}>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-[2px] w-8" style={{ backgroundColor: "#10b981" }} />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Media_Bind</h3>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   {mediaAssets?.map((asset) => (
                      <div 
                        key={asset.id} 
                        onClick={() => setFormData({...formData, mainThumbnailId: asset.id})}
                        className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${formData.mainThumbnailId === asset.id ? 'scale-95 shadow-2xl' : 'opacity-20 grayscale border-transparent hover:opacity-100 hover:grayscale-0'}`}
                        style={{ borderColor: formData.mainThumbnailId === asset.id ? theme.primary : 'transparent' }}
                      >
                         <img src={asset.fileUrl} className="w-full h-full object-cover" alt="asset" />
                      </div>
                   ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-[2px] w-8" style={{ backgroundColor: "#ec4899" }} />
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Technical_Manifest</h3>
                </div>
                <textarea rows={5} value={formData.mainDescription} onChange={(e) => setFormData({...formData, mainDescription: e.target.value})} className="w-full border-none rounded-3xl py-5 px-6 text-xs outline-none resize-none" style={{ backgroundColor: `${theme["base-content"]}05`, color: theme["base-content"] }} />
              </div>
            </form>

            {/* Panel Footer */}
            <div className="p-10 border-t flex flex-col gap-5" style={{ backgroundColor: `${theme["base-content"]}02`, borderColor: `${theme["base-content"]}05` }}>
              <button 
                type="button" 
                onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})}
                className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.3em] transition-all ${formData.isFeatured ? 'opacity-100' : 'opacity-30'}`}
                style={{ 
                  borderColor: formData.isFeatured ? theme.primary : `${theme["base-content"]}10`, 
                  color: formData.isFeatured ? theme.primary : theme["base-content"] 
                }}
              >
                {formData.isFeatured ? '★ Featured_Active' : '☆ Featured_Null'}
              </button>
              
              <button 
                form="side-form"
                type="submit" 
                disabled={isCreating || isUpdating} 
                className="w-full py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
              >
                {isCreating || isUpdating ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                {editingId ? 'Execute_Update' : 'Execute_Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;