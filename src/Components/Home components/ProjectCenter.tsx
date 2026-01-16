import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import { useGetProjectsQuery } from '../../Features/Apis/Projects.Api';
import { 
  Eye, ArrowUpRight, Clock, Search, Terminal, 
  Zap, Layers, ChevronRight, Hash, Cpu, AlertCircle 
} from 'lucide-react';

const ProjectCenter = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { data: projects, isLoading } = useGetProjectsQuery();
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Filtering Logic
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(project => 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.techs?.some(t => t.technology?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, projects]);

  // Limit to 3 for the "Featured" display
  const displayProjects = filteredProjects.slice(0, 3);

  // --- BRANDED LOADING STATE ---
  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-8" style={{ backgroundColor: theme["base-100"] }}>
      <div className="relative">
        {/* Outer Spinner */}
        <div className="w-24 h-24 border-2 border-dashed rounded-full animate-[spin_4s_linear_infinite] opacity-20" style={{ borderColor: theme.primary }} />
        {/* Inner Spinner */}
        <div className="absolute inset-2 border-t-2 rounded-full animate-spin" style={{ borderColor: theme.primary }} />
        {/* Center Pulsing Dot */}
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black uppercase tracking-[0.5em] animate-pulse">Gakenye</h2>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Syncing_Project_Nodes...</p>
      </div>
    </div>
  );

  return (
    <section className="py-16 md:py-32 transition-all duration-500" style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-opacity-10 text-[10px] font-black uppercase tracking-widest"
                 style={{ borderColor: theme.primary, color: theme.primary }}>
              <Terminal size={14} className="animate-pulse" /> 
              Featured_Nodes_v2.0
            </div>
            <h2 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.8]">
              SELECTED <br /> <span style={{ color: theme.primary }}>WORKS.</span>
            </h2>
          </div>

          {/* Search Interface with Result Counter */}
          <div className="relative w-full lg:max-w-md group">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Search_Registry</span>
              {searchTerm && (
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: theme.primary }}>
                  {filteredProjects.length} {filteredProjects.length === 1 ? 'Project' : 'Projects'} Found
                </span>
              )}
            </div>
            <div className="relative">
              <Search size={20} className="absolute left-0 top-1/2 -translate-y-1/2 opacity-20" />
              <input 
                type="text"
                placeholder="FILTER_BY_NAME_OR_TECH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b-2 py-5 pl-10 pr-10 text-xs font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-opacity-100 transition-all"
                style={{ borderColor: `${theme["base-content"]}15` }}
              />
            </div>
          </div>
        </div>

        {/* --- DYNAMIC CONTENT AREA --- */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14">
            {displayProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="group relative flex flex-col rounded-[3rem] overflow-hidden border border-opacity-5 cursor-pointer transition-all duration-700 hover:-translate-y-3 shadow-2xl"
                style={{ backgroundColor: `${theme["base-content"]}02`, borderColor: `${theme["base-content"]}10` }}
              >
                {/* IMAGE SECTION */}
                <div className="relative aspect-[16/11] overflow-hidden bg-black">
                  <img 
                    src={project.thumbnail?.fileUrl || '/api/placeholder/800/500'} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                    alt={project.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
                  
                  <div className="absolute top-6 left-6">
                    <div className="px-3 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
                      <span className="text-[8px] font-black uppercase tracking-widest text-white">{project.status}</span>
                    </div>
                  </div>
                </div>

                <div className="p-10 space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 opacity-30 text-[8px] font-black uppercase tracking-[0.2em]">
                      <Hash size={10} /> {project.id.slice(0, 8)}
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter group-hover:text-primary transition-colors leading-none">
                      {project.title}
                    </h3>
                  </div>

                  <p className="text-xs opacity-40 italic line-clamp-2 uppercase tracking-tighter leading-relaxed">
                    {project.mainDescription}
                  </p>

                  {/* TECH TAGS - UPDATED TO SHOW ONLY FOUR */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {project.techs?.slice(0, 4).map((tech: any, index: number) => (
                      <div 
                        key={index} 
                        className="px-2 py-1 text-[7px] font-black uppercase tracking-widest border rounded-md"
                        style={{ color: theme.primary, borderColor: `${theme.primary}30` }}
                      >
                        {tech.technology?.name}
                      </div>
                    ))}
                    {project.techs?.length > 4 && (
                      <span className="text-[7px] font-black opacity-30 mt-1 uppercase tracking-widest">
                        +{project.techs.length - 4} More_Nodes
                      </span>
                    )}
                  </div>

                  {/* FOOTER */}
                  <div className="pt-6 border-t border-opacity-5 flex items-center justify-between" style={{ borderColor: theme["base-content"] }}>
                    <div className="flex gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black opacity-20 uppercase tracking-widest">Views</span>
                        <span className="text-[10px] font-black flex items-center gap-1.5"><Eye size={12} style={{ color: theme.primary }} /> {project.viewCount}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[7px] font-black opacity-20 uppercase tracking-widest">Rel</span>
                        <span className="text-[10px] font-black flex items-center gap-1.5"><Clock size={12} /> {new Date(project.createdAt).getFullYear()}</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl border border-opacity-10 group-hover:rotate-45 transition-all duration-500" style={{ borderColor: theme["base-content"] }}>
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* --- EMPTY STATE / NO RESULTS FOUND --- */
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 rounded-[3rem] border-2 border-dashed border-opacity-5" style={{ borderColor: theme["base-content"] }}>
            <div className="p-6 rounded-full bg-opacity-5" style={{ backgroundColor: theme.primary }}>
              <AlertCircle size={48} style={{ color: theme.primary }} className="opacity-40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Null_Pointer_Exception</h3>
              <p className="text-xs opacity-40 uppercase tracking-widest max-w-xs mx-auto">
                No project nodes matching <span style={{ color: theme.primary }}>"{searchTerm}"</span> were found in the current sector.
              </p>
            </div>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-[10px] font-black uppercase tracking-[0.2em] border-b-2 pb-1 transition-all hover:opacity-100 opacity-60"
              style={{ borderColor: theme.primary }}
            >
              Clear_Filter
            </button>
          </div>
        )}

        {/* --- FOOTER CTA --- */}
        {filteredProjects.length > 0 && (
          <div className="mt-24 flex justify-center">
            <button 
              onClick={() => navigate('/registry')}
              className="group relative px-12 py-6 overflow-hidden rounded-full border transition-all duration-500 hover:pr-16"
              style={{ borderColor: `${theme["base-content"]}20`, color: theme["base-content"] }}
            >
              <span className="relative flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.5em]">
                View Full Registry
                <div className="p-2 rounded-full" style={{ backgroundColor: theme.primary, color: theme["base-100"] }}>
                  <Layers size={16} />
                </div>
              </span>
              <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ color: theme.primary }} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectCenter;