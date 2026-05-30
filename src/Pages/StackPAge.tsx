import React from 'react';
import { useTheme } from '../ThemeContext';
import { Navbar } from '../Components/Navbar';
import { Cpu, Database, Layout, Terminal, BookOpen, Smartphone, Zap, GitBranch, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

// Import the logo
import logoMain from "../../public/LOGO.png";

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
    { title: 'Frontend Architecture', icon: <Layout />, techs: ['React.js', 'TypeScript', 'Redux Toolkit (RTK Query)', 'Tailwind CSS', 'HTML5','CSS','Daisy UI','SCSS'] },
    { title: 'Mobile Development', icon: <Smartphone />, techs: ['React Native', 'Expo', 'Mobile UI/UX', 'Cross-Platform Logic'] },
    { title: 'Backend Systems', icon: <Terminal />, techs: ['Node.js', 'Express.js', 'REST API Design', 'JWT/OAuth Security', 'WebSockets','Nodemailers','Typescript'] },
    { title: 'Database & Storage', icon: <Database />, techs: ['PostgreSQL', 'Drizzle ORM', 'Database Modeling', 'Relational Design'] },
    { title: 'DevOps & Versioning', icon: <GitBranch />, techs: ['Git/GitHub Workflow', 'Postman', 'Vercel/Render Hosting', 'CI/CD Basics',"Microsoft Azure"] },
    { title: 'Specializations', icon: <ShieldCheck />, techs: ['Blockchain (Solidity)', 'Smart Contract Anchoring', 'Biometric Integration'] },
  ];

  const learningPath = [
    { lang: 'Solidity', level: 'Intermediate', context: 'Building decentralized voting systems and smart contracts on the Sepolia Testnet.' },
    { lang: 'Python', level: 'Learning', context: 'Expanding into data manipulation and AI-driven automation workflows.' },
    { lang: 'Go (Golang)', level: 'Exploration', context: 'Researching high-concurrency backend services for scalable applications.' },
  ];

  return (
    <main className="min-h-screen pt-32 pb-20 px-6 relative" style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}>
      
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
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto space-y-20"
        >
          
          {/* --- HEADER --- */}
          <motion.header variants={itemVariants} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
              <Zap size={14} style={{ color: theme.primary }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primary }}>Certified Software Engineer</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">Tech Stack.</h1>
            <p className="opacity-60 max-w-2xl text-lg leading-relaxed">
              I specialize in full-stack engineering, leveraging the PERN stack and React Native to deliver 
              robust, scalable, and cross-platform solutions.
            </p>
          </motion.header>

          {/* --- COMPETENCY GRID --- */}
          <motion.section variants={containerVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((category, idx) => (
              <motion.div 
                key={idx} 
                variants={itemVariants}
                whileHover={{ y: -10 }}
                className="p-8 rounded-[2rem] border border-white/5 bg-black/20 backdrop-blur-md hover:border-primary/20 transition-all cursor-default"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-2xl bg-primary/10" style={{ color: theme.primary }}>
                    {category.icon}
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest">{category.title}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.techs.map((tech, i) => (
                    <motion.span 
                      key={i} 
                      whileHover={{ scale: 1.05, backgroundColor: `${theme.primary}20` }}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest transition-colors"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* --- LEARNING & GROWTH --- */}
          <motion.section variants={itemVariants} className="space-y-10">
            <div className="flex items-center gap-4">
              <BookOpen size={24} className="opacity-40" />
              <h3 className="text-2xl font-black uppercase tracking-tighter">Current Learning Path</h3>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
              {learningPath.map((item, idx) => (
                <motion.div key={idx} whileHover={{ scale: 1.02 }} className="p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] mb-2" style={{ color: theme.primary }}>
                    {item.level}
                  </div>
                  <h4 className="text-xl font-black uppercase mb-4">{item.lang}</h4>
                  <p className="text-[11px] opacity-50 leading-relaxed">{item.context}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* --- PHILOSOPHY --- */}
          <motion.section variants={itemVariants} className="p-10 rounded-[3rem] border border-dashed border-white/10 text-center space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Engineering Philosophy</h4>
            <p className="text-xl italic font-medium max-w-2xl mx-auto">
              "I believe in the constant evolution of my craft. Whether it is refining web interfaces 
              or exploring new mobile-native experiences, I code to solve real-world problems."
            </p>
          </motion.section>
        </motion.div>
      </div>
    </main>
  );
};

export default StackPage;