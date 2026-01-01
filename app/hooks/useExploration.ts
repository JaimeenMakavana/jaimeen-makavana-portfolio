"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

const STORAGE_KEY = "portfolio_exploration_paths";
const TOTAL_STEPS = 6;

// Pages that should NOT be tracked (admin, login, etc.)
const EXCLUDED_PATHS = ["/admin", "/login"];

export function useExploration() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const [visitedPaths, setVisitedPaths] = useState<string[]>([]);
  const [hasThemeChanged, setHasThemeChanged] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isInitialMountRef = useRef(true);

  // Mark as mounted after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load visited paths from localStorage on mount (only on client)
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as {
          paths: string[];
          themeChanged: boolean;
          lastTheme?: string;
        };
        setVisitedPaths(data.paths || []);
        setHasThemeChanged(data.themeChanged || false);
        const totalProgress =
          (data.paths?.length || 0) + (data.themeChanged ? 1 : 0);
        setIsComplete(totalProgress >= TOTAL_STEPS);
      }
    } catch (error) {
      console.error("Failed to load exploration data:", error);
    }
  }, [mounted]);

  // Track theme changes - only count when user actually toggles
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;
    if (!theme) return;

    // Skip initial mount to avoid counting system theme as a change
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;

      // Load existing data and set initial theme
      const stored = localStorage.getItem(STORAGE_KEY);
      let data: {
        paths: string[];
        themeChanged: boolean;
        lastTheme?: string;
      } = { paths: [], themeChanged: false };

      if (stored) {
        try {
          data = JSON.parse(stored);
          setHasThemeChanged(data.themeChanged || false);
        } catch (error) {
          console.error("Failed to parse exploration data:", error);
        }
      }

      // Store initial theme if not set
      if (!data.lastTheme) {
        const updated = {
          paths: data.paths || [],
          themeChanged: false,
          lastTheme: theme,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return;
    }

    // After initial mount, track actual theme changes
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const data = JSON.parse(stored) as {
        paths: string[];
        themeChanged: boolean;
        lastTheme?: string;
      };

      // Check if theme actually changed (user toggled it)
      if (data.lastTheme && data.lastTheme !== theme && !data.themeChanged) {
        // Theme was toggled for the first time
        setHasThemeChanged(true);
        const updated = {
          paths: data.paths || [],
          themeChanged: true,
          lastTheme: theme,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        const totalProgress = updated.paths.length + 1;
        if (totalProgress >= TOTAL_STEPS) {
          setIsComplete(true);
        }
      } else if (data.lastTheme !== theme) {
        // Theme changed but already counted, just update lastTheme
        const updated = {
          ...data,
          lastTheme: theme,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    } catch (error) {
      console.error("Failed to track theme change:", error);
    }
  }, [theme, mounted]);

  // Track current path when it changes
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;
    if (!pathname) return;

    // Skip excluded paths
    const isExcluded = EXCLUDED_PATHS.some((excluded) =>
      pathname.startsWith(excluded)
    );
    if (isExcluded) return;

    // Normalize path (remove trailing slashes, handle root)
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

    setVisitedPaths((prev) => {
      // Check if path is already visited
      if (prev.includes(normalizedPath)) {
        return prev;
      }

      // Add new path
      const updated = [...prev, normalizedPath];

      // Save to localStorage
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored
          ? (JSON.parse(stored) as {
              paths: string[];
              themeChanged: boolean;
              lastTheme?: string;
            })
          : { paths: [], themeChanged: false };

        const saved = {
          paths: updated,
          themeChanged: hasThemeChanged || data.themeChanged || false,
          lastTheme: theme || data.lastTheme,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
      } catch (error) {
        console.error("Failed to save exploration data:", error);
      }

      // Check if complete
      const totalProgress = updated.length + (hasThemeChanged ? 1 : 0);
      if (totalProgress >= TOTAL_STEPS) {
        setIsComplete(true);
      }

      return updated;
    });
  }, [pathname, hasThemeChanged, theme, mounted]);

  const totalProgress = visitedPaths.length + (hasThemeChanged ? 1 : 0);
  const currentStage = Math.min(
    Math.ceil((totalProgress / TOTAL_STEPS) * 6),
    6
  );

  return {
    visitedPaths,
    currentStage,
    isComplete,
    totalSteps: TOTAL_STEPS,
    visitedCount: visitedPaths.length,
    themeChanged: hasThemeChanged,
    totalProgress,
  };
}
