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
      className={`flex min-h-0 flex-col md:flex-1 md:overflow-hidden ${className}`.trim()}
    >
      <div
        className="min-h-0 md:flex-1 md:overflow-hidden rounded-2xl border"
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
