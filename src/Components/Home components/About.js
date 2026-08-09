import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../../ThemeContext';
import { Target, Award, Code2, ShieldCheck, Cpu, DatabaseBackup } from 'lucide-react';
const About = () => {
    const { theme } = useTheme();
    return (_jsxs("section", { id: "about", className: "py-24 relative overflow-hidden transition-colors duration-500", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: [_jsx("div", { className: "absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none", style: { background: `linear-gradient(to left, ${theme.primary}, transparent)` } }), _jsxs("div", { className: "max-w-[1400px] mx-auto px-6 lg:px-24 relative z-10", children: [_jsxs("div", { className: "mb-24 text-center lg:text-left animate-in fade-in duration-1000", children: [_jsxs("h1", { className: "text-5xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8", children: ["Building The ", _jsx("br", {}), _jsx("span", { className: "stroke-text", style: { WebkitTextStroke: `2px ${theme.primary}` }, children: "Future," }), " ", _jsx("br", {}), _jsx("span", { style: { color: theme.primary }, children: "One Line At A Time." })] }), _jsx("p", { className: "max-w-2xl text-lg md:text-xl opacity-60 leading-relaxed italic", children: "Architecting the future through blockchain innovation, intelligent AI integration, and scalable cloud solutions" })] }), _jsxs("div", { className: "grid lg:grid-cols-12 gap-16 items-start", children: [_jsxs("div", { className: "lg:col-span-7 space-y-12 animate-in slide-in-from-left-12 duration-1000 delay-300", children: [_jsxs("div", { className: "space-y-8", children: [_jsxs("h3", { className: "text-2xl font-bold flex items-center gap-3 animate-in fade-in duration-1000 delay-500", children: [_jsx(Code2, { size: 28, style: { color: theme.primary } }), "My Journey & Philosophy"] }), _jsxs("div", { className: "space-y-6 text-opacity-80 leading-relaxed text-lg animate-in fade-in duration-1000 delay-700", children: [_jsxs("p", { children: ["As a final-year Computer Science student at ", _jsx("strong", { children: "Laikipia University" }), ", my journey is driven by a simple mission: to build technology that feels intuitive, operates flawlessly, and tackles real-world complexities. I don't just write code,I design resilient, end-to-end digital experiences."] }), _jsxs("p", { children: ["Operating from ", _jsx("strong", { children: "Nyahururu" }), ", my approach blends deep academic theory with hands-on engineering. I specialize in bridging the gap between traditional web applications and high-level tech stacks, ensuring that every project I touch is secure, efficient, and built for the future."] }), _jsxs("p", { children: ["My recent work extends far beyond standard web development. I am deeply focused on ", _jsx("strong", { children: "anchoring data integrity via Blockchain" }), ", integrating ", _jsx("strong", { children: "predictive AI systems" }), " to automate decision-making, and architecting ", _jsx("strong", { children: "scalable cloud-based solutions" }), " that remain performant under heavy demand."] })] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8", children: [
                                            {
                                                icon: _jsx(Target, { size: 24 }),
                                                title: "User-Centric Engineering",
                                                desc: "I design interfaces that put the human experience first, ensuring every interaction is smooth and purposeful."
                                            },
                                            {
                                                icon: _jsx(ShieldCheck, { size: 24 }),
                                                title: "Blockchain & Security",
                                                desc: "Implementing decentralized ledgers and smart contracts to ensure data remains tamper-proof and transparent."
                                            },
                                            {
                                                icon: _jsx(Cpu, { size: 24 }),
                                                title: "AI Integration",
                                                desc: "Building intelligent systems that adapt to user behavior and automate complex problem-solving tasks."
                                            },
                                            {
                                                icon: _jsx(DatabaseBackup, { size: 24 }),
                                                title: "Cloud & Scaling",
                                                desc: "Architecting cloud environments that provide high availability and fast performance as your user base scales."
                                            },
                                        ].map((item, i) => (_jsxs("div", { className: "group p-6 rounded-2xl border transition-all hover:-translate-y-3 hover:shadow-2xl hover:shadow-primary/10 animate-in zoom-in duration-500", style: {
                                                borderColor: `${theme.primary}22`,
                                                backgroundColor: `${theme.primary}03`,
                                                transitionDelay: `${i * 150}ms`
                                            }, children: [_jsx("div", { className: "mb-4 transform group-hover:scale-110 transition-transform duration-300", style: { color: theme.primary }, children: item.icon }), _jsx("p", { className: "font-bold text-xs uppercase tracking-widest mb-2", children: item.title }), _jsx("p", { className: "text-xs opacity-60 leading-relaxed", children: item.desc })] }, i))) })] }), _jsxs("div", { className: "lg:col-span-5 space-y-10 animate-in slide-in-from-right-12 duration-1000 delay-500", children: [_jsxs("div", { className: "p-8 rounded-[2rem] border backdrop-blur-xl shadow-2xl transition-all duration-500 hover:shadow-primary/10", style: {
                                            borderColor: `${theme.primary}22`,
                                            backgroundColor: `${theme.primary}05`
                                        }, children: [_jsx("h4", { className: "text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-8", children: "Technical Profile" }), _jsx("div", { className: "space-y-6", children: [
                                                    { label: "Role", val: "Software Engineer" },
                                                    { label: "University", val: "Laikipia University" },
                                                    { label: "Location", val: "Nyahururu, Kenya" },
                                                    { label: "Expertise", val: "AI, Cloud, Blockchain" },
                                                    { label: "Core Focus", val: "Code, Logic & Persistence" },
                                                ].map((item, i) => (_jsxs("div", { className: "flex justify-between border-b border-opacity-5 pb-4 group", style: { borderColor: theme["base-content"] }, children: [_jsx("span", { className: "text-[10px] font-bold opacity-40 uppercase group-hover:opacity-70 transition-opacity", children: item.label }), _jsx("span", { className: "text-[11px] font-black uppercase italic group-hover:text-primary transition-colors", children: item.val })] }, i))) })] }), _jsxs("div", { className: "space-y-6", children: [_jsx("h4", { className: "text-[10px] font-black uppercase tracking-[0.3em] opacity-40", children: "Certified Milestones" }), [
                                                { title: "Teach2Give", sub: "Software Development Program" },
                                                { title: "SoloLearn", sub: "Web Development Fundamentals" },
                                            ].map((cert, i) => (_jsxs("div", { className: "flex items-center gap-5 p-5 rounded-3xl border border-dashed transition-all duration-300 hover:border-solid hover:bg-primary/5 hover:scale-[1.02] cursor-default", style: { borderColor: `${theme.primary}33` }, children: [_jsx("div", { className: "p-3 rounded-2xl bg-primary/10", style: { backgroundColor: `${theme.primary}15` }, children: _jsx(Award, { size: 22, style: { color: theme.primary } }) }), _jsxs("div", { children: [_jsx("p", { className: "text-[11px] font-black uppercase tracking-wider", children: cert.title }), _jsx("p", { className: "text-[9px] opacity-60 font-medium uppercase tracking-widest", children: cert.sub })] })] }, i)))] })] })] })] })] }));
};
export default About;
