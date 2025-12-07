"use client";

import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { Project } from "./types";
import { ComplexityMeter } from "./ComplexityMeter";
import { TechBadge } from "./TechBadge";

interface BentoCardProps {
  project: Project;
  onClick: (id: string) => void;
}

export const BentoCard = ({ project, onClick }: BentoCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Size classes mapping
  const sizeClasses = {
    small: "md:col-span-1 md:row-span-1",
    medium: "md:col-span-2 md:row-span-1",
    tall: "md:col-span-1 md:row-span-2",
    large: "md:col-span-2 md:row-span-2",
  };

  return (
    <motion.div
      layoutId={project.id}
      onClick={() => onClick(project.id)}
      className={`group relative rounded-3xl overflow-hidden p-6 flex flex-col justify-between cursor-pointer ${
        sizeClasses[project.size]
      }`}
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        borderWidth: "1px",
        borderStyle: "solid",
      }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
      }}
      onMouseMove={handleMouseMove}
    >
      {/* 1. HOVER: Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              450px circle at ${mouseX}px ${mouseY}px,
              rgba(228, 233, 135, 0.15),
              transparent 80%
            )
          `,
        }}
      />

      {/* 2. HOVER: The Curtain Raise (Subtle gradient from bottom) */}
      <div
        className="absolute inset-0 bg-gradient-to-t via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform translate-y-4 group-hover:translate-y-0"
        style={{
          background: `linear-gradient(to top, var(--bg-accent-glow) 0%, transparent 50%, transparent 100%)`,
          opacity: 0.2,
        }}
      />

      {/* TOP SECTION */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <span
            className="text-xs font-mono transition-colors duration-300 px-2 py-1 rounded"
            style={{
              color: "var(--text-muted)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-display)";
              e.currentTarget.style.backgroundColor = "var(--bg-accent-glow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.backgroundColor = "var(--muted)";
            }}
          >
            {project.category}
          </span>
          <motion.h3
            layoutId={`title-${project.id}`}
            className="text-3xl md:text-4xl mt-3 leading-none uppercase"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-display)",
            }}
          >
            {project.title}
          </motion.h3>
        </div>
        {project.stat && (
          <div className="text-right">
            <span
              className="block text-4xl font-light transition-colors duration-300"
              style={{
                fontFamily: "var(--font-alumni)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--text-display)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {project.stat}
            </span>
          </div>
        )}
      </div>

      {/* MIDDLE SECTION */}
      <div className="relative z-10 mt-4 md:mt-0">
        <p
          className="leading-relaxed text-sm line-clamp-3 transition-colors duration-300"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text-display)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          {project.description}
        </p>
      </div>

      {/* BOTTOM SECTION */}
      <div className="relative z-10 flex flex-col gap-4 mt-6">
        <ComplexityMeter score={project.complexity} />

        <div className="flex flex-wrap gap-2">
          {project.stack.slice(0, 3).map((tech) => (
            <TechBadge key={tech} tech={tech} />
          ))}
          {project.stack.length > 3 && (
            <span
              className="text-xs self-center"
              style={{ color: "var(--text-muted)", opacity: 0.7 }}
            >
              +{project.stack.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
