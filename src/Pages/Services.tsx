import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import heroImage from "../assets/computer-laptop-macbook-coding.jpg";
import logo from "../../public/LOGO.png";
import Footer from "../Components/Footer";
import { Navbar } from "../Components/Navbar";
import { useTheme } from "../ThemeContext";

// Personal engineering, technical consultancy, and infrastructure services data
const techServices = [
  {
    title: "Full-Stack Web Development",
    desc: "Building robust, scalable web applications using the PERN stack (PostgreSQL, Express, React, Node.js) paired with TypeScript and Drizzle ORM.",
  },
  {
    title: "Mobile App Development",
    desc: "Crafting cross-platform mobile applications with smooth user experiences using React Native and Expo frameworks.",
  },
  {
    title: "Blockchain & Smart Contracts",
    desc: "Designing and deploying decentralized solutions, including Solidity smart contracts integrated on networks like Ethereum Sepolia.",
  },
  {
    title: "Technical Consultancy & Architecture",
    desc: "Providing expert guidance on software design, database optimization, technology stack selection, and digital transformation for projects and organizations.",
  },
  {
    title: "Network Infrastructure & ADSS Deployment",
    desc: "Performing physical network engineering tasks including ADSS aerial cable deployment, fiber preparation, maintenance reporting, and signal loss troubleshooting.",
  },
  {
    title: "API Design & Backend Systems",
    desc: "Developing secure, high-performance RESTful APIs, authentication workflows, and scalable server-side business logic.",
  },
];

// FAQ data
const faqs = [
  {
    question: "What is your typical project turnaround time?",
    answer: "Project timelines depend on scope and complexity. Standard full-stack web or mobile applications typically take between 2 to 4 weeks from conception to deployment, while smaller consultancy tasks or specific feature integrations can be completed much faster.",
  },
  {
    question: "Do you offer post-launch maintenance and support?",
    answer: "Yes! I provide ongoing post-launch maintenance, performance monitoring, bug fixing, and feature expansions to ensure your digital products remain secure, fast, and fully functional.",
  },
  {
    question: "How do we get started on a custom web or mobile development project?",
    answer: "Getting started is simple. Head over to the contact page, fill out the project inquiry form with your ideas or requirements, and we will schedule a discussion to map out your technical stack and development roadmap.",
  },
];

const ServicesPage: React.FC = () => {
  const { theme } = useTheme();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />
      <div
        className="relative font-sans pt-[4.5rem] lg:pt-[5rem] pb-[4.5rem] lg:pb-0 min-h-screen flex flex-col justify-between overflow-hidden"
        style={{ backgroundColor: theme["base-100"], color: theme["base-content"] }}
      >
        {/* Giant Watermark Logo in Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <img
            src={logo}
            alt="Background Watermark Logo"
            className="w-[70vw] md:w-[45vw] lg:w-[35vw] object-contain opacity-[0.03] select-none"
          />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="py-12 px-4 sm:py-16 sm:px-6 lg:px-20 flex flex-col-reverse lg:flex-row items-center gap-10"
          >
            <motion.div
              className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4"
                style={{ color: theme.primary }}
              >
                Technical Consultancy & Engineering Services
              </h1>
              <p
                className="text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 italic font-semibold"
                style={{ color: theme.secondary }}
              >
                "Expert software engineering, technical consultancy, and reliable network infrastructure solutions"
              </p>
              <Link
                to="/contact"
                className="btn px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg font-semibold"
                style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
              >
                Get in Touch
              </Link>
            </motion.div>
            <motion.div
              className="flex-1 flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={heroImage}
                alt="Technical Consultancy and Services"
                className="w-full max-w-md rounded-lg shadow-lg"
                style={{ borderColor: theme["base-300"] }}
              />
            </motion.div>
          </motion.section>

          {/* Services Grid Section */}
          <section className="py-10 px-4 sm:py-12 sm:px-6 lg:px-20 text-center">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12"
              style={{ color: theme.primary }}
            >
              What I Offer
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {techServices.map((service, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03 }}
                  className="p-6 rounded-xl shadow-md text-left flex flex-col justify-between backdrop-blur-sm"
                  style={{
                    backgroundColor: `${theme["base-200"]}E6`,
                    color: theme["base-content"],
                    borderColor: theme["base-300"],
                  }}
                >
                  <div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: theme.primary }}>
                      {service.title}
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: theme.secondary }}>
                      {service.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-10 px-4 sm:py-12 sm:px-6 lg:px-20 max-w-4xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.7 }}
              className="text-2xl sm:text-3xl font-bold mb-8 text-center"
              style={{ color: theme.primary }}
            >
              Frequently Asked Questions
            </motion.h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="rounded-xl shadow-md overflow-hidden border backdrop-blur-sm"
                  style={{
                    backgroundColor: `${theme["base-200"]}E6`,
                    borderColor: theme["base-300"],
                  }}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between font-semibold text-base sm:text-lg focus:outline-none"
                    style={{ color: theme["base-content"] }}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={20}
                      className={`transition-transform duration-300 ${openFaqIndex === idx ? "rotate-180" : ""}`}
                      style={{ color: theme.primary }}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className="px-5 pb-5 text-sm sm:text-base leading-relaxed border-t pt-3"
                          style={{ color: theme.secondary, borderColor: theme["base-300"] }}
                        >
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="py-12 px-4 sm:py-16 sm:px-6 lg:px-20 text-center"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: theme.primary }}>
              Let's Build Something Together
            </h2>
            <p className="text-sm sm:text-base mb-6 max-w-2xl mx-auto" style={{ color: theme["base-content"] }}>
              Have a software project, infrastructure challenge, or need expert technical consultancy for your next venture? Reach out and let's collaborate.
            </p>
            <Link
              to="/contact"
              className="btn px-4 py-2 sm:px-6 sm:py-3 text-base sm:text-lg font-semibold"
              style={{ backgroundColor: theme.primary, color: theme["base-100"] }}
            >
              Contact Me
            </Link>
          </motion.section>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ServicesPage;