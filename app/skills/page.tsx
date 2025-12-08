"use client";

import React from "react";

import { motion } from "framer-motion";

import { Server, BrainCircuit, Layers, Cpu } from "lucide-react";

// --- DATA STRUCTURES ---

type SkillCategory = "Frontend" | "Backend" | "AI/ML";

interface SkillItem {
  name: string;

  proficiency: number; // 1-10

  tags: string[];
}

interface SkillSection {
  category: SkillCategory;

  icon: React.ElementType;

  skills: SkillItem[];
}

const SKILL_DATA: SkillSection[] = [
  {
    category: "Frontend",
    icon: Layers,
    skills: [
      {
        name: "React",
        proficiency: 8,
        tags: ["Hooks", "Components", "JSX"],
      },
      {
        name: "Next.js",
        proficiency: 8,
        tags: ["RSC", "App Router", "SSR"],
      },
      {
        name: "State Management",
        proficiency: 8,
        tags: ["Redux", "Zustand", "Context API", "React Query"],
      },
      {
        name: "Middleware",
        proficiency: 7,
        tags: ["Next.js", "Auth", "Routing"],
      },
      {
        name: "Authentication",
        proficiency: 8,
        tags: ["JWT", "OAuth", "Session"],
      },
      {
        name: "File Uploads",
        proficiency: 7,
        tags: ["Multipart", "Cloud Storage"],
      },
      {
        name: "Performance Optimization",
        proficiency: 8,
        tags: ["Prefetching", "Preloading", "Lighthouse"],
      },
      {
        name: "Tailwind CSS",
        proficiency: 9,
        tags: ["Utility-First", "Responsive"],
      },
      {
        name: "Responsive Design",
        proficiency: 9,
        tags: ["Mobile-First", "Breakpoints"],
      },
      {
        name: "Forms",
        proficiency: 9,
        tags: ["Formik", "React Hook Form", "Validation"],
      },
      {
        name: "WebSockets",
        proficiency: 8,
        tags: ["Real-time", "Socket.io"],
      },
    ],
  },
  {
    category: "Backend",
    icon: Server,
    skills: [
      {
        name: "Node.js",
        proficiency: 5,
        tags: ["Runtime", "Event Loop", "NPM"],
      },
      {
        name: "Express",
        proficiency: 4,
        tags: ["REST", "Middleware", "Routing"],
      },
      {
        name: "Databases",
        proficiency: 5,
        tags: ["SQL", "NoSQL", "MongoDB", "PostgreSQL"],
      },
      {
        name: "Authentication",
        proficiency: 5,
        tags: ["JWT", "Bcrypt", "OAuth"],
      },
    ],
  },
  {
    category: "AI/ML",
    icon: BrainCircuit,
    skills: [
      {
        name: "Machine Learning",
        proficiency: 7,
        tags: ["Algorithms", "Models", "Training"],
      },
      {
        name: "Agent Creation",
        proficiency: 6,
        tags: ["LLM", "Orchestration", "Tools"],
      },
      {
        name: "RAG Systems",
        proficiency: 5,
        tags: ["Vector DBs", "Embeddings", "Retrieval"],
      },
      {
        name: "Recommendation Systems",
        proficiency: 5,
        tags: ["Collaborative", "Content-Based"],
      },
    ],
  },
];

// --- COMPONENTS ---

// Visualizes proficiency as a "Server Load" bar
const ProficiencyBar = ({ score, index }: { score: number; index: number }) => {
  return (
    <div className="flex items-center gap-1 h-1.5 w-full mt-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{
            opacity: i < score ? 1 : 0.15,
            scaleY: 1,
          }}
          transition={{
            duration: 0.4,
            delay: index * 0.05 + i * 0.03,
            ease: "backOut",
          }}
          className="flex-1 h-full rounded-sm"
          style={{
            backgroundColor:
              i < score ? "var(--bg-accent-glow)" : "currentColor",
          }}
        />
      ))}
    </div>
  );
};

const SkillCard = ({ skill, index }: { skill: SkillItem; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group relative p-6 rounded-2xl border transition-all duration-300"
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--text-display)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border)";
    }}
    style={{
      backgroundColor: "var(--card)",
      borderColor: "var(--border)",
    }}
  >
    <div className="flex justify-between items-start mb-3">
      <h3
        className="font-bold text-lg leading-tight transition-colors"
        style={{ color: "var(--text-display)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--bg-accent-glow)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--text-display)";
        }}
      >
        {skill.name}
      </h3>
      <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">
        Load: {skill.proficiency}0%
      </span>
    </div>

    <div className="flex flex-wrap gap-2 mb-4">
      {skill.tags.map((tag) => (
        <span
          key={tag}
          className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border"
          style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
        >
          {tag}
        </span>
      ))}
    </div>

    {/* Visualization of the Score */}
    <ProficiencyBar score={skill.proficiency} index={index} />

    {/* Hover Glow Effect */}
    <div
      className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        background:
          "radial-gradient(circle at center, var(--bg-accent-glow) 0%, transparent 70%)",
        opacity: 0.03,
      }}
    />
  </motion.div>
);

export default function SkillsPage() {
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
            System Specifications
          </span>
        </div>

        <h1
          className="text-[15vw] md:text-[8vw] font-black uppercase tracking-tighter leading-[0.8]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-display)",
          }}
        >
          Technical <br />
          <span
            className="text-transparent"
            style={{ WebkitTextStroke: "1px var(--text-display)" }}
          >
            Arsenal
          </span>
        </h1>
      </div>

      {/* Skills Layout */}

      <div className="max-w-7xl mx-auto space-y-24">
        {SKILL_DATA.map((section, sectionIdx) => (
          <div key={section.category} className="relative">
            {/* Section Header */}

            <div
              className="flex items-end gap-4 mb-8 border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <section.icon
                className="w-6 h-6 md:w-8 md:h-8"
                strokeWidth={1}
                style={{ color: "var(--text-display)" }}
              />

              <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tight">
                {section.category}
              </h2>

              <span
                className="font-mono text-xs mb-1 ml-auto"
                style={{ color: "var(--text-muted)" }}
              >
                Module 0{sectionIdx + 1}
              </span>
            </div>

            {/* Responsive Grid */}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {section.skills.map((skill, idx) => (
                <SkillCard key={skill.name} skill={skill} index={idx} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
