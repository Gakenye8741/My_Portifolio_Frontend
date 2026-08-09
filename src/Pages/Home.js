import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from 'framer-motion';
import { Navbar } from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useTheme } from '../ThemeContext';
import Hero from '../Components/Home components/ContentManager';
import About from '../Components/Home components/About';
import Skills from '../Components/Home components/Skills';
import ProjectCenter from '../Components/Home components/ProjectCenter';
// Import the logo and components
import logoMain from "../../public/LOGO.png";
import PageTitle from '../Components/PageTitle';
import SEO from '../Components/SEO'; // 1. Import SEO Component
const Home = () => {
    const { theme } = useTheme();
    const sectionVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut"
            }
        }
    };
    return (_jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "min-h-screen transition-colors duration-500 flex flex-col relative", style: { backgroundColor: theme["base-100"], color: theme["base-content"] }, children: [_jsx(SEO, { title: "Gakenye Ndiritu | Full-Stack Software Engineer Portfolio", description: "Official portfolio of Gakenye Ndiritu. Computer Science student at Laikipia University and Full-Stack Software Engineer specializing in the PERN stack, React Native, and Blockchain applications.", path: "/" }), _jsx(PageTitle, { title: "Home" }), _jsx("div", { className: "fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0", children: _jsx("img", { src: logoMain, alt: "Background Logo", className: "w-[80vw] h-[80vw] object-contain opacity-[0.03] select-none" }) }), _jsxs("div", { className: "relative z-10", children: [_jsx(Navbar, {}), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.2 }, variants: sectionVariants, children: _jsx(Hero, {}) }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.2 }, variants: sectionVariants, children: _jsx(About, {}) }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.2 }, variants: sectionVariants, children: _jsx(Skills, {}) }), _jsx(motion.div, { initial: "hidden", whileInView: "visible", viewport: { once: true, amount: 0.2 }, variants: sectionVariants, children: _jsx(ProjectCenter, {}) }), _jsx(Footer, {})] })] }));
};
export default Home;
