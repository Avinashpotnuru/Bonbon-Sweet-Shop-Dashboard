"use client";

import * as React from "react";
import { useServerInsertedHTML } from "next/navigation";

type Theme = "light" | "dark";
type ThemeOption = Theme | "system";

const STORAGE_KEY = "theme";

/**
 * Runs before first paint (injected into the SSR HTML stream, outside the
 * React tree) so the correct theme class is applied before React hydrates.
 * Avoids the React 19 "script tag in component" dev warning that next-themes
 * triggers when it renders its own <script> inside the client provider.
 */
const THEME_INIT_SCRIPT = `(function(){try{var root=document.documentElement;var stored=localStorage.getItem("theme");var theme=stored||"system";var resolved;if(theme==="system"){resolved=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}else{resolved=theme}root.classList.remove("light","dark");root.classList.add(resolved);root.style.colorScheme=resolved}catch(e){}})();`;

type ThemeProviderState = {
  theme: ThemeOption;
  setTheme: (theme: ThemeOption) => void;
  resolvedTheme: Theme;
  systemTheme: Theme;
};

const defaultContext: ThemeProviderState = {
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
  systemTheme: "light",
};

const ThemeContext = React.createContext<ThemeProviderState>(defaultContext);

function isThemeOption(value: string | null): value is ThemeOption {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeToDom(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

function blockTransitions() {
  const style = document.createElement("style");
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(style);
  const cleanup = () => {
    window.getComputedStyle(document.body);
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1);
  };
  if (document.fonts?.ready) {
    document.fonts.ready.then(cleanup).catch(cleanup);
  } else {
    cleanup();
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: ThemeOption;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}) {
  // First render is deterministic (server + hydration agree); the persisted
  // choice is restored right after mount via the storage-event subscription.
  const [theme, setThemeState] = React.useState<ThemeOption>(defaultTheme);
  const [systemTheme, setSystemTheme] = React.useState<Theme>(
    () => (typeof window === "undefined" ? "light" : getSystemTheme()),
  );

  const resolvedTheme: Theme =
    theme === "system"
      ? enableSystem
        ? systemTheme
        : (defaultTheme === "dark" ? "dark" : "light")
      : theme;

  // Emit the FOUC-prevention script only during SSR, as raw HTML outside the
  // React tree — React never renders it on the client, so no script-tag warning.
  useServerInsertedHTML(() => (
    <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
  ));

  // Keep <html> class + color-scheme in sync with the resolved theme. The
  // injected SSR script handles the very first paint.
  React.useEffect(() => {
    applyThemeToDom(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = React.useCallback(
    (next: ThemeOption) => {
      if (disableTransitionOnChange) {
        blockTransitions();
      }
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage unavailable (private mode, disabled cookies) — state-only.
      }
      window.dispatchEvent(
        new StorageEvent("storage", { key: STORAGE_KEY, newValue: next }),
      );
    },
    [disableTransitionOnChange],
  );

  // Treat localStorage as an external system: state updates flow through
  // storage-event callbacks, so they also cover cross-tab sync for free.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (isThemeOption(event.newValue)) {
        setThemeState(event.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Restore the persisted theme once, as a value emitted by the external
  // system rather than a synchronous effect-time write.
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isThemeOption(stored)) {
        window.dispatchEvent(
          new StorageEvent("storage", { key: STORAGE_KEY, newValue: stored }),
        );
      }
    } catch {
      // Storage unavailable — keep the default theme.
    }
  }, []);

  // Keep "system" theme in sync with OS-level preference changes.
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };
    media.addEventListener("change", onMediaChange);
    return () => media.removeEventListener("change", onMediaChange);
  }, []);

  const value = React.useMemo(
    () => ({ theme, setTheme, resolvedTheme, systemTheme }),
    [theme, setTheme, resolvedTheme, systemTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return React.useContext(ThemeContext);
}