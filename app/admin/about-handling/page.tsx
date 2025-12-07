"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  Plus,
  Trash2,
  RefreshCcw,
  History,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface CareerMilestone {
  id: string; // Added for local React key management
  era: string;
  title: string;
  description: string;
  image: string;
}

// --- SEED DATA (From your Portfolio PDF) ---
const INITIAL_MILESTONES: CareerMilestone[] = [
  {
    id: "origins",
    era: "2016-2020",
    title: "Origins",
    description:
      "LD College of Engineering. Chemical Engineering basics. The gap between aptitude and passion revealed itself here.",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80",
  },
  {
    id: "pivot",
    era: "2021",
    title: "The Pivot",
    description:
      "Long nights teaching myself Javascript, React, and Git from scratch. Rebuilding my career from zero.",
    image:
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80",
  },
  {
    id: "webapster",
    era: "2022-2023",
    title: "Webapster",
    description:
      "First professional role. Real production chaos, UI systems, and state management. Theory became practice.",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
  },
  {
    id: "present",
    era: "Present",
    title: "Key.ai",
    description:
      "Intelligent software. Machine learning, prompt engineering, and multi-agent systems. Building intelligence.",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80",
  },
];

const EMPTY_MILESTONE: CareerMilestone = {
  id: "",
  era: "2024",
  title: "New Chapter",
  description: "",
  image: "/images/placeholder.jpg",
};

export default function AboutCMS() {
  const [milestones, setMilestones] =
    useState<CareerMilestone[]>(INITIAL_MILESTONES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gistId, setGistId] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [formData, setFormData] = useState<CareerMilestone>(EMPTY_MILESTONE);

  // --- ACTIONS ---

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/about");
      const json = await res.json();

      if (json.found && Array.isArray(json.data) && json.data.length > 0) {
        // Ensure incoming data has IDs (for legacy data compatibility)
        const validatedData = json.data.map((item: any, idx: number) => ({
          ...item,
          id: item.id || `legacy-${idx}-${Date.now()}`,
        }));
        setMilestones(validatedData);
        setGistId(json.gistId);
        setIsDirty(false);
      } else {
        console.log("No remote data found, using seed data.");
        setIsDirty(true);
      }
    } catch (e) {
      console.error("Fetch error", e);
      showStatus("error", "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: milestones, gistId }),
      });
      const json = await res.json();

      if (json.success) {
        setGistId(json.gistId);
        setIsDirty(false);
        showStatus("success", "Timeline Synced Successfully");
      } else {
        throw new Error(json.error || "Save failed");
      }
    } catch (e) {
      showStatus("error", "Failed to sync with GitHub");
    } finally {
      setSaving(false);
    }
  };

  // --- CRUD OPERATIONS ---

  const handleSelect = (item: CareerMilestone) => {
    setSelectedId(item.id);
    setFormData({ ...item });
  };

  const handleCreateNew = () => {
    const newId = `milestone-${Date.now()}`;
    const newItem = { ...EMPTY_MILESTONE, id: newId };
    setMilestones([...milestones, newItem]);
    setSelectedId(newId);
    setFormData(newItem);
    setIsDirty(true);
  };

  const handleFormChange = (field: keyof CareerMilestone, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveLocal = (e: React.FormEvent) => {
    e.preventDefault();
    setMilestones((prev) =>
      prev.map((m) => (m.id === formData.id ? formData : m))
    );
    setIsDirty(true);
    showStatus("success", "Milestone updated locally");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this milestone?")) {
      setMilestones((prev) => prev.filter((m) => m.id !== id));
      if (selectedId === id) {
        setSelectedId(null);
        setFormData(EMPTY_MILESTONE);
      }
      setIsDirty(true);
    }
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= milestones.length) return;

    const newMilestones = [...milestones];
    const [movedItem] = newMilestones.splice(index, 1);
    newMilestones.splice(newIndex, 0, movedItem);

    setMilestones(newMilestones);
    setIsDirty(true);
  };

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div
      className="min-h-screen font-sans md:px-28"
      style={{
        backgroundColor: "var(--bg-canvas)",
        color: "var(--text-body)",
      }}
    >
      {/* HEADER */}
      <header
        className="sticky top-0 left-0 right-0 backdrop-blur-md border-b z-50 px-6 py-4 flex items-center justify-between"
        style={{
          backgroundColor: "var(--bg-canvas)",
          opacity: 0.8,
          borderColor: "var(--border)",
        }}
      >
        <div className="flex items-center gap-3">
          <History className="w-6 h-6" />
          <h1 className="font-bold text-xl tracking-tight">
            Career Journey CMS
          </h1>
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
            onClick={fetchData}
            disabled={loading || isDirty}
            className="p-2 rounded-lg transition-colors disabled:opacity-30"
            title="Reload from Gist"
            style={{ color: "var(--text-body)" }}
            onMouseEnter={(e) => {
              if (!loading && !isDirty) {
                e.currentTarget.style.backgroundColor = "var(--muted)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !isDirty) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <RefreshCcw
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={handleSync}
            disabled={!isDirty || saving}
            className="flex items-center gap-2 px-6 py-2 rounded-full font-mono text-sm uppercase tracking-wide transition-all"
            style={{
              backgroundColor: isDirty ? "var(--nav-surface)" : "var(--muted)",
              color: isDirty ? "var(--bg-accent-glow)" : "var(--text-muted)",
              cursor: isDirty ? "pointer" : "not-allowed",
            }}
            onMouseEnter={(e) => {
              if (isDirty && !saving) {
                e.currentTarget.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (isDirty && !saving) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
          >
            {saving ? (
              "Syncing..."
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
        {/* LEFT COLUMN: TIMELINE LIST */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Timeline ({milestones.length})
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
              <Plus className="w-3 h-3" /> Add Milestone
            </button>
          </div>

          <div
            className="relative border-l ml-4 space-y-6 pb-12"
            style={{ borderColor: "var(--border)" }}
          >
            {milestones.map((item, index) => (
              <motion.div
                key={item.id}
                layoutId={`card-${item.id}`}
                className="relative pl-8 group"
              >
                {/* Timeline Dot */}
                <div
                  className="absolute -left-[5px] top-4 w-2.5 h-2.5 rounded-full border-2 transition-colors"
                  style={{
                    backgroundColor:
                      selectedId === item.id
                        ? "var(--bg-accent-glow)"
                        : "var(--card)",
                    borderColor:
                      selectedId === item.id
                        ? "var(--text-display)"
                        : "var(--border)",
                  }}
                />

                <div
                  onClick={() => handleSelect(item)}
                  className="p-4 rounded-xl border cursor-pointer transition-all"
                  style={{
                    backgroundColor:
                      selectedId === item.id
                        ? "var(--nav-surface)"
                        : "var(--card)",
                    color:
                      selectedId === item.id
                        ? "var(--nav-text-idle)"
                        : "var(--text-body)",
                    borderColor:
                      selectedId === item.id
                        ? "var(--nav-surface)"
                        : "var(--border)",
                    boxShadow:
                      selectedId === item.id
                        ? "0 0 0 2px var(--bg-accent-glow)"
                        : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedId !== item.id) {
                      e.currentTarget.style.borderColor = "var(--text-display)";
                      e.currentTarget.style.opacity = "0.3";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedId !== item.id) {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.opacity = "1";
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor:
                          selectedId === item.id
                            ? "var(--muted)"
                            : "var(--muted)",
                        color:
                          selectedId === item.id
                            ? "var(--bg-accent-glow)"
                            : "var(--text-muted)",
                      }}
                    >
                      {item.era}
                    </span>
                    <div
                      className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        className="p-1 rounded disabled:opacity-30"
                        style={{
                          color: "var(--text-body)",
                        }}
                        onMouseEnter={(e) => {
                          if (index !== 0) {
                            e.currentTarget.style.backgroundColor =
                              "var(--muted)";
                            e.currentTarget.style.color =
                              "var(--nav-text-idle)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index !== 0) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "var(--text-body)";
                          }
                        }}
                      >
                        <MoveUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveItem(index, 1)}
                        disabled={index === milestones.length - 1}
                        className="p-1 rounded disabled:opacity-30"
                        style={{
                          color: "var(--text-body)",
                        }}
                        onMouseEnter={(e) => {
                          if (index !== milestones.length - 1) {
                            e.currentTarget.style.backgroundColor =
                              "var(--muted)";
                            e.currentTarget.style.color =
                              "var(--nav-text-idle)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index !== milestones.length - 1) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                            e.currentTarget.style.color = "var(--text-body)";
                          }
                        }}
                      >
                        <MoveDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-1">
                    {item.title}
                  </h3>
                  <p
                    className="text-xs line-clamp-2"
                    style={{
                      color:
                        selectedId === item.id
                          ? "var(--text-muted)"
                          : "var(--text-muted)",
                      opacity: selectedId === item.id ? 0.7 : 1,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: EDITOR */}
        <div className="lg:col-span-8">
          <div className="sticky top-24">
            <div
              className="rounded-2xl shadow-sm border overflow-hidden"
              style={{
                backgroundColor: "var(--card)",
                borderColor: "var(--border)",
              }}
            >
              <div
                className="px-8 py-6 border-b flex justify-between items-center"
                style={{
                  backgroundColor: "var(--muted)",
                  opacity: 0.5,
                  borderColor: "var(--border)",
                }}
              >
                <h2 className="font-bold text-2xl">
                  {selectedId ? "Edit Milestone" : "Select a Milestone"}
                </h2>
                {selectedId && (
                  <button
                    onClick={() => handleDelete(formData.id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {selectedId ? (
                <form onSubmit={saveLocal} className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Time Period */}
                    <div className="space-y-2">
                      <label
                        className="flex items-center gap-2 text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Calendar className="w-3 h-3" /> Era / Year
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.era}
                        onChange={(e) =>
                          handleFormChange("era", e.target.value)
                        }
                        placeholder="e.g. 2021-2023"
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

                    {/* Title */}
                    <div className="md:col-span-2 space-y-2">
                      <label
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Milestone Title
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          handleFormChange("title", e.target.value)
                        }
                        className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none text-lg font-bold"
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

                  {/* Description */}
                  <div className="space-y-2">
                    <label
                      className="text-xs font-bold uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      className="w-full rounded-lg px-4 py-3 focus:ring-2 focus:outline-none resize-none leading-relaxed"
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

                  {/* Image */}
                  <div className="space-y-2">
                    <label
                      className="flex items-center gap-2 text-xs font-bold uppercase"
                      style={{ color: "var(--text-muted)" }}
                    >
                      <ImageIcon className="w-3 h-3" /> Background Image URL
                    </label>
                    <div className="flex gap-4">
                      <input
                        type="text"
                        value={formData.image}
                        onChange={(e) =>
                          handleFormChange("image", e.target.value)
                        }
                        className="flex-1 rounded-lg px-4 py-3 focus:ring-2 focus:outline-none font-mono text-xs"
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
                      <div
                        className="w-12 h-12 rounded-lg overflow-hidden relative border"
                        style={{
                          backgroundColor: "var(--muted)",
                          borderColor: "var(--border)",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
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
                      Update Milestone
                    </button>
                  </div>
                </form>
              ) : (
                <div
                  className="h-96 flex flex-col items-center justify-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  <p>Select a milestone from the timeline to edit.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast */}
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
    </div>
  );
}
