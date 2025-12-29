"use client";

import React, { memo, useMemo, useCallback } from "react";
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
  onFormStateChange: (newState: Partial<FormState>) => void;
  onActiveFieldChange: (field: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  isSuccess?: boolean;
  error?: string | null;
}

// Static styles extracted outside component
const STATIC_STYLES = {
  label: { color: "var(--text-display)" },
  inputBase: {
    borderColor: "var(--border)",
    color: "var(--text-body)",
  },
  submitButton: {
    backgroundColor: "var(--nav-surface)",
    color: "var(--nav-text-idle)",
  },
  successMessage: {
    color: "var(--bg-accent-glow)",
    backgroundColor: "var(--nav-surface)",
  },
} as const;

// Memoized Intent Button Component
const IntentButton = memo(
  ({
    option,
    isSelected,
    onSelect,
  }: {
    option: (typeof INTENT_OPTIONS)[0];
    isSelected: boolean;
    onSelect: () => void;
  }) => {
    const buttonStyle = useMemo(
      () => ({
        backgroundColor: isSelected ? "var(--nav-surface)" : "var(--card)",
        color: isSelected ? "var(--bg-accent-glow)" : "var(--text-muted)",
        borderColor: isSelected ? "var(--nav-surface)" : "var(--border)",
      }),
      [isSelected]
    );

    const descStyle = useMemo(
      () => ({
        color: "var(--text-muted)",
        opacity: isSelected ? 0.7 : 0.5,
      }),
      [isSelected]
    );

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--text-display)";
          e.currentTarget.style.opacity = "0.3";
        }
      },
      [isSelected]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = "var(--border)";
          e.currentTarget.style.opacity = "1";
        }
      },
      [isSelected]
    );

    return (
      <button
        type="button"
        onClick={onSelect}
        className="p-3 text-left border rounded-xl transition-all duration-300"
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="font-bold text-sm uppercase">{option.label}</div>
        <div className="text-xs" style={descStyle}>
          {option.desc}
        </div>
      </button>
    );
  }
);

IntentButton.displayName = "IntentButton";

export const ContactForm = memo(
  ({
    formState,
    onFormStateChange,
    onActiveFieldChange,
    onSubmit,
    isLoading = false,
    isSuccess = false,
    error = null,
  }: ContactFormProps) => {
    // Memoize placeholder text
    const messagePlaceholder = useMemo(
      () =>
        formState.intent === "project"
          ? "Tell me about the problem you're solving..."
          : "How can I help you?",
      [formState.intent]
    );

    // Memoized event handlers
    const handleIntentSelect = useCallback(
      (intent: string) => () => onFormStateChange({ intent }),
      [onFormStateChange]
    );

    const handleNameFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        onActiveFieldChange("NAME_INPUT");
        e.currentTarget.style.borderColor = "var(--text-display)";
      },
      [onActiveFieldChange]
    );

    const handleEmailFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        onActiveFieldChange("EMAIL_INPUT");
        e.currentTarget.style.borderColor = "var(--text-display)";
      },
      [onActiveFieldChange]
    );

    const handleMessageFocus = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        onActiveFieldChange("MESSAGE_BODY");
        e.currentTarget.style.borderColor = "var(--text-display)";
      },
      [onActiveFieldChange]
    );

    const handleBlur = useCallback(() => {
      onActiveFieldChange(null);
    }, [onActiveFieldChange]);

    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onFormStateChange({ name: e.target.value });
      },
      [onFormStateChange]
    );

    const handleEmailChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onFormStateChange({ email: e.target.value });
      },
      [onFormStateChange]
    );

    const handleMessageChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onFormStateChange({ message: e.target.value });
      },
      [onFormStateChange]
    );

    const handleSubmitMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isLoading && !isSuccess) {
          e.currentTarget.style.backgroundColor = "var(--bg-accent-glow)";
          e.currentTarget.style.color = "var(--text-display)";
        }
      },
      [isLoading, isSuccess]
    );

    const handleSubmitMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isLoading && !isSuccess) {
          e.currentTarget.style.backgroundColor = "var(--nav-surface)";
          e.currentTarget.style.color = "var(--nav-text-idle)";
        }
      },
      [isLoading, isSuccess]
    );

    return (
      <form onSubmit={onSubmit} className="space-y-8 relative">
        {/* Context Selector (Filtering) */}
        <div className="space-y-3">
          <label
            className="text-sm font-mono uppercase font-bold tracking-widest flex items-center gap-2"
            style={STATIC_STYLES.label}
          >
            <Terminal className="w-4 h-4" />
            Input: Intent_Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            {INTENT_OPTIONS.map((opt) => (
              <IntentButton
                key={opt.id}
                option={opt}
                isSelected={formState.intent === opt.id}
                onSelect={handleIntentSelect(opt.id)}
              />
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
              style={STATIC_STYLES.inputBase}
              onFocus={handleNameFocus}
              onBlur={handleBlur}
              onChange={handleNameChange}
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
              style={STATIC_STYLES.inputBase}
              onFocus={handleEmailFocus}
              onBlur={handleBlur}
              onChange={handleEmailChange}
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
              placeholder={messagePlaceholder}
              className="w-full bg-transparent border-b py-4 text-xl outline-none transition-colors resize-none"
              style={STATIC_STYLES.inputBase}
              onFocus={handleMessageFocus}
              onBlur={handleBlur}
              onChange={handleMessageChange}
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
            style={STATIC_STYLES.submitButton}
            onMouseEnter={handleSubmitMouseEnter}
            onMouseLeave={handleSubmitMouseLeave}
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
                style={STATIC_STYLES.successMessage}
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
  },
  (prevProps, nextProps) => {
    // Return true to skip re-render if props are equal
    return (
      prevProps.formState.name === nextProps.formState.name &&
      prevProps.formState.email === nextProps.formState.email &&
      prevProps.formState.message === nextProps.formState.message &&
      prevProps.formState.intent === nextProps.formState.intent &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isSuccess === nextProps.isSuccess &&
      prevProps.error === nextProps.error &&
      prevProps.onFormStateChange === nextProps.onFormStateChange &&
      prevProps.onActiveFieldChange === nextProps.onActiveFieldChange &&
      prevProps.onSubmit === nextProps.onSubmit
    );
  }
);

ContactForm.displayName = "ContactForm";
