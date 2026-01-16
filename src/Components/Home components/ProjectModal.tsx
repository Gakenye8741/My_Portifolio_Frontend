import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../ThemeContext';
import { useGetProjectDetailsQuery } from '../../Features/Apis/Projects.Api';
import { Navbar } from '../Navbar';
import { 
  Github, Globe, Calendar, Eye, 
  ChevronRight, ChevronLeft, Terminal, ExternalLink,
  Layers, Home, Share2, Hash, AlertCircle, Activity,
  Cpu,
  ArrowRight
} from 'lucide-react';

interface ProjectLink { id: string; label: string; url: string; type: string; }
interface ProjectSection { 
  id: string; 
  sectionTitle: string; 
  explanation: string; 
  order: number; 
  media?: { fileUrl: string }; 
}
interface ProjectTimeline { id: string; title: string; description: string; date: string; }

interface DetailedProject {
  id: string;
  title: string;
  slug: string;
  mainDescription: string;
  status: string;
  viewCount: number;
  createdAt: string;
  thumbnail?: { fileUrl: string };
  links: ProjectLink[];
  techs: { technology: { name: string } }[]; // Added tech interface
  sections: ProjectSection[];
  timeline: ProjectTimeline[];
}

const ProjectDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [activeSlide, setActiveSlide] = useState(0);
  
  const { data, isLoading, error } = useGetProjectDetailsQuery(id || "");
  const project = data as DetailedProject;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % (project?.sections?.length || 1));
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + (project?.sections?.length || 1)) % (project?.sections?.length || 1));

  // --- BRANDED LOADING STATE (Gakenye) ---
  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-8" style={{ backgroundColor: theme["base-100"] }}>
      <div className="relative">
        <div className="w-24 h-24 border-2 border-dashed rounded-full animate-[spin_4s_linear_infinite] opacity-20" style={{ borderColor: theme.primary }} />
        <div className="absolute inset-2 border-t-2 rounded-full animate-spin" style={{ borderColor: theme.primary }} />
        <div className="absolute inset-0 m-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-xl font-black uppercase tracking-[0.5em] animate-pulse">Gakenye</h2>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.3em]">Decoding_Project_Data...</p>
      </div>
    </div>
  );

  if (error || !project) return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-6" style={{ backgroundColor: theme["base-100"] }}>
      <AlertCircle size={48} className="text-red-500 mb-6 opacity-40 animate-bounce" />
      <h2 className="text-2xl font-black uppercase italic tracking-tighter" style={{ color: theme["base-content"] }}>Err: 404 // Node_Not_Found</h2>
      <p className="text-[10px] opacity-40 uppercase tracking-widest mt-2">The requested protocol could not be established.</p>
      <button onClick={() => navigate('/registry')} className="mt-8 px-10 py-4 rounded-full text-[10px] font-black uppercase border transition-all hover:bg-white hover:text-black" style={{borderColor: theme.primary}}>
        Return_to_Archive
      </button>
    </div>
  );

  return (
    <main className="min-h-screen transition-all duration-700 pt-[64px]" 
          style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
      
      <Navbar /> 

      {/* --- STICKY HUD BREADCRUMB --- */}
      <nav className="sticky top-0 w-full z-[80] px-6 md:px-12 py-4 backdrop-blur-xl border-b border-white/5 bg-black/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-white/40">
            <Link to="/registry" className="hover:text-primary transition-colors flex items-center gap-2"><Layers size={12}/> Archive</Link>
            <ChevronRight size={10} />
            <span style={{ color: theme.primary }} className="truncate max-w-[150px] italic">{project.title}</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-bold uppercase tracking-widest text-white/40">
                <Activity size={10} className="text-green-500" /> System_Online
             </div>
             <Share2 size={14} className="text-white/40 cursor-pointer hover:text-white transition-colors" />
          </div>
        </div>
      </nav>

      {/* --- CINEMATIC HERO --- */}
      <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden bg-black">
        <img src={project.thumbnail?.fileUrl} className="w-full h-full object-cover opacity-50 scale-105 animate-slow-zoom" alt="Hero" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-24 z-10">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center gap-3 text-primary text-[10px] font-black uppercase tracking-[0.4em]">
              <Hash size={14} /> ID_{project.id.slice(0, 8)}
            </div>
            <h1 className="text-5xl md:text-9xl font-black uppercase italic text-white tracking-tighter leading-none">
              {project.title}
            </h1>
          </div>
        </div>
      </div>

      {/* --- CORE ARCHITECTURE --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-20 -mt-20 relative z-20 pb-32">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-24">
          
          {/* LEFT COLUMN: VISUALS & LOGS */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* --- MEDIA CONSOLE --- */}
            <div className="relative group overflow-hidden rounded-[3rem] aspect-video bg-neutral-900 border border-white/5 shadow-2xl">
              <div className="absolute inset-0 flex transition-transform duration-1000 cubic-bezier(0.23, 1, 0.32, 1)" 
                   style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                {project.sections.map((section, idx) => (
                  <img key={idx} src={section.media?.fileUrl} className="w-full h-full object-cover shrink-0 grayscale-[40%] group-hover:grayscale-0 transition-all duration-1000" alt={`Slide ${idx}`} />
                ))}
              </div>
              
              <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={prevSlide} className="p-4 rounded-2xl bg-black/60 text-white backdrop-blur-md hover:bg-primary transition-all">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextSlide} className="p-4 rounded-2xl bg-black/60 text-white backdrop-blur-md hover:bg-primary transition-all">
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {project.sections.map((_, idx) => (
                  <button key={idx} onClick={() => setActiveSlide(idx)}
                    className={`h-1 transition-all duration-500 rounded-full ${activeSlide === idx ? "w-12" : "w-4 bg-white/20"}`} 
                    style={{ backgroundColor: activeSlide === idx ? theme.primary : "" }} />
                ))}
              </div>
            </div>

            {/* ABSTRACT / DESCRIPTION */}
            <section className="p-10 md:p-16 rounded-[3rem] border backdrop-blur-3xl relative overflow-hidden"
                     style={{ backgroundColor: `${theme["base-content"]}03`, borderColor: `${theme["base-content"]}10` }}>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                 <Terminal size={120} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.5em] mb-8 opacity-30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.primary }} />
                Executive_Summary.md
              </div>
              <p className="text-2xl md:text-4xl font-black uppercase italic leading-[1.1] tracking-tighter" style={{ color: theme.primary }}>
                "{project.mainDescription}"
              </p>
            </section>

            {/* SECTION BREAKDOWN */}
            <div className="space-y-32 pt-10">
              {project.sections.map((section) => (
                <div key={section.id} className="group space-y-8">
                  <div className="flex items-center gap-6">
                    <span className="text-[11px] font-black opacity-20 tracking-widest uppercase">Sequence_0{section.order}</span>
                    <div className="h-[1px] flex-grow bg-gradient-to-r from-white/10 to-transparent" />
                  </div>
                  <h4 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter transition-all duration-500 group-hover:text-primary">
                    {section.sectionTitle}
                  </h4>
                  <p className="text-base md:text-xl opacity-50 leading-relaxed max-w-3xl font-medium">
                    {section.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: SYSTEM SPECS */}
          <div className="lg:col-span-4 space-y-10">
            <div className="lg:sticky lg:top-[120px] space-y-10">
              
              {/* STACK ANALYTICS (All Technologies) */}
              <div className="p-8 rounded-[2.5rem] border border-white/10 bg-black/20 backdrop-blur-md">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 opacity-30 flex items-center gap-2">
                  <Cpu size={14} style={{ color: theme.primary }} /> Tech_Stack_Manifest
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techs?.map((tech, idx) => (
                    <div key={idx} className="px-3 py-1.5 text-[9px] font-black uppercase border border-white/5 bg-white/5 rounded-lg" style={{ color: theme.primary }}>
                      {tech.technology?.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION CENTER */}
              <div className="p-8 rounded-[2.5rem] border border-white/10 bg-black/20">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 opacity-30">Active_Gateways</h3>
                <div className="space-y-4">
                  {project.links.map((link) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer"
                       className="group/link flex items-center justify-between p-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:-translate-y-1 active:scale-95 shadow-2xl"
                       style={{ backgroundColor: theme.primary, color: theme["base-100"] }}>
                      <span className="flex items-center gap-3">
                        {link.label.toLowerCase().includes('github') ? <Github size={20} /> : <Globe size={20} />}
                        {link.label}
                      </span>
                      <ArrowRight size={18} className="group-hover/link:translate-x-2 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>

              {/* VERSION CONTROL (TIMELINE) */}
              <div className="p-8 rounded-[2.5rem] border border-white/10 bg-black/20">
                <h3 className="text-[10px] font-black uppercase tracking-widest mb-10 opacity-30 flex items-center gap-2">
                  <Activity size={14} style={{ color: theme.primary }} /> Version_History
                </h3>
                <div className="space-y-12 relative">
                  <div className="absolute left-[9px] top-1 bottom-1 w-[2px] opacity-10" style={{backgroundColor: theme.primary}} />
                  {project.timeline.map((event) => (
                    <div key={event.id} className="relative pl-12 group/item">
                      <div className="absolute left-0 top-1 w-5 h-5 rounded-full border-4 bg-black transition-all group-hover/item:scale-125 group-hover/item:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" 
                           style={{ borderColor: theme.primary }} />
                      <div className="space-y-2">
                        <span className="text-[8px] font-black opacity-30 uppercase tracking-widest">{new Date(event.date || "").toLocaleDateString('en-GB')}</span>
                        <h4 className="text-[12px] font-black uppercase group-hover/item:text-primary transition-colors leading-tight">{event.title}</h4>
                        <p className="text-[11px] opacity-40 italic font-medium">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slow-zoom { 0% { transform: scale(1); } 100% { transform: scale(1.1); } }
        .animate-slow-zoom { animation: slow-zoom 15s infinite alternate ease-in-out; }
        .text-outline { -webkit-text-stroke: 1px rgba(255,255,255,0.2); color: transparent; }
      `}</style>
    </main>
  );
};

export default ProjectDetailsPage;