import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navbar } from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useTheme } from '../ThemeContext';
import { Terminal, Cpu, Globe } from 'lucide-react';
import Hero from '../Components/Home components/ContentManager';
import About from '../Components/Home components/About';
import Skills from '../Components/Home components/Skills';
import ProjectCenter from '../Components/Home components/ProjectCenter';
const Home = () => {
    const { theme } = useTheme();
    // Static Data for the Portfolio
    const stats = [
        { label: "Experience", value: "2+ Years" },
        { label: "Projects", value: "15+ Completed" },
        { label: "Availability", value: "Freelance / Full-time" },
    ];
    const coreStack = [
        { name: "Frontend", tech: "React, Next.js, Tailwind", icon: _jsx(Globe, { size: 20 }) },
        { name: "Backend", tech: "Node.js, Express, PostgreSQL", icon: _jsx(Cpu, { size: 20 }) },
        { name: "Tools", tech: "Docker, Git, AWS", icon: _jsx(Terminal, { size: 20 }) },
    ];
    return (_jsxs("div", { className: "min-h-screen transition-colors duration-500 flex flex-col", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: [_jsx(Navbar, {}), _jsx(Hero, {}), _jsx(About, {}), _jsx(Skills, {}), _jsx(ProjectCenter, {}), _jsx(Footer, {})] }));
};
export default Home;
