"use client";

import { useVisitorTracking } from "../hooks/useVisitorTracking";

export function VisitorTracker() {
  // Track unique users once per session
  useVisitorTracking({
    enabled: true,
  });

  return null; // This component doesn't render anything
}

