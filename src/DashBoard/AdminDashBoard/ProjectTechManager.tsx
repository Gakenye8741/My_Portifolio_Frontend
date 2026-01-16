import React, { useState, useEffect } from 'react';
import { useGetProjectsQuery } from "../../Features/Apis/Projects.Api";
import { useGetTechSkillsQuery } from "../../Features/Apis/Skills.Api"; 
import { 
  useGetProjectTechStackQuery, 
  useSyncProjectTechMutation 
} from "../../Features/Apis/ProjectTech.Api";
import { useTheme } from '../../ThemeContext';
import { 
  Cpu, Check, Search, Filter, 
  Zap, Save, Loader2, Database,
  Terminal, Boxes, XCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProjectTechManager = () => {
  const { theme } = useTheme();
  
  // --- UI STATE ---
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);

  // --- API HOOKS ---
  const { data: projects } = useGetProjectsQuery();
  const { data: allTechs, isLoading: techsLoading } = useGetTechSkillsQuery();
  const { data: currentStack, isFetching: stackFetching } = useGetProjectTechStackQuery(selectedProjectId, { 
    skip: !selectedProjectId 
  });
  
  const [syncTech, { isLoading: isSyncing }] = useSyncProjectTechMutation();

  // Sync local selection when a project is selected
  useEffect(() => {
    // Added safety check for technologies property
    if (currentStack?.technologies) {
      setSelectedTechIds(currentStack.technologies.map((t: any) => t.id));
    } else {
      setSelectedTechIds([]);
    }
  }, [currentStack]);

  // --- HANDLERS ---
  const toggleTech = (techId: string) => {
    setSelectedTechIds(prev => 
      prev.includes(techId) 
        ? prev.filter(id => id !== techId) 
        : [...prev, techId]
    );
  };

  const handleSync = async () => {
    if (!selectedProjectId) return;
    try {
      await syncTech({ 
        projectId: selectedProjectId, 
        body: { technologyIds: selectedTechIds } 
      }).unwrap();
      toast.success("TECH_STACK_SYNCHRONIZED");
    } catch (err) {
      toast.error("TRANSACTION_FAILURE");
    }
  };

  // Added safety fallback to empty array
  const filteredTechs = (allTechs || [])?.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 lg:p-8 transition-all duration-500" style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-10 border-b pb-8" style={{ borderColor: `${theme.primary}15` }}>
          <div className="flex items-center gap-2 mb-3">
             <div className="h-2 w-2 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">System_Integrator / Tech_Stack</span>
          </div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter">
            Stack<span className="font-light not-italic" style={{ color: theme.primary }}>Matrix</span>
          </h1>
        </header>

        {/* --- CONTROL BAR --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[9px] font-black uppercase opacity-30 ml-2">Select_Project_Node</label>
            <div className="relative">
              <Boxes className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={18} />
              <select 
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full bg-transparent border-2 rounded-2xl py-5 pl-14 pr-8 text-xs font-bold uppercase outline-none transition-all"
                style={{ backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}10` }}
              >
                <option value="" className="bg-black text-white">-- MOUNT_PROJECT_IDENTITY --</option>
                {/* Added optional chaining to projects */}
                {projects?.map(p => <option key={p.id} value={p.id} className="bg-black text-white">{p.title}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase opacity-30 ml-2">Search_Library</label>
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={18} />
              <input 
                type="text"
                placeholder="Filter by Name/Category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-2 rounded-2xl py-5 pl-14 pr-8 text-xs font-bold outline-none"
                style={{ backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}10` }}
              />
            </div>
          </div>
        </div>

        {/* --- MAIN INTERFACE --- */}
        {selectedProjectId ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            
            {/* Stats Bar */}
            <div className="flex items-center gap-6 p-4 rounded-2xl border-2 border-dashed" style={{ borderColor: `${theme.primary}20` }}>
               <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-xl">
                  <Terminal size={14} style={{ color: theme.primary }} />
                  <span className="text-[10px] font-black text-white uppercase">{selectedTechIds.length} Nodes_Selected</span>
               </div>
               <div className="h-4 w-[1px] bg-white/10" />
               <p className="text-[9px] font-mono opacity-30 uppercase">Status: Registry_Awaiting_Sync</p>
            </div>

            {/* Tech Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {techsLoading || stackFetching ? (
                <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin opacity-20" size={40} /></div>
              ) : filteredTechs?.map(tech => {
                const isActive = selectedTechIds.includes(tech.id);
                return (
                  <div 
                    key={tech.id}
                    onClick={() => toggleTech(tech.id)}
                    className="group relative cursor-pointer rounded-3xl p-6 border-2 transition-all duration-300 hover:scale-[1.03] active:scale-95"
                    style={{ 
                      backgroundColor: isActive ? `${theme.primary}10` : `${theme["base-content"]}02`,
                      borderColor: isActive ? theme.primary : `${theme["base-content"]}08`
                    }}
                  >
                    <div className="flex flex-col items-center gap-4 text-center">
                       {tech.iconUrl ? (
                         <img src={tech.iconUrl} className={`w-10 h-10 object-contain transition-all ${isActive ? 'grayscale-0' : 'grayscale opacity-30'}`} alt={tech.name} />
                       ) : (
                         <Cpu size={32} className={`transition-all ${isActive ? 'opacity-100' : 'opacity-10'}`} style={{ color: isActive ? theme.primary : 'inherit' }} />
                       )}
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-tight">{tech.name}</p>
                         <p className="text-[7px] font-bold opacity-30 uppercase mt-1 tracking-widest">{tech.category}</p>
                       </div>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className="absolute top-3 right-3 p-1 rounded-full bg-primary shadow-lg" style={{ backgroundColor: theme.primary }}>
                        <Check size={10} color="white" strokeWidth={4} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Float Action Button / Sync */}
            <div className="sticky bottom-10 flex justify-center">
               <button 
                onClick={handleSync}
                disabled={isSyncing}
                className="group px-12 py-6 rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
               >
                 {isSyncing ? <Loader2 className="animate-spin" /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                 Synchronize_Stack_Registry
               </button>
            </div>

          </div>
        ) : (
          <div className="py-48 text-center rounded-[4rem] border-2 border-dashed opacity-10" style={{ borderColor: theme["base-content"] }}>
            <Database size={64} className="mx-auto mb-6" />
            <p className="text-xs font-black uppercase tracking-[0.8em]">Awaiting_Identity_Mount</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTechManager;