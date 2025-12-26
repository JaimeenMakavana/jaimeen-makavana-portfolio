"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useExploration } from "../hooks/useExploration";

export function DecryptionProgressBar() {
  const { progress } = useExploration();
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 w-full h-[3px] md:h-[4px] z-[10000] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Background Track */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(2px)",
          }}
        />

        {/* Progress Fill with Neon Gradient */}
        <motion.div
          className="absolute top-0 left-0 h-full"
          style={{
            background:
              "linear-gradient(90deg, #e4e987 0%, #d4db70 50%, #c4cb60 100%)",
            boxShadow: "0 0 10px rgba(228, 233, 135, 0.6)",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.6,
            ease: "easeOut",
          }}
        >
          {/* Pulsing effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(228, 233, 135, 0.4) 50%, transparent 100%)",
            }}
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
