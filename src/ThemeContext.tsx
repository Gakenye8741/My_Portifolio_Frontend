import { darkTheme, lightTheme } from "../theme";
import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

// 1. DEFINE THE TYPES (Tell TypeScript what the theme looks like)
type Theme = typeof lightTheme;

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

// 2. CREATE THE CONTEXT (This was the missing piece!)
const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [theme, setTheme] = useState(isDark ? darkTheme : lightTheme);

  const toggleTheme = () => setIsDark(prev => !prev);

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDark) {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
      setTheme(darkTheme);
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
      setTheme(lightTheme);
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    // This now works because ThemeContext is defined above!
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-500">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// 3. EXPORT THE HOOK (So you can use it in your Navbar)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};