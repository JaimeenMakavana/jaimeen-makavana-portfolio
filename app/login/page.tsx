"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Lock, User, Home } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div
      className="h-dvh w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-body)" }}
    >
      {/* Background Glow Effect matching Hero Section */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ backgroundColor: "var(--bg-accent-glow)" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 shadow-lg"
            style={{ backgroundColor: "var(--bg-accent-glow)" }}
          >
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <h1
            className="text-5xl font-bold tracking-tighter mb-2"
            style={{
              fontFamily: "var(--font-alumni), sans-serif",
              color: "var(--text-display)",
            }}
          >
            Admin Access
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input
                name="username"
                type="text"
                placeholder="Username"
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-10 py-3 outline-none focus:border-black transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <input
                name="password"
                type="password"
                placeholder="Password"
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-10 py-3 outline-none focus:border-black transition-colors"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-black text-white rounded-xl py-3 font-medium flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            style={{ backgroundColor: "var(--nav-surface)" }}
          >
            {loading ? (
              <span className="animate-pulse">Verifying...</span>
            ) : (
              <>
                Login to Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <Home className="w-4 h-4" />
            <span>Back to Portfolio</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

