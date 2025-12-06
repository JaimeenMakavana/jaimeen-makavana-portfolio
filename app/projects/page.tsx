"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import Link from "next/link";

// --- TYPES & DATA (Included inline for portability) ---
type ProjectSize = "small" | "medium" | "large" | "tall";

interface Project {
  id: string;
  title: string;
  category: "AI Engineering" | "System Design" | "Frontend Arch" | "Migration";
  tagline: string;
  description: string;
  stack: string[];
  complexity: number;
  size: ProjectSize;
  image: string;
  link?: string;
  stat?: string;
}

const projects: Project[] = [
  {
    id: "key-chat",
    title: "Key.ai Chat Module",
    category: "AI Engineering",
    tagline: "Real-time LLM Streaming Architecture",
    description:
      "Designed and implemented a high-throughput chat system optimized for sub-50ms interactions while supporting real-time AI response streaming. The interface required seamless optimistic UI updates, Markdown rendering, and graceful degradation during transient network drops.",
    stack: ["Next.js", "WebSockets", "Redis", "Framer Motion"],
    complexity: 95,
    size: "large",
    image: "/images/chat-ui.png",
    stat: "< 50ms Latency",
  },
  {
    id: "chapter-01",
    title: "Chapter 01",
    category: "Frontend Arch",
    tagline: "Financial Reporting Engine",
    description:
      "Lead frontend implementation for a complex accounting platform. Bypassed standard Context API for Zustand to prevent re-render cascades in data-heavy grids.",
    stack: ["Next.js", "Zustand", "Formik", "TanStack Query"],
    complexity: 85,
    size: "medium",
    image: "/images/chapter-01.png",
    link: "https://chapter-umber.vercel.app/login",
    stat: "Zero Prop Drilling",
  },
  {
    id: "key-community",
    title: "AI Community Graph",
    category: "AI Engineering",
    tagline: "Vector-based User Matching",
    description:
      "Designed a community creation tool that uses RAG (Retrieval-Augmented Generation) to suggest member connections based on semantic analysis of user bios.",
    stack: ["Python", "Pinecone", "Next.js API Routes"],
    complexity: 90,
    size: "tall",
    image: "/images/community.png",
    stat: "Semantic Search",
  },
  {
    id: "notifications",
    title: "Smart Notification System",
    category: "System Design",
    tagline: "Event-Driven Architecture",
    description:
      "Decoupled notification logic using a Pub/Sub model. Implemented priority queuing to ensure critical alerts (payment failures) override marketing pings.",
    stack: ["Node.js", "RabbitMQ", "React Portal"],
    complexity: 75,
    size: "small",
    image: "/images/notifications.png",
    stat: "99.9% Delivery",
  },
  {
    id: "slido",
    title: "Slido Migration",
    category: "Migration",
    tagline: "PHP to React.js Modernization",
    description:
      "Orchestrated the strangler fig pattern migration of a legacy PHP application to a modern React SPA, maintaining session state across hybrid routes.",
    stack: ["PHP", "React", "Docker"],
    complexity: 88,
    size: "medium",
    image: "/images/slido.png",
    stat: "Legacy Free",
  },
  {
    id: "tcpl",
    title: "TCPL Retailer",
    category: "Frontend Arch",
    tagline: "Distributor Payment Workflows",
    description:
      "Streamlined complex payment forms using React-Hook-Form for performance optimization on low-end retailer devices.",
    stack: ["Next.js", "React-Hook-Form", "Zod"],
    complexity: 70,
    size: "small",
    image: "/images/tcpl.png",
    stat: "Mobile First",
  },
  {
    id: "koffeekodes",
    title: "Koffeekodes",
    category: "Frontend Arch",
    tagline: "Immersive Agency Landing",
    description:
      "A showcase of WebGL and Scroll-based animations. Optimized LCP by deferring non-critical motion scripts.",
    stack: ["GSAP", "Next.js", "WebGL"],
    complexity: 65,
    size: "medium",
    image: "/images/koffee.png",
    stat: "100/100 Lighthouse",
  },
  {
    id: "om-dental",
    title: "Om Dental Care",
    category: "Frontend Arch",
    tagline: "Informatic Architecture",
    description:
      "Accessible, SEO-optimized static architecture for medical information.",
    stack: ["Next.js SSG", "Tailwind"],
    complexity: 40,
    size: "small",
    image: "/images/dental.png",
    stat: "SEO Optimized",
  },
];

// --- UI COMPONENTS ---

const ComplexityMeter = ({
  score,
  animate = true,
}: {
  score: number;
  animate?: boolean;
}) => {
  return (
    <div className="flex flex-col gap-1 w-full max-w-[120px]">
      <div className="flex justify-between text-[10px] uppercase font-mono tracking-widest text-neutral-400">
        <span>Complexity</span>
        <span>{score}%</span>
      </div>
      <div className="h-1 w-full bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{
            duration: 1.5,
            ease: "circOut",
            delay: animate ? 0.2 : 0,
          }}
          className="h-full bg-[#e4e987]"
        />
      </div>
    </div>
  );
};

const TechBadge = ({ tech }: { tech: string }) => (
  <span className="px-2 py-1 bg-neutral-100 border border-neutral-200 text-[10px] uppercase tracking-wide font-medium rounded-md text-neutral-600">
    {tech}
  </span>
);

// --- ANIMATION COMPONENTS ---

const BentoCard = ({
  project,
  onClick,
}: {
  project: Project;
  onClick: (id: string) => void;
}) => {
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
      className={`group relative bg-white border border-neutral-200 rounded-3xl overflow-hidden p-6 flex flex-col justify-between cursor-pointer ${
        sizeClasses[project.size]
      }`}
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
      <div className="absolute inset-0 bg-gradient-to-t from-[#e4e987]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform translate-y-4 group-hover:translate-y-0" />

      {/* TOP SECTION */}
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <span className="text-xs font-mono text-neutral-500 group-hover:text-black bg-neutral-100 group-hover:bg-[#e4e987] transition-colors duration-300 px-2 py-1 rounded">
            {project.category}
          </span>
          <motion.h3
            layoutId={`title-${project.id}`}
            className="text-3xl md:text-4xl mt-3 leading-none uppercase"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {project.title}
          </motion.h3>
        </div>
        {project.stat && (
          <div className="text-right">
            <span
              className="block text-4xl font-light text-neutral-300 group-hover:text-black transition-colors duration-300"
              style={{ fontFamily: "var(--font-alumni)" }}
            >
              {project.stat}
            </span>
          </div>
        )}
      </div>

      {/* MIDDLE SECTION */}
      <div className="relative z-10 mt-4 md:mt-0">
        <p className="text-neutral-500 leading-relaxed text-sm line-clamp-3 group-hover:text-black transition-colors duration-300">
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
            <span className="text-xs text-neutral-400 self-center">
              +{project.stack.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- EXPANDED CARD OVERLAY ---

const ExpandedCard = ({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          layoutId={project.id}
          className="pointer-events-auto w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Expanded Header */}
          <div className="relative p-8 md:p-12 bg-[#fafafa] border-b border-neutral-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-6 right-6 p-2 rounded-full bg-white hover:bg-neutral-100 transition-colors"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <span className="text-xs font-mono text-[#e4e987] bg-black px-2 py-1 rounded inline-block mb-4">
              {project.category}
            </span>
            <motion.h3
              layoutId={`title-${project.id}`}
              className="text-5xl md:text-7xl leading-none uppercase mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {project.title}
            </motion.h3>
            <p className="text-xl text-neutral-500 font-light">
              {project.tagline}
            </p>
          </div>

          {/* Expanded Content (Scrollable) */}
          <div className="p-8 md:p-12 overflow-y-auto">
            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h4 className="font-bold text-lg mb-2">
                    The Challenge & Solution
                  </h4>
                  <p className="text-neutral-600 leading-relaxed text-lg">
                    {project.description}
                  </p>
                </div>
                {project.link && (
                  <Link
                    href={project.link}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-[#e4e987] rounded-full font-medium hover:scale-105 transition-transform"
                  >
                    View Live Project
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 15 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9C12 9.27614 11.7761 9.5 11.5 9.5C11.2239 9.5 11 9.27614 11 9L11 4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                        fill="currentColor"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </Link>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="font-mono text-xs uppercase text-neutral-400 mb-4 tracking-widest">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {project.stack.map((t) => (
                      <TechBadge key={t} tech={t} />
                    ))}
                  </div>
                </div>
                <ComplexityMeter score={project.complexity} animate={false} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

// --- MAIN PAGE LAYOUT ---

export default function ProjectsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:py-8 md:px-28 pb-32">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16 pt-20">
        <h1
          className="text-[15vw] md:text-[8vw] leading-[0.8] font-black uppercase tracking-tighter text-black mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Selected <br /> <span className="text-[#e4e987]  px-4">Works</span>
        </h1>
        <div className="flex flex-col md:flex-row gap-8 items-start border-t border-black/10 pt-8">
          <p className="max-w-xl text-lg md:text-xl text-neutral-600 font-light">
            A collection of{" "}
            <span className="text-black font-medium">System Architecture</span>{" "}
            and{" "}
            <span className="text-black font-medium">Frontend Engineering</span>{" "}
            challenges. Focusing on scalability, performance, and the
            intersection of React & AI.
          </p>
        </div>
      </div>

      {/* 3. ENTRY: The Staggered "Cascade" Grid */}
      <motion.div
        className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 auto-rows-[minmax(300px,auto)] gap-4 md:gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        {projects.map((project) => (
          <BentoCard
            key={project.id}
            project={project}
            onClick={setSelectedId}
          />
        ))}
      </motion.div>

      {/* Shared Layout Expansion Overlay */}
      <AnimatePresence>
        {selectedId && (
          <ExpandedCard
            project={projects.find((p) => p.id === selectedId)!}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
