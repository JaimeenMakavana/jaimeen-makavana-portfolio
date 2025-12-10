"use client";

import React from "react";
import { motion } from "framer-motion";
import { Server, BrainCircuit, Layers, Cpu } from "lucide-react";

// --- DATA STRUCTURES ---

type ProficiencyLevel = "Beginner" | "Elementary" | "Intermediate" | "Expert";

const PROFICIENCY_CONFIG: Record<
  ProficiencyLevel,
  { level: number; description: string }
> = {
  Beginner: {
    level: 1,
    description: "Just started, learning concepts",
  },
  Elementary: {
    level: 2,
    description: "Understands basics, can build simple things with help",
  },
  Intermediate: {
    level: 3,
    description: "Independent, can troubleshoot standard issues",
  },
  Expert: {
    level: 4,
    description: "Deep knowledge, creates architecture/best practices",
  },
};

type SkillCategory = "Languages" | "Frontend" | "Backend" | "AI/ML";

interface SkillItem {
  name: string;
  proficiency: ProficiencyLevel;
  tags: string[];
}

interface SkillSection {
  category: SkillCategory;
  icon: React.ElementType;
  skills: SkillItem[];
}

// Updated Data with new Categories
const SKILL_DATA: SkillSection[] = [
  {
    category: "Languages",
    icon: Cpu,
    skills: [
      {
        name: "JavaScript",
        proficiency: "Intermediate",
        tags: ["ES6+", "Async/Await", "DOM"],
      },
      {
        name: "Python",
        proficiency: "Elementary",
        tags: ["Scripting", "Automation"],
      },
    ],
  },
  {
    category: "Frontend",
    icon: Layers,
    skills: [
      {
        name: "React",
        proficiency: "Expert",
        tags: ["Hooks", "Components", "JSX"],
      },
      {
        name: "Next.js",
        proficiency: "Expert",
        tags: ["RSC", "App Router", "SSR"],
      },
      {
        name: "State Management",
        proficiency: "Expert",
        tags: ["Redux", "Zustand", "Context"],
      },
      {
        name: "Middleware",
        proficiency: "Intermediate",
        tags: ["Next.js", "Auth", "Routing"],
      },
      {
        name: "Authentication",
        proficiency: "Intermediate",
        tags: ["JWT", "OAuth", "Session"],
      },
      {
        name: "Tailwind CSS",
        proficiency: "Expert",
        tags: ["Utility-First", "Responsive"],
      },
      {
        name: "Responsive Design",
        proficiency: "Expert",
        tags: ["Mobile-First", "Breakpoints"],
      },
    ],
  },
  {
    category: "Backend",
    icon: Server,
    skills: [
      {
        name: "Node.js",
        proficiency: "Elementary",
        tags: ["Runtime", "Event Loop"],
      },
      {
        name: "Express",
        proficiency: "Elementary",
        tags: ["REST", "Middleware"],
      },
      {
        name: "Databases",
        proficiency: "Elementary",
        tags: ["SQL", "NoSQL", "MongoDB"],
      },
    ],
  },
  {
    category: "AI/ML",
    icon: BrainCircuit,
    skills: [
      {
        name: "Machine Learning",
        proficiency: "Intermediate",
        tags: ["Algorithms", "Models"],
      },
      {
        name: "Agent Creation",
        proficiency: "Elementary",
        tags: ["LLM", "Orchestration"],
      },
      {
        name: "RAG Systems",
        proficiency: "Elementary",
        tags: ["Vector DBs", "Embeddings"],
      },
    ],
  },
];

// --- COMPONENTS ---

// Visualizes proficiency as 4 discrete blocks
const ProficiencyDisplay = ({
  level,
  index,
}: {
  level: ProficiencyLevel;
  index: number;
}) => {
  const config = PROFICIENCY_CONFIG[level];
  const maxLevel = 4;

  return (
    <div className="mt-5">
      {/* Label and Blocks Container */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[10px] font-mono uppercase font-bold tracking-wider"
          style={{ color: "var(--bg-accent-glow)" }}
        >
          {level}
        </span>
      </div>

      {/* The 4 Blocks */}
      <div className="flex gap-1.5 h-2 w-full">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scaleY: 0 }}
            whileInView={{
              opacity: i < config.level ? 1 : 0.1,
              scaleY: 1,
            }}
            transition={{
              duration: 0.3,
              delay: index * 0.05 + i * 0.1,
              ease: "backOut",
            }}
            className="flex-1 h-full rounded-sm"
            style={{
              backgroundColor:
                i < config.level ? "var(--bg-accent-glow)" : "currentColor",
            }}
          />
        ))}
      </div>

      {/* Description Context */}
      <p
        className="text-[10px] mt-2 leading-tight opacity-60 font-mono"
        style={{ color: "var(--text-muted)" }}
      >
        {config.description}
      </p>
    </div>
  );
};

const SkillCard = ({ skill, index }: { skill: SkillItem; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="group relative p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full"
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
      >
        {skill.name}
      </h3>
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

    <div className="mt-auto">
      <ProficiencyDisplay level={skill.proficiency} index={index} />
    </div>

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
          {/* Added slight spacing to fix kerning issue */}
          <span
            className="text-transparent block mt-2 md:mt-4"
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
                CORE STACK 0{sectionIdx + 1}
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
