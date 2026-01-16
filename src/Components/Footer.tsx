import React from "react";
import { Link } from "react-router-dom";
import { 
  Home, 
  Code2, 
  Briefcase, 
  Mail, 
  Github, 
  Linkedin, 
  Globe, 
  Terminal,
  Cpu,
  ChevronUp
} from "lucide-react";
import { useTheme } from "../ThemeContext";

const menuItems = [
  { name: "Home", path: "/", id: "01" },
  { name: "Projects", path: "/projects", id: "02" },
  { name: "Stack", path: "/tech", id: "03" },
  { name: "Contact", path: "/contact", id: "04" },
];

const Footer: React.FC = () => {
  const { theme } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer 
      className="relative overflow-hidden transition-all duration-500 pt-20 pb-10"
      style={{ 
        backgroundColor: theme["base-100"], 
        borderTop: `1px solid ${theme["base-300"]}44` 
      }}
    >
      {/* Cinematic Background Glow */}
      <div 
        className="absolute top-0 right-[-10%] w-[500px] h-[500px] blur-[150px] opacity-[0.03] pointer-events-none"
        style={{ backgroundColor: theme.primary, borderRadius: '100%' }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Identity */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-2 h-8" style={{ backgroundColor: theme.primary }} />
              <span className="text-2xl font-black uppercase italic tracking-tighter">
                GAKENYE <span style={{ color: theme.primary }}>NDIRITU</span>
              </span>
            </Link>
            <p className="text-sm font-medium leading-relaxed max-w-sm opacity-50" style={{ color: theme["base-content"] }}>
              Full-stack developer specializing in building high-performance digital engines and immersive user experiences. Let's build the future of the web.
            </p>
            <div className="flex items-center gap-4 pt-2">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Current Status</span>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.success }} />
                        <span className="text-xs font-mono font-bold uppercase">Open for collaborations</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Sitemaps / Quick Links */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">Directory</h3>
            <div className="grid grid-cols-1 gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="group flex items-center gap-3 text-sm transition-all hover:translate-x-1"
                  style={{ color: theme["base-content"] }}
                >
                  <span className="text-[10px] font-mono opacity-20 group-hover:opacity-100" style={{ color: theme.primary }}>{item.id}</span>
                  <span className="font-bold opacity-60 group-hover:opacity-100 uppercase tracking-widest text-[11px]">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Social / Connect */}
          <div className="space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30">Connect Hub</h3>
            <div className="flex flex-col gap-4">
              <a href="mailto:your-email@example.com" className="flex items-center gap-3 group">
                <div className="p-2 rounded-lg transition-colors" style={{ backgroundColor: `${theme.primary}11` }}>
                    <Mail size={16} style={{ color: theme.primary }} />
                </div>
                <span className="text-sm font-mono font-bold opacity-70 group-hover:opacity-100 transition-opacity">Contact@Gakenye</span>
              </a>
              <div className="flex gap-3">
                {[
                    { icon: <Github size={18} />, url: "#" },
                    { icon: <Linkedin size={18} />, url: "#" },
                    { icon: <Globe size={18} />, url: "#" }
                ].map((social, i) => (
                    <a 
                        key={i} 
                        href={social.url} 
                        className="p-3 rounded-xl border transition-all hover:-translate-y-1 active:scale-90"
                        style={{ 
                            borderColor: `${theme["base-300"]}44`, 
                            backgroundColor: `${theme["base-300"]}08`,
                            color: theme["base-content"]
                        }}
                    >
                        {social.icon}
                    </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div 
          className="pt-10 flex flex-col md:flex-row justify-between items-center gap-6 border-t"
          style={{ borderColor: `${theme["base-300"]}22` }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <Terminal size={14} className="opacity-20" />
                <span className="text-[9px] font-mono opacity-30 uppercase tracking-[0.1em]">Build: Stable_v2.0.4</span>
            </div>
            <div className="flex items-center gap-2">
                <Cpu size={14} className="opacity-20" />
                <span className="text-[9px] font-mono opacity-30 uppercase tracking-[0.1em]">Stack: React // Tailwind</span>
            </div>
          </div>

          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-3 px-4 py-2 rounded-full border transition-all hover:brightness-125"
            style={{ borderColor: `${theme["base-300"]}44`, backgroundColor: `${theme["base-300"]}05` }}
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100 transition-opacity">Back to Top</span>
            <ChevronUp size={16} style={{ color: theme.primary }} className="group-hover:-translate-y-1 transition-transform" />
          </button>
          
          <div className="text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] order-last md:order-none">
            &copy; {new Date().getFullYear()} Gakenye Ndiritu.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;