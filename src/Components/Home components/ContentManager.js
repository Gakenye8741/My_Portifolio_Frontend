import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { Cpu, Terminal, ArrowRight, Github, Linkedin, Instagram, Database, Zap, Activity, ShieldCheck, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
// Import all your images from the directory assets pool
import logoMain from "../../../public/LOGO.png";
import logo1 from "../../../public/logo1.jpg";
import logo2 from "../../../public/logo2.jpg";
import logo3 from "../../../public/logo3.jpg";
import logo4 from "../../../public/logo4.jpg";
import { RiWhatsappFill } from 'react-icons/ri';
const Hero = () => {
    const { theme } = useTheme();
    const [currentSlide, setCurrentSlide] = useState(0);
    // Carousel image directory array list
    const portfolioImages = [logoMain, logo1, logo2, logo3, logo4];
    const socials = [
        { icon: _jsx(Github, { size: 20 }), link: "https://github.com/Gakenye8741", label: "GitHub" },
        { icon: _jsx(Linkedin, { size: 20 }), link: "https://www.linkedin.com/in/gakenye-ndiritu-9757923a8/", label: "LinkedIn" },
        { icon: _jsx(RiWhatsappFill, { size: 20 }), link: "https://wa.link/f3ajog", label: "Whatsapp" },
        { icon: _jsx(Instagram, { size: 20 }), link: "https://www.instagram.com/_code.d_by_gakenye_/", label: "Instagram" },
    ];
    // Professional real-world production metrics for clients
    const systemStats = [
        { label: "System Availability", value: "99.9% Uptime", icon: _jsx(Activity, { size: 14 }) },
        { label: "Data Integrity", value: "Fully Encrypted", icon: _jsx(ShieldCheck, { size: 14 }) },
        { label: "Server Response", value: "< 100ms Latency", icon: _jsx(Zap, { size: 14 }) },
    ];
    // Carousel Next/Prev slide controls logic helpers
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === portfolioImages.length - 1 ? 0 : prev + 1));
    };
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? portfolioImages.length - 1 : prev - 1));
    };
    // Auto-play interval slider behavior
    useEffect(() => {
        const slideTimer = setInterval(nextSlide, 4000);
        return () => clearInterval(slideTimer);
    }, []);
    return (_jsxs("div", { className: "min-h-screen transition-colors duration-500 flex flex-col justify-start relative overflow-hidden pt-32 lg:pt-24", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: [_jsx("style", { children: `
        @keyframes subtleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-subtle-float {
          animation: subtleFloat 6s ease-in-out infinite;
        }
      ` }), _jsx("div", { className: "absolute inset-0 opacity-[0.03] pointer-events-none", style: { backgroundImage: `radial-gradient(${theme.primary} 1.5px, transparent 1.5px)`, backgroundSize: '40px 40px' } }), _jsx("div", { className: "absolute -top-24 -right-24 w-96 h-96 blur-[120px] opacity-[0.08] rounded-full", style: { backgroundColor: theme.primary } }), _jsxs("div", { className: "hidden lg:flex flex-col items-center gap-6 absolute left-8 z-20", children: [_jsx("div", { className: "h-20 w-[1px] opacity-20", style: { backgroundColor: theme.primary } }), socials.map((soc, i) => (_jsx("a", { href: soc.link, className: "transition-transform hover:-translate-y-1 opacity-40 hover:opacity-100", style: { color: theme["base-content"] }, children: soc.icon }, i))), _jsx("div", { className: "h-20 w-[1px] opacity-20", style: { backgroundColor: theme.primary } })] }), _jsxs("main", { className: "relative z-10 px-6 lg:px-24 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center", children: [_jsx("div", { className: "lg:col-span-5 order-1 lg:order-2 flex justify-center", children: _jsxs("div", { className: "relative group w-full max-w-[320px] lg:max-w-none animate-subtle-float", children: [_jsx("div", { className: "absolute -inset-4 border-2 border-dashed opacity-15 rounded-[3rem] lg:rounded-[3.5rem] animate-[spin_40s_linear_infinite]", style: { borderColor: theme.primary } }), _jsxs("div", { className: "w-full aspect-square lg:h-[420px] lg:aspect-auto rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl relative z-10 bg-black/10", children: [_jsx("div", { className: "w-full h-full relative", children: portfolioImages.map((imgSrc, index) => (_jsx("div", { className: `absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 scale-100 z-10" : "opacity-0 scale-95 z-0"}`, children: _jsx("img", { src: imgSrc, alt: `Display image showcase ${index + 1}`, className: "w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-105 transition-all duration-700 ease-in-out" }) }, index))) }), _jsx("button", { onClick: prevSlide, className: "absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl backdrop-blur-md bg-black/40 border border-white/10 text-white transition-all opacity-0 group-hover:opacity-100 duration-300 active:scale-90", children: _jsx(ChevronLeft, { size: 18 }) }), _jsx("button", { onClick: nextSlide, className: "absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-xl backdrop-blur-md bg-black/40 border border-white/10 text-white transition-all opacity-0 group-hover:opacity-100 duration-300 active:scale-90", children: _jsx(ChevronRight, { size: 18 }) }), _jsx("div", { className: "absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-black/50 backdrop-blur-md py-2 px-3 rounded-full border border-white/10", children: portfolioImages.map((_, index) => (_jsx("button", { onClick: () => setCurrentSlide(index), className: `h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? "w-5" : "w-1.5"}`, style: { backgroundColor: index === currentSlide ? theme.primary : "rgba(255,255,255,0.3)" } }, index))) })] }), _jsxs("div", { className: "hidden md:flex absolute -bottom-6 -right-6 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl flex-col gap-3 w-56 z-20", style: { backgroundColor: `${theme["base-100"]}f2` }, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-[9px] font-black uppercase tracking-widest opacity-50", children: "Live Analytics" }), _jsx("div", { className: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" })] }), systemStats.map((stat, i) => (_jsxs("div", { className: "flex justify-between items-center text-[11px] font-semibold", children: [_jsxs("span", { className: "flex items-center gap-1.5 opacity-70", children: [stat.icon, " ", stat.label] }), _jsx("span", { className: "font-bold", style: { color: theme.primary }, children: stat.value })] }, i)))] })] }) }), _jsxs("div", { className: "lg:col-span-7 order-2 lg:order-1 space-y-6 text-center lg:text-left", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h1", { className: "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black uppercase italic tracking-tighter leading-tight", children: ["BUILDING ", _jsx("span", { style: { color: theme.primary }, children: "WEB, MOBILE" }), " ", _jsx("br", { className: "hidden lg:block" }), "& SMART SYSTEMS."] }), _jsx("p", { className: "text-base md:text-lg opacity-70 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal", children: "I am a certified software engineer based in Kenya. I build complete web and mobile applications from start to finish. I create beautiful, responsive user screens as well as strong hidden servers and databases that store information safely. Beyond standard apps, I integrate advanced blockchain features for decentralized security and smart AI tools to automate complex tasks, making sure your systems run fast and work smoothly on all devices." })] }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-dashed border-opacity-20", style: { borderColor: theme["base-content"] }, children: [
                                    { l: "Full-Stack Build", v: "Web & Mobile Apps", icon: _jsx(Layers, { size: 12 }) },
                                    { l: "Decentralization", v: "Blockchain Tech", icon: _jsx(Cpu, { size: 12 }) },
                                    { l: "Smart Automation", v: "AI Integrations", icon: _jsx(Terminal, { size: 12 }) },
                                    { l: "Database Setup", v: "Safe PostgreSQL", icon: _jsx(Database, { size: 12 }) }
                                ].map((item, i) => (_jsxs("div", { className: "flex flex-col items-center lg:items-start group", children: [_jsxs("span", { className: "flex items-center gap-1 text-[8px] font-black uppercase tracking-widest opacity-50 mb-1", style: { color: theme.primary }, children: [item.icon, " ", item.l] }), _jsx("span", { className: "text-[10px] font-bold uppercase italic leading-none", children: item.v })] }, i))) }), _jsxs("div", { className: "flex flex-col sm:flex-row items-center gap-6", children: [_jsxs("a", { href: "/projects", className: "w-full sm:w-auto px-10 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 shadow-xl flex items-center justify-center gap-3 active:scale-95 text-center", style: { backgroundColor: theme.primary, color: theme["base-100"] }, children: ["Explore My Projects ", _jsx(ArrowRight, { size: 16 })] }), _jsx("div", { className: "flex lg:hidden items-center gap-8 py-2", children: socials.map((soc, i) => (_jsx("a", { href: soc.link, className: "opacity-50 hover:opacity-100 transition-opacity", style: { color: theme["base-content"] }, children: soc.icon }, i))) }), _jsxs("div", { className: "hidden xl:flex items-center gap-3 font-mono text-[10px] opacity-40", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }), _jsx("span", { children: "development system online" })] })] })] })] })] }));
};
export default Hero;
