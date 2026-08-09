import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTheme } from '../ThemeContext';
import { Navbar } from '../Components/Navbar';
import { Database, Layout, Terminal, BookOpen, Smartphone, Zap, GitBranch, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
// Import the logo
import logoMain from "../../public/LOGO.png";
import Footer from '../Components/Footer';
import PageTitle from '../Components/PageTitle';
import SEO from '../Components/SEO'; // 1. Import SEO Component
const StackPage = () => {
    const { theme } = useTheme();
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };
    const techStack = [
        { title: 'Frontend Architecture', icon: _jsx(Layout, {}), techs: ['React.js', 'TypeScript', 'Redux Toolkit (RTK Query)', 'Tailwind CSS', 'HTML5', 'CSS', 'Daisy UI', 'SCSS'] },
        { title: 'Mobile Development', icon: _jsx(Smartphone, {}), techs: ['React Native', 'Expo', 'Mobile UI/UX', 'Cross-Platform Logic'] },
        { title: 'Backend Systems', icon: _jsx(Terminal, {}), techs: ['Node.js', 'Express.js', 'REST API Design', 'JWT/OAuth Security', 'WebSockets', 'Nodemailers', 'Typescript'] },
        { title: 'Database & Storage', icon: _jsx(Database, {}), techs: ['PostgreSQL', 'Drizzle ORM', 'Database Modeling', 'Relational Design'] },
        { title: 'DevOps & Versioning', icon: _jsx(GitBranch, {}), techs: ['Git/GitHub Workflow', 'Postman', 'Vercel/Render Hosting', 'CI/CD Basics', "Microsoft Azure"] },
        { title: 'Specializations', icon: _jsx(ShieldCheck, {}), techs: ['Blockchain (Solidity)', 'Smart Contract Anchoring', 'Biometric Integration'] },
    ];
    const learningPath = [
        { lang: 'Solidity', level: 'Intermediate', context: 'Building decentralized voting systems and smart contracts on the Sepolia Testnet.' },
        { lang: 'Python', level: 'Learning', context: 'Expanding into data manipulation and AI-driven automation workflows.' },
        { lang: 'Go (Golang)', level: 'Exploration', context: 'Researching high-concurrency backend services for scalable applications.' },
    ];
    return (_jsxs("main", { className: "min-h-screen pt-32 pb-20 px-6 relative", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: [_jsx(SEO, { title: "Gakenye Ndiritu | Tech Stack & Skills", description: "Discover the full-stack technologies used by Gakenye Ndiritu, including React, TypeScript, Node.js, PostgreSQL, Drizzle ORM, React Native, and blockchain development.", path: "/tech" }), _jsx("div", { className: "fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0", children: _jsx("img", { src: logoMain, alt: "Background Logo", className: "w-[80vw] h-[80vw] object-contain opacity-[0.03] select-none" }) }), _jsxs("div", { className: "relative z-10", children: [_jsx(PageTitle, { title: "Tech Stack & Skills" }), _jsx(Navbar, {}), _jsxs(motion.div, { variants: containerVariants, initial: "hidden", animate: "visible", className: "max-w-6xl mx-auto space-y-20", children: [_jsxs(motion.header, { variants: itemVariants, className: "space-y-6", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5", children: [_jsx(Zap, { size: 14, style: { color: theme.primary } }), _jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.2em]", style: { color: theme.primary }, children: "Certified Software Engineer" })] }), _jsx("h1", { className: "text-6xl md:text-8xl font-black uppercase italic tracking-tighter", children: "Tech Stack." }), _jsx("p", { className: "opacity-60 max-w-2xl text-lg leading-relaxed", children: "I specialize in full-stack engineering, leveraging the PERN stack and React Native to deliver robust, scalable, and cross-platform solutions." })] }), _jsx(motion.section, { variants: containerVariants, className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: techStack.map((category, idx) => (_jsxs(motion.div, { variants: itemVariants, whileHover: { y: -10 }, className: "p-8 rounded-[2rem] border border-white/5 bg-black/20 backdrop-blur-md hover:border-primary/20 transition-all cursor-default", children: [_jsxs("div", { className: "flex items-center gap-4 mb-8", children: [_jsx("div", { className: "p-3 rounded-2xl bg-primary/10", style: { color: theme.primary }, children: category.icon }), _jsx("h3", { className: "text-[11px] font-black uppercase tracking-widest", children: category.title })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: category.techs.map((tech, i) => (_jsx(motion.span, { whileHover: { scale: 1.05, backgroundColor: `${theme.primary}20` }, className: "px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest transition-colors", children: tech }, i))) })] }, idx))) }), _jsxs(motion.section, { variants: itemVariants, className: "space-y-10", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx(BookOpen, { size: 24, className: "opacity-40" }), _jsx("h3", { className: "text-2xl font-black uppercase tracking-tighter", children: "Current Learning Path" })] }), _jsx("div", { className: "grid lg:grid-cols-3 gap-6", children: learningPath.map((item, idx) => (_jsxs(motion.div, { whileHover: { scale: 1.02 }, className: "p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]", children: [_jsx("div", { className: "text-[9px] font-black uppercase tracking-[0.2em] mb-2", style: { color: theme.primary }, children: item.level }), _jsx("h4", { className: "text-xl font-black uppercase mb-4", children: item.lang }), _jsx("p", { className: "text-[11px] opacity-50 leading-relaxed", children: item.context })] }, idx))) })] }), _jsxs(motion.section, { variants: itemVariants, className: "p-10 rounded-[3rem] border border-dashed border-white/10 text-center space-y-4", children: [_jsx("h4", { className: "text-[10px] font-black uppercase tracking-[0.3em] opacity-40", children: "Engineering Philosophy" }), _jsx("p", { className: "text-xl italic font-medium max-w-2xl mx-auto", children: "\"I believe in the constant evolution of my craft. Whether it is refining web interfaces or exploring new mobile-native experiences, I code to solve real-world problems.\"" })] })] })] }), _jsx(Footer, {})] }));
};
export default StackPage;
