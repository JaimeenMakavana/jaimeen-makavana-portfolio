"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface ThemeToggleProps {
  variant?: "desktop" | "mobile";
}

export function ThemeToggle({ variant = "desktop" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  if (variant === "mobile") {
    return (
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="flex flex-col items-center gap-1 transition-all active:scale-95"
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        <div
          className="p-1 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: "transparent",
            color: "var(--nav-text-idle)",
          }}
        >
          {isDark ? (
            <Sun className="w-5 h-5" strokeWidth={1} />
          ) : (
            <Moon className="w-5 h-5" strokeWidth={1} />
          )}
        </div>
        <span
          className="text-xs font-medium transition-colors"
          style={{
            color: "var(--nav-text-idle)",
          }}
        >
          Theme
        </span>
      </button>
    );
  }

  // Desktop variant
  return (
    <div className="relative group">
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="relative px-3 py-3 rounded-full flex items-center justify-center transition-all hover:scale-110 group"
        style={{
          backgroundColor: "transparent",
          color: "var(--nav-text-idle)",
        }}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <Sun
            className="w-5 h-5 transition-all duration-300"
            strokeWidth={1}
          />
        ) : (
          <Moon
            className="w-5 h-5 transition-all duration-300"
            strokeWidth={1}
          />
        )}
        <span
          className="absolute left-full ml-3 px-2 py-1 rounded whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundColor: "var(--nav-surface)",
            color: "var(--nav-text-idle)",
          }}
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      </button>
    </div>
  );
}
