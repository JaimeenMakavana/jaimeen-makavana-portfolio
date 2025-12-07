"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, ArrowRight } from "lucide-react";
import { useJivaCore } from "../hooks/useJivaCore";

export default function JivaPage() {
  const { messages, input, setInput, sendMessage, isLoading } = useJivaCore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#e4e987] opacity-10 blur-[150px] rounded-full pointer-events-none" />

      {/* HEADER CONTENT */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-white mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-500"></span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
            System Status: {isLoading ? "Processing" : "Online"}
          </span>
        </div>
        <h1
          className="text-6xl md:text-9xl font-black uppercase tracking-tight leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          JIVA{" "}
          <span
            className="text-transparent stroke-black"
            style={{ WebkitTextStroke: "1px black" }}
          >
            AGENT
          </span>
        </h1>
        <p className="mt-4 text-neutral-500 max-w-md mx-auto font-mono text-sm">
          Your intelligent interface for navigating my digital brain.
          <br />
          Ask me to navigate anywhere in the portfolio.
        </p>
      </motion.div>

      {/* THE AGENT INTERFACE (Placeholder) */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden relative z-10 flex flex-col h-[500px]"
      >
        {/* Chat Header */}
        <div className="bg-neutral-50 border-b border-neutral-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[#e4e987]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-sm">Jiva_Core</div>
              <div className="text-[10px] text-neutral-400 font-mono uppercase">
                v1.0.0 (Active)
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-neutral-200" />
            <div className="w-3 h-3 rounded-full bg-neutral-200" />
          </div>
        </div>

        {/* Chat/Log Area */}
        <div
          ref={scrollRef}
          className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-3 bg-[#0a0a0a] text-green-500/80"
        >
          {messages.length === 0 && (
            <div className="text-neutral-500 pb-4 border-b border-white/10 mb-4">
              {"// JIVA_CORE v1.0.0"}
              <br />
              {"// Navigation Agent Active"}
              <br />
              {"// Try: 'go to projects' or 'show me the about page'"}
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "model" && (
                  <span className="text-neutral-600 shrink-0">{`>`}</span>
                )}
                <span
                  className={`${
                    msg.role === "user"
                      ? "text-blue-400/90"
                      : "text-green-500/80"
                  }`}
                >
                  {msg.content}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-neutral-500"
            >
              <span className="text-neutral-600 shrink-0">{`>`}</span>
              <span className="flex items-center gap-1">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  Jiva is thinking
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-2 h-4 bg-green-500 inline-block align-middle"
                />
              </span>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-neutral-200">
          <form onSubmit={sendMessage} className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Sparkles className="w-4 h-4 text-neutral-400" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Jiva to navigate..."
              disabled={isLoading}
              className="w-full pl-10 pr-12 py-3 bg-neutral-100 rounded-lg border-2 border-transparent focus:bg-white focus:border-black outline-none transition-all font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black text-[#e4e987] rounded-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Send className="w-4 h-4" />
                </motion.div>
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </motion.div>

      {/* Decorative Grid Background */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}
