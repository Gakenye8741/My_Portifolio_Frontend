import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
// Assuming themes are in a separate file or defined here
import { lightTheme, darkTheme } from "./theme"; 

type Theme = typeof lightTheme;

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    // Optional: Check local storage or system preference
    return localStorage.getItem("theme") === "dark";
  });
  const [theme, setTheme] = useState(isDark ? darkTheme : lightTheme);

  const toggleTheme = () => setIsDark(prev => !prev);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDark) {
      root.classList.add("dark"); // This triggers Tailwind's dark: classes
      setTheme(darkTheme);
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark"); // This triggers Tailwind's default (light) classes
      setTheme(lightTheme);
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      <div className="min-h-screen transition-colors duration-500 bg-[#fafaf9] dark:bg-[#020617] text-[#0f172a] dark:text-[#f1f5f9]">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};