import type { ReactNode } from "react";

type AdminPageShellProps = {
  children: ReactNode;
  className?: string;
};

export function AdminPageShell({
  children,
  className = "",
}: AdminPageShellProps) {
  return (
    <div
      className={`font-sans ${className}`.trim()}
      style={{
        backgroundColor: "var(--bg-canvas)",
        color: "var(--text-body)",
      }}
    >
      {children}
    </div>
  );
}
