"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CompletionPopup({ isOpen, onClose }: CompletionPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[20000]"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[20001] w-[90vw] max-w-[500px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-[#0a0a0a] border border-[#e4e987]/30 rounded-lg p-8 shadow-2xl text-center"
              style={{
                boxShadow:
                  "0 0 40px rgba(228, 233, 135, 0.3), inset 0 0 20px rgba(228, 233, 135, 0.05)",
              }}
            >
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold mb-4"
                style={{
                  color: "#e4e987",
                  textShadow: "0 0 12px rgba(228, 233, 135, 0.6)",
                }}
              >
                Exploration Complete!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-base mb-6"
                style={{
                  color: "#d4d4d4",
                }}
              >
                You've unlocked access to the contact portal.
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
