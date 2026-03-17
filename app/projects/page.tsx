"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BentoCard,
  ExpandedCard,
  ProjectGridSkeleton,
  type Project,
} from "../components/ProjectComponents";
import { packBentoGrid } from "@/app/lib/projects/bentoGrid";

// --- 12-COL BENTO GRID (packed, order-independent) ---
function ProjectsBentoGrid({
  projects,
  onSelect,
}: {
  projects: Project[];
  onSelect: (id: string) => void;
}) {
  const placements = useMemo(() => packBentoGrid(projects), [projects]);

  return (
    <motion.div
      className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 auto-rows-[minmax(200px,auto)] gap-4 md:gap-6"
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: { staggerChildren: 0.06 },
        },
      }}
    >
      {projects.map((project) => (
        <BentoCard
          key={project.id}
          project={project}
          onClick={onSelect}
          placement={placements.get(project.id) ?? null}
        />
      ))}
    </motion.div>
  );
}

// --- MAIN PAGE LAYOUT ---

export default function ProjectsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from Neon-backed API on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();

        // Use data if available (either from Neon or fallback)
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setProjects(json.data);
        } else {
          // Only set empty if truly no data available
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
    <div
      className="min-h-screen p-4 md:py-8 md:px-28 pb-32"
      style={{ backgroundColor: "var(--bg-canvas)" }}
    >
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16 pt-20">
        <h1
          className="text-[15vw] md:text-[8vw] leading-[0.8] font-black uppercase tracking-tighter mb-6"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-display)",
          }}
        >
          Selected <br />{" "}
          <span className="px-4" style={{ color: "var(--bg-accent-glow)" }}>
            Works
          </span>
        </h1>
        <div
          className="flex flex-col md:flex-row gap-8 items-start border-t pt-8"
          style={{ borderColor: "var(--text-display)" }}
        >
          <p className="max-w-xl text-lg md:text-xl font-light text-(--text-muted)">
            A collection of{" "}
            <span className="font-medium text-(--text-display)">
              System Architecture
            </span>{" "}
            and{" "}
            <span className="font-medium text-(--text-display)">
              Frontend Engineering
            </span>{" "}
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
          <p
            className="font-mono text-sm"
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          >
            No projects found. Please add projects via the admin panel.
          </p>
        </div>
      )}

      {/* Projects Grid: 12-column packed bento (order-independent, no gaps) */}
      {!loading && projects.length > 0 && (
        <>
          <ProjectsBentoGrid projects={projects} onSelect={setSelectedId} />

          {/* Expansion overlay */}
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
