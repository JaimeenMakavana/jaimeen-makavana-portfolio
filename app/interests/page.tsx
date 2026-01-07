"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Activity, Brain, Gamepad2 } from "lucide-react";

// --- DATA STRUCTURES ---

interface InterestItem {
  title: string;
  description: string;
  icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    style?: React.CSSProperties;
  }>;
  highlights: string[];
  color?: string;
}

const INTERESTS_DATA: InterestItem[] = [
  {
    title: "Book Reading",
    description:
      "Exploring worlds through words, from philosophy to fiction, technology to biographies. Each book is a journey into new perspectives and ideas.",
    icon: BookOpen,
    highlights: ["Philosophy", "Tech Literature", "Biographies", "Fiction"],
  },
  {
    title: "Cricket",
    description:
      "A passion for the gentleman's game. Following matches, analyzing strategies, and appreciating the artistry of both batting and bowling.",
    icon: Activity,
    highlights: ["Strategy", "Team Dynamics", "History", "Statistics"],
  },
  {
    title: "Philosophy",
    description:
      "Contemplating life's big questions. Exploring existentialism, ethics, logic, and the nature of consciousness and reality.",
    icon: Brain,
    highlights: ["Existentialism", "Ethics", "Logic", "Metaphysics"],
  },
  {
    title: "Video Gaming",
    description:
      "Immersive storytelling, strategic gameplay, and the evolving art of interactive entertainment. From indie gems to AAA experiences.",
    icon: Gamepad2,
    highlights: ["Strategy Games", "RPGs", "Indie Titles", "Game Design"],
  },
];

// --- COMPONENTS ---

const InterestCard = ({
  interest,
  index,
}: {
  interest: InterestItem;
  index: number;
}) => {
  const Icon = interest.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="group relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--text-display)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Icon */}
      <div className="mb-6">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
          style={{
            backgroundColor: "var(--bg-accent-glow)",
            color: "var(--text-display)",
          }}
        >
          <Icon className="w-8 h-8" strokeWidth={1.5} />
        </div>
      </div>

      {/* Title */}
      <h3
        className="font-bold text-2xl mb-3 leading-tight transition-colors"
        style={{ color: "var(--text-display)" }}
      >
        {interest.title}
      </h3>

      {/* Description */}
      <p
        className="text-base leading-relaxed mb-6 grow"
        style={{ color: "var(--text-body)" }}
      >
        {interest.description}
      </p>

      {/* Highlights */}
      <div className="flex flex-wrap gap-2">
        {interest.highlights.map((highlight) => (
          <span
            key={highlight}
            className="text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border transition-colors"
            style={{
              color: "var(--text-muted)",
              borderColor: "var(--border)",
              backgroundColor: "var(--muted)",
            }}
          >
            {highlight}
          </span>
        ))}
      </div>

      {/* Hover Glow Effect */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, var(--bg-accent-glow) 0%, transparent 70%)",
          opacity: 0.05,
        }}
      />
    </motion.div>
  );
};

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {INTERESTS_DATA.map((interest, idx) => (
            <InterestCard
              key={interest.title}
              interest={interest}
              index={idx}
            />
          ))}
        </div>

        {/* Additional Note Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-16 p-8 rounded-2xl border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <p
            className="text-center text-lg leading-relaxed"
            style={{ color: "var(--text-body)" }}
          >
            These interests fuel my creativity, inform my problem-solving
            approach, and remind me that{" "}
            <span
              className="font-medium"
              style={{ color: "var(--bg-accent-glow)" }}
            >
              great work emerges from a well-rounded life
            </span>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
}
