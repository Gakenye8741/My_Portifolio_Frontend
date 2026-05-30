import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { Navbar } from '../Components/Navbar';
import { 
  Github, Linkedin, Instagram, Mail, MapPin, 
  Send, MessageSquare, MailCheck as MailCheckIcon, 
  Phone, Clock, CheckCircle2, 
  PhoneCall
} from 'lucide-react';
import { RiWhatsappFill } from 'react-icons/ri';

import logoMain from "../../public/LOGO.png";

const ContactPage = () => {
  const { theme } = useTheme();

  const phoneNumber = "+254 789 757 457";
  const phoneLink = "tel:+254789757457";

  const socials = [
    { icon: <Github size={18} />, link: "https://github.com/Gakenye8741", label: "GitHub" },
    { icon: <Linkedin size={18} />, link: "https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/", label: "LinkedIn" },
    { icon: <RiWhatsappFill size={18} />, link: "https://wa.link/f3ajog", label: "Whatsapp" },
    { icon: <Instagram size={18} />, link: "https://www.instagram.com/_code.d_by_gakenye_/", label: "Instagram" },
    { icon: <MailCheckIcon size={18} />, link: "mailto:codewithgakenye@gmail.com", label: "Email" },
    { icon: <PhoneCall size={18} />, link: phoneLink, label: "Phone Number" },
  ];

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative overflow-hidden" style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
      <Navbar />

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={logoMain} alt="Logo" className="w-[60vw] h-[60vw] object-contain opacity-[0.03]" />
      </div>

      <motion.div variants={container} initial="hidden" animate="visible" className="max-w-5xl mx-auto relative z-10">
        <motion.header variants={item} className="mb-20">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-6">Let's Connect.</h1>
          <p className="text-lg opacity-60 max-w-2xl italic">
            Whether you have a complex technical challenge, a startup idea, or just want to explore a potential collaboration, I am always open to discussing meaningful projects.
          </p>
        </motion.header>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div variants={item} className="lg:col-span-2 space-y-8">
            {/* Detailed Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <a href={phoneLink} className="p-6 rounded-3xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] transition-all flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10" style={{ color: theme.primary }}><Phone size={20} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase opacity-40">Phone Number</p>
                  <p className="text-sm font-bold">{phoneNumber}</p>
                </div>
              </a>
              <div className="p-6 rounded-3xl border border-white/5 bg-white/[0.03] flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary/10" style={{ color: theme.primary }}><MapPin size={20} /></div>
                <div>
                  <p className="text-[9px] font-black uppercase opacity-40">Based In</p>
                  <p className="text-sm font-bold">Nyahururu, Laikipia</p>
                </div>
              </div>
            </div>

            {/* Availability & Socials */}
            <div className="p-8 rounded-[2rem] border border-white/5 bg-black/20 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-green-500/20 rounded-full"><CheckCircle2 size={16} className="text-green-500" /></div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest">Work Availability</h3>
                  <p className="text-[10px] opacity-60">Currently accepting new freelance projects and collaborations.</p>
                </div>
              </div>

              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-6">Digital Presence</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {socials.map((soc, i) => (
                  <a key={i} href={soc.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-2xl border border-white/5 bg-white/5 hover:border-primary/30 transition-all group">
                    <div style={{ color: theme.primary }}>{soc.icon}</div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{soc.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={item} className="p-10 rounded-[2rem] border border-white/5 bg-white/[0.02] flex flex-col items-center text-center gap-6 justify-center">
            <MessageSquare size={40} style={{ color: theme.primary }} className="opacity-50" />
            <h4 className="text-xl font-black uppercase tracking-tighter">Let's start building</h4>
            <p className="text-xs opacity-60 leading-relaxed">
              I prioritize quick, clear communication. For immediate project inquiries or technical support, WhatsApp is the preferred channel.
            </p>
            <a 
              href="https://wa.link/f3ajog" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
            >
              Start Chat <Send size={12} />
            </a>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
};

export default ContactPage;