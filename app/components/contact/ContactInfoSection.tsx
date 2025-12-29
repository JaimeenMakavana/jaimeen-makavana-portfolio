"use client";

import React, { useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import Link from "next/link";
import { CONTACT_INFO } from "./constants";
import { TerminalLog } from "./TerminalLog";

interface ContactInfoSectionProps {
  activeField: string | null;
}

export const ContactInfoSection = memo(
  ({ activeField }: ContactInfoSectionProps) => {
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
          <label
            className="text-xs font-mono uppercase mb-2 block tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Direct Channel
          </label>
          <button
            onClick={handleCopy}
            className="w-full text-left text-3xl md:text-5xl font-light transition-colors flex items-center gap-4 group"
            style={{
              fontFamily: "var(--font-alumni)",
              color: "var(--text-body)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {CONTACT_INFO.email}
            <div className="relative">
              <Copy
                className={`w-6 h-6 transition-all ${
                  copied ? "opacity-0 scale-0" : "opacity-100 scale-100"
                }`}
                style={{ color: "var(--text-muted)" }}
              />
              <Check
                className={`w-6 h-6 rounded-full p-1 absolute top-0 left-0 transition-all ${
                  copied ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
                style={{
                  color: "var(--bg-accent-glow)",
                  backgroundColor: "var(--nav-surface)",
                }}
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
                className="absolute top-full left-0 mt-2 text-xs font-mono px-3 py-1 rounded"
                style={{
                  backgroundColor: "var(--nav-surface)",
                  color: "var(--bg-accent-glow)",
                }}
              >
                Copied to clipboard
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Social Links (Multi-Channel) */}
        <div>
          <label
            className="text-xs font-mono uppercase mb-4 block tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Other Frequencies
          </label>
          <div className="flex flex-wrap gap-4">
            {CONTACT_INFO.socials.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 border rounded-lg transition-all"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-body)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--text-display)";
                  e.currentTarget.style.backgroundColor = "var(--muted)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
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
  },
  (prevProps, nextProps) => {
    // Only re-render if activeField changes
    return prevProps.activeField === nextProps.activeField;
  }
);

ContactInfoSection.displayName = "ContactInfoSection";
