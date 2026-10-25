import React from "react";
import { motion, Variants } from "framer-motion";
import { Navbar } from "../Components/Navbar";
import Footer from "../Components/Footer";
import { useTheme } from "../ThemeContext";
import Hero from "../Components/Home components/ContentManager";
import About from "../Components/Home components/About";
import Skills from "../Components/Home components/Skills";
import ProjectCenter from "../Components/Home components/ProjectCenter";

// Import the logo and components
import logoMain from "../../public/LOGO.png";
import PageTitle from "../Components/PageTitle";
import SEO from "../Components/SEO";
import VirtualAssistant from "../Components/VirtualAssistant";
import Testimonials from "../Components/Home components/Testimonials";
import Certifications from "../Components/Home components/Certifications";

const Home: React.FC = () => {
  const { theme } = useTheme();

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative flex min-h-screen flex-col overflow-x-clip transition-colors duration-500"
      style={{
        backgroundColor: theme["base-100"],
        color: theme["base-content"],
      }}
    >
      {/* SEO */}
      <SEO
        title="Gakenye Ndiritu | Full-Stack Software Engineer Portfolio"
        description="Official portfolio of Gakenye Ndiritu. Computer Science student at Laikipia University and Full-Stack Software Engineer specializing in the PERN stack, React Native, and Blockchain applications."
        path="/"
      />

      {/* Dynamic page title */}
      <PageTitle title="Home" />

      {/* Background logo decoration */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
        <img
          src={logoMain}
          alt=""
          aria-hidden="true"
          className="h-[80vw] w-[80vw] select-none object-contain opacity-[0.03]"
        />
      </div>

      {/* Main page content */}
      <div className="relative z-10 flex flex-1 flex-col">
        <Navbar />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <Hero />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <About />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <Skills />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <ProjectCenter />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <Testimonials />
        </motion.div>

        {/* ✅ NEW — Certifications section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <Certifications />
        </motion.div>

        {/* Footer */}
        <Footer />
      </div>

      {/* Floating virtual assistant */}
      <div
        className="
          pointer-events-none fixed inset-x-0 top-[94%] -translate-y-1/2 z-[100]
          flex justify-end
          px-3
          sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-6 sm:translate-y-0
          sm:px-0
        "
      >
        <div className="pointer-events-auto">
          <VirtualAssistant />
        </div>
      </div>
    </motion.div>
  );
};

export default Home;