import type { ReactNode } from "react";

type AdminScrollPanelProps = {
  children: ReactNode;
  className?: string;
};

export function AdminScrollPanel({
  children,
  className = "",
}: AdminScrollPanelProps) {
  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden ${className}`.trim()}
    >
      <div
        className="min-h-0 flex-1 overflow-hidden rounded-2xl border"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
