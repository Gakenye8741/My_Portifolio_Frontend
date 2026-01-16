import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useContext, useEffect } from "react";
// Assuming themes are in a separate file or defined here
import { lightTheme, darkTheme } from "./theme";
const ThemeContext = createContext(undefined);
export const ThemeProvider = ({ children }) => {
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
        }
        else {
            root.classList.remove("dark"); // This triggers Tailwind's default (light) classes
            setTheme(lightTheme);
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);
    return (_jsx(ThemeContext.Provider, { value: { theme, toggleTheme, isDark }, children: _jsx("div", { className: "min-h-screen transition-colors duration-500 bg-[#fafaf9] dark:bg-[#020617] text-[#0f172a] dark:text-[#f1f5f9]", children: children }) }));
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context)
        throw new Error("useTheme must be used within ThemeProvider");
    return context;
};
