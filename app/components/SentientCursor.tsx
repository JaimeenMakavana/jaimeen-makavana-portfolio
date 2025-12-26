"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIdle } from "../hooks/useIdle";

interface IdleMessage {
  threshold: number; // Time in ms when this message should appear
  messages: string[];
  category: string;
}

const IDLE_MESSAGES: IdleMessage[] = [
  {
    threshold: 3000,
    messages: [
      "Staring contest? I'm winning so far.",
      "Checking for typos? I promise I used spell-check.",
      "I see you... not clicking anything.",
      "Is my cursor tracking working, or are you just frozen?",
    ],
    category: "The Icebreaker",
  },
  {
    threshold: 6000,
    messages: [
      "Fun fact: That sidebar on the left is 100% organic.",
      "My icons have feelings too. Maybe give one a click?",
      "If you're looking for the 'Hire Me' button, it's disguised as an envelope.",
    ],
    category: "The Sidebar Nudge",
  },
  {
    threshold: 10000,
    messages: [
      "The contact icon is getting lonely. It told me so.",
      "If you click 'Contact', a puppy gets a treat. (Not legally binding).",
      "I put 48 hours of CSS into those icons. Don't let them die in vain.",
      "Waiting for a sign? This is it. Look right.",
    ],
    category: "Absurdist Motivation",
  },
  {
    threshold: 15000,
    messages: [
      "Okay, now you're just here for the free AC, aren't you?",
      "You’ve been here so long we’re basically friends now. Send an email!",
      "Warning: Prolonged staring at this bio may cause extreme desire to collaborate.",
    ],
    category: "The Closer",
  },
];

export function SentientCursor() {
  const { isIdle, idleTime } = useIdle({ threshold: 3000 });
  const [message, setMessage] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [showMessage, setShowMessage] = useState(false);
  const [displayedMessage, setDisplayedMessage] = useState<string>("");
  const typewriterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef<string>("");
  const hasInitializedRef = useRef(false);
  const currentThresholdIndexRef = useRef<number>(-1);
  const messageSeedRef = useRef<number>(0);

  // Track cursor position and instantly hide on movement
  useEffect(() => {
    // Initialize cursor position to center of screen if not yet moved
    if (typeof window !== "undefined" && !hasInitializedRef.current) {
      setCursorPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
      hasInitializedRef.current = true;
    }

    let rafId: number | null = null;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Throttle using requestAnimationFrame (60fps max)
      if (rafId === null) {
        rafId = requestAnimationFrame(() => {
          // Only update if position actually changed (micro-optimization)
          if (e.clientX !== lastX || e.clientY !== lastY) {
            lastX = e.clientX;
            lastY = e.clientY;

            // Batch all state updates together
            setCursorPosition({ x: e.clientX, y: e.clientY });
            setShowMessage(false);
            setDisplayedMessage("");

            if (typewriterTimeoutRef.current) {
              clearTimeout(typewriterTimeoutRef.current);
            }
          }
          rafId = null;
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Select message based on idle time
  useEffect(() => {
    if (!isIdle) {
      setShowMessage(false);
      setMessage("");
      setDisplayedMessage("");
      lastMessageRef.current = "";
      currentThresholdIndexRef.current = -1;
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }
      return;
    }

    // Find the appropriate message group based on idle time
    let thresholdIndex = 0; // Default to first group

    // Check which threshold we've reached
    for (let i = IDLE_MESSAGES.length - 1; i >= 0; i--) {
      if (idleTime >= IDLE_MESSAGES[i].threshold) {
        thresholdIndex = i;
        break;
      }
    }

    // Only update message if we've crossed into a NEW threshold
    // Also check if current message is complete before switching (or if no message exists)
    const hasNoMessage = !message || message.length === 0;
    const isCurrentMessageComplete =
      hasNoMessage || (displayedMessage === message && message.length > 0);

    if (
      thresholdIndex !== currentThresholdIndexRef.current &&
      isCurrentMessageComplete
    ) {
      currentThresholdIndexRef.current = thresholdIndex;
      const messageGroup = IDLE_MESSAGES[thresholdIndex];

      // Use a seed-based selection for consistency (same threshold = same message)
      // But allow randomness by using a seed that changes when threshold changes
      messageSeedRef.current =
        thresholdIndex * 1000 + Math.floor(idleTime / 1000);
      const messageIndex =
        messageSeedRef.current % messageGroup.messages.length;
      const selectedMessage = messageGroup.messages[messageIndex];

      setMessage(selectedMessage);
      lastMessageRef.current = selectedMessage;

      // Clear any existing typewriter
      if (typewriterTimeoutRef.current) {
        clearTimeout(typewriterTimeoutRef.current);
      }

      // Typewriter effect - start immediately with first character
      let charIndex = 0;
      setDisplayedMessage(selectedMessage.charAt(0));

      const typeNextChar = () => {
        charIndex++;
        if (charIndex < selectedMessage.length) {
          const newText = selectedMessage.slice(0, charIndex + 1);
          setDisplayedMessage(newText);
          // Faster typewriter: 25ms for snappier feel
          typewriterTimeoutRef.current = setTimeout(typeNextChar, 25);
        } else {
          // Complete the message
          setDisplayedMessage(selectedMessage);
          setShowMessage(true);
        }
      };

      // Start typewriter after first character is shown
      typewriterTimeoutRef.current = setTimeout(typeNextChar, 25);
    }
    // If we're in the same threshold, don't do anything - let the typewriter continue
  }, [isIdle, idleTime]);

  // Always show if we have a displayed message, regardless of cursor position
  const shouldShow = displayedMessage && displayedMessage.length > 0;

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div
          key={message} // Use message as key, not displayedMessage (prevents re-animation on each char)
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            y: -35,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -50,
            scale: 0.8,
            transition: { duration: 0.15 }, // Fast fade out
          }}
          transition={{
            duration: 0.3, // Faster entrance animation
            ease: [0.16, 1, 0.3, 1], // Custom easing for smooth float
          }}
          className="fixed pointer-events-none"
          style={{
            left: `${cursorPosition.x}px`,
            top: `${cursorPosition.y}px`,
            fontFamily: "monospace",
            fontSize: "11px",
            textShadow: "0 0 8px var(--bg-accent-glow)",
            whiteSpace: "nowrap",
            userSelect: "none",
            fontWeight: "400",
            letterSpacing: "0.5px",
            transform: "translate(-50%, -100%)",
            willChange: "transform, opacity",
            zIndex: 9999,
          }}
        >
          {displayedMessage}
          {showMessage && displayedMessage === message && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              _
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
