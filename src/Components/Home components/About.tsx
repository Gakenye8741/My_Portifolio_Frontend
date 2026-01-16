import React from 'react';
import { useTheme } from '../../ThemeContext';
import { 
  User, Target, MessageSquare, ShieldCheck, 
  MapPin, GraduationCap, Award, ArrowUpRight,
  Sparkles, Zap, Terminal, Search, BookOpen,
  Code2
} from 'lucide-react';

const About = () => {
  const { theme } = useTheme();

  return (
    <section 
      id="about"
      className="py-16 lg:py-20 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
    >
      {/* Background Accent Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] opacity-10" style={{ backgroundColor: theme.primary }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-24 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="mb-10 lg:mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] mb-4"
               style={{ borderColor: `${theme.primary}33`, color: theme.primary }}>
            <Terminal size={10} className="animate-pulse" />
            System.Profile // Laikipia_Node
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-tight">
            SOFTWARE ENGINEER <br />
            <span style={{ color: theme.primary }}>ARCHITECTING IMPACT.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* --- LEFT: NARRATIVE (With Animation) --- */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
            <div className="space-y-4 text-sm md:text-base opacity-80 leading-relaxed max-w-2xl">
              <p className="font-bold text-lg flex items-center gap-2" style={{ color: theme.primary }}>
                <Code2 size={20} /> Computer Science @ Laikipia University
              </p>
              <p>
                Based in the highlands of <span className="font-bold italic">Nyahururu, Kenya</span>, I am a <strong>Software Engineer</strong> and final-year student at <strong>Laikipia University</strong>. I transform complex logic into scalable products, bridging the gap between academic theory and industry-standard engineering.
              </p>
              
              {/* Feature Grid with Hover Effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { icon: <Target size={14}/>, text: "Scalable App Design" },
                  { icon: <MessageSquare size={14}/>, text: "Global Collaboration" },
                  { icon: <Zap size={14}/>, text: "Full-Stack Architectures" },
                  { icon: <Search size={14}/>, text: "Clean & Maintainable Logic" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight hover:translate-x-2 hover:text-primary transition-all duration-300 cursor-default">
                    <span style={{ color: theme.primary }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Certification Cards */}
            <div className="space-y-4 pt-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Verified Credentials</h4>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-opacity-20 transition-all hover:border-solid hover:scale-105 hover:bg-opacity-10 duration-300" 
                     style={{ borderColor: `${theme.primary}44`, backgroundColor: `${theme.primary}05` }}>
                   <Award size={20} style={{ color: theme.primary }} />
                   <div>
                     <p className="text-[10px] font-black uppercase">Teach2Give</p>
                     <p className="text-[9px] opacity-60">Software Development Certificate</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-opacity-20 transition-all hover:border-solid hover:scale-105 hover:bg-opacity-10 duration-300" 
                     style={{ borderColor: `${theme.primary}44`, backgroundColor: `${theme.primary}05` }}>
                   <Award size={20} style={{ color: theme.primary }} />
                   <div>
                     <p className="text-[10px] font-black uppercase">SoloLearn</p>
                     <p className="text-[9px] opacity-60">Basics of Web Dev</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: DATA SHEET (With Entrance Animation) --- */}
          <div className="lg:col-span-5 animate-in fade-in zoom-in-95 duration-1000 delay-500">
            <div className="p-8 rounded-[2rem] border relative overflow-hidden group shadow-2xl transition-all duration-500 hover:shadow-primary/10"
                 style={{ borderColor: `${theme.primary}22`, backgroundColor: `${theme.primary}03` }}>
              
              <div className="space-y-6">
                {[
                  { label: "Role", val: "Software Engineer", icon: <Code2 size={14}/> },
                  { label: "Institution", val: "Laikipia University", icon: <BookOpen size={14}/> },
                  { label: "Course", val: "BSc. Computer Science", icon: <GraduationCap size={14}/> },
                  { label: "Current Node", val: "Nyahururu, KE", icon: <MapPin size={14}/> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-opacity-5 pb-3 group/item transition-colors hover:border-opacity-20" style={{ borderColor: theme["base-content"] }}>
                    <div className="flex items-center gap-2 opacity-50 group-hover/item:opacity-100 transition-opacity">
                      <span style={{ color: theme.primary }}>{item.icon}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold italic uppercase">{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Philosophy Quote */}
              <div className="mt-8 p-5 rounded-xl border border-opacity-10 relative group-hover:bg-opacity-10 transition-all duration-500" 
                   style={{ borderColor: theme.primary, backgroundColor: `${theme["base-100"]}ee` }}>
                <Sparkles size={12} className="absolute -top-1.5 -right-1.5 animate-bounce" style={{ color: theme.primary }} />
                <p className="text-[11px] italic font-medium leading-relaxed opacity-70">
                  "Building high-performance solutions from the heart of Laikipia, focused on global scalability and clean architecture."
                </p>
              </div>

              <button className="mt-8 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:gap-4 transition-all duration-300" style={{ color: theme.primary }}>
                View Full Background <ArrowUpRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;