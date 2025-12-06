"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
  Terminal,
  Calendar,
} from "lucide-react";
import Link from "next/link";

// --- DUMMY DATA ---
const CONTACT_INFO = {
  email: "jaimeen@example.com",
  socials: [
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/jaimeen",
      icon: Linkedin,
    },
    { label: "Twitter / X", href: "https://x.com/jaimeen", icon: Twitter },
    { label: "GitHub", href: "https://github.com/jaimeen", icon: Github },
  ],
  calendlyLink: "https://calendly.com/jaimeen/15min",
};

const INTENT_OPTIONS = [
  {
    id: "project",
    label: "New Project",
    desc: "Building a product from scratch",
  },
  { id: "hiring", label: "Hiring", desc: "Joining a technical team" },
  { id: "consulting", label: "Consulting", desc: "Architecture or AI advice" },
  { id: "hi", label: "Just Hi", desc: "Networking & vibes" },
];

// --- COMPONENTS ---

const TerminalLog = ({ activeField }: { activeField: string | null }) => (
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

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
    intent: "project",
  });
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(CONTACT_INFO.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Connect to Formspree or API route here
    alert("Signal transmitted. Stand by for response.");
  };

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 pt-24 pb-32">
      {/* 1. HEADER: The Hook (Active Voice) */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1
          className="text-[12vw] md:text-[7vw] leading-[0.8] font-black uppercase tracking-tighter text-black mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Start The <br />{" "}
          <span
            className="text-transparent"
            style={{
              WebkitTextStroke: "1px black",
              color: "var(--bg-accent-glow)",
            }}
          >
            Transformation
          </span>
        </h1>
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-black pb-8">
          <p className="max-w-xl text-lg md:text-xl text-neutral-600 font-light">
            Ready to engineer something scalable? I treat every message as a
            high-priority signal.
            <span className="block mt-2 text-black font-medium">
              Average response time: &lt; 24 Hours.
            </span>
          </p>
          {/* Calendly Button (High Intent) */}
          <Link
            href={CONTACT_INFO.calendlyLink}
            target="_blank"
            className="group flex items-center gap-2 px-6 py-3 bg-white border border-black rounded-full hover:bg-black hover:text-[#e4e987] transition-all duration-300"
          >
            <Calendar className="w-4 h-4" />
            <span className="font-mono text-sm tracking-widest uppercase">
              Book 15-min Call
            </span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24">
        {/* 2. LEFT COL: Contact Info & Terminal Logic */}
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

        {/* 3. RIGHT COL: The "Contextual" Form */}
        <form onSubmit={handleSubmit} className="space-y-8 relative">
          {/* Context Selector (Filtering) */}
          <div className="space-y-3">
            <label className="text-sm font-mono uppercase text-black font-bold tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Input: Intent_Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {INTENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormState({ ...formState, intent: opt.id })}
                  className={`p-3 text-left border rounded-xl transition-all duration-300 ${
                    formState.intent === opt.id
                      ? "bg-black text-[#e4e987] border-black"
                      : "bg-white text-neutral-500 border-neutral-200 hover:border-black/30"
                  }`}
                >
                  <div className="font-bold text-sm uppercase">{opt.label}</div>
                  <div
                    className={`text-xs ${
                      formState.intent === opt.id
                        ? "text-neutral-400"
                        : "text-neutral-300"
                    }`}
                  >
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-6">
            <div className="group relative">
              <input
                type="text"
                required
                placeholder="Your Name"
                className="w-full bg-transparent border-b border-neutral-300 py-4 text-xl outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                onFocus={() => setActiveField("NAME_INPUT")}
                onBlur={() => setActiveField(null)}
                onChange={(e) =>
                  setFormState({ ...formState, name: e.target.value })
                }
              />
            </div>
            <div className="group relative">
              <input
                type="email"
                required
                placeholder="Your Email"
                className="w-full bg-transparent border-b border-neutral-300 py-4 text-xl outline-none focus:border-black transition-colors placeholder:text-neutral-300"
                onFocus={() => setActiveField("EMAIL_INPUT")}
                onBlur={() => setActiveField(null)}
                onChange={(e) =>
                  setFormState({ ...formState, email: e.target.value })
                }
              />
            </div>
            <div className="group relative">
              <textarea
                required
                rows={4}
                placeholder={
                  formState.intent === "project"
                    ? "Tell me about the problem you're solving..."
                    : "How can I help you?"
                }
                className="w-full bg-transparent border-b border-neutral-300 py-4 text-xl outline-none focus:border-black transition-colors placeholder:text-neutral-300 resize-none"
                onFocus={() => setActiveField("MESSAGE_BODY")}
                onBlur={() => setActiveField(null)}
                onChange={(e) =>
                  setFormState({ ...formState, message: e.target.value })
                }
              />
            </div>
          </div>

          {/* Submit Button (Actionability) */}
          <div className="pt-4">
            <button
              type="submit"
              className="group w-full md:w-auto flex items-center justify-between gap-6 bg-black text-white px-8 py-4 rounded-full text-lg hover:bg-[#e4e987] hover:text-black transition-all duration-300"
            >
              <span className="font-mono uppercase tracking-widest">
                Transmit Message
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
