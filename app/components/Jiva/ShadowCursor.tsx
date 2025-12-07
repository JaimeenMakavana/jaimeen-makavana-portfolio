"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useJivaPresence } from "../../context/JivaPresenceContext";

export const ShadowCursor = () => {
  const { state, message } = useJivaPresence();

  // 1. Physics Engine
  // We track raw mouse position, but render a "spring" version
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // The "Organic" lag. Stiffness/damping control the "weight" of the agent.
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // 2. Global Mouse Tracker
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [mouseX, mouseY]);

  // 3. Dynamic Variants based on Intent
  const variants = {
    idle: {
      height: 16,
      width: 16,
      backgroundColor: "#e4e987", // Your brand accent
      mixBlendMode: "difference" as const,
    },
    watching: {
      height: 48,
      width: 48,
      backgroundColor: "rgba(228, 233, 135, 0.2)",
      border: "1px solid #e4e987",
      mixBlendMode: "normal" as const,
    },
    acting: {
      height: 12,
      width: 12,
      scale: 0.8,
      backgroundColor: "#00ff00",
    },
    reading: {
      height: 24,
      width: 24,
      backgroundColor: "rgba(228, 233, 135, 0.4)",
      mixBlendMode: "normal" as const,
    },
  };

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full z-[9999] pointer-events-none flex items-center justify-center backdrop-blur-[1px]"
      style={{ x, y, translateX: "-50%", translateY: "-50%" }}
      animate={state}
      variants={variants}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Icon only appears when 'watching' */}
      <AnimatePresence>
        {state === "watching" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Sparkles className="w-4 h-4 text-[#e4e987]" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Thought Bubble */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 30, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="absolute left-full top-0 bg-black text-[#e4e987] text-[10px] font-mono px-3 py-1.5 rounded-lg whitespace-nowrap border border-white/10 shadow-xl"
          >
            {">"} {message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

