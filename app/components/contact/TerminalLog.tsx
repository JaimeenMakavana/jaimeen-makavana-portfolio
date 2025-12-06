"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TerminalLogProps {
  activeField: string | null;
}

export const TerminalLog = ({ activeField }: TerminalLogProps) => (
  <div className="font-mono text-[10px] md:text-xs text-neutral-400 mt-8 p-4 border-t border-dashed border-neutral-300">
    <div className="flex gap-2">
      <span className="text-[#e4e987] bg-black px-1">STATUS</span>
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
          <span className="text-black">&quot;</span>
          <span>
            DETECTED_ACTIVITY:{" "}
            <span className="text-black font-bold uppercase">
              {activeField}
            </span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
