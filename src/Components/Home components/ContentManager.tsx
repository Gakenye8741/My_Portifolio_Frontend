import React from 'react';
import { useTheme } from '../../ThemeContext';
import { 
  Globe, Cpu, Terminal, ArrowRight, Sparkles, 
  Github, Linkedin, Twitter, Instagram, 
  Database, Code2, Zap, Activity, ShieldCheck,
  Server, Layers, Box
} from 'lucide-react';
import logo from "../../../public/LOGO.png"

const Hero = () => {
  const { theme } = useTheme();

  const socials = [
    { icon: <Github size={20} />, link: "#", label: "GitHub" },
    { icon: <Linkedin size={20} />, link: "#", label: "LinkedIn" },
    { icon: <Twitter size={20} />, link: "#", label: "Twitter" },
    { icon: <Instagram size={20} />, link: "#", label: "Instagram" },
  ];

  const systemStats = [
    { label: "Uptime", value: "99.9%", icon: <Activity size={14} /> },
    { label: "Security", value: "SSL Encrypted", icon: <ShieldCheck size={14} /> },
    { label: "Latency", value: "< 120ms", icon: <Zap size={14} /> },
  ];

  return (
    <div 
      // REDUCED PADDING: 
      // pt-32 (Mobile) was 52. 
      // lg:pt-20 (Large Screens) was 40.
      className="min-h-screen transition-colors duration-500 flex flex-col justify-start relative overflow-hidden pt-32 lg:pt-24"
      style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
    >
      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(${theme.primary} 1.5px, transparent 1.5px)`, backgroundSize: '40px 40px' }} />
      <div className="absolute -top-24 -right-24 w-96 h-96 blur-[120px] opacity-[0.08] rounded-full"
           style={{ backgroundColor: theme.primary }} />

      {/* DESKTOP SOCIAL SIDEBAR */}
      <div className="hidden lg:flex flex-col items-center gap-6 absolute left-8 z-20">
        <div className="h-20 w-[1px] opacity-20" style={{ backgroundColor: theme.primary }} />
        {socials.map((soc, i) => (
          <a key={i} href={soc.link} className="transition-transform hover:-translate-y-1 opacity-40 hover:opacity-100" style={{ color: theme["base-content"] }}>
            {soc.icon}
          </a>
        ))}
        <div className="h-20 w-[1px] opacity-20" style={{ backgroundColor: theme.primary }} />
      </div>

      {/* Tighter Gap: Reduced lg:gap-16 to lg:gap-10 to bring text and image closer */}
      <main className="relative z-10 px-6 lg:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* --- IMAGE SECTION --- */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-4 border-2 border-dashed opacity-10 rounded-full lg:rounded-[3.5rem] animate-[spin_20s_linear_infinite]" 
                 style={{ borderColor: theme.primary }} />
            
            <div className="w-56 h-56 lg:w-80 lg:h-[400px] rounded-full lg:rounded-[3rem] overflow-hidden border-4 lg:border-none shadow-2xl relative transition-all duration-700 z-10"
                 style={{ borderColor: `${theme.primary}22` }}>
              <img 
                src={logo}
                alt="Gakenye Ndiritu"
                className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
              />
            </div>
            
            {/* System Status Floating Card */}
            <div className="hidden md:flex absolute -bottom-4 -right-4 lg:right-[-5%] backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl flex-col gap-3 w-52 z-20"
                 style={{ backgroundColor: `${theme["base-100"]}ee` }}>
                <div className="flex items-center justify-between">
                   <p className="text-[9px] font-black uppercase tracking-widest opacity-40">System Metrics</p>
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                {systemStats.map((stat, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                    <span className="flex items-center gap-1 opacity-60">{stat.icon} {stat.label}</span>
                    <span style={{ color: theme.primary }}>{stat.value}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* --- TEXT SECTION --- */}
        <div className="lg:col-span-7 order-2 lg:order-1 space-y-6 text-center lg:text-left">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] mx-auto lg:mx-0"
                 style={{ borderColor: `${theme.primary}33`, backgroundColor: `${theme.primary}08`, color: theme.primary }}>
              <Sparkles size={12} className="animate-pulse" />
              Gakenye Ndiritu // Protocol: 001
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase italic tracking-tighter leading-tight">
              BUILDING <span style={{ color: theme.primary }}>DIGITAL</span> <br className="hidden lg:block"/>
              ARCHITECTURES.
            </h1>
            
            <p className="text-base md:text-lg opacity-70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Software Engineer based in Kenya. I build scalable backends and pixel-perfect frontends, bridging the gap between 
              <span className="font-bold underline italic decoration-primary" style={{ textDecorationColor: theme.primary }}> human intent</span> and machine efficiency.
            </p>
          </div>

          {/* Technical Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-dashed border-opacity-20" style={{ borderColor: theme["base-content"] }}>
            {[
              { l: "Expertise", v: "Full-Stack Eng", icon: <Layers size={12}/> },
              { l: "Environment", v: "Node / Next.js", icon: <Box size={12}/> },
              { l: "Database", v: "PostgreSQL", icon: <Database size={12}/> },
              { l: "Deployment", v: "AWS / Docker", icon: <Server size={12}/> }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center lg:items-start group">
                <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest opacity-40 mb-1" style={{ color: theme.primary }}>
                  {item.icon} {item.l}
                </span>
                <span className="text-[10px] font-bold uppercase italic leading-none">{item.v}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button className="w-full sm:w-auto px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3 active:scale-95"
                    style={{ backgroundColor: theme.primary, color: theme["base-100"] }}>
              Launch Archive <ArrowRight size={16} />
            </button>
            
            <div className="flex lg:hidden items-center gap-8 py-2">
               {socials.map((soc, i) => (
                 <a key={i} href={soc.link} className="opacity-50 hover:opacity-100 transition-opacity" style={{ color: theme["base-content"] }}>
                   {soc.icon}
                 </a>
               ))}
            </div>

            <div className="hidden xl:flex items-center gap-3 font-mono text-[10px] opacity-30">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>ready --port 3000</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Hero;