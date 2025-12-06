"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import Link from "next/link";
import { CONTACT_INFO } from "./constants";
import { TerminalLog } from "./TerminalLog";

interface ContactInfoSectionProps {
  activeField: string | null;
}

export const ContactInfoSection = ({
  activeField,
}: ContactInfoSectionProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTACT_INFO.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">
      {/* The "Click-to-Copy" Email (Friction Reduction) */}
      <div className="relative group">
        <label className="text-xs font-mono uppercase text-neutral-400 mb-2 block tracking-widest">
          Direct Channel
        </label>
        <button
          onClick={handleCopy}
          className="w-full text-left text-3xl md:text-5xl font-light hover:text-black/60 transition-colors flex items-center gap-4 group"
          style={{ fontFamily: "var(--font-alumni)" }}
        >
          {CONTACT_INFO.email}
          <div className="relative">
            <Copy
              className={`w-6 h-6 text-neutral-300 group-hover:text-black transition-all ${
                copied ? "opacity-0 scale-0" : "opacity-100 scale-100"
              }`}
            />
            <Check
              className={`w-6 h-6 text-[#e4e987] bg-black rounded-full p-1 absolute top-0 left-0 transition-all ${
                copied ? "opacity-100 scale-100" : "opacity-0 scale-0"
              }`}
            />
          </div>
        </button>

        {/* Micro-Interaction Notification */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-full left-0 mt-2 bg-black text-[#e4e987] text-xs font-mono px-3 py-1 rounded"
            >
              Copied to clipboard
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Social Links (Multi-Channel) */}
      <div>
        <label className="text-xs font-mono uppercase text-neutral-400 mb-4 block tracking-widest">
          Other Frequencies
        </label>
        <div className="flex flex-wrap gap-4">
          {CONTACT_INFO.socials.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-lg hover:border-black hover:bg-neutral-50 transition-all"
            >
              <social.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{social.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Developer Vibe Decor */}
      <TerminalLog activeField={activeField} />
    </div>
  );
};
