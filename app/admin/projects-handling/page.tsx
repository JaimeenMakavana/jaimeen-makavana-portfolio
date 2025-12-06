"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  RefreshCcw,
  LayoutTemplate,
  Code,
  Cpu,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
type ProjectSize = "small" | "medium" | "large" | "tall";
type Category =
  | "AI Engineering"
  | "System Design"
  | "Frontend Arch"
  | "Migration";

interface Project {
  id: string;
  title: string;
  category: Category;
  tagline: string;
  description: string;
  stack: string[];
  complexity: number;
  size: ProjectSize;
  image: string;
  link?: string;
  stat?: string;
}

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

export default function ProjectCMS() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gistId, setGistId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isDirty, setIsDirty] = useState(false); // Tracks if local changes differ from server
  const [hasInitialized, setHasInitialized] = useState(false); // Track if we've attempted to load

  // Form State
  const [formData, setFormData] = useState<Project>(EMPTY_PROJECT);

  // --- ACTIONS ---

  // 1. Fetch from Gist on Load
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      const json = await res.json();

      if (json.error) {
        showStatus("error", json.error);
        setHasInitialized(true);
        return;
      }

      if (json.found && json.data.length > 0) {
        setProjects(json.data);
        setGistId(json.gistId);
        setIsDirty(false);
        setHasInitialized(true);
        showStatus("success", `Loaded ${json.data.length} projects from Gist`);
      } else {
        // No Gist found - start with empty array
        setProjects([]);
        setGistId(null);
        setIsDirty(false);
        setHasInitialized(true);
        showStatus(
          "success",
          "No Gist found. Create your first project to initialize the database."
        );
      }
    } catch (e) {
      console.error("Fetch error", e);
      const errorMessage =
        e instanceof Error ? e.message : "Failed to fetch projects";
      showStatus("error", `Network error: ${errorMessage}`);
      setHasInitialized(true);
    } finally {
      setLoading(false);
    }
  };

  // 2. Sync to Gist (Save)
  const handleSync = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects, gistId }),
      });
      const json = await res.json();

      if (json.error) {
        throw new Error(json.error);
      }

      if (json.success) {
        setGistId(json.gistId);
        setIsDirty(false);
        showStatus(
          "success",
          json.message || "Database Synchronized Successfully"
        );
      } else {
        throw new Error("Save failed: Unknown error");
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "Failed to sync with GitHub";
      showStatus("error", errorMessage);
    } finally {
      setSaving(false);
    }
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

  const handleFormChange = (field: keyof Project, value: any) => {
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
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans md:px-28 relative">
      {/* HEADER */}
      <header className="sticky top-0 left-0 right-0 bg-[#fafafa]/80 backdrop-blur-md border-b border-neutral-200 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutTemplate className="w-6 h-6" />
          <h1 className="font-bold text-xl tracking-tight">Project CMS</h1>
          {loading && (
            <span className="text-xs font-mono text-neutral-400 animate-pulse">
              FETCHING_DATA...
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {isDirty && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium"
              >
                <AlertCircle className="w-3 h-3" />
                Unsaved Changes
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={fetchProjects}
            disabled={loading || isDirty}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-30"
            title="Reload from Gist"
          >
            <RefreshCcw
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={handleSync}
            disabled={!isDirty || saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-mono text-sm uppercase tracking-wide transition-all ${
              isDirty
                ? "bg-black text-[#e4e987] hover:scale-105 shadow-lg"
                : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>Uploading...</>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sync to Gist
              </>
            )}
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 pb-20 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: LIST */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs uppercase text-neutral-500 tracking-widest">
              Inventory ({projects.length})
            </h2>
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1 text-xs font-bold uppercase hover:bg-black hover:text-white px-3 py-1.5 rounded-md transition-colors border border-neutral-200"
            >
              <Plus className="w-3 h-3" /> New Project
            </button>
          </div>

          <div className="space-y-3 pb-20">
            {loading && !hasInitialized ? (
              <div className="p-8 text-center text-neutral-400">
                <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading projects from Gist...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-neutral-200 rounded-xl">
                <LayoutTemplate className="w-8 h-8 mx-auto mb-3 text-neutral-300" />
                <p className="text-sm text-neutral-500 mb-2">
                  No projects found in Gist
                </p>
                <p className="text-xs text-neutral-400 mb-4">
                  Create your first project to initialize the database
                </p>
                <button
                  onClick={handleCreateNew}
                  className="text-xs font-bold uppercase hover:bg-black hover:text-white px-4 py-2 rounded-md transition-colors border border-neutral-200"
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
                  className={`group p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedId === project.id
                      ? "bg-black text-white border-black ring-2 ring-offset-2 ring-[#e4e987]"
                      : "bg-white border-neutral-200 hover:border-black/30"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        selectedId === project.id
                          ? "bg-neutral-800 text-[#e4e987]"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {project.category}
                    </span>
                    {selectedId === project.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#e4e987]" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1">
                    {project.title}
                  </h3>
                  <p
                    className={`text-xs line-clamp-2 ${
                      selectedId === project.id
                        ? "text-neutral-400"
                        : "text-neutral-500"
                    }`}
                  >
                    {project.tagline}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: EDITOR */}
        <div className="lg:col-span-8">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              {/* Editor Header */}
              <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <div>
                  <h2 className="font-bold text-2xl">
                    {selectedId
                      ? selectedId.startsWith("new")
                        ? "New Project"
                        : "Edit Project"
                      : "Select a Project"}
                  </h2>
                  <p className="text-sm text-neutral-500 font-mono mt-1">
                    ID: {formData.id || "..."}
                  </p>
                </div>
                {selectedId && (
                  <button
                    onClick={() => handleDelete(formData.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
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
                      <label className="text-xs font-bold uppercase text-neutral-400">
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
                              e.target.value.toLowerCase().replace(/\s+/g, "-")
                            );
                          }
                        }}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-neutral-400">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          handleFormChange("category", e.target.value)
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
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
                      <label className="text-xs font-bold uppercase text-neutral-400">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) =>
                          handleFormChange("tagline", e.target.value)
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-neutral-400">
                        Description
                      </label>
                      <textarea
                        rows={4}
                        value={formData.description}
                        onChange={(e) =>
                          handleFormChange("description", e.target.value)
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Row 3: Technical Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-neutral-50 rounded-xl border border-neutral-100">
                    {/* Tech Stack */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-400">
                        <Cpu className="w-3 h-3" /> Tech Stack (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.stack.join(", ")}
                        onChange={(e) =>
                          handleFormChange(
                            "stack",
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        className="w-full bg-white border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none font-mono text-sm"
                      />
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.stack.map(
                          (tech, i) =>
                            tech && (
                              <span
                                key={i}
                                className="text-[10px] bg-white border px-2 py-1 rounded text-neutral-500"
                              >
                                {tech}
                              </span>
                            )
                        )}
                      </div>
                    </div>

                    {/* Complexity Slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-400">
                          <Code className="w-3 h-3" /> Complexity Score
                        </label>
                        <span className="font-mono font-bold">
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
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                  </div>

                  {/* Row 4: Visuals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-400">
                        <LayoutTemplate className="w-3 h-3" /> Grid Size
                      </label>
                      <select
                        value={formData.size}
                        onChange={(e) =>
                          handleFormChange("size", e.target.value)
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                      >
                        <option value="small">Small (1x1)</option>
                        <option value="medium">Medium (2x1)</option>
                        <option value="tall">Tall (1x2)</option>
                        <option value="large">Large (2x2)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                      <label className="flex items-center gap-2 text-xs font-bold uppercase text-neutral-400">
                        <ImageIcon className="w-3 h-3" /> Image Path
                      </label>
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) =>
                          handleFormChange("image", e.target.value)
                        }
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Row 5: Metadata */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-neutral-400">
                        External Link
                      </label>
                      <input
                        type="text"
                        value={formData.link || ""}
                        onChange={(e) =>
                          handleFormChange("link", e.target.value)
                        }
                        placeholder="https://..."
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-neutral-400">
                        Highlight Stat
                      </label>
                      <input
                        type="text"
                        value={formData.stat || ""}
                        onChange={(e) =>
                          handleFormChange("stat", e.target.value)
                        }
                        placeholder="e.g. < 50ms Latency"
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 flex justify-end">
                    <button
                      type="submit"
                      className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e4e987] hover:text-black transition-all"
                    >
                      Update Inventory
                    </button>
                  </div>
                </form>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-neutral-400">
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
            className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 z-50 ${
              statusMsg.type === "success"
                ? "bg-black text-[#e4e987]"
                : "bg-red-500 text-white"
            }`}
          >
            {statusMsg.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
            {statusMsg.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
