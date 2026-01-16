import React from 'react';
import { Navbar } from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useTheme } from '../ThemeContext';
import { Terminal, Code2, Cpu, Globe, ArrowRight, Sparkles } from 'lucide-react';
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
    { name: "Frontend", tech: "React, Next.js, Tailwind", icon: <Globe size={20} /> },
    { name: "Backend", tech: "Node.js, Express, PostgreSQL", icon: <Cpu size={20} /> },
    { name: "Tools", tech: "Docker, Git, AWS", icon: <Terminal size={20} /> },
  ];

  return (
    <div 
      className="min-h-screen transition-colors duration-500 flex flex-col"
      style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
    >
      <Navbar />

      {/* Hero Section */}
   <Hero />
   <About />
   <Skills />
   <ProjectCenter />

      <Footer />
    </div>
  );
};

export default Home;