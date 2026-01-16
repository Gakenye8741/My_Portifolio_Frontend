import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useGetProjectsQuery } from '../Features/Apis/Projects.Api';
import { Navbar } from '../Components/Navbar';
import { 
  Search, Eye, Clock, ArrowRight, 
  LayoutGrid, List, Terminal, X, AlertCircle, Hash, 
  Cpu, Filter, ChevronRight, Activity, Globe
} from 'lucide-react';

const ProjectsRegistry = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { data: projects, isLoading } = useGetProjectsQuery();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeStatus, setActiveStatus] = useState<'all' | 'published' | 'archived'>('all');

  // --- ENHANCED FILTER LOGIC ---
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mainDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.techs?.some(t => t.technology?.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = activeStatus === 'all' || p.status === activeStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, activeStatus, projects]);

  // --- BRANDED LOADING STATE ---
  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-8" style={{ backgroundColor: theme["base-100"] }}>
      <div className="relative">
        <div className="w-24 h-24 border-2 border-dashed rounded-full animate-[spin_6s_linear_infinite] opacity-10" style={{ borderColor: theme.primary }} />
        <div className="absolute inset-2 border-t-2 rounded-full animate-spin" style={{ borderColor: theme.primary }} />
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black uppercase tracking-[0.6em] animate-pulse">Gakenye</h2>
        <p className="text-[9px] font-bold opacity-30 uppercase tracking-[0.4em]">Initialising_Data_Stream...</p>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen pt-[64px] transition-all duration-700" 
          style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
      <Navbar />

      {/* --- ADVANCED HEADER --- */}
      <header className="px-6 lg:px-16 py-16 border-b border-white/5 relative overflow-hidden">
        {/* Background Decorative Text */}
        <div className="absolute top-10 right-[-5%] text-[15vh] font-black opacity-[0.02] italic pointer-events-none select-none">
          REGISTRY_01
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest opacity-40">
            <span className="hover:text-primary cursor-pointer transition-colors" onClick={() => navigate('/')}>Root</span>
            <ChevronRight size={10} />
            <span style={{ color: theme.primary }}>Archive_Nodes</span>
          </nav>
          
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
            <div className="space-y-4">
              <h1 className="text-7xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8]">
                ARCHIVE <br /> <span className="text-outline" style={{ WebkitTextStroke: `1px ${theme["base-content"]}40`, color: 'transparent' }}>CORE.</span>
              </h1>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Activity size={14} style={{ color: theme.primary }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{projects?.length} Total_Nodes</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{filteredProjects.length} Result_Matches</span>
              </div>
            </div>
            
            {/* SEARCH & FILTER CONSOLE */}
            <div className="w-full xl:max-w-2xl space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" 
                     style={{ "--tw-gradient-from": `${theme.primary}30` } as any} />
                <div className="relative flex items-center bg-black/20 border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
                    <Search className="ml-4 opacity-20" size={20} />
                    <input 
                      type="text" 
                      placeholder="SEARCH_NODE_IDENTIFIER..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-grow bg-transparent py-4 px-4 text-xs font-black uppercase tracking-widest focus:outline-none"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                            <X size={18} className="opacity-40" />
                        </button>
                    )}
                </div>
              </div>

              {/* FILTER BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                    {['all', 'published', 'archived'].map((status) => (
                        <button 
                            key={status}
                            onClick={() => setActiveStatus(status as any)}
                            className="px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all"
                            style={{ 
                                backgroundColor: activeStatus === status ? theme.primary : 'transparent',
                                color: activeStatus === status ? theme["base-100"] : 'inherit',
                                opacity: activeStatus === status ? 1 : 0.4
                            }}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2 p-1 rounded-xl bg-black/40 border border-white/5">
                    <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white/10 opacity-100 shadow-xl' : 'opacity-20 hover:opacity-100'}`}><LayoutGrid size={18} /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white/10 opacity-100 shadow-xl' : 'opacity-20 hover:opacity-100'}`}><List size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- CONTENT SECTION --- */}
      <section className="px-6 lg:px-16 py-20">
        <div className="max-w-7xl mx-auto">
          {filteredProjects.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" 
              : "flex flex-col gap-6"
            }>
              {filteredProjects.map((project) => (
                <div 
                  key={project.id}
                  onClick={() => navigate(`/project/${project.id}`)}
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-700 
                    ${viewMode === 'grid' 
                      ? 'rounded-[3rem] border border-white/5 bg-black/5 p-8 hover:bg-black/20 hover:-translate-y-4' 
                      : 'flex flex-col md:flex-row items-center gap-10 p-8 rounded-[2rem] border border-white/5 bg-black/5 hover:bg-black/20'
                    }`}
                >
                  {/* Thumbnail Container */}
                  <div className={`${viewMode === 'grid' ? 'aspect-[4/3] mb-8' : 'w-full md:w-64 aspect-video md:aspect-square'} rounded-[2rem] overflow-hidden shrink-0 bg-neutral-900 relative`}>
                    <img 
                      src={project.thumbnail?.fileUrl || '/api/placeholder/400/400'} 
                      className="w-full h-full object-cover grayscale-[100%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-100"
                      alt={project.title} 
                    />
                    <div className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Globe size={14} style={{ color: theme.primary }} />
                    </div>
                  </div>

                  {/* Metadata Content */}
                  <div className="flex-grow space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                         <span className="px-2 py-0.5 rounded bg-white/5 text-[7px] font-black uppercase tracking-widest opacity-40 border border-white/5">
                            ID_{project.id.slice(0, 4)}
                         </span>
                         <div className="h-px flex-grow bg-white/5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors leading-none">
                          {project.title}
                        </h3>
                        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-10 group-hover:translate-x-0 transition-all duration-500">
                             <ArrowRight size={20} style={{ color: theme.primary }} />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] opacity-40 uppercase font-bold line-clamp-2 italic leading-relaxed tracking-tight">
                      {project.mainDescription}
                    </p>

                    {/* --- TECH STACK (4 NODES) --- */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.techs?.slice(0, 4).map((tech: any, index: number) => (
                        <div key={index} className="px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] border border-white/5 rounded-lg bg-white/5 group-hover:border-primary/20 transition-colors"
                             style={{ color: theme.primary }}>
                          {tech.technology?.name}
                        </div>
                      ))}
                      {project.techs?.length > 4 && (
                        <div className="px-3 py-1.5 text-[8px] font-black uppercase opacity-20 tracking-widest">
                            +{project.techs.length - 4} More_Nodes
                        </div>
                      )}
                    </div>

                    <div className="flex gap-8 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.3em]">
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] opacity-20">Traffic</span>
                        <span className="flex items-center gap-2"><Eye size={12} style={{ color: theme.primary }} /> {project.viewCount}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] opacity-20">Deployment</span>
                        <span className="flex items-center gap-2"><Clock size={12} /> {new Date(project.createdAt || "").getFullYear()}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] opacity-20">Status</span>
                        <span className="flex items-center gap-2"><Terminal size={12} className="opacity-40" /> {project.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* --- NO RESULTS FOUND --- */
            <div className="py-40 flex flex-col items-center justify-center text-center space-y-8 rounded-[4rem] border-2 border-dashed border-white/5">
              <div className="relative">
                 <AlertCircle size={80} className="opacity-10" />
                 <Search size={30} className="absolute inset-0 m-auto opacity-40 animate-pulse" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Null_Registry_Result</h3>
                <p className="text-xs opacity-40 uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                  The search query <span style={{ color: theme.primary }}>"{searchTerm}"</span> did not return any valid project nodes.
                </p>
              </div>
              <button 
                onClick={() => {setSearchTerm(''); setActiveStatus('all');}} 
                className="px-8 py-4 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all"
              >
                Clear_Registry_Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default ProjectsRegistry;