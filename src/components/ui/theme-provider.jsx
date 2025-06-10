import { createContext, useCallback, useEffect, useState } from "react";

const initialState = {
  theme: "system",
  setTheme: () => null,
};

export const ThemeProviderContext = createContext(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem(storageKey) || defaultTheme
  );

  const handleThemeChange = useCallback(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
    if (theme === "system") {
      const systemTheme = prefersDarkMode.matches ? "dark" : "light";
      root.classList.add(systemTheme);
      return;
    }
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    handleThemeChange();
  }, [theme, handleThemeChange]);

  useEffect(() => {
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
    prefersDarkMode.addEventListener("change", () => handleThemeChange());
    return () => {
      prefersDarkMode.removeEventListener("change", () => handleThemeChange());
    };
  }, [handleThemeChange]);

  const value = {
    theme,
    setTheme: (theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
