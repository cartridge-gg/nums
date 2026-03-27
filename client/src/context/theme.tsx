import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useEffect,
  useState,
} from "react";

export type Theme = "compliant" | "rebellion";

const THEME_COLORS: Record<
  Theme,
  { primary: string; secondary: string; tertiary: string }
> = {
  compliant: { primary: "mauve", secondary: "purple", tertiary: "green" },
  rebellion: { primary: "blush", secondary: "crimson", tertiary: "white" },
};

const LEVELS = [100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function applyTheme(theme: Theme) {
  const colors = THEME_COLORS[theme];
  const root = document.documentElement;
  for (const [semantic, base] of Object.entries(colors)) {
    for (const level of LEVELS) {
      root.style.setProperty(
        `--${semantic}-${level}`,
        `var(--${base}-${level})`,
      );
    }
  }
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "compliant",
  setTheme: () => {},
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    return saved ? (JSON.parse(saved) as Theme) : "compliant";
  });

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "compliant" ? "rebellion" : "compliant"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
