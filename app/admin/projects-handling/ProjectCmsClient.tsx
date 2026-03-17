"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Trash2,
  LayoutTemplate,
  Code,
  Cpu,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type {
  Project,
  ProjectCategory as Category,
  ProjectSize,
} from "@/app/components/ProjectComponents/types";

import { AdminEditorHeader } from "@/app/components/ui/AdminEditorHeader";
import { AdminPageShell } from "@/app/components/ui/AdminPageShell";
import { syncProjects } from "./actions";

// --- TYPES ---
type ProjectFormValue =
  | string
  | number
  | string[]
  | Category
  | ProjectSize
  | undefined;

// --- EMPTY PROJECT TEMPLATE ---
const EMPTY_PROJECT: Project = {
  id: "",
  title: "",
  category: "Frontend Arch",
  tagline: "",
  description: "",
  stack: [],
  complexity: 50,
  size: "medium",
  image: "/images/placeholder.png",
};

// --- COMPONENTS ---

export default function ProjectCmsClient({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const router = useRouter();
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isSyncing, startSyncTransition] = useTransition();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Project>(EMPTY_PROJECT);

  // --- ACTIONS ---

  // 2. Sync to Neon (Save)
  const handleSync = async () => {
    startSyncTransition(async () => {
      try {
        await syncProjects(projects);
        setIsDirty(false);
        showStatus("success", "Projects synchronized successfully");
        router.refresh();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to sync with Neon";
        showStatus("error", errorMessage);
      }
    });
  };

  // 3. Local CRUD Operations
  const handleSelect = (project: Project) => {
    setSelectedId(project.id);
    setFormData({ ...project });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateNew = () => {
    const newId = `new-${Date.now()}`;
    const newProject = { ...EMPTY_PROJECT, id: newId };
    setSelectedId(newId);
    setFormData(newProject);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormChange = (field: keyof Project, value: ProjectFormValue) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveLocal = (e: React.FormEvent) => {
    e.preventDefault();
    setProjects((prev) => {
      const exists = prev.find((p) => p.id === formData.id);
      if (exists) {
        return prev.map((p) => (p.id === formData.id ? formData : p));
      }
      return [formData, ...prev];
    });
    setIsDirty(true);
    showStatus("success", "Changes staged locally. Don't forget to Sync.");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setFormData(EMPTY_PROJECT);
      }
      setIsDirty(true);
    }
  };

  // Helper
  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <AdminPageShell className="relative flex flex-col h-full overflow-hidden">
      <AdminEditorHeader
        icon={LayoutTemplate}
        title="Project CMS"
        isDirty={isDirty}
        isRefreshing={isRefreshing}
        isSyncing={isSyncing}
        onRefresh={() =>
          startRefreshTransition(() => {
            router.refresh();
          })
        }
        onSync={handleSync}
        syncingLabel="Uploading..."
      />

      <main className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* LEFT COLUMN: LIST */}
        <div className="lg:col-span-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Inventory ({projects.length})
            </h2>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1 text-xs font-bold uppercase px-3 py-1.5 rounded-md transition-colors border"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-body)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--nav-surface)";
                e.currentTarget.style.color = "var(--nav-text-idle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--text-body)";
              }}
            >
              <Plus className="w-3 h-3" /> New Project
            </button>
          </div>

          <div className="space-y-3 pb-20 flex-1 min-h-0 overflow-y-auto">
            {projects.length === 0 ? (
              <div
                className="p-8 text-center border-2 border-dashed rounded-xl"
                style={{ borderColor: "var(--border)" }}
              >
                <LayoutTemplate
                  className="w-8 h-8 mx-auto mb-3"
                  style={{ color: "var(--text-muted)", opacity: 0.5 }}
                />
                <p
                  className="text-sm mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  No projects found in Neon
                </p>
                <p
                  className="text-xs mb-4"
                  style={{ color: "var(--text-muted)", opacity: 0.7 }}
                >
                  Create your first project to initialize the database
                </p>
                <button
                  onClick={handleCreateNew}
                  className="text-xs font-bold uppercase px-4 py-2 rounded-md transition-colors border"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-body)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--nav-surface)";
                    e.currentTarget.style.color = "var(--nav-text-idle)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-body)";
                  }}
                >
                  Create First Project
                </button>
              </div>
            ) : (
              projects.map((project) => (
                <motion.div
                  layoutId={`card-${project.id}`}
                  key={project.id}
                  onClick={() => handleSelect(project)}
                  className="group p-4 rounded-xl border cursor-pointer transition-all"
                  style={{
                    backgroundColor:
                      selectedId === project.id
                        ? "var(--nav-surface)"
                        : "var(--card)",
                    color:
                      selectedId === project.id
                        ? "var(--nav-text-idle)"
                        : "var(--text-body)",
                    borderColor:
                      selectedId === project.id
                        ? "var(--nav-surface)"
                        : "var(--border)",
                    boxShadow:
                      selectedId === project.id
                        ? "0 0 0 2px var(--bg-accent-glow)"
                        : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedId !== project.id) {
                      e.currentTarget.style.borderColor = "var(--text-display)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== project.id) {
                      e.currentTarget.style.borderColor = "var(--border)";
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
                      style={{
                        color:
                          selectedId === project.id
                            ? "var(--bg-accent-glow)"
                            : "var(--text-muted)",
                      }}
                    >
                      {project.category}
                    </span>
                    {selectedId === project.id && (
                      <CheckCircle2
                        className="w-4 h-4"
                        style={{ color: "var(--bg-accent-glow)" }}
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1">
                    {project.title}
                  </h3>
                  <p
                    className="text-xs line-clamp-2"
                    style={{
                      color:
                        selectedId === project.id
                          ? "var(--text-muted)"
                          : "var(--text-muted)",
                      opacity: selectedId === project.id ? 0.7 : 1,
                    }}
                  >
                    {project.tagline}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EDITOR */}
        <div className="lg:col-span-8 min-h-0 overflow-y-auto">
          <div>
            <div
              className="rounded-2xl shadow-sm border overflow-hidden"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              {/* Editor Header */}
              <div
                className="px-8 py-6 border-b flex justify-between items-center"
                style={{
                  backgroundColor: "var(--muted)",
                  opacity: 0.5,
                  borderColor: "var(--border)",
                }}
              >
                <div>
                  <h2
                    className="font-bold text-2xl"
                    style={{ color: "var(--text-display)" }}
                  >
                    {selectedId
                      ? selectedId.startsWith("new")
                        ? "New Project"
                        : "Edit Project"
                      : "Select a Project"}
                  </h2>
                  <p
                    className="text-sm font-mono mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    ID: {formData.id || "..."}
                  </p>
                </div>
                {selectedId && (
                  <button
                    onClick={() => handleDelete(formData.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "var(--destructive)" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--destructive)";
                      e.currentTarget.style.opacity = "0.1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                    title="Delete Project"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {selectedId ? (
                <form onSubmit={saveLocal} className="p-8 space-y-8">
                  {/* Row 1: Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Title
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => {
                          handleFormChange("title", e.target.value);
                          if (selectedId.startsWith("new")) {
                            handleFormChange(
                              "id",
                              e.target.value.toLowerCase().replace(/\s+/g, "-"),
                            );
                          }
                        }}
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          handleFormChange("category", e.target.value)
                        }
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      >
                        <option>AI Engineering</option>
                        <option>System Design</option>
                        <option>Frontend Arch</option>
                        <option>Migration</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 2: Tagline & Desc */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) =>
                          handleFormChange("tagline", e.target.value)
                        }
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none font-mono text-sm"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) =>
                          handleFormChange("description", e.target.value)
                        }
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none resize-none"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 3: Technical Details */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-xl border"
                    style={{
                      backgroundColor: "var(--muted)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {/* Tech Stack */}
                    <div className="space-y-2">
                      <label
                        className="flex items-center gap-2 text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Cpu className="w-3 h-3" /> Tech Stack (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.stack.join(", ")}
                        onChange={(e) =>
                          handleFormChange(
                            "stack",
                            e.target.value.split(",").map((s) => s.trim()),
                          )
                        }
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none font-mono text-sm"
                        style={{
                          backgroundColor: "var(--card)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.stack.map(
                          (tech, i) =>
                            tech && (
                              <span
                                key={i}
                                className="text-[10px] border px-2 py-1 rounded"
                                style={{
                                  backgroundColor: "var(--card)",
                                  borderColor: "var(--border)",
                                  color: "var(--text-muted)",
                                }}
                              >
                                {tech}
                              </span>
                            ),
                        )}
                      </div>
                    </div>

                    {/* Complexity Slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label
                          className="flex items-center gap-2 text-xs font-bold uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Code className="w-3 h-3" /> Complexity Score
                        </label>
                        <span
                          className="font-mono font-bold"
                          style={{ color: "var(--text-display)" }}
                        >
                          {formData.complexity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.complexity}
                        onChange={(e) =>
                          handleFormChange(
                            "complexity",
                            parseInt(e.target.value),
                          )
                        }
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          backgroundColor: "var(--muted)",
                          accentColor: "var(--text-display)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 4: Visuals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label
                        className="flex items-center gap-2 text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <LayoutTemplate className="w-3 h-3" /> Grid Size
                      </label>
                      <select
                        value={formData.size}
                        onChange={(e) =>
                          handleFormChange("size", e.target.value)
                        }
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      >
                        <option value="small">Small (1x1)</option>
                        <option value="medium">Medium (2x1)</option>
                        <option value="tall">Tall (1x2)</option>
                        <option value="large">Large (2x2)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label
                        className="flex items-center gap-2 text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <ImageIcon className="w-3 h-3" /> Image Path
                      </label>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) =>
                          handleFormChange("image", e.target.value)
                        }
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none font-mono text-sm"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                    </div>
                  </div>

                  {/* Row 5: Metadata */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        External Link
                      </label>
                      <input
                        type="text"
                        value={formData.link || ""}
                        onChange={(e) =>
                          handleFormChange("link", e.target.value)
                        }
                        placeholder="https://..."
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Highlight Stat
                      </label>
                      <input
                        type="text"
                        value={formData.stat || ""}
                        onChange={(e) =>
                          handleFormChange("stat", e.target.value)
                        }
                        placeholder="e.g. < 50ms Latency"
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                          borderWidth: "1px",
                          borderStyle: "solid",
                          color: "var(--text-body)",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor =
                            "var(--text-display)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="pt-4 border-t flex justify-end"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-xl font-bold transition-all"
                      style={{
                        backgroundColor: "var(--nav-surface)",
                        color: "var(--nav-text-idle)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--bg-accent-glow)";
                        e.currentTarget.style.color = "var(--text-display)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--nav-surface)";
                        e.currentTarget.style.color = "var(--nav-text-idle)";
                      }}
                    >
                      Update Inventory
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className="h-96 flex flex-col items-center justify-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  <p>Select a project from the left to edit details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 z-50"
            style={{
              backgroundColor:
                statusMsg.type === "success"
                  ? "var(--nav-surface)"
                  : "var(--destructive)",
              color:
                statusMsg.type === "success"
                  ? "var(--bg-accent-glow)"
                  : "var(--destructive-foreground)",
            }}
          >
            {statusMsg.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
            {statusMsg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPageShell>
  );
}
