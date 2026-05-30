import React from 'react';
import { useTheme } from '../../ThemeContext';
import { 
  Target, MessageSquare, Award, Terminal, 
  BookOpen, Code2, GraduationCap, MapPin, 
  Rocket, Layers, Coffee, Sparkles, 
  ShieldCheck,
  Cpu,
  Database,
  DatabaseBackup
} from 'lucide-react';

const About = () => {
  const { theme } = useTheme();

  return (
    <section 
      id="about"
      className="py-24 relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
    >
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none" 
           style={{ background: `linear-gradient(to left, ${theme.primary}, transparent)` }} />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-24 relative z-10">
        
        {/* Large Impact Header */}
        <div className="mb-24 text-center lg:text-left animate-in fade-in duration-1000">
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 hover:scale-105 transition-transform"
               style={{ borderColor: `${theme.primary}33`, backgroundColor: `${theme.primary}05` }}>
            <Terminal size={12} style={{ color: theme.primary }} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: theme.primary }}>ABOUT THE ENGINEER</span>
          </div> */}
          <h1 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8">
            Building The <br />
            <span className="stroke-text" style={{ WebkitTextStroke: `2px ${theme.primary}` }}>Future,</span> <br />
            <span style={{ color: theme.primary }}>One Line At A Time.</span>
          </h1>
          <p className="max-w-2xl text-lg md:text-xl opacity-60 leading-relaxed italic">
  Architecting the future through blockchain innovation, intelligent AI integration, and scalable cloud solutions
</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
         {/* Left: Narrative - Expanded & Animated */}
          <div className="lg:col-span-7 space-y-12 animate-in slide-in-from-left-12 duration-1000 delay-300">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold flex items-center gap-3 animate-in fade-in duration-1000 delay-500">
                <Code2 size={28} style={{ color: theme.primary }} /> 
                My Journey & Philosophy
              </h3>
              
              <div className="space-y-6 text-opacity-80 leading-relaxed text-lg animate-in fade-in duration-1000 delay-700">
                <p>
                  As a final-year Computer Science student at <strong>Laikipia University</strong>, my journey is driven by a simple mission: to build technology that feels intuitive, operates flawlessly, and tackles real-world complexities. I don't just write code,I design resilient, end-to-end digital experiences.
                </p>
                <p>
                  Operating from <strong>Nyahururu</strong>, my approach blends deep academic theory with hands-on engineering. I specialize in bridging the gap between traditional web applications and high-level tech stacks, ensuring that every project I touch is secure, efficient, and built for the future.
                </p>
                <p>
                  My recent work extends far beyond standard web development. I am deeply focused on <strong>anchoring data integrity via Blockchain</strong>, integrating <strong>predictive AI systems</strong> to automate decision-making, and architecting <strong>scalable cloud-based solutions</strong> that remain performant under heavy demand.
                </p>
              </div>
            </div>

            {/* Approach Grid - Detailed & Animated */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              {[
                { 
                  icon: <Target size={24}/>, 
                  title: "User-Centric Engineering", 
                  desc: "I design interfaces that put the human experience first, ensuring every interaction is smooth and purposeful." 
                },
                { 
                  icon: <ShieldCheck size={24}/>, 
                  title: "Blockchain & Security", 
                  desc: "Implementing decentralized ledgers and smart contracts to ensure data remains tamper-proof and transparent." 
                },
                { 
                  icon: <Cpu size={24}/>, 
                  title: "AI Integration", 
                  desc: "Building intelligent systems that adapt to user behavior and automate complex problem-solving tasks." 
                },
                { 
                  icon: <DatabaseBackup size={24}/>, 
                  title: "Cloud & Scaling", 
                  desc: "Architecting cloud environments that provide high availability and fast performance as your user base scales." 
                },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="group p-6 rounded-2xl border transition-all hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/10 animate-in zoom-in duration-500" 
                  style={{ 
                    borderColor: `${theme.primary}22`, 
                    backgroundColor: `${theme.primary}03`,
                    transitionDelay: `${i * 150}ms` 
                  }}
                >
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300" style={{ color: theme.primary }}>
                    {item.icon}
                  </div>
                  <p className="font-bold text-xs uppercase tracking-widest mb-2">{item.title}</p>
                  <p className="text-xs opacity-60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Profile & Certs - Enhanced Design */}
          <div className="lg:col-span-5 space-y-10 animate-in slide-in-from-right-12 duration-1000 delay-500">
            
            {/* Quick Profile - Glassmorphism Style */}
            <div className="p-8 rounded-[2rem] border backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-primary/10" 
                 style={{ 
                   borderColor: `${theme.primary}22`, 
                   backgroundColor: `${theme.primary}05` 
                 }}>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8">Technical Profile</h4>
              <div className="space-y-6">
                {[
                  { label: "Role", val: "Software Engineer" },
                  { label: "University", val: "Laikipia University" },
                  { label: "Location", val: "Nyahururu, Kenya" },
                  { label: "Expertise", val: "AI, Cloud, Blockchain" },
                 { label: "Core Focus", val: "Code, Logic & Persistence" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-opacity-5 pb-4 group" style={{ borderColor: theme["base-content"] }}>
                    <span className="text-[10px] font-bold opacity-40 uppercase group-hover:opacity-70 transition-opacity">{item.label}</span>
                    <span className="text-[11px] font-black uppercase italic group-hover:text-primary transition-colors">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Certifications - Modern Card Design */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Certified Milestones</h4>
              {[
                { title: "Teach2Give", sub: "Software Development Program" },
                { title: "SoloLearn", sub: "Web Development Fundamentals" },
              ].map((cert, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-5 p-5 rounded-3xl border border-dashed transition-all duration-300 hover:border-solid hover:bg-primary/5 hover:scale-[1.02] cursor-default" 
                  style={{ borderColor: `${theme.primary}33` }}
                >
                  <div className="p-3 rounded-2xl bg-primary/10" style={{ backgroundColor: `${theme.primary}15` }}>
                    <Award size={22} style={{ color: theme.primary }} />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider">{cert.title}</p>
                    <p className="text-[9px] opacity-60 font-medium uppercase tracking-widest">{cert.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;