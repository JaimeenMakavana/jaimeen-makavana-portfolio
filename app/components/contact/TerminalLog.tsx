"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TerminalLogProps {
  activeField: string | null;
}

export const TerminalLog = ({ activeField }: TerminalLogProps) => (
  <div
    className="font-mono text-[10px] md:text-xs mt-8 p-4 border-t border-dashed"
    style={{
      color: "var(--text-muted)",
      borderColor: "var(--border)",
    }}
  >
    <div className="flex gap-2">
      <span
        className="px-1"
        style={{
          color: "var(--bg-accent-glow)",
          backgroundColor: "var(--nav-surface)",
        }}
      >
        STATUS
      </span>
      <span>WAITING_FOR_INPUT...</span>
    </div>
    <AnimatePresence mode="wait">
      {activeField && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex gap-2 mt-1"
        >
          <span style={{ color: "var(--text-display)" }}>&quot;</span>
          <span>
            DETECTED_ACTIVITY:{" "}
            <span
              className="font-bold uppercase"
              style={{ color: "var(--text-display)" }}
            >
              {activeField}
            </span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
