"use client";
import { motion } from "framer-motion";
import {
  InterestCardV2,
  INTERESTS_DATA,
} from "../components/InterestComponents";

export default function InterestsPage() {
  return (
    <div
      className="min-h-screen p-4 md:py-20 md:px-28 pb-32"
      style={{ backgroundColor: "var(--bg-canvas)", color: "var(--text-body)" }}
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-20 pt-20">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: "var(--bg-accent-glow)" }}
          />

          <span
            className="font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Beyond The Code
          </span>
        </div>

        <h1
          className="text-[15vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.8]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-display)",
          }}
        >
          Personal <br />
          <span className="px-4" style={{ color: "var(--bg-accent-glow)" }}>
            Interests
          </span>
        </h1>

        <div
          className="flex flex-col md:flex-row gap-8 items-start border-t pt-8 mt-8"
          style={{ borderColor: "var(--text-display)" }}
        >
          <p className="max-w-xl text-lg md:text-xl font-light">
            A glimpse into the{" "}
            <span
              className="font-medium"
              style={{ color: "var(--text-display)" }}
            >
              passions and pursuits
            </span>{" "}
            that shape my perspective beyond the professional realm. From the
            pages of books to the cricket field, from philosophical
            contemplation to virtual adventures.
          </p>
        </div>
      </div>

      {/* Interests Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {INTERESTS_DATA.map((interest, idx) => (
            <InterestCardV2
              key={interest.title}
              interest={interest}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
