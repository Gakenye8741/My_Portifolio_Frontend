import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full transition-transform active:scale-90 hover:bg-gray-500/10 focus:outline-none group"
      aria-label="Toggle Theme"
    >
      <div className="relative w-6 h-6 overflow-hidden">
        {isDark ? (
          <Sun className="w-6 h-6 text-cyan-400 transition-all duration-500 animate-in spin-in-90 scale-100" />
        ) : (
          <Moon className="w-6 h-6 text-indigo-600 transition-all duration-500 animate-in spin-in-90 scale-100" />
        )}
      </div>
      
      {/* Subtle hover glow */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-10 dark:bg-cyan-400 bg-indigo-600 transition-opacity" />
    </button>
  );
};

export default ThemeToggle;