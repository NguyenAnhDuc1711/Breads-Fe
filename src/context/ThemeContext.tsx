"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

export type ColorMode = "light" | "dark";

interface ThemeContextValue {
  colorMode: ColorMode;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorMode: "dark",
  toggleColorMode: () => {},
  setColorMode: () => {},
});

const STORAGE_KEY = "chakra-ui-color-mode";

function getInitialColorMode(): ColorMode {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyColorMode(mode: ColorMode) {
  if (typeof document === "undefined") return;
  document.documentElement.style.colorScheme = mode;
  document.documentElement.setAttribute("data-theme", mode);
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorMode, setColorModeState] = useState<ColorMode>(getInitialColorMode);

  const setColorMode = useCallback((mode: ColorMode) => {
    setColorModeState(mode);
    window.localStorage.setItem(STORAGE_KEY, mode);
    applyColorMode(mode);
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorMode(colorMode === "dark" ? "light" : "dark");
  }, [colorMode, setColorMode]);

  useEffect(() => {
    applyColorMode(colorMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const handler = (e: MediaQueryListEvent) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setColorModeState(e.matches ? "light" : "dark");
        applyColorMode(e.matches ? "light" : "dark");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ colorMode, toggleColorMode, setColorMode }}>{children}</ThemeContext.Provider>
  );
};

export function useColorMode() {
  return useContext(ThemeContext);
}

export function useColorModeValue<T>(lightVal: T, darkVal: T): T {
  const { colorMode } = useContext(ThemeContext);
  return colorMode === "dark" ? darkVal : lightVal;
}

export const ColorModeScript = () => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(function(){try{var m=localStorage.getItem("${STORAGE_KEY}");if(m!=="light"&&m!=="dark"){m=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.style.colorScheme=m;document.documentElement.setAttribute("data-theme",m);}catch(e){}})();`,
    }}
  />
);
