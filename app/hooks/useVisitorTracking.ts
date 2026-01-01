"use client";

import { useEffect, useState } from "react";

interface VisitorTrackingOptions {
  enabled?: boolean;
}

// Generate a unique user ID that persists across sessions (localStorage)
function getUniqueUserId(): string {
  if (typeof window === "undefined") return "";

  const storageKey = "portfolio_unique_user_id";
  let userId = localStorage.getItem(storageKey);

  if (!userId) {
    // Create a unique ID based on timestamp + random + browser fingerprint
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ].join("|");

    // Simple hash of fingerprint
    const hash = fingerprint.split("").reduce((acc, char) => {
      const hash = (acc << 5) - acc + char.charCodeAt(0);
      return hash & hash;
    }, 0);

    userId = `user_${Date.now()}_${Math.abs(hash).toString(36)}`;
    localStorage.setItem(storageKey, userId);
  }

  return userId;
}

// Check if user was already tracked in this session
// Using sessionStorage so returning visitors are tracked again
function hasUserBeenTracked(): boolean {
  if (typeof window === "undefined") return false;

  const storageKey = "portfolio_user_tracked_session";
  return sessionStorage.getItem(storageKey) === "true";
}

// Mark user as tracked for this session
function markUserAsTracked(): void {
  if (typeof window === "undefined") return;

  const storageKey = "portfolio_user_tracked_session";
  sessionStorage.setItem(storageKey, "true");
}

export function useVisitorTracking(options: VisitorTrackingOptions = {}) {
  const { enabled = true } = options;
  const [isTracking, setIsTracking] = useState(false);

  // Track unique user only once
  useEffect(() => {
    if (!enabled) return;

    // Check if user was already tracked
    if (hasUserBeenTracked()) {
      return; // User already tracked, skip
    }

    // Track after a short delay to ensure page is loaded
    const timeout = setTimeout(async () => {
      setIsTracking(true);

      try {
        const userId = getUniqueUserId();

        const visitorData = {
          userId, // Unique user identifier
          userAgent: navigator.userAgent,
          referrer: document.referrer || "direct",
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: navigator.language,
          timestamp: new Date().toISOString(),
        };

        // Send to analytics API
        const response = await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(visitorData),
        });

        if (response.ok) {
          // Mark user as tracked only on success
          markUserAsTracked();
        } else {
          // Handle rate limit errors gracefully
          if (response.status === 429) {
            const retryAfter = response.headers.get("Retry-After");
            console.warn(`Analytics rate limited. Retry after ${retryAfter}s`);
          } else if (response.status === 503) {
            console.warn(
              "Analytics service temporarily unavailable (GitHub API limit)"
            );
          } else {
            console.warn("Failed to track visitor:", await response.text());
          }
        }
      } catch (error) {
        console.error("Error tracking visitor:", error);
      } finally {
        setIsTracking(false);
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [enabled]); // Only run once on mount

  return { isTracking };
}
