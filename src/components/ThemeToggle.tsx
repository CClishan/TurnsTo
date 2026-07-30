"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const storageKey = "turnsto-theme";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey);
    const nextTheme = savedTheme === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function setThemePreference(nextTheme: "light" | "dark") {
    setTheme(nextTheme);
    window.localStorage.setItem(storageKey, nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = theme === "dark";

  return (
    <div className="theme-switch" role="group" aria-label="Color theme">
      <button
        className={`theme-opt ${!isDark ? "is-active" : ""}`}
        type="button"
        data-theme="light"
        onClick={() => setThemePreference("light")}
        aria-label="Light mode"
        aria-pressed={!isDark}
      >
        <Sun size={16} aria-hidden="true" />
      </button>
      <button
        className={`theme-opt ${isDark ? "is-active" : ""}`}
        type="button"
        data-theme="dark"
        onClick={() => setThemePreference("dark")}
        aria-label="Dark mode"
        aria-pressed={isDark}
      >
        <Moon size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
