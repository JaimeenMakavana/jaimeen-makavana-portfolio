"use client";

import React from "react";
import {
  ArrowRight,
  Terminal,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { INTENT_OPTIONS, FormState } from "./constants";
import { motion, AnimatePresence } from "framer-motion";

interface ContactFormProps {
  formState: FormState;
  activeField: string | null;
  onFormStateChange: (newState: Partial<FormState>) => void;
  onActiveFieldChange: (field: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: string | null;
}

export const ContactForm = ({
  formState,
  activeField,
  onFormStateChange,
  onActiveFieldChange,
  onSubmit,
  isLoading = false,
  isSuccess = false,
  error = null,
}: ContactFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8 relative">
      {/* Context Selector (Filtering) */}
      <div className="space-y-3">
        <label
          className="text-sm font-mono uppercase font-bold tracking-widest flex items-center gap-2"
          style={{ color: "var(--text-display)" }}
        >
          <Terminal className="w-4 h-4" />
          Input: Intent_Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {INTENT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onFormStateChange({ intent: opt.id })}
              className="p-3 text-left border rounded-xl transition-all duration-300"
              style={{
                backgroundColor:
                  formState.intent === opt.id
                    ? "var(--nav-surface)"
                    : "var(--card)",
                color:
                  formState.intent === opt.id
                    ? "var(--bg-accent-glow)"
                    : "var(--text-muted)",
                borderColor:
                  formState.intent === opt.id
                    ? "var(--nav-surface)"
                    : "var(--border)",
              }}
              onMouseEnter={(e) => {
                if (formState.intent !== opt.id) {
                  e.currentTarget.style.borderColor = "var(--text-display)";
                  e.currentTarget.style.borderColor = "var(--text-display)";
                  e.currentTarget.style.opacity = "0.3";
                }
              }}
              onMouseLeave={(e) => {
                if (formState.intent !== opt.id) {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.opacity = "1";
                }
              }}
            >
              <div className="font-bold text-sm uppercase">{opt.label}</div>
              <div
                className="text-xs"
                style={{
                  color:
                    formState.intent === opt.id
                      ? "var(--text-muted)"
                      : "var(--text-muted)",
                  opacity: formState.intent === opt.id ? 0.7 : 0.5,
                }}
              >
                {opt.desc}
              </div>
            </button>
          ))}
        </div>
        {/* Hidden Input for Intent (for Netlify/Formspree parsing) */}
        <input type="hidden" name="intent" value={formState.intent} />
      </div>

      {/* Inputs */}
      <div className="space-y-6">
        {/* NAME INPUT */}
        <div className="group relative">
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your Name"
            className="w-full bg-transparent border-b py-4 text-xl outline-none transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-body)",
            }}
            onFocus={(e) => {
              onActiveFieldChange("NAME_INPUT");
              e.currentTarget.style.borderColor = "var(--text-display)";
            }}
            onBlur={() => onActiveFieldChange(null)}
            onChange={(e) => onFormStateChange({ name: e.target.value })}
            value={formState.name}
          />
        </div>

        {/* EMAIL INPUT (Mail ID Added Here) */}
        <div className="group relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="Your Mail ID"
            className="w-full bg-transparent border-b py-4 text-xl outline-none transition-colors"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-body)",
            }}
            onFocus={(e) => {
              onActiveFieldChange("EMAIL_INPUT");
              e.currentTarget.style.borderColor = "var(--text-display)";
            }}
            onBlur={() => onActiveFieldChange(null)}
            onChange={(e) => onFormStateChange({ email: e.target.value })}
            value={formState.email}
          />
        </div>

        {/* MESSAGE INPUT */}
        <div className="group relative">
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            placeholder={
              formState.intent === "project"
                ? "Tell me about the problem you're solving..."
                : "How can I help you?"
            }
            className="w-full bg-transparent border-b py-4 text-xl outline-none transition-colors resize-none"
            style={{
              borderColor: "var(--border)",
              color: "var(--text-body)",
            }}
            onFocus={(e) => {
              onActiveFieldChange("MESSAGE_BODY");
              e.currentTarget.style.borderColor = "var(--text-display)";
            }}
            onBlur={() => onActiveFieldChange(null)}
            onChange={(e) => onFormStateChange({ message: e.target.value })}
            value={formState.message}
          />
        </div>
      </div>

      {/* Submit Button (Actionability) */}
      <div className="pt-4 space-y-3">
        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className="group w-full md:w-auto flex items-center justify-between gap-6 px-8 py-4 rounded-full text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--nav-surface)",
            color: "var(--nav-text-idle)",
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !isSuccess) {
              e.currentTarget.style.backgroundColor = "var(--bg-accent-glow)";
              e.currentTarget.style.color = "var(--text-display)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !isSuccess) {
              e.currentTarget.style.backgroundColor = "var(--nav-surface)";
              e.currentTarget.style.color = "var(--nav-text-idle)";
            }
          }}
        >
          {isLoading ? (
            <>
              <span className="font-mono uppercase tracking-widest">
                Transmitting...
              </span>
              <Loader2 className="w-5 h-5 animate-spin" />
            </>
          ) : isSuccess ? (
            <>
              <span className="font-mono uppercase tracking-widest">
                Message Sent
              </span>
              <CheckCircle2 className="w-5 h-5" />
            </>
          ) : (
            <>
              <span className="font-mono uppercase tracking-widest">
                Transmit Message
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-red-600 text-sm font-mono"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Message */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-mono"
              style={{
                color: "var(--bg-accent-glow)",
                backgroundColor: "var(--nav-surface)",
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Signal transmitted successfully. Stand by for response.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};
