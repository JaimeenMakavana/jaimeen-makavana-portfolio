"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import { AlertCircle, RefreshCcw, Save } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type AdminEditorHeaderProps = {
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
  title: string;
  isDirty: boolean;
  isRefreshing: boolean;
  isSyncing: boolean;
  onRefresh: () => void;
  onSync: () => void;
  syncLabel?: string;
  syncingLabel?: string;
  extraActions?: ReactNode;
};

export function AdminEditorHeader({
  icon: Icon,
  title,
  isDirty,
  isRefreshing,
  isSyncing,
  onRefresh,
  onSync,
  syncLabel = "Sync to Neon",
  syncingLabel = "Syncing...",
  extraActions,
}: AdminEditorHeaderProps) {
  return (
    <header
      className="sticky top-0 left-0 right-0 z-50 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md"
      style={{
        backgroundColor: "var(--bg-canvas)",
        opacity: 0.8,
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6" />
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <AnimatePresence>
          {isDirty ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: "var(--bg-accent-glow)",
                color: "var(--text-display)",
                opacity: 0.8,
              }}
            >
              <AlertCircle className="h-3 w-3" />
              Unsaved Changes
            </motion.div>
          ) : null}
        </AnimatePresence>

        {extraActions}

        <button
          onClick={onRefresh}
          disabled={isRefreshing || isDirty}
          className="rounded-lg p-2 transition-colors disabled:opacity-30"
          title="Reload from Neon"
          style={{ color: "var(--text-body)" }}
          onMouseEnter={(event) => {
            if (!isRefreshing && !isDirty) {
              event.currentTarget.style.backgroundColor = "var(--muted)";
            }
          }}
          onMouseLeave={(event) => {
            if (!isRefreshing && !isDirty) {
              event.currentTarget.style.backgroundColor = "transparent";
            }
          }}
        >
          <RefreshCcw
            className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
        </button>

        <button
          onClick={onSync}
          disabled={!isDirty || isSyncing}
          className="flex items-center gap-2 rounded-full px-6 py-2 font-mono text-sm uppercase tracking-wide transition-all"
          style={{
            backgroundColor: isDirty ? "var(--nav-surface)" : "var(--muted)",
            color: isDirty ? "var(--bg-accent-glow)" : "var(--text-muted)",
            cursor: isDirty ? "pointer" : "not-allowed",
          }}
          onMouseEnter={(event) => {
            if (isDirty && !isSyncing) {
              event.currentTarget.style.transform = "scale(1.05)";
            }
          }}
          onMouseLeave={(event) => {
            if (isDirty && !isSyncing) {
              event.currentTarget.style.transform = "scale(1)";
            }
          }}
        >
          {isSyncing ? (
            syncingLabel
          ) : (
            <>
              <Save className="h-4 w-4" />
              {syncLabel}
            </>
          )}
        </button>
      </div>
    </header>
  );
}
