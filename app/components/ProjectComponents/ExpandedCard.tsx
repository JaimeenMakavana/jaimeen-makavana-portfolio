"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Project } from "./types";
import { ComplexityMeter } from "./ComplexityMeter";
import { TechBadge } from "./TechBadge";

interface ExpandedCardProps {
  project: Project;
  onClose: () => void;
}

export const ExpandedCard = ({ project, onClose }: ExpandedCardProps) => {
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

