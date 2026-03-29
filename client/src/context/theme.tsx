import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useEffect,
  useMemo,
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

const THEME_STORAGE_KEY = "theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  hasVnums: boolean;
  setHasVnums: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "compliant",
  setTheme: () => {},
  toggleTheme: () => {},
  hasVnums: false,
  setHasVnums: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<Theme | null>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Theme) : null;
  });

  const [hasVnums, setHasVnumsState] = useState(false);

  const theme: Theme = useMemo(() => {
    if (!hasVnums) return "compliant";
    if (preference !== null) return preference;
    return "rebellion";
  }, [hasVnums, preference]);

  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (hasVnums && preference === null) {
      setPreference("rebellion");
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify("rebellion"));
    }
  }, [hasVnums, preference]);

  const setTheme = useCallback((t: Theme) => {
    setPreference(t);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(t));
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      const next =
        (prev ?? "compliant") === "compliant" ? "rebellion" : "compliant";
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setHasVnums = useCallback((value: boolean) => {
    setHasVnumsState(value);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, toggleTheme, hasVnums, setHasVnums }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
