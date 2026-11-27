import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useTheme } from "./ThemeContext";

const ThemeToggle = () => {
  const { toggleTheme, isDark, theme } = useTheme();
  const reduce = useReducedMotion();

  // Sun = warm amber (warning) when we're in dark mode
  // Moon = cool cyan  (secondary) when we're in light mode
  const iconColor = isDark ? theme.warning : theme.secondary;

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="relative p-2 rounded-full focus:outline-none group"
      style={{ color: iconColor }}
    >
      {/* Slow-rotating ambient ring in the icon's tech color */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${iconColor}55, transparent 55%)`,
          maskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
          WebkitMaskImage:
            "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))",
        }}
        animate={reduce ? { rotate: 0 } : { rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Hover glow that matches the icon */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ backgroundColor: iconColor }}
        animate={{ opacity: 0 }}
        whileHover={{ opacity: 0.15 }}
        transition={{ duration: 0.25 }}
      />

      {/* Icon swap with rotation + fade */}
      <div className="relative w-6 h-6 overflow-hidden grid place-items-center">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="sun"
              initial={reduce ? false : { rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={reduce ? {} : { rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute"
            >
              <Sun className="w-6 h-6" />
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              initial={reduce ? false : { rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={reduce ? {} : { rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute"
            >
              <Moon className="w-6 h-6" />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Click ripple — expands + fades in the tech color */}
      <motion.span
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{ border: `1.5px solid ${iconColor}` }}
        initial={{ scale: 1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0 }}
        whileTap={reduce ? {} : { scale: 1.6, opacity: [0.6, 0] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </motion.button>
  );
};

export default ThemeToggle;