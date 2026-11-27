// src/ThemeContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from "react";

/* ---- The two names your index.css registers ---- */
export type ThemeName = "weetixdark" | "weetixlight";
const AVAILABLE_THEMES: ThemeName[] = ["weetixdark", "weetixlight"];
const DEFAULT_THEME: ThemeName = "weetixdark";

/* ---- Shape Hero.tsx expects: hex strings, so `${x}30` still works ---- */
export type Theme = {
  "base-100": string;
  "base-200": string;
  "base-300": string;
  "base-content": string;
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  info: string;
  success: string;
  warning: string;
  error: string;
};

interface ThemeContextProps {
  theme: Theme;
  themeName: ThemeName;
  toggleTheme: () => void;
  setTheme: (name: ThemeName) => void;
  isDark: boolean;
}

const STORAGE_KEY = "theme";

/* Fallbacks in case getComputedStyle fails (SSR, first paint, etc.) */
const FALLBACK: Record<ThemeName, Theme> = {
  weetixdark: {
    "base-100": "#0F0B1E",
    "base-200": "#171229",
    "base-300": "#261F3F",
    "base-content": "#EDE9FE",
    primary: "#A78BFA",
    secondary: "#C4B5FD",
    accent: "#F472B6",
    neutral: "#2A2347",
    info: "#1E4A7A",
    success: "#0C5C3A",
    warning: "#59432E",
    error: "#5C1F24",
  },
  weetixlight: {
    "base-100": "#FFFFFF",
    "base-200": "#F7F5FF",
    "base-300": "#E4DFF5",
    "base-content": "#1E1B3A",
    primary: "#6D28D9",
    secondary: "#1E1B4B",
    accent: "#DB2777",
    neutral: "#1E1B3A",
    info: "#3B82C4",
    success: "#2E9E6B",
    warning: "#EB760A",
    error: "#D64545",
  },
};

/* Convert whatever DaisyUI emits (oklch / rgb / hsl) to #rrggbb */
function toHex(color: string): string {
  if (typeof window === "undefined" || !color) return "#000000";

  const probe = document.createElement("div");
  probe.style.color = color;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color.trim();
  document.body.removeChild(probe);

  if (computed.startsWith("rgb")) {
    const nums = computed.match(/[\d.]+/g);
    if (nums && nums.length >= 3) {
      return (
        "#" +
        nums
          .slice(0, 3)
          .map((v) =>
            Math.min(255, Math.round(Number(v))).toString(16).padStart(2, "0")
          )
          .join("")
      );
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#000000";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Read the current DaisyUI palette straight from the DOM. */
function readTheme(name: ThemeName): Theme {
  if (typeof document === "undefined") return FALLBACK[name];
  const styles = getComputedStyle(document.documentElement);
  const fb = FALLBACK[name];
  const read = (varName: string, fallback: string) => {
    const raw = styles.getPropertyValue(varName).trim();
    return raw ? toHex(raw) : fallback;
  };
  return {
    "base-100": read("--color-base-100", fb["base-100"]),
    "base-200": read("--color-base-200", fb["base-200"]),
    "base-300": read("--color-base-300", fb["base-300"]),
    "base-content": read("--color-base-content", fb["base-content"]),
    primary: read("--color-primary", fb.primary),
    secondary: read("--color-secondary", fb.secondary),
    accent: read("--color-accent", fb.accent),
    neutral: read("--color-neutral", fb.neutral),
    info: read("--color-info", fb.info),
    success: read("--color-success", fb.success),
    warning: read("--color-warning", fb.warning),
    error: read("--color-error", fb.error),
  };
}

/** Migrate old "dark"/"light" values so existing users don't get stuck. */
function getInitialThemeName(): ThemeName {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === "weetixdark" || saved === "dark") return "weetixdark";
  if (saved === "weetixlight" || saved === "light") return "weetixlight";
  return DEFAULT_THEME;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>(getInitialThemeName);
  const [theme, setThemeState] = useState<Theme>(() =>
    FALLBACK[getInitialThemeName()]
  );

  const isDark = themeName === "weetixdark";

  const toggleTheme = useCallback(
    () =>
      setThemeName((prev) =>
        prev === "weetixdark" ? "weetixlight" : "weetixdark"
      ),
    []
  );

  useEffect(() => {
    const root = document.documentElement;

    // ⚠️ The actual fix: use the names your CSS registers, not "dark"/"light"
    root.setAttribute("data-theme", themeName);
    root.classList.toggle("dark", isDark); // keeps Tailwind's `dark:` variant working
    localStorage.setItem(STORAGE_KEY, themeName);

    // One frame lets DaisyUI recalc the CSS vars before we read them
    const raf = requestAnimationFrame(() => setThemeState(readTheme(themeName)));
    return () => cancelAnimationFrame(raf);
  }, [themeName, isDark]);

  return (
    <ThemeContext.Provider
      value={{ theme, themeName, toggleTheme, setTheme: setThemeName, isDark }}
    >
      <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-500">
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};