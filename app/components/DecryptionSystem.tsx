"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useExploration } from "../hooks/useExploration";
import { CompletionPopup } from "./TerminalPopup";

const POPUP_SHOWN_KEY = "portfolio_exploration_popup_shown";
const EXCLUDED_PATHS = ["/admin", "/login"];

export function DecryptionSystem() {
  const pathname = usePathname();
  const { isComplete } = useExploration();
  const [showTerminal, setShowTerminal] = useState(false);
  const [showScanline, setShowScanline] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we're on an excluded path (admin, login, etc.)
  const isExcludedPath = EXCLUDED_PATHS.some((excluded) =>
    pathname?.startsWith(excluded)
  );

  // Trigger effects when completion is reached (only once)
  useEffect(() => {
    // Don't show popup on admin/login routes
    if (isExcludedPath) {
      return;
    }

    // Check if popup has already been shown (persistent across sessions)
    if (typeof window !== "undefined") {
      const popupShown = localStorage.getItem(POPUP_SHOWN_KEY) === "true";
      if (popupShown) {
        return; // Popup already shown, don't show again
      }
    }

    if (isComplete && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;

      // Mark popup as shown in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(POPUP_SHOWN_KEY, "true");
      }

      // Haptic feedback for mobile devices
      if (typeof window !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]);
      }

      // Add scanline overlay
      setShowScanline(true);

      // Show terminal after a brief delay
      const terminalTimeout = setTimeout(() => {
        setShowTerminal(true);
      }, 1000);

      return () => clearTimeout(terminalTimeout);
    }
  }, [isComplete, isExcludedPath]);

  // Reset trigger when exploration resets (if needed)
  useEffect(() => {
    if (!isComplete) {
      hasTriggeredRef.current = false;
    }
  }, [isComplete]);

  const handleTerminalClose = () => {
    setShowTerminal(false);
    // Keep scanline for a bit after terminal closes
    setTimeout(() => {
      setShowScanline(false);
    }, 2000);
  };

  // Don't render anything until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Scanline Overlay - appears on completion */}
      {showScanline && (
        <div
          className="fixed inset-0 pointer-events-none z-[15000]"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(228, 233, 135, 0.03) 2px, rgba(228, 233, 135, 0.03) 4px)",
            animation: "scanline 8s linear infinite",
          }}
        />
      )}

      {/* Completion Popup */}
      <CompletionPopup isOpen={showTerminal} onClose={handleTerminalClose} />
    </>
  );
}
