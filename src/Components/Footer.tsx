import React from "react";
import { Link } from "react-router-dom";
import { 
  Mail, Github, Linkedin, ChevronUp, ExternalLink, Instagram, MessageCircle 
} from "lucide-react";
import { RiWhatsappFill } from "react-icons/ri";
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
      className="relative overflow-hidden pt-24 pb-12"
      style={{ backgroundColor: theme["base-100"] }}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand Identity */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="inline-block group">
              <span className="text-3xl font-black uppercase italic tracking-tighter">
                GAKENYE <span style={{ color: theme.primary }}>NDIRITU</span>
              </span>
              <div className="h-1 w-20 mt-2 rounded-full transition-all duration-500 group-hover:w-40" style={{ backgroundColor: theme.primary }} />
            </Link>
            <p className="text-sm leading-relaxed max-w-sm opacity-60">
              Full-stack developer focused on building scalable, aesthetic, and user-centric digital experiences. Always crafting, always learning.
            </p>
            
            <div className="flex items-center gap-4 py-4 px-6 rounded-2xl border border-white/5 bg-white/[0.02] w-fit">
              <div className="relative w-2 h-2">
                <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: theme.success }} />
                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: theme.success }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Available for hire</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Navigation</h3>
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="group flex items-center gap-4 text-sm"
                  style={{ color: theme["base-content"] }}
                >
                  <span className="text-[9px] font-mono opacity-30" style={{ color: theme.primary }}>{item.id}</span>
                  <span className="font-bold opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-widest text-[11px]">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact & Expanded Socials */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Social Networks</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Github size={18} />, url: "https://github.com/Gakenye8741", label: "GitHub" },
                { icon: <Linkedin size={18} />, url: "https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/", label: "LinkedIn" },
                { icon: <Instagram size={18} />, url: "https://www.instagram.com/_code.d_by_gakenye_/", label: "Instagram" },
                { icon: <RiWhatsappFill size={18} />, url: "https://wa.link/f3ajog", label: "WhatsApp" },
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-1 flex flex-col items-center gap-2"
                  style={{ color: theme["base-content"] }}
                >
                  {social.icon}
                  <span className="text-[8px] font-bold uppercase tracking-widest opacity-50">{social.label}</span>
                </a>
              ))}
            </div>
            
            <a 
              href="mailto:codewithgakenye@gmail.com" 
              className="flex items-center gap-3 p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all"
            >
              <Mail size={16} style={{ color: theme.primary }} />
              <span className="text-xs font-bold opacity-70 group-hover:opacity-100">Send an Email</span>
            </a>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">
            &copy; {new Date().getFullYear()} Gakenye Ndiritu. Built with passion.
          </p>

          <button 
            onClick={scrollToTop}
            className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/5 hover:border-primary/30 transition-all group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50 group-hover:opacity-100">Back to Top</span>
            <ChevronUp size={16} style={{ color: theme.primary }} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;