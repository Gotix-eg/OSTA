import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { themes, type AppTheme, type ThemeMode } from "../theme/colors";
import { getStorageItem, setStorageItem } from "../utils/storage";

const THEME_KEY = "osta_theme_mode";

type ThemeContextValue = {
  mode: ThemeMode;
  theme: AppTheme;
  setMode: (mode: ThemeMode) => Promise<void>;
  toggleMode: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    let mounted = true;
    getStorageItem(THEME_KEY).then(value => {
      if (!mounted) {
        return;
      }
      if (value === "light" || value === "dark") {
        setModeState(value);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await setStorageItem(THEME_KEY, nextMode);
  }, []);

  const toggleMode = useCallback(async () => {
    await setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  const value = useMemo(() => ({
    mode,
    theme: themes[mode],
    setMode,
    toggleMode
  }), [mode, setMode, toggleMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
