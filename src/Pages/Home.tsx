import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Navbar } from '../Components/Navbar';
import Footer from '../Components/Footer';
import { useTheme } from '../ThemeContext';
import Hero from '../Components/Home components/ContentManager';
import About from '../Components/Home components/About';
import Skills from '../Components/Home components/Skills';
import ProjectCenter from '../Components/Home components/ProjectCenter';

// Import the logo
import logoMain from "../../public/LOGO.png";

const Home = () => {
  const { theme } = useTheme();

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: "easeOut" as const 
      } 
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen transition-colors duration-500 flex flex-col relative"
      style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
    >
      {/* Background Logo Decoration */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
        <img 
          src={logoMain} 
          alt="Background Logo" 
          className="w-[80vw] h-[80vw] object-contain opacity-[0.03] select-none"
        />
      </div>

      <div className="relative z-10">
        <Navbar />

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
          <Hero />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
          <About />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
          <Skills />
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={sectionVariants}>
          <ProjectCenter />
        </motion.div>

        <Footer />
      </div>
    </motion.div>
  );
};

export default Home;