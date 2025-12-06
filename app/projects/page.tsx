"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BentoCard,
  ExpandedCard,
  ProjectGridSkeleton,
  type Project,
} from "../components/ProjectComponents";

// --- MAIN PAGE LAYOUT ---

export default function ProjectsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from Gist on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();

        if (json.found && json.data && Array.isArray(json.data)) {
          setProjects(json.data);
        } else {
          // If no Gist found, set empty array
          setProjects([]);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

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

      {/* Loading State */}
      {loading && <ProjectGridSkeleton />}

      {/* Empty State */}
      {!loading && projects.length === 0 && (
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-neutral-400 font-mono text-sm">
            No projects found. Please add projects via the admin panel.
          </p>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && projects.length > 0 && (
        <>
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
        </>
      )}
    </div>
  );
}
